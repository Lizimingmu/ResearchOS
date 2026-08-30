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

function sourceIdsFor(module: GuideModuleSpec, topic: GuideTopicSeed): string[] {
  if (topic.sourceIds?.length) return topic.sourceIds;
  const text = `${topic.titleCn} ${topic.titleEn}`;
  const specific: Array<[RegExp, string[]]> = [
    [/p.?value|statistical significance/i, ["src-asa-pvalue"]],
    [/multiple testing|FDR/i, ["src-multiple-testing"]],
    [/missing/i, ["src-missing"]],
    [/Cox|Hazard|PH assumption|time-to-event|censor|Kaplan|log-rank|immortal|landmark/i, ["src-cox"]],
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
    [/unit|replicate|pseudorep/i, ["src-pseudorep"]],
    [/confound|caus|collider|mediat/i, ["src-dag"]],
    [/PCA/i, ["src-pca"]],
    [/UMAP/i, ["src-umap"]],
    [/NMF/i, ["src-nmf"]],
    [/GSEA/i, ["src-gsea", "src-camera"]],
    [/over.?representation|enrichment analysis/i, ["src-ora"]],
    [/GSVA|ssGSEA/i, ["src-gsva"]],
    [/ssGSEA/i, ["src-ssgsea"]],
    [/restricted cubic spline/i, ["src-rcs"]],
    [/WGCNA/i, ["src-wgcna"]],
    [/batch|integration/i, ["src-batch", "src-scib"]],
    [/pseudobulk|donor-level|single-cell differential/i, ["src-pseudobulk"]],
    [/differential abundance/i, ["src-milo"]],
    [/trajectory|pseudotime/i, ["src-trajectory"]],
    [/CellChat|cell.?cell communication/i, ["src-cellchat"]],
    [/spatial/i, ["src-spatial", "src-spatial-original"]],
    [/multi-omics|cross-modal|concordance|discordance/i, ["src-mofa-plus", "src-diablo"]],
    [/Cell QC/i, ["src-scrna-best", "src-doubletfinder", "src-soupx"]],
    [/AI|cognitive outsourcing|hallucination|prompt/i, ["src-nist-genai-profile", "src-nist-ai-rmf"]],
    [/code|reproduc|provenance|Git|environment|analysis output/i, ["src-fair"]],
    [/paper|literature|review article|forest plot/i, ["src-prisma-2020"]],
  ];
  const matched = specific.flatMap(([pattern, ids]) => pattern.test(text) ? ids : []);
  return [...new Set([...matched, ...module.defaultSourceIds])].slice(0, 4);
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
