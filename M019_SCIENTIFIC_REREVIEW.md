# M019 Scientific Rereview

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- original_snapshot_commit: `35750c3`
- rereview_scope: 仅复核 `M019_INDEPENDENT_SCIENTIFIC_REVIEW.md` 中原始 2 个 BLOCKER 与 19 个 MAJOR；未重新审查 MINOR 或全库内容
- reviewed_inputs: 原始问题条目；当前修复后的 `artifacts/curriculum-content-snapshot.json` 对应字段；`src/data/evidence.ts` 中相关来源
- implementer_self_assessment_used: `false`
- current_snapshot_metadata: `generatedAt=2026-08-31`，`status=pending`

## Verdict and counts

### Status counts（21 个原始 BLOCKER/MAJOR）

| Status | Count |
|---|---:|
| RESOLVED | 13 |
| PARTIALLY_RESOLVED | 8 |
| NOT_RESOLVED | 0 |
| NEW_PROBLEM | 0 |

### Remaining severity counts

| Remaining severity | Count |
|---|---:|
| BLOCKER | 0 |
| MAJOR | 8 |

原始两个 BLOCKER 均不再构成当前 BLOCKER：40 个概念评估的系统性范畴错误已消除；`src-multiomics` 对冻结内容的批量污染也已清零。不过，后者的误导性来源 ID 仍留在注册表中，故该条降级为剩余 MAJOR。其余 7 个剩余 MAJOR 均为“核心文字已纠正，但 claim-level 方法学来源仍不直接支持当前表述”。

## Item-by-item rereview

### 1. `staged-concept-p-value`（原 BLOCKER；原问题覆盖 40 个概念课）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前 P 值题要求“只在明确 H0、检验统计量、模型和选择过程下解释 P 值”，并明确核对 `P(data or more extreme | H0, model)` 与 `P(H0 | data)`；错误项为“P=0.03 就写研究假设有 97% 概率为真且可重复”。当前 40 个 `staged-concept-*` 的主要情境、决定与核对项各自均为 40 个唯一文本；原先“队列内判断/升级机制”的通用最大结论及通用“样本行数、视觉分离度或模型复杂度”代理均为 0 次。
- assessment: 原范畴错误与可凭模板语气答题的问题已被概念专属情境、决策、近似错误项和最大结论取代。交互、功效等个别条目的来源充分性另按其原始条目 3、4 处理，不反向维持本条系统性 BLOCKER。

### 2. `src-multiomics`（原 BLOCKER）

- status: `PARTIALLY_RESOLVED`
- residual_severity: `MAJOR`
- current_evidence: 当前快照中 `guideSections`、`claims`、`conceptLessons`、`caseLabs` 对 `src-multiomics` 的引用总数均为 0，原先跨 82 个 guide、96 个 claim、12 个 concept 和 2 个 case 的污染已清除。但 `evidence.ts` 仍保留 `id: "src-multiomics"`，其题名仍是 “A survey of best practices for RNA-seq data analysis”，`coreEvidence` 仍只覆盖 transcriptomics 的设计、QC、定量、差异分析与解释。
- assessment: 当前冻结内容不再拿 RNA-seq 综述支撑多组学/蛋白组/单细胞主张，因此原批量 BLOCKER 已消失；但来源 ID 本身仍把 RNA-seq 文献命名为 multiomics，未按原建议改为 RNA-seq 专属 ID。该注册表语义错误可在下一轮映射时重新引入系统性误配，故仍为 MAJOR，而非 RESOLVED。

### 3. `staged-concept-interaction`（原 MAJOR）

- status: `PARTIALLY_RESOLVED`
- residual_severity: `MAJOR`
- current_evidence: 当前情境给出男女亚组绝对风险差 `-10%` 与 `-2%`，明确“分别显著与否不能替代正式交互对比，且结论依尺度”；正确决定是“在预先指定的尺度上计算亚组效应及正式 interaction contrast”，核对项禁止用“一个显著、一个不显著”冒充亚组差异。可是其 `sourceIds` 仍只有 `src-asa-pvalue`、`src-multiple-testing`、`src-strobe`；这些来源的 `coreEvidence` 分别是 P 值解释、FDR 和观察研究报告，不直接定义 interaction/effect modification、尺度或正式交互对比。
- assessment: 评估内容已真实检验交互，原教学错误已改正；但原要求的直接 interaction/effect-modification 方法来源仍缺失，当前 claim-level 证据映射无法支撑新增核心规则。

### 4. `staged-concept-power`（原 MAJOR）

- status: `PARTIALLY_RESOLVED`
- residual_severity: `MAJOR`
- current_evidence: 当前 worked example 明确“设计前用最小重要效应、SD、alpha、独立 n 和计划检验比较两个方案；结果后用效应与 CI 讨论信息量，不算 observed power”；正确项要求用事前效应假设、alpha、设计、方差/事件率与分析规则规划样本量，错误项明确拒绝以低 observed power 给阴性结果背书。其 `sourceIds` 仍为 `src-asa-pvalue`、`src-multiple-testing`、`src-strobe`，没有一般样本量/功效设计来源。
- assessment: 事前功效与事后结果解释已正确分开，但当前三条来源不直接支持功效定义、设计参数或 observed-power 边界；原 `source_needed` 未满足。

### 5. `staged-concept-selection-bias`（原 MAJOR）

- status: `PARTIALLY_RESOLVED`
- residual_severity: `MAJOR`
- current_evidence: 当前定义已扩为“进入研究、留在随访或进入分析的机制可使目标对照不再可识别”，并把 collider 条件化列为其中一种机制；核对项明确区分“抽样覆盖、差异参与、失访和 collider 条件化”。但当前来源仍为 `src-strobe`、`src-consort`、`src-pseudorep`，没有链接现有 `src-dag`，也没有直接的 selection/attrition/target-population 方法来源。`src-pseudorep` 的 `coreEvidence` 只讨论非独立观测被当作重复。
- assessment: 定义不再把 selection bias 缩窄为 collider，文字层面已纠正；来源层面仍用报告框架和伪重复论文支撑因果选择机制，故仅部分解决。

### 6. `staged-case-confounding-observational`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 冲突阶段仍呈现“团队还准备调整治疗后的炎症变化”，但校准已强制先声明总效应或直接效应，并写明：“估计治疗总效应时，治疗后的炎症可能是中介，不能与基线严重度一样机械调整；若目标改为直接效应，则必须另行说明识别假设并处理治疗后混杂。”来源为 `src-dag`、`src-target-trial`、`src-strobe`；其中 `src-dag` 的 `coreEvidence` 明确区分 confounder、collider 与 mediator。
- assessment: 高风险治疗后变量现在被案例专属规则直接拦截，总效应/直接效应与治疗后混杂边界均被明确提出，原遗漏已解决。

### 7. `guide-v1-m02-t29`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前 summary 与定义均为“在开发及全部特征选择、调参均未接触的独立参与者或样本中，按冻结模型评价区分、校准和效用；同源随机 holdout 仍属内部验证”；适用边界还明确内部表现不能自动推广至新机构、新时间或临床决策。来源包含 `src-tripod-ai`、`src-probaST`、`src-pm-external`。
- assessment: 同源随机留出已被明确排除出外部验证，独立性、冻结流程、校准与应用边界均已进入定义。

### 8. `staged-concept-censoring`（原 MAJOR）

- status: `PARTIALLY_RESOLVED`
- residual_severity: `MAJOR`
- current_evidence: 当前定义明确列出右删失、左删失和区间删失，并要求方法匹配删失类型、说明条件独立删失假设、区分竞争事件与左截断；评估情境也同时包含行政右删失、区间删失、左截断和竞争事件。可是来源仍为 `src-cox`、`src-asa-pvalue`、`src-multiple-testing`、`src-strobe`；`src-cox` 的 `coreEvidence` 仅为“proportional hazards regression model for censored time-to-event data”，其余三条也不覆盖 left/interval censoring、left truncation 和 competing risks。
- assessment: 将 censoring 等同于右删失的内容错误已纠正，但扩展后的完整定义仍没有相应生存分析方法来源，claim-level 支持不足。

### 9. `staged-method-pseudobulk`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前核心逻辑为“先在最小生物样本×条件×细胞类型内汇总计数；独立复制层由设计决定，同一 donor 的多样本在模型中保留配对/重复结构”；输入明确包含 `biological sample×condition/time×cell type` 与 donor 配对设计矩阵，误用项明确禁止把同一 donor 多样本当独立或在聚合时混合时间/组织。来源包含 `src-pseudobulk`、`src-deseq2`、`src-edger`、`src-single-cell-2023`。
- assessment: 聚合键、复制层及配对/重复测量结构均已按设计而非固定 donor×cell type 定义。

### 10. `staged-case-composition-state`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前主要证据报告供体级比例差 `+8%（95% CI 1%–15%）`，同时指出组间捕获效率不同；冲突证据说明另一注释方案使比例效应减弱，且 signature 估计虽接近零但区间仍包含预设有意义差异；验证阶段明确“不能据未显著结果声称等效”，并要求报告效应、CI、覆盖和组成模型敏感性。来源为 `src-pseudobulk`、`src-milo`、`src-single-cell-2023`。
- assessment: 当前内容不再把未显著或接近零当作无状态变化，且把供体层不确定性、捕获/注释敏感性和组成模型纳入判断。

### 11. `guide-v1-m06-t06`（原 MAJOR）

- status: `PARTIALLY_RESOLVED`
- residual_severity: `MAJOR`
- current_evidence: 当前 summary 已改为“归一化目标与假设依模态和方法而异；必须说明技术因子、参考尺度及稳定特征、spike-in 或组成参考，不能把一套规则迁移到全部组学”。但 `evidenceSourceIds` 仅为 `src-batch` 与 `src-single-cell-2023`；前者只覆盖 batch effects，后者只给出跨模态单细胞工作流和模态专属测量假设的高层原则。注册表中已有 `src-sctransform`，却未链接；当前也没有支撑蛋白组/代谢组归一化的直接来源。
- assessment: 原“多数特征不变是所有方法共同假设”的过度概括已纠正，但新跨模态陈述中的稳定特征、spike-in、组成参考及模态差异没有被当前来源逐项支持。

### 12. `guide-v1-m06-t15`（原 MAJOR）

- status: `PARTIALLY_RESOLVED`
- residual_severity: `MAJOR`
- current_evidence: 当前定义已明确“只有稳定、可冻结分配且能在独立数据复现的离散类别才称 subtype，连续结构应报告 program 或 axis”。但来源仍只有 `src-batch` 与 `src-single-cell-2023`，未链接注册表中直接讨论 cluster stability 的 `src-clustering`，也未链接以 consensus NMF 评估模式/聚类稳定性的 `src-nmf`。
- assessment: 连续轴不再被定义为 subtype，科学表述已修复；不过离散性、稳定性、冻结分配及独立复现这些新增判据仍没有直接来源映射。

### 13. `guide-v1-m06-t19`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 标题已改为 “Over-representation analysis”；summary 明确阈值化候选列表、universe、列表阈值及超几何/Fisher 型零模型，并写明“不与 ranked-list GSEA 混用”。来源新增 `src-ora`，其 `coreEvidence` 直接要求适当 background universe、多重性与完整报告，并明确 ORA 不同于 ranked-list enrichment。
- assessment: 方法名称、零模型、背景集与 GSEA 的边界均已明确，且有直接 ORA 方法来源。

### 14. `guide-v1-m06-t34`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前定义同时覆盖样本级质量、cell calling、低质量细胞、doublet、ambient RNA、解离应激、异常样本和敏感性分析；来源链接 `src-scrna-best`、`src-doubletfinder`、`src-soupx`。其中后两条 `coreEvidence` 分别直接支持 doublet 检测与 ambient RNA 污染会造成误导表达。
- assessment: 原先只列 per-cell summaries 的狭窄 QC 已扩展到会制造假 marker/假群体的核心伪影及 sample-level QC。

### 15. `staged-case-overfitting-validation`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前外部阶段给出“独立队列 168 人、39 个事件：两年 AUC=0.63（95% CI 0.51–0.74），calibration-in-the-large=0.34，校准斜率=0.58（95% CI 0.31–0.86）”，并明确“结果不精确，且与乐观开发表现不一致”。来源包含 `src-calibration`、`src-pm-external`、`src-tripod-ai`、`src-probaST`。
- assessment: 时间窗、样本量、事件数、AUC 与 slope 精度、整体校准以及谨慎解释均已补齐；不再以小样本点估计唯一归因于过拟合。

### 16. `guide-v1-m03-t27`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前 `evidenceSourceIds` 已包含 `src-leakage`；该来源 `coreEvidence` 为“Formalizes information leakage and prevention through correct separation of training and evaluation operations.”
- assessment: 原条目的核心问题是明明存在直接 leakage 方法来源却没有链接；该直接来源现已成为主映射，定义获得相应支持。

### 17. `guide-v1-m03-t46`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前 `evidenceSourceIds` 已包含 `src-pmsampsize`；其 `coreEvidence` 直接写明预测模型样本量应依据 outcome frequency、候选参数、预期性能和 shrinkage，而非通用 EPV 阈值，与当前 summary 精确匹配。
- assessment: 原先缺失的直接样本量方法来源已补入。

### 18. `guide-v1-m01-t14`（原 MAJOR）

- status: `PARTIALLY_RESOLVED`
- residual_severity: `MAJOR`
- current_evidence: `src-competing` 已从该节移除，当前来源为 `src-strobe` 与 `src-dag`。正文仍要求“同时列出能解释同一观察的多个机制，优先设计能使它们产生不同预测的证据”。但 `src-strobe` 只覆盖观察研究报告，`src-dag` 只说明 DAG 编码因果假设及区分 confounder/collider/mediator；二者都不直接给出 competing hypotheses、区分性实验或 severe-test 方法。
- assessment: Fine–Gray competing-risk 的词面误配已纠正，但原要求的 alternative explanations/discriminating experiments 直接科学推理来源仍缺失，因此不是完全解决。

### 19. `guide-v1-m03-t32`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前来源新增 `src-harrell-c`；其 `coreEvidence` 直接定义 concordance 为预测与结局排序正确的频率，并明确 survival 使用需要 comparable-pair 和 censoring convention。当前 summary 为“可比较个体对中风险排序与结局顺序一致的比例，受删失处理和时间框架影响”，两者直接匹配。
- assessment: 原“全部来源均不直接支持”的事实已不再成立，C-index 现在具有直接方法来源。仍附带的 `src-mofa-plus`、`src-diablo`、`src-asa-pvalue` 与本 claim 无关，属于应清理的映射噪声，但在已有直接主来源后不足以维持原 MAJOR。

### 20. `studio-project-validation`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 六个字段现全部 `required: true`，包括“待验证主张/estimand”“独立性与共享偏倚”“冻结流程”“性能指标、CI 与成功/失败标准”“失败处理与推广边界”；各 prompt 还要求在结果出现前独立记录且不得覆盖原门槛。
- assessment: 成功/失败标准和推广边界均从可选改为预先冻结的必填项，原事后移动门槛及验证角色混淆风险已处理。

### 21. `studio-paper-advanced`（原 MAJOR）

- status: `RESOLVED`
- residual_severity: `NONE`
- current_evidence: 当前模板新增并强制填写“效应与不确定性”“检验族与模型灵活性”“主要偏倚与替代解释”“假设与诊断”“验证角色”；原“替代解释”与“可迁移结构”也均改为 `required: true`。设计字段明确包含总体、采样、时间和独立单位。
- assessment: 高级审稿模板已不能绕过统计单位、效应/CI、多重性、偏倚、缺失/测量、模型诊断、替代解释与验证独立性。

## Remaining required corrections

1. 将 `src-multiomics` 重命名为 RNA-seq 专属来源 ID，或至少取消误导性 multiomics 语义；当前零引用不是注册表修复。
2. 为 interaction、一般功效/样本量设计、selection/attrition/target-population、完整 censoring 类型补直接统计方法来源，并替换当前 P 值/FDR/报告指南式占位映射。
3. 为跨模态 normalization 与 molecular subtype 的新边界连接已存在的直接方法来源，并补齐当前注册表缺失的模态专属来源。
4. 为 competing hypotheses / alternative explanations / discriminating experiments 增加直接科学推理或实验设计来源；`src-dag` 只能支持因果结构的一部分。

在上述 8 个 MAJOR 清零前，不应把当前 `pending` 快照升级为科学内容已完全验证。
