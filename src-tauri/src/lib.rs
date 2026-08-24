use chrono::Utc;
use reqwest::Client;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{fs, path::{Path, PathBuf}, sync::Mutex, time::Duration};
use tauri::{Manager, State, WebviewUrl, WebviewWindowBuilder};

struct DbState {
    connection: Mutex<Connection>,
    path: PathBuf,
}

#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("filesystem error: {0}")]
    Io(#[from] std::io::Error),
    #[error("network error: {0}")]
    Network(#[from] reqwest::Error),
    #[error("invalid data: {0}")]
    Invalid(String),
    #[error("credential store error: {0}")]
    Credential(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where S: serde::Serializer {
        serializer.serialize_str(&self.to_string())
    }
}

type AppResult<T> = Result<T, AppError>;
const DATABASE_SCHEMA_VERSION: i64 = 2;

fn apply_migrations(connection: &Connection) -> AppResult<()> {
    connection.execute_batch(include_str!("schema.sql"))?;
    let current: i64 = connection.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    if current == 0 {
        connection.execute(
            "INSERT OR IGNORE INTO schema_migrations(version, name, applied_at) VALUES(1, 'baseline', ?1)",
            [Utc::now().to_rfc3339()],
        )?;
        connection.execute_batch("PRAGMA user_version = 1;")?;
    }
    let after_baseline: i64 = connection.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    if after_baseline < 2 {
        let transaction = connection.unchecked_transaction()?;
        transaction.execute_batch(include_str!("migrations/0002_learning_state.sql"))?;
        transaction.execute(
            "INSERT OR IGNORE INTO schema_migrations(version, name, applied_at) VALUES(2, 'learning-state-and-recovery', ?1)",
            [Utc::now().to_rfc3339()],
        )?;
        transaction.execute_batch("PRAGMA user_version = 2;")?;
        transaction.commit()?;
    }
    let final_version: i64 = connection.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    if final_version != DATABASE_SCHEMA_VERSION {
        return Err(AppError::Invalid(format!(
            "unsupported database schema v{final_version}; expected v{DATABASE_SCHEMA_VERSION}"
        )));
    }
    Ok(())
}

fn init_database(path: &Path) -> AppResult<Connection> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let connection = Connection::open(path)?;
    connection.busy_timeout(Duration::from_secs(5))?;
    apply_migrations(&connection)?;
    Ok(connection)
}

fn save_state_inner(connection: &Connection, payload: &Value) -> AppResult<()> {
    let serialized = serde_json::to_string(payload)
        .map_err(|error| AppError::Invalid(error.to_string()))?;
    let transaction = connection.unchecked_transaction()?;
    transaction.execute(
        "INSERT INTO state_snapshots(payload, created_at, reason)
         SELECT payload, ?1, 'before-save' FROM app_state WHERE id = 1",
        [Utc::now().to_rfc3339()],
    )?;
    transaction.execute(
        "INSERT INTO app_state (id, payload, updated_at) VALUES (1, ?1, ?2)
         ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at",
        params![serialized, Utc::now().to_rfc3339()],
    )?;
    transaction.execute(
        "DELETE FROM state_snapshots WHERE id NOT IN (SELECT id FROM state_snapshots ORDER BY id DESC LIMIT 5)",
        [],
    )?;
    transaction.commit()?;
    Ok(())
}

fn load_state_inner(connection: &Connection) -> AppResult<Option<Value>> {
    let mut statement = connection.prepare("SELECT payload FROM app_state WHERE id = 1")?;
    let result = statement.query_row([], |row| row.get::<_, String>(0));
    match result {
        Ok(payload) => serde_json::from_str(&payload)
            .map(Some)
            .map_err(|error| AppError::Invalid(error.to_string())),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(error) => Err(error.into()),
    }
}

#[tauri::command]
fn load_state(state: State<'_, DbState>) -> AppResult<Option<Value>> {
    let connection = state.connection.lock()
        .map_err(|_| AppError::Invalid("database lock poisoned".into()))?;
    load_state_inner(&connection)
}

#[tauri::command]
fn save_state(payload: Value, state: State<'_, DbState>) -> AppResult<()> {
    let connection = state.connection.lock()
        .map_err(|_| AppError::Invalid("database lock poisoned".into()))?;
    save_state_inner(&connection, &payload)
}

#[tauri::command]
fn database_health(state: State<'_, DbState>) -> AppResult<Value> {
    let connection = state.connection.lock()
        .map_err(|_| AppError::Invalid("database lock poisoned".into()))?;
    let integrity: String = connection.query_row("PRAGMA integrity_check", [], |row| row.get(0))?;
    let schema_version: i64 = connection.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    let snapshot_count: i64 = connection.query_row("SELECT COUNT(*) FROM state_snapshots", [], |row| row.get(0))?;
    Ok(json!({
        "ok": integrity == "ok",
        "integrity": integrity,
        "path": state.path.to_string_lossy(),
        "schemaVersion": schema_version,
        "recoverySnapshots": snapshot_count,
        "journalMode": "WAL"
    }))
}

fn validate_content_state(origin: &str, status: &str) -> AppResult<()> {
    if origin == "ai_generated" && status == "verified" {
        return Err(AppError::Invalid(
            "AI-generated content cannot be saved as verified without external verification".into()
        ));
    }
    Ok(())
}

#[tauri::command]
fn upsert_entity(
    entity_type: String,
    id: String,
    payload: Value,
    content_origin: String,
    verification_status: String,
    state: State<'_, DbState>,
) -> AppResult<()> {
    validate_content_state(&content_origin, &verification_status)?;
    let serialized = serde_json::to_string(&payload)
        .map_err(|error| AppError::Invalid(error.to_string()))?;
    let now = Utc::now().to_rfc3339();
    let connection = state.connection.lock()
        .map_err(|_| AppError::Invalid("database lock poisoned".into()))?;
    connection.execute(
        "INSERT INTO entities (entity_type, id, payload, content_origin, verification_status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
         ON CONFLICT(entity_type, id) DO UPDATE SET payload=?3, content_origin=?4, verification_status=?5, updated_at=?6",
        params![entity_type, id, serialized, content_origin, verification_status, now],
    )?;
    Ok(())
}

#[tauri::command]
fn list_entities(entity_type: String, state: State<'_, DbState>) -> AppResult<Vec<Value>> {
    let connection = state.connection.lock()
        .map_err(|_| AppError::Invalid("database lock poisoned".into()))?;
    let mut statement = connection.prepare(
        "SELECT payload FROM entities WHERE entity_type = ?1 ORDER BY updated_at DESC"
    )?;
    let rows = statement.query_map([entity_type], |row| row.get::<_, String>(0))?;
    let mut values = Vec::new();
    for row in rows {
        let raw = row?;
        values.push(serde_json::from_str(&raw)
            .map_err(|error| AppError::Invalid(error.to_string()))?);
    }
    Ok(values)
}

fn credential_entry(provider_id: &str) -> AppResult<keyring::Entry> {
    keyring::Entry::new("ResearchOS", &format!("ai-provider:{provider_id}"))
        .map_err(|error| AppError::Credential(error.to_string()))
}

#[tauri::command]
fn secure_set_api_key(provider_id: String, api_key: String) -> AppResult<()> {
    credential_entry(&provider_id)?.set_password(&api_key)
        .map_err(|error| AppError::Credential(error.to_string()))
}

#[tauri::command]
fn secure_get_api_key(provider_id: String) -> AppResult<Option<String>> {
    match credential_entry(&provider_id)?.get_password() {
        Ok(value) => Ok(Some(value)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => Err(AppError::Credential(error.to_string())),
    }
}

#[tauri::command]
fn secure_delete_api_key(provider_id: String) -> AppResult<()> {
    match credential_entry(&provider_id)?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(error) => Err(AppError::Credential(error.to_string())),
    }
}

fn client() -> AppResult<Client> {
    Client::builder()
        .timeout(Duration::from_secs(20))
        .user_agent("ResearchOS/0.10.1 (local desktop research training application)")
        .build()
        .map_err(Into::into)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProviderRequest {
    base_url: String,
    api_key: Option<String>,
    model: String,
    temperature: f32,
    max_tokens: u32,
}

fn models_url(base_url: &str) -> String {
    let base = base_url.trim_end_matches('/');
    if base.ends_with("/v1") { format!("{base}/models") } else { format!("{base}/v1/models") }
}

fn chat_url(base_url: &str) -> String {
    let base = base_url.trim_end_matches('/');
    if base.ends_with("/v1") { format!("{base}/chat/completions") } else { format!("{base}/v1/chat/completions") }
}

#[tauri::command]
async fn test_ai_provider(provider: ProviderRequest) -> AppResult<Value> {
    let mut request = client()?.get(models_url(&provider.base_url));
    if let Some(key) = provider.api_key.filter(|key| !key.is_empty()) {
        request = request.bearer_auth(key);
    }
    let response = request.send().await?;
    let status = response.status();
    if !status.is_success() {
        return Err(AppError::Invalid(format!("provider returned HTTP {status}")));
    }
    Ok(json!({ "ok": true, "status": status.as_u16() }))
}

#[tauri::command]
async fn ai_review(provider: ProviderRequest, prompt: String, evidence: String) -> AppResult<String> {
    if evidence.trim().is_empty() {
        return Err(AppError::Invalid("AI review requires evidence context".into()));
    }
    let body = json!({
        "model": provider.model,
        "temperature": provider.temperature,
        "max_tokens": provider.max_tokens,
        "messages": [
            {
                "role": "system",
                "content": "You are a restrained senior biomedical reviewer. Use only supplied evidence. Never invent a DOI or PMID. Separate correct, missed, severity, why, and transfer. If evidence is insufficient, say so."
            },
            { "role": "user", "content": format!("EVIDENCE:\n{evidence}\n\nUSER ATTEMPT:\n{prompt}") }
        ]
    });
    let mut request = client()?.post(chat_url(&provider.base_url)).json(&body);
    if let Some(key) = provider.api_key.filter(|key| !key.is_empty()) {
        request = request.bearer_auth(key);
    }
    let response = request.send().await?;
    let status = response.status();
    let value: Value = response.json().await?;
    if !status.is_success() {
        return Err(AppError::Invalid(format!("provider returned HTTP {status}")));
    }
    value.pointer("/choices/0/message/content")
        .and_then(Value::as_str)
        .filter(|content| !content.trim().is_empty())
        .map(str::to_owned)
        .ok_or_else(|| AppError::Invalid("provider returned an empty review".into()))
}

#[tauri::command]
async fn verify_evidence(kind: String, identifier: String) -> AppResult<Value> {
    let identifier = identifier.trim();
    if identifier.is_empty() {
        return Err(AppError::Invalid("identifier is required".into()));
    }
    if kind.eq_ignore_ascii_case("pmid") {
        let url = format!(
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={}&retmode=json",
            urlencoding::encode(identifier)
        );
        let value: Value = client()?.get(url).send().await?.error_for_status()?.json().await?;
        let record = value.pointer(&format!("/result/{identifier}"))
            .ok_or_else(|| AppError::Invalid("PMID was not found".into()))?;
        let doi = record.get("articleids").and_then(Value::as_array)
            .and_then(|ids| ids.iter().find(|entry| entry.get("idtype") == Some(&Value::String("doi".into()))))
            .and_then(|entry| entry.get("value")).and_then(Value::as_str);
        return Ok(json!({
            "kind": "pmid",
            "identifier": identifier,
            "title": record.get("title"),
            "journal": record.get("fulljournalname"),
            "published": record.get("pubdate"),
            "authors": record.get("authors"),
            "doi": doi,
            "verificationStatus": "verified",
            "verifiedAt": Utc::now().to_rfc3339(),
            "source": "NCBI PubMed E-utilities"
        }));
    }
    if kind.eq_ignore_ascii_case("doi") {
        let url = format!("https://api.crossref.org/works/{}", urlencoding::encode(identifier));
        let value: Value = client()?.get(url).send().await?.error_for_status()?.json().await?;
        let record = value.get("message")
            .ok_or_else(|| AppError::Invalid("DOI was not found".into()))?;
        return Ok(json!({
            "kind": "doi",
            "identifier": identifier,
            "title": record.get("title").and_then(Value::as_array).and_then(|v| v.first()),
            "journal": record.get("container-title").and_then(Value::as_array).and_then(|v| v.first()),
            "published": record.get("published"),
            "authors": record.get("author"),
            "verificationStatus": "verified",
            "verifiedAt": Utc::now().to_rfc3339(),
            "source": "Crossref REST API"
        }));
    }
    Err(AppError::Invalid("kind must be 'pmid' or 'doi'".into()))
}

#[tauri::command]
fn export_backup(destination: String, state: State<'_, DbState>) -> AppResult<String> {
    let destination = PathBuf::from(destination);
    if destination.as_os_str().is_empty() {
        return Err(AppError::Invalid("backup destination is required".into()));
    }
    let connection = state.connection.lock()
        .map_err(|_| AppError::Invalid("database lock poisoned".into()))?;
    export_backup_inner(&connection, &state.path, &destination)?;
    Ok(destination.to_string_lossy().into_owned())
}

fn export_backup_inner(connection: &Connection, source: &Path, destination: &Path) -> AppResult<()> {
    connection.execute_batch("PRAGMA wal_checkpoint(FULL);")?;
    fs::copy(source, destination)?;
    Ok(())
}

#[tauri::command]
fn import_backup(source: String, state: State<'_, DbState>) -> AppResult<()> {
    let source = PathBuf::from(source);
    if !source.is_file() {
        return Err(AppError::Invalid("backup file does not exist".into()));
    }
    let connection = state.connection.lock()
        .map_err(|_| AppError::Invalid("database lock poisoned".into()))?;
    import_backup_inner(&source, &connection)
}

fn import_backup_inner(source: &Path, destination: &Connection) -> AppResult<()> {
    let backup = Connection::open_with_flags(&source, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)?;
    let integrity: String = backup.query_row("PRAGMA integrity_check", [], |row| row.get(0))?;
    if integrity != "ok" {
        return Err(AppError::Invalid(format!("backup integrity check failed: {integrity}")));
    }
    let payload = load_state_inner(&backup)?
        .ok_or_else(|| AppError::Invalid("backup does not contain ResearchOS state".into()))?;
    save_state_inner(destination, &payload)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = match std::env::var_os("RESEARCHOS_DATA_DIR") {
                Some(path) => PathBuf::from(path),
                None => app.path().app_data_dir()?,
            };
            #[cfg(debug_assertions)]
            eprintln!("ResearchOS data directory: {}", data_dir.display());
            let database_path = data_dir.join("researchos.sqlite3");
            let connection = init_database(&database_path)
                .map_err(|error| -> Box<dyn std::error::Error> { Box::new(error) })?;
            app.manage(DbState { connection: Mutex::new(connection), path: database_path });
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("ResearchOS")
                .inner_size(1440.0, 920.0)
                .min_inner_size(1080.0, 700.0)
                .resizable(true)
                .center()
                .data_directory(data_dir.join("webview"))
                .build()?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_state,
            save_state,
            database_health,
            upsert_entity,
            list_entities,
            secure_set_api_key,
            secure_get_api_key,
            secure_delete_api_key,
            test_ai_provider,
            ai_review,
            verify_evidence,
            export_backup,
            import_backup
        ])
        .run(tauri::generate_context!())
        .expect("error while running ResearchOS");
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn state_round_trip_uses_sqlite() {
        let directory = tempdir().unwrap();
        let path = directory.path().join("test.sqlite3");
        let connection = init_database(&path).unwrap();
        let payload = json!({"projects": [{"id": "project-1"}], "version": 1});
        save_state_inner(&connection, &payload).unwrap();
        assert_eq!(load_state_inner(&connection).unwrap(), Some(payload));
        let schema_version: i64 = connection.query_row("PRAGMA user_version", [], |row| row.get(0)).unwrap();
        assert_eq!(schema_version, DATABASE_SCHEMA_VERSION);
    }

    #[test]
    fn ai_generated_content_cannot_self_verify() {
        let error = validate_content_state("ai_generated", "verified").unwrap_err();
        assert!(error.to_string().contains("cannot be saved as verified"));
        assert!(validate_content_state("verified_external", "verified").is_ok());
    }

    #[test]
    fn schema_supports_entity_crud() {
        let directory = tempdir().unwrap();
        let connection = init_database(&directory.path().join("crud.sqlite3")).unwrap();
        let now = Utc::now().to_rfc3339();
        connection.execute(
            "INSERT INTO entities(entity_type,id,payload,content_origin,verification_status,created_at,updated_at)
             VALUES('project','p1','{\"name\":\"Trial\"}','user','not_required',?1,?1)",
            [now],
        ).unwrap();
        let name: String = connection.query_row(
            "SELECT json_extract(payload, '$.name') FROM entities WHERE id='p1'",
            [], |row| row.get(0)
        ).unwrap();
        assert_eq!(name, "Trial");
    }

    #[test]
    fn provider_configuration_builds_openai_compatible_urls() {
        assert_eq!(models_url("https://provider.example/v1/"), "https://provider.example/v1/models");
        assert_eq!(chat_url("https://provider.example"), "https://provider.example/v1/chat/completions");
    }

    #[test]
    fn sqlite_backup_exports_and_restores_state() {
        let directory = tempdir().unwrap();
        let source_path = directory.path().join("source.sqlite3");
        let backup_path = directory.path().join("backup.sqlite3");
        let restored_path = directory.path().join("restored.sqlite3");
        let source = init_database(&source_path).unwrap();
        let expected = json!({"projects": [{"id": "project-backup"}], "version": 1});
        save_state_inner(&source, &expected).unwrap();
        export_backup_inner(&source, &source_path, &backup_path).unwrap();

        let restored = init_database(&restored_path).unwrap();
        save_state_inner(&restored, &json!({"projects": []})).unwrap();
        import_backup_inner(&backup_path, &restored).unwrap();
        assert_eq!(load_state_inner(&restored).unwrap(), Some(expected));
    }

    #[test]
    fn repeated_saves_keep_bounded_recovery_snapshots() {
        let directory = tempdir().unwrap();
        let connection = init_database(&directory.path().join("snapshots.sqlite3")).unwrap();
        for version in 0..9 {
            save_state_inner(&connection, &json!({"version": version})).unwrap();
        }
        let snapshots: i64 = connection.query_row("SELECT COUNT(*) FROM state_snapshots", [], |row| row.get(0)).unwrap();
        assert_eq!(snapshots, 5);
        assert_eq!(load_state_inner(&connection).unwrap(), Some(json!({"version": 8})));
    }

    #[test]
    fn legacy_database_migrates_transactionally_to_v2() {
        let directory = tempdir().unwrap();
        let path = directory.path().join("legacy.sqlite3");
        let connection = Connection::open(&path).unwrap();
        connection.execute_batch(
            "CREATE TABLE app_state (id INTEGER PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
             INSERT INTO app_state(id, payload, updated_at) VALUES(1, '{\"schemaVersion\":1,\"projects\":[{\"id\":\"legacy\"}]}', '2026-01-01');"
        ).unwrap();
        drop(connection);
        let migrated = init_database(&path).unwrap();
        let version: i64 = migrated.query_row("PRAGMA user_version", [], |row| row.get(0)).unwrap();
        let misconception_table: String = migrated.query_row(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='misconceptions'", [], |row| row.get(0)
        ).unwrap();
        assert_eq!(version, 2);
        assert_eq!(misconception_table, "misconceptions");
        assert_eq!(load_state_inner(&migrated).unwrap().unwrap()["projects"][0]["id"], "legacy");
    }
}
