# M019 独立教学与评估审查

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- snapshot_commit: `35750c3`
- review_input: `artifacts/curriculum-content-snapshot.json`
- learner_profile: 医学研究生；系统统计/生信基础薄弱；当前 AI 依赖；中文优先但可做高级推理
- scope: 40 个 Concept、21 个 Method 正式候选逐课审查；12 个 Case 全量抽查

## 审查边界与结论

本审查只使用冻结快照中的课程内容，不使用生成理由、来源审计、科学审查或其他报告。分类为多标签，计数不互斥。`TEACHABLE` 仅表示可按现状交付，不表示主题本身没有价值。

结论：**0/61 正式课可按现状交付。** 多数核心定义方向正确，可保留为改写素材；但当前产物更像术语卡和审稿清单，不是面向统计/生信薄弱学习者的 8–12 分钟微课。决定性缺陷是：没有真正的 worked example，教学深度不足以承接使用的高级术语，并且 Apply、remediation、delayed review 是同答案结构的换皮复测，不能证明迁移。

## 分类计数（正式课 n=61）

| 分类 | Count | 判定含义 |
|---|---:|---|
| TEACHABLE | 0 | 无一课同时通过教学、先修与评估门槛 |
| NEEDS_REVISION | 61 | 均需实质性改写，而非润色 |
| TOO_ADVANCED | 36 | 15 个 Concept 与 21 个 Method 在无桥接情况下使用高级统计/生信概念 |
| TOO_SHALLOW | 61 | 定义/清单代替解释，worked example 不展示推理 |
| REDUNDANT | 5 | 当前实现与另一课的学习目标或内容实质重叠 |
| WRONG_PREREQUISITE | 32 | 13 个 Concept、19 个 Method 存在缺失、倒置、循环或不必要先修 |
| BAD_ASSESSMENT | 61 | 题目不能有效区分理解、猜测和模板识别 |

## 跨课程证据

1. **直觉未真正早于术语。** Concept 虽有 `intuitionCn`，却常以“数据生成图”“estimand”“输入—转换—输出契约”“统计模型是压缩器”等未解释抽象语开始；40/40 Concept 的 `titleCn` 仍是英文或英文主导。Method 没有直觉段，也没有从临床问题到数据结构的桥。
2. **例子不等于 worked example。** 40 个 Concept 的例子只说“先写下观察、标出能区分的解释、再说明需要何种验证”，没有给定数字、逐步判断、错误路径或答案更新。21 个 Method 完全没有 worked-example 字段，只有清单。
3. **Apply 未测目标构念。** Concept 的正确答案恒为“操作化该术语”和“限制结论”，Method 恒为“核对首个假设”和“报告输出”；干扰项则是明显错误的“漂亮图/复杂模型”“直接升级机制”“只报显著”“把开发结果当临床价值”。学习者可不懂目标概念而凭语气作答。
4. **remediation 不是补救，delayed review 不是迁移。** 40/40 Concept 与 21/21 Method 中，三种角色的题干、选项文本、推理标准和反馈完全相同（仅场景和选项 ID 改变）。所有复习题还直接点名目标术语，不能测无提示检索或跨情境迁移。
5. **反馈解释主题，不解释选择。** 反馈通常重述“首先回答什么、关键误用、论文核查”，未逐项说明为什么某个干扰项在该情境下错、错会造成何种偏倚、在什么条件下可能成立。
6. **时间估计失真。** Concept 标为 8–10 分钟，Method 标为 9–11 分钟。按现有稀薄内容，点击可完成；若认真完成 Concept 的自由解释、checklist、多选、短推理和 confidence，薄弱学习者难在 8–10 分钟内得到反馈并修正。Method 若补齐必要推理，则 9–11 分钟不足以同时学习方法、假设、诊断和论文审查；应拆成“理解/读结果”和“审稿/选择方法”两课。
7. **表单负担与模板机械重复。** Concept 同时要求自由解释、四项 checklist、双选、短推理、confidence；负担集中在填表而非可观察推理。连续课程反复出现同样的“选两项＋限制结论”，会训练答题套路，并强化当前学习者对 AI 模板的依赖。

### 统一修复门槛

下表给出每课特定修复。除此之外，所有 `BAD_ASSESSMENT` 还必须同时满足：Apply 隐去术语名并要求对具体数据/设计作决定；remediation 针对 Apply 中最常见错误改用另一种表示（时间线、DAG、表格、图或短计算），而不是只换疾病；delayed review 至少跨一个数据模态或研究设计且不复用选项；干扰项必须是临床研究中可信的半正确做法；反馈逐项解释“为什么”和适用条件。未达到这些门槛，不应以换词方式移除 `BAD_ASSESSMENT`。

## 40 个 Concept 正式候选逐课 verdict

| Lesson | Verdict | 主要问题与精确修复 |
|---|---|---|
| `staged-concept-research-question` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | “直觉”先引入数据生成图和 estimand，例子没有形成可回答问题。改用“晚期 NSCLC、治疗前标志物、高/低比较、3 年死亡风险”逐步补齐总体、比较、结局、时间与 estimand；Apply 给三条缺项研究问题让学习者修写，复习改到诊断研究且不出现术语名。 |
| `staged-concept-hypothesis` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 没有展示假设如何导出可观察预测和反证。用“药物若抑制通路，则处理组在 24 h 的蛋白磷酸化下降；什么结果反驳它”作完整推理；Apply 要匹配机制假设、预测和可证伪结果，可信干扰项用方向正确但不可测的陈述。 |
| `staged-concept-evidence-claim` | NEEDS_REVISION, TOO_SHALLOW, REDUNDANT, BAD_ASSESSMENT | 与 Claim Boundary 在当前实现中都只教“不要越界”，没有区分证据直接性/独立性与句子边界。用“同队列 RNA、同队列蛋白、独立队列 IHC”证据表逐条升级一条 claim；评估让学习者给每条证据标直接性、独立性及可支持动词。若不补此区分，应与 Claim Boundary 合并。 |
| `staged-concept-association-causation` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | “输入—输出契约”不提供因果直觉，也无时间顺序/共同原因实例。用“重症度→治疗、重症度→死亡”的三节点 DAG，对比随机分配；Apply 要指出哪条路径阻止因果解释并选择可改变判断的设计，而不是选泛化的“限制结论”。 |
| `staged-concept-exploratory-confirmatory` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 没有同一数据决定在探索与确证中的后果。展示先看全组学后选 biomarker 与预注册单一 biomarker 的并排流程；Apply 要把特征选择、阈值、主要终点、分析集逐项标为事前/事后，并据此改写结论。 |
| `staged-concept-statistical-unit` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 层级例子可用，但没有让学习者算清独立 n。给“6 名患者、每人 2 块组织、每块 5000 细胞”的树和目标问题，逐步判断患者/组织/细胞何时是单位；Apply 要填写单位、聚类层和有效 n。 |
| `staged-concept-biological-technical-replicate` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | ID 暗示 biological/technical 对比，正文却只定义 biological replicate。加入“3 位患者×2 次建库×2 个技术孔”分类与各自能估计的变异；评估要求标记每个重复并判断增加哪类重复能回答目标问题。 |
| `staged-concept-pseudoreplication` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 没有展示伪重复如何缩小 SE。用 3+3 供体、每供体 1000 细胞的两种分析并排给出 n、SE/CI 的变化；Apply 给嵌套数据结构，让学习者选择聚合、混合模型或错误逐细胞检验并解释。 |
| `staged-concept-population-sample` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 当前例子仍是测量层级，不具体展示抽样和推广。改用三级医院单中心接受活检者样本，画目标总体→可接触总体→入组样本的漏斗；Apply 要圈出选择步骤并写最大可推广人群。 |
| `staged-concept-confounding` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | 直接使用 estimand/结构假设，未教共同原因与不当调整。用治疗—重症度—死亡 DAG，逐步比较未调整、调基线重症度、错误调治疗后炎症；Apply 要选最小调整集并说明 mediator/collider 风险。 |
| `staged-concept-selection-bias` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 未先建立总体/样本路径，仅抽象说条件化。先修增加 `population-sample`，再用“只有完成随访者进入分析”的选择节点图；Apply 给失访概率表，让学习者判断选择如何可能制造关联，remediation 改为病例对照抽样。 |
| `staged-concept-internal-external-validity` | NEEDS_REVISION, TOO_SHALLOW, WRONG_PREREQUISITE, BAD_ASSESSMENT | ID 指 internal/external，标题和正文只覆盖 internal；却缺总体/样本先修。增加 `population-sample`，拆成“样本内估计是否可信”和“能否运输到目标总体”两问；评估给四种威胁，分别归类 internal、external、两者或均非。 |
| `staged-concept-effect-size` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 生存模型泛例没有解释尺度和临床意义。给死亡率 20% vs 15%，逐步算 risk difference、risk ratio，并对照最小临床重要差异；Apply 要选择与问题匹配的尺度并解释绝对/相对效应为何给不同印象。 |
| `staged-concept-standard-error` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | 只给抽样变异定义，未与 SD 区分，也未显示聚类影响。用 6 位患者重复抽样的均值分布说明 SD vs SE，再比较按细胞和按供体计算；Apply 给两组软件输出让学习者选可辩护 SE 并指出单位。 |
| `staged-concept-confidence-interval` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | 直接给频率学覆盖定义，对薄弱学习者过陡。先用多次重复研究的 20 条区间图建立覆盖直觉，再解释单次区间；Apply 给效应 2.0、95% CI -0.5–4.5 和临床阈值 3，要求区分统计兼容性、精度和临床结论。 |
| `staged-concept-p-value` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 缺零假设/检验统计量先修，定义无法被操作。先修增加 `hypothesis`；用硬币或随机化分组的小型零分布逐步定位观测统计量；Apply 让学习者在四句真实研究表述中选正确解释并改写错误句。 |
| `staged-concept-multiple-testing-fdr` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | 没有数值直觉，也未区分 FDR 与单个发现为真。用 1000 次检验、50 个发现、q<0.05 的预期错误发现解释；Apply 给原始 P、BH q 和预定义检验族，要求决定哪些进入候选清单并限制单基因主张。 |
| `staged-concept-power` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 先修缺 hypothesis/P value，且没有展示效应、方差、样本量的关系。增加 `hypothesis` 和 `p-value`；用最小重要效应、SD、alpha、n 的方向性小表；Apply 要比较两个设计而非解释已观察 P 值，明确禁止 post-hoc power 充当证据。 |
| `staged-concept-interaction` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 把 confounding 设为必需先修不合适，反而缺 effect-size/尺度。改先修为 `effect-size`（confounding 可并列非必需），用治疗在男/女两组的绝对风险差和相对风险并排，展示交互依赖尺度；评估要求算两个组效应并判断在哪一尺度有交互。 |
| `staged-concept-overfitting` | NEEDS_REVISION, TOO_SHALLOW, WRONG_PREREQUISITE, BAD_ASSESSMENT | 依赖狭义 External Validation，教学因果倒置且例子仍是 HR 泛例。先用 42 个事件、120 特征的训练/测试表现落差建立过拟合，再讲验证；先修改为 `statistical-unit` 和 `effect-size`，External Validation 放在本课之后。Apply 比较训练、bootstrap 校正和外部表现。 |
| `staged-concept-data-leakage` | NEEDS_REVISION, TOO_SHALLOW, WRONG_PREREQUISITE, BAD_ASSESSMENT | 把 External Validation 作为先修未建立开发流水线。先修改为 `overfitting`，用“全数据填补→全数据筛基因→分折”的泄漏图与正确嵌套图；Apply 要在流水线中标出测试信息首次泄漏的位置，remediation 改为时间泄漏。 |
| `staged-concept-validation` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 定义虽正确，但未区分内部验证、内部-外部验证和真正外部验证。用同中心随机分割、按中心留一、独立时空队列三例比较独立性；Apply 给冻结/未冻结模型和新中心数据，要求给验证类型、可估指标及不能支持的外推。 |
| `staged-concept-censoring` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 在 time origin 前讲删失，且没有风险时间线。把 `time-origin` 前置或与本课合并；画 5 人进入、事件、失访、行政截止时间线，逐人写可知区间；Apply 判断行政删失与疾病相关失访何者更威胁可处理假设。 |
| `staged-concept-hazard-ratio` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 缺 effect-size/time-origin 先修，且只用一句否定“不是风险比”。增加两项先修；用两个事件时刻的风险集说明瞬时比较，再给曲线交叉例展示单一 HR 的限制；Apply 要区分 HR、固定时点风险比和中位生存差。 |
| `staged-concept-time-origin` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 没有展示错置 time zero 如何产生 immortal-time bias。用“诊断、开始治疗、移植”三日期时间线，逐步定义资格、分组、随访起点；Apply 让学习者修复从治疗开始才进入治疗组但从诊断计时的设计。 |
| `staged-concept-composition-state` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | 只有结论性一句，无混合量化直觉。用两类细胞的 `bulk = 比例×类内表达之和` 数值例，分别改变比例和类内表达得到相同 bulk 差异；Apply 给 bulk 与单细胞汇总表，要求判断哪些机制仍可兼容。 |
| `staged-concept-batch-effect` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 没有区分可校正批次与完全混杂、也无设计预防。用所有病例在 plate A、对照在 plate B 对比随机铺板；Apply 要判断是否可识别组效应并提出桥接样本/随机化，而不是泛称“做批次校正”。 |
| `staged-concept-bulk-mixture` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 例子覆盖多模态但未展示混合。用肿瘤/免疫细胞两组比例与表达的数字加权平均；Apply 给 bulk signature 增高，要求列出至少两个组成/状态解释以及能区分它们的测量。 |
| `staged-concept-rna-protein` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 只列转录/翻译/降解，未展示时间滞后和技术覆盖。用同一样本 0、6、24 h 的 RNA 与蛋白轨迹，逐步比较产生、降解和测量解释；Apply 要为不一致选择至少两个可检验解释，避免“任一模态错误”的假干扰项。 |
| `staged-concept-cluster-stability` | NEEDS_REVISION, TOO_SHALLOW, WRONG_PREREQUISITE, BAD_ASSESSMENT | `validation` 不足以理解重采样共识，且该概念在 clustering/NMF 前出现会形成隐性循环。先给最小 clustering 表征，再用 10 次重采样的 co-assignment 矩阵读稳定性；先修加入 `overfitting`，评估要求比较两种 k/预处理而非选“不要只看热图”。 |
| `staged-concept-pseudobulk` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, REDUNDANT, WRONG_PREREQUISITE, BAD_ASSESSMENT | 与 Method Pseudobulk 高度重复且缺 composition-state/FDR。若保留 Concept，只教“为什么供体是 n”并先修增加 `composition-state`；用 donor×cell type 原始计数聚合表。把设计矩阵、count model、FDR 移到 Method；Apply 要写聚合键和有效 n。 |
| `staged-concept-cross-modal-validation` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, REDUNDANT, WRONG_PREREQUISITE, BAD_ASSESSMENT | 当前内容只是 Triangulation 的模态版，未处理同一样本造成的共享偏倚。增加 `bulk-mixture`、`composition-state`、`evidence-claim` 先修；比较同样本 RNA/蛋白与独立样本 IHC 的独立性矩阵。若不能具体教构念对齐与共享误差，应并入 Triangulation。 |
| `staged-concept-alternative-explanation` | NEEDS_REVISION, TOO_SHALLOW, WRONG_PREREQUISITE, BAD_ASSESSMENT | 无先修却要求竞争模型与区分性证据。增加 `evidence-claim` 和 `association-causation`；用 biomarker–预后结果建立“真实状态/组成/批次/选择”四行预测矩阵；Apply 给一项新证据，要求逐行更新而非只列清单。 |
| `staged-concept-claim-boundary` | NEEDS_REVISION, TOO_SHALLOW, REDUNDANT, BAD_ASSESSMENT | 与 Evidence vs Claim 的当前学习目标重复，且没有练习具体动词。将本课限定为“把结果句改写到总体、时间、尺度、关系类型四边界”，用 abstract 前后版本逐词修订；评估给三句由 association 升级为 mechanism 的文本要求改写，否则与前课合并。 |
| `staged-concept-robustness` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 未区分合理敏感性分析与无穷多分析挑结果。用缺失处理、极端值、协变量集三项事先有理由的扰动，展示效应/CI 的 multiverse 小表；Apply 要决定哪项变化触及 estimand、哪项测试稳健性并更新结论。 |
| `staged-concept-triangulation` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | “偏倚结构不同”没有被操作化。用观察队列、自然实验、功能实验的目标构念—主要偏倚矩阵；Apply 让学习者从四项候选证据中选能改变主要偏倚的两项，并说明一致/不一致各如何更新。 |
| `staged-concept-minimal-sufficient-analysis` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 例子说“先判断缺什么”但没有决策过程。给三个替代解释、三种分析的成本和预期结果分支，逐步选择信息增益最高者；Apply 要提交“若 A 则停止、若 B 则升级”的决策规则，不再选泛化正确句。 |
| `staged-concept-evidence-redundancy` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 没有让学习者识别共享数据/共享误差。用“同一 bulk 数据换三算法”“新队列同 assay”“同样本正交 assay”三例画依赖图；Apply 要排序新增信息量并解释哪些偏倚仍共享。 |
| `staged-concept-negative-result` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 未显著的解释仍停在口号。给效应 1.5、95% CI -0.2–3.2、最小重要效应 2.0 与失访信息，逐步区分“不确定”“排除大效应”“支持等效”；Apply 让学习者从 CI 与等效界值写结论，干扰项用可信的“趋势”语言。 |
| `staged-concept-ai-cognitive-outsourcing` | NEEDS_REVISION, TOO_SHALLOW, BAD_ASSESSMENT | 例子仍由课程告诉学习者核对什么，未观察其独立审计能力。先给一份无提示 AI Cox 计划，要求学习者独立标出 time zero、cut-point、stepwise、泄漏和引用核验；反馈后 remediation 改为 AI 单细胞计划，delayed review 要求先手写最小方案再比较 AI。 |

## 21 个 Method 正式候选逐课 verdict

Method 的 `scientificQuestionCn` 和 misuse/reviewer checklist 多数方向正确，可保留为课后检查卡；但它们不能替代教学。下表的“拆课”均指至少拆成：A. 从问题和数据读懂方法；B. 从真实输出做判断/审稿。

| Lesson | Verdict | 主要问题与精确修复 |
|---|---|---|
| `staged-method-differential-analysis` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 先修缺 effect-size、standard-error、batch-effect。用 6 供体 RNA counts 的 design matrix、contrast、log2FC/CI/P/q 完整走一遍；Apply 给批次与组部分混杂的设计表，让学习者选 contrast、识别不可估项并解释一条结果。 |
| `staged-method-correlation` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 增加 statistical-unit 和 effect-size 先修。用四幅小散点图分别呈线性、单调非线性、离群点、Simpson/供体聚类；Apply 给图和数据层级，要求选 Pearson/Spearman/分层或“不汇总”，并逐项解释。 |
| `staged-method-linear-regression` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 把 interaction 设为基本先修过度，反缺 effect-size/standard-error。先教一元/多元均值模型，再把交互作为扩展；用真实系数表逐步解释单位、参照、CI、残差。Apply 要修一份变量编码和残差图，而不是选“核对函数形式”。 |
| `staged-method-logistic-regression` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 缺 statistical-unit、effect-size、CI 与验证基础。用 2×2 风险表连接 odds、OR、logit 和预测概率，再展示校准；Apply 给常见结局，要求判断 OR 能否近似 RR、换算绝对概率并检查事件/参数信息。 |
| `staged-method-cox-regression` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | 先修相对合理，但没有风险集计算或 PH 诊断。用 6 人事件表在两个事件时刻形成 risk set，解释 HR 来源，再给 Schoenfeld/交叉曲线；Apply 要从 time zero、事件数、PH 与绝对风险中找出两处具体缺陷。 |
| `staged-method-kaplan-logrank` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, BAD_ASSESSMENT | 没有计算 KM 阶梯或说明 log-rank 在曲线交叉时的含义。用 5 人事件/删失表逐步算两个 KM 台阶和风险人数；Apply 给交叉曲线、风险表与固定时点差，要求选描述量和检验限制。 |
| `staged-method-restricted-cubic-spline` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 只有 overfitting 先修，缺回归模型、effect-size 与函数形式。要求先完成至少一种 regression method；用结点、参照、尾部数据 rug 和带 CI 曲线读图。Apply 让学习者判断稀疏尾部“阈值”是否可辩护并选择敏感性结点。 |
| `staged-method-bootstrap` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 只先修 SE，缺 statistical-unit、pseudoreplication、validation。用 6 名患者有放回抽样三轮，明确每轮重复选择/拟合/评价；Apply 给 cluster 数据，让学习者选重采样层和哪些步骤必须嵌套，并比较 naive 与 bootstrap CI。 |
| `staged-method-cross-validation` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 增加 overfitting、statistical-unit 先修。用 preprocessing→feature selection→tuning→test 的嵌套折图；Apply 给四条流水线，其中可信干扰项是在训练折内调参但全数据归一化，要求定位泄漏并重画。 |
| `staged-method-roc-auc` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 只先修 validation，缺二元风险/效应和不确定性。用同 AUC、不同校准的两个模型及阈值混淆矩阵；Apply 要在给定患病率和误诊代价下选阈值，并说明 AUC 为什么不能回答校准/utility。 |
| `staged-method-time-dependent-auc` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 缺 `method-roc-auc` 与 time-origin 先修。先用 t=2 年定义动态病例/对照和删失个体，再解释 IPCW；Apply 给两个时间点的风险人数/AUC/校准，要求判断哪一时点估计可用以及不能宣称什么。 |
| `staged-method-pca` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 仅有 batch-effect 先修，缺 statistical-unit 与尺度/方差直觉。用 3 样本×2 特征中心化表手算/几何展示 PC1，再读 scores、loadings、解释方差；Apply 给缩放前后图，要求判断分离来自批次、组成还是目标组。 |
| `staged-method-nmf` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 以 cluster-stability 为唯一先修会隐性要求先懂 NMF/聚类。补 batch-effect、overfitting，并在课内先教矩阵近似；用 rank 2 小矩阵和多次初始化共识。Apply 比较两个 rank 的重构误差、稳定性和外部分配，不把“按结局选 rank”做唯一明显错项。 |
| `staged-method-clustering` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 把 cluster-stability 放在 clustering 前形成概念循环。先修改为 batch-effect、effect-size/尺度，稳定性放为本课后半或后续课；用同数据在不同缩放/距离下的簇变化。Apply 要读共识矩阵并判断连续谱可能性。 |
| `staged-method-gsea` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 仅 FDR 不足，缺 differential-analysis、statistical-unit 与置换直觉。用 10 基因有方向排名逐步画 running sum、leading edge 和置换单位；Apply 给供体/细胞层数据，让学习者选排名统计量和可交换单位并解释 NES/FDR。 |
| `staged-method-gsva-ssgsea` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 仅 bulk-mixture 先修，缺 statistical-unit、batch-effect 和基因集分数尺度。用 4 样本表达小表展示相对分数和批次影响；Apply 要比较样本级分数后选供体级模型，并把“通路活性”改写为相对表达 program。 |
| `staged-method-wgcna` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 只先修 association-causation，缺 correlation、statistical-unit、batch-effect、cluster-stability。用小相关矩阵→加权连接→module eigengene 的流程图；Apply 给模块与批次/细胞比例同时相关的结果，要求选保存性与组成敏感性检查。 |
| `staged-method-pseudobulk` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, REDUNDANT, WRONG_PREREQUISITE, BAD_ASSESSMENT | 与 Concept 重复，且缺 composition-state、FDR。把本课限定为操作 practicum：donor×cell type 聚合、design matrix、count model、低覆盖 QC、logFC/CI/FDR；Apply 给一张错误按细胞设计矩阵让学习者改正，Concept 只保留“为何聚合”。 |
| `staged-method-differential-abundance` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 缺 pseudoreplication 与 FDR，组成性只被点名。用 4 供体×3 细胞群计数表展示比例和分母依赖；Apply 要选择供体级计数/组成模型、指定检验族，并区分 abundance 变化与增殖机制。 |
| `staged-method-trajectory-pseudotime` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 仅 batch-effect 先修，缺 statistical-unit、pseudoreplication、cluster-stability。用同一快照在两个根和两种算法下产生不同顺序，另给真实时间标签；Apply 要比较根/供体一致性并将箭头结论改写为可验证状态转换假设。 |
| `staged-method-cellchat-communication` | NEEDS_REVISION, TOO_SHALLOW, TOO_ADVANCED, WRONG_PREREQUISITE, BAD_ASSESSMENT | 仅 composition-state 先修，缺 statistical-unit、pseudoreplication、batch-effect、evidence-claim。用“配体 RNA、受体 RNA、空间邻近、功能阻断”四级证据阶梯；Apply 给供体级重复与细胞比例变化，要求排序候选边并提出空间/功能验证，不能直接判机制。 |

## 12 个 Case：是否迫使学习者更新

判定标准：后续证据必须使先前答案中的至少一个具体成分（问题、解释权重、主张边界或下一步）发生可检查变化；仅重复“限制结论”或由 calibration 直接给答案不算强制更新。

| Case | Verdict | 审查与修复 |
|---|---|---|
| `staged-case-topic-to-question` | PARTIAL_UPDATE | 数据可收窄问题，但 conflict 是利益相关者偏好而非新证据，学习者可保持同一泛化答案。每阶段强制保存版本化 PICO/estimand，并要求指出具体新增/删除字段；把 conflict 换成“匹配组织者选择机制不同”之类会改变可回答总体的证据。 |
| `staged-case-evidence-to-claim` | FORCES_UPDATE | 调整后关联、RNA/scRNA 不一致、空间局部一致会依次改变直接性与细胞来源主张。保留；但要求提交每阶段 claim 原句及修改标记，避免只写“降级”。 |
| `staged-case-confounding-observational` | FORCES_UPDATE | 未调整效应→基线调整减弱→负对照提示残余混杂，确实迫使因果主张降级。增加 DAG 更新和“不得调治疗后炎症”的明确选择题，以观察 mediator 判断。 |
| `staged-case-statistical-unit` | FORCES_UPDATE | 极小逐细胞 P→单供体驱动→pseudobulk 宽 CI，迫使从确定差异更新为供体级不确定。要求每阶段记录有效 n、估计与 CI，而不只写解释。 |
| `staged-case-overfitting-validation` | FORCES_UPDATE | 开发 AUC→泄漏→波动→外部 AUC/校准失败形成清晰证据更新链。应让学习者在看到外部结果前先画无泄漏重估方案，避免最后只复述失败。 |
| `staged-case-negative-result` | FORCES_UPDATE | P=0.12、宽 CI、多重性与不均衡失访分别改变“无效”解释。增加最小临床重要效应/等效界值，要求在每阶段从三类结论中重选。 |
| `staged-case-omics-subtype-mechanism` | FORCES_UPDATE | 四簇→仅两簇稳定→外部只重现连续 program，强迫离散机制亚型主张降级。要求保存簇数、稳定性和 claim 三列更新记录。 |
| `staged-case-bulk-single-cell-discordance` | FORCES_UPDATE | 模态不一致与空间沉积证据迫使从“CAF 产生增加”转为“局部蛋白沉积、来源未定”。增加同一样本/独立样本标记，避免把共享偏倚当独立验证。 |
| `staged-case-composition-state` | FORCES_UPDATE | bulk signature→髓系比例→注释敏感性→within-state null，明确迫使组成与状态解释重新加权。要求每阶段给两解释的相对支持等级与下一项区分性测量。 |
| `staged-case-main-figure-chain` | PARTIAL_UPDATE | 更像结果筛选任务；通用的“两个模型/区分预测”提示与选 Main Figure 不匹配，最后一阶段直接给出四步正确链。改为每阶段只能保留固定图数并提交删留理由；最后提供新验证图而非直接告诉证据链。 |
| `staged-case-alternative-next-step` | PARTIAL_UPDATE | 有更新结构，但 validation 明说“中心分层和统一结局成本最低且区分三个解释”，把决策替学习者做完。先提供成本×预期结果矩阵让学习者选，再揭示实际结果并要求更新。 |
| `staged-case-ai-plan-audit` | PARTIAL_UPDATE | 前三阶段能暴露缺陷，但最后直接叙述正确重写方案，更新来自被告知答案而非独立审计。要求学习者在揭示校准前提交修订计划；delayed case 换成差异表达/单细胞 AI 计划以测迁移。 |

Case 汇总：`FORCES_UPDATE` 8/12，`PARTIAL_UPDATE` 4/12，0/12 完全不相关；但 12/12 共用同一套 reasoning/calibration/update/final-task 模板，仍有机械作答风险。强案例的证据序列可保留，必须增加“保存上一步答案＋标记本步具体变化＋说明哪条证据触发变化”的可观察更新机制。

## 发布判定

建议整体状态保持 **not ready for learner delivery**。最小可接受返工不是逐句润色，而是先完成 6 个代表性原型：Statistical Unit、Confidence Interval、Confounding、Cross-validation、Pseudobulk、AI Plan Audit。每个原型必须通过：中文直觉→具体数据→可见 worked reasoning→无术语提示的 Apply→不同表征 remediation→跨域 delayed transfer。原型经目标学习者认知访谈和答题证据验证后，再批量迁移；在此之前继续生成同模板课程只会扩大机械重复。
