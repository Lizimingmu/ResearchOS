import type { StagedAssessmentAssetV1, StagedMethodLessonV1 } from "../../domain/curriculum";
import { selfRescueGuideSections } from "../self-rescue-guide";

interface MethodSeed {
  slug: string; titleCn: string; titleEn: string; guideTitles: string[];
  question: string; inputs: string[]; core: string; outputs: string[]; assumptions: string[];
  use: string[]; avoid: string[]; misuse: string[]; checks: string[]; paper: string; sources: string[];
}

const seeds: MethodSeed[] = [
  { slug: "differential-analysis", titleCn: "组间比较与差异分析", titleEn: "Group Comparison and Differential Analysis", guideTitles: ["Differential Analysis"], question: "预定义组间在某个连续结局或高维特征上有多大差异？", inputs: ["独立统计单位与分组", "结局/特征及协变量", "预处理与检验族"], core: "在与设计一致的模型中估计组间对比，并在高维场景控制多重性。", outputs: ["效应估计与方向", "标准误/置信区间", "P value 与 FDR"], assumptions: ["独立或正确建模的相关结构", "可辩护的分布/均值—方差关系", "对比与过滤预定义"], use: ["比较预定义生物组", "需要特征级效应与不确定性"], avoid: ["细胞级行数替代供体复制", "先按结果选组或阈值"], misuse: ["只报显著特征", "把 fold change 当机制", "忽略背景检验族"], checks: ["统计单位", "模型与归一化", "FDR 与效应", "批次是否与组混杂"], paper: "Methods 写清单位、归一化、设计矩阵、对比和 FDR；Results 同时报效应与不确定性。", sources: ["src-deseq2", "src-edger", "src-multiple-testing"] },
  { slug: "correlation", titleCn: "相关分析", titleEn: "Correlation", guideTitles: ["Correlation"], question: "两个变量在目标总体中如何共同变化？", inputs: ["成对观测", "变量尺度与范围", "聚类/重复结构"], core: "用 Pearson、Spearman 等统计量概括指定关系，但不识别方向或共同原因。", outputs: ["相关系数", "不确定性", "散点与诊断"], assumptions: ["独立单位正确", "关系形式与系数匹配", "范围和异常点可解释"], use: ["描述共同变化", "生成后续问题"], avoid: ["推断因果", "混合不同总体后给单一系数"], misuse: ["只报 P value", "删除离群点提高相关", "把细胞当供体"], checks: ["散点形状", "范围限制", "共同原因", "分层与聚类"], paper: "报告系数类型、样本单位、图形、区间与预先分析，并限制为关联。", sources: ["src-strobe", "src-pseudorep"] },
  { slug: "linear-regression", titleCn: "线性回归", titleEn: "Linear Regression", guideTitles: ["Linear Regression"], question: "协变量如何与连续结局的条件均值相关？", inputs: ["连续结局", "预定义协变量", "独立单位"], core: "通过线性预测子估计其他变量给定时的均值差异或斜率。", outputs: ["回归系数", "置信区间", "残差诊断"], assumptions: ["条件均值函数形式合理", "残差结构可处理", "观测独立或相关已建模"], use: ["连续结局效应估计", "调整后关联"], avoid: ["强非线性未建模", "无重叠范围外推"], misuse: ["系数写成因果", "单因素筛变量", "忽略单位与交互"], checks: ["变量编码", "函数形式", "影响点", "缺失处理"], paper: "说明公式、编码、诊断和敏感性，报告系数尺度而非只报显著性。", sources: ["src-strobe", "src-tripod"] },
  { slug: "logistic-regression", titleCn: "Logistic 回归", titleEn: "Logistic Regression", guideTitles: ["Logistic Regression"], question: "协变量如何与二元结局的条件 odds 或预测概率相关？", inputs: ["二元结局", "协变量和参照", "事件/非事件信息"], core: "以 logit 链接建立条件 log-odds 模型，并可转换为给定协变量下的概率。", outputs: ["odds ratio", "预测概率", "CI、校准与区分"], assumptions: ["函数形式合理", "事件信息与参数相称", "结局定义一致"], use: ["二元结局关联", "风险预测开发"], avoid: ["常见结局下把 OR 当 RR", "完全分离未处理"], misuse: ["stepwise 后普通 CI", "只看 AUC", "开发数据即验证"], checks: ["事件数", "非线性/交互", "校准", "验证隔离"], paper: "区分解释与预测目标，报告 OR 单位、绝对概率、校准和验证。", sources: ["src-tripod", "src-probaST"] },
  { slug: "cox-regression", titleCn: "Cox 比例风险回归", titleEn: "Cox Proportional Hazards Regression", guideTitles: ["Cox Proportional Hazards", "Hazard Ratio", "PH assumption", "Time origin"], question: "协变量如何与 time-to-event 结局的相对瞬时 hazard 相关？", inputs: ["时间起点和随访时间", "事件/删失", "编码明确的协变量"], core: "在每个事件时刻的风险集中比较相对 hazard，不参数化基线 hazard。", outputs: ["HR 与 CI", "PH/函数形式诊断", "调整后生存或风险语境"], assumptions: ["time origin 对齐", "PH 或已建模时间变化", "删失可处理", "事件信息充分"], use: ["时间—事件关联", "预后模型中的相对 hazard"], avoid: ["固定时点绝对风险问题却只给 HR", "immortal time 未处理"], misuse: ["HR 当风险比", "总样本量替代事件数", "不检查 PH"], checks: ["风险集", "HR 单位", "事件/参数", "验证与绝对风险"], paper: "说明起点、事件、删失、变量选择、PH 与验证；Results 报 HR、CI 和时间化绝对风险。", sources: ["src-cox", "src-pmsampsize"] },
  { slug: "kaplan-logrank", titleCn: "Kaplan–Meier 与 log-rank", titleEn: "Kaplan–Meier and Log-Rank", guideTitles: ["Kaplan–Meier", "Log-rank test"], question: "不同组的生存经验在随访中是否、如何不同？", inputs: ["起点、时间、事件", "组别", "删失与风险表"], core: "KM 乘积估计条件生存，log-rank 比较事件时刻的观察与期望。", outputs: ["生存曲线", "时点生存率与区间", "log-rank P value"], assumptions: ["删失可处理", "组和起点定义正确", "比较问题与权重匹配"], use: ["描述生存分布", "预定义组间整体比较"], avoid: ["竞争事件下把 1-KM 当目标风险", "数据驱动 cut-point"], misuse: ["只看曲线分离", "忽略风险表", "log-rank 代替效应"], checks: ["time zero", "删失标记", "风险人数", "曲线交叉"], paper: "给曲线、风险表、时点估计和区间；检验不能替代效应尺度。", sources: ["src-cox", "src-competing"] },
  { slug: "restricted-cubic-spline", titleCn: "限制性立方样条", titleEn: "Restricted Cubic Spline", guideTitles: ["Restricted Cubic Spline"], question: "连续变量与结局的关系是否呈平滑非线性？", inputs: ["连续变量", "结局模型", "预设结点/自由度"], core: "用分段立方基函数表示曲线，并在线性尾部约束以减少极端不稳定。", outputs: ["调整后曲线", "区间", "非线性贡献"], assumptions: ["数据范围支持曲线", "自由度与信息量相称", "结点策略可辩护"], use: ["避免强制线性", "探索预先合理的平滑形状"], avoid: ["稀疏尾部读阈值", "用最小 P 选 cut-point"], misuse: ["曲线拐点称生物阈值", "不画数据支持", "过多结点"], checks: ["结点与参照", "尾部样本", "整体/非线性检验", "外部验证"], paper: "报告结点、参照、自由度并展示带区间曲线和数据分布。", sources: ["src-cox", "src-tripod"] },
  { slug: "bootstrap", titleCn: "Bootstrap", titleEn: "Bootstrap", guideTitles: ["Bootstrap"], question: "估计、选择或模型表现对样本扰动有多稳定？", inputs: ["独立抽样单位", "完整分析流程", "重采样次数"], core: "从经验分布有放回抽取单位，重复完整流程以近似抽样分布或乐观偏倚。", outputs: ["标准误/区间", "稳定性", "乐观校正表现"], assumptions: ["重采样层级正确", "经验样本代表目标过程", "完整选择步骤被重复"], use: ["内部验证", "估计不确定性"], avoid: ["创造外部验证", "细胞级重采样患者问题"], misuse: ["只重拟合最终模型", "忽略聚类", "把稳定当无偏"], checks: ["重采样单位", "流程嵌套", "重复充分", "报告分布"], paper: "说明重采样单位、次数、每次步骤和汇总方式。", sources: ["src-internal-validation", "src-tripod"] },
  { slug: "cross-validation", titleCn: "交叉验证", titleEn: "Cross-Validation", guideTitles: ["Cross-validation"], question: "完整开发流程在未用于拟合的样本上表现如何？", inputs: ["样本级分折", "完整预处理/选择/拟合流程", "预定义指标"], core: "轮流用训练折拟合全部步骤并在保留折评价，必要时用嵌套 CV 调参。", outputs: ["折外性能", "变异", "调参选择"], assumptions: ["分折保留聚类和时间结构", "测试折未泄漏", "评价样本代表目标"], use: ["内部泛化评估", "模型比较与调参"], avoid: ["时间外推却随机分折", "先全数据选特征"], misuse: ["预处理在全数据", "报告最好一次划分", "CV 叫外部验证"], checks: ["折分单位", "嵌套选择", "重复策略", "不确定性"], paper: "画清数据流，说明分折、重复、嵌套与所有预处理位置。", sources: ["src-leakage", "src-tripod"] },
  { slug: "roc-auc", titleCn: "ROC / AUC", titleEn: "ROC and AUC", guideTitles: ["ROC / AUC"], question: "模型在不同阈值上区分病例与非病例的排序能力如何？", inputs: ["连续预测分数", "二元参照结局", "独立评价数据"], core: "ROC 描述灵敏度—1特异度权衡，AUC 是随机病例得分高于随机非病例的概率解释。", outputs: ["ROC 曲线", "AUC 与 CI", "阈值性能"], assumptions: ["参照结局可靠", "评价集未用于开发", "抽样与目标使用匹配"], use: ["比较区分能力", "阈值前总体排序"], avoid: ["证明校准或临床效用", "同数据选 cut-point 并评价"], misuse: ["AUC 高等于可用", "忽略 prevalence/代价", "无 CI"], checks: ["验证集", "校准", "临床阈值", "比较检验"], paper: "报告数据角色、AUC 区间、阈值指标并与校准和 utility 分开。", sources: ["src-roc", "src-tripod"] },
  { slug: "time-dependent-auc", titleCn: "时间依赖 AUC", titleEn: "Time-Dependent AUC", guideTitles: ["Time-dependent AUC"], question: "在指定预测时间，模型对未来事件的区分能力如何？", inputs: ["风险分数", "事件/删失时间", "明确定义动态病例与对照"], core: "在时间轴上用删失校正定义病例/对照并计算时点区分。", outputs: ["AUC(t)", "区间/曲线", "时点比较"], assumptions: ["删失权重可处理", "病例/对照定义符合目标", "模型预测时间冻结"], use: ["生存预测区分", "比较随时间变化表现"], avoid: ["不说明定义", "把 AUC(t) 当绝对风险准确"], misuse: ["挑最好时点", "忽略校准", "开发集评价"], checks: ["时间点预设", "删失方法", "验证隔离", "风险人数"], paper: "说明 AUC 定义、时间、删失估计、区间与校准结果。", sources: ["src-roc", "src-cox", "src-tripod"] },
  { slug: "pca", titleCn: "主成分分析", titleEn: "Principal Component Analysis", guideTitles: ["PCA"], question: "高维数据的主要线性变异方向是什么？", inputs: ["样本×特征矩阵", "中心化/缩放规则", "完整样本元数据"], core: "寻找相互正交、依次最大化投影方差的线性组合。", outputs: ["scores", "loadings", "解释方差"], assumptions: ["线性方差结构有意义", "尺度处理合理", "异常值被审查"], use: ["质量控制", "可视化主要变异"], avoid: ["证明离散亚型", "把 PC 自动命名机制"], misuse: ["忽略批次", "只画前两 PC", "先按结局筛特征"], checks: ["缩放", "loadings", "批次/组成", "稳健性"], paper: "报告输入、变换、缩放、解释方差与元数据关联。", sources: ["src-pca", "src-batch"] },
  { slug: "nmf", titleCn: "非负矩阵分解", titleEn: "Non-Negative Matrix Factorization", guideTitles: ["NMF"], question: "能否用少量非负程序及其样本权重概括高维信号？", inputs: ["非负样本×特征矩阵", "候选秩", "多次初始化"], core: "把矩阵近似为非负基与系数乘积，形成部分可加的程序表示。", outputs: ["basis/metagenes", "sample coefficients", "consensus/stability"], assumptions: ["非负加性表征合理", "秩选择可辩护", "初始化稳定"], use: ["程序发现", "候选分子状态"], avoid: ["直接称机制亚型", "单次初始化"], misuse: ["按结局选秩", "无稳定性", "训练标签硬套新数据"], checks: ["秩与共识", "预处理", "外部可分配", "组成解释"], paper: "报告输入变换、秩、初始化、稳定性和冻结分配规则。", sources: ["src-nmf", "src-clustering"] },
  { slug: "clustering", titleCn: "聚类", titleEn: "Clustering", guideTitles: ["Clustering"], question: "样本或特征在给定表征和相似度下呈现怎样的群组结构？", inputs: ["特征表征", "距离/相似度", "算法与超参数"], core: "依据优化目标把相似对象组织为组；结果依赖表征、尺度和算法。", outputs: ["cluster labels", "中心/树", "稳定性"], assumptions: ["所选距离有科学意义", "结构可重复", "异常/批次已审查"], use: ["探索结构", "生成可验证分类"], avoid: ["把任意切割称亚型", "用结局调聚类"], misuse: ["只看热图", "忽略连续谱", "无外部标签规则"], checks: ["稳定性", "替代算法", "批次/组成", "新样本分配"], paper: "报告完整预处理、距离、参数、稳定性与验证，不只给最终簇数。", sources: ["src-clustering", "src-batch"] },
  { slug: "gsea", titleCn: "GSEA", titleEn: "Gene Set Enrichment Analysis", guideTitles: ["GSEA"], question: "预定义基因集成员是否集中于排序列表的顶部或底部？", inputs: ["全特征排序统计量", "版本化基因集", "合适置换单位"], core: "沿排名计算运行和并用零分布评价富集与多重性。", outputs: ["enrichment score/NES", "leading edge", "FDR"], assumptions: ["排序统计量有方向", "置换保留设计", "基因集背景和版本合理"], use: ["弱协调信号", "程序层解释"], avoid: ["小样本标签置换不稳", "把富集称激活"], misuse: ["只报名词", "忽略冗余", "挑数据库版本"], checks: ["排序来源", "置换层级", "集合大小", "leading edge 与方向"], paper: "报告数据库版本、排名、置换、集合过滤、NES/FDR 和冗余处理。", sources: ["src-gsea", "src-camera"] },
  { slug: "gsva-ssgsea", titleCn: "GSVA / ssGSEA", titleEn: "GSVA and ssGSEA", guideTitles: ["GSVA / ssGSEA"], question: "如何为每个样本得到相对基因集表达分数？", inputs: ["表达矩阵", "基因集", "算法/核与归一化"], core: "在样本内或跨样本转换表达排名/分布，得到相对 gene-set score。", outputs: ["样本×基因集分数", "组间对比", "热图/关联"], assumptions: ["表达尺度适用", "基因集覆盖充分", "后续统计以样本为单位"], use: ["样本级程序描述", "跨样本比较候选状态"], avoid: ["称直接通路活性", "单细胞逐细胞当独立患者"], misuse: ["无背景/版本", "分数方向过度解释", "共享基因集当独立证据"], checks: ["算法参数", "批次", "基因集冗余", "独立单位"], paper: "报告实现、版本、输入尺度、过滤与后续样本级模型。", sources: ["src-gsva", "src-multiple-testing"] },
  { slug: "wgcna", titleCn: "WGCNA", titleEn: "Weighted Gene Co-Expression Network Analysis", guideTitles: ["Pathway / program interpretation"], question: "哪些特征在样本间共同变化并形成可概括的相关模块？", inputs: ["样本×特征矩阵", "相似度与软阈值", "样本级性状"], core: "将相关转为加权网络，识别模块并用 eigengene 概括共同变化。", outputs: ["modules", "eigengenes", "connectivity/trait associations"], assumptions: ["相关结构稳定", "样本量和预处理足够", "批次未主导"], use: ["共表达模块", "候选程序和 hub"], avoid: ["把网络边当调控", "少样本高噪声硬找模块"], misuse: ["按性状调参数", "hub 当因果靶点", "无保存性"], checks: ["样本 QC", "参数敏感性", "模块保存", "组成/批次"], paper: "报告网络类型、软阈值、模块合并、性状分析和独立保存性。", sources: ["src-wgcna", "src-batch"] },
  { slug: "pseudobulk", titleCn: "Pseudobulk", titleEn: "Pseudobulk Differential Analysis", guideTitles: ["Pseudobulk"], question: "在指定细胞类型内，供体组间表达是否不同？", inputs: ["原始计数", "供体×细胞类型标签", "样本级设计"], core: "在供体×细胞类型内汇总计数，再以供体为复制拟合计数模型。", outputs: ["供体级效应", "CI/P/FDR", "每供体 QC"], assumptions: ["供体独立", "注释/聚合可辩护", "足够供体和细胞覆盖"], use: ["患者组间 scRNA DE", "避免细胞伪重复"], avoid: ["只有一个供体/组", "把组成问题当状态"], misuse: ["按细胞重复", "合并批次后丢供体", "忽略低覆盖"], checks: ["供体数", "design matrix", "每供体 counts", "组成与状态分离"], paper: "明确聚合单位、供体数、计数模型、协变量与 FDR。", sources: ["src-pseudobulk", "src-single-cell-2023"] },
  { slug: "differential-abundance", titleCn: "差异丰度", titleEn: "Differential Abundance", guideTitles: ["Differential abundance"], question: "细胞群或状态在样本组间的相对丰度是否不同？", inputs: ["供体级细胞计数/邻域", "总细胞或组成基准", "样本协变量"], core: "在样本复制层比较类别或图邻域丰度，并处理组成性和多重性。", outputs: ["丰度效应", "邻域/群体 FDR", "样本级图"], assumptions: ["采样流程可比较", "供体是复制", "组成模型合适"], use: ["细胞组成变化", "连续状态邻域变化"], avoid: ["逐细胞检验", "捕获效率完全与组混杂"], misuse: ["细胞数当 n", "只报比例均值", "把丰度当增殖机制"], checks: ["每供体比例", "采样深度", "协变量", "多重性"], paper: "报告样本数、计数/邻域定义、组成处理、效应和 FDR。", sources: ["src-milo", "src-single-cell-2023"] },
  { slug: "trajectory-pseudotime", titleCn: "轨迹与伪时间", titleEn: "Trajectory and Pseudotime", guideTitles: ["Trajectory / pseudotime"], question: "快照细胞状态是否可由一条或多条连续路径组织？", inputs: ["细胞表征", "起点/根假设", "图或模型参数"], core: "按表达相似结构排列相对状态并估计分支；顺序不是实时时钟。", outputs: ["pseudotime", "branches", "沿轨迹特征变化"], assumptions: ["采样覆盖过程", "相似性反映目标变化", "根/方向有外部依据"], use: ["生成状态转换假设", "描述连续谱"], avoid: ["证明谱系或因果", "组间差异被整合抹平"], misuse: ["箭头当时间", "单数据挑根", "细胞作独立复制"], checks: ["替代根/算法", "供体一致性", "时间/谱系证据", "批次"], paper: "报告表征、根、参数、供体稳健性，并称推断轨迹而非已证谱系。", sources: ["src-trajectory", "src-rna-velocity"] },
  { slug: "cellchat-communication", titleCn: "CellChat 与细胞通信推断", titleEn: "CellChat and Cell–Cell Communication Inference", guideTitles: ["CellChat-type inference boundaries", "Cell–cell communication"], question: "哪些细胞群表达相容的配体—受体组合，值得后续验证？", inputs: ["表达与细胞标签", "配体受体数据库", "样本/条件结构"], core: "根据数据库和表达汇总候选发送—接收关系，输出是通信潜力假设。", outputs: ["候选边/通路", "相对权重", "条件比较"], assumptions: ["数据库适用", "表达可作为候选代理", "组成和样本复制被处理"], use: ["生成相互作用假设", "组织后续实验"], avoid: ["证明实际信号传递", "逐细胞 P value 当患者证据"], misuse: ["网络更密等于更强生物通信", "忽略细胞比例", "数据库命中当机制"], checks: ["供体重现", "组成敏感性", "表达阈值", "空间/功能验证"], paper: "用 inference/predicted language，报告数据库、参数、样本层比较和验证计划。", sources: ["src-cellchat", "src-single-cell-2023"] },
];

const normalize = (value: string) => value.toLowerCase().replace(/[\s/–—-]+/g, "").replace(/[()]/g, "");
const guideIds = (titles: string[]) => titles.map((title) => selfRescueGuideSections.find((section) => normalize(section.titleCn) === normalize(title) || normalize(section.titleEn) === normalize(title))?.id).filter((id): id is string => Boolean(id));

function methodAssessment(seed: MethodSeed, role: StagedAssessmentAssetV1["role"], context: string): StagedAssessmentAssetV1 {
  const id = `staged-method-${seed.slug}`;
  return {
    id: `${id}-${role}-v1`, role,
    scenarioCn: `${context}团队计划使用${seed.titleCn}，但尚未完整说明数据结构、假设与验证。`,
    promptCn: `选择两项最优先的审稿行动，并用短推理写出${seed.titleCn}在当前材料下的最大结论。`,
    options: [
      { id: `${id}-${role}-assumption`, labelCn: `先核对：${seed.assumptions[0]}，并用诊断或敏感性说明其影响` },
      { id: `${id}-${role}-report`, labelCn: `把${seed.outputs[0]}与不确定性、数据角色和适用范围一起报告` },
      { id: `${id}-${role}-shortcut`, labelCn: `优先采用“${seed.misuse[0]}”以得到更简洁的最终模型` },
      { id: `${id}-${role}-upgrade`, labelCn: `若主要统计量方向一致，可把输出直接表述为已验证机制或临床价值` },
    ],
    expectedOptionIds: [`${id}-${role}-assumption`, `${id}-${role}-report`],
    reasoningCriteriaCn: [seed.checks[0], seed.checks[1], "区分方法输出与科学主张"],
    feedbackCn: [`${seed.titleCn}首先回答：${seed.question}`, `关键误用：${seed.misuse.join("；")}`, `论文核查：${seed.paper}`],
    maximumConclusionCn: `当前只能在${seed.assumptions.slice(0, 2).join("、")}成立且分析流程透明的条件下解释${seed.outputs[0]}；外部、因果或机制主张仍需相应验证。`,
    hints: [], confidenceRequired: true, responseLocked: true,
  };
}

const methodPrerequisites: Record<string, string[]> = {
  "differential-analysis": ["staged-concept-statistical-unit", "staged-concept-multiple-testing-fdr"],
  correlation: ["staged-concept-association-causation"],
  "linear-regression": ["staged-concept-confounding", "staged-concept-interaction"],
  "logistic-regression": ["staged-concept-confounding", "staged-concept-overfitting"],
  "cox-regression": ["staged-concept-censoring", "staged-concept-time-origin", "staged-concept-hazard-ratio"],
  "kaplan-logrank": ["staged-concept-censoring", "staged-concept-time-origin"],
  "restricted-cubic-spline": ["staged-concept-overfitting"],
  bootstrap: ["staged-concept-standard-error"],
  "cross-validation": ["staged-concept-validation", "staged-concept-data-leakage"],
  "roc-auc": ["staged-concept-validation"],
  "time-dependent-auc": ["staged-concept-censoring", "staged-concept-validation"],
  pca: ["staged-concept-batch-effect"], nmf: ["staged-concept-cluster-stability"], clustering: ["staged-concept-cluster-stability"],
  gsea: ["staged-concept-multiple-testing-fdr"], "gsva-ssgsea": ["staged-concept-bulk-mixture"], wgcna: ["staged-concept-association-causation"],
  pseudobulk: ["staged-concept-statistical-unit", "staged-concept-pseudoreplication"],
  "differential-abundance": ["staged-concept-statistical-unit", "staged-concept-composition-state"],
  "trajectory-pseudotime": ["staged-concept-batch-effect"], "cellchat-communication": ["staged-concept-composition-state"],
};

export const stagedMethodLessons: StagedMethodLessonV1[] = seeds.map((seed, index) => ({
  schemaVersion: 1, id: `staged-method-${seed.slug}`, titleCn: seed.titleCn, titleEn: seed.titleEn,
  guideSectionIds: guideIds(seed.guideTitles), capabilityIds: seed.slug.includes("cell") || ["pca", "nmf", "clustering", "gsea", "gsva-ssgsea", "wgcna", "pseudobulk", "differential-abundance", "trajectory-pseudotime"].includes(seed.slug) ? ["omics_reasoning", "statistical_reasoning", "result_interpretation"] : ["statistical_reasoning", "result_interpretation"],
  prerequisiteIds: methodPrerequisites[seed.slug] ?? ["staged-concept-statistical-unit"],
  scientificQuestionCn: seed.question, inputsCn: seed.inputs, coreLogicCn: seed.core, outputsCn: seed.outputs, assumptionsCn: seed.assumptions,
  appropriateWhenCn: seed.use, inappropriateWhenCn: seed.avoid, misusePatternsCn: seed.misuse, reviewerChecksCn: seed.checks, paperAppearanceCn: seed.paper,
  primaryApply: methodAssessment(seed, "apply", "一个回顾性肿瘤队列已完成数据清理。"),
  remediation: methodAssessment(seed, "remediation", "一个多中心移植队列在中心间出现异质性。"),
  delayedReview: methodAssessment(seed, "review", "一项独立的单细胞或临床验证研究需要审稿。"),
  sourceIds: seed.sources, estimatedMinutes: 9 + (index % 3), contentOrigin: "ai_generated", verificationStatus: "pending", lifecycle: "pending_review",
}));
