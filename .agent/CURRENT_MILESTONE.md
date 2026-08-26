# Current Milestone — M015 Personal Content Studio

Execution status: **IN PROGRESS — handed to OpenCode from Codex checkpoint `7c65c9d`**.

## Outcome

Make ResearchOS easy to extend and revise for one private user while keeping its database canonical. Obsidian is an explicit curated publish/review surface, never an automatic event sink or second database.

## Current checkpoint

- Baseline `62fab14`; core implementation `7c65c9d`.
- State schema 4 / SQLite user version 2.
- Portable inventory, SHA-256, personal lifecycle, patch/history/rollback core and initial Chinese content workbench implemented.
- `npm run test:unit`: 56/56 PASS.

## Remaining

Finish review-pack file export, full editor and patch UI, curated Obsidian publish, optional finite review round trip, deterministic audits and full background regression. Exact execution instructions are in `.agent/OPENCODE_HANDOFF.md`.

## Boundaries

Background-only; fake vault only; no Git by OpenCode; no packaging; no new/promoted scientific content; no M012; no change to the quarantined 166-card corpus.
