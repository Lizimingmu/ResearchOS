import { ClipboardCheck, Lock, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { blindAssessmentPrompts } from "../../data/starterTrack";
import type { Confidence } from "../../domain/types";
import { makeId } from "../../lib/ids";
import { useAppStore } from "../../state/store";

const cases = [
  { id: "unfamiliar-oncology-omics-v1", text: "A retrospective multi-center oncology cohort derives a 42-gene recurrence model from bulk RNA-seq. Feature selection, normalization, model tuning, and a random patient split are described. The authors add cell-level scRNA associations in four validation tumors and an AI plan proposes pooled-cell DEG, raw P<.05, KEGG, and a causal mechanism claim." },
  { id: "unfamiliar-diagnostic-ai-v1", text: "A diagnostic imaging model is trained on surgically verified cases and healthy controls from one hospital. Images from the same patient can enter multiple splits. The proposed report gives AUC, chooses a threshold on the test set, and claims clinical utility for community screening." },
  { id: "unfamiliar-spatial-causal-v1", text: "Six tumors from responders and six from nonresponders undergo spot-based spatial transcriptomics. One section per patient is analyzed. An AI plan treats spots as replicates, infers ligand–receptor communication from co-location, and claims the pathway causes treatment response." },
];

const rubric = [
  ["question", "States population, target question/estimand, time origin, and conclusion scale."],
  ["design", "Identifies design mismatch, selection, leakage, or timing threats before choosing a model."],
  ["unit", "Names the independent biological unit and respects nesting or clustering."],
  ["bias", "Prioritizes the biases most capable of reversing the claim and names missing assumptions."],
  ["analysis", "Proposes an analysis aligned with design, multiplicity, missingness, and uncertainty."],
  ["oversight", "Rejects unsafe AI steps and requires evidence/provenance for generated content."],
  ["boundary", "States a maximal conclusion no stronger than the measurements and design support."],
  ["transfer", "Names a concrete verification or workflow change that transfers beyond this case."],
] as const;

export function AssessmentView() {
  const history = useAppStore((state) => state.assessmentHistory);
  const addAssessment = useAppStore((state) => state.addAssessment);
  const updateAssessment = useAppStore((state) => state.updateAssessment);
  const notify = useAppStore((state) => state.notify);
  const active = history.find((item) => item.score === undefined && item.rubricVersion === "research-judgment-v1");
  const completed = history.filter((item) => item.score !== undefined);
  const baselineAvailable = !history.some((item) => item.kind === "baseline" && item.score !== undefined);
  const [assessmentKind] = useState<"baseline" | "blind">(active?.kind ?? (baselineAvailable ? "baseline" : "blind"));
  const baseline = assessmentKind === "baseline";
  const selectedCase = cases.find((item) => item.id === active?.sourceCase) ?? cases[baseline ? 0 : completed.length % cases.length];
  const [answers, setAnswers] = useState<Record<string, string>>(active?.answers ?? {});
  const [confidence, setConfidence] = useState<Confidence>(active?.confidence ?? 2);
  const [assessmentId, setAssessmentId] = useState(active?.id);
  const [ratings, setRatings] = useState<Record<string, number>>(active?.domainScores ?? {});
  const [finalized, setFinalized] = useState(Boolean(active?.score !== undefined));
  const locked = Boolean(assessmentId);
  const historySummary = useMemo(() => completed.slice(0, 3).map((item) => `${item.kind ?? "blind"}: ${Math.round(item.score ?? 0)}`).join(" · "), [completed]);

  const submit = () => {
    if (blindAssessmentPrompts.some((_prompt, index) => (answers[String(index)] ?? "").trim().length < 8)) { notify("锁定前请完成盲测的每一项作答。", "warning"); return; }
    const id = makeId("assessment");
    addAssessment({ id, createdAt: new Date().toISOString(), answers, confidence, sourceCase: selectedCase.id, kind: baseline ? "baseline" : "blind", rubricVersion: "research-judgment-v1" });
    setAssessmentId(id);
    notify("评估已锁定。请应用量规；仅仅完成作答不会提高掌握度。", "success");
  };

  const finalize = () => {
    if (!assessmentId || rubric.some(([key]) => ratings[key] === undefined)) { notify("完成前请评价量规的每个维度。", "warning"); return; }
    const domainScores = Object.fromEntries(rubric.map(([key]) => [key, ratings[key]]));
    const score = Object.values(domainScores).reduce((sum, value) => sum + value, 0) / (rubric.length * 2) * 100;
    updateAssessment(assessmentId, { domainScores, score, kind: baseline ? "baseline" : "blind" });
    setFinalized(true);
    notify("量规结果已保存，可用于纵向比较。系统未自动添加任何掌握度证据。", "success");
  };

  return (
    <div className="page assessment-page">
      <header className="page-header"><div><span className="eyebrow">{baseline ? "基线盲测" : "盲测评估"}</span><h1>独立审查陌生案例</h1><p>提交前不会显示来源提示、量规或专家答案。</p></div><div className="assessment-history"><ClipboardCheck size={16} /><span>已完成 {completed.length} 次<small>{historySummary || "暂无纵向评分"}</small></span></div></header>
      <section className="assessment-case"><span>CASE · {selectedCase.id}</span><p>{selectedCase.text}</p></section>
      <div className="assessment-form">{blindAssessmentPrompts.map((prompt, index) => <label key={prompt}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{prompt}</strong><textarea disabled={locked} rows={3} value={answers[String(index)] ?? ""} onChange={(event) => setAnswers((value) => ({ ...value, [String(index)]: event.target.value }))} /></div></label>)}</div>
      <div className="assessment-submit"><label>总体信心<select disabled={locked} value={confidence} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><button className="primary" disabled={locked} onClick={submit}><Lock size={14} /> 锁定评估</button></div>
      {locked && <section className="assessment-rubric"><div className="stage-kicker"><span>量规 · research-judgment-v1</span><span><ShieldCheck size={12} /> 用于自我校准，不代表掌握</span></div>{rubric.map(([key, description]) => <div className="rubric-row" key={key}><div><strong>{key}</strong><p>{description}</p></div><div>{[0,1,2].map((value) => <button key={value} disabled={finalized} className={ratings[key] === value ? "selected" : ""} onClick={() => setRatings((current) => ({ ...current, [key]: value }))}>{value}<small>{value === 0 ? "遗漏" : value === 1 ? "部分支持" : "有充分支持"}</small></button>)}</div></div>)}<button className="primary" disabled={finalized} onClick={finalize}>{finalized ? "量规已保存" : "完成量规评分"}</button></section>}
    </div>
  );
}
