import type { Confidence, ContentOrigin, DifficultyLevel, VerificationStatus } from "./types";

export const PROBLEM_CARD_SCHEMA = 1;
export const SOURCE_REGISTRY_SCHEMA = 1;
export const PACK_SCHEMA_VERSION = 1;

export type CanonicalProblemType = "diagnostic" | "judgment" | "audit";
export type ProblemType = CanonicalProblemType | "unclassified";

export type KnowledgeStatus = "current" | "superseded" | "deprecated" | "emerging";
export type RegistrySourceType =
  | "guideline"
  | "consensus"
  | "standard"
  | "protocol"
  | "original_method"
  | "benchmark"
  | "methods_review"
  | "technical_resource"
  | "institutional_sop"
  | "educational"
  | "discovery";
export type AuthorityTier = "S" | "A" | "B" | "C" | "D" | "X";
export type RegistryVerificationStatus = "pending" | "metadata_verified" | "claim_verified" | "rejected";
export type ClaimVerificationStatus = "pending" | "claim_verified" | "rejected";
export type SupportType = "direct" | "qualified" | "contextual" | "contradicts" | "insufficient";
export type FailureLayer = "sample" | "experiment" | "quantification" | "statistics" | "interpretation";

export interface EvidenceSourceReg {
  id: string;
  schemaVersion: number;
  sourceType: RegistrySourceType;
  organization?: string;
  journal?: string;
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  pmid?: string;
  url?: string;
  authorityTier: AuthorityTier;
  domain: string[];
  version?: string;
  knowledgeStatus: KnowledgeStatus;
  supersedes: string[];
  supersededBy: string[];
  verificationStatus: RegistryVerificationStatus;
  verificationScope: string[];
  verifiedAt?: string;
  verifiedBy?: string;
  contentHash?: string;
  retrievedAt?: string;
  licenseNote?: string;
  provenanceNote: string;
  contentOrigin: ContentOrigin;
}

export interface EvidenceClaim {
  id: string;
  claim: string;
  scope: string;
  qualification: string;
  sourceId: string;
  supportType: SupportType;
  supportingLocation: string;
  supportingExcerptHash?: string;
  reviewerNote: string;
  domain: string[];
  knowledgeStatus: KnowledgeStatus;
  verificationStatus: ClaimVerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  contentOrigin: ContentOrigin;
}

export interface ProblemCard {
  id: string;
  schemaVersion: number;
  domain: string;
  subdomain: string;
  problemType: ProblemType;
  titleCn: string;
  titleEn: string;
  aliases: string[];
  keywords: string[];
  difficulty: DifficultyLevel;
  importance: number;
  frequency: number;
  observation: string;
  context: string;
  whyItMatters: string;
  candidateCauseIds: string[];
  diagnosticPathId: string;
  redFlags: string[];
  commonWrongActions: string[];
  recommendedReasoning: string[];
  statisticalImplication?: string;
  experimentalImplication?: string;
  bioinformaticsImplication?: string;
  claimBoundary: string;
  reviewerImplication: string;
  transferCaseIds: string[];
  misconceptionTags: string[];
  relatedMethodIds: string[];
  relatedProtocolIds: string[];
  relatedPatternIds: string[];
  evidenceClaimIds: string[];
  contentOrigin: ContentOrigin;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  knowledgeStatus: KnowledgeStatus;
  supersedes: string[];
  supersededBy: string[];
}

export interface DiagnosticCause {
  id: string;
  problemId: string;
  labelCn: string;
  labelEn: string;
  mechanism: string;
  initialRank: number;
  layer: FailureLayer;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  uncertaintyNote: string;
  evidenceClaimIds: string[];
}

export interface DiagnosticCheck {
  id: string;
  problemId: string;
  questionCn: string;
  informationSupplied: string;
  discriminatesCauseIds: string[];
  expectedUpdate: string;
  costCategory: "low" | "medium" | "high";
  availability: "routine" | "specialized" | "expert";
  prerequisites: string[];
  evidenceClaimIds: string[];
}

export interface DiagnosticPathNode {
  id: string;
  step: number;
  question: string;
  availableEvidenceIds: string[];
  requiredJudgment: string;
  permittedCheckIds: string[];
  expectedCheckId: string;
  lockedAnswer: string;
  stopCondition: string;
}

export interface DiagnosticPath {
  id: string;
  problemId: string;
  nodes: DiagnosticPathNode[];
  finalRanking: string[];
  finalLayer: FailureLayer;
}

export interface DiagnosticEvidence {
  id: string;
  problemId: string;
  sourceType: "observation" | "experiment" | "quantification" | "statistical" | "interpretation";
  result: string;
  scope: string;
  affectsCauseIds: string[];
  direction: Record<string, "up" | "down" | "neutral">;
  sequenceOrder: number;
  evidenceClaimId: string;
}

export type DiagnosticModeId =
  | "quick"
  | "differential"
  | "sequential"
  | "missing-info"
  | "error-localization"
  | "claim-boundary"
  | "reviewer"
  | "ai-verdict";

export interface ProblemTrainingCase {
  id: string;
  problemId: string;
  mode: DiagnosticModeId;
  prompt: string;
  context: string;
  answerSchema: string;
  rubric: string[];
  expected: Record<string, unknown>;
  misconceptionTags: string[];
  farTransferFamily: string;
  relatedProblemId?: string;
  contentOrigin: ContentOrigin;
  verificationStatus: VerificationStatus;
}

export type SessionStepKind =
  | "reveal"
  | "judgment"
  | "ranking"
  | "missing-info"
  | "layer"
  | "boundary"
  | "reviewer"
  | "ai-verdict"
  | "calibration";

export interface DiagnosticSessionStep {
  id: string;
  kind: SessionStepKind;
  mode: DiagnosticModeId;
  lockedAt: string;
  payload: Record<string, unknown>;
}

export interface DiagnosticSession {
  id: string;
  taskId: string;
  problemId: string;
  mode: DiagnosticModeId;
  startedAt: string;
  updatedAt: string;
  steps: DiagnosticSessionStep[];
  completedAt?: string;
  score?: number;
  responseId?: string;
}

export interface SourcePackImportRecord {
  id: string;
  packId: string;
  title: string;
  contentHash: string;
  importedAt: string;
  result: "noop" | "applied" | "rejected";
  dryRun: { inserts: number; updates: number; conflicts: number; rejectedRows: number; warnings: number };
  note?: string;
}

export interface ProblemSearchLogEntry {
  id: string;
  query: string;
  matched: boolean;
  matchedCount: number;
  createdAt: string;
}

export interface SourcePackVerificationMetadata {
  reviewStatus: "pending" | "verified" | "rejected";
  reviewer: string | null;
  reviewedAt: string | null;
}

export interface SourcePackDocument {
  packSchemaVersion: number;
  packId: string;
  title: string;
  createdAt: string;
  createdBy: string;
  provenance: string;
  sources: EvidenceSourceReg[];
  evidenceClaims: EvidenceClaim[];
  problemCards: ProblemCard[];
  diagnosticCauses: DiagnosticCause[];
  diagnosticChecks: DiagnosticCheck[];
  diagnosticPaths: DiagnosticPath[];
  diagnosticEvidence: DiagnosticEvidence[];
  transferCases: ProblemTrainingCase[];
  verificationMetadata: SourcePackVerificationMetadata;
}

export interface AtlasCollectionState {
  problemAtlasSources: EvidenceSourceReg[];
  problemAtlasClaims: EvidenceClaim[];
  problemCards: ProblemCard[];
  diagnosticCauses: DiagnosticCause[];
  diagnosticChecks: DiagnosticCheck[];
  diagnosticPaths: DiagnosticPath[];
  diagnosticEvidence: DiagnosticEvidence[];
  problemTrainingCases: ProblemTrainingCase[];
  diagnosticSessions: DiagnosticSession[];
  sourcePackImports: SourcePackImportRecord[];
  problemSearchLog: ProblemSearchLogEntry[];
}

export interface GradeResult {
  score: number;
  feedback: string[];
  completed: boolean;
}

export interface SessionJudgmentInput {
  stepId: string;
  kind: SessionStepKind;
  mode: DiagnosticModeId;
  payload: Record<string, unknown>;
}

export interface SessionCalibrationInput {
  score: number;
  confidence: Confidence;
  responseId: string;
}

export type ScientificCompletenessStatus = "scientifically_complete" | "scientific_patch_required";

export interface CompletenessGap {
  entity: "problemCard" | "evidenceClaim" | "evidenceSource";
  rowId: string;
  code: string;
  location: string;
  detail: string;
}

export interface ScientificCompletenessReport {
  status: ScientificCompletenessStatus;
  importEligible: boolean;
  counts: {
    problemCards: { total: number; complete: number; patchRequired: number; unclassified: number };
    evidenceClaims: { total: number; complete: number; patchRequired: number };
    evidenceSources: { total: number; complete: number; patchRequired: number };
  };
  byType: Record<ProblemType, { complete: number; patchRequired: number }>;
  gaps: CompletenessGap[];
}

export interface StagingRowMeta {
  originalId: string;
  stagedMissing: string[];
  droppedFields: Array<{ field: string; reason: string }>;
  fieldMap: Array<{ from: string; to: string }>;
  converterSupplied: string[];
  converterNotes: string[];
}

export type StagingProblemType = ProblemType;

export interface StagingSource {
  id: string;
  schemaVersion?: number;
  sourceType?: RegistrySourceType;
  organization?: string;
  journal?: string;
  title?: string;
  authors?: string[];
  year?: number;
  doi?: string;
  pmid?: string;
  url?: string;
  authorityTier?: AuthorityTier;
  domain?: string[];
  version?: string;
  knowledgeStatus?: KnowledgeStatus;
  supersedes?: string[];
  supersededBy?: string[];
  verificationStatus?: RegistryVerificationStatus;
  verificationScope?: string[];
  verifiedAt?: string;
  verifiedBy?: string;
  contentHash?: string;
  retrievedAt?: string;
  licenseNote?: string;
  provenanceNote?: string;
  contentOrigin?: ContentOrigin;
  staging: StagingRowMeta;
}

export interface StagingClaim {
  id: string;
  claim?: string;
  scope?: string;
  qualification?: string;
  sourceId?: string;
  supportType?: SupportType;
  supportingLocation?: string;
  supportingExcerptHash?: string;
  reviewerNote?: string;
  domain?: string[];
  knowledgeStatus?: KnowledgeStatus;
  verificationStatus?: ClaimVerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  contentOrigin?: ContentOrigin;
  staging: StagingRowMeta;
}

export interface StagingProblemCard {
  id: string;
  schemaVersion?: number;
  domain?: string;
  subdomain?: string;
  problemType: StagingProblemType;
  titleCn?: string;
  titleEn?: string;
  aliases?: string[];
  keywords?: string[];
  difficulty?: DifficultyLevel;
  importance?: number;
  frequency?: number;
  observation?: string;
  context?: string;
  whyItMatters?: string;
  candidateCauseIds?: string[];
  diagnosticPathId?: string;
  redFlags?: string[];
  commonWrongActions?: string[];
  recommendedReasoning?: string[];
  statisticalImplication?: string;
  experimentalImplication?: string;
  bioinformaticsImplication?: string;
  claimBoundary?: string;
  reviewerImplication?: string;
  transferCaseIds?: string[];
  misconceptionTags?: string[];
  relatedMethodIds?: string[];
  relatedProtocolIds?: string[];
  relatedPatternIds?: string[];
  evidenceClaimIds?: string[];
  contentOrigin?: ContentOrigin;
  verificationStatus?: VerificationStatus;
  verifiedAt?: string;
  knowledgeStatus?: KnowledgeStatus;
  supersedes?: string[];
  supersededBy?: string[];
  staging: StagingRowMeta;
}

export interface StagingCause {
  id: string;
  problemId?: string;
  labelCn?: string;
  labelEn?: string;
  mechanism?: string;
  initialRank?: number;
  layer?: FailureLayer;
  supportingEvidenceIds?: string[];
  contradictingEvidenceIds?: string[];
  uncertaintyNote?: string;
  evidenceClaimIds?: string[];
  staging: StagingRowMeta;
}

export interface StagingCheck {
  id: string;
  problemId?: string;
  questionCn?: string;
  informationSupplied?: string;
  discriminatesCauseIds?: string[];
  expectedUpdate?: string;
  costCategory?: "low" | "medium" | "high";
  availability?: "routine" | "specialized" | "expert";
  prerequisites?: string[];
  evidenceClaimIds?: string[];
  staging: StagingRowMeta;
}

export interface StagingPathNode {
  id: string;
  step?: number;
  question?: string;
  availableEvidenceIds?: string[];
  requiredJudgment?: string;
  permittedCheckIds?: string[];
  expectedCheckId?: string;
  lockedAnswer?: string;
  stopCondition?: string;
}

export interface StagingPath {
  id: string;
  problemId?: string;
  nodes?: StagingPathNode[];
  finalRanking?: string[];
  finalLayer?: FailureLayer;
  staging: StagingRowMeta;
}

export interface StagingEvidence {
  id: string;
  problemId?: string;
  sourceType?: "observation" | "experiment" | "quantification" | "statistical" | "interpretation";
  result?: string;
  scope?: string;
  affectsCauseIds?: string[];
  direction?: Record<string, "up" | "down" | "neutral">;
  sequenceOrder?: number;
  evidenceClaimId?: string;
  staging: StagingRowMeta;
}

export interface StagingTrainingCase {
  id: string;
  problemId?: string;
  mode?: DiagnosticModeId;
  prompt?: string;
  context?: string;
  answerSchema?: string;
  rubric?: string[];
  expected?: Record<string, unknown>;
  misconceptionTags?: string[];
  farTransferFamily?: string;
  relatedProblemId?: string;
  contentOrigin?: ContentOrigin;
  verificationStatus?: VerificationStatus;
  staging: StagingRowMeta;
}

export interface StagingSourceMerge {
  canonicalId: string;
  keyKind: "doi" | "pmid" | "title";
  keyValue: string;
  originalIds: string[];
  mergedFieldNotes: string[];
}

export interface StagingForeignKeyRewrite {
  entity: "evidenceClaim" | "diagnosticCause" | "diagnosticCheck" | "diagnosticEvidence" | "diagnosticPath" | "problemCard" | "transferCase";
  rowId: string;
  field: string;
  from: string;
  to: string;
}

export interface LegacyStagingPack {
  stagingSchemaVersion: 1;
  stagingId: string;
  sourcePackId: string;
  sourceArchive: string;
  originalFileSha256?: string;
  convertedAt: string;
  convertedBy: string;
  provenance: string;
  packSchemaVersion: number;
  title: string;
  createdAt: string;
  createdBy: string;
  sources: StagingSource[];
  evidenceClaims: StagingClaim[];
  problemCards: StagingProblemCard[];
  diagnosticCauses: StagingCause[];
  diagnosticChecks: StagingCheck[];
  diagnosticPaths: StagingPath[];
  diagnosticEvidence: StagingEvidence[];
  transferCases: StagingTrainingCase[];
  verificationMetadata: SourcePackVerificationMetadata;
}

export interface LegacyCorpusAudit {
  packIds: string[];
  total: {
    sources: number;
    evidenceClaims: number;
    problemCards: number;
    diagnosticCauses: number;
    diagnosticChecks: number;
    diagnosticPaths: number;
    diagnosticEvidence: number;
    transferCases: number;
  };
  sourceCanonicalization: {
    doiCollisions: StagingSourceMerge[];
    pmidCollisions: StagingSourceMerge[];
    titleCollisions: StagingSourceMerge[];
    collisionFreeAfterMerge: boolean;
  };
  foreignKeyRewrites: StagingForeignKeyRewrite[];
  metadataPatches: Array<{ rowId: string; field: "url" | "title"; from: string; to: string; basis: string }>;
  discardedFieldCounts: Record<string, number>;
  enumLookupTables: {
    importance: Record<string, number>;
    frequency: Record<string, number>;
  };
  converterPolicies: string[];
}

export interface LegacyCorpusConversion {
  ok: boolean;
  failure?: { code: string; location: string; message: string };
  packs: LegacyStagingPack[];
  audit: LegacyCorpusAudit;
}
