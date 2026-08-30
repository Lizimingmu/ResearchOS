# ResearchOS architecture

*Runtime, trust-boundary, persistence, startup-recovery, and learning architecture for v0.12.0 / M017.*

---

## 🧩 Runtime shape

```mermaid
flowchart TB
  accTitle: ResearchOS local-first architecture
  accDescr: A React interface calls pure learning services and a central state store, which persists through Tauri commands to SQLite while secrets remain in Windows Credential Manager.
  UI[React 19 workspaces] --> LE[Pure learning engine]
  UI --> STORE[Zustand state and actions]
  DATA[Typed provenance content] --> UI
  STORE --> ADAPTER[Desktop service adapter]
  ADAPTER -->|Tauri invoke| RUST[Rust command boundary]
  RUST --> DB[(SQLite WAL)]
  RUST --> CREDS[Windows Credential Manager]
  RUST --> NET[Optional provider / PubMed / Crossref]
  STORE -->|Browser preview only| LS[localStorage fallback]
  classDef ui fill:#e8f1ff,stroke:#3767a6,color:#10233d
  classDef boundary fill:#fff1e6,stroke:#b65d20,color:#4b2510
  class UI,LE,STORE,DATA,ADAPTER ui
  class RUST,DB,CREDS,NET,LS boundary
```

Tauri creates one WebView window during Rust setup so its data directory can live beneath the selected ResearchOS data directory. That design supports isolated smoke runs and prevents WebView storage from escaping the chosen data root.

## 🖥️ Frontend boundaries

`src/app` owns routing, lazy view boundaries, restoration, and global keyboard behavior. `src/features` contains workspaces; Paper Lab and PDF.js are lazy-loaded. `src/components/AttemptFlow.tsx` enforces the legacy human-first attempt contract, while `src/features/learning/LearningShell.tsx` and `PracticeActivity.tsx` implement the progressive lesson surface. `src/learning` contains pure scheduler/review/scoring/state-transition functions. `src/data` contains typed, source-linked seed content. `src/state/store.ts` is the only place that coordinates state mutations and persistence.

Calibration is centralized in `recordCalibration`: it writes correctness once, adds one skill-evidence record, creates/updates one review, and opens an explicit misconception only for wrong high-confidence responses. Feature views cannot independently duplicate those side effects.

## 💾 State and database

The serializable frontend application schema is v6 and migrates earlier versions without dropping user arrays/settings. M017's 5→6 step adds lesson cursors, routine settings/logs, reasoning records and Paper Cards with zero inferred competence. A future unknown schema is rejected rather than downgraded or overwritten. The native SQLite schema remains `user_version=2`; canonical state still uses the same atomic persistence boundary.

Rust applies database migrations transactionally and verifies `PRAGMA user_version=2`. Canonical state is atomically stored in `app_state`; normalized/entity tables remain available for forward evolution. SQLite uses WAL, a five-second busy timeout, and five bounded pre-save snapshots. Backup import opens the candidate read-only, runs `PRAGMA integrity_check`, verifies ResearchOS state, and only then writes restored state.

## 🔌 Native commands

- State/data: `load_state`, `save_state`, `database_health`, `upsert_entity`, `list_entities`
- Secrets: `secure_set_api_key`, `secure_get_api_key`, `secure_delete_api_key`
- Optional network: `test_ai_provider`, `ai_review`, `verify_evidence`
- Recovery: `export_backup`, `import_backup`

The UI adapter returns structured failures; save errors are exposed in System Health instead of being swallowed.

## 🛡️ Security and scientific trust

- Provider credentials never enter Zustand, SQLite state, backups, exports, prompts, or logs.
- The learner's answer is locked before optional AI review; model output cannot alter the original response or seed content.
- AI requests delimit untrusted learner text, use task-specific instructions, require exact JSON, and reject malformed payloads.
- `contentOrigin=ai_generated` cannot coexist with `verificationStatus=verified`.
- Identifier resolution and claim verification are separate scopes.
- Network calls are optional; local learning, projects, PDF use, review, and exports remain functional without a provider.
- Local PDFs remain user-selected. No licensed full text is distributed.

## ⚡ Performance boundaries

Initial JavaScript is 663,763 bytes; Paper Lab (859,540 bytes), its worker (1,232,303 bytes), and expanded training content (81,995 bytes) are separate payloads. The Rollup environment plugin replaces Node-only React environment checks at compile time. A static boot shell, resource watchdog, safe theme resolver, and React error boundary prevent startup failures from becoming blank windows. Global search demand-loads content indexes, and deterministic scheduling averages 0.1240 ms.

## 📦 Build and release

TypeScript emits `.build`, Rollup emits `dist`, Cargo builds `src-tauri/target`, and Tauri packages an NSIS current-user installer. Content/performance reports are generated release gates. Version is aligned across npm, Cargo, Tauri, build metadata, artifact names, and schema documentation.

The local Cargo transport proxy/configuration used in the restricted build environment is development-only and is not packaged or retained as release configuration.

## M017 learning evidence boundary

`PracticeAssetV1` is immutable by `(id, revision, contentHash)` and a binding assigns one role within a unit. A persisted practice event snapshots that asset identity plus the user's structured/free response. The pure engine rejects response-less practice transitions, separates instruction exposure from competence, and only marks no-hint confidence-bearing independent/review/transfer passes as competence evidence. Built-in assets remain public, de-identified and source-linked; project transfer stores only a local project ID in user state.
