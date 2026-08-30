import { ArrowRight, CalendarDays, Clock3, RotateCcw, SkipForward } from "lucide-react";
import { generateTodayTasks } from "../../learning/scheduler";
import { useAppStore } from "../../state/store";
import { useShallow } from "zustand/react/shallow";
import { taskTypeLabel } from "../../app/localization";

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
    learnerUnitStates: store.learnerUnitStates, learningEvents: store.learningEvents,
    pausedLearningUnitIds: store.pausedLearningUnitIds,
    obsidianConnection: store.obsidianConnection, obsidianPublishBatches: store.obsidianPublishBatches,
  })));
  const tasks = generateTodayTasks(state);
  const setView = useAppStore((store) => store.setView);
  const selectMethod = useAppStore((store) => store.selectMethod);
  const selectAudit = useAppStore((store) => store.selectAudit);
  const selectPaper = useAppStore((store) => store.selectPaper);
  const selectProblem = useAppStore((store) => store.selectProblem);
  const selectLearningUnit = useAppStore((store) => store.selectLearningUnit);
  const snoozeTask = useAppStore((store) => store.snoozeTask);
  const notify = useAppStore((store) => store.notify);
  const total = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const date = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", weekday: "short" }).format(new Date());

  const start = (task: (typeof tasks)[number]) => {
    if (task.type === "learning") selectLearningUnit(task.targetId);
    else if (task.type === "method") selectMethod(task.targetId);
    else if (task.type === "audit") selectAudit(task.targetId);
    else if (task.type === "paper" && state.papers.some((paper) => paper.id === task.targetId)) selectPaper(task.targetId);
    else if (task.type === "problem") selectProblem(task.targetId);
    else setView(task.destination);
  };

  return (
    <div className="page today-page">
      <header className="page-header today-header">
        <div><span className="eyebrow">今日学习</span><h1>今天真正学会一件事</h1><p>先理解，再跟着示范练习；只有准备好后才进入独立判断。</p></div>
        <div className="today-date"><CalendarDays size={17} /><span>{date}</span><small>已安排 {total} 分钟</small></div>
      </header>

      {tasks.length === 0 ? (
        <section className="empty-state"><h2>今天没有必须完成的学习活动。</h2><p>可能是复习尚未到期、前置单元未完成，或两个学习主题正在暂停。你仍可打开学习单元继续阅读。</p><button onClick={() => setView("learning")}><RotateCcw size={14} /> 打开学习路径</button></section>
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
      <footer className="today-footer"><span>调度顺序</span><code>学习状态门控 → 合法活动 → 到期/连续性/误区/解锁/项目相关性排序</code><button className="link-button" onClick={() => setView("settings")}>每日时间预算</button></footer>
    </div>
  );
}
