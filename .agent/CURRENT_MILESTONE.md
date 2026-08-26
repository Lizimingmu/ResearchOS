# Current Milestone — M016 v0.12.0 Release

Execution status: **BACKGROUND COMPLETE — CODEX ACCEPTED; FOREGROUND PERMISSION PENDING**.

## Objective

Build a reproducible v0.12.0 Windows release candidate containing the accepted M015 Personal Content Studio, with complete background regression evidence and truthful release metadata.

## Authorized now

- Background source/version/documentation edits.
- Deterministic frontend/Rust/audit/headless checks.
- Non-interactive production compilation, packaging, copying and SHA256 calculation.
- Project-local or temporary fixtures only.

## Not authorized in this phase

- Launching ResearchOS or an installer.
- Foreground UI automation, screenshots, focus/input/window/display control.
- Real Obsidian Vault or production ResearchOS data access.
- Scientific content changes or status promotion.
- Git operations by OpenCode.

## Accepted background gate

OpenCode completed M016-01…04. Codex accepted the diff, version declarations, reports and artifact hashes in M016-05. Candidate source tag: `v0.12.0-rc1`.

## Remaining optional release check

Before any packaged-app foreground smoke, request current user permission with the executable, duration, input/focus actions and isolated data directory. Without permission, retain `FOREGROUND UI — NOT RUN` and do not launch anything.
