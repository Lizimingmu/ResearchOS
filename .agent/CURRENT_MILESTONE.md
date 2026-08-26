# Current Milestone — M014-02 Release Candidate

Execution status: **PAUSED BY USER**. Do not resume until explicitly requested. All testing must follow `.agent/TESTING_POLICY.md`.

## Decision

M013 and M014-01 are ACCEPTED. M014-02 turns the accepted Problem Atlas plus Chinese tutorial into a fully verified Windows release candidate. M012 Protocol Lab and the 166-card external corpus remain deferred.

## Outcome

Produce a versioned ResearchOS Windows release candidate whose frontend, Rust/Tauri persistence, migrations, tutorial, backup/restore, installers, hashes, and release notes are reproducibly verified.

## Release scope

- Bump the product consistently to `0.11.0` in package, Tauri, UI/release metadata, and generated release notes.
- Run frontend tests and every deterministic audit from the accepted M014-01 gate.
- Run Rust tests/checks and a Tauri production build; verify schema 3 / SQLite user version 2 compatibility and preservation of existing v0.10.2 user data.
- Perform packaged-app smoke tests only in a separately approved foreground session, or use a user-manual checklist/headless evidence. Never allow the test to steal focus or interfere with normal computer use.
- Verify backup/export and restore/import round trip without learning-state loss.
- Generate portable/setup deliverables as supported by the existing release workflow, SHA256 files, and concise Chinese release notes.
- Keep all pending demo scientific content pending. Keep all 166 external staging cards unclassified, quarantined, and production-import-ineligible.

## Acceptance

All background automated gates, Rust/Tauri checks, migration/backup round trips, hashes, and handoff validation pass. Foreground packaged-app and installer checks are reported separately under the categories required by `.agent/TESTING_POLICY.md`; they run only with explicit current permission. Reports list exact commands, artifacts, sizes, SHA256 values, and any `NOT RUN` checks. OpenCode performs no Git operation and stops for Codex final release sign-off.
