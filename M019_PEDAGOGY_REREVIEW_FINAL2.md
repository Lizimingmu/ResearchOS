# M019 最终补充教学法验收（定向）

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_scope: 仅复核 `M019_PEDAGOGY_REREVIEW_FINAL.md` 的 B-01、B-02、B-03、M-01、M-03；M-02 仅列 human-only
- current_snapshot: `artifacts/curriculum-content-snapshot.json`
- current_state: `pending_review`
- deterministic_check: 定点检查当前 stimulus、逐 option feedback/scoring、审核用锁答模拟器、critical-error remediation 路由及 no-competence tests；未扩展历史扫描

## 结论

新增修复已把 **B-03 完整关闭**，并实质推进 B-02、M-01、M-03；但尚未达到可激活标准。当前仍有 **2 个 deterministic BLOCKER（B-01、B-02）** 与 **2 个 deterministic MAJOR（M-01、M-03）**。

保持 `pending_review` 且不写标准化能力仍然安全。把候选课程激活或让该评分器产生标准化能力，目前不安全。

## 逐项验收

| ID | 状态 | 当前严重度 | 定向证据 | 判定与剩余通过条件 |
|---|---|---:|---|---|
| B-01 · 真实 stimulus | **PARTIALLY_RESOLVED** | **BLOCKER** | 61/61 课均有三种可渲染格式；预览真实输出表头和 `rowsCn`。但格式名称没有保证材料真实存在。`staged-method-differential-analysis` 的 F2 仍是“给出 8 位供体的组别×批次表和一行 DESeq2 输出”，却没有 8 位供体行或 DESeq2 数值；`staged-method-kaplan-logrank` 仍写“给交叉曲线、风险表和 2 年风险差”，却没有曲线点或风险表；`staged-concept-confidence-interval` remediation 的 E1 要求“读取 20 次重复研究的区间图”，却没有 20 个区间。21/21 Method Apply 仍是 F1 输入名、F2 一句结果摘要、F3 诊断名的三行骨架。 | “表格可渲染”已解决，“材料足以独立作答”未解决。把被指称的供体行、系数/CI/FDR、风险表/曲线点、矩阵数值、区间端点真正写入结构化 stimulus；验收者不得补想缺失材料即可推出 expected options 和所需证据单元。 |
| B-02 · 可执行评分 | **PARTIALLY_RESOLVED** | **BLOCKER** | 已有可运行 `evaluateStagedAssessment`，能锁答、精确比较 option IDs、返回逐项反馈，并把 critical error 路由到 `remediation`；预览模拟器提交后禁用表单，且始终 `createsCompetence=false`。但是证据核对只验证 `rowId` 存在和文本长度 ≥8，未去重、未验证推理是否对应材料或构念；change-mind 也只检查长度。对 Confidence Interval Apply 实测：选择 expected IDs，再把同一个 A1 重复提交两次、两条都填无关内容，并填无关 change-mind，仍返回 `status=passed`、`nextRoute=complete`。 | 执行链已经出现，但仍可确定性伪通过。至少应按不同 row ID 去重；为每项定义 row-specific 可观察证据/关系；验证 change-mind 是否命中该构念的反证条件；加入“重复同一行、无关长句、只复述表格、正确选项但错误理由、critical+correct 混选”的负例测试。标准化能力不得由当前长度门槛产生。 |
| B-03 · 逐 option 诊断反馈 | **RESOLVED** | — | 183/183 assessment 的 option 均有反馈；1098 项反馈共有 755 个不同文本，每个 assessment 至少 5 个不同文本。反馈已在锁答后显示；抽查 Concept CI 与 Method differential analysis，near-miss/misuse/upgrade 均给出错误机制、题面行或诊断及修正方向。critical option 的反馈和 remediation 路由也已接通。 | 原“仅正/负通用话术且不送达”的问题关闭。跨课程重复措辞和 distractor 可猜性不在 B-03 继续计阻断，归入 M-03。 |
| M-01 · 三次测量相互独立 | **PARTIALLY_RESOLVED** | **MAJOR** | 每课 Apply/remediation/review 的 format 已三分：`case_table` / `evidence_matrix` / `decision_timeline`，61/61 均满足三种不同值；rows 的 ID 和角色说明也改变。可是 61 课全部使用同一个 role→format 映射，且内容仍常是“新场景/上一轮错误/必须核对”三行 meta-skeleton，而非真的病例数据、证据矩阵或时间序列；核心选项句式和最小行动仍高度复用。 | 结构标签已分离，测量操作尚未充分分离。至少在代表性原型中让 Apply 读取/计算实际数据、remediation 定位新的错误机制、delayed review 在无原术语/原句式时基于新表征更新决定；再用盲审证明不能靠 role 和固定选项骨架答题。 |
| M-03 · 去模板化中文与 distractor | **PARTIALLY_RESOLVED** | **MAJOR** | 构念特异反馈和 scoring 明显增加：partial-credit 有 103 个不同文本，stop-rule 有 143 个不同文本。残余模板仍构成稳定线索：40 个 Concept 的三个角色共 120 次逐字复用“主要结果方向一致时先写成稳定、可推广的结论……”；40 次逐字复用“预先写出可反驳结果……”反馈。许多正确/错误项仍沿“必须核对 / 只记录不行动 / 提前升级”固定槽位生成。 | 不再是 B-03 级空泛反馈，但仍可通过语气和位置识别选项。对 40 Concept 的共同 `premature` / `change` 槽位人工改写；让 distractor 对应各构念真实误用而非统一道德化错误；做去标签盲测，若审查者仅凭措辞可稳定猜正误则不通过。 |

## 新增执行与防误写检查

### 已通过的部分

- 审核模拟器在锁答后禁用输入，显示 `passed / partial / failed`、`nextRoute` 和逐项反馈。
- critical error 的确定性路径为 `failed → remediation`；已有测试覆盖一次通过与一次 critical failure。
- 模拟器明确是审核用途，不写学习状态；服务返回类型和实现均固定 `createsCompetence: false`。
- Preview 保持 pending banner；现有 no-competence 测试断言通过和 critical failure 两条路径均不创建能力。
- `npm run typecheck` 通过。

### 仍缺的反例保护

现有测试证明“正确输入能通过、critical option 能去 remediation”，但没有证明“貌似足量而无效的推理不能通过”。本轮直接调用当前评分器得到一个确定性反例：

1. 使用 CI Apply 的全部 expected option IDs；
2. 两个 evidence units 均引用同一个 `A1`；
3. reasoning 与 change-mind 均填长度足够但与 CI 无关的句子；
4. 当前结果仍为 `passed / complete`。

因此，no-competence 隔离足以保护 **pending 试制环境**，但不能把当前评分器本身视为标准化能力测量。

## 当前 deterministic 问题

### BLOCKER

| ID | 剩余问题 | 最小关闭标准 |
|---|---|---|
| B-01 | 多个 stimulus 仍指称不存在的表、图、矩阵或输出；格式名与三行外壳不能替代任务数据。 | 目标题仅凭实际 `rowsCn`/版本化图形可解；用 CI、Differential Analysis、Kaplan–Meier/Log-rank、PCA 四个原型先做独立复算验收，再扩展全库。 |
| B-02 | 评分器把“正确勾选 + 重复 row ID + 无关长句”判为通过。 | 去重证据行、核验 row→reasoning 关系和构念特异反证条件；加入上述对抗负例并确保均不得 `passed`，critical error 必须继续优先路由 remediation。 |

### MAJOR

| ID | 剩余问题 | 最小关闭标准 |
|---|---|---|
| M-01 | 三个 format 名称不同，但全库统一 role 映射和 meta-skeleton 仍泄漏题型。 | 三个角色需要不同的实际推理操作，而不只是不同 ID/列名；delayed review 应在新领域表征中强迫更新。 |
| M-03 | 120 次相同 distractor 与 40 次相同反馈形成可猜线索。 | 人工编辑共同槽位并做去标签盲测；选项应像真实常见误用，而不是靠“升级/只记录”语气暴露正误。 |

## M-02：HUMAN-ONLY

M-02 不作机器关闭，也不计入 deterministic BLOCKER/MAJOR。当前 14–28 分钟仍只是候选估时；必须由“医学研究生、统计/生信基础薄弱、当前 AI 依赖”的目标学习者完成计时与认知访谈。激活前需报告分位数、未完成率、提示/回看行为以及 Method 是否应拆成“读输出”和“审设计”；机器测试不能替代该证据。

## 安全与激活判定

- **继续 `pending_review`：安全。** 前提是 pending banner、预览隔离、`createsCompetence=false`、不进入正式 Today 均保持。
- **激活或写入标准化能力：不安全。** B-01 与 B-02 仍可确定性地产生“没有真实材料可推理”或“无效推理却通过”的情况。
- **可进入 human pilot 的条件：** 仅在 pilot 结果不写标准化能力、明确标注候选内容、保留原始回答，并先为 pilot 使用的原型补齐真实 stimulus 与评分反例保护时可进行。
- **可申请激活复审的条件：** B-01、B-02 全部关闭；M-01、M-03 完成人工盲审；M-02 完成目标学习者计时；同时继续通过 no-competence/critical-route 回归测试。教学通过不替代科学、来源和其他门槛。

## 最终判定

**B-03 RESOLVED；B-01、B-02、M-01、M-03 均为 PARTIALLY_RESOLVED；M-02 HUMAN-ONLY。继续 pending_review，禁止激活，禁止当前评分结果写入标准化能力。**
