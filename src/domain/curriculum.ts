import type { CapabilityId, ContentClassification } from "./learningArchitecture";

export type CurriculumContentType = "guide" | "concept_lesson" | "method_lesson" | "case_lab" | "studio";
export type ScientificRisk = "LOW" | "MEDIUM" | "HIGH";

export interface CurriculumManifestItemV1 {
  schemaVersion: 1;
  id: string;
  guideSectionId: string;
  moduleId: string;
  titleCn: string;
  titleEn: string;
  classification: ContentClassification;
  capabilityIds: CapabilityId[];
  prerequisiteIds: string[];
  recommendedContentTypes: CurriculumContentType[];
  estimatedMinutes: number;
  threadEligibility: Array<"foundation" | "project_overlay">;
  projectRelevanceTerms: string[];
  scientificRisk: ScientificRisk;
  sourceRequirements: string[];
  implementationStatus: "generated" | "active_prototype";
  contentOrigin: "ai_generated" | "verified_seed";
  verificationStatus: "pending" | "verified";
  lifecycle: "pending_review" | "active";
}

export interface StagedAssessmentAssetV1 {
  id: string;
  role: "apply" | "remediation" | "review";
  scenarioCn: string;
  promptCn: string;
  options: Array<{ id: string; labelCn: string }>;
  expectedOptionIds: string[];
  stimulus: {
    format: "case_table" | "evidence_matrix" | "decision_timeline";
    columnsCn: string[];
    rowsCn: string[][];
    noteCn: string;
  };
  reasoningCriteriaCn: string[];
  feedbackCn: string[];
  optionFeedbackCn: Record<string, string>;
  scoringRule: {
    minimumEvidenceUnits: number;
    criticalErrorOptionIds: string[];
    evidenceExpectations: Array<{
      optionId: string;
      allowedRowIds: string[];
      requiredFactFragmentsCn: string[];
      reasoningMarkersCn: string[];
    }>;
    partialCreditCn: string;
    stopRuleCn: string;
    changeMindCriteriaCn: string[];
    changeMindActionMarkersCn: string[];
  };
  maximumConclusionCn: string;
  materialization: {
    contentVersion: "m019.1";
    diseaseAreaCn: string;
    studyDesignCn: string;
    dataModalityCn: string;
    independentFactsCn: string[];
    representationPurposeCn: string;
    authorRationaleCn: string[];
    blindReviewStatus: "pending" | "agree" | "ambiguous" | "disagree";
  };
  hints: string[];
  confidenceRequired: true;
  responseLocked: true;
}

export interface StagedConceptLessonV1 {
  schemaVersion: 1;
  id: string;
  titleCn: string;
  titleEn: string;
  guideSectionId: string;
  capabilityIds: CapabilityId[];
  prerequisiteIds: string[];
  whyItMattersCn: string;
  intuitionCn: string;
  preciseExplanationCn: string;
  workedExampleCn: string;
  explainPromptCn: string;
  explanationChecklistCn: string[];
  primaryApply: StagedAssessmentAssetV1;
  remediation: StagedAssessmentAssetV1;
  delayedReview: StagedAssessmentAssetV1;
  sourceIds: string[];
  estimatedMinutes: number;
  contentOrigin: "ai_generated";
  verificationStatus: "pending";
  lifecycle: "pending_review";
}

export interface StagedMethodLessonV1 {
  schemaVersion: 1;
  id: string;
  titleCn: string;
  titleEn: string;
  guideSectionIds: string[];
  capabilityIds: CapabilityId[];
  prerequisiteIds: string[];
  intuitionCn: string;
  workedExampleCn: string;
  walkthroughStepsCn: string[];
  paperReadingExample: {
    snippetCn: string;
    readerChecksCn: string[];
  };
  methodComparisonCn: Array<{
    alternativeCn: string;
    chooseThisWhenCn: string;
    chooseAlternativeWhenCn: string;
  }>;
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
  primaryApply: StagedAssessmentAssetV1;
  remediation: StagedAssessmentAssetV1;
  delayedReview: StagedAssessmentAssetV1;
  sourceIds: string[];
  estimatedMinutes: number;
  contentOrigin: "ai_generated";
  verificationStatus: "pending";
  lifecycle: "pending_review";
}

export interface StagedCaseLabV1 {
  schemaVersion: 1;
  id: string;
  titleCn: string;
  titleEn: string;
  theme: string;
  capabilityIds: CapabilityId[];
  prerequisiteIds: string[];
  initialContextCn: string;
  stages: Array<{
    id: string;
    titleCn: string;
    evidenceCn: string;
    reasoningPromptCn: string;
    calibrationCn: string;
    updatePromptCn: string;
    informationUpdate: {
      strengthenedCn: string[];
      weakenedCn: string[];
      unresolvedCn: string[];
      forcingEvidenceCn: string;
    };
  }>;
  finalTaskCn: string[];
  sourceIds: string[];
  contentOrigin: "ai_generated";
  verificationStatus: "pending";
  lifecycle: "pending_review";
}

export interface StudioTemplateV1 {
  schemaVersion: 1;
  id: string;
  studioType: "paper" | "project" | "ai_audit";
  titleCn: string;
  level?: "beginner" | "intermediate" | "advanced";
  purposeCn: string;
  fields: Array<{ id: string; labelCn: string; promptCn: string; required: boolean }>;
  capabilityIds: CapabilityId[];
  producesTransferArtifact: true;
  createsCompetence: false;
  contentOrigin: "ai_generated";
  verificationStatus: "pending";
  lifecycle: "pending_review";
}

export interface CurriculumClaimV1 {
  id: string;
  contentId: string;
  claimCn: string;
  sourceIds: string[];
  evidenceBoundaryCn: string;
  supportMode: "curriculum_synthesis" | "source_direct";
  supportStatus: "claim_level_review_pending" | "directly_supported" | "reasonable_synthesis" | "weakly_supported" | "unsupported" | "source_mismatch";
  identifierVerified: boolean;
  metadataVerified: boolean;
}
