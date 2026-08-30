import type { CapabilityId } from "../../domain/learningArchitecture";
import type { StagedAssessmentAssetV1, StagedConceptLessonV1 } from "../../domain/curriculum";
import { selfRescueGuideSections } from "../self-rescue-guide";

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
  "selection-bias": ["staged-concept-association-causation"],
  "internal-external-validity": ["staged-concept-confounding", "staged-concept-selection-bias"],
  "standard-error": ["staged-concept-statistical-unit"],
  "confidence-interval": ["staged-concept-standard-error", "staged-concept-effect-size"],
  "p-value": ["staged-concept-standard-error"],
  "multiple-testing-fdr": ["staged-concept-p-value"],
  power: ["staged-concept-effect-size", "staged-concept-standard-error"],
  interaction: ["staged-concept-confounding"],
  overfitting: ["staged-concept-validation"],
  "data-leakage": ["staged-concept-validation"],
  validation: ["staged-concept-population-sample"],
  censoring: ["staged-concept-statistical-unit"],
  "hazard-ratio": ["staged-concept-censoring"],
  "time-origin": ["staged-concept-censoring"],
  "composition-state": ["staged-concept-bulk-mixture"],
  "cluster-stability": ["staged-concept-validation"],
  pseudobulk: ["staged-concept-statistical-unit", "staged-concept-pseudoreplication"],
  "cross-modal-validation": ["staged-concept-validation", "staged-concept-rna-protein"],
  "claim-boundary": ["staged-concept-evidence-claim"],
  robustness: ["staged-concept-claim-boundary"],
  triangulation: ["staged-concept-alternative-explanation"],
  "minimal-sufficient-analysis": ["staged-concept-alternative-explanation"],
  "evidence-redundancy": ["staged-concept-triangulation"],
  "negative-result": ["staged-concept-confidence-interval", "staged-concept-power"],
  "ai-cognitive-outsourcing": ["staged-concept-claim-boundary"],
};

function assessment(id: string, title: string, summary: string, role: StagedAssessmentAssetV1["role"], surface: "oncology" | "multicenter" | "single-cell"): StagedAssessmentAssetV1 {
  const surfaceText = surface === "oncology" ? "一个肿瘤队列得到与结局相关的候选信号，团队正在决定如何表述和验证。"
    : surface === "multicenter" ? "一个多中心观察研究在中心间看到不一致结果，分析计划仍可修改。"
      : "一项单细胞研究包含多个供体和大量细胞，研究者准备把图形模式写入论文。";
  return {
    id: `${id}-${role}-v1`, role,
    scenarioCn: `${surfaceText}本题聚焦「${title}」；表面场景与另外两次评估不同。`,
    promptCn: `选择最能落实「${title}」且不越过证据边界的两项判断，并用简短推理说明。`,
    options: [
      { id: `${id}-operational`, labelCn: `先按本研究的问题、时间与独立单位操作化「${title}」：${summary}` },
      { id: `${id}-boundary`, labelCn: `把结论限制在当前设计和测量直接支持的范围，并写出仍未区分的解释` },
      { id: `${id}-proxy`, labelCn: `用样本行数、视觉分离度或模型复杂度作为「${title}」已经充分处理的主要证据` },
      { id: `${id}-upgrade`, labelCn: `把当前队列内模式提升为稳定机制或普遍结论，再在后续工作中补验证` },
    ],
    expectedOptionIds: [`${id}-operational`, `${id}-boundary`],
    reasoningCriteriaCn: [`准确说明「${title}」在当前问题中的对象与层级`, "指出至少一个未解决偏倚或替代解释", "结论动词不强于设计"],
    feedbackCn: [`「${title}」必须被转成可检查的研究操作，而不是当作标签。`, "数据量、复杂模型和漂亮图形都不能替代设计与验证。", "先锁定回答，再依据反馈更新；本资产无提示。"],
    maximumConclusionCn: `当前最多支持对「${title}」作有边界的队列内判断；在预定义验证或区分性证据出现前，不升级为机制、因果或普适性主张。`,
    hints: [], confidenceRequired: true, responseLocked: true,
  };
}

export const stagedConceptLessons: StagedConceptLessonV1[] = conceptRows.map((row, index) => {
  const [slug, title] = row.split("|");
  const section = sectionFor(title);
  if (!section) throw new Error(`Curriculum concept missing Guide section: ${title}`);
  const id = `staged-concept-${slug}`;
  const summary = section.summaryCn;
  return {
    schemaVersion: 1, id, titleCn: section.titleCn, titleEn: section.titleEn, guideSectionId: section.id,
    capabilityIds: capabilitiesFor(section.chapterId), prerequisiteIds: prerequisiteMap[slug] ?? [],
    whyItMattersCn: section.bodyCn[0], intuitionCn: section.bodyCn[1], preciseExplanationCn: section.bodyCn[2], workedExampleCn: section.bodyCn[3],
    explainPromptCn: `不用术语复述：请用两三句话解释「${section.titleCn}」会怎样改变一个生物医学研究的设计、分析或结论边界。`,
    explanationChecklistCn: [`说清研究对象和时间`, `指出「${section.titleCn}」作用的推断层级`, "给出一个会改变判断的反例", "没有把自由文本当成能力分数"],
    primaryApply: assessment(id, section.titleCn, summary, "apply", "oncology"),
    remediation: assessment(id, section.titleCn, summary, "remediation", "multicenter"),
    delayedReview: assessment(id, section.titleCn, summary, "review", "single-cell"),
    sourceIds: section.evidenceSourceIds, estimatedMinutes: 8 + (index % 3),
    contentOrigin: "ai_generated", verificationStatus: "pending", lifecycle: "pending_review",
  };
});
