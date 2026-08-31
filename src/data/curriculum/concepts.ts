import type { CapabilityId } from "../../domain/learningArchitecture";
import type { StagedConceptLessonV1 } from "../../domain/curriculum";
import { selfRescueGuideSections } from "../self-rescue-guide";
import { conceptAssessmentMaterial } from "./assessment-material";
import { buildMaterializedAssessment } from "./materialize-assessment";

const conceptRows = [
  "research-question|Research Question",
  "hypothesis|Hypothesis",
  "evidence-claim|Evidence vs Claim",
  "association-causation|Association vs Causation",
  "exploratory-confirmatory|Exploratory vs Confirmatory Research",
  "statistical-unit|Statistical Unit",
  "biological-technical-replicate|Biological Replicate",
  "pseudoreplication|Pseudoreplication",
  "population-sample|Population / Sample / Target Population",
  "confounding|Confounding",
  "selection-bias|Selection Bias",
  "internal-external-validity|Internal Validity",
  "effect-size|Effect Size",
  "standard-error|Standard Error",
  "confidence-interval|Confidence Interval",
  "p-value|P value",
  "multiple-testing-fdr|FDR",
  "power|Power",
  "interaction|Interaction",
  "overfitting|Overfitting",
  "data-leakage|Data Leakage",
  "validation|External Validation",
  "censoring|Censoring",
  "hazard-ratio|Hazard Ratio",
  "time-origin|Time origin",
  "composition-state|Composition vs within-state expression",
  "batch-effect|Batch effect",
  "bulk-mixture|Bulk tissue is a mixture",
  "rna-protein|RNA ≠ Protein",
  "cluster-stability|Cluster stability",
  "pseudobulk|Pseudobulk",
  "cross-modal-validation|Cross-modal validation",
  "alternative-explanation|Alternative Explanation",
  "claim-boundary|Claim Boundary",
  "robustness|Robustness",
  "triangulation|Triangulation",
  "minimal-sufficient-analysis|Minimal sufficient analysis",
  "evidence-redundancy|Corroboration vs redundancy",
  "negative-result|Negative Results",
  "ai-cognitive-outsourcing|Cognitive outsourcing",
] as const;

const normalize = (value: string) => value.toLowerCase().replace(/[\s/–—≠-]+/g, "").replace(/[()'“”]/g, "");
const sectionFor = (title: string) => selfRescueGuideSections.find((section) => normalize(section.titleCn) === normalize(title) || normalize(section.titleEn) === normalize(title));

const capabilitiesFor = (moduleId: string): CapabilityId[] => moduleId === "study-design" ? ["study_design", "statistical_reasoning"]
  : moduleId === "statistical-reasoning" ? ["statistical_reasoning", "result_interpretation"]
    : moduleId === "omics-bioinformatics" ? ["omics_reasoning", "result_interpretation"]
      : moduleId === "ai-assisted-research" ? ["ai_oversight", "result_interpretation"]
        : moduleId === "research-strategy" ? ["next_step_design", "result_interpretation"]
          : ["scientific_question", "result_interpretation"];

const prerequisiteMap: Record<string, string[]> = {
  hypothesis: ["staged-concept-research-question"],
  "evidence-claim": ["staged-concept-research-question"],
  "association-causation": ["staged-concept-evidence-claim"],
  "exploratory-confirmatory": ["staged-concept-hypothesis"],
  "statistical-unit": ["staged-concept-research-question"],
  "biological-technical-replicate": ["staged-concept-statistical-unit"],
  pseudoreplication: ["staged-concept-statistical-unit", "staged-concept-biological-technical-replicate"],
  confounding: ["staged-concept-association-causation"],
  "selection-bias": ["staged-concept-population-sample", "staged-concept-association-causation"],
  "internal-external-validity": ["staged-concept-population-sample", "staged-concept-confounding", "staged-concept-selection-bias"],
  "standard-error": ["staged-concept-statistical-unit"],
  "confidence-interval": ["staged-concept-standard-error", "staged-concept-effect-size"],
  "p-value": ["staged-concept-hypothesis", "staged-concept-standard-error"],
  "multiple-testing-fdr": ["staged-concept-p-value"],
  power: ["staged-concept-hypothesis", "staged-concept-p-value", "staged-concept-effect-size", "staged-concept-standard-error"],
  interaction: ["staged-concept-effect-size"],
  overfitting: ["staged-concept-statistical-unit", "staged-concept-effect-size"],
  "data-leakage": ["staged-concept-overfitting"],
  validation: ["staged-concept-population-sample"],
  censoring: ["staged-concept-time-origin"],
  "hazard-ratio": ["staged-concept-effect-size", "staged-concept-time-origin", "staged-concept-censoring"],
  "time-origin": ["staged-concept-statistical-unit"],
  "composition-state": ["staged-concept-bulk-mixture"],
  "cluster-stability": ["staged-method-clustering", "staged-concept-overfitting"],
  pseudobulk: ["staged-concept-statistical-unit", "staged-concept-pseudoreplication", "staged-concept-composition-state", "staged-concept-multiple-testing-fdr"],
  "cross-modal-validation": ["staged-concept-evidence-claim", "staged-concept-bulk-mixture", "staged-concept-composition-state", "staged-concept-rna-protein", "staged-concept-validation"],
  "alternative-explanation": ["staged-concept-evidence-claim", "staged-concept-association-causation"],
  "claim-boundary": ["staged-concept-evidence-claim"],
  robustness: ["staged-concept-claim-boundary"],
  triangulation: ["staged-concept-alternative-explanation"],
  "minimal-sufficient-analysis": ["staged-concept-alternative-explanation"],
  "evidence-redundancy": ["staged-concept-triangulation"],
  "negative-result": ["staged-concept-confidence-interval", "staged-concept-power"],
  "ai-cognitive-outsourcing": ["staged-concept-claim-boundary"],
};

const chineseTitles = Object.fromEntries(`
research-question|科研问题
hypothesis|研究假设
evidence-claim|证据与主张
association-causation|关联与因果
exploratory-confirmatory|探索性与确证性研究
statistical-unit|统计单位
biological-technical-replicate|生物学重复与技术重复
pseudoreplication|伪重复
population-sample|总体、样本与目标总体
confounding|混杂
selection-bias|选择偏倚
internal-external-validity|内部效度与外部效度
effect-size|效应大小
standard-error|标准误
confidence-interval|置信区间
p-value|P 值
multiple-testing-fdr|多重检验与 FDR
power|统计功效
interaction|交互作用
overfitting|过拟合
data-leakage|数据泄漏
validation|验证的类型与独立性
censoring|删失
hazard-ratio|风险率比
time-origin|时间起点
composition-state|组成变化与状态变化
batch-effect|批次效应
bulk-mixture|Bulk 组织是混合物
rna-protein|RNA 不等于蛋白
cluster-stability|聚类稳定性
pseudobulk|Pseudobulk 的独立单位
cross-modal-validation|跨模态支持
alternative-explanation|替代解释
claim-boundary|主张边界
robustness|稳健性
triangulation|三角验证
minimal-sufficient-analysis|最小充分分析
evidence-redundancy|证据佐证与冗余
negative-result|阴性结果解释
ai-cognitive-outsourcing|AI 认知外包风险`.trim().split("\n").map((row) => row.split("|")));

interface ConceptCaseBlueprint { worked: string; remediation: string; review: string; decision: string; keyCheck: string; nearMiss: string }
const conceptCases: Record<string, ConceptCaseBlueprint> = {
  "research-question": { worked: "晚期 NSCLC 队列拟比较治疗前标志物高/低患者的 3 年死亡风险；逐步补齐目标总体、暴露、比较、结局、time zero 与风险差 estimand。", remediation: "从一张缺字段的 PICO/estimand 表逐格修复‘免疫与预后’这个话题。", review: "诊断研究只写‘影像能否早期发现肿瘤’，需改成有总体、阈值、参照标准与时间窗的问题。", decision: "补齐总体、比较、结局、时间和目标效应，并删除现有数据不能回答的部分", keyCheck: "问题中的每个字段都能对应可观察数据和明确分析单位", nearMiss: "保留宽泛话题，只补一个结局名称，等分析完成后再决定比较和时间窗" },
  hypothesis: { worked: "若药物抑制目标通路，则处理组 24 h 的蛋白磷酸化应下降；无下降且靶点占有充分会反驳该机制假设。", remediation: "用‘机制假设→可观察预测→反证结果’三列表重建一条只有方向、没有反证条件的陈述。", review: "在感染模型中把宿主通路假设映射到预先指定的细胞因子时间曲线和会推翻它的结果。", decision: "把机制陈述、可观察预测和预先可接受的反证结果一一匹配", keyCheck: "预测含对象、时间、方向与测量，反证条件不是事后追加", nearMiss: "写出方向正确但无法被任何现实结果反驳的机制故事" },
  "evidence-claim": { worked: "同队列 RNA、同队列蛋白和独立队列 IHC 依次加入证据表；逐项标记测量直接性、样本独立性，并把‘驱动’降为‘相关/支持’。", remediation: "在证据×主张矩阵中判断同一样本换算法是否增加独立支持。", review: "影像特征、病理复核与独立医院结局验证对同一诊断主张分别承担什么证据任务？", decision: "为每条证据标出直接性、独立性和它实际支持的主张动词", keyCheck: "来源于同一受试者或同一误差机制的结果没有被重复计作独立验证", nearMiss: "只按显著结果数量累加证据，不区分测量层与数据复用" },
  "association-causation": { worked: "治疗选择和死亡都受基线重症度影响；三节点 DAG 显示治疗—死亡关联可由共同原因产生，与随机分配形成对照。", remediation: "根据时间顺序把四个变量拖入 DAG，找出未阻断的后门路径。", review: "饮食与复发的队列关联需识别健康意识共同原因，并选择能改变因果解释的设计。", decision: "指出阻止因果解释的具体路径，并选择能阻断或识别它的设计/分析", keyCheck: "时间顺序、共同原因和目标 estimand 均被明确，而非仅写‘相关不等因果’", nearMiss: "在多变量模型中加入更多变量后直接把调整后关联称为因果" },
  "exploratory-confirmatory": { worked: "并排比较‘看完 20,000 个组学特征后选 biomarker’与‘预注册单一 biomarker’两条流程：特征、阈值、终点和分析集何时冻结决定结论角色。", remediation: "在流程时间线上给每个决定贴‘见结果前/见结果后’标签。", review: "影像模型开发中区分探索性 cut-point 搜索与独立冻结验证。", decision: "逐项标记特征、阈值、主要终点和分析集是事前还是事后决定，并据此改写结论", keyCheck: "没有把同一数据上的发现和确证写成两个独立阶段", nearMiss: "只要最后使用严格 P 值阈值，就把事后选择称为确证" },
  "statistical-unit": { worked: "6 名患者×2 块组织×5000 细胞；患者组间问题的独立 n=6，组织和细胞提高患者内测量而非患者级信息数。", remediation: "在层级树中填写单位、聚类层和有效 n，再比较患者级与细胞状态问题。", review: "多中心影像研究每人多张切片，判断医院、患者、切片在不同问题中的角色。", decision: "先由研究问题确定独立信息层级，再填写聚类层和有效 n", keyCheck: "区分观测行数、测量精度与独立样本量", nearMiss: "把每个细胞或 ROI 当作独立复制，只在模型中加入更多协变量" },
  "biological-technical-replicate": { worked: "3 位患者×2 次建库×2 个技术孔：患者估计生物变异，重复建库/技术孔估计流程与测量变异，不能互相替代。", remediation: "把一张样本追踪表中的 donor、library、well 分到生物与技术重复，并说明各自能估计什么。", review: "蛋白组中独立动物、重复取样和重复进样如何贡献不同误差层？", decision: "给每个重复标明独立来源与它能估计的变异成分", keyCheck: "增加技术重复没有被解释成增加目标总体的生物学 n", nearMiss: "只按文件名数量报告 replicate 数，不追踪共同生物来源" },
  pseudoreplication: { worked: "3+3 供体、每供体 1000 细胞；逐细胞检验把 n 写成 6000 并给窄 CI，供体聚合/混合模型恢复 n=6 与更宽不确定性。", remediation: "比较两张软件输出表，找出标准误为何相差十倍并重画聚类结构。", review: "每只动物多个视野的炎症评分，选择聚合、聚类稳健 SE 或分层模型。", decision: "按独立单位重做估计或显式建模相关结构，并报告有效 n", keyCheck: "标准误与自由度来自独立来源而不是下层观测数", nearMiss: "保留逐细胞检验，仅把细胞数写在补充材料里" },
  "population-sample": { worked: "目标总体是全部晚期患者，但样本来自三级医院且仅含接受活检者；画目标总体→可接触总体→入组→分析样本漏斗。", remediation: "在带人数和流失原因的漏斗图中圈出每一步选择。", review: "社区筛查研究从自愿参加者推到全部居民时，写出最大可推广人群。", decision: "明确目标总体、抽样框、入组与分析选择，并收窄可推广范围", keyCheck: "每一个从总体到样本的选择机制及其与暴露/结局关系都被审查", nearMiss: "样本量大且来自多科室，因此直接代表目标总体" },
  confounding: { worked: "在 500 人队列中，重症度同时影响治疗选择和死亡；比较未调整、调基线重症度与错误调整治疗后炎症三种模型，后者可能阻断中介或打开 collider。", remediation: "在时间化 DAG 中选最小调整集，并把 mediator/collider 从候选协变量表移出。", review: "职业暴露与肺病研究中识别年龄共同原因和由早期症状影响的体检选择。", decision: "先定义总效应或直接效应，再依据时间化 DAG 选择调整集", keyCheck: "共同原因、中介、碰撞点和治疗后变量被分别处理", nearMiss: "把所有基线和治疗后变量都加入模型，以为变量越多偏倚越少" },
  "selection-bias": { worked: "队列有 800 人入组但只有 520 人完成随访；失访同时受基线暴露与早期症状影响，选择后原本可比的组可能产生关联。", remediation: "用失访概率表和选择节点图判断方向，而非只做完整病例分析。", review: "病例对照研究中医院对照的入院原因与暴露相关，需重定义抽样框。", decision: "画出进入、留存和分析选择机制，并说明目标对照何处被破坏", keyCheck: "区分抽样覆盖、差异参与、失访和 collider 条件化", nearMiss: "仅比较入组者的基线变量平衡，平衡即宣称没有选择偏倚" },
  "internal-external-validity": { worked: "一项随机试验样本内偏倚低但仅纳入年轻低风险患者；分开回答样本内估计可信度与能否运输到高龄目标总体。", remediation: "把混杂、失访、窄纳入和测量变化四种威胁归类到内部、外部、两者或均非。", review: "在单中心诊断模型迁移到基层前，区分验证失败与 case mix 变化。", decision: "分别审查样本内识别和向目标总体运输，而不是给单一‘有效’标签", keyCheck: "目标总体、选择机制和测量/治疗环境差异均被显式比较", nearMiss: "内部随机化良好就自动宣称结论适用于所有临床场景" },
  "effect-size": { worked: "死亡风险 20% vs 15%：风险差 -5 个百分点、风险比 0.75；与最小临床重要差异 3 个百分点一起解释。", remediation: "从 2×2 风险表短算绝对与相对效应并比较语言印象。", review: "诊断干预把误诊率从 4% 降至 3%，选择与决策问题匹配的尺度。", decision: "计算并报告与问题匹配的绝对/相对效应及单位", keyCheck: "效应与临床重要界值、基线风险和 CI 一起解释", nearMiss: "只选相对变化更大的尺度来强化结果" },
  "standard-error": { worked: "6 位患者的均值重复抽样分布说明 SD 描述个体变异、SE 描述估计不确定性；按细胞与按供体计算得到不同 SE。", remediation: "在两份输出中找出哪个把细胞行数误作独立 n，并重算聚类层。", review: "每只动物多个时间点的均值差应使用何种相关结构与 SE？", decision: "依据抽样单位和相关结构选择标准误计算", keyCheck: "能清楚区分 SD、SE 和生物学变异层级", nearMiss: "样本内观测越多就按平方根行数缩小患者级 SE" },
  "confidence-interval": { worked: "效应 2.0，95% CI -0.5–4.5，临床重要界值 3：数据兼容轻微伤害到重要获益，估计不精确，不能写‘无差异’。", remediation: "真实效应固定为 2.0；20 次重复研究的 95% CI 依次为 [-0.8,3.4]、[-0.2,4.0]、[0.1,3.8]、[-1.1,2.9]、[0.4,4.6]、[-0.5,3.6]、[0.0,4.1]、[0.7,4.8]、[-0.9,3.0]、[0.3,3.9]、[-0.4,4.2]、[0.2,4.5]、[-0.7,3.2]、[0.5,4.3]、[-0.1,3.7]、[0.6,4.9]、[-0.6,3.5]、[0.8,4.7]、[2.2,5.1]、[-1.0,1.8]；其中最后两条未覆盖 2.0。", review: "影像诊断敏感度差 5%，CI -2%–12%，判断统计兼容性、精度和临床结论。", decision: "用区间端点与临床界值写出兼容范围和精度", keyCheck: "没有把 95% CI 解释为参数有 95% 概率位于本区间", nearMiss: "区间跨零就断言两组等效或没有效应" },
  "p-value": { worked: "在预设零假设和模型下，观测到当前或更极端检验统计量的条件概率；它不是零假设为真的概率，也不表示效应大小。", remediation: "用硬币零分布把观测统计量放到尾部，并逐句改写四种错误表述。", review: "多中心诊断研究 P=0.03 但效应小且 CI 宽，判断能说什么。", decision: "只在明确 H0、检验统计量、模型和选择过程下解释 P 值", keyCheck: "区分 P(data or more extreme | H0, model) 与 P(H0 | data)", nearMiss: "P=0.03 就写研究假设有 97% 概率为真且可重复" },
  "multiple-testing-fdr": { worked: "1000 次检验得到 50 个 q<0.05 候选；FDR 控制的是重复选择中发现集合的错误比例期望，不证明每个基因有 95% 概率为真。", remediation: "用原始 P、BH q 和预定义检验族表决定候选集合。", review: "空间转录组多个区域×通路检验需先定义 family，再解释局部发现。", decision: "先定义检验族，再按预设 FDR 程序形成候选集合", keyCheck: "单个发现的真假概率没有从 q 值直接推出", nearMiss: "只对最终挑中的显著结果做 BH，忽略筛选前的全部检验" },
  power: { worked: "设计前用最小重要效应、SD、alpha、独立 n 和计划检验比较两个方案；结果后用效应与 CI 讨论信息量，不算 observed power。", remediation: "在效应×方差×样本量方向表中判断哪项改变事前功效。", review: "稀疏事件预测研究按事件率、参数数和目标收缩论证信息量。", decision: "用事前效应假设、alpha、设计、方差/事件率与分析规则规划样本量", keyCheck: "结果解释阶段没有用观察效应计算事后功效背书", nearMiss: "P>0.05 后计算低 observed power，并把它当作无效或需要更多样本的独立证据" },
  interaction: { worked: "男女亚组绝对风险差分别 -10% 与 -2%，相对风险差异较小；分别显著与否不能替代正式交互对比，且结论依尺度。", remediation: "在 2×2×2 风险表中计算两个组效应和差中之差。", review: "基因×治疗在连续结局线性模型中检查预设乘积项与边际预测。", decision: "在预先指定的尺度上计算亚组效应及正式 interaction contrast", keyCheck: "没有用‘一个显著、一个不显著’冒充亚组间差异", nearMiss: "分别跑两个亚组并比较各自 P 值是否跨 0.05" },
  overfitting: { worked: "42 个事件、120 个特征：训练 AUC 0.91，bootstrap 校正 0.68，独立队列 0.63；表现落差提示模型学习偶然波动。", remediation: "比较训练、乐观校正与外部性能三列表，并标出每次选择步骤。", review: "单细胞分类器在供体随机分折与细胞随机分折下表现悬殊。", decision: "让全部选择步骤接受内部重采样并在独立样本上冻结评估", keyCheck: "复杂度按事件/独立单位信息而非总行数约束", nearMiss: "只报告最佳训练性能并把正则化本身当作不会过拟合的证明" },
  "data-leakage": { worked: "全数据填补→全数据筛基因→再分折会让测试信息进入模型；正确流程在每个训练折内重新拟合全部步骤。", remediation: "在流水线图中标出测试信息第一次越界的位置并重画嵌套流程。", review: "按未来结局生成的时间窗特征造成 temporal/target leakage。", decision: "把预处理、特征选择和调参全部嵌套进训练数据角色", keyCheck: "受试者、时间与样本层面的泄漏都被审查", nearMiss: "先用全数据做无监督归一化，因为步骤没有直接使用结局标签" },
  validation: { worked: "同中心随机分割、按中心留一和独立时空队列依次代表内部、内部-外部和真正外部评价；模型和阈值必须冻结。", remediation: "在数据角色表中标记哪些参与者或流程曾接触开发。", review: "技术重复、同样本跨模态支持与新医院性能验证分别回答不同问题。", decision: "准确命名验证对象、独立性、冻结点、指标与成功/失败标准", keyCheck: "同源 holdout 没有被称为外部验证，跨模态支持没有替代外部性能", nearMiss: "只要测试文件未参与最终拟合，就称为完全独立外部验证" },
  censoring: { worked: "5 人时间线包含行政右删失、区间删失、左截断与竞争事件；逐人判断事件时间已知范围和风险集进入。", remediation: "用时间线卡片把 right/left/interval censoring 与 truncation、competing event 分开。", review: "筛查队列每年一次检查导致区间删失，不能按确诊日当精确事件时刻。", decision: "识别删失类型并选择匹配方法，同时说明条件独立删失假设", keyCheck: "删失、左截断和竞争事件没有混为同一状态", nearMiss: "把所有未观察到目标事件的人统一按研究截止日右删失" },
  "hazard-ratio": { worked: "6 人事件表在两个事件时刻形成 risk set；HR 比较条件瞬时 hazard，不是固定时点风险比，曲线交叉时单一 HR 会掩盖变化。", remediation: "从风险集卡片手工比较两个事件时刻，并与 2 年风险差对照。", review: "移植研究 HR=0.7 但基线风险和 PH 未给出，改写可接受结论。", decision: "明确 time zero、风险集、变量单位、PH 与时间点绝对风险语境", keyCheck: "HR 没有被解释成任一时点风险降低固定百分比", nearMiss: "HR=0.7 就写每个患者在所有时间的死亡概率下降 30%" },
  "time-origin": { worked: "患者 1 月 1 日诊断、2 月 1 日开始治疗、3 月 1 日移植；资格、分组和随访起点错位会把必须存活的 31 天制造成 immortal time。", remediation: "在时间线上移动 eligibility、assignment 和 follow-up 三个锚点直到对齐。", review: "药物领取后才归入治疗组却从入院日计时，需重构 target trial。", decision: "让资格、策略分配和随访零点在同一临床时刻对齐", keyCheck: "任何必须存活才能进入暴露组的时间都没有被计作暴露后风险时间", nearMiss: "保留诊断日起算，只把治疗开始日期作为一个普通协变量" },
  "composition-state": { worked: "bulk=比例×类内表达之和：两类细胞通过改变比例或类内表达都能产生相同 bulk 增幅。", remediation: "用 2×2 数字表分别改变比例和类内表达，算出相同混合均值。", review: "蛋白组与单细胞汇总不一致时列出组成、状态和测量层解释。", decision: "把总体信号拆成组成比例与类内状态两个可区分部分", keyCheck: "每供体效应和 CI 足以支持状态变化，而非用未显著宣称没有变化", nearMiss: "细胞群比例增加后就把 bulk signature 全部解释为该群内通路激活" },
  "batch-effect": { worked: "所有病例在 plate A、对照在 plate B 时组效应与批次不可识别；随机铺板和桥接样本比事后校正更关键。", remediation: "在样本×plate 表中重新分配样本并加入桥接样本。", review: "不同中心使用不同测序平台且疾病构成不同，判断何处无法仅靠 integration 修复。", decision: "先在设计阶段打破技术因素与生物组的完全重合，再做有依据的校正", keyCheck: "完全混杂被认定为不可由算法唯一分离", nearMiss: "运行 ComBat 后 PCA 不再按批次分离，因此组效应已经可识别" },
  "bulk-mixture": { worked: "肿瘤/免疫细胞比例与类内表达的数字加权平均说明同一 bulk signature 可来自不同机制。", remediation: "根据两组比例×表达表算 bulk 均值，并列出至少两个兼容解释。", review: "组织蛋白信号增强时设计空间或分选测量区分来源与积累。", decision: "把 bulk 结果表述为混合信号，并提出区分组成与类内变化的测量", keyCheck: "没有从混合均值直接指定产生信号的细胞来源", nearMiss: "参考 marker 与 bulk 信号相关，就直接宣布该细胞群发生机制激活" },
  "rna-protein": { worked: "同一样本 0、6、24 h 的 RNA 先升、蛋白后升；产生、翻译、降解和测量覆盖都可造成时间错位。", remediation: "在双时间曲线中标出合成、降解与检测下限可产生的轨迹。", review: "RNA 下降而组织蛋白沉积增加时提出至少两个可检验解释。", decision: "分别审查两种模态的时间、测量对象和生成/降解机制", keyCheck: "不一致没有被简化成‘其中一种模态一定错’", nearMiss: "RNA 与蛋白方向不同就删除其中一个结果以保持故事一致" },
  "cluster-stability": { worked: "10 次重采样的 co-assignment 矩阵显示 k=2 稳定、k=4 仅由预处理和少数样本驱动。", remediation: "读取共识矩阵并比较两种 k、缩放和初始化。", review: "影像亚型在新医院只能复现连续轴，需撤回离散 subtype。", decision: "比较重采样、预处理和算法扰动下的分配，并验证冻结的新样本规则", keyCheck: "稳定性、可分配性和离散-vs-连续结构都被检查", nearMiss: "选择与结局差异最大的 k，漂亮热图作为稳定证据" },
  pseudobulk: { worked: "按 biological sample×condition×cell type 汇总原始计数；同一 donor 多时间点保留配对，独立 n 仍是 donor 数。", remediation: "从 donor×time×cell type 计数表写聚合键和 design matrix。", review: "配对组织样本中修复把每个样本当独立 donor 的错误设计矩阵。", decision: "保留最小生物样本/条件单元并在模型中处理 donor 配对", keyCheck: "没有在聚合时抹去条件，也没有把多样本冒充多供体", nearMiss: "直接聚合到 donor×cell type，忽略同一 donor 的时间和组织条件" },
  "cross-modal-validation": { worked: "同样本 RNA/蛋白共享选择偏倚，独立样本 IHC 增加样本独立性；先定义验证对象是测量构念还是外部性能。", remediation: "在模态×样本独立性矩阵中标记共享受试者、共享取样与独立测量误差。", review: "影像与病理在同队列一致时只能称支持，需冻结对象和成功标准才称验证。", decision: "准确命名跨模态证据支持的对象及共享偏倚，不自动使用 validation", keyCheck: "同一样本的多模态一致没有被当作独立总体复现", nearMiss: "两种 assay 方向一致就宣布结果已完成外部验证" },
  "alternative-explanation": { worked: "biomarker–预后关联建立真实状态、组成、批次、选择四个模型及各自区分预测矩阵。", remediation: "给一项新证据，逐行更新四个模型权重而不是重新列清单。", review: "诊断模型中心差异用 case mix、测量、治疗路径和真实效应四种解释更新。", decision: "为每个竞争解释写出不同预测，并用新证据更新相对支持", keyCheck: "解释能覆盖全部现有证据且存在可使其升降级的观察", nearMiss: "在 Discussion 罗列多个可能性，但不说明任何区分性预测" },
  "claim-boundary": { worked: "把 abstract 中‘驱动转移’逐词改为带总体、时间、效应尺度和关系类型的‘队列内相关’。", remediation: "在句子上标出对象、关系、尺度、时间和适用域五个缺失槽。", review: "AI 生成的诊断主张从‘临床可用’改到与内部验证和 CI 匹配的语言。", decision: "逐词修订主张，使动词和适用域不超过设计、测量与验证", keyCheck: "总体、时间、效应尺度、关系类型和不确定性均可在句中找到", nearMiss: "保留强动词，只在句末添加‘仍需进一步验证’" },
  robustness: { worked: "缺失处理、极端值和协变量集三项事先有理由的扰动形成 effect/CI 小表，区分触及 estimand 与测试稳健性。", remediation: "在 multiverse 表中标记每个变体的科学理由和是否改变目标量。", review: "单细胞结果对注释方案与低覆盖阈值敏感，更新主张而非挑最显著流程。", decision: "只运行有科学理由的敏感性分析，并按全部结果更新结论", keyCheck: "没有从大量分析中挑选支持原故事的版本", nearMiss: "尝试许多分析后只报告方向最一致的三种，称结果稳健" },
  triangulation: { worked: "观察队列、自然实验和功能实验的目标构念—主要偏倚矩阵显示一致性只有在误差结构不同才增加支持。", remediation: "从四项候选证据中选能改变主要偏倚的两项，并画依赖图。", review: "RNA、蛋白和空间证据共享同一患者时判断独立性有限。", decision: "组合测量同一构念但主要偏倚不同的证据，并解释不一致如何更新", keyCheck: "证据数量没有替代偏倚独立性和构念对齐", nearMiss: "同一数据换三种算法都显著，因此视为三角验证" },
  "minimal-sufficient-analysis": { worked: "三个解释、三种分析、成本和预期结果分支组成决策表；选择单位信息增益最高的中心分层复核。", remediation: "按‘若 A 停止、若 B 升级’画最小决策树。", review: "在新实验与额外建模间按可识别缺口和失败价值选择。", decision: "选择能以最低成本最大区分当前关键解释的下一步，并预写分支动作", keyCheck: "下一步结果会实际改变主张或行动，而非只增加图表", nearMiss: "优先做最复杂、最全面的分析，因为未来可能有用" },
  "evidence-redundancy": { worked: "同一 bulk 数据换三算法、新队列同 assay、同样本正交 assay 画成依赖图并排序新增信息量。", remediation: "把每项证据连接到共享数据、共享误差和独立偏倚节点。", review: "多张相关热图与一个独立验证结果如何分配 Main Figure 位置。", decision: "按数据与误差独立性判断新增信息，而不是按结果数量", keyCheck: "共享受试者、测量和模型假设均被显式标记", nearMiss: "三种软件方向一致就当作三份独立重复" },
  "negative-result": { worked: "效应 1.5、95% CI -0.2–3.2、最小重要效应 2.0：结果不精确且仍兼容重要获益，不能写无效或等效。", remediation: "用 CI 与等效界值把结果分为不确定、排除大效应或支持等效。", review: "诊断灵敏度差异未显著但区间排除了预设不可接受损失，写出非劣结论边界。", decision: "用效应、CI、最小重要/等效界值和偏倚解释阴性结果", keyCheck: "未显著没有被解释成无效，post-hoc power 没有替代区间", nearMiss: "P=0.08，因此写两组无差异并强调有利趋势" },
  "ai-cognitive-outsourcing": { worked: "研究者先独立审查一份 AI Cox 计划，按 5 项清单标出 time zero、cut-point、stepwise、数据泄漏和引用问题，再对照 AI 批评并逐项记录接受/拒绝依据。", remediation: "把另一份单细胞 AI 计划拆成输入契约、真值测试、供体层推断与引用核验表。", review: "先手写最小诊断研究方案，再审查 AI 的阈值、样本角色和因果措辞。", decision: "在调用 AI 前冻结自己的问题与判断，之后逐项验证并记录最终人类决定", keyCheck: "研究者能独立解释问题、复核代码/引用并为结论承担证据责任", nearMiss: "让 AI 先生成完整方案，再由研究者只检查语言是否流畅" },
};

export const stagedConceptLessons: StagedConceptLessonV1[] = conceptRows.map((row, index) => {
  const [slug, title] = row.split("|");
  const section = sectionFor(title);
  if (!section) throw new Error(`Curriculum concept missing Guide section: ${title}`);
  const id = `staged-concept-${slug}`;
  const summary = section.summaryCn;
  const blueprint = conceptCases[slug];
  if (!blueprint) throw new Error(`Curriculum concept missing pedagogy blueprint: ${slug}`);
  const material = conceptAssessmentMaterial[slug];
  if (!material) throw new Error(`Curriculum concept missing materialized assessments: ${slug}`);
  return {
    schemaVersion: 1, id, titleCn: chineseTitles[slug] ?? section.titleCn, titleEn: section.titleEn, guideSectionId: section.id,
    capabilityIds: capabilitiesFor(section.chapterId), prerequisiteIds: prerequisiteMap[slug] ?? [],
    whyItMattersCn: section.bodyCn[0], intuitionCn: section.bodyCn[1], preciseExplanationCn: section.bodyCn[2], workedExampleCn: blueprint.worked,
    explainPromptCn: `不用术语复述：请用两三句话解释「${section.titleCn}」会怎样改变一个生物医学研究的设计、分析或结论边界。`,
    explanationChecklistCn: [`说清研究对象和时间`, `指出「${section.titleCn}」作用的推断层级`, "给出一个会改变判断的反例", "没有把自由文本当成能力分数"],
    primaryApply: buildMaterializedAssessment(id, "apply", material.apply),
    remediation: buildMaterializedAssessment(id, "remediation", material.remediation),
    delayedReview: buildMaterializedAssessment(id, "review", material.review),
    sourceIds: section.evidenceSourceIds, estimatedMinutes: 14 + (index % 4) * 2,
    contentOrigin: "ai_generated", verificationStatus: "pending", lifecycle: "pending_review",
  };
});
