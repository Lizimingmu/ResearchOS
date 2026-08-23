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
    if (draft.name.trim().length < 2 || draft.scientificQuestion.trim().length < 8) { notify("Project name and main scientific question are required.", "warning"); return; }
    const project: Project = { ...draft, id: makeId("project"), createdAt: new Date().toISOString() };
    addProject(project); setSelectedId(project.id); setCreating(false); setDraft(blank()); notify("Project context created. Generated tasks will be explicitly marked as context-derived.", "success");
  };
  const editor = creating ? draft : selected;
  const change = (key: keyof Omit<Project, "id" | "createdAt">, value: string) => creating ? setDraft((current) => ({ ...current, [key]: value })) : selected && updateProject(selected.id, { [key]: value });
  return <div className="projects-layout"><aside className="project-list"><div className="pane-heading"><span className="eyebrow">PROJECT CONTEXTS</span><button onClick={() => setCreating(true)}><Plus size={14} /></button></div>{projects.map((project) => <button key={project.id} className={!creating && project.id === selected?.id ? "active" : ""} onClick={() => { setSelectedId(project.id); setCreating(false); }}><FolderPlus size={15} /><span>{project.name}<small>{project.disease || "Disease not set"} · {project.currentStage}</small></span></button>)}</aside><section className="project-editor scrollable"><header className="page-header compact"><div><span className="eyebrow">{creating ? "NEW PROJECT" : "PROJECT CONTEXT"}</span><h1>{creating ? "Define a real research context" : selected?.name ?? "Select a project"}</h1><p>Context changes scheduler relevance. AI-generated material from it remains pending and labeled.</p></div>{creating && <button className="primary" onClick={save}>Create project</button>}</header>{editor ? <div className="project-form"><div className="form-grid two"><label>Project name<input value={editor.name} onChange={(event) => change("name", event.target.value)} /></label><label>Disease<input value={editor.disease} onChange={(event) => change("disease", event.target.value)} /></label><label>Study type<input value={editor.studyType} onChange={(event) => change("studyType", event.target.value)} /></label><label>Cohort<input value={editor.cohort} onChange={(event) => change("cohort", event.target.value)} /></label><label>Omics<input value={editor.omics} onChange={(event) => change("omics", event.target.value)} /></label><label>Outcome<input value={editor.outcome} onChange={(event) => change("outcome", event.target.value)} /></label><label>Current stage<select value={editor.currentStage} onChange={(event) => change("currentStage", event.target.value)}><option>Planning</option><option>Data collection</option><option>Analysis</option><option>Figure assembly</option><option>Writing</option><option>Revision</option></select></label><label>Target journal<input value={editor.targetJournal} onChange={(event) => change("targetJournal", event.target.value)} /></label></div><label>Main scientific question<textarea rows={3} value={editor.scientificQuestion} onChange={(event) => change("scientificQuestion", event.target.value)} /></label><label>Current bottleneck<textarea rows={3} value={editor.bottleneck} onChange={(event) => change("bottleneck", event.target.value)} /></label><label>Active methods<input value={editor.activeMethods} onChange={(event) => change("activeMethods", event.target.value)} placeholder="Cox, scRNA-seq, spatial…" /></label><label>Notes<textarea rows={5} value={editor.notes} onChange={(event) => change("notes", event.target.value)} /></label></div> : <div className="empty-state"><FolderPlus size={24} /><h2>Create a project context</h2><p>It drives relevance and transfer but never becomes verified evidence.</p></div>}{!creating && selected && <section className="linked-transfers"><div className="stage-kicker"><span>LINKED TRANSFERS</span><small>{linked.length}</small></div>{linked.length ? linked.map((response) => <article key={response.id}><Link2 size={14} /><div><strong>{response.taskId}</strong><p>{response.transferText}</p><small>{new Date(response.submittedAt).toLocaleString()}</small></div></article>) : <p>No training transfer is linked yet.</p>}</section>}</section></div>;
}

