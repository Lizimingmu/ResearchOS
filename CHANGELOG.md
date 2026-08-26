# ResearchOS changelog

*Versioned product, learning-engine, scientific-content, and release changes.*

---

## 🇨🇳 0.12.0 — 2026-08-26

### Changed

- Added the Personal Content Studio (内容工作台): 内容库 / 草稿 / 待审核 / 发布箱 / 版本历史 / 冲突 views with Chinese-first lifecycle management for personal additions.
- Versioned personal content: stable IDs, revisions, SHA-256 hashing, dependency closure, deterministic review-pack export (manifest / content / REVIEW_COPY / SCIENTIFIC_CHANGESET / dependencies), and a hardened safe-path + atomic-write filesystem gateway (Rust) that refuses traversal, symlink/junction escape, `.obsidian`, Unicode/case collisions, and writes only inside explicitly confirmed batches.
- Built-in content is now revisable through tracked overlays: create-from-template, duplicate, edit, filter, detail editor with deterministic validation (evidence gaps, dependency impact), patch-pack import with dry-run field diffs, stale-base conflicts, all-or-nothing atomic apply, version comparison and rollback. Built-in baselines stay read-only; app upgrades surface `base_update` conflicts instead of picking winners.
- Explicit curated Obsidian publishing: read-only connection validation for one dedicated subfolder, exact create/update/conflict/unchanged preview, default 20-note limit with second confirmation, confirmation tokens, managed blocks that preserve user text byte-for-byte, idempotent republish (unchanged revisions write nothing), rename tracking by stable ID, and finite `_Review/<batch-id>` round trips that convert annotations into pending patch candidates. No watcher, no automatic pull/merge/publish; connecting or previewing never writes files.
- Draft/pending/archived/deprecated/superseded personal items never leak into Today, Review, search or publishing. Local private activation keeps the 待核验 status — activation and scientific verification remain two independent actions, and patches can only ever produce draft/pending_review + pending material.
- State schema advances to v4 (personal overlay collections); SQLite `user_version` stays 2. Migrations preserve existing user data.

### Validation

- Frontend unit suite 88/88 including M015 regression coverage (lifecycle leakage guards, optimistic locking, stale-conflict zero mutation, CRLF byte preservation, timezone-offset bounds, calendar-date rejection).
- Rust tests 27/27 covering vault containment (traversal/symlink/junction), overflow-as-error, case/Unicode collision refusal, fault-injected cross-file rollback, and review round-trip gates on isolated temp fixtures plus the project-local fake vault.
- Deterministic M015 audit gate (31 checks) and all prior QA gates pass in background mode.

## 🇨🇳 0.11.0 — 2026-08-25

### Changed

- Added the Research Problem Atlas (科研常见问题库): eight diagnostic training modes, deterministic search, source registry, evidence-claim mapping, knowledge versioning and transactional source-pack import with dry-run gating.
- Added a Chinese-first five-minute first-run tutorial (Today → Problem Atlas → pending-evidence status → lock-before-feedback → Review), skippable and restartable from Settings, keyboard-navigable, with isolated preview exercises that never write learning records.
- Hardened the source-pack importer: exception-safe structured validation, two independent gates (structural vs scientific completeness), CSV/Markdown oversize rejection, identical-import gate fix, and an auditable legacy→v3 staging converter. The 166 external legacy cards remain `unclassified` and import-ineligible.
- Sequential diagnostic engine now validates path-node identity/order and evidence ownership against the actual diagnostic path, with baseline-before-reveal history.
- Corrected pending demo content (temporal validation, leakage learn-and-lock, single-cell units, Codex-reviewed authority tiers) and pending-claim support display (拟…· 待核验).

### Validation

- 50/50 frontend tests; source-pack, Problem Atlas, staging (63/63), content, localization, performance and startup gates pass.
- Rust tests pass; state schema 3 / SQLite user_version 2 unchanged.
- Packaged-app regression (user-approved session): v0.10.2 fixture migrates to schema 3; tutorial auto-open, keyboard navigation, 完成 completion persisted (`tutorialCompletedAt`), Settings reopen, Esc close with focus restoration, compact 1080×700 layout and the startup-recovery gate verified visually; found and fixed a React #185 crash on Problem Atlas navigation (unstable zustand selectors), artifacts rebuilt and re-hashed; post-fix atlas navigation and the in-app restore leg remain pending the next approved session per `.agent/TESTING_POLICY.md`.
- Backup/export → restore/import round trip verified byte-identical on isolated database copies; command-level behavior covered by Rust tests.

## 🇨🇳 0.10.2 — 2026-08-24

### Changed

- Localized all application chrome, workflow controls, onboarding, empty states, settings, diagnostics, persistence notices, and startup recovery into Simplified Chinese.
- Added Chinese display mappings for persisted enum values while retaining the existing schema and stored values.
- Preserved scientific source titles, identifiers, and verified source material in their original language.

### Validation

- Updated render and startup smoke assertions for the Chinese interface; all 20 frontend tests and 7 Rust tests pass.
- Re-ran content and performance release gates and rebuilt the standalone executable and NSIS installer.

## 🩹 0.10.1 — 2026-08-24

### Fixed

- Replaced `process.env.NODE_ENV` at bundle time so the browser/WebView package no longer references Node's missing `process` global. This was the root cause of the v0.10.0 blank startup window.
- Guarded system-theme detection when `window.matchMedia` is unavailable.
- Added a static startup shell, resource/error watchdog, and React error boundary so a future startup failure is visible instead of becoming a white screen.
- Switched asset references to relative Tauri-safe paths.

### Validation

- Added a production-bundle smoke test that removes both Node `process` and WebView `matchMedia`, then requires onboarding render and initial-state hydration.
- Added a release assertion that `process.env.NODE_ENV` cannot remain in the generated bundle.
- Reduced initial JavaScript to 663,763 bytes by eliminating React development branches.

## 🚀 0.10.0 — 2026-08-24

### Added

- First-run orientation, research-focus setup, familiarity capture, and a blind three-case baseline assessment.
- Explicit draft autosave, misconception records, unfamiliar review variants, rubric-scored assessment runs, and bounded SQLite recovery snapshots.
- Evidence-bounded optional AI critique with task-specific prompts and strict JSON parsing after the learner locks an answer.
- Global cross-workspace search, System Health diagnostics, and JSON/CSV/Markdown learning exports.
- Content and performance release gates plus scientific, UX, learning-engine, and improvement-loop audit reports.
- 41 deep method specifications, 54 additional judgment cards, 25 additional AI-audit cases, seven additional research patterns, and 26 verified evidence sources.

### Changed

- Today now schedules five highest-value tasks using weakness, project relevance, review due state, misconception risk, and difficulty-aware variety.
- Skill evidence requires at least three observations across two concepts and reports reliability and last-tested context.
- Initial JavaScript fell from 2,925,687 to 1,852,793 bytes by lazy-loading Paper Lab, global search, and expanded training content.
- State and database schemas moved from v1 to v2 through non-destructive migrations.

### Fixed

- Calibration is idempotent, so one response cannot create duplicate evidence, reviews, or misconceptions.
- High-confidence wrong answers now create explicit misconceptions and remain unresolved until a correct unfamiliar variant.
- Audit responses now obey the same answer-lock and calibration path as other practice surfaces.
- Assessment completion no longer inflates mastery merely because a case was opened or submitted.
- Persistence failures are visible; pre-save snapshots remain bounded to five.

### Release

- Windows standalone executable and current-user NSIS installer rebuilt as v0.10.0.
- v0.9.0 artifacts remain intact for rollback.

## 📦 0.9.0

- First formal Windows desktop release with the local-first ResearchOS workspace, SQLite persistence, Paper Lab, deliberate-practice flows, provenance-bearing seed content, and optional AI review.
