# Implementation Report

Status: COMPLETE — awaiting Codex review
Task IDs: M013-01 through M013-07; M013-10; M013-09 + M013-10R (final patch); M013-11R (micro-patch); M013-11R2 (metadata patch); M014-01 (tutorial); M014-02 (release candidate — background work complete, interactive smoke paused per `.agent/TESTING_POLICY.md`)
Agent/model: OpenCode / DeepSeek V4 Pro
Approved product baseline: 441ece1

## Changed files

New modules:

- `src/domain/problemAtlas.ts` — normalized domain types: Source Registry (`EvidenceSourceReg`), `EvidenceClaim`, `ProblemCard`, `DiagnosticCause/Check/Path/PathNode/Evidence`, `ProblemTrainingCase`, `DiagnosticSession` (+ steps), `SourcePackDocument`, `SourcePackImportRecord`, `ProblemSearchLogEntry`, `AtlasCollectionState`.
- `src/problem-atlas/search.ts` — deterministic search (Chinese/English/abbreviation/alias/keyword/substring/fuzzy Levenshtein fallback, filters, deterministic ordering, related-concept suggestions, no LLM fallback).
- `src/problem-atlas/diagnosticEngine.ts` — pure state transitions: session creation, one-time lock per judgment, append-only sequential history, deterministic grading for all eight modes, `modeSkillId`, far-transfer prompt builder.
- `src/problem-atlas/labels.ts` — Chinese-first labels for modes, layers, knowledge/verification badges, tiers, verdicts, atlas domains.
- `src/services/sourcePack.ts` — JSON/CSV/Markdown-frontmatter parsers with size bounds; schema/enum/ID/FK/duplicate-DOI-PMID-title/claim-hash/version-cycle/status-transition validation; deterministic content hashing; dry-run report; transactional apply with rollback; idempotency per pack ID + content hash.
- `src/data/problemAtlas.ts` — small pending demo source pack (`problem-atlas-demo-v1`): 8 registry sources mirroring existing verified seeds, 11 pending claims, 4 ProblemCards (pseudoreplication/unit, biological-vs-technical replication, data leakage, internal-vs-external validation), 15 causes, 15 checks, 4 paths, 12 evidence items, 32 pending training cases (8 modes × 4 cards).
- `src/features/problem-atlas/ProblemAtlasView.tsx` — Chinese-first search entry (“我遇到了什么问题？”), filters, badges, unmatched-query record, card detail, claim/related-entity links, eight-mode tabs.
- `src/features/problem-atlas/DiagnosticSessionView.tsx` — interactive eight-mode sessions with lock-before-feedback, sequential evidence reveal + locked ranking history, calibration → `recordCalibration` (misconception/far-transfer review).
- `scripts/source-pack-audit.mjs`, `scripts/problem-atlas-audit.mjs` — deterministic validators; JSON artifacts + Markdown reports; nonzero exit on errors.

Modified:

- `src/domain/types.ts` — `ReviewItem.conceptType` + `"problem"`; `ViewId` + `"problem-atlas"`; `DailyTask.type` + `"problem"`; `AppStateData` + 11 atlas collections; `ContentOrigin` + `"external_source_pack"`.
- `src/state/migrations.ts` — `CURRENT_STATE_SCHEMA = 3`; v1/v2→v3 merge preserving user data; future-schema rejection unchanged.
- `src/state/store.ts` — atlas state slices seeded through the real import pipeline; `selectProblem`, `updateDiagnosticSession`, `recordProblemSearch`, `dryRunSourcePack`, `confirmSourcePackImport`.
- `src/app/App.tsx` — lazy route `problem-atlas`; `src/app/navigation.ts` — nav entry with key `0` (existing shortcuts unchanged); `src/i18n/index.ts` — `nav.problemAtlas` zh/en.
- `src/components/GlobalSearchResults.tsx` — Problem Atlas results via the deterministic engine; `src/components/CommandPalette.tsx` — atlas commands + per-problem commands.
- `src/learning/scheduler.ts` — at most one `problem` task per day, inserted before transfer, never displacing due review (retrieval stays first).
- `src/learning/scoring.ts` — five new Skill Map dimensions (Troubleshooting, Failure-mode Recognition, Scientific Diagnosis, Evidence Discrimination, Claim Calibration).
- `src/ai/reviewArchitecture.ts` — `problem` review directive; `src/features/review/ReviewView.tsx` — problem reference resolver + skill mapping; `src/features/today/TodayView.tsx` — problem dispatch.
- `src/features/settings/SettingsView.tsx` — inventory counts (cards/registry sources/claims).
- `src/app/localization.ts` — `problem` task label; `src/styles/app.css` — atlas workspace styles.
- `scripts/localization-audit.mjs` — fixed the two pre-existing wrong navigation keys (`nav.methods`→`nav.methodLab`, `nav.skills`→`nav.skillMap`), added `nav.problemAtlas` and the two new UI files.
- `scripts/performance-audit.mjs` — state fixture v3 + new empty collections; `scripts/export-seed.mjs` — exports `data/problem_atlas/source_pack.json`.
- `tests-node/suite.mjs` — 39 tests (18 new M013 tests incl. M013-10 regression; Today queue expectations updated for the bounded problem slot).
- `package.json` — `audit:source-pack`, `audit:problem-atlas`, `test:atlas`, `staging:audit` scripts.

## M013-10 changed files

New modules:

- `src/services/legacyStaging.ts` — deterministic, auditable legacy→v3 staging converter: snake_case→camelCase maps, explicit enum lookup tables (importance critical/high/medium→5/4/3; frequency very_common/common→4/3), verbatim scientific text, `contentOrigin: external_source_pack`, `problemType: unclassified` (never inferred), source dedup (canonical ID = lexicographically smallest; DOI/PMID/normalized-title merge groups with full disclosure), claim `sourceId` FK rewrites, metadata demotion (`metadata_verified`/`claim_verified` → `pending`, `verifiedAt/verifiedBy` dropped), exact Codex-approved metadata patches (DESpace URL, six formal-title corrections from `M013_SOURCE_METADATA_AUDIT.md`), per-row staging audit meta (stagedMissing/droppedFields/fieldMap/converterSupplied/converterNotes), staging structural validator, `dryRunStagingPack` with registry-conflict disclosure.
- `scripts/m013-staging.mjs` — M013-10 deterministic QA gate: SHA256 preservation check of the 8 untouched legacy packs, exception-safe structured rejection of all 8 originals (no crash), corpus conversion, per-pack staging structural/collision/dry-run checks, exact-count contract assertions, writes `artifacts/m013-v3-staging/*` and `.agent/M013_V3_STAGING_REPORT.{md,json}`; nonzero exit on any contract failure.

Modified:

- `src/services/sourcePack.ts` — exception-safe hardened `validateSourcePackUnknown` (total function over arbitrary JSON; structured failures with code+location; FIELD_OVERSIZE/ROW_MISSING_ID/COLLECTION_NOT_ARRAY etc.), `parseSourcePackJsonSafe`, two independent gates (`evaluateScientificCompleteness`: `scientifically_complete | scientific_patch_required`, per-problemType rules with no global “candidate causes ≥ 3” rule), `dryRunSourcePack` returns `scientificCompleteness` + `importEligible` (conflicts and rejected rows block eligibility), `applySourcePackImport` rejects every import-ineligible document before mutation.
- `src/domain/problemAtlas.ts` — `ProblemType` (`diagnostic | judgment | audit` + staging-only `unclassified`), `problemType` on `ProblemCard`, `ScientificCompletenessReport`/`CompletenessGap`, staging entity types (`StagingSource/Claim/ProblemCard/Cause/Check/Path/PathNode/Evidence/TrainingCase`), `StagingRowMeta`, `LegacyStagingPack`, `LegacyCorpusAudit/Conversion`, `StagingSourceMerge`, `StagingForeignKeyRewrite`.
- `src/data/problemAtlas.ts` — demo cards declare `problemType: "diagnostic"` (they were authored as diagnostic cards in M013-05); demo pack remains structurally valid, scientifically complete and import-eligible, so seeding still flows through the real import pipeline.
- `scripts/source-pack-audit.mjs` — hardened-validator exception-safety probes, two-gate separation checks, unclassified/import-eligibility checks, safe parser checks.
- `data/problem_atlas/source_pack.json` — regenerated seed export (includes `problemType`).

## M013-09 + M013-10R changed files (final patch)

Modified:

- `src/services/sourcePack.ts` — `parseCsvLine`/`parseCsv`/`parseMarkdownFrontmatter` now deterministically reject oversize fields/bodies (`SourcePackParseError` with `CSV_FIELD_OVERSIZE`/`MARKDOWN_BODY_OVERSIZE` codes; never truncate); `dryRunSourcePack` noop shortcut now evaluates the scientific gate (`importEligible` stays false for `scientific_patch_required`/`unclassified` documents even when a matching import record exists); `applySourcePackImport` rejects them without mutation.
- `src/state/store.ts` — `confirmSourcePackImport` uses `allowUpdates: false` (never silently forces updates; seed path unchanged).
- `src/problem-atlas/diagnosticEngine.ts` — `lockSessionStep` validates session/input mode match, per-mode allowed step kinds, sequential order (baseline ranking with `baseline: true` before the first reveal, ranking after each reveal, no consecutive reveals/double baseline) and error-localization payload (exactly five unique valid layers); `gradeAiVerdict` requires exactly every expected statement ID, rejects unknown IDs and scores omissions as incomplete; `gradeErrorLocalization` treats duplicate/incomplete rank lists as incomplete; `gradeSequential` counts the baseline separately and completes only after every node's post-evidence ranking.
- `src/features/problem-atlas/DiagnosticSessionView.tsx` — sequential mode now locks the baseline ranking before any evidence reveal; displays evidence-before/evidence-after ranking history with moved-cause annotations (原第 N 位 → 第 M 位); error-localization rank picker disables already-used ranks and explains duplicate-rank errors.
- `src/features/settings/SettingsView.tsx` — minimal explicit source-pack import flow: choose JSON/CSV/Markdown → local parse with deterministic rejections → dry-run report (inserts/updates/conflicts/rejected rows/errors/completeness) → confirmation enabled only with zero errors/conflicts/rejected rows, zero updates and scientific eligibility → transactional apply; parse errors surface with code/location.
- `src/problem-atlas/labels.ts` — Tier B labels renamed 技术参考 → 专业/技术来源 (`tierLabel`/`evidenceBadgeLabel`); added `sourceTypeLabel` (guideline → 指导方针 etc.).
- `src/features/problem-atlas/ProblemAtlasView.tsx` — pending claims display proposed support (`拟直接支持 · 待核验` style, all five support types) instead of unqualified support; source type is shown separately next to the source title.
- `src/data/problemAtlas.ts` — exact REVIEW_RESULT M013-05 scientific corrections, all remaining `pending`: temporal validation (random split internal; same-centre later independent patients = temporal/external-in-time with limited geographic transportability) across card context/boundary/implications, `pa-val-check-origin`, `pa-val-path` nodes, `pa-val-ev-origin` and `pa-val-case-boundary`; leakage learn-and-lock parameter rule (removed the “overall statistics are safe” sentences) across `pa-claim-leakage-ops`, `pa-leakage-cause-imp`, bioinformaticsImplication and `pa-leakage-case-ai`; single-cell observation-level vs experimental-unit distinction and pseudobulk-as-one-option in `pa-claim-patient-unit`, `pa-pseudorep-cause-cells`, `pa-claim-pseudobulk`; Codex-reviewed authority-tier mapping (TRIPOD/TRIPOD+AI/PROBAST → S, `pa-src-internal-validation`/`pa-src-pseudobulk` → A, `pa-src-pseudorep`/`pa-src-leakage`/`pa-src-calibration` → C) with updated registry provenanceNote; sequential rubric “患者应排在首位” → the actual candidate explanation.
- `scripts/source-pack-audit.mjs` — registry tier check now asserts the Codex-reviewed mapping; added CSV-oversize rejection, identical-import noop gate and apply-rejection checks.
- `scripts/problem-atlas-audit.mjs` — sequential engine test follows the baseline-first protocol; added checks for cross-mode submission, illegal step kinds/transitions, partial/extra/unknown AI verdicts, duplicate/incomplete rank lists and baseline→post-evidence history.
- `tests-node/suite.mjs` — 44 tests (5 new: CSV oversize rejection, identical-import noop gate, sequential illegal transitions/cross-mode, strict AI-verdict grading, duplicate layer ranks; the sequential history test updated to the baseline protocol).
- `src/styles/app.css` — minimal styles for the source-pack import panel.
- `data/problem_atlas/source_pack.json` — regenerated seed export with the corrected pending content and tiers.

## M013-11R changed files (micro-patch)

Modified:

- `src/problem-atlas/diagnosticEngine.ts` — sequential validation is now path-aware: `lockSessionStep(session, input, now, path)` validates reveals against the actual `DiagnosticPath` (only the next unrevealed node; unknown/reordered/repeated nodes rejected; evidence IDs must belong to that node's `availableEvidenceIds`, no duplicates/fabrication; the following ranking must reference the immediately preceding reveal's node and cannot be re-submitted); the no-path fallback still enforces the baseline→reveal→ranking pattern plus reveal/ranking node matching; `gradeSequential` completes only when every unique ordered path node has been revealed and has exactly one valid post-reveal ranking (raw ranking counts no longer count).
- `src/features/problem-atlas/DiagnosticSessionView.tsx` — sequential locks pass the diagnostic path into the engine.
- `src/data/problemAtlas.ts` — temporal-validation consistency (all pending): random split reported as internal; locked-model later non-overlapping independent same-centre patients reported separately as temporal validation; "same centre" alone removed from red flags (replaced by temporal overlap/model-not-locked and geographic/clinical overclaiming); "external = new source only", "downgrade to internal", "最多构成" and "仅能声明内部性能" wording removed; bounded answer rewritten to the report-internal + report-temporal-separately substance; new pending claim `pa-claim-temporal-validation` linked to the card/check/evidence; new pending A-level methods source `pa-src-altman-validation` (BMJ 2009, `10.1136/bmj.b605`, PMID 19477892) added per Codex instruction, unverified.
- `scripts/source-pack-audit.mjs` — Codex-added pending source allowlist (`pa-src-altman-validation` must stay pending and Tier A; exempt from seed-mirror requirement); tier mapping includes the new source.
- `scripts/problem-atlas-audit.mjs` — sequential engine checks now pass the path; added direct regressions for fake path node, out-of-order node, fabricated evidence, mismatched reveal/ranking node, repeated node and unique-node-coverage completion.
- `tests-node/suite.mjs` — 45 tests (1 new strict path-integrity test incl. completion-by-node-coverage).
- `data/problem_atlas/source_pack.json` — regenerated seed export with the corrected temporal content, new claim and new pending source.

## M014-01 changed files (tutorial)

New modules:

- `src/components/Tutorial.tsx` — Chinese-first five-step tutorial panel (今日学习 → 科研常见问题库 → 待核验证据状态 → 先锁定再反馈 → 复习与迁移), about five minutes, using existing pending demo content only. Compact bottom-right guided panel (not a blocking modal, not chat-like): Skip/Back/Next/Finish controls, step progress list, keyboard navigation (← 上一步, →/Enter 下一步, Esc 跳过), focus management (panel focus on open, focus restoration on close), Escape/close behavior, reduced-motion CSS. The Human-First step runs a preview lock exercise in isolated local state via the pure engine (`createDiagnosticSession`/`lockSessionStep`/`gradeSession`) — it never touches the store, so no responses/reviews/misconceptions/calibration/scheduler/import records are written. Exports `TUTORIAL_STEPS`, `TUTORIAL_STEP_LABELS` and pure `tutorialStepFromKey` for deterministic testing.

Modified:

- `src/domain/types.ts` — `OnboardingState` + optional `tutorialCompletedAt`/`tutorialSkippedAt` (no schema bump).
- `src/state/store.ts` — `tutorialOpen` UI state; `openTutorial`/`skipTutorial`/`completeTutorial` actions with persistence; auto-open decision via pure `shouldAutoOpenTutorial` applied in `hydrate` and after `completeOnboarding`; skip after completion is a no-op; `resetDemo` resets tutorial state.
- `src/app/App.tsx` — renders `<Tutorial />` alongside the palette/toast.
- `src/features/settings/SettingsView.tsx` — 常规设置 gets “重新打开新手教程” with the isolation note.
- `src/styles/app.css` — tutorial panel styles (focus-visible outline, responsive width, `prefers-reduced-motion` disable rule).
- `scripts/localization-audit.mjs` — `src/components/Tutorial.tsx` added to the UI denylist scan.
- `tests-node/suite.mjs` — 50 tests (5 new: auto-open decision, keyboard navigation bounds, skip/complete persistence with zero learning-state mutation, first-run visibility + skip persistence + restart via hydrate, panel render incl. final-step Finish control and no chat affordance).

## M014-02 changed files (release candidate)

Modified:

- `src/state/store.ts` — restored the three accidental line-join formatting changes (`emptyAtlasCollections`, `createInitialState`, `schedulePersist`) with no behavioral change.
- `src/components/Tutorial.tsx` — Today wording calibrated to scheduler behavior: one highest-priority due/high-risk retrieval slot is protected; remaining due items stay in weighted scheduling rather than each becoming a Today card.
- Version declarations `0.10.2` → `0.11.0`: `package.json`, `package-lock.json` (root + package), `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.lock` (`researchos` entry only), `src-tauri/src/lib.rs` (HTTP user-agent), `src/components/AppShell.tsx` (sidebar), `src/features/settings/SettingsView.tsx` (backup default filename + system note).
- `CHANGELOG.md` (0.11.0 entry), `README.md` (v0.11.0 sections + artifact names).

### M014-02 release-regression defect fix (found in packaged-app smoke)

- **React #185 maximum-update-depth crash on Problem Atlas navigation** (reproduced twice in the packaged app; diagnostic captured in `.smoke-v0110/shots/32-sessionB-recovery-details.png`): two zustand selectors returned a fresh array on every read — `DiagnosticSessionView.tsx` (`state.diagnosticCauses.filter(...)`, crashed on every Problem Atlas navigation) and `ReviewView.tsx` (`state.reviewLogs.filter(...)`, same defect class). Both replaced with stable raw-array selection + `useMemo` filtering; `rg` confirms no remaining unstable selectors of this shape. The latent bug was invisible to SSR tests (single render) and only manifests in live reactive rendering — exactly what the packaged regression exists to catch.
- Artifacts rebuilt and re-hashed after the fix (see artifact list below); frontend suite re-run 50/50.
- The packaged startup-recovery gate worked as designed during reproduction: bounded failure message, database not reset, one-click restart recovered the workspace.

New release artifacts (rebuilt after the regression fix; unsigned):

- `release/ResearchOS_0.11.0_x64.exe` — 15,425,024 bytes — SHA256 `A6EA2C32E655D9C01C5B9F1BAA99D8580E80CCDB49524561AA032ACF8A731C4B`
- `release/ResearchOS_0.11.0_x64-setup.exe` — 5,174,334 bytes — SHA256 `566BF756B3D96C4E555F1EC40F0FD8D2879A79D30893062E78F5AE9C25D7D417`
- `release/SHA256SUMS.txt` (v0.11.0 lines replaced with post-fix digests), `release/BUILD_METADATA_v0.11.0.json`, `release/RELEASE_NOTES_v0.11.0.md` (Chinese, includes the regression-fix note), `release/README.md` (current-release pointer).

Build commands (recorded): frontend `npm run build`; Rust `cargo test --manifest-path src-tauri/Cargo.toml` with `CARGO_HOME=<repo>\.cargo-home`, `CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse`, `CARGO_REGISTRIES_CRATES_IO_INDEX=http://127.0.0.1:18765/index/` while `node scripts/cargo-proxy.mjs` served the crates index; packaging `npm run tauri:build` (release profile 2m27s; NSIS `makensis`).

### M014-02 test reporting (per `.agent/TESTING_POLICY.md`)

- `BACKGROUND AUTOMATED — PASS`: 50/50 frontend tests (`npm test`), source-pack audit 0/0, Problem Atlas audit 0/0, staging gate 63/63, content audit 0 errors/1 pre-existing warning, localization audit 11 checks, performance audit 868,251 bytes initial JS (budget 1.9 MB), startup smoke, seed export, agent-handoff validator, `cargo test` 7/7, NSIS packaging.
- `HEADLESS/OFF-SCREEN — PASS`: isolated-copy database verification of the packaged-app smoke data (`.smoke-v0110/verify/`): `PRAGMA user_version = 2`, `integrity_check ok`, payload `schemaVersion: 3`, `onboarding.completed: true`, tutorial timestamps absent (consistent with the interrupted session state), and zero tutorial-written learning records (responses/misconceptions/reviewLogs/skillEvidence/diagnosticSessions all 0; reviewItems=1 is the built-in seed; sourcePackImports=1 is the demo seed). v0.10.2 fixture created at `.smoke-v0110/data-b/researchos.sqlite3` (schemaVersion 2 payload, representative project/response/reviewItem, no tutorial fields, `user_version = 2`, integrity ok). File-level backup/export → restore/import round trip on isolated copies (`.smoke-v0110/backup-roundtrip.py`, mirroring `export_backup_inner`/`import_backup_inner`): payload byte-identical, record counts identical, integrity ok, `user_version = 2`.
- `FOREGROUND UI — PARTIAL (user-approved session, screenshots 20–32 in .smoke-v0110/shots/)`: VERIFIED — v0.10.2 fixture (schemaVersion 2, user_version 2) loads with frontend migration to schema 3 and seeded atlas (problem task in Today queue); tutorial auto-opens on the migrated state; keyboard →×4 reaches step 5; 完成 click closes the panel and persists `tutorialCompletedAt = 2026-08-25T13:44:40Z` (verified read-only in a DB copy; fixture project/response preserved; schema 3; user_version 2); Settings → 重新打开新手教程 reopens the panel; Esc closes it and focus is restored visibly to the launch button; compact window 1080×700 (2160×1400 physical) renders without blank/overlap; startup-recovery gate works (bounded message, DB not reset, one-click restart). FOUND+FIXED — React #185 crash on Problem Atlas navigation (see defect section); post-fix atlas navigation in the packaged app NOT VISUALLY VERIFIED (instance closed for the rebuild; next approval needed). NOT RUN — Today-nav capture post-recovery, in-app backup/restore UI leg (session C), restart-persistence visual confirmation after restore.
- `USER-MANUAL — NOT RUN`: checklist offered to the user (first launch, tutorial skip/finish/reopen, keyboard/focus restoration, normal + compact window, navigation, restart persistence, backup/restore in the packaged app).

Isolation record (approved session): instance 1 PID 23448 on `.smoke-v0110\data-b` — closed by exact PID after a fixture defect was identified (the fixture had set `user_version = 2` without applying the 0002 migration, so `state_snapshots` was missing and saves failed; the fixture was corrected to match a real v0.10.2 database — test-fixture bug, not an app bug). Instance 2 PID 14188 on the corrected fixture — completed the checks above, then reproduced the React #185 crash twice, was used to capture the diagnostic, and was closed by exact PID before the rebuild. No production data directory, credentials, or personal files were touched; no Git operations were performed.

## M014-02R (validation-only closeout)

- Documentation patch applied: `release/RELEASE_NOTES_v0.11.0.md` wording corrected from “重新签名哈希” to “重新计算哈希”（二进制文件未签名；哈希为重新计算）。No other wording, code, or artifact bytes changed.
- Foreground packaged-app check (Atlas card/mode → Review without crash; restart retains tutorial completion) — `NOT RUN`: permission was requested with the exact scope (rebuilt portable `ResearchOS_0.11.0_x64.exe`, isolated `.smoke-v0110\data-b`, ~5 minutes, clicks + PrintWindow captures + exact-PID close/reopen, no DPI changes, no forced focus) and declined by the user on 2026-08-25. Remains `NOT RUN`; no launch attempted. In-app backup/restore UI remains explicitly `NOT RUN` per handoff.

## Implemented

- M013-01: Source Registry, EvidenceClaim, knowledge-version models (current/superseded/deprecated/emerging + non-destructive supersession links), v2→v3 application-state migration with preservation tests; no automatic claim verification (claims/cards/rubrics stay pending; sources stay metadata_verified with tier inherited from existing verified seeds).
- M013-02: Source-pack pipeline — JSON canonical; per-entity CSV and Markdown/frontmatter parsers as untrusted input with size bounds; parse → validate → dry-run (inserts/updates/conflicts/warnings/rejected rows) → explicit confirm → transactional apply with rollback; idempotent for identical pack ID/content hash; DOI/PMID/title/claim-hash collision detection; supersession cycle detection; Tier X rejected; D/X-backed verified claims rejected; AI self-verification rejected; import audit record.
- M013-03: ProblemCard/diagnostic entities + deterministic search with alias/abbreviation/Chinese-English/fuzzy/related matching, stable ranking, filters, visible pending/emerging/deprecated/superseded badges, structured unmatched-query record, no generated answer on no match.
- M013-04: Chinese-first Problem Atlas workspace and all eight Human-First modes (快速定位/鉴别诊断/序贯排查/缺失信息/错误定位/结论边界/审稿诊断/AI 解释审核); every judgment locks once; feedback only after lock; sequential mode preserves each reveal + belief update in session history.
- M013-05: Small pending demo pack from existing evidence-backed concepts only (pseudoreplication/unit, biological-vs-technical replication, leakage, internal-vs-external validation); every new card/path/rubric `contentOrigin: ai_generated`, `verificationStatus: pending`; no external scientific search.
- M013-06: Today schedules at most one new problem task and never displaces due review; wrong + high confidence → misconception + delayed far-transfer variant (cells → spatial spots → organoid wells → pathology ROIs families); five Skill Map dimensions; Method/Pattern links by stable IDs without copying content; global search + command palette entry.
- M013-07: Deterministic audits, focused node/integration tests, package scripts, and this report.
- M013-10 (previous cycle): exception-safe untrusted-input validation; structured failures with codes/locations; two independent gates (structural vs scientific completeness) with `importEligible` blocking the apply path; deterministic auditable legacy→v3 staging converter with source dedup (6 DOI / 6 PMID / 4 title merges, FK rewrites, disclosed metadata demotion, exact Codex-approved metadata patches); per-row staging audit meta; staging structural validator + dry-run; `.agent/M013_V3_STAGING_REPORT.{md,json}` and `artifacts/m013-v3-staging/*`; regression coverage. No problemType inference, no global “candidate causes ≥ 3” rule, no fabricated scientific fields, no production import, no pending promotion, no Git, no packaging.
- M013-09 + M013-10R (this cycle): CSV/Markdown oversize fields deterministically rejected (never truncated); identical-import/noop shortcut no longer bypasses the structural/scientific gates and apply rejects such documents without mutation; diagnostic engine hardened (mode/kind/order validation, baseline-before-reveal sequential protocol with evidence-before/evidence-after history, strict AI-verdict grading, unique error-localization ranks); minimal explicit source-pack import UI with gated confirmation and no forced updates; pending-claim support displayed as proposed (`拟直接支持 · 待核验`) and Tier B relabeled 专业/技术来源 with source type shown separately; the four listed scientific correction groups applied to the pending demo content (temporal validation, leakage learn-and-lock, single-cell unit/pseudobulk qualification, Codex-reviewed authority-tier mapping) plus the sequential rubric fix; the 166 external legacy cards remain `unclassified`, pending and import-ineligible; all demo cards/claims/rubrics remain pending.
- M013-11R (this cycle): strict path-node/evidence order validation in the sequential engine (next-node reveal, node-owned evidence, reveal/ranking node matching, unique-node-coverage completion) with direct regressions; temporal-validation demo fully de-contradicted (internal-only wording removed, red flags corrected, bounded answer rewritten) and directly backed by a new pending EvidenceClaim on a new pending A-level BMJ methods source; 166 external cards untouched; no tutorial, no Git, no packaging.
- M013-11R2 (this cycle, metadata-only): corrected `pa-src-altman-validation.pmid` `19401593` → `19477892` (PubMed record for DOI `10.1136/bmj.b605`); regenerated the seed export; corrected SC-DEMO-01; added a deterministic DOI↔PMID pair assertion to the source-pack audit so the mismatch cannot pass again. Source and claim remain pending; no wording/engine/UI/other metadata changed.
- M014-01 (this cycle): optional Chinese-first five-minute tutorial (Today → Problem Atlas → pending-evidence status → lock-before-feedback → Review) with Skip/Back/Next/Finish, keyboard navigation, focus restoration, Escape close, reduced motion, restart from Settings, persisted skip/completion timestamps on the existing onboarding state, and isolated preview exercises that write nothing to learning records; reuses existing pending demo content only — no new scientific claims, sources, cards or generated answers.
- M014-02 (this cycle): release candidate v0.11.0 — version declarations unified, store formatting restored, tutorial Today wording calibrated, full frontend/Rust regression, production Tauri build (NSIS + standalone), SHA256 + build metadata + Chinese release notes; file-level backup round trip and packaged-app DB verification on isolated copies; interactive packaged-app smoke partially completed in the pre-policy session segment and paused per `.agent/TESTING_POLICY.md` (resumable checkpoint recorded; foreground session requires new explicit approval).

## Tests

| Gate | Result | Evidence/output |
|---|---|---|
| Agent handoff validator | PASS | `node scripts/validate-agent-handoff.mjs` → Agent handoff validation: PASSED |
| Typecheck | PASS | `tsc -p tsconfig.build.json --noEmit` → no errors |
| Full frontend suite | PASS | `npm test` → 50/50 tests (21 existing incl. updated Today bound + 29 M013/M014 incl. 5 M014-01 tutorial tests), localization audit PASSED 11 checks, startup smoke PASSED |
| Source-pack audit | PASS | `npm run audit:source-pack` → 0 errors, 0 warnings (incl. exception-safety probes, two-gate separation, unclassified blocking, safe parser, CSV-oversize rejection, noop gate, Codex tier mapping); artifacts/source-pack-audit.json + docs/SOURCE_PACK_AUDIT.md |
| Problem Atlas audit | PASS | `npm run audit:problem-atlas` → 0 errors, 0 warnings (incl. baseline-first sequential protocol, cross-mode/illegal-transition rejection, strict AI verdicts, duplicate-rank rejection); artifacts/problem-atlas-audit.json + docs/PROBLEM_ATLAS_AUDIT.md |
| M013-10 staging gate | PASS | `npm run staging:audit` → 63/63 checks, 0 failures; 8/8 original packs SHA256-verified, structured rejection without crash; 8/8 staging docs structurally valid, internally collision-free, import-ineligible; 166 unclassified; `.agent/M013_V3_STAGING_REPORT.{md,json}` + `artifacts/m013-v3-staging/` |
| Content audit | PASS | 0 errors, 1 pre-existing warning; 49 evidence / 88 methods / 84 usable / 25 patterns / 84 cards / 40 audits |
| Performance audit | PASS | Initial JS 868,012 bytes (budget 1.9 MB); scheduler 0.0679 ms; training chunk and CSS budgets green |
| Startup smoke | PASS | production bundle renders and hydrates |
| Seed export | PASS | `npm run seed:export` → 9 machine-readable seed artifacts refreshed (corrected pending content + tiers + problemType) |
| Rust tests | NOT RUN — no Rust changes | No `src-tauri` files modified; SQLite `user_version` stays 2 (JSON-blob gateway unchanged) |

New M013 test coverage: v2→v3 migration preserving user data; source-pack invalid enums/duplicate identifiers/broken links; dry-run non-mutation; transactional rollback; idempotent re-import; AI self-verification rejection; deterministic search ranking (exact alias > fuzzy) and filters; judgment locking; sequential history preservation; wrong+high-confidence problem diagnosis → far-transfer variant review; Chinese-first UI render without chat fallback; CSV/Markdown parser bounds.

New M013-10 regression coverage (8 tests): hardened validator never throws on malformed/legacy/oversized/malformed-id/wrong-type shapes and returns structured failures; dry-run never throws and reports importEligible; structural vs completeness gate separation (incomplete pack is structurally clean but patch-required, apply throws, state unchanged); unclassified cards blocked from apply; cross-registry DOI collision makes collision-dependent claims non-applicable (all-or-none); legacy conversion deterministic/verbatim/unclassified with staged-missing disclosure; corpus canonicalization merges duplicated sources and rewrites foreign keys collision-free; safe JSON parser structured failures.

New M013-09/M013-10R regression coverage (5 tests): CSV oversize fields rejected deterministically without truncation (line/field locations); identical-import noop cannot bypass scientific completeness (REVIEW_RESULT probe: `{noop: true, importEligible: false, completeness: scientific_patch_required}`, apply throws, state unchanged); sequential engine rejects illegal transitions and cross-mode submission (mode mismatch, wrong kind, reveal-before-baseline, consecutive reveals, double baseline; baseline→reveal history order preserved); AI-verdict grading requires every statement ID, rejects unknown IDs, scores omissions incomplete; error-localization rejects duplicate and incomplete layer rank lists.

New M013-11R regression coverage (1 test): sequential engine validates path nodes, evidence and ranking targets — fake node, reordered node, fabricated evidence and repeated-node attempts rejected; mismatched reveal/ranking node rejected; completion requires one valid post-reveal ranking for every ordered path node (partial coverage stays incomplete). The Problem Atlas audit additionally covers the same strict cases as gate checks.

New M014-01 tutorial coverage (5 tests): first-run auto-open decision is deterministic (completed onboarding without timestamps opens; skipped/completed/incomplete onboarding does not); keyboard navigation is deterministic and bounded (ArrowRight/Enter/ArrowLeft/Backspace/Escape, clamping); skip and completion persist with zero learning-state mutation (responses/reviews/misconceptions/calibration/scheduler/import records byte-identical before and after); first-run visibility, skip persistence and restart through the hydrate/persistence gateway; panel renders Chinese-first with Skip/Back/Next, the final-step Finish control, the five step labels and no chat affordance.

## Failures

None remaining. (Fixed during the session: extensionless `.build` imports for direct-node audit execution; fuzzy-distance test fixture; CSV quote-escaping fixture; Tier-X rejection surfaced as an error; seeded-state vs empty-registry fixture in the atlas audit. M013-10 cycle: collision test fixture initially hit within-pack duplicate detection — restructured to a true cross-registry conflict; canonicalization audit count initially summed per-pack rows — corrected to unique canonical IDs; provenance gap count after merge (48 vs pre-merge 50) disclosed with reason; supersession references to out-of-pack legacy sources reclassified as disclosed warnings, not structural failures. M013-09/M013-10R cycle: the old sequential audit/test protocol (reveal-before-ranking) was rewritten to the required baseline-first protocol in engine, view, audit and tests; `parseCsvLine` regression initially missed the import — added. M013-11R cycle: sequential strict checks initially separated from the pattern fallback; consolidated so the no-path fallback also enforces reveal/ranking node matching, and the path-aware mode adds node identity/order/evidence checks.)

## Remaining issues

- M014-02 foreground verification is PARTIAL by design (policy-compliant): the approved session completed migration/tutorial/reopen/Esc/compact/recovery checks and surfaced the React #185 crash, which is fixed and repackaged; still NOT VISUALLY VERIFIED in the packaged app — post-fix Problem Atlas navigation, Today-nav capture, in-app backup/restore leg (data-c prepared), restart-persistence confirmation after restore. These need one more short approved foreground session (resumable checkpoint: fixture `.smoke-v0110\data-b` now carries `tutorialCompletedAt`; restore leg dir `.smoke-v0110\data-c` reserved).
- M011 localization work remains unapproved and dirty; the localization audit script key mismatch was fixed mechanically (scripts only) so the gate is green again.
- M012 Protocol Lab implementation remains paused behind M013 ACCEPT, as specified.
- All M013 demo ProblemCards/paths/rubrics/claims remain pending (HIGH risk) and require Codex scientific review per `.agent/SCIENTIFIC_GATES.md`; the correction groups are recorded in `SCIENTIFIC_CHANGESET.md` (SC-DEMO-01…04). The new temporal source `pa-src-altman-validation` and claim `pa-claim-temporal-validation` are pending and unverified. M014-01/M014-02 added no scientific content.
- All 166 staged legacy cards remain `unclassified` (import-ineligible) until M013-11 classifies them; claim-level scientific patches listed in `SCIENTIFIC_CHANGESET.md` (CLM-QPCR-006, CLM-SP-008, CLM-AI-004, CLM-REV-003 and scope/qualification fills) remain open because no exact patch text exists.
- The source-pack import UI is a minimal explicit flow (file picker → dry-run → gated confirm); it uses `allowUpdates: false`, so content changes to existing rows are never silently forced.
- The tutorial auto-opens once for users whose onboarding is complete and who have neither completed nor skipped it (including existing users upgrading to this build); it is always skippable and restartable from Settings.
- Version is 0.11.0; no Git operations were performed; release signing/installer behavior is not part of this milestone.
# M015 Codex Core Checkpoint — 2026-08-26

## Changed files

- Added `src/domain/contentStudio.ts`, `src/services/contentStudio.ts`, `src/services/contentInventory.ts` and `src/features/content-studio/ContentStudioView.tsx`.
- Updated app navigation, state schema/migration/store, Today state projection and node test suite.

## Implemented

- Portable content records, stable keys, revisions, SHA-256 and dependency-aware review-pack construction.
- Personal draft/pending/active/archive overlay state, explicit private activation without verification promotion, optimistic patch apply, history and rollback.
- Chinese-first content workbench shell with 内容库、草稿、待审核、发布箱、版本历史、冲突.
- v1/v2/v3 state migration to schema 4 with existing user data preserved.

## Verification

- BACKGROUND AUTOMATED — PASS: `npm run test:unit`, 56/56.
- HEADLESS/OFF-SCREEN — PASS: server-rendered content workbench assertions in node suite.
- FOREGROUND UI — NOT RUN.
- USER-MANUAL — NOT RUN.

## Remaining

- Finish review-pack file export and audit, full editor/patch UI, curated Obsidian publisher, optional finite review round trip and complete regression. See `.agent/OPENCODE_HANDOFF.md`.

---

# M015 OpenCode Continuation — resumed from checkpoint `7c65c9d` (2026-08-26)

Agent/model: OpenCode / DeepSeek V4 Pro. Boundaries honored: background-only, fake vault only, no Git, no packaging, no scientific content generation/promotion, no real-vault or personal-file access.

## Stage A — M015-01 inventory audit + review-pack file export (COMPLETE)

### Changed files

- New: `src/services/safePaths.ts`.
- Modified: `src/services/contentStudio.ts`, `src/services/desktop.ts`, `src/features/content-studio/ContentStudioView.tsx`, `src/styles/app.css`, `src-tauri/src/lib.rs`, `tests-node/suite.mjs`.

### Implemented

- `auditContentInventory`: deterministic duplicates / SHA-256 mismatch / provenance-gap / missing-dependency / dependency-cycle audit over any inventory; base inventory audits clean.
- `reviewPackFileEntries`: exactly five deterministic files (`manifest.json`, `content.json`, `REVIEW_COPY.md`, `SCIENTIFIC_CHANGESET.md`, `dependencies.json`).
- Rust safe filesystem gateway + `export_review_pack` command: pure path validation first (traversal, absolute/UNC/drive, `.obsidian`, control characters, reserved device names, trailing dot/space, depth ≤ 8, length ≤ 200), then resolved-containment proof via canonicalization (rejects symlink/junction escape), then atomic temp→backup→rename writes with restore-on-failure and byte-identical skip. Any invalid path fails the whole batch with zero file writes.
- 内容工作台 内容库: multi-select + explicit 导出审核包 action; destination picker warns to stay outside the Obsidian vault and the destination is validated against the configured vault root before invoking the write command.

### Verification

- BACKGROUND AUTOMATED — PASS: `npm run test:unit` 59/59 (3 new tests); `cargo test --manifest-path src-tauri/Cargo.toml` 12/12 offline single attempt (5 new tests).
- HEADLESS/OFF-SCREEN — PASS: SSR workbench assertions extended (导出审核包 / 零写入 present; no 自动同步).
- FOREGROUND UI — NOT RUN.
- USER-MANUAL — NOT RUN.

### Failures

Two Rust test-code compile fixes plus one invalid test fixture (`\u{7}` escape, count type annotation, non-trailing-space fixture); no product logic changed during fixes.

---

## Stage B — M015-02/M015-03 personal maintenance (COMPLETE)

### Changed files

- Modified: `src/domain/contentStudio.ts`, `src/services/contentStudio.ts`, `src/state/store.ts`, `src/features/content-studio/ContentStudioView.tsx`, `src/styles/app.css`, `tests-node/suite.mjs`.

### Implemented

- Leakage guard hardened: `resolveEffectiveContent` resolves only `active && activeForLearning`; draft/pending/archived/deprecated/superseded (and misconfigured active-but-inactive records) never reach learning, search or publishing surfaces.
- Create-from-template (`KIND_TEMPLATES`, structural empty placeholders only), duplicate-as-independent-draft, full detail editor (title/risk/payload JSON/dependency keys), kind filter and search.
- Deterministic per-item validation: errors, warnings, evidence gaps, dependency impact, entersLearning flag; deterministic field diffs shared by patch preview and version comparison.
- Patch import: total JSON parsing with bounds; dry-run preview (target, revision bump, field-level diffs, affected dependencies); expired base records an open `stale_patch` conflict with zero mutation; apply is all-or-nothing and appends a history snapshot; rollback generates a new revision and returns content to 待审核 while keeping every old revision resolvable.
- Built-in objects immutable via patches; private activation keeps 待核验 status everywhere (store invariant + validation + UI labels).

### Verification

- BACKGROUND AUTOMATED — PASS: `npm run test:unit` 65/65 (6 new tests).
- HEADLESS/OFF-SCREEN — PASS: store-level lifecycle/patch/conflict flows exercised headlessly in the node suite.
- FOREGROUND UI — NOT RUN.
- USER-MANUAL — NOT RUN.

### Failures

One test fixture defect (direct-edit step did not change payload hash); fixed in the fixture only.

---

## Stage C — M015-04 curated Obsidian publisher (COMPLETE)

### Changed files

- New: `src/services/obsidianPublish.ts`.
- Modified: `src/domain/contentStudio.ts`, `src/services/desktop.ts`, `src/state/store.ts`, `src/features/content-studio/ContentStudioView.tsx`, `src-tauri/src/lib.rs`, `tests-node/suite.mjs`.

### Implemented

- Dedicated-subfolder connection with strictly read-only validation (no directory/file creation; rejects `.obsidian`, traversal, symlink/junction components, >2-level depth).
- Internal outbox: explicit selection → batch → exact create/update/conflict/unchanged preview listing every precise relative path → confirmation token → atomic apply; default 20-note limit with a required second explicit confirmation.
- Permanent-note contract: stable `researchos_id` frontmatter identity, revision/status/hash/published-at, one managed block, deterministic timestamp-free managed body; pending content stays honestly labeled 待核验 (`user_pending`); builtin notes marked `builtin`.
- Idempotency and safety: unchanged republish writes nothing; rename follows stable ID (no title-derived duplicates); externally edited managed blocks produce conflicts with zero writes; user bytes after the managed block are preserved byte-for-byte on updates; per-directory case-insensitive + decomposed-Unicode collision rejection; preview-time byte preconditions verified for the entire batch before any write; atomic temp→backup→rename writes.

### Verification

- BACKGROUND AUTOMATED — PASS: `npm run test:unit` 68/68 (3 new tests); `cargo test --manifest-path src-tauri/Cargo.toml` 15/15 offline single attempt (3 new tests).
- HEADLESS/OFF-SCREEN — PASS: pure planner/applier flows cover conflict/idempotency/user-byte preservation headlessly.
- FOREGROUND UI — NOT RUN.
- USER-MANUAL — NOT RUN.

### Failures

Two test-only issues fixed (Windows case-insensitive existence assertion replaced by directory-entry count; filename-sanitizer expectation). One intermediate Rust structural slip was caught by `cargo check` before testing. No product behavior changed during fixes.

---

## Stage D — M015-05 optional finite review round trip (COMPLETE)

### Changed files

- Modified: `src/domain/contentStudio.ts`, `src/services/obsidianPublish.ts`, `src/state/store.ts`, `src/features/content-studio/ContentStudioView.tsx`, `tests-node/suite.mjs`.

### Implemented

- Explicit confirmed export of a finite `_Review/<batch-id>/` set: exactly one manifest (with per-note export-time managed hashes) plus the notes it lists; batch ID validated; manifest persisted on the internal batch record.
- Explicit check action: reads the stored manifest back first, refuses to read anything on any mismatch, then reads only the listed note paths; feedback parsing rejects extra paths, missing paths and identity/hash mismatches (fail closed).
- 审核意见 annotations and managed-block payload edits convert into pending patch candidates with dry-run field diffs; reviewer words are imported verbatim; every candidate is `pending_review`/`pending`; applying creates a new revision while old revisions stay resolvable and no status is ever promoted.
- No watcher, automatic pull, merge, publish, delete or cleanup exists in this path.

### Verification

- BACKGROUND AUTOMATED — PASS: `npm run test:unit` 71/71 (3 new tests).
- HEADLESS/OFF-SCREEN — PASS: manifest-gating, annotation extraction, managed-edit detection and candidate application exercised headlessly.
- FOREGROUND UI — NOT RUN.
- USER-MANUAL — NOT RUN.

### Failures

Two test fixtures initially included the manifest file in the gated read-back entries; corrected to match the designed contract (manifest verified separately by the store). One real service defect found by the tests (`toReviewPatchCandidates` missing contents lookup) was fixed before green.

---

## Stage E — M015-06/M015-07 regression and handoff (COMPLETE)

### Changed files

- New: `scripts/m015-content-audit.mjs`, `scripts/run-m015-audit.mjs` (bundling launcher).
- Modified: `package.json` (`audit:m015` script), `src/state/store.ts` (one lazy-import fix, see Failures), `artifacts/m015/final-gate.json` (generated).

### Deterministic audits implemented

31-check final gate: schema-4 / SQLite-user-version-2 invariants; SHA-256 vectors; inventory duplicate/hash/provenance/dependency-cycle audit; five-lifecycle leakage probes; patch stale/atomic/rollback probes; fake-vault publish simulation at the exact run-state root (TS-level simulation of the designed gateway — NOT real Rust filesystem verification; OS-level containment/atomicity is proven separately by `cargo test`: preview zero-write proof via byte-level tree snapshots, exact create, unchanged republish writes nothing, byte-preserving updates, managed-edit conflict with zero writes; namespaced per run); review manifest gates; static scans (no watchers, no auto-publish near hydration, no verified-status literals in store, no hardcoded vault locations); 166-card quarantine disclosure check.

### Verification (final battery)

- BACKGROUND AUTOMATED — PASS: `npm test` 71/71 + localization 11 checks + startup smoke; source-pack 0/0; Problem Atlas 0/0; staging 63/63; content 0 errors/1 pre-existing warning; performance initial JS 927,427 bytes (budget 1.9 MB); seed export 9 artifacts; `audit:m015` 31 checks (run twice); `cargo test` 15/15 offline single attempt; handoff validator PASSED.
- HEADLESS/OFF-SCREEN — PASS: all M015 behavior exercised headlessly; fake-vault simulation uses only `.tmp/m015-fake-vault/m015-personal-content-studio-20260826`.
- FOREGROUND UI — NOT RUN.
- USER-MANUAL — NOT RUN.

### Failures

One real regression caught by the performance gate and fixed: a static `contentInventory` import added to `store.ts` during Stage C inlined all built-in training datasets into the startup chunk (initial JS 1,157,774 bytes, `expandedTraining` lazy chunk lost). Converted to dynamic import inside the three publish/review actions; startup payload returned to 927,427 bytes and every gate was re-run green afterwards. The audit script also initially assumed an empty vault on re-runs; runs are now namespaced so the persistent fake-vault stays valid across repeated audits.

### Scientific changeset

None. M015 generated, modified or promoted no scientific content; `SCIENTIFIC_CHANGESET.md` intentionally left untouched (its existing entries are pre-M015 pending items still awaiting Codex).

---

## M015 OpenCode continuation — FINAL STATUS

All stages A–E complete from checkpoint `7c65c9d`. Segment reports S1–S7 under `.agent/m015-segments/`. Run state set to `awaiting_codex_review`. Stopping for Codex diff/scientific review per `.agent/OPENCODE_HANDOFF.md`.

# M015 Codex Review Response — PATCH REQUIRED → resolved for re-review (2026-08-26)

Agent/model: OpenCode / DeepSeek V4 Pro. All work background-only on the project-local fake vault; no Git, no packaging, no real vault, no scientific content changes. Each fix was preceded by a failing regression (red→green).

## M015-R2 — patch-pack promotion bypass closed (P0 / scientific gate)

- `parsePatchPackJson`: strict schema — `targetKind` enum check, `proposedLifecycle` restricted to `draft | pending_review`, `proposedVerificationStatus` must be exactly `pending`, ISO `createdAt`, id-format checks for `patchId`/`targetId`, integer `baseRevision ≥ 1`, sha256 `baseHash`, `changes` bounds (non-empty, ≤50 keys, ≤100 KB), typed optional `reviewer`/`evidenceChanges`.
- `previewPatch` and `applyPatchTransaction` independently enforce the same gate (defense in depth); apply now hard-throws on any promotion attempt and writes `lifecycle ∈ {draft, pending_review}`, `activeForLearning = false`, `verificationStatus = "pending"` unconditionally.
- Tests added (3): unknown enums/non-pending proposals rejected; direct service-level active+verified pack (bypassing the parser) fails closed for user and AI origins; malicious patches leave entries/history/conflicts byte-identical.

## M015-R1 — versioned revision entry for built-in objects (P0)

- New `createOverlayFromBuiltin`: stages a pending draft overlay carrying `baseKey/baseRevision/baseHash`; the built-in record is cloned verbatim and never mutated; built-ins remain read-only.
- New `detectBaseUpdateConflicts`: deterministic `base_update` conflicts when an app upgrade changes an overlay's base hash/revision; surfaced in the 冲突 tab alongside stored conflicts.
- Store: `ensurePersonalOverlay(record)` and `applyOverlayPatch(patch, builtinRecord)` (stages the overlay on demand, then rebases the patch onto the overlay's optimistic-lock state).
- Review round trip: built-in targets now produce overlay patch candidates (`targetId = overlay-<id>`, `overlayBase` metadata) instead of being skipped; the workbench applies them via the rebased path. 内容库 rows expose 建立个人修订.
- Tests added (3): builtin → overlay → revision → rollback with untouched base text; upgrade conflict detection determinism; review-candidate staging/rebased apply incl. stale re-apply protection.

## M015-R3 — Rust containment hardened (P0)

- `collect_markdown_files`: per-entry no-follow file types; symlinks/junctions are never traversed; exceeding 500 notes is now a structured overflow error (`listing overflow … refusing a partial scan`) instead of a silent truncation.
- `read_text_files`: new `safe_existing_target` walks every component with no-follow metadata, refuses any link below the dedicated root, proves parent containment via canonicalization, and rejects directory targets.
- Write path: new `prepared_write_target` creates missing parents inside the confirmed transaction, rejects every link component, proves containment, and refuses directory targets.
- Tests added (3): directory symlink/junction inside the vault (junction created via `mklink /J` where permitted) is neither listed nor read through, outside bytes untouched; file symlinks fail both read and expected-matching write; 501-note overflow returns the structured error.

## M015-R4 — confirmed-write transaction fixed (P0)

- First-export bug fixed: nested parents (e.g. `_Review/<batch-id>/`) are now created and containment-proven inside the transaction; blank-vault export works (regression test).
- Duplicate exact paths AND case/Unicode-equivalent paths within one batch are rejected up front (structured error, zero writes).
- Cross-file all-or-nothing implemented: all temp files are staged first; commit rotates previous bytes through backups and renames into place per batch; any mid-commit failure rolls back every already-committed file (restores backups or removes creations) and removes staged temps, returning a structured "rolled back; no partial batch remains" error.
- Planner: multiple existing notes sharing one stable `researchos_id` now produce a conflict item instead of silently using `candidates[0]`.
- Tests added (4 Rust + 1 node): blank fake-vault first review export; duplicate/equivalent paths zero-write rejection; second-file failure leaves no partial output or temp/backup leftovers; duplicate-stable-ID planning conflict.

## M015-R5 — Windows compatibility & handoff cleanup (P1)

- `parseObsidianNote` is CRLF-tolerant (frontmatter detection/splitting, managed markers); managed-block hashing normalizes CRLF so external line-ending rewrites no longer lose identity or create false conflicts; user tails remain byte-exact (CRLF preserved through updates). Test added covering identity, zero-churn republish of a CRLF-rewritten copy, and byte-preserving CRLF tail across updates.
- `.audit-build/` added to `.gitignore`.
- `S0.md` reconstructed as an explicitly labeled factual record (original was absent from disk) so the run-state reference resolves without claiming unrun checks.
- Report wording corrected: the `audit:m015` fake-vault publish checks are a TS-level simulation of the designed gateway; OS-level containment/atomicity/idempotency evidence is the Rust test suite.

## Re-verification (exact commands)

- `npm run test:unit` → PASS 79/79 (+8 review-response tests; all previously failing regressions green)
- `npm run audit:m015` → PASS 31 checks
- `cargo test --manifest-path src-tauri/Cargo.toml` (offline single attempt) → PASS 21/21 (+6)
- `node scripts/validate-agent-handoff.mjs` → PASSED
- Full battery unchanged-green: `npm test` 79/79 + localization 11 + startup smoke; source-pack 0/0; Problem Atlas 0/0; staging 63/63; content 0 errors/1 pre-existing warning; performance initial JS 935,771 bytes (budget 1.9 MB); seed export 9 artifacts

### Test reporting

- BACKGROUND AUTOMATED — PASS (commands above)
- HEADLESS/OFF-SCREEN — PASS (all M015 behavior exercised headlessly; filesystem tests use isolated tempdirs plus the exact project-local fake vault)
- FOREGROUND UI — NOT RUN
- USER-MANUAL — NOT RUN

Stopping for Codex diff review; OpenCode ran no Git commands.

# M015 Codex Review Response 2 — R1R–R5R resolved for re-review (2026-08-26)

Agent/model: OpenCode / DeepSeek V4 Pro. Background-only, project fake vault only, no Git, no packaging, no scientific changes. Each fix was preceded by a failing regression where mechanically possible (R1R/R2R/R4R-planner/R5R red runs captured; the two Rust fault-injection tests were written together with the new injection seam because no deterministic mid-commit failure was reachable through the previous API).

## M015-R1R — overlay optimistic lock restored (P0)

- `applyOverlayPatch` never rebases an existing overlay: the candidate must match the overlay's exact revision/hash or it fails as stale with zero mutation.
- First staging is the only baseline translation, and it is provable: the candidate must exactly match the current built-in snapshot (revision+hash); otherwise an open `stale_patch` conflict is recorded and nothing is created/applied.
- `ensurePersonalOverlay` now looks up by ID alone and records a conflict + throws when the occupying object differs in kind/baseKey/baseRevision/baseHash instead of silently reusing it.
- Every failed overlay apply records an explainable open conflict (candidate ID, current revision vs candidate base) before rethrowing.
- Tests added (2): candidate A → apply B (real r3 advance) → re-apply A2 with genuine field diffs → stale error, byte-identical state, conflict recorded with candidate ID; same-ID different-kind personal object blocks ensurePersonalOverlay via recorded conflict.

## M015-R2R — untrusted schema corners completed (P1)

- Strict ISO-8601 validation (`YYYY-MM-DDTHH:MM:SS[.fff](Z|±HH:MM)` plus parseability) replaces bare `Date.parse`; space-separated/loose formats are rejected, explicit offsets accepted.
- The `changes` key loop's early `break` removed: every key is checked; empty field names anywhere reject the pack.
- Parser regression added covering both corners.

## M015-R3R — no directory creation through links (P0)

- `prepared_write_target` reordered: existing components are verified top-down with no-follow metadata first (`NotFound` is the ONLY tolerated "missing" signal; any other metadata error fails closed), then missing parent levels are created ONE level at a time under proven parents, each newly created directory immediately re-verified (no reparse point, real directory, canonical containment), then parent containment proof and final-component link/directory refusal.
- `resolve_dedicated_dir` and the read path likewise treat only `NotFound` as missing; all other metadata errors fail closed.
- Regression added: junction inside the dedicated folder pointing outside; writing `linked/new/note.md` is rejected AND the external `new` directory does not exist; the complete external tree snapshot stays path/byte identical. This test reproduced the defect on the pre-fix code (red) before the reorder.

## M015-R4R — real cross-file transaction with fault injection (P0)

- New `write_confirmed_files_inner(..., fault_commit_index)` seam (production wrapper passes `None`) enables deterministic mid-commit failure AFTER a real commit.
- Rollback hardened for Windows: restoring an updated file removes the NEW target first, then renames the backup back; restore failures are never ignored — backups are kept as recoverable evidence and the returned error states `ROLLBACK INCOMPLETE` with the leftover paths. Only after a fully successful rollback are backups/temp files deleted and the error claims "whole batch rolled back".
- Staging failure cleans up every temp created so far and returns "staging failed before any commit".
- Temp/backup names are batch-unique and verified-nonexistent siblings (`.researchos-{tmp|bak}-{pid}-{nanos}-{n}`, name truncated to 80 chars), so fixed names can never truncate or clobber existing hidden files.
- Tests added (2): fault at commit #1 for [update-existing + create-new] and [create-new + update-existing]; both assert full-tree byte/path equality with the pre-call state, original bytes intact, new file absent, zero tmp/bak leftovers. The earlier directory-target rejection test remains as a separate case.

## Planner / review-builder same-title handling

- `planPublishBatch`: duplicate output paths from different contents are detected post-planning and ALL members of a colliding group become conflicts ("相同输出路径"), so collisions surface in preview rather than at write time.
- `buildReviewRoundTrip`: deterministic disambiguation appends the stable content ID (then numeric suffix if still colliding) so finite review batches always produce unique manifest paths; determinism asserted across rebuilds.

## M015-R5R — CRLF unmanaged suffix preserved byte-for-byte (P1)

- `parseObsidianNote.userTail` is now the ENTIRE raw suffix after `MANAGED_END` (exact leading newline characters included); the update splice concatenates frontmatter+managed block+suffix without inserting anything, so `\r\n` can no longer degrade to `\n\r\n`.
- Test strengthened to compare the complete suffix after `MANAGED_END` byte-for-byte between input and output (previously only an endsWith check).

## Re-verification (exact results)

- `npm run test:unit` → PASS 84/84 (+5 review-response tests)
- `npm run audit:m015` → PASS 31 checks
- `cargo test --manifest-path src-tauri/Cargo.toml` (offline single attempt) → PASS 24/24 (+3)
- `node scripts/validate-agent-handoff.mjs` → PASSED
- Full battery green: `npm test` 84/84 + localization 11 + startup smoke; source-pack 0/0; Problem Atlas 0/0; staging 63/63; content 0 errors/1 pre-existing warning; performance initial JS 941,388 bytes (budget 1.9 MB); seed export 9 artifacts

### Test reporting

- BACKGROUND AUTOMATED — PASS (commands above)
- HEADLESS/OFF-SCREEN — PASS
- FOREGROUND UI — NOT RUN
- USER-MANUAL — NOT RUN

Stopping for Codex re-review; OpenCode ran no Git commands.

# M015 Codex Review Response 3 — R1R2/R2R2/R4R2/R4R3 resolved for final re-review (2026-08-26)

Agent/model: OpenCode / DeepSeek V4 Pro. Background-only, project fake vault only, no Git, no packaging, no scientific changes. Failing regressions preceded every fix where the defect was reachable through the existing API (R1R2/R2R2/R4R3 red runs captured; R4R2's rotated-state and dir-purge tests were written together with the new state-machine seam because those states were unreachable through the previous fault API).

## M015-R1R2 — overlay identity guard (P1)

- When `applyOverlayPatch` receives `builtinRecord`, an existing same-ID/same-kind object must genuinely be that object's overlay (`baseKey`/`baseRevision`/`baseHash` all match) before any patch logic runs. A same-hash placeholder WITHOUT the base linkage is rejected with a recorded open conflict and zero mutation — hash coincidence is explicitly not trusted.
- Regression added: placeholder cloned from the builtin payload (identical hash, no base linkage); candidate apply throws, records a conflict, and leaves the placeholder byte-identical.

## M015-R2R2 — real calendar validation (P1)

- `isValidIsoInstant`: strict ISO-8601 regex plus UTC round-trip comparison of year/month/day/hour/minute/second against the parsed fields. Nonexistent dates roll over and stop matching.
- Regressions added: `2026-02-29T00:00:00Z` and `2026-04-31T00:00:00Z` rejected; `2024-02-29T23:59:59+08:00` (real leap day, explicit offset) accepted.

## M015-R4R3 — long-title review pack loop fixed (P0)

- `buildReviewRoundTrip` disambiguation now operates suffix-aware: the stable-ID marker is appended to an ALREADY-truncated stem whose length reserves room for the marker (plus numeric escalation), so identical over-long titles can never truncate the marker away. Termination is structural (strictly growing counter, marker always present).
- Regression added with a >60-char identical title pair AND a 3s test timeout: completes in ~0.5 ms, unique paths, deterministic across rebuilds. (Red phase demonstrated as a synchronous hang — node:test timeouts cannot interrupt a busy loop, so the pre-fix suite had to be killed externally.)

## M015-R4R2 — transaction state machine + full failure hygiene (P0)

- Explicit per-item states `Staged → BackupRotated → Installed`; rollback walks ALL items beyond `Staged` IN REVERSE, including the current never-installed item: a `BackupRotated` item's old content lives only in its backup and is restored by a plain rename.
- New fault seam `CommitFaultStage::InstallFailure(index)` fires AFTER that item's backup rotation (previous seam fired before rotation). Existing two-seam tests migrated to it and thereby now exercise exactly the required [Installed, BackupRotated] rollback shape.
- New regression for the flagged data-loss path: single-item batch, backup rotated, install fails, committed list empty → original bytes restored from the backup, backup deleted only after successful restore, zero leftovers. On the previous code this path deleted the sole backup while claiming full recovery.
- Staging is register-before-write: each item enters the staged list before its bytes are written, so write/fsync failures clean up the current temp together with earlier ones.
- Temp sidecars are claimed atomically via `OpenOptions::create_new(true)` (no check-then-create TOCTOU window, retry on AlreadyExists); backup names remain transaction-private unique siblings and are additionally protected by rename-fails-if-exists semantics.
- Every directory created by this transaction (dedicated root when absent + nested parents) is tracked; precondition mismatches, staging failures, and FULLY successful rollbacks purge them in reverse order via remove-dir-if-empty, satisfying "failure = zero writes". On ROLLBACK INCOMPLETE nothing is purged (evidence preserved).
- Tests added (2): rotated-backup restoration with empty commit list; precondition failure on a fresh vault purges the entire ResearchOS tree created seconds earlier.

## Re-verification (exact results)

- `npm run test:unit` → PASS 87/87 (+3)
- `npm run audit:m015` → PASS 31 checks
- `cargo test --manifest-path src-tauri/Cargo.toml` (offline single attempt) → PASS 26/26 (+2)
- `node scripts/validate-agent-handoff.mjs` → PASSED
- Full battery green: `npm test` 87/87 + localization 11 + startup smoke; source-pack 0/0; Problem Atlas 0/0; staging 63/63; content 0 errors/1 pre-existing warning; performance initial JS 944,655 bytes (budget 1.9 MB); seed export 9 artifacts

### Test reporting

- BACKGROUND AUTOMATED — PASS (commands above)
- HEADLESS/OFF-SCREEN — PASS
- FOREGROUND UI — NOT RUN
- USER-MANUAL — NOT RUN

Stopping for Codex final re-review; OpenCode ran no Git commands.

# M015 Codex Review Response 4 — R2R3/R4R4 resolved for final sign-off (2026-08-26)

Agent/model: OpenCode / DeepSeek V4 Pro. Scope strictly limited to the two remaining mechanical patches; background-only, project fake vault only, no Git, no packaging, no scientific changes. Both fixes were preceded by failing regressions.

## M015-R2R3 — timezone offset bounds (P1)

- `isValidIsoInstant` now validates the offset it parses: hour `00..23`, minute `00..59` (the RFC3339 mechanical bound; the contract comment states that narrower real-world zone limits are deliberately NOT adopted). `Z` unaffected; calendar round-trip retained.
- Regression added: `+24:00`, `+99:99`, `+08:60`, `-24:30` rejected; `+00:00`, `-05:30`, `+23:59` accepted (red phase confirmed against the previous code).

## M015-R4R4 — full two-level dedicated reclamation (P1)

- Dedicated creation replaced `create_dir_all` with level-by-level creation over the validated subfolder components, registering EVERY missing level in `created_dirs`; non-directory/link components fail closed. The existing reverse-order remove-dir-if-empty purge now reclaims the whole created tree on precondition/staging/rollback failure.
- Regression added: brand-new vault + two-level subfolder (`ResearchOS/Notes`) + precondition failure → error, and NEITHER level exists afterwards (`ResearchOS/` itself removed). The single-level purge test from the previous round is retained unchanged.

## Re-verification (exact results)

- `npm run test:unit` → PASS 88/88 (+1)
- `npm run audit:m015` → PASS 31 checks
- `cargo test --manifest-path src-tauri/Cargo.toml` (offline single attempt) → PASS 27/27 (+1)
- `node scripts/validate-agent-handoff.mjs` → PASSED

### Test reporting

- BACKGROUND AUTOMATED — PASS (commands above)
- HEADLESS/OFF-SCREEN — PASS
- FOREGROUND UI — NOT RUN
- USER-MANUAL — NOT RUN

Stopping for Codex final sign-off; OpenCode ran no Git commands.
