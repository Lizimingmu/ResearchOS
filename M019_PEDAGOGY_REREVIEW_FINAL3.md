# M019 最终差异式教学验收（FINAL3）

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_scope: 仅复核 `M019_PEDAGOGY_REREVIEW_FINAL2.md` 的 B-01、B-02、M-01、M-03
- current_snapshot: `artifacts/curriculum-content-snapshot.json`
- current_state: `pending_review`
- exclusion: 未重扫其他历史问题；未把 M-02 重新纳入机器判定

## 总结判定

| ID | FINAL3 状态 | 对 pending 候选的影响 | 对全库激活的影响 |
|---|---|---|---|
| B-01 · 真实 stimulus | **PARTIALLY_RESOLVED** | 四个原型可进入不写能力的定向 pilot | **BLOCKER**：四个原型的数据化不能代表其余 57 课/171 个 assessment 已关闭 |
| B-02 · 可执行评分 | **PARTIALLY_RESOLVED** | no-competence 隔离下可作审核模拟 | **BLOCKER**：仍可用抄写正确选项/criteria 的方式伪通过 |
| M-01 · 三次测量相互独立 | **PARTIALLY_RESOLVED** | role→format 单一线索已降低 | **MAJOR / 激活门槛**：旋转的是 format 标签，材料未必符合该格式的推理操作 |
| M-03 · 去模板化中文与 distractor | **PARTIALLY_RESOLVED** | 120/40 条逐字共同文案已消失 | **MAJOR / human-validation 门槛**：句法槽位仍高度固定，可信度尚未由人审证明 |

当前机器可确定的全库激活阻断仍是 **B-01、B-02**。M-01 存在机器可见的格式语义不一致，正式激活前也必须关闭；M-03 的最终关闭必须依赖人审，不能由 exact-string 指标替代。

保持 `pending_review`、审核模拟不写能力的前提下，候选环境仍然安全。**不得据此把全库设为 active/verified，也不得让当前模拟评分写入标准化能力。**

## B-01：PARTIALLY_RESOLVED

### 已解决的差异

四个指定原型已把原先被题面指称、但并不存在的材料实化：

- Confidence Interval：Apply 有 `5% / CI -2%–12%`；remediation 真实列出 20 个区间并标明其中 2 个未覆盖真值 2.0。
- Differential Analysis：Apply 给出 D1–D8 的组别、批次、GeneX 计数及 `log2FC=0.88, CI 0.42–1.34, P=0.0004, q=0.018`；remediation 给出技术重复展开和 batch/group 完全共线；review 给出多中心构成、效应、CI、P、q 与缺失率。
- KM/log-rank：Apply 给出 0/6/12/24 月风险人数、两组 KM 生存率、交叉时间、24 月风险差/CI 与 log-rank P；remediation 给出 5 位患者的事件/竞争事件/失访/行政截止记录；review 给出 cut-point 搜索和 bootstrap 稳定性。
- PCA：Apply 给出 6 个 PC1 score、batch/disease 完全重合与解释方差；remediation 给出缩放前后 SD、loadings 与解释方差；review 给出跨平台缺失特征、量纲改变和训练范围外特征数。

这些原型不再要求审查者想象缺失表、曲线或输出，B-01 在四个原型范围内关闭。

### 未解决的差异

本次修复明确只实例化四个原型，未建立全库的“材料充分性”约束。当前非原型仍可见原问题，例如：

- Correlation Apply 仍写“同一数据给出总体相关和按中心分层散点”，但未给总体/分层相关值或散点坐标。
- Cross-validation Apply 仍写“四条流水线中一条在训练折调参但全数据归一化”，但没有列出四条流水线供辨别。
- NMF Apply 只写 `rank=4` 与“稳定性差”，没有候选 rank 的共识/稳定性数值。

因此，四个原型可做受控 pilot，但不能外推为 183/183 assessment 都可独立作答。

### 关闭标准

为每个剩余 assessment 提供实际行、数值、时间点、矩阵单元或版本化图形；建立审计规则，验证 expected option 所依赖的每个事实均可追溯到 stimulus，而不仅验证“≥3 行/≥3 列”或“row[1] 不等于 scenario”。

## B-02：PARTIALLY_RESOLVED

### 已解决的差异

当前评分器已实现并验证以下约束：

- evidence unit 必须引用存在的 row ID；同一个 row ID 只能计一次。
- `supportsOptionId` 必须是本次已选中的正确 option。
- 原文短引至少 4 个规范化字符，且必须真实出现在对应 row。
- reasoning 至少 8 字，并须与所支持 option label 共享连续 4 字短语。
- change-mind 必须与该题 `changeMindCriteriaCn` 的某个 criterion 共享连续 4 字短语。
- 旧反例“重复同一 row ID＋完全无关长句”已加入负例测试并被拒绝。
- critical error 仍优先路由 `remediation`；审核模拟继续固定 `createsCompetence=false`。

`changeMindCriteriaCn` 在 183 个 assessment 中每项至少 2 条，共有 203 个不同文本；不再是全库一个通用 change-mind 句子。`npm run typecheck` 通过。

### 新的确定性伪通过

上述实现仍是字符串共现，不是 row→option 的证据关系评分。本轮直接调用当前评分器复现：

1. 选择 CI Apply 的全部 expected option IDs；
2. 分别使用不同的 A1、A2，因此通过 unique-row 检查；
3. 从 A1/A2 各抄 4 字真实短引；
4. reasoning 仅写“复述选项但未建立证据关系：”并复制对应正确 option label；
5. change-mind 直接复制一条 criterion，不写会改变决定的结果或更新动作。

当前仍返回 `status=passed`、`nextRoute=complete`、`acceptedEvidenceUnits=2`。原因是：任意 stimulus row 可以声称支持任意 selected-correct option；复制 option label 即满足“共享 4 字”；复制 criterion 即满足 change-mind。

审核 UI 的 evidence 输入还要求填写 raw option ID，placeholder 直接展示第一条 `expectedOptionId`。这对内部审核模拟可接受，但不能作为 learner-facing 标准化测量。

### 关闭标准

- 为 assessment 增加显式 `evidenceExpectations`：每个正确 option 允许哪些 row ID、必须提取什么关系/数值、不可接受哪些复述。
- 每个必选正确 option 至少需要一条被接受的证据，而不是只累计总证据数。
- change-mind 应验证“反证事实＋决定更新”，不能只命中 criterion 的任意四字窗口。
- 新增负例：两个不同 row＋复制正确 label、直接复制 criterion、事实短引正确但因果/方向关系错误、一个 option 用多行而另一正确 option 无证据。
- learner-facing 实现不得泄露 expected IDs；在完成前继续固定 `createsCompetence=false`。

## M-01：PARTIALLY_RESOLVED

### 已解决的差异

61/61 课的 Apply/remediation/review 均使用三个不同 format。全库不再是固定的 Apply=`case_table`、remediation=`evidence_matrix`、review=`decision_timeline`：

- Apply：25 `decision_timeline`、19 `case_table`、17 `evidence_matrix`
- Remediation：25 `case_table`、19 `evidence_matrix`、17 `decision_timeline`
- Review：25 `evidence_matrix`、19 `decision_timeline`、17 `case_table`

共有三种循环排列（25/19/17 课），因此仅凭 assessment role 不再能确定 format；原 role→format 单一线索已关闭。

### 未解决的差异

当前实现主要旋转 format 标签，没有同步改变材料的语义结构：

- CI Apply 标成 `decision_timeline`，但 A1/A2/A3 是“观察—团队行动—边界”，没有时间点或决策更新序列。
- Differential Analysis Apply 和 PCA Apply 也标成 `decision_timeline`，但仍是 F1 输入、F2 结果、F3 诊断的三行表。
- 其他角色继续复用 A/E/T 三行 meta-skeleton；format 名称变化本身不等于核心推理操作变化。

因此，格式线索减少是实质进步，但 delayed review 是否测迁移、remediation 是否测新错误机制，尚不能由旋转标签证明。

### 关闭标准

为三种 format 定义并校验不同 schema：`decision_timeline` 至少包含按时序出现的新证据和前后决定，`case_table` 至少包含可比较的病例/样本记录，`evidence_matrix` 明确 evidence×claim/diagnosis 的二维关系。format 必须由材料语义选择；分布平衡只能作为次要约束，不能靠重命名完成。

## M-03：PARTIALLY_RESOLVED

### 已解决的差异

FINAL2 指出的逐字共同模板已经消除：

- 原 120 次相同 distractor 不再存在。
- 原 40 次相同反馈不再存在。
- 当前 1098 个 option label 有 630 个不同文本，任一 label 最多重复 3 次；1098 条反馈有 794 个不同文本，任一反馈最多重复 3 次。最大重复均来自同一课的三个 assessment，而不是跨 40 课共用一句话。

精确去重这一机器可检验部分已关闭。

### 未解决的差异

固定句法槽位仍然明显：

- 120 个 option 以“必须核对”开头。
- 120 个 option 以“只记录”开头。
- 120 个 option 以“在完成……”开头并走“先写成稳定、可推广结论”的同一错误脚本。
- 63 个 Method option 以“输出方向符合预期时，直接升级为机制或临床价值”开头。
- 549 条反馈以“正确机制”开头，549 条以“错误机制”开头。

这不再是逐字重复，却仍可能让学习者通过语气、槽位和道德化错误模式猜题。是否为统计/生信薄弱医学研究生熟悉的真实误用，不能用唯一字符串计数证明。

### 关闭标准

机器 lint 可继续限制固定开头、跨课句法签名和选项位置规律；最终必须由中文领域审查者逐题判断 distractor 是否“局部合理但因构念原因错误”，并做去标签盲测。若审查者不看 stimulus 也能凭语气稳定猜正误，M-03 不通过。

## 全库激活与 pending 安全性

### 全库激活：不通过

当前仍有以下门槛：

1. **B-01 deterministic BLOCKER**：四原型数据化尚未扩展并验收到全库。
2. **B-02 deterministic BLOCKER**：复制正确 option/criterion 仍能伪造有效推理。
3. **M-01 deterministic MAJOR**：format 标签和材料语义不一致，独立测量未成立。
4. **M-03 human-validation MAJOR**：逐字去重已过，但 distractor 可信性和中文自然度未过人审。

### pending 候选：安全

在以下条件持续成立时，继续 pending 候选和四原型定向 pilot 是安全的：

- 页面继续明示 pending/read-only，不进入正式 Today。
- 审核模拟固定 `createsCompetence=false`，不写 learner state 或标准化能力。
- pilot 明示候选内容，保存原始回答供人审；不得把字符串评分当成能力结论。
- 未实例化真实材料的 assessment 不进入 pilot。

## 仍可机器修复与必须 human-only

### 可机器修复/验证

- B-01：补齐结构化数值、行、时间点和图形数据；增加 stimulus→expected-fact 可追踪审计。
- B-02：加入 option→allowed rows→required relation 的显式 rubric；拒绝复制 label/criterion 的对抗测试；确保每个正确 option 分别有证据。
- M-01：按 format schema 校验真实语义结构，拒绝仅旋转字符串；检查三个角色使用不同推理操作。
- M-03：检测固定开头、句法签名、选项位置、跨课相似度和 exact duplicates。
- 安全回归：pending banner、critical-error remediation、锁答与 `createsCompetence=false` 可继续自动测试。

### 必须 human-only

- 判断 stimulus 是否信息充分、无歧义，并由第二审查者仅凭材料复算预期答案。
- 判断 Apply/remediation/delayed review 是否真的测不同操作和迁移，而非学习模板。
- 判断 distractor 是否来自目标学习者的真实常见误用，中文是否自然、是否存在语气猜题。
- 对开放 reasoning/change-mind rubric 做双人评分一致性与认知访谈；纯字符串规则不能建立标准化效度。
- 目标学习者完成时间与是否拆课仍只能由 human pilot 得出；本项沿用 FINAL2 的 human-only 定位，不在本轮四项状态中另计。

## FINAL3 判定

**B-01 PARTIALLY_RESOLVED；B-02 PARTIALLY_RESOLVED；M-01 PARTIALLY_RESOLVED；M-03 PARTIALLY_RESOLVED。四原型和审核隔离均有实质进步，但全库激活仍不通过。继续 pending_review 安全；禁止当前评分写标准化能力。**
