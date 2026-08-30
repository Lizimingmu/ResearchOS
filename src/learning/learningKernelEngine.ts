import type {
  LearningEventType,
  LearningEventV1,
  LearningMode,
  LearningUnitV1,
  LearnerUnitStateV1,
  LearningEventAssetRef,
  PracticeResponseV1,
  PrerequisiteEdgeV1,
} from "../domain/learningKernel";

export interface LearningTransitionInput {
  id: string;
  type: LearningEventType;
  mode: LearningMode;
  occurredAt: string;
  blockId?: string;
  outcome?: "pass" | "fail" | "incomplete";
  score?: number;
  confidence?: 1 | 2 | 3 | 4;
  hintsUsed?: string[];
  highConfidenceConceptualError?: boolean;
  asset?: LearningEventAssetRef;
  response?: PracticeResponseV1;
}

const competenceRank = { unassessed: 0, guided_only: 1, independent_once: 2, retained: 3, transferred: 4 } as const;

export function createLearnerUnitState(unit: LearningUnitV1, now: string, mode: LearningMode = "learning"): LearnerUnitStateV1 {
  return {
    schemaVersion: 1,
    unitId: unit.id,
    unitRevision: unit.revision,
    stage: mode === "learning" ? "learning" : "unseen",
    instruction: { exposure: "none", completedBlockIds: [] },
    competence: { level: "unassessed", evidenceEventIds: [] },
    selectedMode: mode,
    activeThreadStartedAt: mode === "learning" ? now : undefined,
    misconceptionIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function canStartUnit(input: {
  unitId: string;
  states: LearnerUnitStateV1[];
  edges: PrerequisiteEdgeV1[];
  pausedUnitIds: ReadonlySet<string>;
}): { allowed: boolean; reasonCn?: string } {
  const incoming = input.edges.filter((edge) => edge.toUnitId === input.unitId && edge.required);
  for (const edge of incoming) {
    const prerequisite = input.states.find((state) => state.unitId === edge.fromUnitId);
    const passed = prerequisite?.instruction.exposure === "complete" || (prerequisite && competenceRank[prerequisite.competence.level] >= competenceRank.independent_once);
    if (!passed) return { allowed: false, reasonCn: "请先完成前置单元的核心讲解，或通过该单元的独立挑战。" };
  }
  const active = input.states.filter((state) => ["learning", "guided", "independent_ready"].includes(state.stage) && !input.pausedUnitIds.has(state.unitId));
  const alreadyActive = active.some((state) => state.unitId === input.unitId);
  if (!alreadyActive && active.length >= 2) return { allowed: false, reasonCn: "同时最多进行两个学习主题；请先完成或暂停一个。" };
  return { allowed: true };
}

const addDays = (iso: string, days: number): string => {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

export function applyLearningTransition(
  unit: LearningUnitV1,
  current: LearnerUnitStateV1 | undefined,
  input: LearningTransitionInput,
): { state: LearnerUnitStateV1; event: LearningEventV1 } {
  if (!Number.isFinite(Date.parse(input.occurredAt))) throw new Error("学习事件时间无效");
  const base = current ? structuredClone(current) : createLearnerUnitState(unit, input.occurredAt, input.mode);
  if (base.unitId !== unit.id || base.unitRevision !== unit.revision) throw new Error("学习状态与单元版本不匹配");
  const hintsUsed = [...new Set(input.hintsUsed ?? [])];
  let stage = base.stage;
  let competenceEligible = false;
  let level = base.competence.level;
  let completedBlockIds = [...base.instruction.completedBlockIds];
  let exposure = base.instruction.exposure;
  let instructionCompletedAt = base.instruction.instructionCompletedAt;
  let dueAt = base.dueAt;

  const practiceEvent = input.type !== "instruction_block_completed";
  if (practiceEvent && (!input.asset || !input.response || Object.keys(input.response).length === 0)) {
    throw new Error("练习事件必须绑定版本化资产并先锁定真实作答");
  }

  if (input.type === "instruction_block_completed") {
    if (input.mode === "challenge") throw new Error("Challenge 不能写入教学完成记录");
    const target = unit.blocks.find((block) => block.id === input.blockId);
    if (!target) throw new Error("教学块不存在");
    completedBlockIds = [...new Set([...completedBlockIds, target.id])];
    exposure = "partial";
    const required = unit.blocks.filter((block) => block.required).map((block) => block.id);
    if (required.every((id) => completedBlockIds.includes(id))) {
      exposure = "complete";
      instructionCompletedAt = input.occurredAt;
    }
    if (stage === "unseen") stage = "learning";
  } else if (input.type === "self_check_attempt") {
    if (input.outcome === "pass" && exposure === "complete") stage = "guided";
  } else if (input.type === "guided_attempt") {
    if (!["guided", "learning"].includes(stage)) throw new Error("当前阶段不能提交引导练习");
    stage = input.outcome === "incomplete" ? "guided" : "independent_ready";
    level = competenceRank[level] < competenceRank.guided_only ? "guided_only" : level;
  } else if (input.type === "challenge_attempt") {
    if (hintsUsed.length > 0 || input.confidence == null) throw new Error("Challenge 必须无提示并记录信心");
    competenceEligible = input.outcome === "pass";
    if (input.outcome === "pass") {
      stage = "review_eligible";
      level = competenceRank[level] < competenceRank.independent_once ? "independent_once" : level;
      dueAt = addDays(input.occurredAt, unit.delayedReviewPlan.find((plan) => plan.role === "review")?.afterDays ?? 3);
    } else {
      stage = "learning";
    }
  } else if (input.type === "independent_attempt") {
    if (stage !== "independent_ready") throw new Error("尚未进入独立练习阶段");
    if (hintsUsed.length > 0 || input.confidence == null) throw new Error("独立练习必须无提示并记录信心");
    competenceEligible = input.outcome === "pass";
    if (input.outcome === "pass") {
      stage = "review_eligible";
      level = competenceRank[level] < competenceRank.independent_once ? "independent_once" : level;
      dueAt = addDays(input.occurredAt, unit.delayedReviewPlan.find((plan) => plan.role === "review")?.afterDays ?? 3);
    } else if (input.highConfidenceConceptualError) {
      stage = "guided";
    }
  } else if (input.type === "retrieval_attempt") {
    if (stage !== "review_eligible" || !base.dueAt || Date.parse(input.occurredAt) < Date.parse(base.dueAt)) throw new Error("延迟复习尚未到期");
    competenceEligible = input.outcome === "pass";
    if (input.outcome === "pass") {
      stage = "consolidating";
      level = competenceRank[level] < competenceRank.retained ? "retained" : level;
      dueAt = addDays(input.occurredAt, unit.delayedReviewPlan.find((plan) => plan.role === "far_transfer")?.afterDays ?? 14);
    } else stage = "independent_ready";
  } else if (input.type === "variant_attempt" || input.type === "far_transfer_attempt") {
    if (!['consolidating', 'transferable'].includes(stage)) throw new Error("当前阶段不能记录迁移证据");
    if (stage === "consolidating" && (!base.dueAt || Date.parse(input.occurredAt) < Date.parse(base.dueAt))) throw new Error("远迁移练习尚未到期");
    competenceEligible = input.outcome === "pass";
    if (input.type === "far_transfer_attempt" && input.outcome === "pass") {
      stage = "transferable";
      level = "transferred";
      dueAt = addDays(input.occurredAt, 21);
    } else if (input.outcome !== "pass" && stage === "transferable") {
      stage = "consolidating";
      level = "retained";
    }
  }

  const evidenceEventIds = competenceEligible ? [...new Set([...base.competence.evidenceEventIds, input.id])] : base.competence.evidenceEventIds;
  const state: LearnerUnitStateV1 = {
    ...base,
    stage,
    instruction: { exposure, completedBlockIds, instructionCompletedAt },
    competence: { level, evidenceEventIds, lastDemonstratedAt: competenceEligible ? input.occurredAt : base.competence.lastDemonstratedAt },
    selectedMode: input.mode,
    activeThreadStartedAt: ["learning", "guided", "independent_ready"].includes(stage) ? (base.activeThreadStartedAt ?? input.occurredAt) : undefined,
    dueAt,
    lastActivityAt: input.occurredAt,
    updatedAt: input.occurredAt,
  };
  const event: LearningEventV1 = {
    schemaVersion: 1,
    id: input.id,
    unitId: unit.id,
    unitRevision: unit.revision,
    unitHash: unit.contentHash,
    type: input.type,
    mode: input.mode,
    occurredAt: input.occurredAt,
    asset: input.asset ? structuredClone(input.asset) : undefined,
    response: input.response ? structuredClone(input.response) : undefined,
    outcome: input.outcome,
    score: input.score,
    confidence: input.confidence,
    hintsUsed,
    competenceEligible,
    resultingStage: stage,
  };
  return { state, event };
}
