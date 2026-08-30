import { ArrowRight, LockKeyhole, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { researchCases } from "../../data/learningArchitecture";
import { useAppStore } from "../../state/store";

export function CaseLabView() {
  const researchCase = researchCases[0];
  const sessions = useAppStore((state) => state.caseSessions);
  const start = useAppStore((state) => state.startCaseSession);
  const lockStage = useAppStore((state) => state.lockCaseStage);
  const completeCase = useAppStore((state) => state.completeCaseSession);
  const createArtifact = useAppStore((state) => state.createTransferArtifact);
  const [sessionId, setSessionId] = useState(sessions.find((item) => item.caseId === researchCase.id && !item.completedAt)?.id);
  const [reasoning, setReasoning] = useState("");
  const [decision, setDecision] = useState("");
  const [boundary, setBoundary] = useState("");
  const [finalResponse, setFinalResponse] = useState<Record<string, string>>(Object.fromEntries(researchCase.finalTask.map((item) => [item, ""])));
  const session = useAppStore((state) => state.caseSessions.find((item) => item.id === sessionId));
  const stage = session ? researchCase.stages[session.currentStageIndex] : undefined;
  const timeline = useMemo(() => session?.reasoningHistory ?? [], [session]);
  const begin = () => setSessionId(start(researchCase.id));
  const submit = () => {
    if (!session || !stage || reasoning.trim().length < 20) return;
    lockStage(session.id, { stageId: stage.id, reasoning: reasoning.trim(), structuredDecision: decision.trim() || undefined, claimBoundary: boundary.trim() || undefined });
    setReasoning(""); setDecision(""); setBoundary("");
  };
  const makeArtifact = () => {
    if (!session?.completedAt) return;
    createArtifact({ sourceType: "case", sourceId: session.id, conceptIds: ["research-question", "evidence-claim"], capabilityIds: ["scientific_question", "result_interpretation", "next_step_design"], question: researchCase.titleCn, userReasoning: `${timeline.map((entry) => `${entry.stageId}: ${entry.reasoning}`).join("\n")}\nFinal: ${JSON.stringify(session.finalResponse)}`, claimBoundary: session.finalResponse?.["最大可辩护结论"] ?? timeline.at(-1)?.claimBoundary, nextStep: session.finalResponse?.["下一项最小充分分析或验证"], linkedLearningEventIds: [] });
  };
  if (!session) return <div className="page case-lab"><header className="page-header"><div><span className="eyebrow">Case Lab · Interrupted research case</span><h1>{researchCase.titleCn}</h1><p>{researchCase.initialContext}</p></div></header><button className="primary" onClick={begin}>开始分阶段案例 <ArrowRight size={14}/></button></div>;
  return <div className="case-lab-layout"><aside className="decision-timeline"><span className="eyebrow">Decision Timeline</span><h2>判断如何变化</h2>{timeline.map((entry, index) => <article key={entry.stageId}><i>{index + 1}</i><div><strong>{researchCase.stages.find((item) => item.id === entry.stageId)?.titleCn}</strong><p>{entry.reasoning}</p>{entry.claimBoundary && <small>边界：{entry.claimBoundary}</small>}</div></article>)}{stage && <article className="current"><i>{timeline.length + 1}</i><strong>{stage.titleCn}</strong></article>}{!stage && <article className={session.completedAt ? "complete" : "current"}><i>{session.completedAt ? "✓" : timeline.length + 1}</i><strong>Final claim / next step</strong></article>}</aside><main className="case-stage scrollable"><header><span className="eyebrow">{researchCase.domain} · {researchCase.difficulty}</span><h1>{stage?.titleCn ?? (session.completedAt ? "案例完成" : "Final Task")}</h1></header>{stage ? <>{stage.evidenceBlocks.map((block) => <section className="evidence-block" key={block.titleCn}><strong>{block.titleCn}</strong>{block.type === "table" ? <table><thead><tr>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{block.rows.map((row) => <tr key={row.join("|")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table> : block.type === "numeric_summary" ? <dl>{block.values.map((value) => <div key={value.labelCn}><dt>{value.labelCn}</dt><dd>{value.value}</dd></div>)}</dl> : <p>{block.bodyCn}</p>}</section>)}{stage.structuredPrompt && <label>{stage.structuredPrompt}<input value={decision} onChange={(event) => setDecision(event.target.value)}/></label>}<label>{stage.reasoningPrompt}<textarea rows={6} value={reasoning} onChange={(event) => setReasoning(event.target.value)} placeholder="先留下当前判断；锁定后才揭示下一层证据。"/></label>{stage.claimBoundaryPrompt && <label>{stage.claimBoundaryPrompt}<textarea rows={3} value={boundary} onChange={(event) => setBoundary(event.target.value)}/></label>}<button className="primary" disabled={reasoning.trim().length < 20} onClick={submit}><LockKeyhole size={14}/>锁定判断并揭示下一证据</button></> : !session.completedAt ? <section className="case-final"><p>综合全部证据后再锁定最终判断；不会生成总分。</p>{researchCase.finalTask.map((item) => <label key={item}>{item}<textarea rows={2} value={finalResponse[item]} onChange={(event) => setFinalResponse((current) => ({ ...current, [item]: event.target.value }))}/></label>)}<button className="primary" disabled={Object.values(finalResponse).some((value) => value.trim().length < 4)} onClick={() => completeCase(session.id, finalResponse)}><LockKeyhole size={14}/>锁定 Final Task</button></section> : <section className="case-final"><h2>案例已完成</h2><p>结果不压缩成总分。请沿左侧时间线检查自己的解释如何随证据改变。</p>{Object.entries(session.finalResponse ?? {}).map(([key, value]) => <article key={key}><strong>{key}</strong><p>{value}</p></article>)}<button className="primary" onClick={makeArtifact}>生成 Case Transfer Artifact</button><button onClick={() => setSessionId(undefined)}><RotateCcw size={14}/>返回案例入口</button></section>}</main></div>;
}
