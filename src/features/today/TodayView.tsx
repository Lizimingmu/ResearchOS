import { ArrowRight, CalendarDays, Clock3, RotateCcw, SkipForward } from "lucide-react";
import { generateTodayTasks } from "../../learning/scheduler";
import { useAppStore } from "../../state/store";

export function TodayView() {
  const state = useAppStore();
  const tasks = generateTodayTasks(state);
  const setView = useAppStore((store) => store.setView);
  const selectMethod = useAppStore((store) => store.selectMethod);
  const selectAudit = useAppStore((store) => store.selectAudit);
  const selectPaper = useAppStore((store) => store.selectPaper);
  const snoozeTask = useAppStore((store) => store.snoozeTask);
  const notify = useAppStore((store) => store.notify);
  const total = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const date = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", weekday: "short" }).format(new Date());

  const start = (task: (typeof tasks)[number]) => {
    if (task.type === "method") selectMethod(task.targetId);
    else if (task.type === "audit") selectAudit(task.targetId);
    else if (task.type === "paper" && state.papers.some((paper) => paper.id === task.targetId)) selectPaper(task.targetId);
    else setView(task.destination);
  };

  return (
    <div className="page today-page">
      <header className="page-header today-header">
        <div><span className="eyebrow">TODAY</span><h1>Deliberate practice queue</h1><p>One sequence. Attempt first; feedback and evidence unlock after submission.</p></div>
        <div className="today-date"><CalendarDays size={17} /><span>{date}</span><small>{total} min scheduled</small></div>
      </header>

      {tasks.length === 0 ? (
        <section className="empty-state"><h2>Today's active queue is clear.</h2><p>Due reviews and high-confidence errors will return automatically. Use Review for additional practice.</p><button onClick={() => setView("review")}><RotateCcw size={14} /> Open review</button></section>
      ) : (
        <div className="daily-sequence">
          {tasks.map((task, index) => (
            <article key={task.id} className="daily-task">
              <div className="task-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="task-main">
                <span className={`task-type ${task.type}`}>{task.type.toUpperCase()}</span>
                <h2>{task.title}</h2>
                <p>{task.subtitle}</p>
                <small>{task.rationale} · priority {task.priority.toFixed(2)}</small>
              </div>
              <div className="task-time"><Clock3 size={13} /> ~{task.minutes} min</div>
              <div className="task-actions">
                <button className="subtle" title="Snooze until tomorrow" onClick={() => { snoozeTask(task.id); notify("Task snoozed. It was not marked complete."); }}><SkipForward size={14} /> Snooze</button>
                <button onClick={() => start(task)}>Start <ArrowRight size={14} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      <footer className="today-footer"><span>Scheduler weights</span><code>0.35 weakness + 0.30 project + 0.20 frontier + 0.15 due</code><button className="link-button" onClick={() => setView("settings")}>Adjust in Settings</button></footer>
    </div>
  );
}

