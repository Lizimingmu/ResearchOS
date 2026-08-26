# OpenCode Handoff — No Active Implementation Task

M015 Personal Content Studio is complete and Codex accepted. Stop; do not continue implementation, packaging, Git operations, foreground testing or real Obsidian access without a new milestone handoff.

The canonical accepted state is recorded in `.agent/PROJECT_STATE.md`, `.agent/CURRENT_MILESTONE.md` and `.agent/REVIEW_RESULT.md`.

---

# Archived M015 Execution Handoff

## Start here

Project: `D:\Agents\ResearchOS`

Use the currently configured `opencode-go/deepseek-v4-pro`. Read only:

1. `AGENTS.md`
2. `.agent/OPENCODE_HANDOFF.md`
3. `.agent/TESTING_POLICY.md`
4. `.agent/PRODUCT_CONSTITUTION.md`
5. `.agent/SCIENTIFIC_GATES.md`
6. `.agent/M015_PERSONAL_CONTENT_STUDIO_PLAN.md`
7. `.agent/M015_RUN_STATE.json`

Do not reread historical master prompts or rescan unrelated repository areas. Continue from Codex checkpoint `7c65c9d` on branch `codex/m015-personal-content-studio`. Do not run Git; Codex owns commits and review.

## Current verified state

- Baseline checkpoint: `62fab14` (`v0.11.0 before M015`).
- Current implementation checkpoint: `7c65c9d` (`personal content studio core`).
- State schema is now 4; SQLite user version remains 2 because canonical JSON state stays in the existing transactional database.
- Added portable content kinds, stable keys, revisions, SHA-256, dependency closure, review-pack construction, personal overlay entities, lifecycle, optimistic patch application, history and rollback.
- Added Chinese `内容工作台` navigation and initial `内容库 / 草稿 / 待审核 / 发布箱 / 版本历史 / 冲突` UI.
- Draft and pending content remain outside effective learning content. Explicit private activation does not promote `verificationStatus`.
- Current background test result: `npm run test:unit` PASS, 56/56.
- No scientific seed text was added or promoted. The 166-card external corpus remains untouched and quarantined.

Directly related files: `src/domain/contentStudio.ts`, `src/services/contentStudio.ts`, `src/services/contentInventory.ts`, `src/state/migrations.ts`, `src/state/store.ts`, `src/features/content-studio/ContentStudioView.tsx`, `src/services/desktop.ts`, `src-tauri/src/lib.rs`, and `tests-node/suite.mjs`.

## Execute in bounded stages

Complete one stage, run focused tests, update `.agent/M015_RUN_STATE.json` and `.agent/IMPLEMENTATION_REPORT.md`, then continue. If interrupted, resume the first incomplete stage from those reports. Do not ask the sleeping user routine implementation questions; stop only for a real safety, scientific, or product ambiguity.

### Stage A — Finish M015-01 inventory and review-pack export

- Harden inventory duplicate/dependency/provenance validation and deterministic audit output.
- Export selected objects plus dependency closure as exactly `manifest.json`, `content.json`, `REVIEW_COPY.md`, `SCIENTIFIC_CHANGESET.md`, `dependencies.json`.
- Add explicit user-triggered export from 内容工作台; default destination is outside any Obsidian vault.
- Unknown IDs, dependency cycles, duplicates, missing evidence and unsafe paths fail with zero writes.
- Do not change scientific text or verification status.

### Stage B — Finish M015-02/M015-03 personal maintenance

- Complete create-from-template, duplicate, edit, filter and detail editor for supported content kinds.
- Add deterministic validation results, evidence gaps and dependency impact.
- Add patch JSON selection, dry-run field diff, stale-base conflict, all-or-nothing apply, version comparison and rollback UI.
- Built-in objects remain immutable; revisions use overlay records. Old revisions remain resolvable.
- Draft/archive/deprecated/superseded items never leak into Today, Review, search or publishing.
- High-risk or AI-generated scientific changes remain pending. Private activation may make pending material available locally but must display pending and never claim verification.

### Stage C — M015-04 curated Obsidian publisher

- Add dedicated-subfolder configuration. Connection validation is read-only and creates or modifies no file.
- Implement internal outbox, exact create/update/conflict/unchanged preview, default 20-note limit and confirmation token.
- Permanent notes use stable `researchos_id`, revision/status/hash frontmatter and one managed block. Preserve all bytes outside the managed block.
- Repeated unchanged publish writes nothing; title rename follows stable ID; edited managed blocks produce conflicts and zero writes.
- Rust filesystem commands must prove resolved containment inside the configured subfolder, reject traversal, symlink/junction escape, `.obsidian`, Unicode/case collision and unexpected targets, then use atomic temporary-file replacement.
- Tests use only the exact fake-vault root from `M015_RUN_STATE.json`. Never discover or access a real vault.

### Stage D — M015-05 optional finite review round trip

- Export only an explicitly confirmed `_Review/<batch-id>` manifest and selected notes.
- Read back only paths listed in that exact manifest after an explicit check action.
- Convert managed edits or `审核意见` annotations into pending patch candidates and dry-run diffs.
- No watcher, automatic pull, merge, publish, delete, cleanup or status promotion.

### Stage E — Regression and handoff

- Add deterministic M015 audits for schema, SHA-256, duplicates, provenance, dependency closure, lifecycle leakage, patch atomicity/rollback and Obsidian zero-write/containment/idempotency.
- Run typecheck, full frontend suite, source-pack, Problem Atlas, staging, content, localization, performance, startup, seed and handoff gates.
- If Rust changes, run configured `cargo test`; no network retry loop. Do not package.
- Update `.agent/IMPLEMENTATION_REPORT.md`; update `.agent/SCIENTIFIC_CHANGESET.md` only if actual scientific content changed (expected: none).
- Stop with `M015_RUN_STATE.runStatus = awaiting_codex_review`.

## Non-negotiable boundaries

- Background-only. Do not launch ResearchOS, Tauri dev, installer, Obsidian, browser, or any visible window.
- Do not control mouse, keyboard, focus, DPI, displays, clipboard, user processes or operating-system settings.
- Do not inspect, discover, read or write a real Obsidian vault or personal file. Use only the project-local fake vault.
- Do not run Git, package, push, resume M012, or alter v0.11.0 release binaries.
- Do not touch, classify or import the quarantined 166 external cards.
- Do not generate scientific teaching content, fabricate citations or promote pending content.
- Never weaken a gate, silently overwrite, truncate, auto-merge, reset data or claim an unrun check passed.

## Required report format

Record changed files, implemented behavior, focused/full commands and exact failures. Separate:

- `BACKGROUND AUTOMATED — PASS/FAIL`
- `HEADLESS/OFF-SCREEN — PASS/FAIL/NOT RUN`
- `FOREGROUND UI — NOT RUN`
- `USER-MANUAL — NOT RUN`

Stop after reports and wait for Codex diff/scientific review.
