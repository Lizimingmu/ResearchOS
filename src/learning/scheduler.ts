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
}

export function calculatePriority(signals: PrioritySignals, weights = { weakness: 0.35, projectRelevance: 0.30, frontierValue: 0.20, reviewDue: 0.15 }): number {
  return Number((
    weights.weakness * signals.weakness +
    weights.projectRelevance * signals.projectRelevance +
    weights.frontierValue * signals.frontierValue +
    weights.reviewDue * signals.reviewDue
  ).toFixed(4));
}

const relevance = (text: string, state: AppStateData): number => {
  if (state.projects.length === 0) return 0.35;
  const haystack = state.projects.map((project) => `${project.disease} ${project.studyType} ${project.omics} ${project.activeMethods} ${project.scientificQuestion}`).join(" ").toLowerCase();
  const terms = text.toLowerCase().split(/\W+/).filter((term) => term.length > 4);
  return Math.min(1, 0.25 + terms.filter((term) => haystack.includes(term)).length * 0.18);
};

export function generateTodayTasks(state: AppStateData, now = new Date()): DailyTask[] {
  const dateKey = now.toISOString().slice(0, 10);
  const weights = state.settings.weights;
  const due = state.reviewItems.filter((item) => isReviewDue(item, now));
  const dangerous = due.find((item) => item.dangerousMisconception) ?? due[0];
  const responseScores = new Map(state.skillEvidence.map((evidence) => [evidence.taskId, evidence.score]));
  const methodSeed = usableMethodConcepts
    .map((concept) => ({ concept, score: responseScores.get(concept.id) ?? 0.45 }))
    .sort((a, b) => a.score - b.score)[0]?.concept ?? usableMethodConcepts[0];
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
      priority: calculatePriority({ weakness: dangerous?.dangerousMisconception ? 1 : 0.65, projectRelevance: relevance(reviewTarget, state), frontierValue: 0.35, reviewDue: dangerous ? 1 : 0.4 }, weights),
    },
    {
      id: `${dateKey}-paper-skeleton`, type: "paper", title: "Reconstruct the evidence chain", subtitle: "Paper skeleton — assign each figure an evidence job", minutes: 12,
      targetId: state.papers.find((paper) => paper.trainingStatus === "active")?.id ?? state.papers[0]?.id ?? "paper-empty", destination: "paper-lab", rationale: "Pattern recognition and claim–evidence calibration",
      priority: calculatePriority({ weakness: 0.65, projectRelevance: relevance("paper evidence figure", state), frontierValue: 0.7, reviewDue: 0.3 }, weights),
    },
    {
      id: `${dateKey}-method-${methodSeed.id}`, type: "method", title: methodSeed.title, subtitle: `${methodSeed.domain} method bite — attempt before explanation`, minutes: methodSeed.minutes,
      targetId: methodSeed.id, destination: "methods", rationale: "Lowest recent evidence or high-value foundation",
      priority: calculatePriority({ weakness: 0.8, projectRelevance: relevance(`${methodSeed.title} ${methodSeed.tags.join(" ")}`, state), frontierValue: 0.55, reviewDue: 0.35 }, weights),
    },
    {
      id: `${dateKey}-audit-${auditSeed.id}`, type: "audit", title: auditSeed.title, subtitle: "Approve, question, or reject each AI step", minutes: 10,
      targetId: auditSeed.id, destination: "ai-audit", rationale: "Active AI oversight practice",
      priority: calculatePriority({ weakness: 0.7, projectRelevance: relevance(`${auditSeed.domain} ${auditSeed.task}`, state), frontierValue: 0.75, reviewDue: 0.25 }, weights),
    },
    {
      id: `${dateKey}-transfer`, type: "transfer", title: "Apply one principle to your project", subtitle: state.projects.length ? `Use ${state.projects[0].name} as context` : "Create a project context or write a portable action", minutes: 5,
      targetId: state.projects[0]?.id ?? "unbound-transfer", destination: state.projects.length ? "projects" : "projects", rationale: "Transfer is required for mastery",
      priority: calculatePriority({ weakness: 0.6, projectRelevance: state.projects.length ? 1 : 0.45, frontierValue: 0.4, reviewDue: 0.2 }, weights),
    },
  ];
  return tasks.filter((task) => !state.completedTaskIds.includes(task.id) && !state.snoozedTaskIds.includes(task.id));
}

