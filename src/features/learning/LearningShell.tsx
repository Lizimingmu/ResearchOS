import { Clock3, Map, Pause, Play } from "lucide-react";
import type { PropsWithChildren } from "react";

export function LearningShell({ title, step, total, minutes, paused, onPause, onMap, children }: PropsWithChildren<{ title: string; step: number; total: number; minutes: number; paused: boolean; onPause: () => void; onMap: () => void }>) {
  return <div className="page guided-lesson-page"><header className="guided-lesson-header"><div><span className="eyebrow">{title}</span><h1>步骤 {step} / {total}</h1><p><Clock3 size={14}/> 约剩余 {minutes} 分钟</p></div><div><button className="subtle" onClick={onMap}><Map size={14}/> 课程地图</button><button className="subtle" onClick={onPause}>{paused ? <Play size={14}/> : <Pause size={14}/>} {paused ? "继续" : "暂停"}</button></div></header><div className="guided-lesson-progress" aria-label={`课程进度 ${step}/${total}`}><i style={{ width: `${Math.max(4, step / total * 100)}%` }}/></div><main className="guided-lesson-surface">{children}</main></div>;
}
