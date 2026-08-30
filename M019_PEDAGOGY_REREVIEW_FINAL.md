# M019 最终差异式教学法复审

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_scope: 仅复核 `M019_PEDAGOGY_REREVIEW.md` 所列 P0/P1 与 Case final-task 问题
- current_snapshot: `artifacts/curriculum-content-snapshot.json`
- current_state: `pending_review`
- code_check_scope: 仅定点检查 stimulus/feedback/scoring 的预览渲染与审计约束；未广泛重扫课程内容

## 最终判定

**保持 `pending_review` 是安全的；提升为 active/verified 或允许写入标准化能力，目前不安全。**

本轮确认三项已完整关闭：61/61 Apply 均已与 worked example 分离；Cluster Stability 已补 `staged-method-clustering` 先修；12/12 Case 的 final task 已裁成各自 3 项且 12 套均不同。

仍有两个激活级阻断：

1. stimulus table 在 UI 中已经真实渲染为 `<table>`，但许多单元格仍是“给出某表/图/输出”的元描述，不是可计算或可判读的实际材料；尤其 63/183 个 Method assessment 的“当前结果”单元格逐字等于 scenario。
2. option feedback 与 scoring 字段虽完整存在，但当前预览只展示选项、最低证据数和 stop rule，不呈现逐项反馈，也没有提交、判分、部分分或 remediation 路由行为；而字段内容本身仍高度通用。

## P0/P1 差异验收

严重度定义：`BLOCKER` 表示阻止 active/标准化能力写入；`MAJOR` 表示不妨碍继续 pending 试制，但正式发布前必须关闭。

| 原门槛 | 当前状态 | 严重度 | 差异证据 | 最终判断 |
|---|---|---|---|---|
| P0 · Apply 与 worked example 分离 | RESOLVED | — | 当前 `workedExampleCn === primaryApply.scenarioCn`：Concept 0/40、Method 0/21；每课 Apply/remediation/review 情境均为 3 个不同字符串。 | 原答案泄漏已关闭。 |
| P0 · 实际、可渲染 stimulus | PARTIALLY_RESOLVED | BLOCKER | 183/183 assessment 都有 `case_table`、≥3 列、≥3 行；预览组件确实把列/行渲染成 `<table>`。但 Concept 表主要重排 scenario、near-miss、key-check；Method 表的“数据结构”是输入清单，“当前结果”仍是“给出 8 位供体表/交叉曲线/矩阵”等指称，实际行列、数值、图或模型输出未进入 stimulus。 | “渲染”已解决，“真实材料”未解决。不能据此实施声称的 contrast、曲线、矩阵或诊断任务。 |
| P0 · Apply/remediation/delayed 为独立测量 | PARTIALLY_RESOLVED | MAJOR | 三个情境均不同，选项数和正确项数已在 5/2、6/3、7/4 等组合间变化；但三者仍使用同一三行 meta-table 结构、同一最小充分行动骨架和相同 reasoning criteria。 | 已不再是逐字复制，但迁移证据仍可能被题型学习污染。 |
| P0 · 可执行评分规则 | PARTIALLY_RESOLVED | BLOCKER | 183/183 都有 `minimumEvidenceUnits≥2`、critical errors、partial-credit 文本和 stop rule；但全库只有 2 种 partial-credit 文本和 2 种 stop-rule 文本。预览页面是 read-only，没有答题提交、证据单元解析、选项判分或 remediation 路由。 | schema 完整，标准化评分行为未实现，且规则未细化到构念。 |
| P0 · 逐 option 诊断反馈 | PARTIALLY_RESOLVED | BLOCKER | 183/183 assessment 的 option ID 均有反馈映射；但每个 assessment 只有 2 种反馈语句（“属于最小集合”或“忽略/越界”），1098 个选项合计仅 10 种反馈文本。预览组件不渲染 `optionFeedbackCn`。 | 覆盖率已解决，错误诊断和实际送达未解决。 |
| P1 · 时间与拆课 | PARTIALLY_RESOLVED | MAJOR | 估时已从 Concept 8–10 / Method 9–11 改为 Concept 14/16/18/20 分钟、Method 20/22/24/26/28 分钟；不再虚称短课。但时间呈规则分档，未见目标学习者实测，且新增 stimulus、证据短答、confidence 与三次评估后的完成时间未知。 | 文案估时已修，经验校准未完成；Method 是否拆课仍未得到学习者证据。 |
| P1 · Cluster Stability prerequisite | RESOLVED | — | 当前先修为 `staged-method-clustering` 与 `staged-concept-overfitting`。 | 原唯一剩余先修缺口关闭。 |
| P1 · 去模板化中文 | PARTIALLY_RESOLVED | MAJOR | 正确项数不再固定，角色 prompt 有区分；但 option feedback、scoring rule 仍只用少数模板，部分选项继续出现“直接升级……不再区分某 inappropriateWhen”等不自然拼接。 | 不再阻断 pending 预览，但会暴露答案和削弱正式反馈质量。 |
| Case · 12 个 final tasks 裁剪 | RESOLVED | — | 12/12 Case 均为 3 项 final task，12 个签名全部唯一；任务已按 PICO、证据依赖、DAG、独立 n、泄漏、CI、cluster、模态、组成、Figure、成本、AI 审计分别裁剪。 | 原 NP-04 关闭；不再以通用七项表单混入工作记忆负担。 |

## 当前问题清单

### BLOCKER

| ID | 问题 | 通过标准 |
|---|---|---|
| B-01 | stimulus 是“有表格外壳、无任务数据”。表内重复说明应该出现什么，而非真正提供供体×批次行、风险表、系数表、曲线点、共识矩阵、排名或模型输出。 | 每个 assessment 引用的事实必须直接存在于 `rowsCn` 或版本化图形 stimulus；另一名审查者仅凭 stimulus 即可得到 expected options 和证据单元，不需想象缺失表/图。 |
| B-02 | 标准化评分没有产品行为。当前页面明确是 read-only staging，无提交、评分或能力写入；`scoringRule` 仅被显示成最低证据数＋stop 文本。 | 实现并验证：锁答→选项评分→证据单元核对→critical-error stop→部分分→错误类型路由 remediation；不得仅靠 expectedOptionIds。 |
| B-03 | option feedback 只有正/负两类通用文本，且 UI 不显示。不能解释某一 near-miss 为什么错，也不能区分统计单位、估计目标、选择偏倚或验证错误。 | 每个错误 option 有构念特异的“错误机制＋题面证据＋正确修正”；提交后实际显示对应反馈，并由错误类型选择不同 remediation。 |

### MAJOR

| ID | 问题 | 通过标准 |
|---|---|---|
| M-01 | 三次测量仍共享同一 meta-table 与行动骨架，可能测到题型熟悉度。 | Delayed review 至少更换一种 stimulus 表征与一个核心推理操作；在不出现原术语和原选项句式时仍能评分。 |
| M-02 | 估时虽上调，但未由目标学习者计时；Method 20–28 分钟是否需要拆为“读输出/审设计”未知。 | 用统计/生信薄弱医学研究生完成计时与认知访谈；按实测更新估时，若教学＋首次应用＋反馈不能稳定落在目标窗口则拆课。 |
| M-03 | 反馈与 distractor 中文仍由少数模板拼接，部分半正确项不够可信。 | 中文人工编辑；每个 distractor 对应真实常见误用，不能靠“直接升级机制”“只记录不行动”等语气稳定猜错项。 |

## `pending_review` 安全性

当前保持 `pending_review` **安全**，依据如下：

- 40 Concept、21 Method、12 Case 的 `lifecycle` 均为 `pending_review`，`verificationStatus` 均为 `pending`，`contentOrigin` 均为 `ai_generated`。
- 当前 Curriculum Preview 明示 read-only staging；页面没有提交、评分或能力写入动作。
- 页面 banner 明示“待科学审核 · 不进入正式 Today · 不计标准化能力”。

安全结论只适用于这些隔离条件持续生效。如果任何路由把候选课送入正式 Today、允许根据 `expectedOptionIds` 直接写能力、或隐藏 pending banner，则不再安全。

## 激活条件

以下均为必要条件；满足教学法条件不替代科学/来源/隐私等其他审核：

1. B-01 至 B-03 全部关闭，并为 183 个 assessment 做 stimulus→expected answer→feedback→remediation 的可追踪验收。
2. learner-facing 组件真实渲染 stimulus、收集回答、锁答、执行评分、显示逐项反馈；端到端测试证明 critical error 不会误写通过能力。
3. 评分 rubric 不再只有两套全局文本；每课定义可观察证据单元、常见错误和部分分边界，并完成人工双审一致性检查。
4. 至少完成代表性原型的目标学习者试测：Statistical Unit、Confidence Interval、Cross-validation、Pseudobulk；证明不是依措辞猜答案，且 delayed review 测到迁移。
5. 根据试测完成时间调整估时或拆课；在完成前保留当前 14–28 分钟为候选值，不作为服务承诺。
6. 保持已修复的两项结构门槛：Apply 不得重新复用 worked material；Cluster Stability 必须继续依赖 clustering。
7. 保持 12 个 Case 当前的三项、构念特异 final task，不回退到统一七项模板。
8. 通过独立科学与来源审核后，才可将 `verificationStatus`/`lifecycle` 从 pending 提升；教学审核本身不授权激活。

## 最终发布建议

**继续 pending_review；禁止 active、禁止标准化能力写入。**

当前修订已解决结构泄漏、唯一剩余 prerequisite 和 Case 表单负担，并建立了可渲染表格与评分 schema；但真实 stimulus、诊断反馈和评分执行仍是 BLOCKER。最短激活路径不是再改 61 课文案，而是先把四个代表性原型做成可运行的端到端测评，关闭 B-01 至 B-03，再把经验证的模式扩展到其余 57 课。
