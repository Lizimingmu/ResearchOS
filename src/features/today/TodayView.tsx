import { ArrowRight, BookOpen, Brain, CalendarDays, CheckCircle2, Lightbulb, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ThinkBeforeAi } from "../../components/ThinkBeforeAi";
import { learningContentRegistry } from "../../data/learningArchitecture";
import type { DailyTask } from "../../domain/types";
import { generateTodayTasks } from "../../learning/scheduler";
import { useAppStore } from "../../state/store";

export function TodayView() {
  const state = useAppStore(useShallow((s) => ({ schemaVersion: s.schemaVersion, knowledgeWorkspace: s.knowledgeWorkspace, papers: s.papers, projects: s.projects, responses: s.responses, reviewItems: s.reviewItems, reviewLogs: s.reviewLogs, skillEvidence: s.skillEvidence, providers: s.providers, settings: s.settings, completedTaskIds: s.completedTaskIds, snoozedTaskIds: s.snoozedTaskIds, assessmentHistory: s.assessmentHistory, notesByPaperId: s.notesByPaperId, draftResponses: s.draftResponses, misconceptions: s.misconceptions, onboarding: s.onboarding, problemAtlasSources: s.problemAtlasSources, problemAtlasClaims: s.problemAtlasClaims, problemCards: s.problemCards, diagnosticCauses: s.diagnosticCauses, diagnosticChecks: s.diagnosticChecks, diagnosticPaths: s.diagnosticPaths, diagnosticEvidence: s.diagnosticEvidence, problemTrainingCases: s.problemTrainingCases, diagnosticSessions: s.diagnosticSessions, sourcePackImports: s.sourcePackImports, problemSearchLog: s.problemSearchLog, personalContent: s.personalContent, contentRevisionHistory: s.contentRevisionHistory, contentConflicts: s.contentConflicts, learnerUnitStates: s.learnerUnitStates, learningEvents: s.learningEvents, pausedLearningUnitIds: s.pausedLearningUnitIds, lessonProgressByUnitId: s.lessonProgressByUnitId, learningContentProgress: s.learningContentProgress, routineSettings: s.routineSettings, routineLogs: s.routineLogs, reasoningRecords: s.reasoningRecords, paperCards: s.paperCards, guideReadSectionIds: s.guideReadSectionIds, caseSessions: s.caseSessions, transferArtifacts: s.transferArtifacts, projectStudioRecords: s.projectStudioRecords, obsidianConnection: s.obsidianConnection, obsidianPublishBatches: s.obsidianPublishBatches })));
  const setView = useAppStore((s) => s.setView), openLearningContentTask = useAppStore((s) => s.openLearningContentTask), selectPaper = useAppStore((s) => s.selectPaper), recordRoutine = useAppStore((s) => s.recordRoutine);
  const [thinking, setThinking] = useState(false);
  const tasks = generateTodayTasks(state);
  const due = tasks.find((task) => task.learningActivityType === "delayed_retrieval");
  const foundation = tasks.find((task) => task.learningThread === "foundation" && task.learningActivityType !== "delayed_retrieval");
  const overlay = tasks.find((task) => task.learningThread === "project_overlay" && task.learningActivityType !== "delayed_retrieval");
  const weekAgo = Date.now() - 7 * 86_400_000;
  const weekLogs = state.routineLogs.filter((item) => Date.parse(item.occurredAt) >= weekAgo);
  const paperCount = new Set(weekLogs.filter((item) => item.routineType === "paper_reading" && item.status === "completed" && item.paperId).map((item) => item.paperId)).size;
  const start = (task: DailyTask) => {
    const entry = task.learningContentId ? learningContentRegistry.find((item) => item.id === task.learningContentId) : undefined;
    if (entry) openLearningContentTask({ contentId: entry.id, activityType: task.learningActivityType });
    else setView(task.destination);
  };
  const taskCard = (task: DailyTask | undefined, emptyTitle: string, emptyBody: string) => task ? <><h2>{task.title}</h2><p>{task.subtitle}</p><div className="recommendation-why"><strong>为什么今天学这个</strong><span>{task.rationale}</span></div><button className="primary" onClick={() => start(task)}>继续今天学习 <ArrowRight/></button></> : <div className="empty-state"><h2>{emptyTitle}</h2><p>{emptyBody}</p><button onClick={() => setView("learning")}><RotateCcw/> 打开学习</button></div>;
  return <div className="page today-plan"><header className="page-header today-header"><div><span className="eyebrow">Today's Research Training Plan</span><h1>今天推进一个真正的科研认知步骤</h1><p>Thread A 打基础；Thread B 只在授权的真实项目相关时出现。</p></div><div className="today-date"><CalendarDays/><span>{new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", weekday: "short" }).format(new Date())}</span></div></header>
    <div className="today-plan-grid"><section className="today-core"><span className="plan-label">A · Foundation Thread</span>{taskCard(foundation, "基础主线暂时完成", "可以等待到期复习，或打开 Learn 查看状态。")}</section>
      <section className="today-core"><span className="plan-label">B · Project Overlay</span>{overlay ? taskCard(overlay, "", "") : <div className="empty-state"><h2>今天没有项目叠加项</h2><p>未授权读取项目相关性、没有匹配项目，或先修能力尚未建立时，Overlay 不会出现。</p></div>}</section>
      <section className="today-review"><span className="plan-label">C · Due Review</span>{due ? <><Brain/><h2>{due.title}</h2><p>{due.subtitle}</p><button onClick={() => start(due)}>开始到期复习</button></> : <><CheckCircle2/><h2>今天没有到期复习</h2><p>未到期不是落后；间隔本身是学习设计的一部分。</p></>}</section>
      <section className="today-routine"><span className="plan-label">D · Research Routine</span><Lightbulb/><h2>AI 前先独立思考一次</h2><p>本周深读论文 {paperCount} / {state.routineSettings.weeklyPapers}。行为反馈不使用 streak 或惩罚性逾期。</p><div><button onClick={() => setThinking(true)}>Think Before AI</button><button onClick={() => state.papers[0] && selectPaper(state.papers[0].id)}><BookOpen/> 本周论文</button><button className="subtle" onClick={() => recordRoutine({ routineType: "project_reflection", status: "partially_completed", projectId: state.projects[0]?.id })}>记录部分完成</button><button className="subtle" onClick={() => recordRoutine({ routineType: "project_reflection", status: "skipped", projectId: state.projects[0]?.id })}>今天跳过</button></div></section></div>
    {thinking && <ThinkBeforeAi source="today" projectId={state.projects[0]?.id} onClose={() => setThinking(false)}/>}</div>;
}
