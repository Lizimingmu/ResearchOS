import { AlertTriangle, CheckCircle2, CircleHelp, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
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
  const ensureReview = useAppStore((state) => state.ensureReview);
  const addSkillEvidence = useAppStore((state) => state.addSkillEvidence);
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
  const existing = responses.find((response) => response.taskId === taskId);
  const locked = Boolean(existing);
  const filtered = useMemo(() => auditCases.filter((entry) => `${entry.title} ${entry.domain} ${entry.task}`.toLowerCase().includes(globalSearch.toLowerCase())), [globalSearch]);

  const submit = () => {
    if (current.steps.some((step) => !decisions[step.id])) { notify("Mark every AI plan step before submission.", "warning"); return; }
    if (current.steps.some((step) => (reasons[step.id] ?? "").trim().length < 5)) { notify("Give a concise reason for every decision.", "warning"); return; }
    const score = current.steps.filter((step) => decisions[step.id] === step.expected).length / current.steps.length;
    submitResponse({ taskId, userText: JSON.stringify({ decisions, reasons }, null, 2), confidence, correctness: score, feedback: current.seniorSummary });
    ensureReview(current.id, "audit", current.task);
    addSkillEvidence({ skillId: "ai-oversight", taskId: current.id, score, delayed: false, blindTransfer: false, confidence });
    notify(score < .5 && confidence >= 3 ? "High-confidence audit miss recorded as elevated risk." : `Audit locked: ${Math.round(score * 100)}% of dispositions matched the senior key.`, score < .5 && confidence >= 3 ? "warning" : "success");
  };

  const recordTransfer = () => {
    if (!existing || transfer.trim().length < 8) { notify("Write a concrete transfer before saving.", "warning"); return; }
    saveTransfer(existing.id, transfer.trim(), projectId || undefined);
    notify("Transfer saved.", "success");
  };

  return <div className="split-page audit-page"><aside className="feature-list-pane"><div className="pane-heading"><span className="eyebrow">AI AUDIT CASES</span><strong>{auditCases.length}</strong></div><label className="compact-search"><Search size={13} /><span>Filter with workspace search</span></label><div className="audit-case-list">{filtered.map((entry) => <button key={entry.id} className={entry.id === current.id ? "active" : ""} onClick={() => { selectAudit(entry.id); setDecisions({}); setReasons({}); setTransfer(""); }}><span>{entry.title}<small>{entry.domain}</small></span><i>{entry.steps.length} steps</i></button>)}</div></aside><section className="feature-workspace scrollable"><header className="detail-header"><div><span className="eyebrow">AI OVERSIGHT · {current.domain.toUpperCase()}</span><h1>{current.title}</h1><p>{current.task}</p></div><AlertTriangle size={24} /></header><div className="case-context"><span>CONTEXT</span>{current.context}</div><div className="audit-plan"><div className="audit-plan-head"><span>PROPOSED AI PLAN</span><span>Your disposition</span><span>Reason</span></div>{current.steps.map((step, index) => { const savedDecision = existing ? step.expected : decisions[step.id]; return <div key={step.id} className="audit-step"><div><i>{index + 1}</i><p>{step.text}</p></div><div className="decision-buttons">{(["approve", "question", "reject"] as Decision[]).map((decision) => { const Icon = decision === "approve" ? CheckCircle2 : decision === "question" ? CircleHelp : XCircle; return <button key={decision} disabled={locked} className={savedDecision === decision ? `active ${decision}` : ""} onClick={() => setDecisions((value) => ({ ...value, [step.id]: decision }))} title={decision}><Icon size={15} /></button>; })}</div><textarea disabled={locked} rows={2} value={locked ? (step.issue ?? "Acceptable as written with stated context.") : (reasons[step.id] ?? "")} onChange={(event) => setReasons((value) => ({ ...value, [step.id]: event.target.value }))} placeholder="Methodological reason…" /></div>; })}</div>{!locked && <div className="audit-submit"><label>Overall confidence<select value={confidence} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><button className="primary" onClick={submit}>Lock audit</button></div>}{locked && <><section className="feedback-stage senior-audit"><div className="stage-kicker"><span>SENIOR AUDIT</span></div><div className="senior-review"><div><span>SUMMARY</span><p>{current.seniorSummary}</p></div><div><span>COMMONLY MISSED</span><ul>{current.missedRisks.map((risk) => <li key={risk}>{risk}</li>)}</ul></div>{current.steps.filter((step) => step.issue).map((step) => <div key={step.id}><span>{step.expected.toUpperCase()} · {step.severity?.toUpperCase()}</span><p>{step.issue}</p></div>)}</div></section><section className="evidence-stage"><div className="stage-kicker"><span>EVIDENCE</span></div><EvidenceList sourceIds={current.sourceIds} /></section><section className="transfer-stage"><div className="stage-kicker"><span>TRANSFER</span></div><h3>{current.transferPrompt}</h3><textarea rows={3} value={transfer} onChange={(event) => setTransfer(event.target.value)} /><div className="attempt-controls"><label>Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Unbound</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><button onClick={recordTransfer}>Save transfer</button></div></section></>}</section></div>;
}

