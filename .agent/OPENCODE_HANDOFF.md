# OpenCode Handoff — M013 Final Patch (M013-09 + M013-10R)

## Boundary

Use **DeepSeek V4 Pro**. Perform one bounded final M013 patch. Read `AGENTS.md`, `.agent/REVIEW_RESULT.md`, `.agent/SCIENTIFIC_GATES.md`, `.agent/PROBLEM_ATLAS_SPEC.md` and `.agent/IMPLEMENTATION_REPORT.md`.

Do not classify or import the 166 external legacy cards. Keep them `unclassified`, pending and import-ineligible. Do not add tutorial functionality yet, run Git, package, release, bump versions, or resume M012.

## P0 — M013-10R importer regressions

1. Replace CSV field truncation in `parseCsvLine`/`parseCsv` with deterministic rejection. A field longer than `MAX_FIELD_LENGTH` must never be accepted or silently changed. Return/throw a stable oversize error appropriate to the existing parser API and surface it as a structured row/file rejection in the import flow.
2. Move the identical-import/noop decision behind the current structural and scientific gates. A matching prior import record must not set `importEligible=true` for an incomplete or `unclassified` document; `applySourcePackImport` must reject it without mutation.
3. Add direct regressions reproducing both failures, including the exact incomplete-noop scenario recorded in `REVIEW_RESULT.md`.

## P0 — remaining M013-09 engineering/UI corrections

1. Validate session mode, allowed step kind and legal order in `lockSessionStep`.
2. `gradeAiVerdict` requires exactly every expected statement ID, rejects unknown IDs and treats omissions as incomplete.
3. Error-localization requires unique ranks 1–5.
4. Sequential mode locks a baseline cause ranking before the first reveal, then a new ranking after every reveal; preserve/display evidence-before/evidence-after history.
5. Add direct tests for cross-mode submission, illegal transitions, partial/extra AI verdicts, duplicate ranks and baseline→post-evidence history.
6. Add the minimal explicit source-pack UI: choose JSON/CSV/Markdown → dry-run report → confirmation enabled only with zero errors/conflicts/rejected rows and scientific eligibility → transactional apply. Never silently force updates.
7. Pending EvidenceClaims display support as proposed/pending (for example `拟直接支持 · 待核验`), not unqualified `直接支持`. Rename Tier B UI from `技术参考` to wording that does not mislabel guidelines (for example `专业/技术来源`, with source type shown separately).

## P0 — exact scientific correction boundaries

Keep every changed card/claim/path/rubric `pending`. Do not search for or add sources.

1. Temporal validation: random split remains internal. Same-centre genuinely later, independent patients evaluated with a locked model may be temporal validation/external-in-time; describe its limited geographic transportability rather than declaring it never external. Correct the card context, boundary, check/path, evidence and affected rubrics consistently.
2. Leakage: evaluation/external data must not determine preprocessing, imputation, feature-selection or standardization parameters. Learn them in development data and apply them locked; prespecified adaptation changes the validation question. Remove the “overall statistics are safe” sentence.
3. Single-cell: cells may be the observation/analysis level for some questions but are not thereby independent experimental units for patient-group inference; donor dependence must be modeled. Do not present pseudobulk as the only valid method.
4. Change `患者应排在首位` to the actual candidate explanation that should rank first.
5. Apply the already-reviewed source-tier mapping: TRIPOD/TRIPOD+AI and PROBAST as S; appropriate peer-reviewed method/benchmark sources as A; explanatory review/education as C. Preserve contextual limitations.

## Verification and stop

Run build/typecheck, full frontend tests, source-pack/Problem Atlas/content/localization/performance/startup/staging/seed/handoff gates. Update `.agent/IMPLEMENTATION_REPORT.md` and only the changed scientific entries in `.agent/SCIENTIFIC_CHANGESET.md`.

Stop for Codex review. No Git and no packaging.

## Short prompt

```text
读取 AGENTS.md 与 .agent/OPENCODE_HANDOFF.md，使用 DeepSeek V4 Pro 执行 M013 最终补丁（M013-09 + M013-10R）。修复 CSV 静默截断、identical-import 绕过完整性 gate、诊断引擎/UI 及列明的四组 pending 科研文本。166 张外部卡片继续 unclassified、禁止导入。跑完全部 QA、更新报告后停止；不要 Git、不要教程、不要打包。
```
