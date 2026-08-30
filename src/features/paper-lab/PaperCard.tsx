import { useState } from "react";
import { learningContentRegistry } from "../../data/learningArchitecture";
import { hasStandardizedEvidence, projectCapabilityEvidence, type CapabilityId, type LearningContentProgressV1, type TransferArtifactV1 } from "../../domain/learningArchitecture";
import type { LearnerUnitStateV1, LearningEventV1 } from "../../domain/learningKernel";
import { useAppStore } from "../../state/store";

const empty = { researchQuestion: "", whyImportant: "", studyDesign: "", figureEvidenceJobs: "", mainClaim: "", weakestEvidence: "", alternativeExplanation: "", transferableLesson: "", statisticalUnit: "", confounding: "", validation: "", majorConcern: "", evidenceConclusionMismatch: "", maximumDefensibleClaim: "", reviewerCritique: "" };
type FieldKey = keyof typeof empty;
const baseFields: Array<[FieldKey, string]> = [["researchQuestion", "Research Question"], ["whyImportant", "Why Important"], ["studyDesign", "Study Design"], ["figureEvidenceJobs", "Figure 1–N Evidence Jobs"], ["mainClaim", "Main Claim"], ["weakestEvidence", "Weakest Evidence"]];
const gatedFields: Array<[FieldKey, string, string]> = [
  ["statisticalUnit", "Statistical Unit", "需要 Study Design 或 Statistical Reasoning 的独立标准化证据"],
  ["confounding", "Confounding", "需要完成 Confounding 的独立标准化 Apply"],
  ["validation", "Validation", "尚无经过验证的 Validation 教学原型"],
  ["alternativeExplanation", "Alternative Explanation", "需要 Result Interpretation 的独立标准化证据"],
  ["majorConcern", "Major Concern", "需要 Result Interpretation 的延迟保持证据"],
  ["evidenceConclusionMismatch", "Evidence–Conclusion mismatch", "需要 Result Interpretation 的延迟保持证据"],
  ["maximumDefensibleClaim", "Maximum defensible claim", "需要 Result Interpretation 的延迟保持证据"],
  ["reviewerCritique", "Reviewer-style critique", "需要多个相关能力的 retained 证据"],
];

export function getPaperFieldAccess(input: {
  states: LearnerUnitStateV1[];
  events: LearningEventV1[];
  artifacts: TransferArtifactV1[];
  contentProgress: LearningContentProgressV1[];
}): { unlocked: Record<FieldKey, boolean>; level: "Beginner" | "Intermediate" | "Advanced" } {
  const projection = projectCapabilityEvidence({ ...input, transferArtifacts: input.artifacts, contentRegistry: learningContentRegistry });
  const evidence = (capabilityId: CapabilityId, minimum: "independent_once" | "retained") => {
    const value = projection.find((item) => item.capabilityId === capabilityId)?.standardizedEvidence ?? "none";
    return minimum === "independent_once" ? value !== "none" : ["retained", "multiple_context_retained"].includes(value);
  };
  const retainedCount = projection.filter((item) => ["retained", "multiple_context_retained"].includes(item.standardizedEvidence)).length;
  const unlocked: Record<FieldKey, boolean> = {
    researchQuestion: true, whyImportant: true, studyDesign: true, figureEvidenceJobs: true, mainClaim: true, weakestEvidence: true, transferableLesson: true,
    statisticalUnit: evidence("study_design", "independent_once") || evidence("statistical_reasoning", "independent_once"),
    confounding: hasStandardizedEvidence(input.states, "concept-confounding-v1"),
    validation: false,
    alternativeExplanation: evidence("result_interpretation", "independent_once"),
    majorConcern: evidence("result_interpretation", "retained"),
    evidenceConclusionMismatch: evidence("result_interpretation", "retained"),
    maximumDefensibleClaim: evidence("result_interpretation", "retained"),
    reviewerCritique: retainedCount >= 2 || projection.some((item) => item.standardizedEvidence === "multiple_context_retained"),
  };
  const level = unlocked.reviewerCritique ? "Advanced" : gatedFields.some(([key]) => unlocked[key]) ? "Intermediate" : "Beginner";
  return { unlocked, level };
}

export function PaperCard({ paperId }: { paperId: string }) {
  const existing = useAppStore((state) => state.paperCards[paperId]);
  const states = useAppStore((state) => state.learnerUnitStates);
  const events = useAppStore((state) => state.learningEvents);
  const artifacts = useAppStore((state) => state.transferArtifacts);
  const contentProgress = useAppStore((state) => Object.values(state.learningContentProgress));
  const save = useAppStore((state) => state.savePaperCard);
  const recordRoutine = useAppStore((state) => state.recordRoutine);
  const [form, setForm] = useState(existing ? { ...empty, ...existing } : empty);
  const { unlocked, level } = getPaperFieldAccess({ states, events, artifacts, contentProgress });
  const change = (key: FieldKey, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <section className="paper-card"><span className="eyebrow">Paper Studio · {level}</span><h2>字段按具体能力证据开放，不使用全局最高等级</h2>{baseFields.map(([key, label]) => <label key={key}>{label}<textarea rows={2} value={form[key]} onChange={(event) => change(key, event.target.value)}/></label>)}{gatedFields.map(([key, label, requirement]) => unlocked[key] ? <label key={key}>{label}<textarea rows={2} value={form[key]} onChange={(event) => change(key, event.target.value)}/></label> : <div className="paper-field-locked" key={key}><strong>{label}</strong><span>尚未学习该能力 · {requirement}</span></div>)}<label>What I Can Transfer<textarea rows={2} value={form.transferableLesson} onChange={(event) => change("transferableLesson", event.target.value)}/></label><button className="primary" onClick={() => { save(paperId, form); recordRoutine({ routineType: "paper_reading", status: "completed", paperId }); }}>保存 Paper Card</button><small>同一 paperId 在同一周重复保存只计一次阅读。</small></section>;
}
