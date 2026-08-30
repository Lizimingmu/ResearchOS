# M019 强制第二遍教学复审

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_pass: `FORCED_SECOND_PASS`
- baseline_review: `M019_INDEPENDENT_PEDAGOGY_REVIEW.md`
- baseline_snapshot_commit: `35750c3`
- current_content_input: `artifacts/curriculum-content-snapshot.json`
- source_boundary: 仅复核原 M019 所列教学/评估问题及当前对应修订；未读取生成理由、来源审计、科学审查或其他报告
- learner_profile: 医学研究生；系统统计/生信基础薄弱；当前 AI 依赖；中文优先但可做高级推理

## 结论

本轮不是对“改了多少字”的验收，而是检查原问题是否真正消失。当前修订已显著改善中文标题、先修关系、主题特异例子、Method 直觉和 Case 更新机制；但 **0/61 正式课达到可按现状交付的 `TEACHABLE` 门槛**。主要原因不再是主题覆盖，而是教学和测量没有形成可执行闭环：所谓 worked example 仍多为一句答案摘要，评估引用的表、图、矩阵或输出并未实际出现，且三次评估继续复用固定题型、固定正确项结构与完全相同的反馈。

因此，原 `WRONG_PREREQUISITE` 32 项中 31 项已解决，原 `REDUNDANT` 5 项全部解决，原 4 个弱 Case 全部解决；但原 `NEEDS_REVISION`、`TOO_SHALLOW`、`BAD_ASSESSMENT` 仍在全部 61 课上保留，原 `TOO_ADVANCED` 36 项仍保留。

## 状态定义

- `RESOLVED`：原问题在当前对应内容中消失，不再保留原标签。
- `PARTIALLY_RESOLVED`：有实质改进，但原判定门槛仍未通过，保留标签。
- `NOT_RESOLVED`：未见针对原问题的有效改变。
- `NEW_PROBLEM`：修订新引入或新暴露的问题；不用于掩盖原问题。

## 原问题闭环统计

| 原问题类别 | 原始 n | RESOLVED | PARTIALLY_RESOLVED | NOT_RESOLVED | 复审结论 |
|---|---:|---:|---:|---:|---|
| NEEDS_REVISION | 61 | 0 | 61 | 0 | 内容进步，但每课仍被评估/负担或 worked reasoning 阻断 |
| TOO_ADVANCED | 36 | 0 | 36 | 0 | 中文化与先修改善；高级概念仍压缩在 8–11 分钟且无逐步桥接 |
| TOO_SHALLOW | 61 | 0 | 61 | 0 | 增加了例子句和 Method 三步字段，但未展示中间推理或真实输出 |
| BAD_ASSESSMENT | 61 | 0 | 61 | 0 | 情境更特异，但刺激材料、角色独立性、反馈与评分仍不合格 |
| WRONG_PREREQUISITE | 32 | 31 | 1 | 0 | 仅 `staged-concept-cluster-stability` 仍缺聚类表征先修/内嵌教学 |
| REDUNDANT | 5 | 5 | 0 | 0 | Evidence/Claim、Claim Boundary、Cross-modal、Triangulation、两层 Pseudobulk 已分工 |
| Case 未强制更新 | 4 | 4 | 0 | 0 | 当前 12/12 Case 均有能迫使主张或下一步变化的新证据和版本 diff |

## 重新统计的当前标签（正式课 n=61）

标签多选，计数不互斥。

| 标签 | 当前 count | 相比原审 |
|---|---:|---:|
| TEACHABLE | 0 | 0 |
| NEEDS_REVISION | 61 | 0 |
| TOO_ADVANCED | 36 | 0 |
| TOO_SHALLOW | 61 | 0 |
| REDUNDANT | 0 | -5 |
| WRONG_PREREQUISITE | 1 | -31 |
| BAD_ASSESSMENT | 61 | 0 |

## 跨课程复核证据

### 已解决或实质改善

1. 40 个 Concept 的中文标题已补齐，原来 `titleCn` 英文主导的问题解决。
2. 32 个原先修问题中 31 个已按目标概念补齐或重排；Method 现在可引用前置 Method，例如 spline→linear regression、time-dependent AUC→ROC/AUC、GSEA→differential analysis、WGCNA→correlation。
3. Method 全部新增 `intuitionCn`、`workedExampleCn` 和 `walkthroughStepsCn`，不再只是输入/输出/误用清单。
4. 原 5 个重复候选已有清楚分工：Evidence vs Claim 教证据直接性/独立性，Claim Boundary 教句子改写；Concept Pseudobulk 教独立单位/聚合键，Method Pseudobulk 教设计矩阵与模型；Cross-modal 教构念与共享误差，Triangulation 教不同偏倚结构。
5. 4 个原 `PARTIAL_UPDATE` Case 已加入能改变判断的新证据，并要求保存 v0→v3 与逐步 diff。

### 原问题仍只得到部分解决

1. **worked example 仍未展示 worked reasoning。** Concept 的 `workedExampleCn` 通常是一句“输入＋正确结论”；Method 虽有三步字段，但第 1 步重述问题、第 2 步拼接输入和 core logic、第 3 步列输出与一个误用，未出现逐步计算、决策分叉或中间错误修正。
2. **刺激材料不在资产中。** 多个 Apply 写“给出 8 位供体表”“给交叉曲线”“读取共识矩阵”“四幅散点图”，但当前快照没有对应行列、数值、图或输出对象。学习者无法依据题面执行题目，评分者也无法复现同一任务。
3. **Concept 出现答案泄漏。** 40/40 Concept 的 `primaryApply.scenarioCn` 与 `workedExampleCn` 完全相同；学习者先读了正确结论摘要，再在相同句子上选择答案，测到的是识别而非应用。
4. **三次评估仍高度同构。** Concept 的 Apply–remediation、Apply–delayed review 平均各有 5/6 个选项逐字相同；Method 分别仍有 2/6、3/6 个选项逐字相同。所有 Concept 共用一个 prompt，所有 Method 也共用一个 prompt；每课三个角色的 feedback 在 40/40 Concept 和 21/21 Method 中完全一致。
5. **正确项结构可被模板学习。** 61/61 Apply 都是 6 选 3，正确项恒为“执行决定＋核对假设＋限制报告”；Concept 还恒有“definition boundary”正确项和“只记录不行动”干扰项。学习者可依措辞而非构念作答。
6. **反馈仍非诊断性。** 三条反馈只给“需要的决定、关键点/near-miss、论文核查”，没有按每个所选/漏选项解释为什么错，也没有根据推理文本决定补救路径。
7. **8–12 分钟负担更不可信。** Concept 仍需自由解释、checklist、6 选 3、证据短答、改变判断条件和 confidence；三角色仅选项文本平均约 703 个中文字符。Method 需要读新增教学、三步 walkthrough、6 选 3 和短推理，三角色选项平均约 499 字，却仍标 9–11 分钟。

## NEW_PROBLEM

| ID | 影响范围 | 新问题 | 阻断后果 |
|---|---|---|---|
| NP-01 | 40/40 Concept | 将 worked-example 正确摘要原样复制为 Apply scenario | 形成直接答案泄漏，无法估计独立应用能力 |
| NP-02 | 61/61 正式课 | 评估从 4 选 2 扩成固定 6 选 3，同时追加“用数字/设计论证＋写改变条件”，但时间估计未调整 | 表单负担增加；低基础学习者的速度/阅读能力混入目标构念 |
| NP-03 | 21/21 Method，部分 Concept | 新题声称提供表、图、矩阵或输出，但快照中只有对这些材料的文字指称 | 无统一 stimulus，题目不可实施、不可复现、不可标准化评分 |
| NP-04 | 12/12 Case | 统一要求四版完整答案、三次逐项 diff、相对支持、证据映射和七项 final task；12/12 finalTask 完全相同 | 虽迫使更新，但写作/工作记忆负担可能掩盖证据更新能力 |
| NP-05 | 大多数正式课 | 模板生成了不自然或逻辑松散措辞，如“把 P value 与 FDR 与不确定性一起报告”“直接升级……不再区分某 inappropriateWhen” | 干扰项的低可信度重新暴露答案，且降低中文可读性 |

## 40 个 Concept 逐项复核

状态缩写：`RES`=`RESOLVED`，`PART`=`PARTIALLY_RESOLVED`。`N/A/S/B/W/R` 分别表示原 NEEDS_REVISION / TOO_ADVANCED / TOO_SHALLOW / BAD_ASSESSMENT / WRONG_PREREQUISITE / REDUNDANT。

| Lesson | 原问题状态 | 当前标签 | 逐项证据 |
|---|---|---|---|
| `staged-concept-research-question` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 中文标题与 NSCLC PICO 例已补；直觉仍从“数据生成图/estimand”开始，worked=Apply，且未实际给缺字段表。 |
| `staged-concept-hypothesis` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 已加入机制→预测→反证；仍只给完成后的单句，三列表只被提及未提供，Apply 复读该句。 |
| `staged-concept-evidence-claim` | N:PART, S:PART, B:PART, R:RES | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 已与 Claim Boundary 分工并加入证据矩阵目标；矩阵无实际行列/判例，Apply 仍先呈现答案摘要。 |
| `staged-concept-association-causation` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 三节点 DAG 方向正确；DAG 本体未出现，estimand/后门路径仍需薄弱学习者自行补全。 |
| `staged-concept-exploratory-confirmatory` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 已具体到 20,000 特征与冻结时点；没有实际双流程决策表，评估继续以正确措辞识别为主。 |
| `staged-concept-statistical-unit` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 6×2×5000 与 n=6 的例子改善明显；直接给出 n=6，未展示由问题逐层排除单位的过程。 |
| `staged-concept-biological-technical-replicate` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 生物/技术重复均已覆盖；样本追踪表只在 remediation 中被指称，未作为可评分 stimulus。 |
| `staged-concept-pseudoreplication` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 已给 3+3 供体与两种 n；未给任何 SE/CI 数值或输出，不能观察学习者如何发现十倍差异。 |
| `staged-concept-population-sample` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 医院活检漏斗已具体；漏斗人数、选择关系和可推广判断没有被实际展开。 |
| `staged-concept-confounding` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 加入基线/治疗后变量与 DAG 目标；一次塞入 estimand、mediator、collider、最小调整集，8 分钟仍无逐步桥接。 |
| `staged-concept-selection-bias` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 已补 population-sample 先修和 800→520 失访；概率表/方向判断未提供，collider 仍直接出现。 |
| `staged-concept-internal-external-validity` | N:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 标题、先修和内部/外部分问均修复；四威胁分类材料未出现，Apply 仍只需认出正确原则。 |
| `staged-concept-effect-size` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 20% vs 15% 已给 RD/RR 和临床界值；worked 直接报答案，未让学习者完成计算和尺度选择。 |
| `staged-concept-standard-error` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | SD/SE 与细胞/供体区分已加入；没有抽样分布或两份输出，仍是结论句。 |
| `staged-concept-confidence-interval` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 数值例能支持兼容范围判断；覆盖直觉放到 remediation 的文字承诺中，20 条区间图不存在。 |
| `staged-concept-p-value` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | hypothesis 先修已补；worked 仍只是定义，零分布/检验统计量只在 remediation 被提及。 |
| `staged-concept-multiple-testing-fdr` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 1000/50 数值情境改善直觉；没有原始 P/q 表，也未展示 BH 或 family 决定。 |
| `staged-concept-power` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | hypothesis/P 先修与 observed-power 禁区已修；效应×方差×n 表未提供，10 分钟承载内容过多。 |
| `staged-concept-interaction` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 先修改为 effect-size 且有两亚组风险差；未给 2×2×2 表或正式 contrast 计算。 |
| `staged-concept-overfitting` | N:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 先修顺序和 0.91→0.68→0.63 例均改善；仍直接给诊断结论，未展示重采样中选择步骤。 |
| `staged-concept-data-leakage` | N:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 先修已改 overfitting，流程错误具体；未提供可定位节点的真实流水线，正确答案已在 worked 中出现。 |
| `staged-concept-validation` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 内部/内部-外部/外部类型已明确；角色表未提供，固定 boundary 选项仍能靠术语判断。 |
| `staged-concept-censoring` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | time-origin 已前置；9 分钟同时引入 right/left/interval、truncation、competing event，且 5 人时间线不存在。 |
| `staged-concept-hazard-ratio` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | effect/time/censor 先修已补；6 人 risk-set 表与交叉曲线没有实际数据，无法展示 HR 推理。 |
| `staged-concept-time-origin` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 日期例和 immortal time 已具体；Apply 与 worked 相同，学习者不需自己发现 31 天。 |
| `staged-concept-composition-state` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 混合公式已加入；没有实际 2×2 数值表，仍无法验证学习者能算出同一 bulk 值。 |
| `staged-concept-batch-effect` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | plate A/B 完全混杂例准确；没有样本×plate 表或桥接设计任务，Apply 先给不可识别结论。 |
| `staged-concept-bulk-mixture` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 加权平均目标已加入；权重和表达数字缺失，不能真正计算或区分解释。 |
| `staged-concept-rna-protein` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 0/6/24 h 时序改善具体性；无曲线数值，答案仍可由“不能删一模态”的措辞猜出。 |
| `staged-concept-cluster-stability` | N:PART, S:PART, B:PART, W:PART | NEEDS_REVISION, TOO_SHALLOW, WRONG_PREREQUISITE, BAD_ASSESSMENT | 已加 overfitting，但仍在未先教 clustering/距离/k/co-assignment 时要求读共识矩阵；矩阵也未提供。 |
| `staged-concept-pseudobulk` | N:PART, A:PART, S:PART, B:PART, W:RES, R:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 已与 Method 分工并补 composition/FDR；聚合表和 design matrix 仅被指称，worked 直接给聚合键。 |
| `staged-concept-cross-modal-validation` | N:PART, A:PART, S:PART, B:PART, W:RES, R:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 先修和与 Triangulation 的分工已修；模态×独立性矩阵未提供，validation/support 区分仍靠正确用词。 |
| `staged-concept-alternative-explanation` | N:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | evidence/causation 先修已补；四模型预测矩阵无内容，未展示新证据如何逐行改变权重。 |
| `staged-concept-claim-boundary` | N:PART, S:PART, B:PART, R:RES | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 已限定为句子逐词改写，与 Evidence/Claim 不再重复；只呈现改写后方向，未给可评分原句及修改轨迹。 |
| `staged-concept-robustness` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | multiverse/effect-CI 目标具体；实际变体、效应和 CI 均未出现，无法判断是否更新。 |
| `staged-concept-triangulation` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 偏倚矩阵和不同设计已写入目标；矩阵本体缺失，Delayed 又回到同患者多模态，选项仍同构。 |
| `staged-concept-minimal-sufficient-analysis` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 已加入成本/信息增益与分支动作；三分析成本表只在句中宣告，未让学习者实际比较。 |
| `staged-concept-evidence-redundancy` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 三类证据和依赖图目标清楚；依赖图缺失，评估仍可凭“三算法不是独立”的显眼措辞完成。 |
| `staged-concept-negative-result` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 效应/CI/重要界值例实质改善；worked 已给最终判断，Apply 没有新的数值任务。 |
| `staged-concept-ai-cognitive-outsourcing` | N:PART, S:PART, B:PART | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 已要求先独立审 AI 计划并跨域复习；AI 计划正文/代码/引用未提供，仍只能选择原则性正确项。 |

## 21 个 Method 逐项复核

所有 Method 原 `TOO_ADVANCED` 均为 `PARTIALLY_RESOLVED`：新增直觉和先修降低入口难度，但 9–11 分钟仍同时要求理解模型、假设、输出、诊断、审稿与跨域迁移。所有 Method 原 `TOO_SHALLOW`、`BAD_ASSESSMENT` 也均只部分解决：三步 walkthrough 不是实际 walkthrough，评估所称表/图/输出没有资产化。

| Lesson | 原问题状态 | 当前标签 | 逐项证据 |
|---|---|---|---|
| `staged-method-differential-analysis` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 先修补齐且有设计矩阵目标；8 供体表/DESeq2 行未提供，无法选择可估 contrast。 |
| `staged-method-correlation` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | stat-unit/effect 先修和四图目标已补；散点图不存在，Simpson/离群判断不可实施。 |
| `staged-method-linear-regression` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 去除 interaction 必需先修并补 effect/SE；系数表、编码和残差图均未提供。 |
| `staged-method-logistic-regression` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 先修和 OR/概率桥接改善；只有 40%、OR=2，缺基线概率/截距，无法按要求给绝对概率。 |
| `staged-method-cox-regression` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | risk-set 直觉良好；6 人表、Schoenfeld 诊断和曲线未提供，仍只选明显原则。 |
| `staged-method-kaplan-logrank` | N:PART, A:PART, S:PART, B:PART | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 已写乘积直觉和逐步计算目标；5 人表/交叉曲线/风险表均缺失。 |
| `staged-method-restricted-cubic-spline` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | linear-method 先修已补；rug、结点、CI 曲线未提供，4% 尾部不足以执行结点判断。 |
| `staged-method-bootstrap` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 重采样层和 validation 先修已补；三轮抽样/naive/校正数值无实际过程。 |
| `staged-method-cross-validation` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | overfitting/stat-unit 先修已补；“四条流水线”未出现，测试泄漏题不可评分。 |
| `staged-method-roc-auc` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | effect/CI 先修、ties 与校准已补；混淆矩阵、患病率和代价数据缺失。 |
| `staged-method-time-dependent-auc` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | ROC-method/time-origin 先修已补；1 年/5 年风险人数、AUC/CI/校准没有数值 stimulus。 |
| `staged-method-pca` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | stat-unit/effect 先修和几何直觉改善；3×2 矩阵、投影和 loadings 不存在。 |
| `staged-method-nmf` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | batch/overfit 已补且与 clustering 解循环；rank-2 矩阵、误差和共识数值缺失。 |
| `staged-method-clustering` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 已移除 circular prerequisite；缩放/距离结果和共识矩阵缺失，无法判断连续谱。 |
| `staged-method-gsea` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | differential/stat-unit 先修已补；10 基因排名、running sum 和置换结果未提供。 |
| `staged-method-gsva-ssgsea` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | stat/batch 先修与算法差异说明改善；4 样本表达表和分数输出缺失。 |
| `staged-method-wgcna` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | correlation/stat/batch/stability 先修已补；相关矩阵、软阈值和 module-trait 表无资产。 |
| `staged-method-pseudobulk` | N:PART, A:PART, S:PART, B:PART, W:RES, R:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 与 Concept 分工及 composition/FDR 先修已修；错误矩阵和聚合后输出未提供。 |
| `staged-method-differential-abundance` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | pseudo/FDR 先修与组成直觉已补；4×3 计数表、分母和模型结果缺失。 |
| `staged-method-trajectory-pseudotime` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | stat/pseudo/stability 先修已补；两根×两算法的四条顺序和供体结果未实际呈现。 |
| `staged-method-cellchat-communication` | N:PART, A:PART, S:PART, B:PART, W:RES | NEEDS_REVISION, TOO_ADVANCED, TOO_SHALLOW, BAD_ASSESSMENT | 全部关键先修和证据阶梯已补；网络、供体效应、组成变化和空间证据无实际数据。 |

## Case 强制更新复核

### 原 4 个弱 Case

| Case | 原问题 | 当前状态 | 证据 |
|---|---|---|---|
| `staged-case-topic-to-question` | conflict 是偏好而非证据，不能迫使问题更新 | RESOLVED | 新 conflict 指出匹配组织来自再次手术且存活者，必须收窄目标总体；validation 强制删除现有样本不能回答的字段。 |
| `staged-case-main-figure-chain` | 最后一阶段直接给四步正确链，更新不可观察 | RESOLVED | 现在限制每阶段四张图并要求删除共享数据冗余；新独立队列校准图迫使替换 panel 和重写证据任务。 |
| `staged-case-alternative-next-step` | validation 直接告诉学习者正确选择 | RESOLVED | 先提供成本×区分力（2/1/5 与 1/3/4）让学习者冻结选择，再揭示中心特异结局定义差异。 |
| `staged-case-ai-plan-audit` | 最后直接给标准重写方案 | RESOLVED | 现在要求校准前提交自有方案，并用 cut-point 不稳和 PH 违反迫使学习者解释拒绝哪些 AI 建议。 |

### 当前 12 Case 总判定

12/12 均达到 `FORCES_UPDATE`：每案均要求保存 v0→v3、逐阶段 diff、触发证据和撤回/新增判断；原 8 个强案例保持，原 4 个弱案例已补齐。Case 不再因“未迫使更新”阻断发布。

但出现 `NEW_PROBLEM NP-04`：12/12 使用完全相同的四版工作流和 finalTask。对于目标学习者，完整填写四版“问题、总体、单位、时间、主张、两个解释、相对支持、diff、下一步”等，测量中会混入写作速度和工作记忆。建议保留版本化机制，但每案只追踪 2–3 个与目标构念直接相关的字段；例如 Statistical Unit 只追踪独立 n、效应/CI、主张，Main Figure 只追踪图位、证据任务、共享依赖。

## 剩余阻断“可标准化能力判定”的项目

以下为 release blockers，须全部关闭后才能把任一正式课改判 `TEACHABLE`：

1. **P0 · 实际 stimulus**：每个引用表/图/矩阵/输出的 worked example 和评估必须包含可渲染、版本化的真实数据，而不是“给出一张表”的文字。
2. **P0 · 教学与测评分离**：Concept Apply 不得复制 worked example；同一数字、结论和正确措辞不得在作答前泄漏。
3. **P0 · 独立的三次测量**：Apply、remediation、delayed review 必须改变数据和推理操作，不得只替换场景句或选项中的第一/第二条件；Delayed 应允许不用原术语完成任务。
4. **P0 · 可执行评分规则**：为推理短答定义必要证据单元、关键错误、部分分和停止规则；不能仅凭选中固定 3 个选项判定掌握。
5. **P0 · 诊断性反馈**：反馈必须映射到每个选项和推理错误，并据错误类型路由到不同 remediation。
6. **P1 · 时间与拆课**：用目标学习者计时；无法在 12 分钟内完成教学、练习、反馈和再作答的 Method 拆成“读懂输出”和“审查设计”两课。
7. **P1 · Cluster Stability 先修**：在该 Concept 前加入基础 clustering 表征，或在课内实际教并展示距离、k、co-assignment 与共识矩阵。
8. **P1 · 去模板化中文**：删除固定的 boundary/partial/premature 句式和不通顺拼接，改成与具体数据相容的可信半正确选项。

## 发布判定

当前状态仍为 **not ready for standardized learner delivery**。本轮修订已把内容从“术语卡”推进到“具体教学设计说明”，但尚未推进到“可直接教学和可重复测量的课程资产”。下一步不应继续批量改写 61 份文案；应先把 Statistical Unit、Confidence Interval、Cross-validation、Pseudobulk 四课各做成含真实 stimulus、逐步 worked reasoning、独立三测和评分 rubric 的可运行原型。只有原型在目标学习者中能区分概念错误、表面猜测和真实迁移，才能解除全局 `BAD_ASSESSMENT` 与 `TOO_SHALLOW`。
