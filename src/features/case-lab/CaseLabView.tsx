import { ArrowRight, LockKeyhole, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { researchCases } from "../../data/learningArchitecture";
import { useAppStore } from "../../state/store";

export function CaseLabView() {
  const selectedCaseId = useAppStore((state) => state.selectedCaseId);
  const researchCase = researchCases.find((item) => item.id === selectedCaseId) ?? researchCases.find((item) => item.lifecycle === "active");
  const sessions = useAppStore((state) => state.caseSessions);
  const start = useAppStore((state) => state.startCaseSession);
  const lockStage = useAppStore((state) => state.lockCaseStage);
  const updateStage = useAppStore((state) => state.updateCaseStage);
  const continueStage = useAppStore((state) => state.continueCaseStage);
  const completeCase = useAppStore((state) => state.completeCaseSession);
  const createArtifact = useAppStore((state) => state.createTransferArtifact);
  const [sessionId, setSessionId] = useState(researchCase ? sessions.find((item) => item.caseId === researchCase.id && !item.completedAt)?.id : undefined);
  const [reasoning, setReasoning] = useState("");
  const [decision, setDecision] = useState("");
  const [boundary, setBoundary] = useState("");
  const [update, setUpdate] = useState("");
  const [finalResponse, setFinalResponse] = useState<Record<string, string>>(researchCase ? Object.fromEntries(researchCase.finalTask.map((item) => [item, ""])) : {});
  const session = useAppStore((state) => state.caseSessions.find((item) => item.id === sessionId));
  const stage = session && researchCase ? researchCase.stages[session.currentStageIndex] : undefined;
  const pendingEntry = session?.pendingCalibrationStageId ? session.reasoningHistory.find((entry) => entry.stageId === session.pendingCalibrationStageId) : undefined;
  const timeline = useMemo(() => session?.reasoningHistory ?? [], [session]);
  if (!researchCase) return <div className="page case-lab"><div className="empty-state"><h1>没有可用的 Case Lab</h1></div></div>;
  const begin = () => setSessionId(start(researchCase.id));
  const submit = () => {
    if (!session || !stage || reasoning.trim().length < 20) return;
    lockStage(session.id, { stageId: stage.id, reasoning: reasoning.trim(), structuredDecision: decision.trim() || undefined, claimBoundary: boundary.trim() || undefined });
    setReasoning(""); setDecision(""); setBoundary(""); setUpdate("");
  };
  const continueAfterCalibration = () => {
    if (!session) return;
    if (update.trim()) updateStage(session.id, update);
    continueStage(session.id);
    setUpdate("");
  };
  const makeArtifact = () => {
    if (!session?.completedAt) return;
    createArtifact({ sourceType: "case", sourceId: session.id, conceptIds: ["research-question", "evidence-claim"], capabilityIds: ["scientific_question", "result_interpretation", "next_step_design"], question: researchCase.titleCn, userReasoning: `${timeline.map((entry) => `${entry.stageId}: ${entry.reasoning}${entry.update ? `\nUpdate: ${entry.update}` : ""}`).join("\n")}
Final: ${JSON.stringify(session.finalResponse)}`, claimBoundary: session.finalResponse?.["最大可辩护结论"] ?? timeline.at(-1)?.claimBoundary, nextStep: session.finalResponse?.["下一项最小充分分析或验证"], linkedLearningEventIds: [] });
  };
  if (!session) return <div className="page case-lab"><header className="page-header"><div><span className="eyebrow">Case Lab · Interrupted research case</span><h1>{researchCase.titleCn}</h1><p>{researchCase.initialContext}</p></div></header><button className="primary" onClick={begin}>开始分阶段案例 <ArrowRight size={14}/></button></div>;
  return <div className="case-lab-layout"><aside className="decision-timeline"><span className="eyebrow">Decision Timeline</span><h2>判断如何变化</h2>{timeline.map((entry, index) => <article key={entry.stageId}><i>{index + 1}</i><div><strong>{researchCase.stages.find((item) => item.id === entry.stageId)?.titleCn}</strong><p>{entry.reasoning}</p>{entry.claimBoundary && <small>原始边界：{entry.claimBoundary}</small>}{entry.expertCalibration && <small>专家校准：{entry.expertCalibration}</small>}{entry.update && <small>我的更新：{entry.update}</small>}</div></article>)}{stage && !session.pendingCalibrationStageId && <article className="current"><i>{timeline.length + 1}</i><strong>{stage.titleCn}</strong></article>}{!stage && <article className={session.completedAt ? "complete" : "current"}><i>{session.completedAt ? "✓" : timeline.length + 1}</i><strong>Final claim / next step</strong></article>}</aside><main className="case-stage scrollable"><header><span className="eyebrow">{researchCase.domain} · {researchCase.difficulty}</span><h1>{stage?.titleCn ?? (session.completedAt ? "案例完成" : "Final Task")}</h1></header>
    {stage && !session.pendingCalibrationStageId ? <>{stage.evidenceBlocks.map((block) => <section className="evidence-block" key={block.titleCn}><strong>{block.titleCn}</strong>{block.type === "table" ? <table><thead><tr>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{block.rows.map((row) => <tr key={row.join("|")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table> : block.type === "numeric_summary" ? <dl>{block.values.map((value) => <div key={value.labelCn}><dt>{value.labelCn}</dt><dd>{value.value}</dd></div>)}</dl> : <p>{block.bodyCn}</p>}</section>)}{stage.structuredPrompt && <label>{stage.structuredPrompt}<input value={decision} onChange={(event) => setDecision(event.target.value)}/></label>}<label>{stage.reasoningPrompt}<textarea rows={6} value={reasoning} onChange={(event) => setReasoning(event.target.value)} placeholder="先留下当前判断；锁定后才显示专家校准。"/></label>{stage.claimBoundaryPrompt && <label>{stage.claimBoundaryPrompt}<textarea rows={3} value={boundary} onChange={(event) => setBoundary(event.target.value)}/></label>}<button className="primary" disabled={reasoning.trim().length < 20} onClick={submit}><LockKeyhole size={14}/>锁定当前判断</button></> : stage && pendingEntry ? <section className="case-calibration"><span className="eyebrow">Expert calibration · original response preserved</span><h2>专家校准</h2><p>{pendingEntry.expertCalibration}</p>{stage.updatePrompt && <label>{stage.updatePrompt}<textarea rows={4} value={update} onChange={(event) => setUpdate(event.target.value)} placeholder="可选：记录你在看到校准后如何更新判断。原回答不会被覆盖。"/></label>}<button className="primary" onClick={continueAfterCalibration}>继续到下一证据 <ArrowRight size={14}/></button></section> : !session.completedAt ? <section className="case-final"><p>综合全部证据后再锁定最终判断；不会生成总分。</p>{researchCase.finalTask.map((item) => <label key={item}>{item}<textarea rows={2} value={finalResponse[item]} onChange={(event) => setFinalResponse((current) => ({ ...current, [item]: event.target.value }))}/></label>)}<button className="primary" disabled={Object.values(finalResponse).some((value) => value.trim().length < 4)} onClick={() => completeCase(session.id, finalResponse)}><LockKeyhole size={14}/>锁定 Final Task</button></section> : <section className="case-final"><h2>案例已完成</h2><p>结果不压缩成总分。请沿左侧时间线检查原始解释、专家校准和自己的更新。</p>{Object.entries(session.finalResponse ?? {}).map(([key, value]) => <article key={key}><strong>{key}</strong><p>{value}</p></article>)}<button className="primary" onClick={makeArtifact}>生成 / 更新 Case Transfer Artifact</button><button onClick={() => setSessionId(undefined)}><RotateCcw size={14}/>返回案例入口</button></section>}
  </main></div>;
}
