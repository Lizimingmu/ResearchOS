# OpenCode Handoff — M013-11R Micro-patch

Use **DeepSeek V4 Pro**. Read `AGENTS.md`, `.agent/REVIEW_RESULT.md`, `.agent/SCIENTIFIC_GATES.md` and the current implementation report. Change only the files/tests needed for the two findings below.

## 1. Sequential path-node integrity

- Make the pure engine validate sequential inputs against the actual `DiagnosticPath` (by passing the path or an equivalent deterministic context).
- After the baseline, a reveal must reference exactly the next unrevealed path node; reject unknown, repeated and out-of-order nodes.
- Revealed evidence IDs must belong to that node's `availableEvidenceIds` and must not be repeated or fabricated.
- The following ranking must reference the same node as the immediately preceding reveal; reject missing/mismatched node IDs.
- Grade completion by one valid post-reveal ranking for every unique ordered path node, not by raw ranking count.
- Add direct tests for fake node, reordered node, mismatched reveal/ranking node, fabricated evidence and repeated-node attempts.

## 2. Temporal-validation scientific consistency

Keep all affected content `pending`.

- Random 80/20 splitting is internal validation.
- A locked model evaluated on genuinely later, non-overlapping, independent patients from the same centre may be reported separately as temporal validation/external-in-time; it does not establish geographic transportability or clinical readiness.
- Remove “same centre” alone as a red flag. The red flag is lack of temporal independence/model locking or overclaiming geographic/general clinical transportability.
- Replace “external = new source only,” “downgrade all external results to internal,” “最多构成” and “仅能声明内部性能” wording wherever it conflicts with the temporal result.
- The bounded answer should say, in substance: report random-split performance as internal; separately report the locked-model later-cohort result as temporal validation; new-centre evaluation and calibration/clinical-utility evidence are needed for geographic transportability or clinical-use claims.
- Add a pending EvidenceClaim for the temporal-validation boundary and link the card/check/path/evidence/rubric as appropriate. Use a suitable existing source only if it directly or qualifiedly supports the claim; otherwise add the reviewed BMJ methods source `Prognosis and prognostic research: validating a prognostic model` (`10.1136/bmj.b605`) as a pending/A-level methods source. Do not mark the source or claim verified.

## Verification and stop

Run focused tests plus the full 44-test-or-later suite, source-pack/Problem Atlas/staging/content/localization/performance/startup/seed/handoff gates. Update `IMPLEMENTATION_REPORT.md` and only SC-DEMO-01/the corresponding temporal entry in `SCIENTIFIC_CHANGESET.md`.

Do not modify the 166 external cards, add tutorial code, run Git, package, bump versions, or resume M012. Stop for Codex review.

## Short prompt

```text
读取 AGENTS.md 与 .agent/OPENCODE_HANDOFF.md，使用 DeepSeek V4 Pro 执行 M013-11R 微补丁。只修复序贯路径节点/证据的严格顺序校验，以及时间验证 demo 中仍存在的“internal-only”矛盾与直接 EvidenceClaim 映射。跑完全部 QA、更新报告后停止；不要动外部 166 卡、不要教程、不要 Git、不要打包。
```
