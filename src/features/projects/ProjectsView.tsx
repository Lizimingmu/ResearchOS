import { FolderPlus, Link2, Plus } from "lucide-react";
import { useState } from "react";
import type { Project } from "../../domain/types";
import { makeId } from "../../lib/ids";
import { useAppStore } from "../../state/store";

const blank = (): Omit<Project, "id" | "createdAt"> => ({ name: "", disease: "", studyType: "", cohort: "", omics: "", outcome: "", currentStage: "Planning", scientificQuestion: "", bottleneck: "", activeMethods: "", targetJournal: "", notes: "" });

export function ProjectsView() {
  const projects = useAppStore((state) => state.projects);
  const responses = useAppStore((state) => state.responses);
  const addProject = useAppStore((state) => state.addProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const notify = useAppStore((state) => state.notify);
  const [draft, setDraft] = useState(blank());
  const [selectedId, setSelectedId] = useState(projects[0]?.id);
  const [creating, setCreating] = useState(projects.length === 0);
  const selected = projects.find((project) => project.id === selectedId);
  const linked = selected ? responses.filter((response) => response.projectId === selected.id && response.transferText) : [];
  const save = () => {
    if (draft.name.trim().length < 2 || draft.scientificQuestion.trim().length < 8) { notify("请填写项目名称和主要科学问题。", "warning"); return; }
    const project: Project = { ...draft, id: makeId("project"), createdAt: new Date().toISOString() };
    addProject(project); setSelectedId(project.id); setCreating(false); setDraft(blank()); notify("项目情境已创建。由此生成的任务会明确标注为情境衍生内容。", "success");
  };
  const editor = creating ? draft : selected;
  const change = (key: keyof Omit<Project, "id" | "createdAt">, value: string) => creating ? setDraft((current) => ({ ...current, [key]: value })) : selected && updateProject(selected.id, { [key]: value });
  return <div className="projects-layout"><aside className="project-list"><div className="pane-heading"><span className="eyebrow">项目情境</span><button onClick={() => setCreating(true)}><Plus size={14} /></button></div>{projects.map((project) => <button key={project.id} className={!creating && project.id === selected?.id ? "active" : ""} onClick={() => { setSelectedId(project.id); setCreating(false); }}><FolderPlus size={15} /><span>{project.name}<small>{project.disease || "未设置疾病"} · {project.currentStage}</small></span></button>)}</aside><section className="project-editor scrollable"><header className="page-header compact"><div><span className="eyebrow">{creating ? "新建项目" : "项目情境"}</span><h1>{creating ? "定义真实研究情境" : selected?.name ?? "选择一个项目"}</h1><p>项目情境会影响调度相关性。由此生成的 AI 内容仍会保持待核验并明确标注。</p></div>{creating && <button className="primary" onClick={save}>创建项目</button>}</header>{editor ? <div className="project-form"><div className="form-grid two"><label>项目名称<input value={editor.name} onChange={(event) => change("name", event.target.value)} /></label><label>疾病<input value={editor.disease} onChange={(event) => change("disease", event.target.value)} /></label><label>研究类型<input value={editor.studyType} onChange={(event) => change("studyType", event.target.value)} /></label><label>队列<input value={editor.cohort} onChange={(event) => change("cohort", event.target.value)} /></label><label>组学<input value={editor.omics} onChange={(event) => change("omics", event.target.value)} /></label><label>结局<input value={editor.outcome} onChange={(event) => change("outcome", event.target.value)} /></label><label>当前阶段<select value={editor.currentStage} onChange={(event) => change("currentStage", event.target.value)}><option value="Planning">规划</option><option value="Data collection">数据收集</option><option value="Analysis">分析</option><option value="Figure assembly">图表整理</option><option value="Writing">写作</option><option value="Revision">修改</option></select></label><label>目标期刊<input value={editor.targetJournal} onChange={(event) => change("targetJournal", event.target.value)} /></label></div><label>主要科学问题<textarea rows={3} value={editor.scientificQuestion} onChange={(event) => change("scientificQuestion", event.target.value)} /></label><label>当前瓶颈<textarea rows={3} value={editor.bottleneck} onChange={(event) => change("bottleneck", event.target.value)} /></label><label>正在使用的方法<input value={editor.activeMethods} onChange={(event) => change("activeMethods", event.target.value)} placeholder="Cox、scRNA-seq、空间组学…" /></label><label>笔记<textarea rows={5} value={editor.notes} onChange={(event) => change("notes", event.target.value)} /></label></div> : <div className="empty-state"><FolderPlus size={24} /><h2>创建项目情境</h2><p>它用于调整相关性和迁移训练，但不会成为已核验证据。</p></div>}{!creating && selected && <section className="linked-transfers"><div className="stage-kicker"><span>已关联迁移</span><small>{linked.length}</small></div>{linked.length ? linked.map((response) => <article key={response.id}><Link2 size={14} /><div><strong>{response.taskId}</strong><p>{response.transferText}</p><small>{new Date(response.submittedAt).toLocaleString("zh-CN")}</small></div></article>) : <p>尚未关联训练迁移。</p>}</section>}</section></div>;
}
