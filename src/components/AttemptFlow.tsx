import { useMemo, useState } from "react";
import { Bot, Check, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import type { Confidence, DifficultyLevel, ReviewItem } from "../domain/types";
import { buildAiReviewPrompt, parseAiReview } from "../ai/reviewArchitecture";
import { evidenceById } from "../data/evidence";
import { makeId } from "../lib/ids";
import { requestAiReview } from "../services/desktop";
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
  variantPrompt?: string;
  difficulty?: DifficultyLevel;
}

export function AttemptFlow({ taskId, conceptId, conceptType, skillId, prompt, feedback, feedbackText, sourceIds, transferPrompt, placeholder, variantPrompt, difficulty }: AttemptFlowProps) {
  const existing = useAppStore((state) => state.responses.find((response) => response.taskId === taskId));
  const draft = useAppStore((state) => state.draftResponses[taskId]);
  const projects = useAppStore((state) => state.projects);
  const submitResponse = useAppStore((state) => state.submitResponse);
  const ensureReview = useAppStore((state) => state.ensureReview);
  const saveTransfer = useAppStore((state) => state.saveTransfer);
  const saveDraft = useAppStore((state) => state.saveDraft);
  const clearDraft = useAppStore((state) => state.clearDraft);
  const recordCalibrationInStore = useAppStore((state) => state.recordCalibration);
  const saveAiReview = useAppStore((state) => state.saveAiReview);
  const settings = useAppStore((state) => state.settings);
  const providers = useAppStore((state) => state.providers);
  const notify = useAppStore((state) => state.notify);
  const [answer, setAnswer] = useState(existing?.userText ?? draft?.userText ?? "");
  const [confidence, setConfidence] = useState<Confidence>(existing?.confidence ?? draft?.confidence ?? 2);
  const [responseId, setResponseId] = useState(existing?.id);
  const [transfer, setTransfer] = useState(existing?.transferText ?? draft?.transferText ?? "");
  const [projectId, setProjectId] = useState(existing?.projectId ?? draft?.projectId ?? projects[0]?.id ?? "");
  const [selfScore, setSelfScore] = useState<number | undefined>(existing?.correctness);
  const [aiReview, setAiReview] = useState(existing?.aiReview);
  const [aiLoading, setAiLoading] = useState(false);
  const locked = Boolean(responseId);
  const confidenceLabels = useMemo(() => ["Low", "Guarded", "High", "Very high"], []);
  const activeProvider = providers.find((provider) => provider.id === settings.activeProviderId) ?? providers[0];

  const submit = () => {
    if (answer.trim().length < 12) {
      notify("Write a substantive judgment before locking the answer.", "warning");
      return;
    }
    const response = submitResponse({ taskId, userText: answer.trim(), confidence, feedback: feedbackText });
    setResponseId(response.id);
    clearDraft(taskId);
    ensureReview(conceptId, conceptType, prompt);
  };

  const recordCalibration = (score: number) => {
    if (!responseId || selfScore !== undefined) return;
    recordCalibrationInStore({ responseId, conceptId, conceptType, skillId, prompt, variantPrompt, difficulty, score });
    setSelfScore(score);
  };

  const updateDraft = (next: { answer?: string; confidence?: Confidence; transfer?: string; projectId?: string }) => {
    saveDraft({
      taskId,
      userText: next.answer ?? answer,
      confidence: next.confidence ?? confidence,
      transferText: next.transfer ?? transfer,
      projectId: (next.projectId ?? projectId) || undefined,
    });
  };

  const recordTransfer = () => {
    if (!responseId || transfer.trim().length < 8) {
      notify("Write a concrete transfer statement before saving.", "warning");
      return;
    }
    saveTransfer(responseId, transfer.trim(), projectId || undefined);
    clearDraft(taskId);
    notify("Transfer saved and linked to this locked attempt.", "success");
  };

  const requestReview = async () => {
    if (!responseId || !activeProvider) return;
    setAiLoading(true);
    try {
      const promptText = buildAiReviewPrompt({ kind: conceptType, conceptId, question: prompt, lockedAttempt: answer, seniorReference: feedbackText });
      const evidence = sourceIds.map((id) => evidenceById[id]).filter(Boolean).map((source) => `${source.title} (${source.year}; ${source.doi ? `DOI ${source.doi}` : source.pmid ? `PMID ${source.pmid}` : source.url})\n${source.coreEvidence}`).join("\n\n");
      const raw = await requestAiReview(activeProvider, promptText, evidence);
      const parsed = parseAiReview(raw);
      const record = { id: makeId("ai-review"), providerId: activeProvider.id, model: activeProvider.model, createdAt: new Date().toISOString(), verificationStatus: "pending" as const, raw, structured: parsed.structured, parseWarning: parsed.warning };
      setAiReview(record);
      saveAiReview(responseId, record);
      notify(parsed.warning ?? "AI critique saved as pending generated content.", parsed.warning ? "warning" : "success");
    } catch (error) {
      notify(`AI critique failed: ${String(error)}`, "error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="attempt-flow">
      <section className="attempt-stage">
        <div className="stage-kicker"><span>ATTEMPT</span>{locked && <span className="locked"><Lock size={12} /> Original answer locked</span>}</div>
        <h3>{prompt}</h3>
        <textarea value={answer} disabled={locked} onChange={(event) => { setAnswer(event.target.value); updateDraft({ answer: event.target.value }); }} placeholder={placeholder ?? "State your judgment, reasoning, and the conclusion boundary…"} rows={7} />
        <div className="attempt-controls">
          <label>Confidence<select value={confidence} disabled={locked} onChange={(event) => { const value = Number(event.target.value) as Confidence; setConfidence(value); updateDraft({ confidence: value }); }}>{confidenceLabels.map((label, index) => <option key={label} value={index + 1}>{index + 1} — {label}</option>)}</select></label>
          {!locked && <button className="primary" onClick={submit}><Lock size={14} /> Lock answer</button>}
        </div>
      </section>

      {locked && (
        <>
          <section className="feedback-stage">
            <div className="stage-kicker"><span>FEEDBACK</span><span className="verified-tag"><ShieldCheck size={12} /> Seed senior review</span></div>
            {feedback}
            <div className="ai-review-panel">
              <div className="stage-kicker"><span>OPTIONAL AI CRITIQUE</span><span className="pending-tag"><Bot size={12} /> Generated · pending</span></div>
              <button disabled={aiLoading || settings.offlineMode || (!activeProvider?.hasApiKey && activeProvider?.template !== "ollama")} onClick={() => void requestReview()}><Bot size={14} /> {aiLoading ? "Reviewing locked attempt…" : aiReview ? "Refresh AI critique" : "Request evidence-bounded critique"}</button>
              {!activeProvider?.hasApiKey && activeProvider?.template !== "ollama" && <small>Configure a provider credential in Settings. The curated senior review remains fully offline.</small>}
              {settings.offlineMode && <small>Offline mode is enabled; no provider request will be sent.</small>}
              {aiReview?.structured && <div className="senior-review ai-generated"><div><span>CORRECT</span><ul>{aiReview.structured.correct.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span>MISSED</span><ul>{aiReview.structured.missed.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span>WHY · {aiReview.structured.severity.toUpperCase()}</span><p>{aiReview.structured.why}</p></div><div><span>UNFAMILIAR RETEST</span><p>{aiReview.structured.transfer}</p></div><div><span>UNCERTAINTY</span><p>{aiReview.structured.uncertainty}</p></div></div>}
              {aiReview && !aiReview.structured && <div className="setting-note"><p>{aiReview.parseWarning}</p><pre>{aiReview.raw}</pre></div>}
            </div>
            <div className="calibration-row">
              <span>After comparison, classify your attempt:</span>
              <button disabled={selfScore !== undefined} className={selfScore === 1 ? "selected" : ""} onClick={() => recordCalibration(1)}><Check size={13} /> Substantively correct</button>
              <button disabled={selfScore !== undefined} className={selfScore === 0.5 ? "selected" : ""} onClick={() => recordCalibration(0.5)}>Partial / missed risk</button>
              <button disabled={selfScore !== undefined} className={selfScore === 0 ? "selected danger" : ""} onClick={() => recordCalibration(0)}>Unsafe conclusion</button>
            </div>
          </section>
          <section className="evidence-stage">
            <div className="stage-kicker"><span>EVIDENCE</span></div>
            <EvidenceList sourceIds={sourceIds} />
          </section>
          <section className="transfer-stage">
            <div className="stage-kicker"><span>TRANSFER</span></div>
            <h3>{transferPrompt}</h3>
            <textarea value={transfer} onChange={(event) => { setTransfer(event.target.value); updateDraft({ transfer: event.target.value }); }} rows={3} placeholder="Write a concrete implication, action, or question to verify…" />
            <div className="attempt-controls">
              <label>Project<select value={projectId} onChange={(event) => { setProjectId(event.target.value); updateDraft({ projectId: event.target.value }); }}><option value="">Unbound</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <button onClick={recordTransfer}><RefreshCw size={14} /> Save transfer</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
