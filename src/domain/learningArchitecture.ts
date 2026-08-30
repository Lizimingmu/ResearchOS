import type { LearningEventV1, LearnerUnitStateV1 } from "./learningKernel";
import type { VerificationStatus } from "./types";
import { canonicalJson, sha256 } from "../services/contentStudio";

export type LearningContentType = "guide" | "concept_lesson" | "method_lesson" | "case_lab" | "studio_task";
export type CapabilityId = "scientific_question" | "study_design" | "statistical_reasoning" | "omics_reasoning" | "literature_reading" | "result_interpretation" | "next_step_design" | "ai_oversight";
export type ContentClassification = "reference_only" | "threshold_concept" | "method" | "judgment_skill" | "integrated_skill";

export interface LearningContentMeta {
  schemaVersion: 1;
  id: string;
  revision: number;
  titleCn: string;
  titleEn: string;
  contentOrigin: "verified_seed" | "verified_external" | "user" | "ai_generated";
  verificationStatus: VerificationStatus;
  lifecycle: "draft" | "pending_review" | "active" | "archived";
  evidenceSourceIds: string[];
}

export interface ResearchGuideSectionV1 extends LearningContentMeta {
  contentType: "guide";
  chapterId: string;
  anchor: string;
  classification: ContentClassification;
  summaryCn: string;
  bodyCn: string[];
  glossaryTerms: Array<{ zh: string; en: string; definitionCn: string }>;
  advancedNotes?: string[];
  links: Array<{ type: Exclude<LearningContentType, "guide">; targetId: string; labelCn: string }>;
}

export interface ConceptLessonV1 extends LearningContentMeta {
  contentType: "concept_lesson";
  conceptId: string;
  capabilityIds: CapabilityId[];
  whyItMattersCn: string;
  intuitionCn: string;
  preciseExplanationCn: string;
  workedExampleCn: string;
  explainPromptCn: string;
  explanationChecklistCn: string[];
  interaction?: "hierarchy_explorer" | "dag_placeholder";
  unitId: string;
  applyPromptCn: string;
  remediationExplanationCn: string;
  remediationPromptCn: string;
  applyAssetId: string;
  remediationAssetId: string;
  reviewAssetId: string;
}

export interface MethodLessonV1 extends LearningContentMeta {
  contentType: "method_lesson";
  methodId: string;
  capabilityIds: CapabilityId[];
  scientificQuestionCn: string;
  inputsCn: string[];
  coreLogicCn: string;
  outputsCn: string[];
  assumptionsCn: string[];
  appropriateWhenCn: string[];
  inappropriateWhenCn: string[];
  misusePatternsCn: string[];
  reviewerChecksCn: string[];
  paperAppearanceCn: string;
  applyPromptCn: string;
  unitId: string;
  applyAssetId: string;
  reviewAssetId: string;
  interactionContract: {
    kind: "methods_audit";
    checklistOptionIds: string[];
    reasoningRequired: true;
    maximumConclusionRequired: true;
  };
  guideSectionIds: string[];
}

export type LearningContentPhase = "learn" | "explain" | "apply" | "remediation" | "review";

export interface LearningContentProgressV1 {
  schemaVersion: 1;
  contentId: string;
  contentType: LearningContentType;
  phase: LearningContentPhase;
  explainCompleted: boolean;
  applyStarted: boolean;
  remediationNeeded: boolean;
  remediationAttempt: number;
  updatedAt: string;
}

export type LearningThread = "foundation" | "project_overlay" | "reference";

export interface LearningContentRegistryEntryV1 {
  schemaVersion: 1;
  id: string;
  contentType: LearningContentType;
  titleCn: string;
  capabilityIds: CapabilityId[];
  prerequisiteIds: string[];
  thread: LearningThread;
  projectRelevanceTerms: string[];
  estimatedMinutes: number;
  rationaleCn: string;
  unitId?: string;
  applyAssetId?: string;
  remediationAssetId?: string;
  reviewAssetId?: string;
  contentOrigin: LearningContentMeta["contentOrigin"];
  verificationStatus: VerificationStatus;
  lifecycle: LearningContentMeta["lifecycle"];
  evidenceSourceIds: string[];
}

export type ResearchCaseEvidenceBlockV1 =
  | { type: "text" | "result_snippet" | "methods_snippet" | "figure_placeholder"; titleCn: string; bodyCn: string }
  | { type: "table"; titleCn: string; columns: string[]; rows: string[][] }
  | { type: "numeric_summary"; titleCn: string; values: Array<{ labelCn: string; value: string }> };

export interface ResearchCaseStageV1 {
  id: string;
  titleCn: string;
  evidenceBlocks: ResearchCaseEvidenceBlockV1[];
  structuredPrompt?: string;
  reasoningPrompt: string;
  claimBoundaryPrompt?: string;
  updatePrompt?: string;
  revealExplanation?: string;
}

export interface ResearchCaseV1 extends LearningContentMeta {
  contentType: "case_lab";
  contentHash: string;
  domain: string;
  difficulty: "foundation" | "intermediate" | "advanced";
  learningObjectives: string[];
  prerequisiteConceptIds: string[];
  initialContext: string;
  stages: ResearchCaseStageV1[];
  finalTask: string[];
}

export interface CaseReasoningEntryV1 {
  stageId: string;
  lockedAt: string;
  reasoning: string;
  structuredDecision?: string;
  claimBoundary?: string;
  expertCalibration?: string;
  update?: string;
}

export interface ResearchCaseSessionV1 {
  schemaVersion: 1;
  id: string;
  caseId: string;
  caseRevision: number;
  caseHash: string;
  currentStageIndex: number;
  pendingCalibrationStageId?: string;
  reasoningHistory: CaseReasoningEntryV1[];
  finalResponse?: Record<string, string>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferArtifactV1 {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  sourceType: "project" | "paper" | "ai_audit" | "case";
  sourceId?: string;
  conceptIds: string[];
  capabilityIds: CapabilityId[];
  question: string;
  userReasoning: string;
  claimBoundary?: string;
  nextStep?: string;
  linkedLearningEventIds: string[];
}

export interface ProjectStudioRecordV1 {
  schemaVersion: 1;
  id: string;
  projectId: string;
  createdAt: string;
  currentPhenomenon: string;
  currentEvidence: string;
  mainUncertainty: string;
  researchQuestion: string;
  competingExplanations: string;
  evidenceGap: string;
  nextMinimalAnalysis: string;
  expectedOutcomes: string;
  failureMode: string;
  validation: string;
  maximumClaim: string;
}

export interface CapabilityEvidenceProjectionV1 {
  capabilityId: CapabilityId;
  exposure: "not_studied" | "learning" | "core_completed";
  standardizedEvidence: "none" | "independent_once" | "retained" | "multiple_context_retained";
  evidenceEventIds: string[];
  transferArtifactCount: number;
  recentTransferContext?: TransferArtifactV1["sourceType"];
}

export const capabilityLabels: Record<CapabilityId, string> = {
  scientific_question: "Scientific Question",
  study_design: "Study Design",
  statistical_reasoning: "Statistical Reasoning",
  omics_reasoning: "Omics Reasoning",
  literature_reading: "Literature Reading",
  result_interpretation: "Result Interpretation",
  next_step_design: "Next-step Design",
  ai_oversight: "AI Oversight",
};

export const unitCapabilityMap: Record<string, CapabilityId[]> = {
  "lu-statistical-unit-v1": ["study_design", "statistical_reasoning"],
  "lu-biological-technical-replicate-v1": ["study_design", "statistical_reasoning"],
  "lu-pseudoreplication-v1": ["study_design", "statistical_reasoning", "result_interpretation"],
  "concept-confounding-v1": ["study_design", "statistical_reasoning", "result_interpretation"],
  "method-cox-v1": ["statistical_reasoning", "result_interpretation"],
};

const competenceRank = { unassessed: 0, guided_only: 1, independent_once: 2, retained: 3, transferred: 4 } as const;

export function validateLearningContentRegistry(input: {
  registry: LearningContentRegistryEntryV1[];
  assets: Array<{ id: string }>;
  guideSections: ResearchGuideSectionV1[];
  cases: ResearchCaseV1[];
  conceptLessons?: ConceptLessonV1[];
  knownUnitIds: ReadonlySet<string>;
  unitCapabilityMapping: Record<string, CapabilityId[]>;
}): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const assetIds = new Set(input.assets.map((asset) => asset.id));
  const capabilities = new Set(Object.keys(capabilityLabels));
  const publicPayload = JSON.stringify(input.registry);
  for (const entry of input.registry) {
    if (ids.has(entry.id)) errors.push(`重复 learning content ID：${entry.id}`);
    ids.add(entry.id);
    for (const capabilityId of entry.capabilityIds) if (!capabilities.has(capabilityId)) errors.push(`${entry.id} 引用未知 capability：${capabilityId}`);
    if (!entry.evidenceSourceIds.length) errors.push(`${entry.id} 缺少 provenance`);
    if (entry.lifecycle === "active" && entry.verificationStatus !== "verified") errors.push(`${entry.id} active 但未 verified`);
    if (["concept_lesson", "method_lesson"].includes(entry.contentType)) {
      if (!entry.unitId || !input.knownUnitIds.has(entry.unitId)) errors.push(`${entry.id} 引用未知 unit：${entry.unitId ?? "missing"}`);
      if (!entry.applyAssetId || !assetIds.has(entry.applyAssetId)) errors.push(`${entry.id} 缺少 Apply asset`);
      if (!entry.reviewAssetId || !assetIds.has(entry.reviewAssetId)) errors.push(`${entry.id} 缺少 review asset`);
      if (entry.applyAssetId && entry.applyAssetId === entry.reviewAssetId) errors.push(`${entry.id} Apply 与 review 不得相同`);
      if (entry.remediationAssetId && entry.remediationAssetId === entry.applyAssetId) errors.push(`${entry.id} remediation 与 Apply 不得相同`);
      if (entry.unitId && !(input.unitCapabilityMapping[entry.unitId]?.length)) errors.push(`${entry.id} 缺少 unit capability mapping`);
    }
  }
  for (const entry of input.registry) for (const prerequisiteId of entry.prerequisiteIds) if (!ids.has(prerequisiteId)) errors.push(`${entry.id} 引用未知 prerequisite：${prerequisiteId}`);
  for (const section of input.guideSections) for (const link of section.links) if (!ids.has(link.targetId)) errors.push(`${section.id} 引用未知 Guide target：${link.targetId}`);
  const knownConceptIds = new Set((input.conceptLessons ?? []).map((lesson) => lesson.conceptId));
  for (const researchCase of input.cases) {
    if (!ids.has(researchCase.id)) errors.push(`Case 未登记：${researchCase.id}`);
    if (input.conceptLessons) for (const conceptId of researchCase.prerequisiteConceptIds) if (!knownConceptIds.has(conceptId)) errors.push(`${researchCase.id} 引用未知 Case concept link：${conceptId}`);
  }
  for (const mappedUnitId of Object.keys(input.unitCapabilityMapping)) if (!input.knownUnitIds.has(mappedUnitId)) errors.push(`capability mapping 引用未知 unit：${mappedUnitId}`);
  if (/(?:[A-Z]:\\Users\\|D:\\Agents\\|\.codex|patient[_ -]?id|medical record number|private chat)/i.test(publicPayload)) errors.push("公开 registry 包含禁止的私有标识或路径");
  return [...new Set(errors)];
}

export function researchCaseHash(value: Omit<ResearchCaseV1, "contentHash">): string {
  return sha256(canonicalJson(value));
}

export function projectCapabilityEvidence(input: {
  states: LearnerUnitStateV1[];
  events: LearningEventV1[];
  transferArtifacts: TransferArtifactV1[];
  contentProgress?: LearningContentProgressV1[];
  contentRegistry?: LearningContentRegistryEntryV1[];
}): CapabilityEvidenceProjectionV1[] {
  return (Object.keys(capabilityLabels) as CapabilityId[]).map((capabilityId) => {
    const relatedStates = input.states.filter((state) => unitCapabilityMap[state.unitId]?.includes(capabilityId));
    const eventIds = new Set(relatedStates.flatMap((state) => state.competence.evidenceEventIds));
    const events = input.events.filter((event) => eventIds.has(event.id) && event.competenceEligible);
    const retainedContexts = new Set(events.filter((event) => ["retrieval_attempt", "variant_attempt"].includes(event.type)).map((event) => event.unitId));
    const relatedContentIds = new Set((input.contentRegistry ?? []).filter((entry) => entry.capabilityIds.includes(capabilityId)).map((entry) => entry.id));
    const contentProgress = (input.contentProgress ?? []).filter((progress) => relatedContentIds.has(progress.contentId));
    const exposure = relatedStates.some((state) => state.instruction.exposure === "complete") || contentProgress.some((progress) => progress.explainCompleted) ? "core_completed"
      : relatedStates.some((state) => state.instruction.exposure === "partial") || contentProgress.length > 0 ? "learning" : "not_studied";
    const standardizedEvidence = retainedContexts.size > 1 ? "multiple_context_retained"
      : relatedStates.some((state) => ["retained", "transferred"].includes(state.competence.level)) ? "retained"
        : relatedStates.some((state) => state.competence.level === "independent_once") ? "independent_once" : "none";
    const artifacts = input.transferArtifacts.filter((artifact) => artifact.capabilityIds.includes(capabilityId));
    return {
      capabilityId,
      exposure,
      standardizedEvidence,
      evidenceEventIds: [...new Set(events.map((event) => event.id))],
      transferArtifactCount: artifacts.length,
      recentTransferContext: artifacts.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.sourceType,
    };
  });
}

export function hasStandardizedEvidence(states: LearnerUnitStateV1[], unitId: string, minimum: "independent_once" | "retained" = "independent_once"): boolean {
  const state = states.find((item) => item.unitId === unitId);
  return Boolean(state && competenceRank[state.competence.level] >= competenceRank[minimum]);
}
