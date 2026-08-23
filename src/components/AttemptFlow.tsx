import { useMemo, useState } from "react";
import { Check, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import type { Confidence, ReviewItem } from "../domain/types";
import { useAppStore } from "../state/store";
import { EvidenceList } from "./EvidenceList";

interface AttemptFlowProps {
  taskId: string;
  conceptId: string;
  conceptType: ReviewItem["conceptType"];
  skillId: string;
  prompt: string;
  feedback: React.ReactNode;
  feedbackText: string;
  sourceIds: string[];
  transferPrompt: string;
  placeholder?: string;
}

export function AttemptFlow({ taskId, conceptId, conceptType, skillId, prompt, feedback, feedbackText, sourceIds, transferPrompt, placeholder }: AttemptFlowProps) {
  const existing = useAppStore((state) => state.responses.find((response) => response.taskId === taskId));
  const projects = useAppStore((state) => state.projects);
  const submitResponse = useAppStore((state) => state.submitResponse);
  const ensureReview = useAppStore((state) => state.ensureReview);
  const saveTransfer = useAppStore((state) => state.saveTransfer);
  const addSkillEvidence = useAppStore((state) => state.addSkillEvidence);
  const notify = useAppStore((state) => state.notify);
  const [answer, setAnswer] = useState(existing?.userText ?? "");
  const [confidence, setConfidence] = useState<Confidence>(existing?.confidence ?? 2);
  const [responseId, setResponseId] = useState(existing?.id);
  const [transfer, setTransfer] = useState(existing?.transferText ?? "");
  const [projectId, setProjectId] = useState(existing?.projectId ?? projects[0]?.id ?? "");
  const [selfScore, setSelfScore] = useState<number | undefined>(existing?.correctness);
  const locked = Boolean(responseId);
  const confidenceLabels = useMemo(() => ["Low", "Guarded", "High", "Very high"], []);

  const submit = () => {
    if (answer.trim().length < 12) {
      notify("Write a substantive judgment before locking the answer.", "warning");
      return;
    }
    const response = submitResponse({ taskId, userText: answer.trim(), confidence, feedback: feedbackText });
    setResponseId(response.id);
    ensureReview(conceptId, conceptType, prompt);
  };

  const recordCalibration = (score: number) => {
    setSelfScore(score);
    addSkillEvidence({ skillId, taskId: conceptId, score, delayed: false, blindTransfer: false, confidence });
    notify(score < 0.5 && confidence >= 3 ? "High-confidence error recorded as elevated review priority." : "Calibration evidence recorded.", score < 0.5 && confidence >= 3 ? "warning" : "success");
  };

  const recordTransfer = () => {
    if (!responseId || transfer.trim().length < 8) {
      notify("Write a concrete transfer statement before saving.", "warning");
      return;
    }
    saveTransfer(responseId, transfer.trim(), projectId || undefined);
    notify("Transfer saved and linked to this locked attempt.", "success");
  };

  return (
    <div className="attempt-flow">
      <section className="attempt-stage">
        <div className="stage-kicker"><span>ATTEMPT</span>{locked && <span className="locked"><Lock size={12} /> Original answer locked</span>}</div>
        <h3>{prompt}</h3>
        <textarea value={answer} disabled={locked} onChange={(event) => setAnswer(event.target.value)} placeholder={placeholder ?? "State your judgment, reasoning, and the conclusion boundary…"} rows={7} />
        <div className="attempt-controls">
          <label>Confidence<select value={confidence} disabled={locked} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{confidenceLabels.map((label, index) => <option key={label} value={index + 1}>{index + 1} — {label}</option>)}</select></label>
          {!locked && <button className="primary" onClick={submit}><Lock size={14} /> Lock answer</button>}
        </div>
      </section>

      {locked && (
        <>
          <section className="feedback-stage">
            <div className="stage-kicker"><span>FEEDBACK</span><span className="verified-tag"><ShieldCheck size={12} /> Seed senior review</span></div>
            {feedback}
            <div className="calibration-row">
              <span>After comparison, classify your attempt:</span>
              <button className={selfScore === 1 ? "selected" : ""} onClick={() => recordCalibration(1)}><Check size={13} /> Substantively correct</button>
              <button className={selfScore === 0.5 ? "selected" : ""} onClick={() => recordCalibration(0.5)}>Partial / missed risk</button>
              <button className={selfScore === 0 ? "selected danger" : ""} onClick={() => recordCalibration(0)}>Unsafe conclusion</button>
            </div>
          </section>
          <section className="evidence-stage">
            <div className="stage-kicker"><span>EVIDENCE</span></div>
            <EvidenceList sourceIds={sourceIds} />
          </section>
          <section className="transfer-stage">
            <div className="stage-kicker"><span>TRANSFER</span></div>
            <h3>{transferPrompt}</h3>
            <textarea value={transfer} onChange={(event) => setTransfer(event.target.value)} rows={3} placeholder="Write a concrete implication, action, or question to verify…" />
            <div className="attempt-controls">
              <label>Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Unbound</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <button onClick={recordTransfer}><RefreshCw size={14} /> Save transfer</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

