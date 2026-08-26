# ResearchOS changelog

*Versioned product, learning-engine, scientific-content, and release changes.*

---

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
