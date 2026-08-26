# Current Milestone — M016 v0.12.0 Release

Execution status: **ACTIVE — SPECIFIED FOR OPENCODE**.

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

## Gate sequence

OpenCode M016-01…04 → Codex diff/artifact review → explicit user permission request for any packaged-app foreground smoke → final release decision.
