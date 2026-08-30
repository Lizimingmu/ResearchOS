# M019 Round 4 Fix Recheck

- snapshot_byte_sha256: `c94358e6b35335a0a70c84d81c5e7fb9798467d687c1ac4fc4a84811ae86d4d2`
- claims_sha256: `ebaa525d5855963a975767d98fb433e12dcc46e30d36fe36fcfbb12e3ff0554d`
- source_registry_sha256: `4b2206782876550e22a57c2305a77a15d0dd03f0af75e0230936f36c0bda4c0f`
- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_type: `ROUND4_ISSUE_BY_ISSUE_RECHECK`
- scope: 只复核 `M019_AUDIT_ROUND4_FRESH_REVIEW.md` 的 R4-B01、R4-M01 至 R4-M04 与 R4-m01；未重扫其他历史问题

## Recheck counts

| Status | Count |
|---|---:|
| RESOLVED | 6 |
| PARTIALLY_RESOLVED | 0 |
| NOT_RESOLVED | 0 |
| remaining BLOCKER | 0 |
| remaining MAJOR | 0 |
| remaining MINOR | 0 |
| NEW issue | 0 |

## R4-B01 — Review-to-snapshot hash binding

**Status: RESOLVED（机制）；激活仍以重新运行 gate 并得到 PASS 为前提。**

当前 `scripts/review-binding-audit.mjs` 从文件内容计算 snapshot byte SHA-256、读取 snapshot 声明的 claims SHA-256、并计算 `src/data/evidence.ts` byte SHA-256。它要求以下四份 final review 都逐字带有三组当前 hash：

- `M019_SCIENTIFIC_REREVIEW_FINAL2.md`
- `M019_EVIDENCE_REREVIEW_FINAL4.md`
- `M019_PEDAGOGY_REREVIEW_FINAL5.md`
- `M019_AUDIT_ROUND4_RECHECK.md`

缺文件、缺字段或任一 hash 不同都会产生 `FAIL_STALE_REVIEW` 和非零退出码；`package.json` 已提供 `audit:review-bindings` 入口。`scripts/scientific-audit.mjs` 与 machine packet 同样记录三个绑定值。本报告与 scientific FINAL2 已绑定本页顶部的当前值。

保存的旧 `artifacts/review-binding-audit.json` 在必需 final 尚未生成时显示 `FAIL_STALE_REVIEW`，这是 fail-closed 行为而非通过证据。四份 final 当前均已落盘；用同一匹配逻辑做只读复算，4/4 的三个 observed hash 均与 expected 完全一致。由于本复核不得改写产品或 audit artifact，仍必须正式重新运行 gate 生成新的 `PASS` artifact；否则不得激活。

## R4-M01 — High-risk claim routing

**Status: RESOLVED。**

`scripts/scientific-audit.mjs` 现在分别构造：

- `highRiskGuideClaims`: 182
- 通过 concept `guideSectionId` / method `guideSectionIds` 反向关联的 `highRiskFormalClaims`: 54
- 12 个 Case 的 `highRiskCaseClaims`: 12

三类按 claim ID 去重后为 248，当前不存在重叠或遗漏的 formal claim；JSON packet 分项记录 182/54/12，测试固定验证 182 条 Guide 和 54 条 formal。原先只用 `highRiskGuideIds.has(claim.contentId)` 而漏掉 formal ID 的路径已删除。

边界：该修复证明路由集合完整，不证明 248 条 claim 已通过科学审查。

## R4-M02 — GSVA / ssGSEA source mapping

**Status: RESOLVED。**

`src/data/self-rescue-guide/build.ts` 现在有 exact title mapping：

`"GSVA and ssGSEA": ["src-gsva", "src-ssgsea"]`

fallback 规则也改为有词边界的独立模式：`\bGSEA\b`、`\bGSVA\b`、`\bssGSEA\b`；CAMERA 只有题名明确包含 CAMERA / competitive gene-set / inter-gene correlation 才加入。当前 `guide-v1-m06-t21` 及其 claim 均只映射 `src-gsva`、`src-ssgsea`，不再含 `src-gsea` 或 `src-camera`；`tests-node/suite.mjs` 固定验证该精确集合。

## R4-M03 — Scorer fail-closed human review

**Status: RESOLVED（fail-closed 目标）；开放文本语义仍由人工评分。**

`StagedAssessmentEvaluation.status` 已删除 `passed`，只允许 `review_required | partial | failed`。结构条件满足时返回：

- `status=review_required`
- `recommendedNextRoute=human_review`
- `requiresHumanReview=true`
- `workflowImplemented=false`
- `createsCompetence=false`

重放 Round 4 的 exact adversarial payload——真实允许行、真实事实片段、通用无关 reasoning marker、criterion 四字窗口——当前仍可被识别为“结构上可供审查”，但结果是 `review_required/human_review`，不再是 `passed/complete`，且不能写能力。测试也固定覆盖通用 marker payload并断言 `human_review`。

该关闭结论不声称字符串规则理解了事实—决定关系；相反，当前设计明确把这部分留给独立人工审查。只有未来若重新引入自动 `passed` 或能力写入，才需要重新打开本项。

## R4-M04 — Display-only route semantics

**Status: RESOLVED。**

返回字段已从 `nextRoute` 改为 `recommendedNextRoute`，并增加恒为 `false` 的 `workflowImplemented`。Preview UI 明示“仅建议、未实现自动路由”，按钮与说明使用“结构预检”而非完成评分；没有继续声称 critical error 已实际进入 remediation workflow。测试断言 `workflowImplemented=false`。

本项按原 Round 4 给出的两种关闭路径中的第二种关闭：准确标注 display-only，而不是实现真实 remediation/retry。正式 learner workflow 若需要自动路由，仍须另行实现并做 E2E 验证。

## R4-m01 — Active generated item count

**Status: RESOLVED。**

`scripts/scientific-audit.mjs` 现在从 inventory 派生 `activeGeneratedItems`，输出同时区分：

- `requiredActiveGeneratedItems: 0`
- `observedActiveGeneratedItems: 0`

当前 374 个 AI-generated item 全部为 `pending_review`，实际 active 数为 0。政策期望与观察事实不再共用一个硬编码字段。

## Activation disposition

Round 4 原列的 1 BLOCKER、4 MAJOR、1 MINOR 在当前实现层面均已关闭，未发现与这些修复直接相关的新问题。这个结论不覆盖其他 review 的历史未决项，也不把 machine packet 或 scorer 结构预检升级为科学/教学批准。

继续保持全部候选 `pending_review`、`createsCompetence=false`。只有四份绑定 review 均落盘后重新运行 `npm run audit:review-bindings` 得到 `PASS`，且独立 evidence/pedagogy/scientific 激活门槛均关闭，才可另行讨论 activation。
