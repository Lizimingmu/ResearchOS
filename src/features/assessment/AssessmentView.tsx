import { ClipboardCheck, Lock } from "lucide-react";
import { useState } from "react";
import { blindAssessmentPrompts } from "../../data/starterTrack";
import type { Confidence } from "../../domain/types";
import { makeId } from "../../lib/ids";
import { useAppStore } from "../../state/store";

const caseText = "Unfamiliar case: A retrospective multi-center oncology cohort derives a 42-gene recurrence model from bulk RNA-seq. Feature selection, normalization, model tuning, and a random patient split are described. The authors add cell-level scRNA associations in 4 validation tumors and an AI plan proposes pooled-cell DEG, raw P<.05, KEGG, and a causal mechanism claim.";

export function AssessmentView() {
  const history = useAppStore((state) => state.assessmentHistory);
  const addAssessment = useAppStore((state) => state.addAssessment);
  const notify = useAppStore((state) => state.notify);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [locked, setLocked] = useState(false);
  const submit = () => {
    if (blindAssessmentPrompts.some((_prompt, index) => (answers[String(index)] ?? "").trim().length < 8)) { notify("Complete every blind-assessment field before locking.", "warning"); return; }
    addAssessment({ id: makeId("assessment"), createdAt: new Date().toISOString(), answers, confidence, sourceCase: "v0.9 built-in unfamiliar case" });
    setLocked(true); notify("Blind assessment locked. It remains unscored until rubric review; original answers are preserved.", "success");
  };
  return <div className="page assessment-page"><header className="page-header"><div><span className="eyebrow">BLIND ASSESSMENT</span><h1>Independent unfamiliar-case review</h1><p>No source hints or senior answers are shown before submission.</p></div><div className="assessment-history"><ClipboardCheck size={16} /><span>{history.length} completed</span></div></header><section className="assessment-case"><span>CASE</span><p>{caseText}</p></section><div className="assessment-form">{blindAssessmentPrompts.map((prompt, index) => <label key={prompt}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{prompt}</strong><textarea disabled={locked} rows={3} value={answers[String(index)] ?? ""} onChange={(event) => setAnswers((value) => ({ ...value, [String(index)]: event.target.value }))} /></div></label>)}</div><div className="assessment-submit"><label>Overall confidence<select disabled={locked} value={confidence} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><button className="primary" disabled={locked} onClick={submit}><Lock size={14} /> Lock assessment</button></div>{locked && <section className="assessment-locked"><Lock size={15} /><p>Answers are immutable. Compare longitudinally only after a rubric-based review; completion alone does not raise mastery.</p></section>}</div>;
}

