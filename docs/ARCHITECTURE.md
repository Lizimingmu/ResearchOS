# Architecture

## Runtime shape

```text
React + TypeScript UI
  ├─ typed seed content and learning engine
  ├─ Zustand application store
  └─ desktop service adapter
          │ Tauri invoke
Rust command boundary
  ├─ SQLite (state, entities, papers, projects, responses, reviews, settings)
  ├─ Windows Credential Manager (provider secrets)
  ├─ reqwest (optional provider, PubMed, Crossref)
  └─ backup integrity and import/export
```

Tauri creates the WebView window in Rust setup so an explicit WebView data directory can be placed under the selected
ResearchOS data directory. The default is the operating-system application-data location; `RESEARCHOS_DATA_DIR` is a
test/development override.

## Frontend

`src/app` owns shell/navigation and keyboard commands. `src/features` contains one view per work area.
`src/components/AttemptFlow.tsx` enforces confidence → lock → feedback → transfer. `src/learning` owns pure scheduler,
review, and skill-evidence functions. `src/data` is typed, provenance-bearing seed content. `src/state/store.ts` owns
runtime actions and persists serializable state through `src/services/desktop.ts`.

## Backend commands

- `load_state`, `save_state`, `database_health`
- generic entity create/list/update/delete commands
- `secure_set_api_key`, `secure_get_api_key`, `secure_delete_api_key`
- `test_ai_provider`, `ai_review`
- `verify_evidence` for PubMed E-utilities or Crossref
- `export_backup`, `import_backup` with SQLite integrity validation

The schema also materializes first-class tables for forward migration even though v0.9 persists a canonical JSON
snapshot in `app_state` for atomic desktop restoration.

## Security and trust boundaries

- API keys are never serialized into the Zustand snapshot or backup database.
- AI review requires non-empty evidence context, uses a restrained reviewer system instruction, and cannot modify seed sources.
- Content provenance rejects `contentOrigin: "ai_generated"` combined with `verificationStatus: "verified"`.
- Network access is opt-in by action and limited by the Tauri content security policy to provider URLs and evidence services.
- Imported backups are opened read-only, integrity checked, and required to contain ResearchOS state before replacement.
- Local PDFs remain user-selected files; the distribution includes only public bibliographic metadata.

## Build layout

TypeScript compiles to `.build`, Rollup emits `dist`, Cargo builds `src-tauri/target`, and Tauri packages an NSIS
installer. `scripts/export-seed.mjs` produces inspectable JSON. `scripts/cargo-proxy.mjs` is an optional development-only
transport workaround for environments where Cargo's native TLS path is blocked; normal installations use Cargo directly.
