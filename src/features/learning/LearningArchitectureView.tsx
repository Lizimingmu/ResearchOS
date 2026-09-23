import { ArrowRight, BookOpen, GitBranch, Layers3 } from "lucide-react";
import { useState, type ReactElement } from "react";
import {
  conceptLessons,
  learningArchitectureAssetById,
  learningArchitectureBindingByAssetId,
  learningContentRegistry,
  methodLessons,
} from "../../data/learningArchitecture";
import type { ConceptLessonV1, LearningContentPhase, LearningContentRegistryEntryV1, MethodLessonV1 } from "../../domain/learningArchitecture";
import type { PracticeResponseV1 } from "../../domain/learningKernel";
import { contentPrerequisitesMet, type ArchitectureAttemptKind } from "../../learning/learningArchitectureEngine";
import { useAppStore } from "../../state/store";
import { useShallow } from "zustand/react/shallow";
import { isKnowledgeLearningAllowed } from "../../services/knowledge";
import { KnowledgeMaintenanceNotice } from "../../components/KnowledgeMaintenanceNotice";
import { PracticeActivity } from "./PracticeActivity";
import { PilotFeedbackModal } from "../pilot/PilotFeedbackModal";

function HierarchyExplorer() {
  const [selected, setSelected] = useState<"patient" | "sample" | "cell">();
  return <section className="hierarchy-explorer"><header><Layers3/><div><strong>Hierarchy Explorer</strong><span>目标推断：比较两组患者</span></div></header><div className="hierarchy-tree">{[1, 2].map((patient) => <article key={patient} className={selected === "patient" ? "selected-level" : ""}><button onClick={() => setSelected("patient")}>Patient {patient}</button>{["A", "B"].map((sample) => <div key={sample} className={selected === "sample" ? "selected-level" : ""}><button onClick={() => setSelected("sample")}>Sample {sample}</button><div className={selected === "cell" ? "selected-level cells" : "cells"}>{[1, 2, 3].map((cell) => <button key={cell} onClick={() => setSelected("cell")}>Cell {cell}</button>)}</div></div>)}</article>)}</div>{selected && <div className={`hierarchy-explanation ${selected === "patient" ? "correct" : ""}`}>{selected === "patient" ? "患者层级支持患者组间推断。每位患者贡献一个独立来源。" : selected === "cell" ? "这些细胞按患者聚集并共享来源；更多细胞提高患者内测量精度，但不会创造更多独立患者。" : "组织块仍嵌套在患者内。它能描述取样变异，但患者组间推断仍需在患者层级处理依赖。"}</div>}</section>;
}

const interactions: Record<NonNullable<ConceptLessonV1["interaction"]>, () => ReactElement> = {
  hierarchy_explorer: HierarchyExplorer,
  dag_placeholder: () => <div className="dag-placeholder"><GitBranch/><span>疾病严重度 → 治疗选择</span><span>疾病严重度 → 结局</span><small>先声明结构假设，再决定调整。</small></div>,
};

function ArchitecturePractice({ entry, kind, revision, onAttemptFeedback }: { entry: LearningContentRegistryEntryV1; kind: ArchitectureAttemptKind; revision: number; onAttemptFeedback: (kind: ArchitectureAttemptKind, passed: boolean) => void }) {
  const projects = useAppStore((state) => state.projects);
  const record = useAppStore((state) => state.recordLearningContentPractice);
  const notify = useAppStore((state) => state.notify);
  const assetId = kind === "review" ? entry.reviewAssetId : kind === "remediation" ? entry.remediationAssetId : entry.applyAssetId;
  const asset = assetId ? learningArchitectureAssetById.get(assetId) : undefined;
  const binding = assetId ? learningArchitectureBindingByAssetId.get(assetId) : undefined;
  if (!asset || !binding) return <div className="empty-state"><p>该阶段缺少通过审计的版本化资产。</p></div>;
  return <PracticeActivity key={`${asset.id}:${revision}`} asset={asset} binding={binding} projects={projects} onSubmit={(result) => {
    try {
      const recorded = record(entry.id, kind, result.response as PracticeResponseV1, result.confidence ?? 2);
      onAttemptFeedback(kind, recorded.passed);
    } catch (error) {
      notify(String(error), "error");
    }
  }} onContinue={(passed) => onAttemptFeedback(kind, passed)}/>;
}

function ConceptSurface({ lesson, entry }: { lesson: ConceptLessonV1; entry: LearningContentRegistryEntryV1 }) {
  const stored = useAppStore((state) => state.learningContentProgress[lesson.id]);
  const learner = useAppStore((state) => state.learnerUnitStates.find((item) => item.unitId === lesson.unitId));
  const setPhase = useAppStore((state) => state.setLearningContentPhase);
  const recordExplanationAttempt = useAppStore((state) => state.recordExplanationAttempt);
  const [explanation, setExplanation] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: ArchitectureAttemptKind; passed: boolean }>();
  const [pilotFeedbackOpen, setPilotFeedbackOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const phase = feedback ? (feedback.kind === "review" ? "review" : feedback.kind === "remediation" ? "remediation" : "apply") : (stored?.phase ?? "learn");
  const Interaction = lesson.interaction ? interactions[lesson.interaction] : undefined;
  const due = learner?.stage === "review_eligible" && learner.dueAt ? Date.parse(learner.dueAt) <= Date.now() : false;
  const afterFeedback = (kind: ArchitectureAttemptKind, passed: boolean) => {
    if (!feedback) { setFeedback({ kind, passed }); return; }
    setFeedback(undefined); setRevision((value) => value + 1);
    setPhase(lesson.id, kind === "review" ? (passed ? "review" : "apply") : passed ? "review" : "remediation", { remediationNeeded: !passed });
    if (passed) {
      setPilotFeedbackOpen(true);
    }
  };
  const submitExplanation = () => {
    recordExplanationAttempt(lesson.id);
    setPhase(lesson.id, "apply", { explainCompleted: true });
  };
  const defaultChecklist = [
    "我有没有说清研究对象？",
    "有没有说明独立单位？",
    "有没有说明这个概念为什么影响结论？",
    "有没有举一个反例？",
  ];
  const checklist = [...new Set([...(lesson.explanationChecklistCn ?? []), ...defaultChecklist])];
  const navItems: LearningContentPhase[] = ["learn", "explain", "apply", ...(stored?.remediationNeeded ? ["remediation" as const] : []), ...(learner?.competence.level && learner.competence.level !== "unassessed" ? ["review" as const] : [])];
  return <section className="concept-surface"><header><span className="eyebrow">Concept Lesson · Learn → Explain → Apply</span><h1>{lesson.titleCn}</h1><p>{lesson.titleEn}</p><nav>{navItems.map((item) => <button key={item} className={phase === item ? "active" : ""} disabled={item === "apply" && !stored?.explainCompleted} onClick={() => setPhase(lesson.id, item)}>{item}</button>)}</nav></header>
    {phase === "learn" && <div className="coherent-lesson"><article><strong>Why it matters</strong><p>{lesson.whyItMattersCn}</p></article><article><strong>Intuition</strong><p>{lesson.intuitionCn}</p></article><article><strong>Precise explanation</strong><p>{lesson.preciseExplanationCn}</p></article><article><strong>Worked example</strong><p>{lesson.workedExampleCn}</p></article>{Interaction && <Interaction/>}<button className="primary" onClick={() => setPhase(lesson.id, "explain")}>用自己的话解释 <ArrowRight size={14}/></button></div>}
    {phase === "explain" && <div className="explain-phase">
      <span className="eyebrow">Explain Phase · 自己说一次</span>
      <h2>用你自己的话解释这个概念</h2>
      <p style={{ margin: "6px 0 14px", color: "var(--color-muted, #718096)", fontSize: "14px" }}>{lesson.explainPromptCn}</p>
      <textarea rows={6} value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="写 1–3 句；用你自己的话写出核心机制。系统不会把自由文本伪装成能力分数，仅记录真实表达尝试。"/>
      <div style={{ marginTop: "12px", padding: "12px 16px", borderRadius: "8px", background: "var(--color-bg-subtle, #f7fafc)", border: "1px solid var(--color-border, #e2e8f0)" }}>
        <strong style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>自检清单（思考是否覆盖）：</strong>
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: "1.7" }}>
          {checklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <button className="primary" style={{ marginTop: "16px" }} disabled={explanation.trim().length < 8} onClick={submitExplanation}>我已尝试解释，进入版本化 Apply <ArrowRight size={14}/></button>
    </div>}
    {phase === "apply" && <div className="apply-phase"><span className="eyebrow">Versioned Apply · locked response · no hints</span><p>{lesson.applyPromptCn}</p><ArchitecturePractice entry={entry} kind="apply" revision={revision} onAttemptFeedback={afterFeedback}/></div>}
    {phase === "remediation" && <div className="remediation"><h2>Adaptive Remediation</h2><p>{lesson.remediationExplanationCn}</p><button onClick={() => setHintOpen((value) => !value)}>{hintOpen ? "收起概念提示" : "查看概念提示（在新题前）"}</button>{hintOpen && <p>{lesson.remediationPromptCn}</p>}<ArchitecturePractice entry={entry} kind="remediation" revision={revision} onAttemptFeedback={afterFeedback}/></div>}
    {phase === "review" && (due ? <ArchitecturePractice entry={entry} kind="review" revision={revision} onAttemptFeedback={afterFeedback}/> : <section className="learning-wait"><h2>独立 Apply 已锁定</h2><p>能力状态：{learner?.competence.level ?? "unassessed"}。复习使用不同场景，并且只在到期后开放。</p>{learner?.dueAt && <p>到期时间：{new Date(learner.dueAt).toLocaleString("zh-CN")}</p>}</section>)}
    <PilotFeedbackModal isOpen={pilotFeedbackOpen} lessonId={lesson.id} lessonTitle={lesson.titleCn} onClose={() => setPilotFeedbackOpen(false)} />
  </section>;
}

function MethodSurface({ lesson, entry }: { lesson: MethodLessonV1; entry: LearningContentRegistryEntryV1 }) {
  const progress = useAppStore((state) => state.learningContentProgress[lesson.id]);
  const learner = useAppStore((state) => state.learnerUnitStates.find((item) => item.unitId === lesson.unitId));
  const setPhase = useAppStore((state) => state.setLearningContentPhase);
  const [feedback, setFeedback] = useState<{ kind: ArchitectureAttemptKind; passed: boolean }>();
  const [hintOpen, setHintOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const phase = feedback ? (feedback.kind === "review" ? "review" : feedback.kind === "remediation" ? "remediation" : "apply") : (progress?.phase === "review" ? "review" : progress?.phase === "remediation" ? "remediation" : progress?.phase === "apply" ? "apply" : "learn");
  const due = learner?.stage === "review_eligible" && learner.dueAt ? Date.parse(learner.dueAt) <= Date.now() : false;
  const [pilotFeedbackOpen, setPilotFeedbackOpen] = useState(false);
  const afterFeedback = (kind: ArchitectureAttemptKind, passed: boolean) => {
    if (!feedback) { setFeedback({ kind, passed }); return; }
    setFeedback(undefined); setRevision((value) => value + 1); setPhase(lesson.id, kind === "review" ? (passed ? "review" : "apply") : passed ? "review" : "remediation", { remediationNeeded: !passed });
    if (passed) {
      setPilotFeedbackOpen(true);
    }
  };
  if (phase === "apply") return <section className="method-lesson"><header><span className="eyebrow">Method Lesson · Methods audit Apply</span><h1>{lesson.titleCn}</h1><p>{lesson.applyPromptCn}</p></header><ArchitecturePractice entry={entry} kind="apply" revision={revision} onAttemptFeedback={afterFeedback}/></section>;
  if (phase === "remediation") return <section className="method-lesson remediation"><header><span className="eyebrow">Method Lesson · targeted remediation</span><h1>{lesson.titleCn}</h1></header><p>{lesson.remediationExplanationCn}</p><button onClick={() => setHintOpen((value) => !value)}>{hintOpen ? "收起概念提示" : "查看概念提示（在新题前）"}</button>{hintOpen && <p>{lesson.remediationPromptCn}</p>}<ArchitecturePractice entry={entry} kind="remediation" revision={revision} onAttemptFeedback={afterFeedback}/></section>;
  if (phase === "review") return <section className="method-lesson"><header><span className="eyebrow">Method Lesson · delayed review</span><h1>{lesson.titleCn}</h1></header>{due ? <ArchitecturePractice entry={entry} kind="review" revision={revision} onAttemptFeedback={afterFeedback}/> : <section className="learning-wait"><h2>Methods audit 已锁定</h2><p>能力状态：{learner?.competence.level ?? "unassessed"}。新的 review 场景将在到期后开放。</p>{learner?.dueAt && <p>到期时间：{new Date(learner.dueAt).toLocaleString("zh-CN")}</p>}</section>}</section>;
  return <section className="method-lesson"><header><span className="eyebrow">Method Lesson · extensible method contract</span><h1>{lesson.titleCn}</h1><p>{lesson.titleEn}</p></header><article><h2>Scientific question</h2><p>{lesson.scientificQuestionCn}</p></article><div className="method-grid"><article><h3>Input</h3><ul>{lesson.inputsCn.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h3>Output</h3><ul>{lesson.outputsCn.map((item) => <li key={item}>{item}</li>)}</ul></article></div><article><h2>Core logic</h2><p>{lesson.coreLogicCn}</p></article><article><h2>Critical assumptions</h2><ul>{lesson.assumptionsCn.map((item) => <li key={item}>{item}</li>)}</ul></article><div className="method-grid"><article><h3>Appropriate when</h3><ul>{lesson.appropriateWhenCn.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h3>Not appropriate when</h3><ul>{lesson.inappropriateWhenCn.map((item) => <li key={item}>{item}</li>)}</ul></article></div><article><h2>Common misuse</h2><ul>{lesson.misusePatternsCn.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h2>Reviewer checks</h2><ul>{lesson.reviewerChecksCn.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h2>How it appears in a paper</h2><p>{lesson.paperAppearanceCn}</p></article><button className="primary" onClick={() => setPhase(lesson.id, "apply", { explainCompleted: true })}>进入 Methods audit Apply</button><PilotFeedbackModal isOpen={pilotFeedbackOpen} lessonId={lesson.id} lessonTitle={lesson.titleCn} onClose={() => setPilotFeedbackOpen(false)} /></section>;
}

export function LearningArchitectureView({ onOpenLegacy }: { onOpenLegacy: () => void }) {
  const selectedId = useAppStore((state) => state.selectedLearningContentId);
  const select = useAppStore((state) => state.selectLearningContent);
  const progress = useAppStore(useShallow((state) => Object.values(state.learningContentProgress)));
  const states = useAppStore((state) => state.learnerUnitStates);
  const knowledgeWorkspace = useAppStore((state) => state.knowledgeWorkspace);
  const selectedConcept = conceptLessons.find((item) => item.id === selectedId) ?? (!methodLessons.some((item) => item.id === selectedId) ? conceptLessons[0] : undefined);
  const selectedMethod = methodLessons.find((item) => item.id === selectedId);
  const entry = learningContentRegistry.find((item) => item.id === (selectedConcept?.id ?? selectedMethod?.id));
  const gate = entry ? contentPrerequisitesMet(entry, { registry: learningContentRegistry, progress, states }) : false;
  return <div className="learn-architecture"><aside><span className="eyebrow">LEARN</span><h2>Thread A · Foundation</h2>{conceptLessons.map((lesson) => <button key={lesson.id} className={lesson.id === selectedId ? "active" : ""} onClick={() => select(lesson.id)}><BookOpen size={14}/><span>{lesson.titleCn}<small>Concept Lesson</small></span></button>)}<h2>Thread B · Project Overlay</h2>{methodLessons.map((lesson) => <button key={lesson.id} className={lesson.id === selectedId ? "active" : ""} onClick={() => select(lesson.id)}><Layers3 size={14}/><span>{lesson.titleCn}<small>Method Lesson</small></span></button>)}<button className="subtle" onClick={onOpenLegacy}>查看 M017 兼容学习记录</button></aside><main className="scrollable">{entry && (!isKnowledgeLearningAllowed(knowledgeWorkspace, entry.id) || (entry.unitId && !isKnowledgeLearningAllowed(knowledgeWorkspace, entry.unitId))) ? <KnowledgeMaintenanceNotice/> : entry && gate ? <>{selectedConcept && <ConceptSurface lesson={selectedConcept} entry={entry}/>} {selectedMethod && <MethodSurface lesson={selectedMethod} entry={entry}/>}</> : <section className="learning-wait"><h2>前置能力尚未建立</h2><p>请先在 Foundation Thread 中通过所需 Concept 的无提示标准 Apply。项目相关性不能绕过先修条件。</p></section>}</main></div>;
}
