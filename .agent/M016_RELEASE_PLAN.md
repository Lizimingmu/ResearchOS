# M016 v0.12.0 Release Plan

Last updated: 2026-08-26

## Goal

Produce a reproducible Windows v0.12.0 release candidate containing the Codex-accepted M015 Personal Content Studio. This milestone changes release/version metadata and artifacts only; it must not add features or scientific content.

## Release boundaries

- Background-only work is authorized: source edits, deterministic QA, Rust tests, production compilation, packaging, hashing and report generation.
- Do not launch ResearchOS, an installer, Obsidian, a browser or any visible test window.
- Do not use global mouse/keyboard automation, foreground focus control, screenshots, DPI/display changes or the user's production data.
- Do not discover, read or write any real Obsidian vault. Filesystem tests use project-local/temp fake vaults only.
- Do not modify or promote scientific content. The 166 quarantined external cards remain untouched.
- Do not overwrite or delete older release artifacts.
- OpenCode must not run Git. Codex owns checkpoints and release acceptance.

## Version decision

Target version: `0.12.0`. State schema remains 4 and SQLite `user_version` remains 2 unless a genuine implementation defect proves otherwise. All product declarations, filenames and user-agent strings must agree.

## Segments

### M016-01 — Release preparation

- Update every real product-version declaration from 0.11.0 to 0.12.0, including npm, Tauri/Rust, visible application version, user agent, backup filename and documentation where applicable.
- Add a concise Chinese v0.12.0 changelog/release-note draft focused on Personal Content Studio, review packs, versioned overlays/patches/history/rollback, and explicit curated Obsidian batches.
- Preserve the distinction between local activation and scientific verification.
- Add deterministic version-consistency coverage if existing checks do not cover all declaration points.

### M016-02 — Background regression

Run serially where scripts share build/output directories:

1. `npm test`
2. `npm run audit:source-pack`
3. `npm run audit:problem-atlas`
4. `npm run staging:audit`
5. `npm run content:audit`
6. `npm run localization:audit`
7. `npm run performance:audit`
8. `npm run startup:smoke`
9. `npm run seed:export`
10. `npm run audit:m015`
11. `cargo test --manifest-path src-tauri/Cargo.toml` using the configured/offline-capable environment, once; no network retry loop
12. `node scripts/validate-agent-handoff.mjs`

Required regression coverage includes schema 3→4 preservation, existing schema 4 reopening, personal overlay/history/conflict retention, pending/draft exclusion, Obsidian zero-write and containment invariants, and the prior Atlas React #185 path at component/headless level.

### M016-03 — Non-interactive production build and packaging

- Run the normal Tauri production build without launching the product or installer.
- Copy, without overwriting older versions:
  - `release/ResearchOS_0.12.0_x64.exe`
  - `release/ResearchOS_0.12.0_x64-setup.exe`
- Recompute SHA256 and exact byte sizes from the copied files.
- Update `release/SHA256SUMS.txt`, `release/BUILD_METADATA_v0.12.0.json`, `release/RELEASE_NOTES_v0.12.0.md` and `release/README.md`.
- Metadata must identify the accepted source baseline/tag, state schema 4, SQLite version 2, exact test counts, toolchain/build result, unsigned status and all checks not run.
- Never claim foreground, installer, real-Vault or user-manual verification.

### M016-04 — OpenCode handoff

- Update `.agent/IMPLEMENTATION_REPORT.md` with changed files, exact commands, failures/retries, artifact paths/sizes/hashes and remaining checks.
- Update `.agent/SCIENTIFIC_CHANGESET.md` only with a short engineering-status note if required by the validator; expected scientific change is none.
- Set `.agent/M016_RUN_STATE.json` to `awaiting_codex_review` and stop.

### M016-05 — Codex release gate

Codex reviews the accepted M015 tag→HEAD diff, reports, scientific changeset, failures, version declarations and artifact digests. A successful background gate produces a release-candidate checkpoint only.

Foreground packaged-app smoke remains a separate permission gate. Immediately before it, Codex must ask the user for current permission specifying executable, duration, input/focus actions and isolated data directory. Without permission it remains `NOT RUN` and the installer is not declared finally user-verified.

## Acceptance criteria

- No M015 feature or scientific behavior regression in deterministic/background coverage.
- All version declarations and release artifact names are exactly 0.12.0.
- Schema 3→4 and schema 4 persistence preserve user content and learning data.
- Production executable and NSIS installer build successfully and hashes match copied bytes.
- Old artifacts remain byte-untouched.
- No application/installer launch, foreground interaction or real Vault access occurs in the background phase.
- Reports distinguish `BACKGROUND AUTOMATED`, `HEADLESS/OFF-SCREEN`, `FOREGROUND UI` and `USER-MANUAL` truthfully.

