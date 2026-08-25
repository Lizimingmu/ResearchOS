import type { AppStateData, DailyTask } from "../domain/types";
import { bilingualMethodTitle } from "../i18n/researchTerms";
import { bilingualAuditTitle } from "../i18n/scientificContent";
import { auditCases } from "../data/auditCases";
import { judgmentCards } from "../data/judgmentCards";
import { usableMethodConcepts } from "../data/methods";
import { isReviewDue } from "./review";

export interface PrioritySignals {
  weakness: number;
  projectRelevance: number;
  frontierValue: number;
  reviewDue: number;
  misconception?: number;
}

export function calculatePriority(signals: PrioritySignals, weights = { weakness: 0.30, projectRelevance: 0.25, frontierValue: 0.15, reviewDue: 0.15, misconception: 0.15 }): number {
  return Number((
    weights.weakness * signals.weakness +
    weights.projectRelevance * signals.projectRelevance +
    weights.frontierValue * signals.frontierValue +
    weights.reviewDue * signals.reviewDue +
    weights.misconception * (signals.misconception ?? 0)
  ).toFixed(4));
}

const relevance = (text: string, state: AppStateData): number => {
  if (state.projects.length === 0 && state.onboarding.interests.length === 0) return 0.35;
  const haystack = `${state.projects.map((project) => `${project.disease} ${project.studyType} ${project.omics} ${project.activeMethods} ${project.scientificQuestion}`).join(" ")} ${state.onboarding.interests.join(" ")}`.toLowerCase();
  const terms = text.toLowerCase().split(/\W+/).filter((term) => term.length > 4);
  return Math.min(1, 0.25 + terms.filter((term) => haystack.includes(term)).length * 0.18);
};

export function generateTodayTasks(state: AppStateData, now = new Date()): DailyTask[] {
  const dateKey = now.toISOString().slice(0, 10);
  const weights = state.settings.weights;
  const due = state.reviewItems.filter((item) => isReviewDue(item, now));
  const unresolved = state.misconceptions.filter((item) => item.status !== "resolved");
  const dangerous = due.find((item) => item.misconceptionId && unresolved.some((entry) => entry.id === item.misconceptionId))
    ?? due.find((item) => item.dangerousMisconception)
    ?? due[0];
  const responseScores = new Map<string, number>();
  for (const evidence of state.skillEvidence) {
    const previous = responseScores.get(evidence.taskId);
    responseScores.set(evidence.taskId, previous === undefined ? evidence.score : previous * 0.65 + evidence.score * 0.35);
  }
  const newDomains = Object.values(state.onboarding.familiarity).filter((level) => level === "new").length;
  const difficultyCycle = state.skillEvidence.length < 6
    ? (newDomains >= 2 ? "foundation" : "intermediate")
    : (["foundation", "intermediate", "advanced", "frontier"] as const)[Math.floor(now.getDate() / 2) % 4];
  const methodSeed = usableMethodConcepts
    .map((concept) => {
      const score = responseScores.get(concept.id) ?? 0.45;
      const misconception = unresolved.some((item) => item.conceptId === concept.id) ? 1 : 0;
      const difficultyMatch = concept.difficulty === difficultyCycle ? 0.12 : 0;
      const priority = (1 - score) * 0.55 + relevance(`${concept.title} ${concept.tags.join(" ")}`, state) * 0.25 + misconception * 0.2 + difficultyMatch;
      return { concept, priority };
    })
    .sort((a, b) => b.priority - a.priority)[0]?.concept ?? usableMethodConcepts[0];
  const cardSeed = judgmentCards[(now.getDate() - 1) % judgmentCards.length];
  const auditSeed = auditCases[(now.getDate() - 1) % auditCases.length];
  const reviewTarget = dangerous?.conceptId ?? cardSeed.id;
  const problemPool = state.problemCards;
  const problemSeed = problemPool
    .map((problem) => {
      const score = responseScores.get(problem.id) ?? 0.45;
      const misconception = unresolved.some((item) => item.conceptId === problem.id) ? 1 : 0;
      const priority = (1 - score) * 0.55 + relevance(`${problem.titleCn} ${problem.keywords.join(" ")}`, state) * 0.25 + misconception * 0.2;
      return { problem, priority };
    })
    .sort((a, b) => b.priority - a.priority)[0]?.problem;

  const tasks: DailyTask[] = [
    {
      id: `${dateKey}-retrieval-${reviewTarget}`,
      type: "retrieval",
      title: dangerous ? dangerous.prompt : cardSeed.title,
      subtitle: dangerous?.dangerousMisconception ? "高信心错误——查看参考前先进行提取" : "判断案例的延迟提取练习",
      minutes: 5,
      targetId: reviewTarget,
      destination: "review",
      rationale: dangerous ? "到期复习，错误观念风险较高" : "核心提取校准",
      priority: calculatePriority({ weakness: dangerous?.dangerousMisconception ? 1 : 0.65, projectRelevance: relevance(reviewTarget, state), frontierValue: 0.35, reviewDue: dangerous ? 1 : 0.4, misconception: dangerous?.misconceptionId ? 1 : 0 }, weights),
    },
    {
      id: `${dateKey}-paper-skeleton`, type: "paper", title: "重建证据链", subtitle: "论文骨架——为每张图明确证据任务", minutes: 12,
      targetId: state.papers.find((paper) => paper.trainingStatus === "active")?.id ?? state.papers[0]?.id ?? "paper-empty", destination: "paper-lab", rationale: "模式识别与主张—证据校准",
      priority: calculatePriority({ weakness: 0.65, projectRelevance: relevance("paper evidence figure", state), frontierValue: 0.7, reviewDue: 0.3, misconception: unresolved.some((item) => item.conceptType === "paper") ? 0.8 : 0 }, weights),
    },
    {
      id: `${dateKey}-method-${methodSeed.id}`, type: "method", title: bilingualMethodTitle(methodSeed.id, methodSeed.title), subtitle: `${methodSeed.domain === "statistics" ? "统计学" : methodSeed.domain === "clinical" ? "临床研究" : methodSeed.domain === "prediction" ? "预测模型" : methodSeed.domain === "single-cell" ? "单细胞" : "组学"}方法训练——先判断，再查看解释`, minutes: methodSeed.minutes,
      targetId: methodSeed.id, destination: "methods", rationale: "近期证据最弱项或高价值基础方法",
      priority: calculatePriority({ weakness: 1 - (responseScores.get(methodSeed.id) ?? 0.45), projectRelevance: relevance(`${methodSeed.title} ${methodSeed.tags.join(" ")}`, state), frontierValue: methodSeed.difficulty === "frontier" ? 0.9 : 0.55, reviewDue: 0.35, misconception: unresolved.some((item) => item.conceptId === methodSeed.id) ? 1 : 0 }, weights),
    },
    {
      id: `${dateKey}-audit-${auditSeed.id}`, type: "audit", title: bilingualAuditTitle(auditSeed), subtitle: "逐步判断 AI 方案是否合理、需要核查或存在问题", minutes: 10,
      targetId: auditSeed.id, destination: "ai-audit", rationale: "主动 AI 监督训练",
      priority: calculatePriority({ weakness: 0.7, projectRelevance: relevance(`${auditSeed.domain} ${auditSeed.task}`, state), frontierValue: 0.75, reviewDue: 0.25, misconception: unresolved.some((item) => item.conceptType === "audit") ? 0.8 : 0 }, weights),
    },
    ...(problemSeed ? [{
      id: `${dateKey}-problem-${problemSeed.id}`, type: "problem" as const, title: `${problemSeed.titleCn}（${problemSeed.titleEn}）`, subtitle: "科研问题库——先给出诊断，再揭示证据", minutes: 5,
      targetId: problemSeed.id, destination: "problem-atlas" as const, rationale: "问题库最多安排一个新问题任务，且不会挤掉到期复习",
      priority: calculatePriority({ weakness: 1 - (responseScores.get(problemSeed.id) ?? 0.45), projectRelevance: relevance(`${problemSeed.titleCn} ${problemSeed.keywords.join(" ")}`, state), frontierValue: 0.5, reviewDue: 0.3, misconception: unresolved.some((item) => item.conceptId === problemSeed.id) ? 1 : 0 }, weights),
    }] : []),
    {
      id: `${dateKey}-transfer`, type: "transfer", title: "把一项原则应用到你的项目", subtitle: state.projects.length ? `以 ${state.projects[0].name} 为情境` : "创建项目情境，或写出可迁移的行动", minutes: 5,
      targetId: state.projects[0]?.id ?? "unbound-transfer", destination: state.projects.length ? "projects" : "projects", rationale: "真正掌握需要完成迁移",
      priority: calculatePriority({ weakness: 0.6, projectRelevance: state.projects.length ? 1 : 0.45, frontierValue: 0.4, reviewDue: 0.2, misconception: 0 }, weights),
    },
  ];
  return tasks.filter((task) => !state.completedTaskIds.includes(task.id)
    && !state.completedTaskIds.includes(`target:${dateKey}:${task.targetId}`)
    && !state.snoozedTaskIds.includes(task.id));
}
