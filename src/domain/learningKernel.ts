// M016 Learning Kernel — domain types and deterministic validators (schema v1).
// Contract: .agent/M016_LEARNING_KERNEL_SCHEMA.md — semantics/enums/defaults are fixed there.

import type { VerificationStatus } from "./types";
import { canonicalJson, sha256 } from "../services/contentStudio";

export type LearningStage =
  | "unseen"
  | "learning"
  | "guided"
  | "independent_ready"
  | "review_eligible"
  | "consolidating"
  | "transferable";

export type DisclosureLayer = "understand" | "explain" | "judge";
export type LearningMode = "learning" | "challenge";

export type LearningBlockKind =
  | "why_important"
  | "intuition"
  | "precise_definition"
  | "mechanism"
  | "worked_example"
  | "misconception"
  | "self_check"
  | "claim_boundary"
  | "reviewer_view";

export interface LearningTerm {
  zh: string;
  en: string;
  definitionCn: string;
}

export interface LearningBlockV1 {
  id: string;
  kind: LearningBlockKind;
  layer: DisclosureLayer;
  titleCn: string;
  bodyCn: string;
  terms?: LearningTerm[];
  required: boolean;
  evidenceClaimIds: string[];
}

export interface LearningUnitV1 {
  schemaVersion: 1;
  id: string;
  revision: number;
  contentHash: string;
  titleCn: string;
  titleEn: string;
  domain: "medical_research_foundations" | "statistics" | "experimental_design";
  estimatedMinutes: number;
  curriculumOrder: number;
  projectRelevanceTerms: string[];
  learningObjectives: string[];
  blocks: LearningBlockV1[];
  prerequisiteEdgeIds: string[];
  practiceBindingIds: string[];
  delayedReviewPlan: Array<{ afterDays: number; role: "review" | "far_transfer" }>;
  evidenceSourceIds: string[];
  contentOrigin: "verified_seed" | "verified_external" | "user" | "ai_generated";
  verificationStatus: VerificationStatus;
  scientificRisk: "LOW" | "MEDIUM" | "HIGH";
  lifecycle: "draft" | "pending_review" | "active" | "archived" | "deprecated" | "superseded";
}

/** Deterministic content hash over the unit's semantic payload (hash field excluded). */
export function learningUnitHash(unit: Omit<LearningUnitV1, "contentHash">): string {
  return sha256(canonicalJson(unit));
}

export type InstructionExposure = "none" | "partial" | "complete";

export type CompetenceLevel =
  | "unassessed"
  | "guided_only"
  | "independent_once"
  | "retained"
  | "transferred";

export interface LearnerInstructionState {
  exposure: InstructionExposure;
  completedBlockIds: string[];
  instructionCompletedAt?: string;
}

export interface LearnerCompetenceState {
  level: CompetenceLevel;
  evidenceEventIds: string[];
  lastDemonstratedAt?: string;
}

export interface LearnerUnitStateV1 {
  schemaVersion: 1;
  unitId: string;
  unitRevision: number;
  stage: LearningStage;
  instruction: LearnerInstructionState;
  competence: LearnerCompetenceState;
  selectedMode?: LearningMode;
  activeThreadStartedAt?: string;
  dueAt?: string;
  misconceptionIds: string[];
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type LearningEventType =
  | "instruction_block_completed"
  | "self_check_attempt"
  | "guided_attempt"
  | "independent_attempt"
  | "challenge_attempt"
  | "retrieval_attempt"
  | "variant_attempt"
  | "far_transfer_attempt";

export interface LearningEventAssetRef {
  bindingId: string;
  kind: PracticeAssetKind;
  id: string;
  revision: number;
  hash: string;
}

export interface LearningEventV1 {
  schemaVersion: 1;
  id: string;
  unitId: string;
  unitRevision: number;
  unitHash: string;
  type: LearningEventType;
  mode: LearningMode;
  occurredAt: string;
  asset?: LearningEventAssetRef;
  outcome?: "pass" | "fail" | "incomplete";
  score?: number;
  confidence?: 1 | 2 | 3 | 4;
  hintsUsed: string[];
  competenceEligible: boolean;
  resultingStage: LearningStage;
}

export interface PrerequisiteEdgeV1 {
  schemaVersion: 1;
  id: string;
  fromUnitId: string;
  toUnitId: string;
  required: boolean;
  startGate: "instruction_complete_or_independent_evidence";
  independentGate: "independent_once";
  rationaleCn: string;
}

export type PracticeAssetKind =
  | "method_concept"
  | "judgment_card"
  | "problem_card"
  | "audit_case"
  | "paper_task"
  | "project_case";

export type PracticeRole = "worked" | "guided" | "independent" | "review" | "far_transfer";

export interface PracticeAssetBindingV1 {
  schemaVersion: 1;
  id: string;
  unitId: string;
  assetKind: PracticeAssetKind;
  assetId: string;
  assetRevision: number;
  assetHash: string;
  role: PracticeRole;
  order: number;
  hintPolicy: "none" | "tiered" | "solution_visible";
  feedbackPolicy: "immediate" | "after_lock" | "after_submission";
  lockRequired: boolean;
  confidenceRequired: boolean;
  competenceEligible: boolean;
  minStage: LearningStage;
}

export type LearningActivityType =
  | "explanation"
  | "worked_example"
  | "self_check"
  | "guided_practice"
  | "independent_case"
  | "delayed_retrieval"
  | "variant_retrieval"
  | "spaced_retrieval"
  | "paper_transfer"
  | "ai_audit_transfer"
  | "project_transfer"
  | "far_transfer";

export interface TodayLearningTaskV1 {
  id: string;
  unitId: string;
  unitRevision: number;
  stageAtScheduling: LearningStage;
  activityType: LearningActivityType;
  bindingId?: string;
  estimatedMinutes: number;
  priority: number;
  prioritySignals: {
    dueRisk: number;
    activeThreadContinuity: number;
    misconceptionRisk: number;
    prerequisiteUnlockValue: number;
    projectRelevance: number;
  };
  rationaleCn: string;
}

export interface SkillMapProjectionV1 {
  unitId: string;
  learningProgress: {
    exposure: InstructionExposure;
    completedRequired: number;
    totalRequired: number;
  };
  demonstratedCompetence: {
    level: CompetenceLevel;
    evidenceCount: number;
    lastDemonstratedAt?: string;
  };
  labelCn: string;
}

const REQUIRED_BLOCK_KINDS: ReadonlySet<LearningBlockKind> = new Set([
  "why_important",
  "intuition",
  "precise_definition",
  "mechanism",
  "worked_example",
  "misconception",
  "self_check",
  "claim_boundary",
  "reviewer_view",
]);

const LAYERS: DisclosureLayer[] = ["understand", "explain", "judge"];

export const ACTIVE_THREAD_STAGES: ReadonlySet<LearningStage> = new Set(["learning", "guided", "independent_ready"]);

export function isAdmissibleToCurriculum(unit: LearningUnitV1): boolean {
  return unit.lifecycle === "active" && unit.verificationStatus === "verified";
}

/**
 * Structural validator over one LearningUnitV1. Deterministic; never throws.
 * ctx.claims / ctx.sources are the known registries the unit may reference.
 */
export function validateLearningUnit(
  unit: LearningUnitV1,
  ctx: { claims: ReadonlySet<string>; sources: ReadonlySet<string>; edges: ReadonlySet<string> },
): string[] {
  const errors: string[] = [];
  if (unit.schemaVersion !== 1) errors.push("不支持的单元 schemaVersion");
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(unit.id)) errors.push("单元 ID 格式无效");
  if (!Number.isInteger(unit.revision) || unit.revision < 1) errors.push("revision 必须是正整数");
  if (!Number.isInteger(unit.estimatedMinutes) || unit.estimatedMinutes < 8 || unit.estimatedMinutes > 12) {
    errors.push(`estimatedMinutes 必须是 8..12 的整数（当前 ${unit.estimatedMinutes}）`);
  }
  if (!unit.titleCn.trim() || !unit.titleEn.trim()) errors.push("标题不能为空");
  const ids = new Set<string>();
  for (const block of unit.blocks) {
    if (!block.id.trim()) { errors.push("存在空 block ID"); continue; }
    if (ids.has(block.id)) errors.push(`重复 block ID：${block.id}`);
    ids.add(block.id);
    if (!REQUIRED_BLOCK_KINDS.has(block.kind)) errors.push(`未知 block kind：${block.kind}`);
    if (!LAYERS.includes(block.layer)) errors.push(`block ${block.id} 缺少有效 layer`);
    if (!block.titleCn.trim() || !block.bodyCn.trim()) errors.push(`block ${block.id} 标题或正文为空`);
    for (const term of block.terms ?? []) {
      if (!term.zh.trim() || !term.en.trim() || !term.definitionCn.trim()) errors.push(`block ${block.id} 存在不完整术语`);
    }
    for (const claimId of block.evidenceClaimIds) {
      if (!ctx.claims.has(claimId)) errors.push(`block ${block.id} 引用未知证据主张：${claimId}`);
    }
  }
  // The eleven teaching functions: nine block kinds plus guided/independent
  // practice roles supplied by bindings (checked in validateBindings), and
  // provenance via evidence sources.
  for (const kind of REQUIRED_BLOCK_KINDS) {
    if (!unit.blocks.some((block) => block.kind === kind)) errors.push(`缺少教学职能块：${kind}`);
  }
  for (const layer of LAYERS) {
    if (!unit.blocks.some((block) => block.layer === layer)) errors.push(`layer ${layer} 没有任何内容块`);
  }
  // A long single-body substitute is rejected: understand/explain layers must
  // be chunked into at least two blocks each so progress can be tracked per block.
  for (const layer of ["understand", "explain"] as const) {
    const count = unit.blocks.filter((block) => block.layer === layer).length;
    if (count < 2) errors.push(`layer ${layer} 至少需要 2 个内容块（禁止整篇长文）`);
  }
  for (const sourceId of unit.evidenceSourceIds) {
    if (!ctx.sources.has(sourceId)) errors.push(`引用未知证据来源：${sourceId}`);
  }
  for (const edgeId of unit.prerequisiteEdgeIds) {
    if (!ctx.edges.has(edgeId)) errors.push(`引用未知先修边：${edgeId}`);
  }
  if (unit.learningObjectives.length < 2) errors.push("learningObjectives 至少 2 条");
  return [...new Set(errors)];
}

/** Role constraints from the schema contract; returns human-readable errors. */
export function validateBinding(binding: PracticeAssetBindingV1, ctx: {
  units: ReadonlySet<string>;
  assets: ReadonlyMap<string, { revision: number; hash: string }>;
}): string[] {
  const errors: string[] = [];
  if (binding.schemaVersion !== 1) errors.push("不支持的 binding schemaVersion");
  if (!ctx.units.has(binding.unitId)) errors.push(`binding ${binding.id} 引用未知单元：${binding.unitId}`);
  const asset = ctx.assets.get(`${binding.assetKind}:${binding.assetId}`);
  if (!asset) {
    errors.push(`binding ${binding.id} 引用未知资产：${binding.assetKind}/${binding.assetId}`);
  } else if (asset.revision !== binding.assetRevision || asset.hash !== binding.assetHash) {
    errors.push(`binding ${binding.id} 资产 revision/hash 与登记不符`);
  }
  switch (binding.role) {
    case "worked":
      if (binding.hintPolicy !== "solution_visible") errors.push(`worked binding ${binding.id} 必须 solution_visible`);
      if (binding.competenceEligible) errors.push(`worked binding ${binding.id} 不得计入能力`);
      break;
    case "guided":
      if (binding.hintPolicy !== "tiered") errors.push(`guided binding ${binding.id} 必须 tiered hints`);
      if (binding.competenceEligible) errors.push(`guided binding ${binding.id} 不得计入独立能力`);
      break;
    case "independent":
    case "review":
    case "far_transfer":
      if (!binding.lockRequired) errors.push(`${binding.role} binding ${binding.id} 必须 lock`);
      if (!binding.confidenceRequired) errors.push(`${binding.role} binding ${binding.id} 必须 confidence`);
      if (binding.hintPolicy !== "none") errors.push(`${binding.role} binding ${binding.id} 不得提供 hint`);
      if (!binding.competenceEligible) errors.push(`${binding.role} binding ${binding.id} 必须可计能力`);
      break;
  }
  return errors;
}

/** Deterministic DAG validation: unknown nodes, self loops, duplicate edges and cycles fail. */
export function validatePrerequisiteGraph(
  units: ReadonlyArray<Pick<LearningUnitV1, "id">>,
  edges: ReadonlyArray<PrerequisiteEdgeV1>,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const unitIds = new Set(units.map((unit) => unit.id));
  const seenEdges = new Map<string, string>();
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!edge.fromUnitId || !edge.toUnitId) { errors.push("边缺少端点"); continue; }
    if (!unitIds.has(edge.fromUnitId)) errors.push(`边的起点未知：${edge.fromUnitId}`);
    if (!unitIds.has(edge.toUnitId)) errors.push(`边的终点未知：${edge.toUnitId}`);
    if (edge.fromUnitId === edge.toUnitId) errors.push(`自环：${edge.fromUnitId}`);
    const key = `${edge.fromUnitId}->${edge.toUnitId}`;
    if (seenEdges.has(key)) errors.push(`重复先修边：${key}`);
    seenEdges.set(key, edge.id);
    adjacency.set(edge.fromUnitId, [...(adjacency.get(edge.fromUnitId) ?? []), edge.toUnitId]);
  }
  // Cycle detection (deterministic DFS with color marking).
  const color = new Map<string, 0 | 1 | 2>();
  const visit = (node: string, stack: string[]): void => {
    const mark = color.get(node) ?? 0;
    if (mark === 1) {
      errors.push(`依赖环：${[...stack.slice(stack.indexOf(node)), node].join(" -> ")}`);
      return;
    }
    if (mark === 2) return;
    color.set(node, 1);
    for (const next of [...(adjacency.get(node) ?? [])].sort()) visit(next, [...stack, node]);
    color.set(node, 2);
  };
  for (const unit of [...units].sort((a, b) => a.id.localeCompare(b.id))) visit(unit.id, []);
  return { ok: errors.length === 0, errors };
}
