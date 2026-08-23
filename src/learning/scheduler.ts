import type { AppStateData, DailyTask } from "../domain/types";
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

  const tasks: DailyTask[] = [
    {
      id: `${dateKey}-retrieval-${reviewTarget}`,
      type: "retrieval",
      title: dangerous ? dangerous.prompt : cardSeed.title,
      subtitle: dangerous?.dangerousMisconception ? "High-confidence error — retrieve before reference" : "Delayed retrieval from a judgment case",
      minutes: 5,
      targetId: reviewTarget,
      destination: "review",
      rationale: dangerous ? "Due review with elevated misconception risk" : "Core retrieval calibration",
      priority: calculatePriority({ weakness: dangerous?.dangerousMisconception ? 1 : 0.65, projectRelevance: relevance(reviewTarget, state), frontierValue: 0.35, reviewDue: dangerous ? 1 : 0.4, misconception: dangerous?.misconceptionId ? 1 : 0 }, weights),
    },
    {
      id: `${dateKey}-paper-skeleton`, type: "paper", title: "Reconstruct the evidence chain", subtitle: "Paper skeleton — assign each figure an evidence job", minutes: 12,
      targetId: state.papers.find((paper) => paper.trainingStatus === "active")?.id ?? state.papers[0]?.id ?? "paper-empty", destination: "paper-lab", rationale: "Pattern recognition and claim–evidence calibration",
      priority: calculatePriority({ weakness: 0.65, projectRelevance: relevance("paper evidence figure", state), frontierValue: 0.7, reviewDue: 0.3, misconception: unresolved.some((item) => item.conceptType === "paper") ? 0.8 : 0 }, weights),
    },
    {
      id: `${dateKey}-method-${methodSeed.id}`, type: "method", title: methodSeed.title, subtitle: `${methodSeed.domain} method bite — attempt before explanation`, minutes: methodSeed.minutes,
      targetId: methodSeed.id, destination: "methods", rationale: "Lowest recent evidence or high-value foundation",
      priority: calculatePriority({ weakness: 1 - (responseScores.get(methodSeed.id) ?? 0.45), projectRelevance: relevance(`${methodSeed.title} ${methodSeed.tags.join(" ")}`, state), frontierValue: methodSeed.difficulty === "frontier" ? 0.9 : 0.55, reviewDue: 0.35, misconception: unresolved.some((item) => item.conceptId === methodSeed.id) ? 1 : 0 }, weights),
    },
    {
      id: `${dateKey}-audit-${auditSeed.id}`, type: "audit", title: auditSeed.title, subtitle: "Approve, question, or reject each AI step", minutes: 10,
      targetId: auditSeed.id, destination: "ai-audit", rationale: "Active AI oversight practice",
      priority: calculatePriority({ weakness: 0.7, projectRelevance: relevance(`${auditSeed.domain} ${auditSeed.task}`, state), frontierValue: 0.75, reviewDue: 0.25, misconception: unresolved.some((item) => item.conceptType === "audit") ? 0.8 : 0 }, weights),
    },
    {
      id: `${dateKey}-transfer`, type: "transfer", title: "Apply one principle to your project", subtitle: state.projects.length ? `Use ${state.projects[0].name} as context` : "Create a project context or write a portable action", minutes: 5,
      targetId: state.projects[0]?.id ?? "unbound-transfer", destination: state.projects.length ? "projects" : "projects", rationale: "Transfer is required for mastery",
      priority: calculatePriority({ weakness: 0.6, projectRelevance: state.projects.length ? 1 : 0.45, frontierValue: 0.4, reviewDue: 0.2, misconception: 0 }, weights),
    },
  ];
  return tasks.filter((task) => !state.completedTaskIds.includes(task.id)
    && !state.completedTaskIds.includes(`target:${dateKey}:${task.targetId}`)
    && !state.snoozedTaskIds.includes(task.id));
}
