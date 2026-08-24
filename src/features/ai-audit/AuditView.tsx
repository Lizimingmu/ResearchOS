import { AlertTriangle, CheckCircle2, CircleHelp, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EvidenceList } from "../../components/EvidenceList";
import { auditCases } from "../../data/auditCases";
import type { Confidence } from "../../domain/types";
import { useAppStore } from "../../state/store";

type Decision = "approve" | "question" | "reject";

export function AuditView() {
  const selectedId = useAppStore((state) => state.selectedAuditId);
  const selectAudit = useAppStore((state) => state.selectAudit);
  const responses = useAppStore((state) => state.responses);
  const submitResponse = useAppStore((state) => state.submitResponse);
  const recordCalibration = useAppStore((state) => state.recordCalibration);
  const saveDraft = useAppStore((state) => state.saveDraft);
  const clearDraft = useAppStore((state) => state.clearDraft);
  const saveTransfer = useAppStore((state) => state.saveTransfer);
  const projects = useAppStore((state) => state.projects);
  const notify = useAppStore((state) => state.notify);
  const globalSearch = useAppStore((state) => state.globalSearch);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [transfer, setTransfer] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const current = auditCases.find((entry) => entry.id === selectedId) ?? auditCases[0];
  const taskId = `audit-attempt-${current.id}`;
  const draft = useAppStore((state) => state.draftResponses[taskId]);
  const existing = responses.find((response) => response.taskId === taskId);
  const locked = Boolean(existing);
  const filtered = useMemo(() => auditCases.filter((entry) => `${entry.title} ${entry.domain} ${entry.task}`.toLowerCase().includes(globalSearch.toLowerCase())), [globalSearch]);

  useEffect(() => {
    if (existing || !draft?.userText) return;
    try { const saved = JSON.parse(draft.userText) as { decisions?: Record<string, Decision>; reasons?: Record<string, string> }; setDecisions(saved.decisions ?? {}); setReasons(saved.reasons ?? {}); setConfidence(draft.confidence); setTransfer(draft.transferText); setProjectId(draft.projectId ?? ""); }
    catch { /* Ignore malformed draft; the persisted raw state remains available in backups. */ }
  }, [taskId]);

  const persistAuditDraft = (nextDecisions = decisions, nextReasons = reasons, nextConfidence = confidence, nextTransfer = transfer, nextProjectId = projectId) => saveDraft({ taskId, userText: JSON.stringify({ decisions: nextDecisions, reasons: nextReasons }), confidence: nextConfidence, transferText: nextTransfer, projectId: nextProjectId || undefined });

  const submit = () => {
    if (current.steps.some((step) => !decisions[step.id])) { notify("提交前请标记 AI 方案的每一个步骤。", "warning"); return; }
    if (current.steps.some((step) => (reasons[step.id] ?? "").trim().length < 5)) { notify("请为每个决定给出简明理由。", "warning"); return; }
    const score = current.steps.filter((step) => decisions[step.id] === step.expected).length / current.steps.length;
    const response = submitResponse({ taskId, userText: JSON.stringify({ decisions, reasons }, null, 2), confidence, feedback: current.seniorSummary });
    clearDraft(taskId);
    recordCalibration({ responseId: response.id, conceptId: current.id, conceptType: "audit", skillId: "ai-oversight", prompt: current.task, variantPrompt: current.variantPrompt, difficulty: current.difficulty, score });
  };

  const recordTransfer = () => {
    if (!existing || transfer.trim().length < 8) { notify("请先写出具体的迁移内容，再保存。", "warning"); return; }
    saveTransfer(existing.id, transfer.trim(), projectId || undefined);
    clearDraft(taskId);
    notify("迁移内容已保存。", "success");
  };

  return <div className="split-page audit-page"><aside className="feature-list-pane"><div className="pane-heading"><span className="eyebrow">AI 审查案例</span><strong>{auditCases.length}</strong></div><label className="compact-search"><Search size={13} /><span>使用工作区搜索筛选</span></label><div className="audit-case-list">{filtered.map((entry) => <button key={entry.id} className={entry.id === current.id ? "active" : ""} onClick={() => { selectAudit(entry.id); setDecisions({}); setReasons({}); setTransfer(""); }}><span>{entry.title}<small>{entry.domain}</small></span><i>{entry.steps.length} 个步骤</i></button>)}</div></aside><section className="feature-workspace scrollable"><header className="detail-header"><div><span className="eyebrow">AI 监督 · {current.domain.toUpperCase()}</span><h1>{current.title}</h1><p>{current.task}</p></div><AlertTriangle size={24} /></header><div className="case-context"><span>情境</span>{current.context}</div><div className="audit-plan"><div className="audit-plan-head"><span>AI 提议方案</span><span>你的处置</span><span>理由</span></div>{current.steps.map((step, index) => { const savedDecision = existing ? step.expected : decisions[step.id]; return <div key={step.id} className="audit-step"><div><i>{index + 1}</i><p>{step.text}</p></div><div className="decision-buttons">{(["approve", "question", "reject"] as Decision[]).map((decision) => { const Icon = decision === "approve" ? CheckCircle2 : decision === "question" ? CircleHelp : XCircle; return <button key={decision} disabled={locked} className={savedDecision === decision ? `active ${decision}` : ""} onClick={() => { const next = { ...decisions, [step.id]: decision }; setDecisions(next); persistAuditDraft(next); }} title={{ approve: "批准", question: "质疑", reject: "拒绝" }[decision]}><Icon size={15} /></button>; })}</div><textarea disabled={locked} rows={2} value={locked ? (step.issue ?? "在所述情境下可接受。") : (reasons[step.id] ?? "")} onChange={(event) => { const next = { ...reasons, [step.id]: event.target.value }; setReasons(next); persistAuditDraft(decisions, next); }} placeholder="方法学理由…" /></div>; })}</div>{!locked && <div className="audit-submit"><label>总体信心<select value={confidence} onChange={(event) => { const next = Number(event.target.value) as Confidence; setConfidence(next); persistAuditDraft(decisions, reasons, next); }}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><button className="primary" onClick={submit}>锁定审查</button></div>}{locked && <><section className="feedback-stage senior-audit"><div className="stage-kicker"><span>专家审查</span></div><div className="senior-review"><div><span>总结</span><p>{current.seniorSummary}</p></div><div><span>常见遗漏</span><ul>{current.missedRisks.map((risk) => <li key={risk}>{risk}</li>)}</ul></div>{current.steps.filter((step) => step.issue).map((step) => <div key={step.id}><span>{step.expected.toUpperCase()} · {step.severity?.toUpperCase()}</span><p>{step.issue}</p></div>)}</div></section><section className="evidence-stage"><div className="stage-kicker"><span>证据</span></div><EvidenceList sourceIds={current.sourceIds} /></section><section className="transfer-stage"><div className="stage-kicker"><span>迁移</span></div><h3>{current.transferPrompt}</h3><textarea rows={3} value={transfer} onChange={(event) => { setTransfer(event.target.value); persistAuditDraft(decisions, reasons, confidence, event.target.value); }} /><div className="attempt-controls"><label>项目<select value={projectId} onChange={(event) => { setProjectId(event.target.value); persistAuditDraft(decisions, reasons, confidence, transfer, event.target.value); }}><option value="">不关联项目</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><button onClick={recordTransfer}>保存迁移</button></div></section></>}</section></div>;
}
