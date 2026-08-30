import type { AppStateData, DailyTask } from "../domain/types";
import type { LearningActivityType, LearningStage, TodayLearningTaskV1 } from "../domain/learningKernel";
import { learningUnits, practiceAssetBindings, prerequisiteEdges } from "../data/learningUnits";
import { canStartUnit } from "./learningKernelEngine";

export interface PrioritySignals {
  weakness: number;
  projectRelevance: number;
  frontierValue: number;
  reviewDue: number;
  misconception?: number;
}

// Compatibility helper for historical callers. Kernel scheduling uses the
// auditable five-signal formula below after state and prerequisite gates.
export function calculatePriority(signals: PrioritySignals, weights = { weakness: 0.30, projectRelevance: 0.25, frontierValue: 0.15, reviewDue: 0.15, misconception: 0.15 }): number {
  return Number((weights.weakness * signals.weakness
    + weights.projectRelevance * signals.projectRelevance
    + weights.frontierValue * signals.frontierValue
    + weights.reviewDue * signals.reviewDue
    + weights.misconception * (signals.misconception ?? 0)).toFixed(4));
}

const relevance = (text: string, state: AppStateData): number => {
  if (state.projects.length === 0 && state.onboarding.interests.length === 0) return 0.35;
  const haystack = `${state.projects.map((project) => `${project.disease} ${project.studyType} ${project.omics} ${project.activeMethods} ${project.scientificQuestion}`).join(" ")} ${state.onboarding.interests.join(" ")}`.toLowerCase();
  const terms = text.toLowerCase().split(/[\s,，、/]+/).filter((term) => term.length >= 2);
  return Math.min(1, 0.25 + terms.filter((term) => haystack.includes(term)).length * 0.18);
};

const legalActivity = (stage: LearningStage, dueAt: string | undefined, now: Date): LearningActivityType | undefined => {
  if (stage === "unseen" || stage === "learning") return "explanation";
  if (stage === "guided") return "guided_practice";
  if (stage === "independent_ready") return "independent_case";
  if (stage === "review_eligible") return dueAt && Date.parse(dueAt) <= now.getTime() ? "delayed_retrieval" : undefined;
  if (stage === "consolidating") return dueAt && Date.parse(dueAt) <= now.getTime() ? "variant_retrieval" : undefined;
  return "far_transfer";
};

export function generateLearningTodayTasks(state: AppStateData, now = new Date()): TodayLearningTaskV1[] {
  const paused = new Set(state.pausedLearningUnitIds);
  const activeCount = state.learnerUnitStates.filter((item) => ["learning", "guided", "independent_ready"].includes(item.stage) && !paused.has(item.unitId)).length;
  const candidates: TodayLearningTaskV1[] = [];
  for (const unit of learningUnits) {
    if (unit.lifecycle !== "active" || unit.verificationStatus !== "verified" || paused.has(unit.id)) continue;
    const learner = state.learnerUnitStates.find((item) => item.unitId === unit.id);
    const stage = learner?.stage ?? "unseen";
    if (stage === "unseen") {
      const gate = canStartUnit({ unitId: unit.id, states: state.learnerUnitStates, edges: prerequisiteEdges, pausedUnitIds: paused });
      if (!gate.allowed || activeCount >= 2) continue;
    }
    const activityType = legalActivity(stage, learner?.dueAt, now);
    if (!activityType) continue;
    const dueRisk = learner?.dueAt && Date.parse(learner.dueAt) <= now.getTime()
      ? Math.min(1, 0.7 + ((now.getTime() - Date.parse(learner.dueAt)) / 86_400_000) * 0.05)
      : 0;
    const signals = {
      dueRisk,
      activeThreadContinuity: ["learning", "guided", "independent_ready"].includes(stage) ? 1 : 0,
      misconceptionRisk: Math.min(1, (learner?.misconceptionIds.length ?? 0) * 0.35),
      prerequisiteUnlockValue: prerequisiteEdges.some((edge) => edge.fromUnitId === unit.id) ? 1 : 0.2,
      projectRelevance: relevance(`${unit.titleCn} ${unit.projectRelevanceTerms.join(" ")}`, state),
    };
    const priority = Number((signals.dueRisk * 0.30 + signals.activeThreadContinuity * 0.25 + signals.misconceptionRisk * 0.20 + signals.prerequisiteUnlockValue * 0.15 + signals.projectRelevance * 0.10).toFixed(4));
    const bindingRole = activityType === "guided_practice" ? "guided" : activityType === "independent_case" ? "independent" : activityType === "delayed_retrieval" ? "review" : activityType === "far_transfer" ? "far_transfer" : "worked";
    const bindingId = practiceAssetBindings.find((binding) => binding.unitId === unit.id && binding.role === bindingRole)?.id;
    candidates.push({
      id: `${now.toISOString().slice(0, 10)}-learning-${unit.id}-${activityType}`,
      unitId: unit.id,
      unitRevision: unit.revision,
      stageAtScheduling: stage,
      activityType,
      bindingId,
      estimatedMinutes: activityType === "explanation" ? unit.estimatedMinutes : Math.min(8, unit.estimatedMinutes),
      priority,
      prioritySignals: signals,
      rationaleCn: dueRisk > 0 ? "已到期，优先完成延迟提取" : stage === "unseen" ? "前置条件已满足，从讲解开始" : "延续已经开始的学习主题",
    });
  }
  return candidates.sort((a, b) => b.priority - a.priority
    || learningUnits.find((unit) => unit.id === a.unitId)!.curriculumOrder - learningUnits.find((unit) => unit.id === b.unitId)!.curriculumOrder
    || a.id.localeCompare(b.id));
}

export function generateTodayTasks(state: AppStateData, now = new Date()): DailyTask[] {
  const dateKey = now.toISOString().slice(0, 10);
  let usedMinutes = 0;
  const result: DailyTask[] = [];
  for (const task of generateLearningTodayTasks(state, now)) {
    if (usedMinutes > 0 && usedMinutes + task.estimatedMinutes > state.settings.dailyMinutes) continue;
    const unit = learningUnits.find((item) => item.id === task.unitId)!;
    const daily: DailyTask = {
      id: task.id,
      type: "learning",
      title: unit.titleCn,
      subtitle: task.activityType === "explanation" ? "先建立直觉，再进入定义与案例"
        : task.activityType === "guided_practice" ? "带着分层提示练习，不计作独立能力"
          : task.activityType === "independent_case" ? "撤除提示后独立判断，并记录信心"
            : task.activityType === "delayed_retrieval" ? "到期提取：先回忆，再看反馈"
              : task.activityType === "far_transfer" ? "把原则迁移到陌生论文或项目" : "间隔变式复习",
      minutes: task.estimatedMinutes,
      priority: task.priority,
      targetId: task.unitId,
      destination: "learning",
      rationale: task.rationaleCn,
      learningActivityType: task.activityType,
      stageAtScheduling: task.stageAtScheduling,
    };
    if (!state.completedTaskIds.includes(daily.id)
      && !state.completedTaskIds.includes(`target:${dateKey}:${daily.targetId}`)
      && !state.snoozedTaskIds.includes(daily.id)) {
      result.push(daily);
      usedMinutes += daily.minutes;
    }
  }
  return result;
}
