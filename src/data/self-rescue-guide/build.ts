import type { ContentClassification, ResearchGuideSectionV1 } from "../../domain/learningArchitecture";
import { canonicalJson, sha256 } from "../../services/contentStudio";
import { advancedGuideModules } from "./catalog-advanced";
import { foundationGuideModules } from "./catalog-foundations";
import type { GuideModuleSpec, GuideTopicSeed } from "./types";

export const selfRescueGuideModules = [...foundationGuideModules, ...advancedGuideModules].sort((a, b) => a.order - b.order);

const thresholdTerms = /Question|Hypothesis|Evidence|Causation|Unit|Replicate|Pseudoreplication|Population|Confounding|Bias|Validity|Effect Size|Standard Error|Confidence Interval|P Value|FDR|Power|Interaction|Overfitting|Leakage|Validation|Censoring|Hazard Ratio|Time Origin|Composition|Batch|Mixture|RNA|Cluster Stability|Pseudobulk|Alternative|Claim Boundary|Robustness|Triangulation|Cognitive Outsourcing/i;
const methodTerms = /Regression|Kaplan|Log-Rank|Spline|Bootstrap|Cross-Validation|AUC|PCA|NMF|Clustering|GSEA|GSVA|WGCNA|Differential|Trajectory|CellChat|Communication|Normalization/i;

function classificationFor(topic: GuideTopicSeed): ContentClassification {
  if (topic.classification) return topic.classification;
  if (methodTerms.test(`${topic.titleCn} ${topic.titleEn}`)) return "method";
  if (thresholdTerms.test(`${topic.titleCn} ${topic.titleEn}`)) return "threshold_concept";
  if (/design|judgment|interpret|next|Figure|reading|audit|strategy|explanation|robust|review/i.test(`${topic.titleCn} ${topic.titleEn}`)) return "judgment_skill";
  return "reference_only";
}

const explicitSourceIdsByTitle: Record<string, string[]> = {
  "Topic, Phenomenon, Problem, and Question": ["src-strong-inference", "src-paper-structure"],
  "Hypothesis": ["src-strong-inference"],
  "Observation, Result, Interpretation, and Conclusion": ["src-strobe", "src-paper-structure"],
  "Novelty versus Importance": ["src-paper-structure", "src-paper-reading"],
  "Exploratory versus Confirmatory Research": ["src-strong-inference", "src-asa-pvalue"],
  "Deriving the Next Question from Current Results": ["src-strong-inference"],
  "When to Stop Analyzing a Question": ["src-strong-inference"],
  "What Makes a Question Answerable by Evidence": ["src-strong-inference", "src-strobe"],
  "Evidence versus Claim": ["src-strobe", "src-strong-inference"],
  "Why Unstudied Does Not Mean Important": ["src-paper-reading", "src-paper-structure"],
  "Covariate": ["src-regression-strategies", "src-dag"],
  "Sampling Frame": ["src-strobe", "src-selection-bias"],
  "Exposure": ["src-strobe"],
  "Predictor versus Explanatory Variable": ["src-regression-strategies", "src-dag"],
  "Information Bias": ["src-misclassification-direction"],
  "Variable Types": ["src-nist-statistics-handbook"],
  "Distribution": ["src-nist-statistics-handbook"],
  "Mean and Median": ["src-nist-statistics-handbook"],
  "Variance and Standard Deviation": ["src-nist-statistics-handbook", "src-standard-error"],
  "Sampling Variability": ["src-nist-statistics-handbook", "src-standard-error"],
  "Type I and Type II Error": ["src-nist-statistics-handbook", "src-power"],
  "Sample Size Reasoning": ["src-power", "src-pmsampsize", "src-pm-external"],
  "Correlation": ["src-correlation-regression", "src-nist-statistics-handbook"],
  "Linear Regression": ["src-regression-strategies", "src-correlation-regression"],
  "Logistic Regression": ["src-regression-strategies"],
  "Covariate Adjustment": ["src-regression-strategies", "src-dag"],
  "Non-linearity": ["src-regression-strategies", "src-rcs"],
  "Residuals and Diagnostics": ["src-regression-strategies", "src-nist-statistics-handbook"],
  "Cross-Validation": ["src-internal-validation", "src-leakage"],
  "Log-Rank Test": ["src-logrank", "src-survival-censoring"],
  "Multivariable Survival Modeling": ["src-regression-strategies", "src-cox"],
  "Variable Encoding": ["src-tidy-data", "src-good-enough-computing"],
  "Wide versus Long Format": ["src-tidy-data"],
  "Identifiers and Joins": ["src-tidy-data", "src-good-enough-computing"],
  "Filter, Select, Group, and Summarize": ["src-tidy-data"],
  "Function": ["src-good-enough-computing"],
  "Random Seed": ["src-good-enough-computing", "src-nist-statistics-handbook"],
  "Deterministic versus Stochastic Analysis": ["src-good-enough-computing", "src-nist-statistics-handbook"],
  "Minimal Git Concepts": ["src-git-docs", "src-good-enough-computing"],
  "Common Silent Data Errors": ["src-good-enough-computing", "src-tidy-data"],
  "Duplicates": ["src-tidy-data", "src-good-enough-computing"],
  "Input, Transformation, Output": ["src-good-enough-computing"],
  "Literature Gap": ["src-paper-reading", "src-prisma-2020"],
  "Figures-First Reading": ["src-paper-reading", "src-better-figures"],
  "Figure Evidence Jobs": ["src-better-figures", "src-paper-structure"],
  "Reading a Heatmap": ["src-clustering", "src-batch", "src-better-figures"],
  "Reading Pathway Results": ["src-gsea", "src-camera", "src-ora"],
  "Major Concern versus Minor Limitation": ["src-paper-reading", "src-strobe"],
  "Identifying the Real Research Question": ["src-paper-reading", "src-paper-structure"],
  "Introduction as an Argument": ["src-paper-structure"],
  "Results Evidence Chain": ["src-paper-structure", "src-paper-reading"],
  "Reviewer-Style Reading": ["src-paper-reading", "src-strobe"],
  "Learning Project Architecture from a Strong Paper": ["src-paper-reading", "src-paper-structure"],
  "What to Record in a Paper Card": ["src-paper-reading", "src-strobe"],
  "Benchmarking against High-Level Literature": ["src-paper-reading", "src-prisma-2020"],
  "Feature Selection": ["src-leakage", "src-internal-validation", "src-tripod-ai"],
  "Proteomics Measurement Concepts": ["src-proteomics-overview", "src-proteomics-missing"],
  "ECM and Matrisome Interpretation Boundaries": ["src-ecm-proteomics", "src-spatial"],
  "Integrating Evidence without Forcing Agreement": ["src-strong-inference", "src-multiomics"],
  "RNA Is Not Protein": ["src-multiomics", "src-proteomics-overview"],
  "Differential Analysis": ["src-deseq2", "src-edger"],
  "GSVA and ssGSEA": ["src-gsva", "src-ssgsea"],
  "Representative Features": ["src-leakage", "src-internal-validation"],
  "Triangulation": ["src-strong-inference", "src-multiomics"],
  "Observation versus Meaning": ["src-strobe", "src-strong-inference"],
  "Outliers": ["src-nist-statistics-handbook", "src-regression-strategies"],
  "Subgroup Analysis": ["src-interaction", "src-consort"],
  "What Deserves a Main Conclusion": ["src-paper-structure", "src-strobe"],
  "Negative-Result Branch": ["src-confidence-interval", "src-power"],
  "What a Figure Panel Must Answer": ["src-better-figures", "src-paper-structure"],
  "Figure 1-to-N Logic": ["src-paper-structure", "src-better-figures"],
  "Mechanistic Depth versus Evidence Boundary": ["src-strong-inference", "src-strobe"],
  "Panel Design": ["src-better-figures"],
  "Translational Follow-Up": ["src-strong-inference", "src-strobe"],
  "Proposing Next Steps to a Mentor": ["src-strong-inference"],
  "Deciding What Is Worth Time": ["src-strong-inference"],
  "From Result to New Question": ["src-strong-inference"],
  "Minimal Sufficient Analysis": ["src-strong-inference"],
  "When to Stop Analyzing": ["src-strong-inference"],
  "What a Main Figure Must Accomplish": ["src-better-figures", "src-paper-structure"],
  "Paper-Level Evidence Chain": ["src-paper-structure", "src-paper-reading"],
  "Narrative Order": ["src-paper-structure"],
  "Figure Evidence Job": ["src-better-figures", "src-paper-structure"],
  "Presentation and Lab Meeting": ["src-better-figures", "src-paper-structure"],
  "Figure Title": ["src-better-figures", "src-paper-structure"],
  "Main Figure versus Result Warehouse": ["src-better-figures", "src-paper-structure"],
  "Reviewer Attack Surface": ["src-paper-reading", "src-strobe"],
  "Response-to-Reviewer Thinking": ["src-paper-reading", "src-strobe"],
  "Explaining Why an Analysis Should Be Done": ["src-paper-structure", "src-strobe"],
  "Explaining Why an Analysis Should Not Be Done": ["src-paper-structure", "src-strobe"],
};

function sourceIdsFor(module: GuideModuleSpec, topic: GuideTopicSeed): string[] {
  if (topic.sourceIds?.length) return topic.sourceIds;
  if (explicitSourceIdsByTitle[topic.titleEn]) return explicitSourceIdsByTitle[topic.titleEn];
  const text = `${topic.titleCn} ${topic.titleEn}`;
  const specific: Array<[RegExp, string[]]> = [
    [/p.?value|statistical significance/i, ["src-asa-pvalue"]],
    [/multiple testing|FDR/i, ["src-multiple-testing"]],
    [/missing/i, ["src-missing"]],
    [/Cox|Hazard|PH assumption/i, ["src-cox"]],
    [/Kaplan|log-rank/i, ["src-km-tutorial", "src-survival-censoring"]],
    [/censor|left truncation|interval-censored/i, ["src-survival-censoring", "src-km-tutorial"]],
    [/time origin|immortal|landmark/i, ["src-target-trial"]],
    [/competing risk/i, ["src-competing"]],
    [/calibration/i, ["src-calibration"]],
    [/ROC|AUC|discrimination/i, ["src-roc"]],
    [/bootstrap|internal validation|overfitting/i, ["src-internal-validation"]],
    [/external validation|validation set/i, ["src-tripod-ai", "src-probaST", "src-pm-external"]],
    [/prediction/i, ["src-tripod", "src-probaST"]],
    [/data leakage/i, ["src-leakage"]],
    [/events.?per.?parameter|model complexity/i, ["src-pmsampsize"]],
    [/C.?index|concordance index/i, ["src-harrell-c"]],
    [/time.?dependent AUC/i, ["src-time-auc"]],
    [/standard error|\bSE\b/i, ["src-standard-error"]],
    [/confidence interval|negative result|null result/i, ["src-confidence-interval", "src-asa-pvalue"]],
    [/power|sample size reasoning/i, ["src-power"]],
    [/interaction|effect modification/i, ["src-interaction"]],
    [/selection bias|attrition|loss to follow/i, ["src-selection-bias"]],
    [/correlation|linear regression/i, ["src-correlation-regression"]],
    [/competing hypotheses|alternative explanation|change my mind/i, ["src-strong-inference"]],
    [/unit|replicate|pseudorep/i, ["src-pseudorep"]],
    [/confound|caus|collider|mediat/i, ["src-dag"]],
    [/PCA/i, ["src-pca"]],
    [/UMAP/i, ["src-umap"]],
    [/NMF/i, ["src-nmf"]],
    [/molecular subtype/i, ["src-clustering", "src-nmf"]],
    [/clustering|cluster stability/i, ["src-clustering"]],
    [/\bGSEA\b/i, ["src-gsea"]],
    [/CAMERA|competitive gene.?set|inter.?gene correlation/i, ["src-camera"]],
    [/over.?representation|enrichment analysis/i, ["src-ora"]],
    [/\bGSVA\b/i, ["src-gsva"]],
    [/\bssGSEA\b/i, ["src-ssgsea"]],
    [/restricted cubic spline/i, ["src-rcs"]],
    [/WGCNA/i, ["src-wgcna"]],
    [/batch|integration/i, ["src-batch", "src-scib"]],
    [/normalization/i, ["src-sctransform", "src-batch"]],
    [/pseudobulk|donor-level|single-cell differential/i, ["src-pseudobulk"]],
    [/differential abundance/i, ["src-milo"]],
    [/trajectory|pseudotime/i, ["src-trajectory"]],
    [/CellChat|cell.?cell communication/i, ["src-cellchat"]],
    [/spatial/i, ["src-spatial", "src-spatial-original"]],
    [/multi-omics|cross-modal|跨模态|多组学|omics concordance|omics discordance/i, ["src-mofa-plus", "src-diablo"]],
    [/Cell QC/i, ["src-scrna-best", "src-doubletfinder", "src-soupx"]],
    [/(?:\bAI\b|人工智能|cognitive outsourcing|hallucination|prompt)/i, ["src-nist-genai-profile", "src-nist-ai-rmf"]],
    [/code|reproduc|provenance|Git|environment|analysis output/i, ["src-fair"]],
    [/paper|literature|review article|forest plot/i, ["src-prisma-2020"]],
  ];
  const matched = specific.flatMap(([pattern, ids]) => pattern.test(text) ? ids : []);
  return [...new Set(matched.length ? matched : module.defaultSourceIds)].slice(0, 4);
}

function misconceptionFor(module: GuideModuleSpec, topic: GuideTopicSeed): string {
  const text = `${topic.titleCn} ${topic.titleEn}`;
  if (/validation/i.test(text)) return `在${module.titleCn}中，常见误区是看到“${topic.titleCn}”就认为结论已经在新人群中成立。先分清内部重采样、匹配多模态支持、技术验证与真正独立外部验证；它们解决的误差来源不同。`;
  if (/association|correlation|regression|subtype|cluster|pathway|communication|trajectory/i.test(text)) return `在${module.titleCn}中，常见误区是把“${topic.titleCn}”的模式直接改写成因果或机制。算法可以稳定描述数据结构，却不能补上时间顺序、干预、细胞来源或未测量共同原因。`;
  if (/P value|significance|power|confidence|FDR/i.test(text)) return `在${module.titleCn}中，常见误区是把“${topic.titleCn}”当作结果真实、重要或可重复的概率。统计量只在指定设计、模型和选择过程下有定义，不能替代效应、不确定性与偏倚审查。`;
  if (/AI|code|script|reproduc/i.test(text)) return `在${module.titleCn}中，常见误区是把可运行、流畅或可复现等同于科学正确。${topic.titleCn}只能证明流程某一性质；问题对齐、数据含义、模型假设和结论责任仍需研究者逐项核对。`;
  return `在${module.titleCn}中，常见误区是把“${topic.titleCn}”当成可以脱离研究问题使用的固定标签。实际判断必须同时说明对象、时间、单位、比较、数据生成过程和不确定性。`;
}

function boundaryFor(module: GuideModuleSpec, topic: GuideTopicSeed): string {
  const text = `${topic.titleCn} ${topic.titleEn}`;
  if (/caus|mechanism|communication|trajectory|subtype/i.test(text)) return `适用边界：当前材料最多支持与测量层和设计相符的关联或结构描述；没有时间、干预或区分性验证时，不升级为因果机制。`;
  if (/prediction|AUC|calibration|validation/i.test(text)) return `适用边界：性能只对给定目标、时间、数据处理和验证场景负责；内部表现不能自动推广到新机构、新时间或临床决策。`;
  if (/cell|donor|replicate|unit|clustered/i.test(text)) return `适用边界：结论必须回到贡献独立信息的层级；下层观测增加测量分辨率，但不能改写目标总体或独立样本数。`;
  return `适用边界：这一概念帮助审查${module.titleCn}中的一个环节，不单独证明研究正确。结论仍受采样、测量、模型、验证和未解决替代解释限制。`;
}

const transitions = [
  "直觉上，可把它看成给研究推理设置一个检查点",
  "一个实用心智模型是先冻结问题，再检查它改变了推断链的哪一环",
  "不要先背术语；先观察它在数据生成图中连接了哪些对象",
  "可以把它想成一份输入—转换—输出契约",
];

function buildBody(module: GuideModuleSpec, topic: GuideTopicSeed, topicIndex: number): string[] {
  const focus = topic.focusCn ?? `${topic.titleCn}要求把术语还原到具体研究问题、数据结构和可观察证据中。`;
  const previous = module.topics[(topicIndex - 1 + module.topics.length) % module.topics.length].titleCn;
  const next = module.topics[(topicIndex + 1) % module.topics.length].titleCn;
  return [
    `为什么重要：${focus}如果这一环没有写清，后续更复杂的分析往往只是把模糊问题变成精确数字；审稿人也无法判断估计、图或结论究竟对什么负责。`,
    `${transitions[topicIndex % transitions.length]}。${module.mentalModelCn}在这个框架里，“${topic.titleCn}”不是背诵项，而是决定下一项证据应如何收集、比较或解释的操作性约束。`,
    `精确定义与机制：${focus}使用时至少要声明目标对象、时间窗、独立单位、变量或测量尺度，以及它进入推断链的位置。若这些元素改变，即使沿用同一个术语，实际 estimand、误差结构和可推广范围也可能改变。`,
    `生物医学例子：${module.biomedicalFrameCn}现在把“${topic.titleCn}”放进这条链：先写下当前观察，再标出它能区分哪些解释、不能区分哪些解释，并说明需要何种对照、重采样、新队列或正交测量才能让主张升级。`,
    misconceptionFor(module, topic),
    boundaryFor(module, topic),
    `关联概念：先回看“${previous}”，确认输入条件和语言边界；再连接“${next}”，检查这一判断如何改变后续分析或验证。来源只用于支持教学主张的相应范围；标识符和元数据已核对并不等于本段 AI 生成表述完成了 claim-level 审批。`,
  ];
}

export const selfRescueGuideSections: ResearchGuideSectionV1[] = selfRescueGuideModules.flatMap((module) => module.topics.map((topic, topicIndex) => ({
  schemaVersion: 1,
  id: `guide-v1-m${String(module.order).padStart(2, "0")}-t${String(topicIndex + 1).padStart(2, "0")}`,
  revision: 1,
  contentType: "guide" as const,
  chapterId: module.id,
  anchor: `m${String(module.order).padStart(2, "0")}-t${String(topicIndex + 1).padStart(2, "0")}`,
  titleCn: topic.titleCn,
  titleEn: topic.titleEn,
  classification: classificationFor(topic),
  summaryCn: topic.focusCn ?? `${topic.titleCn}需要在明确问题、设计、测量与主张边界下使用。`,
  bodyCn: buildBody(module, topic, topicIndex),
  glossaryTerms: [{ zh: topic.titleCn, en: topic.titleEn, definitionCn: topic.focusCn ?? `在${module.titleCn}中用于约束问题、证据或解释的概念。` }],
  advancedNotes: topicIndex % 3 === 0 ? [`进阶审查：尝试写出一个在“${topic.titleCn}”判断错误时仍会得到漂亮结果、但科学结论会改变的反例。`] : undefined,
  links: [],
  contentOrigin: "ai_generated" as const,
  verificationStatus: "pending" as const,
  lifecycle: "pending_review" as const,
  evidenceSourceIds: sourceIdsFor(module, topic),
})));

export const selfRescueGuideHashes = Object.fromEntries(selfRescueGuideSections.map((section) => [section.id, sha256(canonicalJson(section))]));

export const selfRescueModuleLabels = Object.fromEntries(selfRescueGuideModules.map((module) => [module.id, `${module.order}. ${module.titleCn}`]));
