import type { AppStateData, DailyTask } from "../domain/types";
import type { LearningActivityType, LearningStage, TodayLearningTaskV1 } from "../domain/learningKernel";
import { learningUnits, practiceAssetBindings, prerequisiteEdges } from "../data/learningUnits";
import { learningContentRegistry } from "../data/learningArchitecture";
import { canStartUnit } from "./learningKernelEngine";
import { contentPrerequisitesMet } from "./learningArchitectureEngine";
import { createKnowledgeLearningGate } from "../services/knowledge";

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
  if (state.onboarding.allowProjectRelevance === false) return 0;
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
  if (stage === "consolidating") return dueAt && Date.parse(dueAt) <= now.getTime() ? "far_transfer" : undefined;
  if (stage === "transferable") return dueAt && Date.parse(dueAt) <= now.getTime() ? "variant_retrieval" : undefined;
  return undefined;
};

export function generateLearningTodayTasks(state: AppStateData, now = new Date()): TodayLearningTaskV1[] {
  const knowledgeAllowed = createKnowledgeLearningGate(state.knowledgeWorkspace);
  const paused = new Set(state.pausedLearningUnitIds);
  const activeCount = state.learnerUnitStates.filter((item) => ["learning", "guided", "independent_ready"].includes(item.stage) && !paused.has(item.unitId)).length;
  const candidates: TodayLearningTaskV1[] = [];
  for (const unit of learningUnits) {
    if (!knowledgeAllowed(unit.id)) continue;
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
    const bindingRole = activityType === "guided_practice" ? "guided" : activityType === "independent_case" ? "independent" : activityType === "delayed_retrieval" || activityType === "variant_retrieval" ? "review" : activityType === "far_transfer" ? "far_transfer" : "worked";
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
  return generateM018CurriculumTasks(state, now);
}

const architectureProjectRelevance = (terms: string[], state: AppStateData): number => {
  // Consent is checked before project strings are read.
  if (state.onboarding.allowProjectRelevance === false) return 0;
  if (state.projects.length === 0) return 0;
  const haystack = state.projects.map((project) => `${project.disease} ${project.studyType} ${project.omics} ${project.outcome} ${project.activeMethods} ${project.scientificQuestion}`).join(" ").toLowerCase();
  const hits = terms.filter((term) => haystack.includes(term.toLowerCase())).length;
  return Math.min(1, hits * 0.25);
};

export function generateM018CurriculumTasks(state: AppStateData, now = new Date()): DailyTask[] {
  const knowledgeAllowed = createKnowledgeLearningGate(state.knowledgeWorkspace);
  const dateKey = now.toISOString().slice(0, 10);
  const result: DailyTask[] = [];
  const contentProgressById = state.learningContentProgress ?? {};
  const progress = Object.values(contentProgressById);
  const candidates = learningContentRegistry.filter((entry) => entry.lifecycle === "active" && entry.verificationStatus === "verified" && ["concept_lesson", "method_lesson", "case_lab"].includes(entry.contentType)
    && knowledgeAllowed(entry.id)
    && (!entry.unitId || knowledgeAllowed(entry.unitId)));
  const stateFor = (unitId?: string) => unitId ? state.learnerUnitStates.find((item) => item.unitId === unitId) : undefined;
  const add = (entry: (typeof candidates)[number], activityType: DailyTask["learningActivityType"], thread: "foundation" | "project_overlay", priority: number, rationale: string) => {
    const learner = stateFor(entry.unitId);
    const daily: DailyTask = {
      id: `${dateKey}-m018-${entry.id}-${activityType}`,
      type: "learning",
      title: entry.titleCn,
      subtitle: entry.contentType === "case_lab" ? "分阶段锁定判断，在专家校准后更新解释并继续揭示证据"
        : activityType === "delayed_retrieval" ? "到期的陌生表面复习：无提示、锁定回答并记录信心"
        : activityType === "independent_case" ? "进入版本化 Apply：先作答，锁定后看反馈"
          : "先建立理解，再用自己的话解释",
      minutes: activityType === "explanation" ? entry.estimatedMinutes : Math.min(8, entry.estimatedMinutes),
      priority,
      targetId: entry.id,
      destination: entry.contentType === "case_lab" ? "case-lab" : "learning",
      rationale,
      learningActivityType: activityType,
      stageAtScheduling: learner?.stage ?? "unseen",
      learningContentId: entry.id,
      learningThread: thread,
    };
    if (!state.completedTaskIds.includes(daily.id) && !state.completedTaskIds.includes(`target:${dateKey}:${entry.id}`) && !state.snoozedTaskIds.includes(daily.id)) result.push(daily);
  };

  const dueEntries = candidates.filter((entry) => entry.contentType !== "case_lab").filter((entry) => {
    const learner = stateFor(entry.unitId);
    return learner?.stage === "review_eligible" && Boolean(learner.dueAt) && Date.parse(learner.dueAt!) <= now.getTime();
  });
  const due = dueEntries.sort((a, b) => Date.parse(stateFor(a.unitId)!.dueAt!) - Date.parse(stateFor(b.unitId)!.dueAt!))[0];
  if (due) add(due, "delayed_retrieval", due.thread === "project_overlay" ? "project_overlay" : "foundation", 1, `${due.rationaleCn}；该内容的间隔复习现已到期。`);

  const available = (entry: (typeof candidates)[number]) => contentPrerequisitesMet(entry, { registry: learningContentRegistry, progress, states: state.learnerUnitStates });
  const unfinished = (entry: (typeof candidates)[number]) => {
    if (entry.contentType === "case_lab") return !(state.caseSessions ?? []).some((session) => session.caseId === entry.id && session.completedAt);
    const learner = stateFor(entry.unitId);
    return !learner || !["independent_once", "retained", "transferred"].includes(learner.competence.level);
  };
  const activityFor = (entry: (typeof candidates)[number]): DailyTask["learningActivityType"] => {
    if (entry.contentType === "case_lab") return "independent_case";
    const contentProgress = contentProgressById[entry.id];
    return contentProgress?.phase === "apply" || contentProgress?.phase === "remediation" ? "independent_case" : "explanation";
  };

  const foundation = candidates.filter((entry) => entry.thread === "foundation" && unfinished(entry) && available(entry))[0];
  if (foundation && foundation.id !== due?.id) add(foundation, activityFor(foundation), "foundation", 0.8, foundation.rationaleCn);

  const overlay = candidates
    .filter((entry) => entry.thread === "project_overlay" && unfinished(entry) && available(entry))
    .map((entry) => ({ entry, relevance: architectureProjectRelevance(entry.projectRelevanceTerms, state) }))
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || a.entry.id.localeCompare(b.entry.id))[0];
  if (overlay && overlay.entry.id !== due?.id) add(overlay.entry, activityFor(overlay.entry), "project_overlay", Number((0.6 + overlay.relevance * 0.2).toFixed(3)), `${overlay.entry.rationaleCn}；与你已授权读取的项目方法/结局元数据相关。`);

  // One Foundation thread plus one Project Overlay thread; a due review is a
  // maintenance task, never a hidden third active learning thread.
  const activeThreads = new Set(result.filter((task) => task.learningActivityType !== "delayed_retrieval").map((task) => task.learningThread));
  if (activeThreads.size > 2) throw new Error("M018 curriculum scheduler exceeded the two-thread limit");
  return result;
}
