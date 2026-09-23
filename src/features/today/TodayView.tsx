import { ArrowRight, BookOpen, Brain, CalendarDays, CheckCircle2, Lightbulb, MessageSquareQuote, RotateCcw, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ThinkBeforeAi } from "../../components/ThinkBeforeAi";
import { learningContentRegistry } from "../../data/learningArchitecture";
import type { DailyTask } from "../../domain/types";
import { generateTodayTasks } from "../../learning/scheduler";
import { useAppStore } from "../../state/store";

export function TodayView() {
  const state = useAppStore(useShallow((s) => ({
    schemaVersion: s.schemaVersion,
    knowledgeWorkspace: s.knowledgeWorkspace,
    papers: s.papers,
    projects: s.projects,
    responses: s.responses,
    reviewItems: s.reviewItems,
    reviewLogs: s.reviewLogs,
    skillEvidence: s.skillEvidence,
    providers: s.providers,
    settings: s.settings,
    completedTaskIds: s.completedTaskIds,
    snoozedTaskIds: s.snoozedTaskIds,
    assessmentHistory: s.assessmentHistory,
    notesByPaperId: s.notesByPaperId,
    draftResponses: s.draftResponses,
    misconceptions: s.misconceptions,
    onboarding: s.onboarding,
    problemAtlasSources: s.problemAtlasSources,
    problemAtlasClaims: s.problemAtlasClaims,
    problemCards: s.problemCards,
    diagnosticCauses: s.diagnosticCauses,
    diagnosticChecks: s.diagnosticChecks,
    diagnosticPaths: s.diagnosticPaths,
    diagnosticEvidence: s.diagnosticEvidence,
    problemTrainingCases: s.problemTrainingCases,
    diagnosticSessions: s.diagnosticSessions,
    sourcePackImports: s.sourcePackImports,
    problemSearchLog: s.problemSearchLog,
    personalContent: s.personalContent,
    contentRevisionHistory: s.contentRevisionHistory,
    contentConflicts: s.contentConflicts,
    learnerUnitStates: s.learnerUnitStates,
    learningEvents: s.learningEvents,
    pausedLearningUnitIds: s.pausedLearningUnitIds,
    lessonProgressByUnitId: s.lessonProgressByUnitId,
    learningContentProgress: s.learningContentProgress,
    routineSettings: s.routineSettings,
    routineLogs: s.routineLogs,
    reasoningRecords: s.reasoningRecords,
    paperCards: s.paperCards,
    guideReadSectionIds: s.guideReadSectionIds,
    caseSessions: s.caseSessions,
    transferArtifacts: s.transferArtifacts,
    projectStudioRecords: s.projectStudioRecords,
    obsidianConnection: s.obsidianConnection,
    obsidianPublishBatches: s.obsidianPublishBatches,
    isPilotMode: s.isPilotMode,
    pilotFeedback: s.pilotFeedback,
  })));

  const setView = useAppStore((s) => s.setView);
  const openLearningContentTask = useAppStore((s) => s.openLearningContentTask);
  const selectPaper = useAppStore((s) => s.selectPaper);
  const recordRoutine = useAppStore((s) => s.recordRoutine);
  const [thinking, setThinking] = useState(false);

  const tasks = generateTodayTasks(state);
  const due = tasks.find((task) => task.learningActivityType === "delayed_retrieval");
  const foundation = tasks.find((task) => task.learningThread === "foundation" && task.learningActivityType !== "delayed_retrieval");
  const overlay = tasks.find((task) => task.learningThread === "project_overlay" && task.learningActivityType !== "delayed_retrieval");

  const start = (task: DailyTask) => {
    const entry = task.learningContentId ? learningContentRegistry.find((item) => item.id === task.learningContentId) : undefined;
    if (entry) openLearningContentTask({ contentId: entry.id, activityType: task.learningActivityType });
    else setView(task.destination);
  };

  const taskCard = (task: DailyTask | undefined, emptyTitle: string, emptyBody: string) =>
    task ? (
      <>
        <h2>{task.title}</h2>
        <p>{task.subtitle}</p>
        <div className="recommendation-why">
          <strong>为什么今天学这个</strong>
          <span>{task.rationale}</span>
        </div>
        <button className="primary" onClick={() => start(task)}>
          继续今天学习 <ArrowRight size={14} />
        </button>
      </>
    ) : (
      <div className="empty-state">
        <h2>{emptyTitle}</h2>
        <p>{emptyBody}</p>
        <button onClick={() => setView("learning")}>
          <RotateCcw size={14} /> 打开学习
        </button>
      </div>
    );

  const feedbackCount = state.pilotFeedback?.length ?? 0;

  return (
    <div className="page today-plan">
      <header className="page-header today-header">
        <div>
          <span className="eyebrow">RESEARCHOS PILOT · TODAY</span>
          <h1>今天推进一个真正的科研认知步骤</h1>
          <p>先判断 → 学习 → 再判断 → 迁移 · 建议用时 30–45 分钟</p>
        </div>
        <div className="today-date">
          <CalendarDays size={14} />
          <span>{new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", weekday: "short" }).format(new Date())}</span>
        </div>
      </header>

      {/* Pilot Mode Welcome & Disclaimer Banner */}
      <section className="pilot-today-banner" style={{ margin: "0 0 20px", padding: "16px 20px", borderRadius: "12px", background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="pilot-badge" style={{ fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px", background: "var(--accent-soft)", color: "var(--accent)" }}>
                试用体验模式
              </span>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>今日目标：完成 1 节核心概念 + 1 个复习/案例</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              <AlertCircle size={14} />
              <span>当前为个人试学模式。部分课程处于审核阶段，本次记录主要用于评价学习体验，不代表正式能力认证。</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button className="subtle" onClick={() => setView("pilot-feedback")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MessageSquareQuote size={14} />
              <span>试用反馈与导出 ({feedbackCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3–4 Clean Blocks */}
      <div className="today-plan-grid">
        {/* Block 1: Foundation Lesson */}
        <section className="today-core">
          <span className="plan-label">A · Foundation Thread</span>
          {taskCard(foundation, "基础主线暂时完成", "可以等待到期复习，或打开 Learn 查看状态。")}
        </section>

        {/* Block 2: Review (only if due) */}
        <section className="today-review">
          <span className="plan-label">C · Due Review</span>
          {due ? (
            <>
              <Brain size={20} />
              <h2>{due.title}</h2>
              <p>{due.subtitle}</p>
              <button className="primary" onClick={() => start(due)}>开始到期复习</button>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <h2>今天没有到期复习</h2>
              <p>未到期不是落后；间隔本身是学习设计的一部分。</p>
            </>
          )}
        </section>

        {/* Block 3: Transfer / Case */}
        <section className="today-core">
          <span className="plan-label">B · Project Overlay</span>
          {overlay ? (
            taskCard(overlay, "", "")
          ) : (
            <div className="empty-state">
              <h2>从多组学结果到主张边界 (Case Lab)</h2>
              <p>在专家校准后更新解释并继续揭示证据，练习真实科研判断。</p>
              <button className="primary" onClick={() => setView("case-lab")}>
                进入 Case Lab <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>

        {/* Block 4: Optional Routine */}
        <section className="today-routine">
          <span className="plan-label">D · Research Routine</span>
          <Lightbulb size={20} />
          <h2>AI 前先独立思考一次</h2>
          <p>在查阅文献或使用 AI 前，先独立写下你的假设与推断逻辑。</p>
          <div>
            <button onClick={() => setThinking(true)}>Think Before AI</button>
            <button onClick={() => state.papers[0] && selectPaper(state.papers[0].id)}>
              <BookOpen size={14} /> 本周论文
            </button>
          </div>
        </section>
      </div>

      {thinking && (
        <ThinkBeforeAi
          source="today"
          projectId={state.projects[0]?.id}
          onClose={() => setThinking(false)}
        />
      )}
    </div>
  );
}
