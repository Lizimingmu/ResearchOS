# OpenCode Handoff — M013-09 Gate Patches

## Execute

Apply only the patches required by `.agent/REVIEW_RESULT.md`. Use `opencode-go/deepseek-v4-pro`. Do not run Git, package, release, bump versions, broaden M013, or resume M012.

## Read first

Read `AGENTS.md`, `.agent/PRODUCT_CONSTITUTION.md`, `.agent/SCIENTIFIC_GATES.md`, `.agent/REVIEW_RESULT.md`, `.agent/IMPLEMENTATION_REPORT.md`, `.agent/SCIENTIFIC_CHANGESET.md`, `PROBLEM_ATLAS_SPEC.md`, and `SOURCE_INGESTION_SPEC.md`. Inspect only the files and tests directly implicated by the review findings.

## Required patches

1. **Source packs:** repair DOI/PMID validation; make every conflict/rejection block the whole confirmed import; validate the merged state and foreign keys; reject rather than truncate oversized CSV fields; do not force updates; add a minimal select → dry-run → explicit-confirm UI.
2. **Diagnostics:** reject cross-mode/illegal transitions; require a complete exact AI-verdict answer set; enforce unique error ranks; record a locked baseline ranking before sequential evidence and preserve each post-evidence update.
3. **Scientific content/UI:** make temporal validation, leakage and single-cell unit statements match the boundaries in `REVIEW_RESULT.md`; correct authority mappings; show pending support as proposed/pending; fix the pseudoreplication rubric wording. Keep all transformed content pending.
4. **Regression:** extend deterministic audits and focused tests so every reproduced failure in the review exits nonzero or fails a test.

## Acceptance and stop

Run typecheck/full tests, source-pack and Problem Atlas audits, content/localization/performance/startup gates, handoff validation, and Rust tests only if Rust changes. Update `.agent/IMPLEMENTATION_REPORT.md` with exact commands/results and `.agent/SCIENTIFIC_CHANGESET.md` with only scientific changes. Stop for Codex re-review; do not package or execute Git.

## Host prompt

```text
在 D:\Agents\ResearchOS 执行 M013-09。读取 AGENTS.md、.agent/OPENCODE_HANDOFF.md 和 .agent/REVIEW_RESULT.md，仅修复审核列出的阻断项并补齐回归测试/审计。保持科研内容 pending；不要 Git、打包、发布、升版或继续 M012。运行全部指定 QA，更新 IMPLEMENTATION_REPORT.md 与 SCIENTIFIC_CHANGESET.md，然后停止等待 Codex 复审。
```
