# ResearchOS v0.9 Final Handoff

## Build

Version: 0.9.0  
Commit: not committed; the parent worktree does not track the `ResearchOS` directory  
Build status: passed on Windows, including the production frontend, Rust release executable, and NSIS bundle  
Installer: `release/ResearchOS_0.9.0_x64-setup.exe` (5,253,831 bytes)  
Executable: `release/ResearchOS_0.9.0_x64.exe` (15,475,712 bytes)

SHA-256 values are in `release/SHA256SUMS.txt`. The installer is not code-signed.

## Implemented

- Tauri 2 / React / TypeScript / Rust / SQLite local-first desktop application.
- Today, Library, Paper Lab, Method Lab, Review, AI Audit, Frontier, Projects, Skill Map, Blind Assessment, and Settings.
- Confidence capture and immutable first attempts before seed feedback, sources, and transfer prompts appear.
- Weighted daily scheduler, FSRS-compatible review state, dangerous high-confidence misconception handling, and broad skill bands.
- Local PDF selection and three-pane reading/training workspace.
- Typed evidence records, PubMed/Crossref identifier verification, and generated-content provenance enforcement.
- Optional OpenAI-compatible provider with evidence-required review and Windows Credential Manager key storage.
- SQLite state restoration, health check, integrity-checked backup import/export, command palette, shortcuts, and light/dark themes.
- Machine-readable seed exports in `data/` and an NSIS current-user installer.

## Starter Content

Research patterns: 18  
Method bites: 47 total; 43 marked usable  
Judgment cards: 30  
AI audit cases: 15  
Evidence sources: 23  
Starter track: 7 days

No copyrighted article full text is bundled.

## Tests

Unit: 5/5 pass for content counts/provenance, scheduler weights, review danger/stability behavior, and score withholding.  
Integration: 7/7 pass for Today, immutable submission/review creation, project/settings persistence, PDF import mapping, provider persistence, non-chat UI, and generated-content safeguards.  
Rust: 5/5 pass for SQLite round trip, entity CRUD, backup/restore, provider URL configuration, and the provenance invariant.  
Smoke: production assets returned HTTP 200; real Tauri development and release processes started; SQLite was created; the rebuilt release restarted against the same database; NSIS packaging passed.  
Visual: the in-app browser denied localhost access under its permission/security policy, so screenshot-based visual QA was not completed.

## Known Limitations

- Final monitor scaling, PDF appearance, and native dialogs require human inspection on the target display.
- The review algorithm has FSRS-compatible fields and conservative intervals, not the full FSRS reference optimizer.
- Provider behavior was not tested against a live model because no external credential was supplied.
- SQLite backup retains PDF paths but does not copy external PDF files or Windows-stored credentials.
- The installer is unsigned and the application is not intended for regulated clinical use.

## Deferred v1.0

- Zotero sync, lawful full-text extraction, OCR/GROBID, full-text search, semantic RAG, and citation anchoring.
- Full FSRS parameter optimization using longitudinal user evidence.
- Automated frontier literature radar and multi-user synchronization.
- Human reviewer identity and an auditable pending-to-verified promotion workflow.
- Windows CI coverage for native dialogs, provider calls, accessibility, and display scaling.

## How to Run

1. Verify `release/ResearchOS_0.9.0_x64-setup.exe` against `release/SHA256SUMS.txt`.
2. Run the installer; it installs per user and may show an unknown-publisher warning because it is unsigned.
3. Launch ResearchOS from the installed shortcut. No login or AI configuration is required for core use.

For development, run `npm install`, `npm test`, `npm run seed:export`, and `npm run tauri:dev`. Build a new installer with `npm run tauri:build` after installing the documented Windows prerequisites.

## Data Location

The default is the Tauri-resolved application-data directory for `org.researchos.desktop`, containing
`researchos.sqlite3` and the `webview` directory. `RESEARCHOS_DATA_DIR` overrides this location for an explicit
development or test run.

## Backup

Settings → Data exports a consistent SQLite backup. Import opens the candidate database read-only, runs
`PRAGMA integrity_check`, verifies that ResearchOS state exists, and only then writes the restored state. External PDFs
and API credentials are excluded.

## AI Configuration

Settings → AI accepts an OpenAI-compatible base URL, model, temperature, maximum tokens, and API key. The API key is
stored in Windows Credential Manager. AI review is optional, occurs only after a locked human attempt, requires explicit
evidence context, and cannot mark generated material verified.
