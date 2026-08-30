import type {
  LearningContentProgressV1,
  LearningContentRegistryEntryV1,
} from "../domain/learningArchitecture";
import type {
  LearningEventV1,
  LearnerUnitStateV1,
  PracticeResponseV1,
} from "../domain/learningKernel";
import { scorePracticeAsset } from "../domain/learningKernel";
import {
  learningArchitectureAssetById,
  learningArchitectureBindingByAssetId,
  learningArchitectureUnitById,
} from "../data/learningArchitecture";
import { applyLearningTransition, createLearnerUnitState } from "./learningKernelEngine";

export type ArchitectureAttemptKind = "apply" | "remediation" | "review";

export function createLearningContentProgress(
  entry: Pick<LearningContentRegistryEntryV1, "id" | "contentType">,
  now: string,
): LearningContentProgressV1 {
  return {
    schemaVersion: 1,
    contentId: entry.id,
    contentType: entry.contentType,
    phase: "learn",
    explainCompleted: false,
    applyStarted: false,
    remediationNeeded: false,
    remediationAttempt: 0,
    updatedAt: now,
  };
}

export function submitArchitecturePractice(input: {
  entry: LearningContentRegistryEntryV1;
  progress?: LearningContentProgressV1;
  currentState?: LearnerUnitStateV1;
  attemptKind: ArchitectureAttemptKind;
  response: PracticeResponseV1;
  confidence: 1 | 2 | 3 | 4;
  occurredAt: string;
  eventId: string;
}): { state: LearnerUnitStateV1; event: LearningEventV1; progress: LearningContentProgressV1; passed: boolean; score: number } {
  const assetId = input.attemptKind === "review" ? input.entry.reviewAssetId
    : input.attemptKind === "remediation" ? input.entry.remediationAssetId
      : input.entry.applyAssetId;
  if (!input.entry.unitId || !assetId) throw new Error("该学习内容没有完整的 Kernel 接线");
  const unit = learningArchitectureUnitById.get(input.entry.unitId);
  const asset = learningArchitectureAssetById.get(assetId);
  const binding = learningArchitectureBindingByAssetId.get(assetId);
  if (!unit || !asset || !binding) throw new Error("版本化学习资产或绑定不存在");
  if (asset.id !== assetId || binding.assetRevision !== asset.revision || binding.assetHash !== asset.contentHash) throw new Error("学习资产 revision/hash 与绑定不一致");
  if (input.attemptKind === "review" && asset.role !== "review") throw new Error("延迟复习必须使用 review asset");
  if (input.attemptKind !== "review" && asset.role !== "independent") throw new Error("Apply 必须使用 independent asset");
  if (asset.hints.length > 0 || !binding.lockRequired || !binding.confidenceRequired) throw new Error("独立 Apply/Review 必须锁定、无提示并记录信心");
  const scored = scorePracticeAsset(asset, input.response);
  const current = input.currentState ?? createLearnerUnitState(unit, input.occurredAt, input.attemptKind === "review" ? "learning" : "challenge");
  const transition = applyLearningTransition(unit, current, {
    id: input.eventId,
    type: input.attemptKind === "review" ? "retrieval_attempt" : "challenge_attempt",
    mode: input.attemptKind === "review" ? "learning" : "challenge",
    occurredAt: input.occurredAt,
    outcome: scored.passed ? "pass" : "fail",
    score: scored.score,
    confidence: input.confidence,
    hintsUsed: [],
    highConfidenceConceptualError: !scored.passed && input.confidence >= 3,
    asset: { bindingId: binding.id, kind: binding.assetKind, id: asset.id, revision: asset.revision, hash: asset.contentHash },
    response: input.response,
  });
  const base = input.progress ?? createLearningContentProgress(input.entry, input.occurredAt);
  const progress: LearningContentProgressV1 = {
    ...base,
    phase: input.attemptKind === "review" ? (scored.passed ? "review" : "apply") : scored.passed ? "review" : input.entry.remediationAssetId ? "remediation" : "apply",
    applyStarted: input.attemptKind !== "review" || base.applyStarted,
    remediationNeeded: input.attemptKind === "review" ? base.remediationNeeded : !scored.passed,
    remediationAttempt: base.remediationAttempt + (input.attemptKind === "remediation" ? 1 : 0),
    updatedAt: input.occurredAt,
  };
  return { ...transition, progress, passed: scored.passed, score: scored.score };
}

export function contentPrerequisitesMet(entry: LearningContentRegistryEntryV1, input: {
  registry: LearningContentRegistryEntryV1[];
  progress: LearningContentProgressV1[];
  states: LearnerUnitStateV1[];
}): boolean {
  return entry.prerequisiteIds.every((id) => {
    const prerequisite = input.registry.find((item) => item.id === id);
    if (!prerequisite) return false;
    const state = prerequisite.unitId ? input.states.find((item) => item.unitId === prerequisite.unitId) : undefined;
    return Boolean(state && ["independent_once", "retained", "transferred"].includes(state.competence.level));
  });
}

export function missingContentPrerequisites(entry: LearningContentRegistryEntryV1, input: {
  registry: LearningContentRegistryEntryV1[];
  progress: LearningContentProgressV1[];
  states: LearnerUnitStateV1[];
}): LearningContentRegistryEntryV1[] {
  return entry.prerequisiteIds.flatMap((id) => {
    const prerequisite = input.registry.find((item) => item.id === id);
    if (!prerequisite) return [];
    const state = prerequisite.unitId ? input.states.find((item) => item.unitId === prerequisite.unitId) : undefined;
    return state && ["independent_once", "retained", "transferred"].includes(state.competence.level) ? [] : [prerequisite];
  });
}
