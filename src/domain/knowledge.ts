/** Canonical scientific records. Revisions are immutable; decisions live in the ledger. */
export const KNOWLEDGE_TYPES = ["concept", "method", "protocol", "guideline", "research_pattern", "experimental_technique"] as const;
export type KnowledgeType = typeof KNOWLEDGE_TYPES[number];
export const KNOWLEDGE_STATUSES = ["CURRENT", "UPDATE_AVAILABLE", "REVIEW_REQUIRED", "SUPERSEDED", "DEPRECATED", "EMERGING"] as const;
export type KnowledgeStatus = typeof KNOWLEDGE_STATUSES[number];
export const FRESHNESS_CLASSES = ["FOUNDATIONAL_STABLE", "EVOLVING_PRACTICE", "VERSION_SENSITIVE", "GUIDELINE_TRIGGERED"] as const;
export type KnowledgeFreshnessClass = typeof FRESHNESS_CLASSES[number];
export type KnowledgeLifecycle = "draft" | "pending_review" | "active" | "archived";
export type KnowledgeOrigin = "user" | "ai_generated" | "verified_seed" | "verified_external" | "migration";
export interface KnowledgeRevisionBinding { knowledgeUnitId: string; revision: number; hash: string }
export interface KnowledgeSourceBinding { sourceId: string; revision: number; hash: string }
export interface KnowledgeEvidenceLink { claimId: string; revision: number; hash: string; supportMode: "direct" | "methodology" | "curriculum_synthesis" | "supplemental" }
export interface KnowledgeProvenance {
  createdAt: string; changeReason: string; reviewer?: string; reviewedAt?: string;
  verificationScope: "none" | "identifier" | "metadata" | "claim";
  originalId?: string; originalRevision?: number; originalHash?: string; originalPayload?: unknown;
  supersedesRevision?: number;
}
export interface KnowledgeBase {
  schemaVersion: 1; id: string; revision: number; hash: string; title: string; aliases: string[]; domain: string[];
  scientificQuestion: string; whyItMatters: string; intuition: string; preciseExplanation: string[];
  inputs: string[]; outputs: string[]; assumptions: string[]; workflowOrLogic: string[];
  boundaries: string[]; misconceptions: string[]; failureModes: string[]; alternativeExplanations: string[];
  evidenceLinks: KnowledgeEvidenceLink[]; prerequisiteIds: string[]; downstreamIds: string[];
  freshnessClass: KnowledgeFreshnessClass; knowledgeStatus: KnowledgeStatus;
  validFrom: string; validUntil?: string; lastReviewedAt?: string; nextReviewAt?: string;
  supersedes: KnowledgeRevisionBinding[]; supersededBy: KnowledgeRevisionBinding[];
  lifecycle: KnowledgeLifecycle; verificationStatus: "pending" | "verified"; contentOrigin: KnowledgeOrigin;
  provenance: KnowledgeProvenance; migrationStatus: "complete" | "REVIEW_REQUIRED"; reviewGaps: string[];
}
export interface KnowledgeMethodFields {
  algorithmOrStatisticalLogic: string; parameters: string[]; diagnostics: string[];
  appropriateWhen: string[]; inappropriateWhen: string[]; commonMisuse: string[]; reviewerChecks: string[]; paperAppearance: string;
}
export interface KnowledgeProtocolFields {
  signalOrigin: string; experimentalUnit: string; biologicalReplicate: string; technicalReplicate: string;
  controls: string[]; workflowLogic: string[]; criticalVariables: string[]; qcCheckpoints: string[];
  troubleshooting: string[]; quantification: string; statisticalUnit: string; allowedClaims: string[]; forbiddenClaims: string[];
}
export type KnowledgeUnit = KnowledgeBase & (
  | { knowledgeType: "concept"; concept: { definition: string; counterexamples: string[] } }
  | { knowledgeType: "method"; method: KnowledgeMethodFields }
  | { knowledgeType: "protocol"; protocol: KnowledgeProtocolFields }
  | { knowledgeType: "experimental_technique"; technique: KnowledgeProtocolFields }
  | { knowledgeType: "guideline"; guideline: { issuingOrganization: string; version: string; effectiveDate: string; supersededVersion: string; recommendationScope: string[] } }
  | { knowledgeType: "research_pattern"; pattern: { context: string; evidenceLogic: string[]; applicability: string[] } }
);
export interface KnowledgeEvidenceSource {
  id: string; revision: number; hash: string; title: string; doi?: string; pmid?: string; url?: string; version?: string;
  metadataStatus: "pending" | "metadata_verified"; contentOrigin: KnowledgeOrigin; provenance: KnowledgeProvenance;
}
export interface KnowledgeEvidenceClaim {
  id: string; revision: number; hash: string; statement: string; sourceBindings: KnowledgeSourceBinding[];
  verificationStatus: "pending" | "verified"; contentOrigin: KnowledgeOrigin; provenance: KnowledgeProvenance;
}
export type KnowledgeLearningKind = "guide" | "concept_lesson" | "method_lesson" | "protocol_lesson" | "assessment" | "case_lab" | "studio_task";
export interface KnowledgeLearningBinding {
  assetId: string; assetRevision: number; assetHash: string; kind: KnowledgeLearningKind; title: string;
  knowledgeUnitIds: string[]; knowledgeRevisionBindings: KnowledgeRevisionBinding[];
  /** Only the explicit built-in adapter sets this; it preserves untouched legacy behavior. */
  legacyActive: boolean; migrationStatus: "complete" | "REVIEW_REQUIRED"; reviewGaps: string[];
}
export const KNOWLEDGE_PROJECTION_TYPES = ["guide", "concept_lesson", "method_lesson", "protocol_lesson", "apply", "remediation", "delayed_review", "case_lab"] as const;
export type KnowledgeProjectionType = typeof KNOWLEDGE_PROJECTION_TYPES[number];
export interface KnowledgeProjection {
  id: string; revision: number; hash: string; title: string; projectionType: KnowledgeProjectionType;
  knowledgeUnitIds: string[]; knowledgeRevisionBindings: KnowledgeRevisionBinding[];
  lifecycle: "pending_review"; verificationStatus: "pending"; contentOrigin: "ai_generated";
  body: string[]; reviewGaps: string[]; createdAt: string; createsCompetence: false;
}
export const KNOWLEDGE_CHANGE_TYPES = ["NEW", "UPDATE", "EXTENSION", "CONTRADICTION", "DEPRECATION", "SUPERSESSION"] as const;
export type KnowledgeChangeType = typeof KNOWLEDGE_CHANGE_TYPES[number];
export interface KnowledgeChangeCandidate {
  id: string; hash: string; changeType: KnowledgeChangeType; operation: "create" | "revise" | "duplicate" | "supersede" | "deprecate" | "restore" | "evidence_update";
  title: string; reason: string; createdAt: string; baseWorkspaceHash: string;
  target?: KnowledgeRevisionBinding; proposedUnit?: KnowledgeUnit;
  sources: KnowledgeEvidenceSource[]; claims: KnowledgeEvidenceClaim[];
  changedSourceIds: string[]; changedClaimIds: string[];
  lifecycle: "pending_review"; verificationStatus: "pending"; contentOrigin: KnowledgeOrigin;
}
export interface KnowledgeLedgerEntry {
  id: string; changeId: string; at: string; reason: string; reviewer: string;
  action: "review_required" | "supersede" | "deprecate" | "restore_pending" | "candidate_added";
  target: KnowledgeRevisionBinding; status: KnowledgeStatus; replacement?: KnowledgeRevisionBinding;
}
export interface KnowledgeLearningHold {
  id: string; changeId: string; assetId: string; assetRevision: number; assetHash: string;
  reason: string; createdAt: string; status: "REVIEW_REQUIRED";
}
export interface KnowledgeConflict { id: string; candidateId: string; targetId: string; expectedHash: string; actualHash: string; reason: string; createdAt: string }
export interface KnowledgeWorkspace {
  schemaVersion: 1; units: KnowledgeUnit[]; sources: KnowledgeEvidenceSource[]; claims: KnowledgeEvidenceClaim[];
  learningBindings: KnowledgeLearningBinding[]; projections: KnowledgeProjection[];
  candidates: KnowledgeChangeCandidate[]; ledger: KnowledgeLedgerEntry[]; holds: KnowledgeLearningHold[]; conflicts: KnowledgeConflict[];
}
export interface KnowledgeAudit { ok: boolean; errors: string[]; warnings: string[]; groups: Record<"schema" | "dependency" | "supersession" | "freshness" | "learning_binding" | "update_impact" | "activation_safety", string[]> }
export interface KnowledgeImpact {
  valid: boolean; errors: string[]; affectedKnowledge: KnowledgeRevisionBinding[]; affectedLessons: string[];
  affectedAssessments: string[]; affectedCases: string[]; affectedProtocols: string[]; affectedGuides: string[]; affectedStudios: string[];
  affectedLearningBindings: KnowledgeLearningBinding[]; patchProposals: Array<{ assetId: string; reason: string; lifecycle: "pending_review" }>;
  graph: { nodes: string[]; edges: Array<{ from: string; to: string }> };
}
export interface KnowledgeImportRequest {
  format: "doi" | "pmid" | "metadata" | "source_pack" | "markdown" | "json" | "note";
  text: string; knowledgeType: KnowledgeType; title?: string; id: string; now: string;
  target?: KnowledgeRevisionBinding; changeType?: KnowledgeChangeType; contentOrigin?: "user" | "ai_generated";
}
export interface KnowledgeImportPreview { valid: boolean; errors: string[]; warnings: string[]; request: KnowledgeImportRequest; candidate?: KnowledgeChangeCandidate; impact: KnowledgeImpact; hash: string }
