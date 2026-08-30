import { BookOpen, Brain, Database, FlaskConical, Microscope, SearchCheck, Sparkles, Target } from "lucide-react";
import { capabilityLabels, projectCapabilityEvidence, type CapabilityId } from "../../domain/learningArchitecture";
import { useAppStore } from "../../state/store";

const icons: Record<CapabilityId, typeof Target> = { scientific_question: Target, study_design: FlaskConical, statistical_reasoning: Brain, omics_reasoning: Microscope, literature_reading: BookOpen, result_interpretation: SearchCheck, next_step_design: Sparkles, ai_oversight: Database };
const exposureLabels = { not_studied: "尚未系统学习", learning: "学习中", core_completed: "核心学习已完成" };
const evidenceLabels = { none: "暂无标准化证据", independent_once: "独立证明一次", retained: "间隔后保持", multiple_context_retained: "多情境保持" };

export function SkillMapView() {
  const states = useAppStore((state) => state.learnerUnitStates), events = useAppStore((state) => state.learningEvents), artifacts = useAppStore((state) => state.transferArtifacts), legacyEvidence = useAppStore((state) => state.skillEvidence);
  const projection = projectCapabilityEvidence({ states, events, transferArtifacts: artifacts });
  return <div className="page progress-page"><header className="page-header"><div><span className="eyebrow">Progress · Capability Evidence Projection</span><h1>八项核心科研能力</h1><p>学习暴露、标准化证据与真实迁移分别呈现，不用虚假 0–100 分数。</p></div><div className="evidence-count"><Database/><span>{events.filter((event) => event.competenceEligible).length} 条 Kernel 证据 · {artifacts.length} 个 Transfer Artifacts</span></div></header><div className="capability-grid">{projection.map((item) => { const Icon = icons[item.capabilityId]; return <article key={item.capabilityId}><Icon/><h2>{capabilityLabels[item.capabilityId]}</h2><div><span>Exposure</span><strong>{exposureLabels[item.exposure]}</strong></div><div><span>Standardized evidence</span><strong>{evidenceLabels[item.standardizedEvidence]}</strong></div><div><span>Transfer artifacts</span><strong>{item.transferArtifactCount}{item.recentTransferContext ? ` · 最近 ${item.recentTransferContext}` : ""}</strong></div><small>{item.evidenceEventIds.length} 个去重的 source event ID</small></article>; })}</div><section className="skill-caution"><strong>投影而非复制</strong><p>Learning Kernel event 只保留一份，由 capability mapping 投影到这里；Transfer Artifact 代表真实情境应用，不自动升级 mastery。旧练习证据仍保留 {legacyEvidence.length} 条，并在 Other Practice Reviews 中继续使用。</p></section></div>;
}
