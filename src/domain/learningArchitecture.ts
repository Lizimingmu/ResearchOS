import type { LearningEventV1, LearnerUnitStateV1 } from "./learningKernel";
import type { VerificationStatus } from "./types";
import { canonicalJson, sha256 } from "../services/contentStudio";

export type LearningContentType = "guide" | "concept_lesson" | "method_lesson" | "case_lab" | "studio_task";
export type CapabilityId = "scientific_question" | "study_design" | "statistical_reasoning" | "omics_reasoning" | "literature_reading" | "result_interpretation" | "next_step_design" | "ai_oversight";
export type ContentClassification = "reference_only" | "threshold_concept" | "method" | "judgment_skill" | "integrated_skill";

interface LearningContentMeta {
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
  applyAssetId: string;
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
  guideSectionIds: string[];
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
  update?: string;
}

export interface ResearchCaseSessionV1 {
  schemaVersion: 1;
  id: string;
  caseId: string;
  caseRevision: number;
  caseHash: string;
  currentStageIndex: number;
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
  "lu-biological-technical-replicates-v1": ["study_design", "statistical_reasoning"],
  "lu-pseudoreplication-v1": ["study_design", "statistical_reasoning", "result_interpretation"],
  "concept-confounding-v1": ["study_design", "statistical_reasoning", "result_interpretation"],
  "method-cox-v1": ["statistical_reasoning", "result_interpretation"],
};

export function researchCaseHash(value: Omit<ResearchCaseV1, "contentHash">): string {
  return sha256(canonicalJson(value));
}

export function projectCapabilityEvidence(input: {
  states: LearnerUnitStateV1[];
  events: LearningEventV1[];
  transferArtifacts: TransferArtifactV1[];
}): CapabilityEvidenceProjectionV1[] {
  return (Object.keys(capabilityLabels) as CapabilityId[]).map((capabilityId) => {
    const relatedStates = input.states.filter((state) => unitCapabilityMap[state.unitId]?.includes(capabilityId));
    const eventIds = new Set(relatedStates.flatMap((state) => state.competence.evidenceEventIds));
    const events = input.events.filter((event) => eventIds.has(event.id) && event.competenceEligible);
    const retainedContexts = new Set(events.filter((event) => ["retrieval_attempt", "variant_attempt"].includes(event.type)).map((event) => event.unitId));
    const exposure = relatedStates.some((state) => state.instruction.exposure === "complete") ? "core_completed"
      : relatedStates.some((state) => state.instruction.exposure === "partial") ? "learning" : "not_studied";
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
