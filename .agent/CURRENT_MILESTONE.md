# Current Milestone — M014-02 Release Candidate

## Decision

M013 and M014-01 are ACCEPTED. M014-02 turns the accepted Problem Atlas plus Chinese tutorial into a fully verified Windows release candidate. M012 Protocol Lab and the 166-card external corpus remain deferred.

## Outcome

Produce a versioned ResearchOS Windows release candidate whose frontend, Rust/Tauri persistence, migrations, tutorial, backup/restore, installers, hashes, and release notes are reproducibly verified.

## Release scope

- Bump the product consistently to `0.11.0` in package, Tauri, UI/release metadata, and generated release notes.
- Run frontend tests and every deterministic audit from the accepted M014-01 gate.
- Run Rust tests/checks and a Tauri production build; verify schema 3 / SQLite user version 2 compatibility and preservation of existing v0.10.2 user data.
- Perform packaged-app smoke tests for first launch, tutorial skip/finish/reopen, ordinary and compact Windows sizing, keyboard/focus behavior, core navigation, and restart persistence.
- Verify backup/export and restore/import round trip without learning-state loss.
- Generate portable/setup deliverables as supported by the existing release workflow, SHA256 files, and concise Chinese release notes.
- Keep all pending demo scientific content pending. Keep all 166 external staging cards unclassified, quarantined, and production-import-ineligible.

## Acceptance

All automated gates, Rust/Tauri checks, packaged-app smoke tests, migration/backup round trips, installer launch checks, hashes, and handoff validation pass. Reports list exact commands, artifacts, sizes, and SHA256 values. OpenCode performs no Git operation and stops for Codex final release sign-off.
