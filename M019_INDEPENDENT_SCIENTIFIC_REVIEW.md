# M019 Independent Scientific Review

review_mode: TRUE_INDEPENDENT_REVIEW  
snapshot_commit: 35750c3  
review_scope: `artifacts/curriculum-content-snapshot.json`; `src/data/evidence.ts`  
review_disposition: DO_NOT_UNFREEZE  

## Severity counts

- BLOCKER: 2
- MAJOR: 19
- MINOR: 5
- STYLE: 0

本审查仅依据上述冻结内容快照和证据表，未读取生成理由、先前评价或其他审查报告。`pending_review` 状态未被当作降低科学标准的理由。以下只列需要修正的问题；没有用泛泛优点稀释主动找错结果。

## Findings

### 1. 批量概念题模板把统计概念误当成“队列内生物学主张”

- content_id: `staged-concept-p-value`（同一错误模板影响全部 40 个 `staged-concept-*` 概念课）
- severity: BLOCKER
- exact_problematic_claim: “当前最多支持对「P value」作有边界的队列内判断；在预定义验证或区分性证据出现前，不升级为机制、因果或普适性主张。”；同时正确选项固定为“操作化术语 + 限制当前设计主张”，错误选项固定为“样本行数、视觉分离度或模型复杂度”。
- why_wrong_or_misleading: P value、标准误、置信区间、功效、交互、删失等首先是统计定义、设计属性或模型量，不是等待“升级为机制”的队列内发现。该模板没有检验各概念的关键误解，反而制造范畴错误。相同结构覆盖 40/40 概念课，意味着学习者可以靠识别措辞模式答题而无需掌握科学内容。
- safer_corrected_formulation: 为每个概念重写专属情境、干扰项、反馈和最大结论。例如 P value 题必须区分 `P(data or more extreme | H0, model)`、`P(H0 | data)`、效应大小和重复性；CI 题必须考覆盖率与本次区间解释；功效题必须考预设效应、alpha、设计和信息量。删除“对术语作队列内判断/升级机制”的通用句。
- source_needed: `src-asa-pvalue` 的 claim-level 核验；并补充直接支持频率学 CI、标准误、功效和交互解释的统计方法来源，不能用一条通用报道指南覆盖全部概念。

### 2. `src-multiomics` 实际是 RNA-seq 综述，却被当作多组学总证据

- content_id: `src-multiomics`
- severity: BLOCKER
- exact_problematic_claim: evidence.ts 将 “A survey of best practices for RNA-seq data analysis” 设为 `id: "src-multiomics"`，其 `coreEvidence` 也只声称“Best-practice principles ... in transcriptomics”；冻结快照却在 82 个 guide、96 个 claim、12 个 concept lesson 和 2 个 case lab 中引用它支持多组学、蛋白组、单细胞、三角验证和一般科学推理。
- why_wrong_or_misleading: RNA-seq 最佳实践不能直接支撑蛋白推断、跨模态独立性、空间分辨率、单细胞供体层推断或多组学整合。错误的 source id 使大规模模板看似有证据，实质上把来源适用域扩张到原文之外；这是证据—主张矩阵的系统性污染。
- safer_corrected_formulation: 将该来源重命名为 `src-rnaseq-best-practices` 并仅用于 bulk RNA-seq 设计/QC/差异分析。多组学整合、单细胞、蛋白组、空间和跨模态主张分别映射到直接方法来源；无法直接支持的 claim 保持 unsupported/pending，不得借通用来源填充。
- source_needed: 多组学整合用 `src-mofa-plus`、`src-diablo` 及独立验证/数据泄漏来源；单细胞用 `src-single-cell-2023`、`src-pseudobulk`、`src-milo`；蛋白组需直接的蛋白推断、缺失机制和定量 QC 来源。

### 3. Interaction 评估没有检验交互

- content_id: `staged-concept-interaction`
- severity: MAJOR
- exact_problematic_claim: 正确答案仍是通用的“先按本研究的问题、时间与独立单位操作化 Interaction”与“把结论限制在当前设计和测量直接支持的范围”；干扰项是“用样本行数、视觉分离度或模型复杂度作为 Interaction 已经充分处理的主要证据”。
- why_wrong_or_misleading: 题目没有要求比较交互项、联合对比或预测边际，也没有测试“一个亚组显著、另一个不显著”不等于亚组间差异。学习者可完全不知道加法/乘法尺度、链接函数和交互检验仍答对。
- safer_corrected_formulation: 给出两个亚组的效应估计、CI 和交互检验，要求判断所选尺度上的效应修饰；明确分别报告亚组内 P value 不能代替正式 interaction contrast，并要求说明尺度依赖性与预设/多重性。
- source_needed: 直接的 interaction/effect-modification 方法学来源；观察性因果问题还需 DAG/estimand 来源，不能只用 `src-asa-pvalue`、FDR 和 STROBE。

### 4. Power 评估没有区分事前功效与事后结果解释

- content_id: `staged-concept-power`
- severity: MAJOR
- exact_problematic_claim: “当前最多支持对「Power」作有边界的队列内判断；在预定义验证或区分性证据出现前，不升级为机制、因果或普适性主张。”
- why_wrong_or_misleading: 功效是给定真实效应、alpha、设计、方差/事件率与分析规则下的长期拒绝概率，主要用于设计或敏感性；它不是队列内主张，也不能用观察到的效应做“事后功效”来判定阴性结果可信。现有评估未测试这些核心边界。
- safer_corrected_formulation: 要求学习者根据最小重要效应、alpha、独立单位、事件/失访和计划检验说明事前功效或样本量；结果阶段以效应及 CI 讨论信息量，不用 observed power 给结果背书。
- source_needed: 直接的样本量/功效设计来源；预测模型场景可用 `src-pmsampsize`，一般假设检验需另补设计型功效来源。

### 5. Selection Bias 定义被缩窄为 collider conditioning

- content_id: `staged-concept-selection-bias`
- severity: MAJOR
- exact_problematic_claim: “进入样本、留在随访或进入分析同时受相关变量影响时，条件化可能制造或扭曲关联。”
- why_wrong_or_misleading: 这描述了选择变量作为共同结果时的 collider/selection mechanism，但 selection bias 还包括抽样框覆盖不足、差异参与、病例/对照选择、差异失访及纳入分析的机制与目标 estimand 不相容。把两者等同会让学习者漏掉不以显式 collider 调整呈现的选择问题。
- safer_corrected_formulation: “选择偏倚是由于进入研究、留在随访或进入分析的机制使目标对照不再可识别；当选择变量是暴露与结局或其原因的共同结果时，条件化可开启 collider 路径。应分别画出抽样/失访机制并说明目标总体和 estimand。”
- source_needed: `src-dag` 的 claim-level 支持，加上直接的 selection bias/attrition/target-population 方法来源；STROBE/CONSORT 是报告框架，不足以单独定义因果结构。

### 6. 混杂案例提出调整治疗后变量，却没有指出 mediator/collider 风险

- content_id: `staged-case-confounding-observational`
- severity: MAJOR
- exact_problematic_claim: “调整基线严重度后效应减弱；团队还准备调整治疗后的炎症变化。”随后只给通用校准：“冲突证据不应被平均掉；它用于暴露测量层、组成、选择或模型灵活性。”
- why_wrong_or_misleading: 治疗后的炎症变化可能是中介、治疗与未测原因的共同结果，或受早期结局影响。若目标是总治疗效应，直接调整会阻断中介路径或引入 collider bias；若目标是直接效应，则还需额外识别假设。该案例恰好放入高风险变量，却没有给出专属纠错标准。
- safer_corrected_formulation: 在校准中明确：“先定义总效应还是直接效应并画时间化 DAG；总效应模型通常不调整治疗后中介。若估计直接效应，需说明中介—结局混杂、暴露诱导混杂和相应方法，不能把治疗后变量当普通基线协变量。”
- source_needed: `src-dag`、`src-target-trial`，以及直接的 mediation/time-varying confounding 方法来源。

### 7. External Validation 的定义允许把普通同源 holdout 误叫外部验证

- content_id: `guide-v1-m02-t29`
- severity: MAJOR
- exact_problematic_claim: “在开发过程之外的数据、地点或时间中按冻结模型评价表现和校准。”
- why_wrong_or_misleading: “开发过程之外的数据”可能只是从同一来源随机留出的 test split；这通常仍属于内部验证，不能证明跨场景 transportability。外部验证的关键是独立参与者/样本、开发过程完全隔离，以及对目标使用场景具有可解释的时间、地点或设置差异。
- safer_corrected_formulation: “外部验证应在开发及任何特征选择/调参均未接触的独立参与者或样本中，按冻结模型评估区分、校准和临床效用，并明确其与目标使用场景的时间、地点、机构、纳入和结局测量差异；同源随机 holdout 属内部验证。”
- source_needed: `src-tripod-ai`、`src-probaST`、`src-pm-external`；若保留预测模型以外的‘验证’，需另给领域专属定义。

### 8. Censoring 被错误地等同于右删失

- content_id: `staged-concept-censoring`
- severity: MAJOR
- exact_problematic_claim: “只知道事件时间超过观察界限；有效推断要求删失机制在条件假设下可处理。”
- why_wrong_or_misleading: “只知道事件时间超过某界限”只定义 right censoring。一般删失还包括 left censoring 和 interval censoring；另需与 competing event、truncation 区分。把一种情形写成总定义会导致错误选择 KM/Cox 或错误风险集。
- safer_corrected_formulation: “删失表示事件时间仅部分已知：右删失为晚于某时点，左删失为早于某时点，区间删失为落在区间内。方法必须匹配删失类型，并说明条件独立/非信息删失假设；竞争事件与左截断不是删失的同义词。”
- source_needed: 生存分析教材或方法论文，需直接覆盖 right/left/interval censoring、left truncation 和 competing risks；`src-cox` 单篇不足以支撑完整定义。

### 9. Pseudobulk 把聚合层固定为 donor×cell type，忽略多样本/配对设计

- content_id: `staged-method-pseudobulk`
- severity: MAJOR
- exact_problematic_claim: “在供体×细胞类型内汇总计数，再以供体为复制拟合计数模型。”
- why_wrong_or_misleading: 当同一供体有多个时间点、组织、处理或批次时，直接聚合到 donor×cell type 会抹掉条件内变化并混合不同实验单位；反之，把这些样本当独立供体也会伪重复。pseudobulk 的聚合层应首先保留最小生物样本/条件单元，再在模型中处理 donor 的配对或随机/固定效应结构。
- safer_corrected_formulation: “按 `biological sample × condition/time × cell type` 汇总原始计数；独立复制层由设计决定。若同一 donor 提供多样本，模型需保留配对/重复测量结构，不得在聚合时抹去条件，也不得把样本数冒充 donor 数。”
- source_needed: `src-pseudobulk` 加上配对/重复测量单细胞 pseudobulk 的直接方法来源；bulk 计数模型可用 `src-deseq2`/`src-edger` 支持设计矩阵部分。

### 10. Composition-vs-state 案例把“未见清晰差异”留作可暗示无状态变化的证据

- content_id: `staged-case-composition-state`
- severity: MAJOR
- exact_problematic_claim: “单细胞显示髓系细胞比例增加，但每类髓系细胞的 signature 分数相近。”以及“供体级 pseudobulk 未见清晰 within-state 表达差异。”
- why_wrong_or_misleading: 相近分数或 FDR 不显著不等于状态等效；需要供体级效应、CI、最小重要差异和信息量。捕获效率、细胞注释、每供体细胞覆盖及 compositional constraint 也会改变“比例增加”。当前案例没有提供这些量，却可能诱导“只有组成改变、没有状态改变”的二分结论。
- safer_corrected_formulation: “现有结果与组成变化相容，但对 within-state 改变证据不足；报告每供体丰度和 pseudobulk 效应及 CI，预定义等效界值后才能支持‘无有意义状态变化’。同时评估捕获/注释敏感性和组成模型。”
- source_needed: `src-pseudobulk`、`src-milo`、`src-single-cell-2023`；如要作无差异/等效结论，还需等效检验与区间解释来源。

### 11. Normalization 把“多数特征不变”泛化为所有方法/模态的共同假设

- content_id: `guide-v1-m06-t06`
- severity: MAJOR
- exact_problematic_claim: “将技术尺度调整到可比较表征，依赖‘大多数特征如何变化’等假设，不是把数据变真实。”
- why_wrong_or_misleading: “多数特征不变/对称变化”是某些 library-size/composition normalization 的关键假设，但不是 spike-in、housekeeping、quantile、CLR、单细胞 deconvolution 或不同蛋白组归一化方法的统一前提。跨 RNA、蛋白、代谢、单细胞使用一个模糊假设会掩盖方法选择与 estimand。
- safer_corrected_formulation: “归一化目标和假设依模态与方法而异：需明确要校正的技术因子、参考尺度，以及稳定大多数特征、参考特征、spike-in 或 compositional reference 等具体假设；不能把一个模态的归一化规则迁移到全部组学。”
- source_needed: `src-deseq2`、`src-edger`、`src-sctransform` 以及模态专属蛋白组/代谢组归一化来源；`src-batch` 不能代替具体归一化方法学。

### 12. Molecular subtype 把连续轴也定义成“亚型”

- content_id: `guide-v1-m06-t15`
- severity: MAJOR
- exact_problematic_claim: “亚型是可重复的分子分类或连续结构描述，必须证明稳定、可分配和有增量意义。”
- why_wrong_or_misleading: subtype 通常指可操作的离散类别；连续 program/axis 可以稳定且有生物意义，但不应因可重复就自动称为 subtype。把两者合并会鼓励从连续异质性强行切组，并用数据驱动 cut-point 制造预后差异。
- safer_corrected_formulation: “先检验结构更符合离散类别还是连续轴。只有存在稳定、可冻结分配、可在独立数据复现的离散类别时称 subtype；若主要结构连续，应报告 program/score/axis，不作任意二分。”
- source_needed: `src-clustering`、`src-nmf`，并补充分子分类稳定性、可迁移分配器和连续-vs-离散结构的直接方法来源。

### 13. Enrichment analysis 条目混淆 ORA 与 GSEA

- content_id: `guide-v1-m06-t19`
- severity: MAJOR
- exact_problematic_claim: “检验候选列表是否相对明确背景集富集；背景和选择过程决定零分布。”来源却含 `src-gsea`，相邻下一节才单列 GSEA。
- why_wrong_or_misleading: 该句描述候选列表相对 universe 的 over-representation analysis，而 GSEA 使用全排序列表和不同置换/零模型。若标题只写“Enrichment analysis”且以 GSEA 来源支持，学习者容易混用背景集、置换单位、效应方向和 FDR 解释。
- safer_corrected_formulation: 将本节明确命名为“Over-representation analysis (ORA)”，说明 universe、列表选择阈值和超几何/Fisher 型零模型；下一节独立说明 ranked-list GSEA 的 ranking statistic、phenotype/gene-set permutation 和 NES/FDR，禁止互换。
- source_needed: ORA 的直接统计方法来源；GSEA 仅用 `src-gsea` 支持 ranked-list 方法，`src-camera` 可用于说明 competitive gene-set testing 与基因相关性。

### 14. Cell QC 未覆盖会制造假 marker/假细胞群的核心伪影

- content_id: `guide-v1-m06-t34`
- severity: MAJOR
- exact_problematic_claim: “基于测序深度、线粒体比例、复杂度和异常模式识别低质量细胞，但阈值需与组织和协议一致。”
- why_wrong_or_misleading: 该“Cell QC”定义只覆盖 per-cell summary metrics，没有明确 doublets/multiplets、ambient RNA、dissociation stress、empty droplets 和 sample-level QC。这些伪影可以直接制造混合细胞群、假 marker、假通信和条件差异，不能被“异常模式”一词安全代替。
- safer_corrected_formulation: “QC 应同时包含 sample-level 指标、empty droplet/cell calling、低质量细胞、doublet/multiplet、ambient RNA、dissociation/stress 与异常样本；阈值按组织/协议设定并做敏感性分析。去除或校正不得使用结局标签来优化分离。”
- source_needed: `src-scrna-best`、`src-doubletfinder`、`src-soupx`、`src-single-cell-2023`；必要时补充 cell-calling 和 dissociation bias 来源。

### 15. 高 AUC 案例提供外部性能点估计却不给精度

- content_id: `staged-case-overfitting-validation`
- severity: MAJOR
- exact_problematic_claim: “外部小队列 AUC=0.63，校准斜率明显低于 1。”
- why_wrong_or_misleading: “小队列”没有样本数、事件数、CI、预测时间和校准曲线不确定性。AUC=0.63 与 slope<1 可由严重过拟合、case mix 变化、随机误差或结局/随访差异共同造成；没有精度时不能把点估计当作明确失败机制证据。
- safer_corrected_formulation: 提供独立队列的参与者/事件数、预测时间、AUC/C-index CI、calibration-in-the-large、slope 与平滑校准曲线及 CI，并要求区分过拟合与 case-mix/measurement shift；小样本仅允许表述为“不精确且与乐观开发表现不一致”。
- source_needed: `src-calibration`、`src-probaST`、`src-pm-external`、`src-tripod-ai`。

### 16. Data Leakage 内容没有引用现成的 leakage 方法来源

- content_id: `guide-v1-m03-t27`
- severity: MAJOR
- exact_problematic_claim: “训练或选择过程使用了预测时不可获得的信息，使内部表现带入未来或测试信息。”却引用 `[src-asa-pvalue, src-multiple-testing, src-strobe]`，未引用 evidence.ts 已存在的 `src-leakage`。
- why_wrong_or_misleading: 现有三条来源分别讨论 P value、FDR 和观察研究报告，不能直接支撑数据泄漏的定义、类型和预防；这正是批量来源模板未按 claim 匹配的实例。
- safer_corrected_formulation: 保留定义，但把主来源改为直接的数据泄漏论文；另明确 target leakage、temporal leakage、subject/sample leakage，以及预处理/特征选择必须嵌套在训练折内。
- source_needed: `src-leakage` 为必需主来源；预测报告可辅以 `src-tripod-ai`/`src-probaST`。

### 17. Events-per-parameter 内容遗漏直接样本量来源

- content_id: `guide-v1-m03-t46`
- severity: MAJOR
- exact_problematic_claim: “事件提供主要信息，但简单固定阈值不能替代基于收缩、预期性能和参数数的样本量论证。”却引用 `[src-asa-pvalue, src-multiple-testing, src-strobe]`。
- why_wrong_or_misleading: 这三条来源不直接给预测模型样本量或 shrinkage/optimism 论证；evidence.ts 已有与该 claim 高度匹配的 `src-pmsampsize`。当前映射会让正确主张处于无直接支持状态。
- safer_corrected_formulation: 明确区分关联模型的精度/检验功效与预测模型开发的样本量目标；对后者依据 outcome frequency、候选参数、预期 R²/性能和目标 shrinkage 计算，而非固定 EPV。
- source_needed: `src-pmsampsize`；外部验证精度另用 `src-pm-external`。

### 18. “竞争解释”错误引用 competing-risk 论文

- content_id: `guide-v1-m01-t14`
- severity: MAJOR
- exact_problematic_claim: “同时列出能解释同一观察的多个机制，优先设计能使它们产生不同预测的证据。”来源包含 `src-competing`。
- why_wrong_or_misleading: `src-competing` 是 Fine–Gray competing-risk subdistribution hazard 模型，不是“competing explanations/alternative hypotheses”的来源。词面相似导致的错误映射会伪装证据支持，也说明模板匹配没有做语义审查。
- safer_corrected_formulation: 删除 `src-competing`；将该节建立在可证伪预测、替代解释、因果图与区分性实验设计上。生存分析的 competing risks 只用于 `guide-v1-m03-t44` 等相应内容。
- source_needed: `src-dag`，以及直接讨论 alternative explanations、severe tests 或 discriminating experiments 的科学推理来源。

### 19. C-index 的全部来源均不直接支持该定义

- content_id: `guide-v1-m03-t32`
- severity: MAJOR
- exact_problematic_claim: “可比较个体对中风险排序与结局顺序一致的比例，受删失处理和时间框架影响。”来源为 `[src-multiomics, src-asa-pvalue, src-multiple-testing, src-strobe]`。
- why_wrong_or_misleading: RNA-seq 最佳实践、P value 声明、FDR 方法和 STROBE 都不是 survival concordance/C-index 方法来源；它们无法支持 comparable pairs、ties、censoring 或不同 C-index estimand 的细节。
- safer_corrected_formulation: 保留“排序区分而非校准”的边界，但明确所用 C-index 定义、可比较对、ties 与删失处理，报告 CI，并与 time-dependent AUC 和特定预测时间的校准分开。
- source_needed: Harrell C、Uno C 或其他明确 survival concordance/censoring 方法来源；TRIPOD/校准来源只能作报告补充。

### 20. 验证规划把成功/失败标准和推广边界设为可选

- content_id: `studio-project-validation`
- severity: MAJOR
- exact_problematic_claim: 字段“成功/失败标准”和“推广边界”的 `required` 均为 `false`，而模板目的声称“准确区分内部、外部、技术、正交和跨模态支持”。
- why_wrong_or_misleading: 不预设成功/失败标准会允许看完结果后移动验证门槛；不要求推广边界会把技术一致、同队列跨模态支持或内部重采样误写为外部有效性。对于验证模板，这两项不是装饰字段。
- safer_corrected_formulation: 将验证目标/estimand、数据独立性、冻结流程、成功/失败标准、性能指标及 CI、失败处理和推广边界全部设为必填；匹配跨模态证据单列“共享受试者/样本与共同偏倚”。
- source_needed: `src-tripod-ai`、`src-probaST`、`src-pm-external`；技术/正交/跨模态验证需各自的领域来源。

### 21. Advanced Paper Studio 没有强制审查偏倚、不确定性和验证

- content_id: `studio-paper-advanced`
- severity: MAJOR
- exact_problematic_claim: 目的为“完成审稿式证据—主张图与项目结构迁移”，但“替代解释”与“可迁移结构”均为 `required: false`，且没有独立的效应/CI、多重性、偏倚、缺失、模型诊断或验证字段。
- why_wrong_or_misleading: 高级审稿如果只强制问题、设计、主图和最大主张，仍可绕过决定结论可信度的统计精度、选择/混杂、模型灵活性和验证独立性。把替代解释设为可选与课程反复强调的 claim boundary 直接冲突。
- safer_corrected_formulation: Advanced 模板至少强制：estimand/统计单位、效应与 CI、检验族/多重性、缺失与模型假设、主要偏倚/替代解释、内部/外部验证角色、最大可辩护主张及会推翻它的证据。
- source_needed: 依研究类型映射 STROBE、CONSORT、TRIPOD+AI/PROBAST、REMARK 或 PRISMA；不能以单一通用模板代替设计专属清单。

### 22. PH assumption 被写成只约束“关键协变量”

- content_id: `guide-v1-m03-t41`
- severity: MINOR
- exact_problematic_claim: “关键协变量的 hazard ratio 随分析时间保持稳定；违反时单一 HR 可能掩盖时间变化。”
- why_wrong_or_misleading: 标准 Cox PH 模型中所有以固定系数进入的协变量都隐含 time-invariant log-HR，除非显式建模 time-varying coefficient；不仅是作者认为“关键”的变量。还应区分单变量检验与 global PH assessment。
- safer_corrected_formulation: “对每个以固定系数进入的协变量，模型假定其 log-HR 不随分析时间变化；应检查变量特异和全局 PH，并在违反时报告时间变化效应、分层模型或合适的绝对效应。”
- source_needed: `src-cox` 加直接的 Schoenfeld residual/time-varying coefficient 诊断来源。

### 23. AUC 的概率解释漏掉 ties

- content_id: `staged-method-roc-auc`
- severity: MINOR
- exact_problematic_claim: “AUC 是随机病例得分高于随机非病例的概率解释。”
- why_wrong_or_misleading: 对存在相同预测分数的常见离散/分层模型，标准 AUC 通常为 `P(score_case > score_control) + 0.5 P(tie)`；省略 tie convention 会使定义不精确。
- safer_corrected_formulation: “AUC 可解释为随机病例得分高于随机非病例的概率，加上并列得分概率的一半（按所用 convention 说明）。”
- source_needed: `src-roc` 或直接的 ROC/AUC 定义来源，需明确 ties 与抽样设计。

### 24. CV 的折间波动被含混地当作“不确定性”

- content_id: `staged-method-cross-validation`
- severity: MINOR
- exact_problematic_claim: outputs 包含“折外性能、变异、调参选择”，reviewer check 又列“不确定性”，但没有说明 folds 高度相关。
- why_wrong_or_misleading: k-fold 各折性能不是独立重复，简单用 fold SD/SE 不能当泛化误差 CI；调参和模型比较还需 nested CV 或独立评估。含混的“变异/不确定性”容易诱导无效区间。
- safer_corrected_formulation: 说明 CV 用于估计完整流程的内部泛化表现；折间散布仅作稳定性描述，不能直接当独立重复的 SE/CI。调参采用 nested/repeated CV，并用适当 resampling 或独立数据评估不确定性。
- source_needed: `src-leakage`、`src-tripod-ai`，并补充交叉验证误差估计与方差/CI 的直接统计来源。

### 25. GSVA 与 ssGSEA 被合并成一个含混算法描述

- content_id: `staged-method-gsva-ssgsea`
- severity: MINOR
- exact_problematic_claim: “在样本内或跨样本转换表达排名/分布，得到相对 gene-set score。”
- why_wrong_or_misleading: GSVA 与 ssGSEA 的变换、标准化和跨样本依赖不同；输入分布/核选择及队列组成会以不同方式影响分数。把二者写成可互换的“样本内或跨样本”会妨碍复现和跨队列比较。
- safer_corrected_formulation: 分开说明 GSVA 与 ssGSEA 的算法、输入尺度、参数、归一化和分数可比性；若跨队列验证，冻结实现与基因集版本，并避免把不同算法分数当同一量尺。
- source_needed: `src-gsva`；另需 ssGSEA 原始方法/实现文档，不能仅由 GSVA 论文覆盖两者。

### 26. “Cross-modal validation” 命名仍会把支持误写成验证

- content_id: `staged-concept-cross-modal-validation`
- severity: MINOR
- exact_problematic_claim: 标题是“Cross-modal validation”，正文却说“不同模态可支持同一构念，但测量层、样本独立性和方向必须明确”，并在同一模板中写“当前最多支持对 Cross-modal validation 作有边界的队列内判断”。
- why_wrong_or_misleading: 正文已承认它通常只是 support，但标题和评估仍使用 validation。匹配同一受试者的 RNA/蛋白/空间数据共享选择、取样和队列偏倚，只能提供跨测量层 corroboration，不能自动验证总体可重复性或预测性能。
- safer_corrected_formulation: 将概念重命名为“Cross-modal support / corroboration”；只有在预先定义验证对象、独立样本角色、冻结映射与成功标准时才使用 validation，并明确它验证的是测量构念、分类器还是外部性能。
- source_needed: `src-mofa-plus`/`src-diablo` 只能支持整合方法；验证独立性仍需 `src-tripod-ai`/`src-probaST` 或领域专属跨模态验证来源。

## Release recommendation

冻结内容当前不应解冻。最低放行条件是：先修复两个 BLOCKER；随后逐项重写概念课评估而非继续替换术语生成模板；把来源从“章节级通用引用”改成 claim-level 直接映射；再对所有统计、组学和单细胞条目进行一次能检查独立单位、estimand、误差结构、验证角色与措辞边界的复审。
