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

export type PracticeInteraction =
  | "single_choice"
  | "multi_select"
  | "ordering"
  | "classification"
  | "claim_boundary"
  | "short_reasoning"
  | "evidence_chain"
  | "error_detection"
  | "project_transfer";

export interface PracticeResponseV1 {
  selectedOptionIds?: string[];
  orderedItemIds?: string[];
  classifications?: Record<string, string>;
  shortReasoning?: string;
  claimBoundary?: string;
  projectId?: string;
}

export interface PracticeFeedbackV1 {
  correctCn: string[];
  missedCn: string[];
  overreachCn: string[];
  reasoningChainCn: string[];
  maximalConclusionCn: string;
}

export interface PracticeAssetV1 {
  schemaVersion: 1;
  id: string;
  revision: number;
  contentHash: string;
  role: PracticeRole;
  conceptTarget: string;
  difficulty: "foundation" | "intermediate" | "advanced";
  interaction: PracticeInteraction;
  titleCn: string;
  scenarioCn: string;
  promptCn: string;
  options?: Array<{ id: string; labelCn: string }>;
  orderingItems?: Array<{ id: string; labelCn: string }>;
  classificationItems?: Array<{ id: string; labelCn: string; categories: string[] }>;
  hints: string[];
  rubric: {
    expectedOptionIds?: string[];
    expectedOrderIds?: string[];
    expectedClassifications?: Record<string, string>;
    minReasoningChars?: number;
    minClaimBoundaryChars?: number;
    requiredReasoningTerms?: string[];
  };
  feedback: PracticeFeedbackV1;
  provenance: {
    contentOrigin: LearningUnitV1["contentOrigin"];
    verificationStatus: VerificationStatus;
    evidenceSourceIds: string[];
  };
}

export function practiceAssetHash(asset: Omit<PracticeAssetV1, "contentHash">): string {
  return sha256(canonicalJson(asset));
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
  response?: PracticeResponseV1;
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
  | "learning_practice"
  | "method_concept"
  | "judgment_card"
  | "problem_card"
  | "audit_case"
  | "paper_task"
  | "project_case";

export type PracticeRole = "prediction" | "worked" | "self_check" | "guided" | "independent" | "review" | "far_transfer";

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
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;

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
  if (!SHA256_PATTERN.test(unit.contentHash)) {
    errors.push("contentHash 必须是标准 SHA256");
  } else {
    const { contentHash: _contentHash, ...semanticPayload } = unit;
    if (learningUnitHash(semanticPayload) !== unit.contentHash) errors.push("Learning Unit contentHash 不匹配");
  }
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
  if (unit.evidenceSourceIds.length === 0) errors.push("evidenceSourceIds 至少需要 1 项");
  for (const [label, values] of [
    ["learningObjectives", unit.learningObjectives],
    ["evidenceSourceIds", unit.evidenceSourceIds],
    ["prerequisiteEdgeIds", unit.prerequisiteEdgeIds],
    ["practiceBindingIds", unit.practiceBindingIds],
  ] as const) {
    if (new Set(values).size !== values.length) errors.push(`${label} 不得重复`);
  }
  const reviewRoles = new Set(unit.delayedReviewPlan.map((entry) => entry.role));
  if (!reviewRoles.has("review") || !reviewRoles.has("far_transfer")) {
    errors.push("delayedReviewPlan 必须同时包含 review 与 far_transfer");
  }
  if (unit.delayedReviewPlan.some((entry) => !Number.isInteger(entry.afterDays) || entry.afterDays < 1)) {
    errors.push("delayedReviewPlan.afterDays 必须是正整数");
  }
  return [...new Set(errors)];
}

/** Role constraints from the schema contract; returns human-readable errors. */
export function validateBinding(binding: PracticeAssetBindingV1, ctx: {
  units: ReadonlySet<string>;
  assets: ReadonlyMap<string, { revision: number; hash: string }>;
}): string[] {
  const errors: string[] = [];
  if (binding.schemaVersion !== 1) errors.push("不支持的 binding schemaVersion");
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(binding.id)) errors.push("binding ID 格式无效");
  if (!Number.isInteger(binding.order) || binding.order < 1) errors.push(`binding ${binding.id} order 必须是正整数`);
  if (!SHA256_PATTERN.test(binding.assetHash)) errors.push(`binding ${binding.id} assetHash 格式无效`);
  if (!ctx.units.has(binding.unitId)) errors.push(`binding ${binding.id} 引用未知单元：${binding.unitId}`);
  const asset = ctx.assets.get(`${binding.assetKind}:${binding.assetId}`);
  if (!asset) {
    errors.push(`binding ${binding.id} 引用未知资产：${binding.assetKind}/${binding.assetId}`);
  } else if (asset.revision !== binding.assetRevision || asset.hash !== binding.assetHash) {
    errors.push(`binding ${binding.id} 资产 revision/hash 与登记不符`);
  }
  switch (binding.role) {
    case "prediction":
    case "self_check":
      if (binding.competenceEligible) errors.push(`${binding.role} binding ${binding.id} 不得计入独立能力`);
      if (binding.minStage !== "learning") errors.push(`${binding.role} binding ${binding.id} minStage 必须是 learning`);
      break;
    case "worked":
      if (binding.hintPolicy !== "solution_visible") errors.push(`worked binding ${binding.id} 必须 solution_visible`);
      if (binding.competenceEligible) errors.push(`worked binding ${binding.id} 不得计入能力`);
      if (!(["unseen", "learning"] as LearningStage[]).includes(binding.minStage)) errors.push(`worked binding ${binding.id} minStage 非法`);
      break;
    case "guided":
      if (binding.hintPolicy !== "tiered") errors.push(`guided binding ${binding.id} 必须 tiered hints`);
      if (binding.competenceEligible) errors.push(`guided binding ${binding.id} 不得计入独立能力`);
      if (binding.minStage !== "guided") errors.push(`guided binding ${binding.id} minStage 必须是 guided`);
      break;
    case "independent":
    case "review":
    case "far_transfer":
      if (!binding.lockRequired) errors.push(`${binding.role} binding ${binding.id} 必须 lock`);
      if (!binding.confidenceRequired) errors.push(`${binding.role} binding ${binding.id} 必须 confidence`);
      if (binding.hintPolicy !== "none") errors.push(`${binding.role} binding ${binding.id} 不得提供 hint`);
      if (!binding.competenceEligible) errors.push(`${binding.role} binding ${binding.id} 必须可计能力`);
      if (binding.role === "independent" && binding.minStage !== "independent_ready") errors.push(`independent binding ${binding.id} minStage 必须是 independent_ready`);
      if (binding.role === "review" && binding.minStage !== "review_eligible") errors.push(`review binding ${binding.id} minStage 必须是 review_eligible`);
      if (binding.role === "far_transfer" && binding.minStage !== "consolidating") errors.push(`far_transfer binding ${binding.id} minStage 必须是 consolidating`);
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
  if (unitIds.size !== units.length) errors.push("存在重复 Learning Unit ID");
  const seenEdges = new Map<string, string>();
  const edgeIds = new Set<string>();
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.schemaVersion !== 1) errors.push(`边 ${edge.id} schemaVersion 非法`);
    if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(edge.id)) errors.push(`边 ID 格式无效：${edge.id}`);
    if (edgeIds.has(edge.id)) errors.push(`重复先修边 ID：${edge.id}`);
    edgeIds.add(edge.id);
    if (edge.startGate !== "instruction_complete_or_independent_evidence" || edge.independentGate !== "independent_once") errors.push(`边 ${edge.id} gate 非法`);
    if (!edge.rationaleCn.trim()) errors.push(`边 ${edge.id} 缺少 rationaleCn`);
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

/** Cross-object validation for one immutable Learning Kernel content snapshot. */
export function validateLearningKernelContent(input: {
  units: LearningUnitV1[];
  edges: PrerequisiteEdgeV1[];
  bindings: PracticeAssetBindingV1[];
  claims: ReadonlySet<string>;
  sources: ReadonlySet<string>;
  assets: ReadonlyMap<string, { revision: number; hash: string }>;
}): string[] {
  const errors = [...validatePrerequisiteGraph(input.units, input.edges).errors];
  const unitIds = new Set(input.units.map((unit) => unit.id));
  const edgeIds = new Set(input.edges.map((edge) => edge.id));
  const bindingIds = new Set<string>();
  const bindingById = new Map<string, PracticeAssetBindingV1>();
  for (const binding of input.bindings) {
    if (bindingIds.has(binding.id)) errors.push(`重复 binding ID：${binding.id}`);
    bindingIds.add(binding.id);
    bindingById.set(binding.id, binding);
    errors.push(...validateBinding(binding, { units: unitIds, assets: input.assets }));
  }
  for (const unit of input.units) {
    errors.push(...validateLearningUnit(unit, { claims: input.claims, sources: input.sources, edges: edgeIds }));
    const attached = unit.practiceBindingIds.map((id) => bindingById.get(id));
    for (const [index, binding] of attached.entries()) {
      const id = unit.practiceBindingIds[index];
      if (!binding) errors.push(`单元 ${unit.id} 引用未知 binding：${id}`);
      else if (binding.unitId !== unit.id) errors.push(`binding ${id} 不属于单元 ${unit.id}`);
    }
    const roles = new Set(attached.filter((binding): binding is PracticeAssetBindingV1 => binding !== undefined).map((binding) => binding.role));
    for (const role of ["prediction", "worked", "self_check", "guided", "independent", "review", "far_transfer"] as PracticeRole[]) {
      if (!roles.has(role)) errors.push(`单元 ${unit.id} 缺少 ${role} practice binding`);
    }
    const assetFor = (role: PracticeRole) => attached.find((binding) => binding?.role === role)?.assetId;
    if (assetFor("independent") && assetFor("independent") === assetFor("review")) errors.push(`单元 ${unit.id} 的 independent 与 review 不得复用同一资产`);
    if (assetFor("independent") && assetFor("independent") === assetFor("far_transfer")) errors.push(`单元 ${unit.id} 的 far_transfer 不得机械复用 independent 资产`);
  }
  for (const binding of input.bindings) {
    const owner = input.units.find((unit) => unit.id === binding.unitId);
    if (owner && !owner.practiceBindingIds.includes(binding.id)) errors.push(`binding ${binding.id} 未登记在所属单元`);
  }
  return [...new Set(errors)];
}

export function validatePracticeAsset(asset: PracticeAssetV1): string[] {
  const errors: string[] = [];
  if (asset.schemaVersion !== 1) errors.push("不支持的 Practice Asset schemaVersion");
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(asset.id)) errors.push("Practice Asset ID 格式无效");
  if (!Number.isInteger(asset.revision) || asset.revision < 1) errors.push("Practice Asset revision 必须为正整数");
  const { contentHash: _hash, ...payload } = asset;
  if (!SHA256_PATTERN.test(asset.contentHash) || practiceAssetHash(payload) !== asset.contentHash) errors.push(`Practice Asset ${asset.id} hash 不匹配`);
  if (!asset.titleCn.trim() || !asset.scenarioCn.trim() || !asset.promptCn.trim()) errors.push(`Practice Asset ${asset.id} 文本不完整`);
  const optionInteractions: PracticeInteraction[] = ["single_choice", "multi_select", "claim_boundary", "short_reasoning", "evidence_chain", "error_detection", "project_transfer"];
  if (optionInteractions.includes(asset.interaction) && (!asset.options || asset.options.length < 2)) errors.push(`Practice Asset ${asset.id} 缺少可评分选项`);
  if (asset.interaction === "ordering" && (!asset.orderingItems || asset.orderingItems.length < 2 || !asset.rubric.expectedOrderIds)) errors.push(`Practice Asset ${asset.id} 缺少 ordering rubric`);
  if (asset.interaction === "classification" && (!asset.classificationItems || asset.classificationItems.length < 1 || !asset.rubric.expectedClassifications)) errors.push(`Practice Asset ${asset.id} 缺少 classification rubric`);
  if (asset.interaction === "project_transfer" && asset.role !== "far_transfer") errors.push(`Practice Asset ${asset.id} 的 project_transfer 只能用于 far_transfer`);
  if (["independent", "review", "far_transfer"].includes(asset.role) && asset.hints.length > 0) errors.push(`${asset.role} asset ${asset.id} 不得包含 hints`);
  if (asset.role === "guided" && asset.hints.length < 2) errors.push(`guided asset ${asset.id} 至少需要两层 hint`);
  if (asset.provenance.verificationStatus !== "verified") errors.push(`正式 curriculum 的 Practice Asset ${asset.id} 必须 verified`);
  if (asset.provenance.evidenceSourceIds.length === 0) errors.push(`Practice Asset ${asset.id} 缺少 provenance`);
  return errors;
}

export function scorePracticeAsset(asset: PracticeAssetV1, response: PracticeResponseV1): { passed: boolean; score: number; missing: string[] } {
  const missing: string[] = [];
  const selected = new Set(response.selectedOptionIds ?? []);
  const expected = new Set(asset.rubric.expectedOptionIds ?? []);
  const decisionCorrect = expected.size === 0 || (selected.size === expected.size && [...expected].every((id) => selected.has(id)));
  if (!decisionCorrect) missing.push("结构化判断与参考标准不一致");
  const orderCorrect = !asset.rubric.expectedOrderIds || JSON.stringify(response.orderedItemIds ?? []) === JSON.stringify(asset.rubric.expectedOrderIds);
  if (!orderCorrect) missing.push("推理顺序仍需调整");
  const classCorrect = !asset.rubric.expectedClassifications || Object.entries(asset.rubric.expectedClassifications).every(([id, category]) => response.classifications?.[id] === category);
  if (!classCorrect) missing.push("分类中仍有层级混淆");
  const reasoning = response.shortReasoning?.trim() ?? "";
  const reasoningPresent = reasoning.length >= (asset.rubric.minReasoningChars ?? 0);
  if (!reasoningPresent) missing.push("需要写出自己的理由");
  const reasoningTermsPresent = (asset.rubric.requiredReasoningTerms ?? []).every((term) => reasoning.toLocaleLowerCase().includes(term.toLocaleLowerCase()));
  if (!reasoningTermsPresent) missing.push("理由中缺少 rubric 要求的关键关系");
  const requiredBoundaryChars = asset.rubric.minClaimBoundaryChars
    ?? (["claim_boundary", "project_transfer"].includes(asset.interaction) ? 8 : 0);
  const boundaryPresent = (response.claimBoundary?.trim().length ?? 0) >= requiredBoundaryChars;
  if (!boundaryPresent) missing.push("需要写出结论边界");
  const projectLinked = asset.interaction !== "project_transfer" || Boolean(response.projectId?.trim());
  if (!projectLinked) missing.push("需要选择一个真实项目作为迁移目标");
  const checks = [decisionCorrect, orderCorrect, classCorrect, reasoningPresent, reasoningTermsPresent, boundaryPresent, projectLinked];
  const score = checks.filter(Boolean).length / checks.length;
  return { passed: decisionCorrect && orderCorrect && classCorrect && reasoningPresent && reasoningTermsPresent && boundaryPresent && projectLinked, score, missing };
}

/** Pure two-axis projection. Absence of a state means unassessed, never zero competence. */
export function projectSkillMap(unit: LearningUnitV1, state?: LearnerUnitStateV1): SkillMapProjectionV1 {
  const requiredIds = unit.blocks.filter((block) => block.required).map((block) => block.id);
  const completed = new Set(state?.instruction.completedBlockIds ?? []);
  const exposure = state?.instruction.exposure ?? "none";
  const competence = state?.competence.level ?? "unassessed";
  const progressLabel = exposure === "complete" ? "教学完成" : exposure === "partial" ? "学习进行中" : "尚未开始学习";
  const competenceLabel: Record<CompetenceLevel, string> = {
    unassessed: "能力尚未评估",
    guided_only: "已完成引导练习",
    independent_once: "已独立证明一次",
    retained: "已通过延迟保持",
    transferred: "已证明可迁移",
  };
  return {
    unitId: unit.id,
    learningProgress: {
      exposure,
      completedRequired: requiredIds.filter((id) => completed.has(id)).length,
      totalRequired: requiredIds.length,
    },
    demonstratedCompetence: {
      level: competence,
      evidenceCount: state?.competence.evidenceEventIds.length ?? 0,
      lastDemonstratedAt: state?.competence.lastDemonstratedAt,
    },
    labelCn: `${progressLabel} · ${competenceLabel[competence]}`,
  };
}
