use chrono::Utc;
use reqwest::Client;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{fs, io::Write, path::{Path, PathBuf}, sync::Mutex, time::Duration};
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
        .user_agent("ResearchOS/0.12.0 (local desktop research training application)")
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

// ---------------------------------------------------------------------------
// Safe filesystem gateway (M015)
//
// Every explicit export or curated Obsidian write goes through this gateway.
// It validates the relative path purely, proves resolved containment against
// the canonical base directory (which also defeats symlink/junction escapes),
// and replaces files atomically through a temporary file in the same parent.
// ---------------------------------------------------------------------------

const MAX_RELATIVE_PATH_LEN: usize = 200;
const MAX_RELATIVE_PATH_DEPTH: usize = 8;

fn validate_relative_path(relative: &str) -> AppResult<String> {
    let invalid = |reason: &str| AppError::Invalid(format!("unsafe relative path {relative:?}: {reason}"));
    if relative.trim().is_empty() {
        return Err(invalid("path is empty"));
    }
    if relative.len() > MAX_RELATIVE_PATH_LEN {
        return Err(invalid("path exceeds 200 bytes"));
    }
    if relative.chars().any(|ch| ch.is_control()) {
        return Err(invalid("control character"));
    }
    let normalized = relative.replace('\\', "/");
    if normalized.starts_with('/') || normalized.starts_with("//") {
        return Err(invalid("absolute or UNC path"));
    }
    let bytes = normalized.as_bytes();
    if bytes.len() >= 2 && bytes[1] == b':' {
        return Err(invalid("drive-qualified path"));
    }
    let segments: Vec<&str> = normalized.split('/').collect();
    if segments.len() > MAX_RELATIVE_PATH_DEPTH {
        return Err(invalid("depth exceeds 8 segments"));
    }
    for segment in &segments {
        if segment.is_empty() || *segment == "." || *segment == ".." {
            return Err(invalid("empty or traversal segment"));
        }
        if segment.eq_ignore_ascii_case(".obsidian") {
            return Err(invalid(".obsidian is protected"));
        }
        if segment.ends_with('.') || segment.ends_with(' ') {
            return Err(invalid("segment ends with dot or space"));
        }
        let stem = segment.split('.').next().unwrap_or("");
        if matches!(stem.to_ascii_lowercase().as_str(), "con" | "prn" | "aux" | "nul" | "com1" | "com2" | "com3" | "com4" | "lpt1" | "lpt2" | "lpt3") {
            return Err(invalid("reserved Windows device name"));
        }
    }
    Ok(normalized)
}

/// Resolves `relative` under `base`, creating parent directories, and proves
/// that the fully resolved parent stays inside the canonicalized base.
fn contained_target(base: &Path, relative: &str) -> AppResult<PathBuf> {
    let normalized = validate_relative_path(relative)?;
    let candidate = base.join(&normalized);
    let parent = candidate.parent().ok_or_else(|| AppError::Invalid("path has no parent".into()))?;
    fs::create_dir_all(parent)?;
    let base_canonical = fs::canonicalize(base)?;
    let parent_canonical = fs::canonicalize(parent)?;
    if !parent_canonical.starts_with(&base_canonical) {
        return Err(AppError::Invalid(format!(
            "resolved path escapes the allowed directory: {relative}"
        )));
    }
    Ok(candidate)
}

#[derive(Debug)]
enum WriteOutcome {
    Written,
    Unchanged,
}

/// Atomic replacement: write a sibling temporary file, rotate the previous
/// content through a backup name, then rename into place. On any failure the
/// previous file is restored. Byte-identical targets are left untouched.
fn atomic_write(target: &Path, contents: &str) -> AppResult<WriteOutcome> {
    let file_name = target
        .file_name()
        .ok_or_else(|| AppError::Invalid("target has no file name".into()))?
        .to_string_lossy()
        .into_owned();
    if target.is_file() && fs::read_to_string(target)? == contents {
        return Ok(WriteOutcome::Unchanged);
    }
    let parent = target.parent().ok_or_else(|| AppError::Invalid("target has no parent".into()))?;
    let tmp = parent.join(format!(".{file_name}.researchos-tmp"));
    let backup = parent.join(format!(".{file_name}.researchos-bak"));
    let staged = (|| -> AppResult<()> {
        let mut handle = fs::File::create(&tmp)?;
        handle.write_all(contents.as_bytes())?;
        handle.sync_all()?;
        Ok(())
    })();
    if let Err(error) = staged {
        let _ = fs::remove_file(&tmp);
        return Err(error);
    }
    let had_previous = target.is_file();
    if had_previous {
        fs::rename(target, &backup)?;
    }
    match fs::rename(&tmp, target) {
        Ok(()) => {
            if backup.exists() {
                let _ = fs::remove_file(&backup);
            }
            Ok(WriteOutcome::Written)
        }
        Err(error) => {
            if backup.exists() {
                let _ = fs::rename(&backup, target);
            }
            let _ = fs::remove_file(&tmp);
            Err(error.into())
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExportFileRequest {
    relative_path: String,
    contents: String,
}

fn export_files_inner(destination_dir: &Path, files: &[ExportFileRequest]) -> AppResult<Vec<String>> {
    // Phase 1: pure validation of every path before touching the filesystem.
    let validated: Vec<(String, String)> = files
        .iter()
        .map(|file| Ok((validate_relative_path(&file.relative_path)?, file.contents.clone())))
        .collect::<AppResult<_>>()?;
    // Phase 2: containment proof for every target.
    fs::create_dir_all(destination_dir)?;
    let mut targets = Vec::with_capacity(validated.len());
    for (relative, contents) in &validated {
        let target = contained_target(destination_dir, relative)?;
        targets.push((relative.clone(), target, contents.clone()));
    }
    // Phase 3: atomic writes; byte-identical files are skipped.
    let mut written = Vec::new();
    for (relative, target, contents) in targets {
        match atomic_write(&target, &contents)? {
            WriteOutcome::Written => written.push(relative),
            WriteOutcome::Unchanged => {}
        }
    }
    Ok(written)
}

#[tauri::command]
fn export_review_pack(destination_dir: String, files: Vec<ExportFileRequest>) -> AppResult<Vec<String>> {
    let destination = PathBuf::from(&destination_dir);
    if destination.as_os_str().is_empty() {
        return Err(AppError::Invalid("destination directory is required".into()));
    }
    export_files_inner(&destination, &files)
}

// ---------------------------------------------------------------------------
// Curated Obsidian publishing gateway (M015-04)
//
// The vault scope is exactly one user-chosen root plus one dedicated
// subfolder. Connection validation and listing are strictly read-only;
// nothing outside the resolved subfolder is ever touched, and `.obsidian`
// is rejected everywhere.
// ---------------------------------------------------------------------------

const MAX_LISTED_NOTES: usize = 500;

fn validate_subfolder(subfolder: &str) -> AppResult<String> {
    let normalized = validate_relative_path(subfolder)?;
    if normalized.split('/').count() > 2 {
        return Err(AppError::Invalid("the dedicated subfolder may be at most two levels deep".into()));
    }
    Ok(normalized)
}

/// Resolves the dedicated directory without creating anything.
/// Every existing component is checked for symlink/junction escapes and
/// proven (via canonicalization) to stay inside the canonical vault root.
fn resolve_dedicated_dir(vault_root: &Path, subfolder: &str) -> AppResult<PathBuf> {
    if !vault_root.is_dir() {
        return Err(AppError::Invalid("vault root is not an existing directory".into()));
    }
    let normalized = validate_subfolder(subfolder)?;
    let vault_canonical = fs::canonicalize(vault_root)?;
    let mut probe = vault_root.to_path_buf();
    for segment in normalized.split('/') {
        probe.push(segment);
        match fs::symlink_metadata(&probe) {
            Ok(metadata) => {
                if metadata.file_type().is_symlink() {
                    return Err(AppError::Invalid(format!("subfolder component is a symlink or junction: {segment}")));
                }
                if !metadata.is_dir() {
                    return Err(AppError::Invalid(format!("subfolder component is not a directory: {segment}")));
                }
                let canonical = fs::canonicalize(&probe)?;
                if !canonical.starts_with(&vault_canonical) {
                    return Err(AppError::Invalid(format!("resolved subfolder escapes the vault root: {segment}")));
                }
            }
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => break,
            Err(error) => return Err(AppError::Io(error)),
        }
    }
    Ok(vault_root.join(normalized))
}

fn has_combining_marks(text: &str) -> bool {
    text.chars().any(|ch| ('\u{0300}'..='\u{036F}').contains(&ch))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ConfirmedWriteRequest {
    relative_path: String,
    contents: String,
    /// Exact bytes that must currently exist (`None` = file must not exist).
    expected_existing: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ObsidianFileEntry {
    relative_path: String,
    contents: Option<String>,
}

fn collect_markdown_files(dir: &Path, prefix: &str, out: &mut Vec<String>) -> AppResult<()> {
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        // DirEntry::file_type does not follow links: symlinks/junctions are
        // skipped entirely so a linked directory can never be traversed.
        let file_type = entry.file_type()?;
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.starts_with('.') || file_type.is_symlink() {
            continue;
        }
        let relative = if prefix.is_empty() { name.clone() } else { format!("{prefix}/{name}") };
        if file_type.is_dir() {
            collect_markdown_files(&entry.path(), &relative, out)?;
        } else if name.to_lowercase().ends_with(".md") && !has_combining_marks(&name) {
            if out.len() >= MAX_LISTED_NOTES {
                return Err(AppError::Invalid(format!(
                    "listing overflow: more than {MAX_LISTED_NOTES} markdown notes in the dedicated subfolder; refusing a partial scan"
                )));
            }
            out.push(relative);
        }
    }
    Ok(())
}

#[tauri::command]
fn validate_obsidian_target(vault_root: String, subfolder: String) -> AppResult<Value> {
    let root = PathBuf::from(&vault_root);
    let dedicated = resolve_dedicated_dir(&root, &subfolder)?;
    // Strictly read-only: no directories are created here.
    Ok(json!({
        "resolvedDir": dedicated.to_string_lossy(),
        "existed": dedicated.is_dir(),
        "readOnly": true
    }))
}

#[tauri::command]
fn list_markdown_files(vault_root: String, subfolder: String) -> AppResult<Vec<String>> {
    let root = PathBuf::from(&vault_root);
    let dedicated = resolve_dedicated_dir(&root, &subfolder)?;
    let mut files = Vec::new();
    if dedicated.is_dir() {
        collect_markdown_files(&dedicated, "", &mut files)?;
    }
    files.sort();
    Ok(files)
}

#[derive(Debug)]
struct StagedWrite {
    relative: String,
    tmp: PathBuf,
    target: PathBuf,
    backup: PathBuf,
    had_previous: bool,
}

#[tauri::command]
fn read_text_files(vault_root: String, subfolder: String, paths: Vec<String>) -> AppResult<Vec<ObsidianFileEntry>> {
    let root = PathBuf::from(&vault_root);
    let dedicated = resolve_dedicated_dir(&root, &subfolder)?;
    if !dedicated.is_dir() {
        return Err(AppError::Invalid("the dedicated subfolder does not exist".into()));
    }
    let dedicated_canonical = fs::canonicalize(&dedicated)?;
    let validated: Vec<String> = paths.iter().map(|path| validate_relative_path(path)).collect::<AppResult<_>>()?;
    let mut entries = Vec::with_capacity(validated.len());
    for relative in validated {
        match safe_existing_target(&dedicated_canonical, &dedicated, &relative)? {
            None => entries.push(ObsidianFileEntry { relative_path: relative, contents: None }),
            Some(target) => entries.push(ObsidianFileEntry { relative_path: relative, contents: Some(fs::read_to_string(target)?) }),
        }
    }
    Ok(entries)
}

/// Resolves a relative path beneath `base_lexical` without following ANY
/// symlink/junction/reparse point on the way. Returns `Ok(None)` when the
/// target (or an intermediate component) simply does not exist. Any link
/// encountered below the base is a hard error, and metadata errors other than
/// `NotFound` fail closed.
fn safe_existing_target(base_canonical: &Path, base_lexical: &Path, relative: &str) -> AppResult<Option<PathBuf>> {
    let normalized = validate_relative_path(relative)?;
    let mut probe = base_lexical.to_path_buf();
    for segment in normalized.split('/') {
        probe.push(segment);
        match fs::symlink_metadata(&probe) {
            Ok(metadata) => {
                if metadata.file_type().is_symlink() {
                    return Err(AppError::Invalid(format!("refusing to follow a link inside the dedicated folder: {relative}")));
                }
            }
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(error) => return Err(AppError::Io(error)),
        }
    }
    let parent = probe.parent().ok_or_else(|| AppError::Invalid("path has no parent".into()))?;
    match fs::symlink_metadata(parent) {
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(AppError::Io(error)),
        Ok(_) => {}
    }
    let parent_canonical = fs::canonicalize(parent)?;
    if !parent_canonical.starts_with(base_canonical) {
        return Err(AppError::Invalid(format!("resolved path escapes the allowed directory: {relative}")));
    }
    let final_metadata = fs::symlink_metadata(&probe)?;
    if final_metadata.is_dir() {
        return Err(AppError::Invalid(format!("read target is a directory: {relative}")));
    }
    Ok(Some(probe))
}

/// Prepares a confirmed-write target WITHOUT creating anything through links:
/// 1. every existing component below the dedicated root is verified no-follow
///    (`NotFound` is the only tolerated error);
/// 2. missing parent levels are created ONE level at a time under proven
///    parents, and each newly created directory is immediately re-verified
///    (no reparse point, real directory, canonical containment);
/// 3. the resolved parent must stay inside the canonical dedicated root;
/// 4. a final component that is a link or directory is refused.
fn prepared_write_target(dedicated: &Path, dedicated_canonical: &Path, relative: &str, created_dirs: &mut Vec<PathBuf>) -> AppResult<PathBuf> {
    let normalized = validate_relative_path(relative)?;
    let candidate = dedicated.join(&normalized);
    let segments: Vec<&str> = normalized.split('/').collect();
    // Phase A: verify existing components top-down; stop at the first missing one.
    let mut probe = dedicated.to_path_buf();
    let mut first_missing: Option<usize> = None;
    for (index, segment) in segments.iter().enumerate() {
        probe.push(segment);
        match fs::symlink_metadata(&probe) {
            Ok(metadata) => {
                if metadata.file_type().is_symlink() {
                    return Err(AppError::Invalid(format!("refusing to follow a link inside the dedicated folder: {relative}")));
                }
                if !metadata.is_dir() && index + 1 < segments.len() {
                    return Err(AppError::Invalid(format!("parent component is not a directory: {relative}")));
                }
            }
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                first_missing.get_or_insert(index);
                break;
            }
            Err(error) => return Err(AppError::Io(error)),
        }
    }
    // Phase B: create ONLY the missing parent levels, one by one, tracking
    // every directory created by this transaction so a later failure can
    // remove still-empty ones in reverse order (failure = zero writes).
    if first_missing.is_some() {
        let parents_only = segments.len().saturating_sub(1);
        let mut walk = dedicated.to_path_buf();
        for segment in segments.iter().take(parents_only) {
            walk.push(segment);
            match fs::symlink_metadata(&walk) {
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                    fs::create_dir(&walk)?;
                    let created = fs::symlink_metadata(&walk)?;
                    if created.file_type().is_symlink() || !created.is_dir() {
                        return Err(AppError::Invalid(format!("newly created parent is not a plain directory: {}", walk.display())));
                    }
                    let created_canonical = fs::canonicalize(&walk)?;
                    if !created_canonical.starts_with(dedicated_canonical) {
                        return Err(AppError::Invalid(format!("newly created parent escapes the dedicated folder: {}", walk.display())));
                    }
                    created_dirs.push(walk.clone());
                }
                Err(error) => return Err(AppError::Io(error)),
                Ok(metadata) => {
                    if metadata.file_type().is_symlink() || !metadata.is_dir() {
                        return Err(AppError::Invalid(format!("refusing to create inside a non-directory component: {}", walk.display())));
                    }
                }
            }
        }
    }
    // Phase C: containment proof of the (existing) parent plus final checks.
    let parent = candidate.parent().ok_or_else(|| AppError::Invalid("path has no parent".into()))?.to_path_buf();
    let parent_canonical = fs::canonicalize(&parent)?;
    if !parent_canonical.starts_with(dedicated_canonical) {
        return Err(AppError::Invalid(format!("resolved path escapes the allowed directory: {relative}")));
    }
    match fs::symlink_metadata(&candidate) {
        Ok(metadata) if metadata.file_type().is_symlink() => {
            return Err(AppError::Invalid(format!("write target is a link: {relative}")));
        }
        Ok(metadata) if metadata.is_dir() => {
            return Err(AppError::Invalid(format!("write target exists as a directory: {relative}")));
        }
        Ok(_) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => return Err(AppError::Io(error)),
    }
    Ok(candidate)
}

/// Reserves a unique, verified-nonexistent sibling name for temporary/backup
/// files so fixed names can never truncate or clobber existing hidden files.
fn reserved_sibling(target: &Path, kind: &str, salt: u128, attempt_base: usize) -> AppResult<PathBuf> {
    let file_name = target.file_name().map(|name| name.to_string_lossy().into_owned()).unwrap_or_default();
    let truncated: String = file_name.chars().take(80).collect();
    for attempt in 0..64u32 {
        let candidate = target.with_file_name(format!(
            ".{}.researchos-{}-{}-{}-{}",
            truncated,
            kind,
            std::process::id(),
            salt.wrapping_add(attempt_base as u128 + attempt as u128),
            attempt
        ));
        if fs::symlink_metadata(&candidate).is_err() {
            return Ok(candidate);
        }
    }
    Err(AppError::Invalid("could not reserve a unique sidecar name".into()))
}

/// Detects a case-insensitive filename collision between two different raw names.
fn assert_no_case_collisions(existing_names: &[String], incoming: &[String]) -> AppResult<()> {
    let mut seen: std::collections::BTreeMap<String, String> = std::collections::BTreeMap::new();
    for name in existing_names.iter().chain(incoming.iter()) {
        if has_combining_marks(name) {
            return Err(AppError::Invalid(format!("filename uses decomposed Unicode; use precomposed NFC names: {name}")));
        }
        let key = name.to_lowercase();
        if let Some(previous) = seen.get(&key) {
            if previous != name {
                return Err(AppError::Invalid(format!(
                    "case-insensitive filename collision: {previous:?} vs {name:?}"
                )));
            }
        } else {
            seen.insert(key, name.clone());
        }
    }
    Ok(())
}

#[tauri::command]
fn write_confirmed_files(vault_root: String, subfolder: String, files: Vec<ConfirmedWriteRequest>) -> AppResult<Vec<String>> {
    write_confirmed_files_inner(&vault_root, &subfolder, files, None)
}

/// Deterministic fault-injection points for transaction tests. `InstallFailure`
/// fires AFTER the item's backup rotation (install never happens);
/// `AfterRotation` is the same point expressed for single-item batches.
#[derive(Debug, Clone, Copy)]
enum CommitFaultStage {
    InstallFailure,
}

/// Per-item commit state machine. Rollback MUST consider every state beyond
/// `Staged`, including the currently half-processed item.
#[derive(Debug, Clone, Copy, PartialEq)]
enum ItemCommitState {
    Staged,
    BackupRotated,
    Installed,
}

fn rollback_transaction(states: &[ItemCommitState], staged: &[StagedWrite]) -> Result<(), String> {
    let mut evidence: Vec<String> = Vec::new();
    // Reverse order, INCLUDING the partially processed current item.
    for index in (0..staged.len()).rev() {
        match states[index] {
            ItemCommitState::Installed => {
                let item = &staged[index];
                if item.target.exists() {
                    if let Err(error) = fs::remove_file(&item.target) {
                        evidence.push(format!("could not remove new content {}: {error}", item.target.display()));
                        continue;
                    }
                }
                if item.had_previous {
                    if let Err(error) = fs::rename(&item.backup, &item.target) {
                        evidence.push(format!("could not restore previous content {} from {}: {error}", item.target.display(), item.backup.display()));
                    }
                }
            }
            ItemCommitState::BackupRotated => {
                // The old content currently lives ONLY in the backup file.
                // It must be restored even though this item was never installed
                // and is absent from any "committed" list.
                let item = &staged[index];
                if item.had_previous && !item.target.exists() {
                    if let Err(error) = fs::rename(&item.backup, &item.target) {
                        evidence.push(format!("could not restore rotated backup {}: {error}", item.backup.display()));
                    }
                }
            }
            ItemCommitState::Staged => {}
        }
    }
    for item in staged.iter() {
        let _ = fs::remove_file(&item.tmp);
    }
    if evidence.is_empty() {
        for item in staged.iter() {
            let _ = fs::remove_file(&item.backup);
        }
        Ok(())
    } else {
        // Never delete backups when restoration failed anywhere: they are the
        // only recoverable evidence of the original content.
        Err(format!(
            "ROLLBACK INCOMPLETE; recoverable evidence preserved as .researchos-bak siblings: {}",
            evidence.join("; ")
        ))
    }
}

fn purge_created_dirs(created_dirs: &[PathBuf]) {
    for dir in created_dirs.iter().rev() {
        // Fails silently when the directory is not empty (or already gone).
        let _ = fs::remove_dir(dir);
    }
}

/// Production entry is `write_confirmed_files`; `fault` exists exclusively for
/// deterministic fault-injection tests of the rollback path.
fn write_confirmed_files_inner(
    vault_root: &str,
    subfolder: &str,
    files: Vec<ConfirmedWriteRequest>,
    fault: Option<(usize, CommitFaultStage)>,
) -> AppResult<Vec<String>> {
    // Phase 1: pure validation of every path before touching the filesystem,
    // including duplicate / case-equivalent path rejection inside one batch.
    let validated: Vec<(String, String, Option<String>)> = files
        .iter()
        .map(|file| Ok((validate_relative_path(&file.relative_path)?, file.contents.clone(), file.expected_existing.clone())))
        .collect::<AppResult<_>>()?;
    let mut seen_paths: std::collections::BTreeMap<String, String> = std::collections::BTreeMap::new();
    for (relative, _, _) in &validated {
        let key = relative.to_lowercase();
        if seen_paths.contains_key(&key) {
            return Err(AppError::Invalid(format!("duplicate or case/Unicode-equivalent target path in one batch: {relative}")));
        }
        seen_paths.insert(key, relative.clone());
    }
    let root = PathBuf::from(vault_root);
    let dedicated = resolve_dedicated_dir(&root, subfolder)?;
    // Creating the dedicated folder itself is part of the explicit confirmed
    // transaction only. Every missing level (the allowed subfolder is at most
    // two levels deep) is created individually and registered, so a failure
    // can reclaim the ENTIRE created tree, not just its deepest level.
    let mut created_dirs: Vec<PathBuf> = Vec::new();
    if !dedicated.is_dir() {
        let mut walk = root.clone();
        for segment in subfolder.split('/') {
            walk.push(segment);
            match fs::symlink_metadata(&walk) {
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                    fs::create_dir(&walk)?;
                    created_dirs.push(walk.clone());
                }
                Err(error) => return Err(AppError::Io(error)),
                Ok(metadata) => {
                    if metadata.file_type().is_symlink() || !metadata.is_dir() {
                        return Err(AppError::Invalid(format!("dedicated component is not a plain directory: {}", walk.display())));
                    }
                }
            }
        }
    }
    let dedicated_canonical = fs::canonicalize(&dedicated)?;
    let finish_failure = |message: String, states: &[ItemCommitState], staged: &[StagedWrite], created_dirs: &[PathBuf]| -> AppError {
        match rollback_transaction(states, staged) {
            Ok(()) => {
                purge_created_dirs(created_dirs);
                AppError::Invalid(format!("{message}; the whole batch was rolled back and no partial content remains"))
            }
            Err(evidence) => {
                // Keep every created directory and backup file as recoverable evidence.
                AppError::Invalid(format!("{message}; {evidence}"))
            }
        }
    };
    // Phase 2a: link-safe containment proof for every target (creates parents safely).
    let mut targets = Vec::with_capacity(validated.len());
    for (relative, contents, expected) in &validated {
        match prepared_write_target(&dedicated, &dedicated_canonical, relative, &mut created_dirs) {
            Ok(target) => targets.push((relative.clone(), target, contents.clone(), expected.clone())),
            Err(error) => {
                purge_created_dirs(&created_dirs);
                return Err(error);
            }
        }
    }
    // Phase 2b: case/Unicode collision detection inside each affected directory.
    let mut by_parent: std::collections::BTreeMap<PathBuf, Vec<String>> = std::collections::BTreeMap::new();
    for (_, target, _, _) in &targets {
        let parent = target.parent().ok_or_else(|| AppError::Invalid("path has no parent".into()))?.to_path_buf();
        let name = target.file_name().map(|name| name.to_string_lossy().into_owned()).unwrap_or_default();
        by_parent.entry(parent).or_default().push(name);
    }
    for (parent, incoming_names) in &by_parent {
        if let Err(error) = assert_no_case_collisions(incoming_names, incoming_names)
            .and_then(|_| {
                if parent.is_dir() {
                    let mut existing_names = Vec::new();
                    for entry in fs::read_dir(parent)? {
                        let entry = entry?;
                        let name = entry.file_name().to_string_lossy().into_owned();
                        if !name.starts_with('.') {
                            existing_names.push(name);
                        }
                    }
                    assert_no_case_collisions(&existing_names, incoming_names)
                } else {
                    Ok(())
                }
            })
        {
            purge_created_dirs(&created_dirs);
            return Err(error);
        }
    }
    // Phase 2c: verify every expected precondition before staging anything.
    for (_, target, _, expected) in &targets {
        let current = if target.is_file() { Some(fs::read_to_string(target)?) } else { None };
        let exists_as_file = target.is_file();
        let matches = match (&current, expected) {
            (Some(actual), Some(expected_bytes)) => actual == expected_bytes,
            (None, None) => !exists_as_file,
            _ => false,
        };
        if !matches {
            purge_created_dirs(&created_dirs);
            return Err(AppError::Invalid(format!(
                "file changed since preview; the whole batch was written nowhere: {}",
                target.display()
            )));
        }
    }
    // Phase 3: stage temporary files. Each sidecar is ATOMICALLY claimed with
    // create_new(true) (no check-then-create TOCTOU window), and each item is
    // registered BEFORE its bytes are written so a write/sync failure still
    // cleans up the current temp along with all earlier ones.
    let mut staged: Vec<StagedWrite> = Vec::with_capacity(targets.len());
    let staging_result: AppResult<()> = (|| {
        for (index, (relative, target, contents, _)) in targets.iter().enumerate() {
            if target.is_file() && fs::read_to_string(target)? == *contents {
                continue; // byte-identical: nothing to write
            }
            let salt_base = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|duration| duration.as_nanos())
                .unwrap_or(0)
                .wrapping_add(index as u128 * 7_919);
            let file_stem = target.file_name().map(|name| name.to_string_lossy().into_owned()).unwrap_or_default();
            let truncated_stem: String = file_stem.chars().take(80).collect();
            let pid = std::process::id();
            let mut tmp_path: Option<PathBuf> = None;
            let mut handle = None;
            for attempt in 0..64u32 {
                let candidate = target.with_file_name(format!(
                    ".{}.researchos-tmp-{}-{}-{}",
                    truncated_stem,
                    pid,
                    salt_base.wrapping_add(attempt as u128),
                    attempt
                ));
                match std::fs::OpenOptions::new().write(true).create_new(true).open(&candidate) {
                    Ok(file) => {
                        tmp_path = Some(candidate);
                        handle = Some(file);
                        break;
                    }
                    Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => continue,
                    Err(error) => return Err(AppError::Io(error)),
                }
            }
            let tmp = match (tmp_path, handle) {
                (Some(path), Some(file)) => (path, file),
                _ => return Err(AppError::Invalid("could not claim a unique temp file".into())),
            };
            let backup = reserved_sibling(target, "bak", salt_base, index + 1_000)?;
            // Register FIRST so any later failure removes this temp too.
            staged.push(StagedWrite {
                relative: relative.clone(),
                tmp: tmp.0,
                backup,
                had_previous: target.is_file(),
                target: target.clone(),
            });
            let write_result: AppResult<()> = (|| {
                let mut file = tmp.1;
                file.write_all(contents.as_bytes())?;
                file.sync_all()?;
                Ok(())
            })();
            write_result?;
        }
        Ok(())
    })();
    if let Err(error) = staging_result {
        for item in &staged {
            let _ = fs::remove_file(&item.tmp);
        }
        purge_created_dirs(&created_dirs);
        return Err(AppError::Invalid(format!(
            "staging failed before any commit; no file was written, temporary files removed ({error})"
        )));
    }
    // Phase 4: explicit per-item state machine commit.
    let mut states = vec![ItemCommitState::Staged; staged.len()];
    let mut written = Vec::new();
    for (index, item) in staged.iter().enumerate() {
        let injected_here = matches!(fault, Some((fault_index, _)) if fault_index == index);
        let cause: Option<String> = if injected_here {
            Some(match fault {
                Some((_, CommitFaultStage::InstallFailure)) => "injected install failure".to_string(),
                _ => "injected post-rotation failure".to_string(),
            })
        } else {
            None
        };
        // Rotation.
        if item.had_previous {
            if let Err(error) = fs::rename(&item.target, &item.backup) {
                return Err(finish_failure(
                    format!("confirmed transaction failed during backup rotation ({error})"),
                    &states, &staged, &created_dirs,
                ));
            }
            states[index] = ItemCommitState::BackupRotated;
        }
        // Install.
        if let Some(cause_text) = &cause {
            return Err(finish_failure(
                format!("confirmed transaction failed ({cause_text})"),
                &states, &staged, &created_dirs,
            ));
        }
        match fs::rename(&item.tmp, &item.target) {
            Ok(()) => {
                states[index] = ItemCommitState::Installed;
                written.push(item.relative.clone());
            }
            Err(error) => {
                return Err(finish_failure(
                    format!("confirmed transaction failed during install ({error})"),
                    &states, &staged, &created_dirs,
                ));
            }
        }
    }
    for item in &staged {
        let _ = fs::remove_file(&item.backup);
    }
    Ok(written)
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
            import_backup,
            export_review_pack,
            validate_obsidian_target,
            list_markdown_files,
            read_text_files,
            write_confirmed_files
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

    fn export_request(relative_path: &str, contents: &str) -> ExportFileRequest {
        ExportFileRequest { relative_path: relative_path.into(), contents: contents.into() }
    }

    #[test]
    fn unsafe_relative_paths_are_rejected_without_writes() {
        let cases = [
            "../escape.txt",
            "a/../../escape.txt",
            "C:\\evil.txt",
            "/absolute.txt",
            "\\\\server\\share\\x.txt",
            ".obsidian/workspace.json",
            "notes/.obsidian/app.json",
            "trailing.dot.",
            "ends with space ",
            "con.txt",
            "a/b/c/d/e/f/g/h/i/too-deep.txt",
            "",
            "control\u{7}char.txt",
        ];
        for case in cases {
            assert!(validate_relative_path(case).is_err(), "expected rejection: {case:?}");
        }
        assert_eq!(validate_relative_path("manifest.json").unwrap(), "manifest.json");
        assert_eq!(validate_relative_path("_Review\\b1\\note.md").unwrap(), "_Review/b1/note.md");
    }

    #[test]
    fn review_pack_export_is_atomic_idempotent_and_contained() {
        let root = tempdir().unwrap();
        let outside = tempdir().unwrap();
        let destination = root.path().join("review-pack-1");
        let files = vec![
            export_request("manifest.json", "{}\n"),
            export_request("content.json", "[]\n"),
            export_request("REVIEW_COPY.md", "# 审核副本\n"),
            export_request("SCIENTIFIC_CHANGESET.md", "# 科学变更清单\n"),
            export_request("dependencies.json", "{}\n"),
        ];
        let written = export_files_inner(&destination, &files).unwrap();
        assert_eq!(written.len(), 5);
        for file in &files {
            let bytes = fs::read_to_string(destination.join(&file.relative_path)).unwrap();
            assert_eq!(bytes, file.contents);
        }
        // No leftover temporary or backup files.
        let leftovers: Vec<_> = fs::read_dir(&destination).unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name.contains("researchos-tmp") || name.contains("researchos-bak"))
            .collect();
        assert!(leftovers.is_empty(), "{leftovers:?}");
        // Idempotent repeat writes nothing.
        let second = export_files_inner(&destination, &files).unwrap();
        assert!(second.is_empty());
        // Nothing escaped the destination.
        let stray: Vec<_> = fs::read_dir(root.path()).unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name != "review-pack-1")
            .collect();
        assert!(stray.is_empty(), "{stray:?}");
        let _ = outside;
    }

    #[test]
    fn one_unsafe_path_fails_the_whole_batch_with_zero_file_writes() {
        let root = tempdir().unwrap();
        let destination = root.path().join("batch");
        let files = vec![
            export_request("manifest.json", "{}\n"),
            export_request("../escape.txt", "evil"),
        ];
        let error = export_files_inner(&destination, &files).unwrap_err();
        assert!(error.to_string().contains("unsafe relative path"), "{error}");
        let created = fs::read_dir(root.path()).map(|entries| entries.count()).unwrap_or(0);
        assert_eq!(created, 0, "no files or directories may be created when validation fails");
    }

    #[test]
    fn atomic_write_restores_previous_content_when_rename_fails() {
        let root = tempdir().unwrap();
        let target = root.path().join("note.md");
        fs::write(&target, "original").unwrap();
        // A directory occupying the temporary name forces the write to fail.
        let tmp = root.path().join(".note.md.researchos-tmp");
        fs::create_dir(&tmp).unwrap();
        let error = atomic_write(&target, "replacement").unwrap_err();
        assert!(matches!(error, AppError::Io(_)), "{error}");
        assert_eq!(fs::read_to_string(&target).unwrap(), "original");
        let leftovers: Vec<_> = fs::read_dir(&root).unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name.contains("researchos-bak"))
            .collect();
        assert!(leftovers.is_empty(), "{leftovers:?}");
    }

    #[test]
    fn containment_proof_rejects_resolved_escapes() {
        let root = tempdir().unwrap();
        let base = root.path().join("vault").join("ResearchOS");
        fs::create_dir_all(&base).unwrap();
        // Traversal is rejected purely.
        assert!(contained_target(&base, "../outside.txt").is_err());
        // A symlinked parent that resolves outside the base is rejected where the OS allows symlinks.
        let link = base.join("link");
        #[cfg(windows)]
        let created = std::os::windows::fs::symlink_dir(root.path(), &link).is_ok();
        #[cfg(not(windows))]
        let created = std::os::unix::fs::symlink(root.path(), &link).is_ok();
        if created {
            let error = contained_target(&base, "link/escaped.txt").unwrap_err();
            assert!(error.to_string().contains("escapes the allowed directory"), "{error}");
            assert!(!root.path().join("escaped.txt").exists());
        }
    }

    fn confirmed_request(relative_path: &str, contents: &str, expected_existing: Option<&str>) -> ConfirmedWriteRequest {
        ConfirmedWriteRequest { relative_path: relative_path.into(), contents: contents.into(), expected_existing: expected_existing.map(str::to_owned) }
    }

    #[test]
    fn obsidian_connection_validation_is_read_only_and_fails_closed() {
        let root = tempdir().unwrap();
        fs::create_dir(root.path().join(".obsidian")).unwrap();
        let before = fs::read_dir(root.path()).unwrap().count();
        // Missing dedicated folder validates fine without creating it.
        let report = validate_obsidian_target(root.path().to_string_lossy().into(), "ResearchOS".into()).unwrap();
        assert_eq!(report["existed"], false);
        assert_eq!(report["readOnly"], true);
        assert!(!root.path().join("ResearchOS").exists(), "validation must not create the dedicated folder");
        assert_eq!(fs::read_dir(root.path()).unwrap().count(), before);
        // Unsafe scopes fail closed.
        for bad in [".obsidian", "a/../b", "one/two/three", "", "/abs", "sub\\..\\..\\x"] {
            assert!(validate_obsidian_target(root.path().to_string_lossy().into(), bad.into()).is_err(), "{bad:?}");
        }
        // A symlinked subfolder component is rejected where the OS allows creating one.
        #[cfg(windows)]
        let link_created = std::os::windows::fs::symlink_dir(root.path(), root.path().join("linked")).is_ok();
        #[cfg(not(windows))]
        let link_created = std::os::unix::fs::symlink(root.path(), root.path().join("linked")).is_ok();
        if link_created {
            assert!(validate_obsidian_target(root.path().to_string_lossy().into(), "linked/ResearchOS".into()).is_err());
        }
    }

    #[test]
    fn obsidian_listing_and_reading_skip_protected_dirs_and_stay_contained() {
        let root = tempdir().unwrap();
        let dedicated = root.path().join("ResearchOS");
        fs::create_dir_all(dedicated.join(".obsidian")).unwrap();
        fs::create_dir_all(dedicated.join("nested")).unwrap();
        fs::write(dedicated.join("b.md"), "second").unwrap();
        fs::write(dedicated.join("nested/a.md"), "first").unwrap();
        fs::write(dedicated.join(".obsidian/workspace.json"), "{}").unwrap();
        fs::write(root.path().join("outside.md"), "outside").unwrap();
        let listed = list_markdown_files(root.path().to_string_lossy().into(), "ResearchOS".into()).unwrap();
        assert_eq!(listed, vec!["b.md".to_string(), "nested/a.md".to_string()]);
        let read = read_text_files(
            root.path().to_string_lossy().into(),
            "ResearchOS".into(),
            vec!["b.md".into(), "missing.md".into()],
        ).unwrap();
        assert_eq!(read[0].contents.as_deref(), Some("second"));
        assert_eq!(read[1].contents, None);
        assert!(read_text_files(root.path().to_string_lossy().into(), "ResearchOS".into(), vec!["../outside.md".into()]).is_err());
    }

    #[test]
    fn confirmed_publish_is_atomic_preconditioned_idempotent_and_collision_safe() {
        let root = tempdir().unwrap();
        let dedicated_root = root.path().to_string_lossy().into_owned();
        // Create.
        let written = write_confirmed_files(
            dedicated_root.clone(), "ResearchOS".into(),
            vec![confirmed_request("概念笔记.md", "# v1\n", None)],
        ).unwrap();
        assert_eq!(written, vec!["概念笔记.md"]);
        let path = root.path().join("ResearchOS").join("概念笔记.md");
        assert_eq!(fs::read_to_string(&path).unwrap(), "# v1\n");
        // Idempotent repeat writes nothing (expected bytes match).
        let second = write_confirmed_files(
            dedicated_root.clone(), "ResearchOS".into(),
            vec![confirmed_request("概念笔记.md", "# v1\n", Some("# v1\n"))],
        ).unwrap();
        assert!(second.is_empty());
        // Precondition mismatch aborts with zero effect on any file in the batch.
        let error = write_confirmed_files(
            dedicated_root.clone(), "ResearchOS".into(),
            vec![
                confirmed_request("概念笔记.md", "# v2\n", Some("# stale\n")),
                confirmed_request("other.md", "x\n", None),
            ],
        ).unwrap_err();
        assert!(error.to_string().contains("written nowhere"), "{error}");
        assert_eq!(fs::read_to_string(&path).unwrap(), "# v1\n");
        assert!(!root.path().join("ResearchOS").join("other.md").exists());
        // Case-insensitive collision inside the same directory fails closed.
        fs::write(root.path().join("ResearchOS").join("Note.md"), "existing").unwrap();
        let collision = write_confirmed_files(
            dedicated_root.clone(), "ResearchOS".into(),
            vec![confirmed_request("note.md", "clobber\n", None)],
        ).unwrap_err();
        assert!(collision.to_string().contains("collision"), "{collision}");
        assert_eq!(fs::read_to_string(root.path().join("ResearchOS").join("Note.md")).unwrap(), "existing");
        // Windows resolves paths case-insensitively, so verify no extra entry appeared.
        let entries = fs::read_dir(root.path().join("ResearchOS")).unwrap().count();
        assert_eq!(entries, 2, "only 概念笔记.md and Note.md may exist");
        // Decomposed Unicode filenames are rejected deterministically.
        assert!(write_confirmed_files(
            dedicated_root.clone(), "ResearchOS".into(),
            vec![confirmed_request("e\u{0301}tude.md", "x\n", None)],
        ).is_err());
    }

    #[test]
    fn r4_first_review_export_into_blank_vault_creates_nested_parents() {
        let root = tempdir().unwrap();
        fs::create_dir_all(root.path().join("ResearchOS")).unwrap();
        let written = write_confirmed_files(
            root.path().to_string_lossy().into_owned(),
            "ResearchOS".into(),
            vec![
                confirmed_request("_Review/batch-9/manifest.json", "{}\n", None),
                confirmed_request("_Review/batch-9/note.md", "n\n", None),
            ],
        ).unwrap();
        assert_eq!(written.len(), 2);
        assert_eq!(fs::read_to_string(root.path().join("ResearchOS/_Review/batch-9/manifest.json")).unwrap(), "{}\n");
    }

    #[test]
    fn r4_duplicate_and_equivalent_paths_are_rejected_with_zero_writes() {
        let root = tempdir().unwrap();
        fs::create_dir_all(root.path().join("ResearchOS")).unwrap();
        let err = write_confirmed_files(
            root.path().to_string_lossy().into_owned(),
            "ResearchOS".into(),
            vec![
                confirmed_request("a.md", "one\n", None),
                confirmed_request("a.md", "two\n", None),
            ],
        ).unwrap_err();
        assert!(err.to_string().contains("duplicate"), "{err}");
        assert!(!root.path().join("ResearchOS/a.md").exists());
        let err = write_confirmed_files(
            root.path().to_string_lossy().into_owned(),
            "ResearchOS".into(),
            vec![
                confirmed_request("b.md", "one\n", None),
                confirmed_request("B.md", "two\n", None),
            ],
        ).unwrap_err();
        assert!(err.to_string().contains("equivalent"), "{err}");
        assert!(!root.path().join("ResearchOS/b.md").exists());
    }

    #[test]
    fn r4_second_file_failure_rolls_back_the_whole_batch() {
        let root = tempdir().unwrap();
        fs::create_dir_all(root.path().join("ResearchOS")).unwrap();
        // `blocked` exists as a directory: precondition passes (expected None,
        // not a regular file), but the final rename must fail and roll back a.md.
        fs::create_dir_all(root.path().join("ResearchOS/blocked")).unwrap();
        let err = write_confirmed_files(
            root.path().to_string_lossy().into_owned(),
            "ResearchOS".into(),
            vec![
                confirmed_request("a.md", "first\n", None),
                confirmed_request("blocked", "second\n", None),
            ],
        );
        // Either the planner rejects the directory target outright or the
        // transaction rolls back; either way nothing may remain written.
        if err.is_ok() {
            panic!("directory target should not be writable");
        }
        assert!(!root.path().join("ResearchOS/a.md").exists(), "first file must be rolled back");
        let leftovers: Vec<_> = fs::read_dir(root.path().join("ResearchOS")).unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name.contains("researchos-tmp") || name.contains("researchos-bak"))
            .collect();
        assert!(leftovers.is_empty(), "{leftovers:?}");
    }

    #[test]
    fn r3_listing_and_reading_never_follow_directory_links() {
        let root = tempdir().unwrap();
        let dedicated = root.path().join("ResearchOS");
        fs::create_dir_all(dedicated.join("real")).unwrap();
        fs::write(dedicated.join("real/inside.md"), "inside").unwrap();
        fs::write(root.path().join("secret.txt"), "secret-bytes").unwrap();
        #[cfg(windows)]
        let link_created = {
            let link = dedicated.join("linked");
            std::os::windows::fs::symlink_dir(root.path(), &link).is_ok()
                || crate_command_succeeded(&["cmd", "/C", "mklink", "/J", &link.to_string_lossy(), &root.path().to_string_lossy()])
        };
        #[cfg(not(windows))]
        let link_created = std::os::unix::fs::symlink(root.path(), dedicated.join("linked")).is_ok();
        if !link_created {
            // OS refused link creation (no privilege); containment logic is still
            // covered by traversal and canonicalization cases elsewhere.
            return;
        }
        // Listing must not follow into the linked directory.
        let listed = list_markdown_files(root.path().to_string_lossy().into(), "ResearchOS".into()).unwrap();
        assert!(!listed.iter().any(|entry| entry.starts_with("linked/")), "{listed:?}");
        assert_eq!(listed, vec!["real/inside.md".to_string()]);
        // Reading through the link must fail closed without leaking bytes.
        let outside_before = fs::read(root.path().join("secret.txt")).unwrap();
        let result = read_text_files(
            root.path().to_string_lossy().into(),
            "ResearchOS".into(),
            vec!["linked/secret.txt".into()],
        );
        match result {
            Ok(entries) => assert_ne!(entries[0].contents.as_deref(), Some("secret-bytes")),
            Err(_) => {}
        }
        assert_eq!(fs::read(root.path().join("secret.txt")).unwrap(), outside_before);
        // Cleanup best effort so other assertions see a clean tree.
        let _ = fs::remove_dir_all(dedicated.join("linked"));
    }

    #[cfg(windows)]
    fn crate_command_succeeded(command: &[&str]) -> bool {
        use std::os::windows::process::CommandExt;
        std::process::Command::new(command[0])
            .args(&command[1..])
            .creation_flags(0x0800_0000) // CREATE_NO_WINDOW
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }

    #[test]
    fn r3_file_symlinks_are_not_read_or_written_through() {
        let root = tempdir().unwrap();
        let dedicated = root.path().join("ResearchOS");
        fs::create_dir_all(&dedicated).unwrap();
        fs::write(root.path().join("outside.md"), "outside-original").unwrap();
        #[cfg(windows)]
        let created = std::os::windows::fs::symlink_file(root.path().join("outside.md"), dedicated.join("portal.md")).is_ok();
        #[cfg(not(windows))]
        let created = std::os::unix::fs::symlink(root.path().join("outside.md"), dedicated.join("portal.md")).is_ok();
        if !created {
            return;
        }
        // Reading through a file symlink fails closed.
        assert!(read_text_files(
            root.path().to_string_lossy().into(),
            "ResearchOS".into(),
            vec!["portal.md".into()],
        ).is_err());
        // Writing through one fails closed even when the expected bytes match.
        assert!(write_confirmed_files(
            root.path().to_string_lossy().into_owned(),
            "ResearchOS".into(),
            vec![confirmed_request("portal.md", "outside-original", Some("outside-original"))],
        ).is_err());
        assert_eq!(fs::read_to_string(root.path().join("outside.md")).unwrap(), "outside-original");
        let _ = fs::remove_file(dedicated.join("portal.md"));
    }

    #[test]
    fn r3r_no_directories_are_created_through_links_before_rejection() {
        let root = tempdir().unwrap();
        let dedicated = root.path().join("ResearchOS");
        fs::create_dir_all(&dedicated).unwrap();
        let outside = root.path().join("outside-sandbox");
        fs::create_dir_all(&outside).unwrap();
        #[cfg(windows)]
        let link_created = {
            let link = dedicated.join("linked");
            std::os::windows::fs::symlink_dir(&outside, &link).is_ok()
                || crate_command_succeeded(&["cmd", "/C", "mklink", "/J", &link.to_string_lossy(), &outside.to_string_lossy()])
        };
        #[cfg(not(windows))]
        let link_created = std::os::unix::fs::symlink(&outside, dedicated.join("linked")).is_ok();
        if !link_created {
            return;
        }
        let tree_snapshot = |dir: &Path| -> Vec<(String, bool)> {
            let mut out = Vec::new();
            fn visit(dir: &Path, base: &Path, out: &mut Vec<(String, bool)>) {
                for entry in fs::read_dir(dir).unwrap() {
                    let entry = entry.unwrap();
                    let rel = entry.path().strip_prefix(base).unwrap().to_string_lossy().into_owned();
                    if entry.path().is_dir() {
                        out.push((rel.clone(), true));
                        visit(&entry.path(), base, out);
                    } else {
                        out.push((rel, false));
                    }
                }
            }
            visit(dir, dir, &mut out);
            out.sort();
            out
        };
        let before = tree_snapshot(&outside);
        let result = write_confirmed_files(
            root.path().to_string_lossy().into_owned(),
            "ResearchOS".into(),
            vec![confirmed_request("linked/new/note.md", "escape\n", None)],
        );
        assert!(result.is_err(), "writes through a linked component must be rejected");
        assert!(!outside.join("new").exists(), "no directory may be created outside via the link");
        assert_eq!(tree_snapshot(&outside), before, "external tree must stay byte/path identical");
        let _ = fs::remove_dir_all(dedicated.join("linked"));
    }

    fn tree_fingerprint(dir: &Path) -> Vec<(String, Vec<u8>)> {
        let mut out = Vec::new();
        fn visit(dir: &Path, base: &Path, out: &mut Vec<(String, Vec<u8>)>) {
            for entry in fs::read_dir(dir).unwrap() {
                let entry = entry.unwrap();
                let rel = entry.path().strip_prefix(base).unwrap().to_string_lossy().into_owned();
                if entry.path().is_dir() {
                    visit(&entry.path(), base, out);
                } else {
                    out.push((rel, fs::read(entry.path()).unwrap()));
                }
            }
        }
        visit(dir, dir, &mut out);
        out.sort();
        out
    }

    #[test]
    fn r4r_fault_injection_rolls_back_update_then_create() {
        let root = tempdir().unwrap();
        let dedicated = root.path().join("ResearchOS");
        fs::create_dir_all(&dedicated).unwrap();
        fs::write(dedicated.join("existing.md"), "ORIGINAL").unwrap();
        let before = tree_fingerprint(&dedicated);
        let error = write_confirmed_files_inner(
            &root.path().to_string_lossy(),
            "ResearchOS",
            vec![
                confirmed_request("existing.md", "REPLACED", Some("ORIGINAL")),
                confirmed_request("fresh.md", "NEW CONTENT", None),
            ],
            Some((1, CommitFaultStage::InstallFailure)), // first installs, second's rotation+install fails
        ).unwrap_err();
        assert!(error.to_string().contains("rolled back"), "{error}");
        assert_eq!(
            tree_fingerprint(&dedicated),
            before,
            "tree must be byte-identical after rollback"
        );
        assert_eq!(fs::read_to_string(dedicated.join("existing.md")).unwrap(), "ORIGINAL");
        assert!(!dedicated.join("fresh.md").exists());
        let leftovers: Vec<String> = fs::read_dir(&dedicated).unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name.contains(".researchos-tmp") || name.contains(".researchos-bak"))
            .collect();
        assert!(leftovers.is_empty(), "{leftovers:?}");
    }

    #[test]
    fn r4r2_rotated_backup_of_current_item_is_restored_even_with_no_prior_commits() {
        let root = tempdir().unwrap();
        let dedicated = root.path().join("ResearchOS");
        fs::create_dir_all(&dedicated).unwrap();
        fs::write(dedicated.join("solo.md"), "PRECIOUS").unwrap();
        // Single item: its backup is rotated away, then the install fails.
        // The rollback MUST include this current, never-committed item.
        let error = write_confirmed_files_inner(
            &root.path().to_string_lossy(),
            "ResearchOS",
            vec![confirmed_request("solo.md", "LOST-IF-BUGGY", Some("PRECIOUS"))],
            Some((0, CommitFaultStage::InstallFailure)),
        ).unwrap_err();
        assert!(error.to_string().contains("rolled back"), "{error}");
        assert_eq!(fs::read_to_string(dedicated.join("solo.md")).unwrap(), "PRECIOUS", "the only backup must be restored, not deleted");
        let leftovers: Vec<String> = fs::read_dir(&dedicated).unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name.contains(".researchos-tmp") || name.contains(".researchos-bak"))
            .collect();
        assert!(leftovers.is_empty(), "{leftovers:?}");
    }

    #[test]
    fn r4r2_precondition_failure_purges_directories_created_by_this_transaction() {
        let root = tempdir().unwrap();
        // NOTE: the dedicated folder does NOT exist yet; it and the nested
        // parents are created by THIS transaction and must vanish again when a
        // precondition fails afterwards.
        let error = write_confirmed_files_inner(
            &root.path().to_string_lossy(),
            "ResearchOS",
            vec![
                confirmed_request("nested/deep/ok.md", "new\n", None),
                confirmed_request("nested/stale.md", "changed\n", Some("DIFFERENT")),
            ],
            None,
        ).unwrap_err();
        assert!(error.to_string().contains("written nowhere"), "{error}");
        assert!(!root.path().join("ResearchOS").exists(), "created-by-this-run directories must be purged on failure");
    }

    #[test]
    fn r4r_fault_injection_rolls_back_create_then_update() {
        let root = tempdir().unwrap();
        let dedicated = root.path().join("ResearchOS");
        fs::create_dir_all(&dedicated).unwrap();
        fs::write(dedicated.join("keep.md"), "KEEP-ME").unwrap();
        let before = tree_fingerprint(&dedicated);
        let error = write_confirmed_files_inner(
            &root.path().to_string_lossy(),
            "ResearchOS",
            vec![
                confirmed_request("brand-new.md", "NEW", None),
                confirmed_request("keep.md", "CHANGED", Some("KEEP-ME")),
            ],
            Some((1, CommitFaultStage::InstallFailure)),
        ).unwrap_err();
        assert!(error.to_string().contains("rolled back"), "{error}");
        assert_eq!(tree_fingerprint(&dedicated), before);
        assert_eq!(fs::read_to_string(dedicated.join("keep.md")).unwrap(), "KEEP-ME");
        assert!(!dedicated.join("brand-new.md").exists());
    }

    #[test]
    fn r4r4_two_level_subfolder_is_fully_reclaimed_on_failure() {
        let root = tempdir().unwrap();
        // Neither level of the two-level dedicated subfolder exists yet.
        let error = write_confirmed_files_inner(
            &root.path().to_string_lossy(),
            "ResearchOS/Notes",
            vec![
                confirmed_request("a.md", "new\n", None),
                confirmed_request("stale.md", "changed\n", Some("DIFFERENT")),
            ],
            None,
        ).unwrap_err();
        assert!(error.to_string().contains("written nowhere"), "{error}");
        assert!(!root.path().join("ResearchOS").exists(), "the upper created level must also be reclaimed");
        assert!(!root.path().join("ResearchOS").join("Notes").exists(), "no level of the created tree may survive a failure");
    }

    #[test]
    fn r3_listing_overflow_is_a_structured_error_not_a_partial_scan() {
        let root = tempdir().unwrap();
        let dedicated = root.path().join("ResearchOS");
        fs::create_dir_all(&dedicated).unwrap();
        for index in 0..501 {
            fs::write(dedicated.join(format!("note-{index:04}.md")), "x").unwrap();
        }
        let error = list_markdown_files(root.path().to_string_lossy().into(), "ResearchOS".into()).unwrap_err();
        assert!(error.to_string().contains("overflow"), "{error}");
    }
}
