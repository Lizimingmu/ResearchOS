import { ArrowRight, CalendarDays, Clock3, RotateCcw, SkipForward } from "lucide-react";
import { generateTodayTasks } from "../../learning/scheduler";
import { useAppStore } from "../../state/store";
import { useShallow } from "zustand/react/shallow";
import { taskTypeLabel, weightLabel } from "../../app/localization";

export function TodayView() {
  const state = useAppStore(useShallow((store) => ({
    schemaVersion: store.schemaVersion, papers: store.papers, projects: store.projects, responses: store.responses,
    reviewItems: store.reviewItems, reviewLogs: store.reviewLogs, skillEvidence: store.skillEvidence,
    providers: store.providers, settings: store.settings, completedTaskIds: store.completedTaskIds,
    snoozedTaskIds: store.snoozedTaskIds, assessmentHistory: store.assessmentHistory,
    notesByPaperId: store.notesByPaperId, draftResponses: store.draftResponses,
    misconceptions: store.misconceptions, onboarding: store.onboarding,
    problemAtlasSources: store.problemAtlasSources, problemAtlasClaims: store.problemAtlasClaims,
    problemCards: store.problemCards, diagnosticCauses: store.diagnosticCauses,
    diagnosticChecks: store.diagnosticChecks, diagnosticPaths: store.diagnosticPaths,
    diagnosticEvidence: store.diagnosticEvidence, problemTrainingCases: store.problemTrainingCases,
    diagnosticSessions: store.diagnosticSessions, sourcePackImports: store.sourcePackImports,
    problemSearchLog: store.problemSearchLog, personalContent: store.personalContent,
    contentRevisionHistory: store.contentRevisionHistory, contentConflicts: store.contentConflicts,
    obsidianConnection: store.obsidianConnection, obsidianPublishBatches: store.obsidianPublishBatches,
  })));
  const tasks = generateTodayTasks(state);
  const setView = useAppStore((store) => store.setView);
  const selectMethod = useAppStore((store) => store.selectMethod);
  const selectAudit = useAppStore((store) => store.selectAudit);
  const selectPaper = useAppStore((store) => store.selectPaper);
  const selectProblem = useAppStore((store) => store.selectProblem);
  const snoozeTask = useAppStore((store) => store.snoozeTask);
  const notify = useAppStore((store) => store.notify);
  const total = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const date = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", weekday: "short" }).format(new Date());

  const start = (task: (typeof tasks)[number]) => {
    if (task.type === "method") selectMethod(task.targetId);
    else if (task.type === "audit") selectAudit(task.targetId);
    else if (task.type === "paper" && state.papers.some((paper) => paper.id === task.targetId)) selectPaper(task.targetId);
    else if (task.type === "problem") selectProblem(task.targetId);
    else setView(task.destination);
  };

  return (
    <div className="page today-page">
      <header className="page-header today-header">
        <div><span className="eyebrow">今日学习</span><h1>今日科研训练</h1><p>按顺序完成任务。先独立判断，提交后再查看反馈与证据。</p></div>
        <div className="today-date"><CalendarDays size={17} /><span>{date}</span><small>已安排 {total} 分钟</small></div>
      </header>

      {tasks.length === 0 ? (
        <section className="empty-state"><h2>今天的训练队列已完成。</h2><p>到期复习和高信心错误会自动重新进入队列。如需继续练习，请打开“复习”。</p><button onClick={() => setView("review")}><RotateCcw size={14} /> 打开复习</button></section>
      ) : (
        <div className="daily-sequence">
          {tasks.map((task, index) => (
            <article key={task.id} className="daily-task">
              <div className="task-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="task-main">
                <span className={`task-type ${task.type}`}>{taskTypeLabel(task.type)}</span>
                <h2>{task.title}</h2>
                <p>{task.subtitle}</p>
                <small>{task.rationale} · 优先级 {task.priority.toFixed(2)}</small>
              </div>
              <div className="task-time"><Clock3 size={13} /> 约 {task.minutes} 分钟</div>
              <div className="task-actions">
                <button className="subtle" title="推迟到明天" onClick={() => { snoozeTask(task.id); notify("任务已推迟，未标记为完成。"); }}><SkipForward size={14} /> 推迟</button>
                <button onClick={() => start(task)}>开始 <ArrowRight size={14} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      <footer className="today-footer"><span>调度权重</span><code>{Object.entries(state.settings.weights).map(([key, value]) => `${value.toFixed(2)} ${weightLabel(key)}`).join(" + ")}</code><button className="link-button" onClick={() => setView("settings")}>在设置中调整</button></footer>
    </div>
  );
}
