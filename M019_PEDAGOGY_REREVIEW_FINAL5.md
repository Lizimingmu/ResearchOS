# M019 教学法稳定实现 FINAL5 复核

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_scope: 只读复核 B-02 fail-closed 行为与 M-01 回归；保留 B-01、M-03 既有边界
- current_snapshot: `artifacts/curriculum-content-snapshot.json`
- current_state: `pending_review`
- snapshot_byte_sha256: `c94358e6b35335a0a70c84d81c5e7fb9798467d687c1ac4fc4a84811ae86d4d2`
- claims_sha256: `ebaa525d5855963a975767d98fb433e12dcc46e30d36fe36fcfbb12e3ff0554d`
- source_registry_sha256: `4b2206782876550e22a57c2305a77a15d0dd03f0af75e0230936f36c0bda4c0f`

三项哈希均由当前工作树重新计算/读取并与指定绑定值一致；当前快照仍为 40 Concept、21 Method、12 Case，状态为 `pending_review`。

## 最终判定

| 项目 | FINAL5 判定 | pending 候选安全性 | 激活含义 |
|---|---|---|---|
| B-02 · 自动评分误完成 | **RESOLVED（fail-closed 合同）** | 安全：任何结构上可审的答案只得到 `review_required / human_review`，不会自动完成或产生能力 | **尚非完整激活通过**：人工审核工作流仍未实现，`recommendedNextRoute` 只是 display-only 建议 |
| M-01 · 三种语义 schema | **RESOLVED，未回退** | 安全 | 确定性 format/schema 门槛继续通过；实际迁移效度仍服从 human pilot |
| B-01 · stimulus 全库实化 | **保留原判：PARTIALLY_RESOLVED** | 四个完整原型可在隔离条件下试制 | 全库激活阻断仍在：其余候选未证明达到同等实化程度 |
| M-03 · 中文与 distractor 可信度 | **保留原判：PARTIALLY_RESOLVED / HUMAN-ONLY** | 可继续 pending 人审 | 激活前仍需目标学习者/领域审查者盲审，不能以字符串去重代替 |

因此，本轮确认的是 **pending fail-closed 安全闭环**，不是全库激活授权。

## B-02：fail-closed 已关闭自动误完成风险

### 返回合同

当前 `StagedAssessmentEvaluation` 的状态只允许：

- `review_required`
- `partial`
- `failed`

不存在 `passed`。建议路由只允许：

- `human_review`
- `retry`
- `remediation`

不存在 `complete`。此外返回值固定包含：

- `workflowImplemented: false`
- `createsCompetence: false`

结构条件全部满足时，服务返回 `status=review_required`、`recommendedNextRoute=human_review`、`requiresHumanReview=true`，而不是把答案判为正确或完成。

### FINAL4 通用 marker 伪答案复现

本轮原样复现 FINAL4 的 Confidence Interval Apply 伪答案：

1. 选择所有 expected options；
2. 为每个正确项使用其合法独立行与合法事实片段；
3. reasoning 明写“不解释事实关系”，只放入通用 marker“因此/若”；
4. change-mind 使用题目 criterion、反证句式和“更新”动作。

当前结果：

- `status=review_required`
- `recommendedNextRoute=human_review`
- `workflowImplemented=false`
- `requiresHumanReview=true`
- `createsCompetence=false`

它仍会通过“结构可送审”门槛，但**绝不会自动成为 `passed/complete`，也不会写入能力**。自由文本的事实—推理关系被明确留给独立人工评分。这正是对无法可靠自动语义评分的 fail-closed 处理。

对构造良好的答案复核得到同样的 `review_required/human_review`，说明机器不会因为文字看起来更好而自行宣布通过。选择 critical error 时结果为 `failed`、建议 `remediation`、`requiresHumanReview=false`、`createsCompetence=false`，也没有自动路由副作用。

### UI 与路由边界

预览 UI 已明确标成“审核用结构预检（不自动通过、不写入学习状态）”，结果区显示：

> `recommendedNextRoute=...（仅建议、未实现自动路由）`

代码中 `recommendedNextRoute` 除预览显示外没有消费者；没有导航、队列创建、人工任务创建或 learner-state 更新。`workflowImplemented=false` 与 UI 文案一致。

因此，`recommendedNextRoute` 是 **display-only**，不得解释为已经实现 `human_review` 或 `remediation` 工作流。这个缺口不破坏 pending 安全，反而使系统保持 fail-closed；但如果正式课程需要审核后继续进度，激活前必须另行实现并审计人工判定的身份、记录、版本绑定、复核与能力写入规则。

### B-02 状态解释

B-02 在 FINAL4 的核心阻断是“伪答案被机器标成 `passed/complete`”。当前类型、实现、UI 和测试共同消除了这条路径，所以 **B-02 的自动误完成问题判为 RESOLVED**。

该结论不表示机器已经能判断开放 reasoning 的语义正确性；相反，当前设计明确承认不能，并把任何候选成功结果封顶为 `review_required`。在人工审核工作流未实现前，标准化能力仍不得写入。

## M-01：RESOLVED，未回退

对当前 61 课、183 个 assessment 的全库结构回归结果：

- `case_table`：61 个；全部为 4 行、3 列、`C1–C4`。
- `evidence_matrix`：61 个；全部为 4 行、4 列、`E1–E4`。
- `decision_timeline`：61 个；全部为 4 行、3 列、`T0–T3`。
- schema violation：0/183。
- 61/61 课的 Apply/remediation/review 三种 format 互不相同。

三种格式继续使用各自的语义列：病例/样本比较、证据—对象—约束、时点—新增证据—决定更新。FINAL3 的“只旋转 format 字符串”问题没有回退，M-01 维持 **RESOLVED**。

这一确定性结论不替代 human pilot 对迁移效度的判断；它只确认结构与语义 schema 门槛持续关闭。

## 明确保留的问题

### B-01：仍是全库激活阻断

本轮不重评 B-01。沿用既有独立复核：Confidence Interval、Differential Analysis、KM/log-rank、PCA 四个原型已经补入可判读的真实数值、行、区间和风险表信息；其余候选尚未完成同等级、逐 assessment 的独立材料充分性验收。

四原型足以支持隔离、无能力写入的定向 pilot，**不足以推出全库可激活**。激活前仍需为剩余 assessment 实化材料，并由第二审查者仅凭 stimulus 复算预期答案。

### M-03：仍需 human-only 盲审

本轮不重评 M-03。exact duplicate 消除不等于 distractor 可信或中文自然。激活前仍需：

- 去标签盲审正误可猜性；
- 医学研究生目标学习者认知访谈；
- 领域审查者判断 distractor 是否对应真实常见误用；
- 必要的人工中文编辑。

M-03 不能由 lint、唯一文本计数或 fail-closed B-02 自动关闭。

## 剩余问题与激活边界

### 继续 pending_review：安全

必须持续满足：

1. 候选保持 `pending_review/pending/ai_generated` 并显示 pending banner。
2. 结构预检只返回 `review_required/partial/failed`，永不返回 `passed`。
3. `recommendedNextRoute` 继续标明 display-only；没有自动路由或隐式状态推进。
4. `createsCompetence=false` 保持为硬约束，预检结果不进入标准化能力记录。
5. 未完整实化的 assessment 不进入学习者 pilot。

### 全库激活：仍不通过

至少还需：

1. 关闭 B-01：从四原型扩展到全库的真实 stimulus 与独立可解性验收。
2. 关闭 M-03：完成领域中文/distractor 人工盲审与目标学习者认知访谈。
3. 如果激活后的评估需要形成完成/能力结果，实现真正的 human-review 工作流；在审核结果持久化、审查者身份、版本绑定、复核和错误恢复未定义前，`recommendedNextRoute=human_review` 只能显示，不能推进状态。
4. 完成既定 human-only 计时、迁移效度以及科学/来源等其他独立门槛；本报告不替代这些审核。

## FINAL5 结论

**B-02 的自动 `passed/complete` 风险已通过 fail-closed `review_required/human_review` 合同关闭，且 `createsCompetence=false`；M-01 继续 RESOLVED。当前 pending 候选隔离安全，但 B-01 只完成四原型、M-03 仍需人盲审，`recommendedNextRoute` 也只是 display-only。故本报告不授权全库激活或标准化能力写入。**

`npm run typecheck`：通过。
