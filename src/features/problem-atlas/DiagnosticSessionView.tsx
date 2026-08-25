import { useMemo, useState } from "react";
import { Check, History, Lightbulb, Lock, ShieldCheck } from "lucide-react";
import type { Confidence } from "../../domain/types";
import type {
  DiagnosticCause,
  DiagnosticEvidence,
  DiagnosticModeId,
  DiagnosticPath,
  DiagnosticSession,
  FailureLayer,
  ProblemCard,
  ProblemTrainingCase,
  SessionJudgmentInput,
} from "../../domain/problemAtlas";
import {
  completeSession,
  createDiagnosticSession,
  evidenceFor,
  farTransferPrompt,
  gradeSession,
  isStepLocked,
  lockSessionStep,
  modeSkillId,
  nextPathNode,
  stepOf,
  VERDICTS,
  type AiVerdict,
} from "../../problem-atlas/diagnosticEngine";
import { layerLabel, modeLabel, rankLabel, severityLabelAtlas, verdictLabel } from "../../problem-atlas/labels";
import { useAppStore } from "../../state/store";

export type ModeState = DiagnosticModeId;

interface SessionViewProps {
  card: ProblemCard;
  mode: ModeState;
}

function sessionSummary(session: DiagnosticSession): string {
  const parts = session.steps
    .filter((step) => step.kind !== "calibration")
    .map((step) => `${step.id}(${step.kind})=${JSON.stringify(step.payload)}`);
  return `科研问题诊断会话 [${session.problemId}/${session.mode}]：${parts.join("；")}`;
}

function CauseRanker({ causes, ranked, onRank }: { causes: DiagnosticCause[]; ranked: string[]; onRank: (next: string[]) => void }) {
  const remaining = causes.filter((cause) => !ranked.includes(cause.id));
  return (
    <div className="atlas-ranker">
      <div className="atlas-ranker-placed">
        {ranked.map((id, index) => {
          const cause = causes.find((item) => item.id === id);
          if (!cause) return null;
          return (
            <button key={id} className="atlas-rank-chip placed" onClick={() => onRank(ranked.filter((item) => item !== id))}>
              <em>{rankLabel(index)}</em><span>{cause.labelCn}（{cause.labelEn}）</span><small>{cause.mechanism}</small>
            </button>
          );
        })}
        {ranked.length === 0 && <p className="atlas-ranker-empty">按 最可能 → 基本排除 的顺序点击下方原因。</p>}
      </div>
      <div className="atlas-ranker-pool">
        {remaining.map((cause) => (
          <button key={cause.id} className="atlas-rank-chip" onClick={() => onRank([...ranked, cause.id])}>
            <span>{cause.labelCn}（{cause.labelEn}）</span><small>{cause.mechanism}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function LayerPicker({ selected, onSelect }: { selected: FailureLayer | ""; onSelect: (layer: FailureLayer) => void }) {
  const layers: FailureLayer[] = ["sample", "experiment", "quantification", "statistics", "interpretation"];
  return (
    <div className="atlas-option-list">
      {layers.map((layer) => (
        <label key={layer} className={selected === layer ? "selected" : ""}>
          <input type="radio" name="atlas-layer" checked={selected === layer} onChange={() => onSelect(layer)} />
          <span><strong>{layerLabel(layer)}</strong></span>
        </label>
      ))}
    </div>
  );
}

function CalibrationPanel({ grade, onFinish }: { grade: { score: number }; onFinish: (confidence: Confidence) => void }) {
  const [confidence, setConfidence] = useState<Confidence>(2);
  return (
    <div className="calibration-row atlas-calibration">
      <span>对照反馈后，请评价本次诊断（{Math.round(grade.score * 100)}% 匹配参考判断）：</span>
      <label>信心程度<select value={confidence} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value} — {value < 3 ? "谨慎" : "高"}</option>)}</select></label>
      <button className="primary" onClick={() => onFinish(confidence)}><Lock size={13} /> 锁定并记录校准</button>
    </div>
  );
}

export function DiagnosticSessionView({ card, mode }: SessionViewProps) {
  const causes = useAppStore((state) => state.diagnosticCauses.filter((cause) => cause.problemId === card.id));
  const diagnosticChecks = useAppStore((state) => state.diagnosticChecks);
  const path = useAppStore((state) => state.diagnosticPaths.find((entry) => entry.id === card.diagnosticPathId));
  const evidence = useAppStore((state) => state.diagnosticEvidence);
  const trainingCase = useAppStore((state) => state.problemTrainingCases.find((entry) => entry.problemId === card.id && entry.mode === mode));
  const session = useAppStore((state) => state.diagnosticSessions.find((entry) => entry.taskId === `problem-${card.id}-${mode}`));
  const updateDiagnosticSession = useAppStore((state) => state.updateDiagnosticSession);
  const submitResponse = useAppStore((state) => state.submitResponse);
  const recordCalibration = useAppStore((state) => state.recordCalibration);
  const notify = useAppStore((state) => state.notify);

  const taskId = `problem-${card.id}-${mode}`;
  const current: DiagnosticSession = session ?? createDiagnosticSession(taskId, card.id, mode);
  const orderedCauses = useMemo(() => [...causes].sort((a, b) => a.initialRank - b.initialRank), [causes]);
  const cardEvidence = useMemo(() => evidenceFor(evidence, card.id), [evidence, card.id]);

  const [draftRanked, setDraftRanked] = useState<string[]>([]);
  const [draftLayer, setDraftLayer] = useState<FailureLayer | "">("");
  const [draftRationale, setDraftRationale] = useState("");
  const [draftCheck, setDraftCheck] = useState("");
  const [draftLayerOrder, setDraftLayerOrder] = useState<Record<FailureLayer, number>>({
    sample: 0, experiment: 0, quantification: 0, statistics: 0, interpretation: 0,
  });
  const [draftOption, setDraftOption] = useState("");
  const [draftCause, setDraftCause] = useState("");
  const [draftSeverity, setDraftSeverity] = useState("major");
  const [draftVerdicts, setDraftVerdicts] = useState<Record<string, AiVerdict>>({});

  const expected = (trainingCase?.expected ?? {}) as Record<string, any>;
  const lockedCompleted = Boolean(current.completedAt);
  const grade = useMemo(() => {
    if (!path || !trainingCase) return { score: 0, feedback: [], completed: false };
    return gradeSession(current, card, path, trainingCase, cardEvidence);
  }, [current, card, path, trainingCase, cardEvidence]);

  const lock = (input: SessionJudgmentInput) => {
    const { session: next, error } = lockSessionStep(current, input, new Date(), path);
    if (error) { notify(error, "warning"); return; }
    updateDiagnosticSession(next);
    setDraftRationale("");
    setDraftRanked([]);
    setDraftLayer("");
    setDraftCheck("");
    setDraftOption("");
    setDraftCause("");
    setDraftVerdicts({});
    setDraftLayerOrder({ sample: 0, experiment: 0, quantification: 0, statistics: 0, interpretation: 0 });
  };

  const finish = (confidence: Confidence) => {
    if (!path || !trainingCase) return;
    const result = gradeSession(current, card, path, trainingCase, cardEvidence);
    if (!result.completed) { notify("请先完成本模式的全部锁定判断。", "warning"); return; }
    const response = submitResponse({ taskId, userText: sessionSummary(current), confidence });
    recordCalibration({
      responseId: response.id,
      conceptId: card.id,
      conceptType: "problem",
      skillId: modeSkillId(mode),
      prompt: trainingCase.prompt,
      variantPrompt: trainingCase ? farTransferPrompt(card, trainingCase) : undefined,
      difficulty: card.difficulty,
      score: result.score,
    });
    updateDiagnosticSession(completeSession(current, result.score, response.id));
    notify(result.score >= 0.7 ? "诊断校准已锁定，并已安排复习。" : "低分诊断已记录，将进入复习队列。", result.score >= 0.7 ? "success" : "warning");
  };

  const verdictsComplete = () => {
    const statements = (expected.statements ?? []) as Array<{ id: string }>;
    return statements.length > 0 && statements.every((statement) => VERDICTS.includes(draftVerdicts[statement.id] as AiVerdict));
  };

  const currentNode = path ? nextPathNode(path, current) : undefined;
  const revealed = (nodeId: string) => Boolean(stepOf(current, `reveal-${nodeId}`));
  const lastRankedNode = path ? [...path.nodes].reverse().find((node) => stepOf(current, node.id)?.kind === "ranking") : undefined;
  const lastCheckNode = path ? [...path.nodes].reverse().find((node) => stepOf(current, node.id)?.kind === "missing-info") : undefined;
  const baselineLocked = Boolean(stepOf(current, "baseline-ranking"));
  const rankingSteps = useMemo(() => current.steps.filter((step) => step.kind === "ranking"), [current.steps]);

  const rankingDelta = (before: string[], after: string[]): Array<{ id: string; from: number; to: number }> => {
    const moves: Array<{ id: string; from: number; to: number }> = [];
    for (let index = 0; index < after.length; index += 1) {
      const causeId = after[index];
      const previous = before.indexOf(causeId);
      if (previous !== index) moves.push({ id: causeId, from: previous === -1 ? -1 : previous, to: index });
    }
    return moves;
  };

  const renderModeInput = () => {
    switch (mode) {
      case "quick":
        return (
          <div className="atlas-mode-body">
            <p>{trainingCase?.context}</p>
            <LayerPicker selected={draftLayer} onSelect={setDraftLayer} />
            <textarea rows={3} value={draftRationale} onChange={(event) => setDraftRationale(event.target.value)} placeholder="给出理由：为什么这一层最可能？" />
            <div className="attempt-controls">
              <button className="primary" disabled={!draftLayer || draftRationale.trim().length < 8} onClick={() => lock({ stepId: "quick-layer", kind: "layer", mode, payload: { layer: draftLayer, rationale: draftRationale.trim() } })}><Lock size={14} /> 锁定判断</button>
              {(!draftLayer || draftRationale.trim().length < 8) && <small>先选择层级并写出有实质内容的理由。</small>}
            </div>
          </div>
        );
      case "differential":
        return (
          <div className="atlas-mode-body">
            <p>{trainingCase?.context}</p>
            <CauseRanker causes={orderedCauses} ranked={draftRanked} onRank={setDraftRanked} />
            <textarea rows={3} value={draftRationale} onChange={(event) => setDraftRationale(event.target.value)} placeholder="给出每个排序位置的理由…" />
            <div className="attempt-controls">
              <button className="primary" disabled={draftRanked.length !== orderedCauses.length || draftRationale.trim().length < 8} onClick={() => lock({ stepId: "differential-ranking", kind: "ranking", mode, payload: { rankedCauseIds: draftRanked, rationale: draftRationale.trim() } })}><Lock size={14} /> 锁定排序</button>
              {draftRanked.length !== orderedCauses.length && <small>请把所有候选原因都放入排序。</small>}
            </div>
          </div>
        );
      case "sequential":
        if (!path) return <div className="atlas-mode-body"><p>序贯排查路径不可用。</p></div>;
        if (!baselineLocked) {
          return (
            <div className="atlas-mode-body">
              <p><strong>第 0 步：</strong>在揭示任何证据之前，先锁定基线原因排序。</p>
              <p className="atlas-required-judgment">Human First：先凭现有信息形成自己的初始排序，再揭示证据。基线排序会保留在历史中，用于对照证据揭示前后的变化。</p>
              <CauseRanker causes={orderedCauses} ranked={draftRanked} onRank={setDraftRanked} />
              <div className="attempt-controls">
                <button className="primary" disabled={draftRanked.length !== orderedCauses.length} onClick={() => lock({ stepId: "baseline-ranking", kind: "ranking", mode, payload: { baseline: true, rankedCauseIds: draftRanked } })}><Lock size={14} /> 锁定基线排序</button>
                {draftRanked.length !== orderedCauses.length && <small>请先排好全部候选原因，再揭示第一条证据。</small>}
              </div>
            </div>
          );
        }
        if (!currentNode) return <div className="atlas-mode-body"><p>序贯排查路径已走完。</p></div>;
        return (
          <div className="atlas-mode-body">
            <p><strong>第 {currentNode.step} 步：</strong>{currentNode.question}</p>
            <p className="atlas-required-judgment">{currentNode.requiredJudgment}</p>
            {!revealed(currentNode.id) ? (
              <div className="attempt-controls">
                <button className="primary" onClick={() => lock({ stepId: `reveal-${currentNode.id}`, kind: "reveal", mode, payload: { nodeId: currentNode.id, evidenceIds: currentNode.availableEvidenceIds } })}><Lightbulb size={14} /> 揭示证据</button>
                <small>证据揭示后不可撤销；请先在心里形成自己的判断。</small>
              </div>
            ) : (
              <>
                <div className="atlas-evidence-revealed">
                  {currentNode.availableEvidenceIds.map((evidenceId) => {
                    const item = cardEvidence.find((entry) => entry.id === evidenceId);
                    return item ? <article key={evidenceId}><ShieldCheck size={13} /><p>{item.result}</p><small>范围：{item.scope}</small></article> : null;
                  })}
                </div>
                <CauseRanker causes={orderedCauses} ranked={draftRanked} onRank={setDraftRanked} />
                <div className="attempt-controls">
                  <button className="primary" disabled={draftRanked.length !== orderedCauses.length} onClick={() => lock({ stepId: currentNode.id, kind: "ranking", mode, payload: { nodeId: currentNode.id, revealedEvidenceIds: currentNode.availableEvidenceIds, rankedCauseIds: draftRanked } })}><Lock size={14} /> 锁定更新后的排序</button>
                  {draftRanked.length !== orderedCauses.length && <small>证据已揭示，请更新全部原因的排序。</small>}
                </div>
              </>
            )}
          </div>
        );
      case "missing-info":
        if (!path || !currentNode) return <div className="atlas-mode-body"><p>缺失信息选择已走完。</p></div>;
        return (
          <div className="atlas-mode-body">
            <p><strong>第 {currentNode.step} 步：</strong>{currentNode.question}</p>
            <div className="atlas-option-list">
              {currentNode.permittedCheckIds.map((checkId) => {
                const entry = diagnosticChecks.find((check) => check.id === checkId);
                if (!entry) return null;
                return (
                  <label key={checkId} className={draftCheck === checkId ? "selected" : ""}>
                    <input type="radio" name="atlas-check" checked={draftCheck === checkId} onChange={() => setDraftCheck(checkId)} />
                    <span><strong>{entry.questionCn}</strong><small>提供信息：{entry.informationSupplied} · 成本：{entry.costCategory} · 可用性：{entry.availability}</small></span>
                  </label>
                );
              })}
            </div>
            <textarea rows={3} value={draftRationale} onChange={(event) => setDraftRationale(event.target.value)} placeholder="为什么这个检查最具区分力？" />
            <div className="attempt-controls">
              <button className="primary" disabled={!draftCheck || draftRationale.trim().length < 8} onClick={() => lock({ stepId: currentNode.id, kind: "missing-info", mode, payload: { nodeId: currentNode.id, checkId: draftCheck, rationale: draftRationale.trim() } })}><Lock size={14} /> 锁定选择</button>
              {(!draftCheck || draftRationale.trim().length < 8) && <small>选择一项检查并解释其信息价值。</small>}
            </div>
          </div>
        );
      case "error-localization": {
        const layers: FailureLayer[] = ["sample", "experiment", "quantification", "statistics", "interpretation"];
        const usedRanks = new Set(layers.map((layer) => draftLayerOrder[layer]).filter((rank) => rank > 0));
        const ranksUnique = usedRanks.size === layers.filter((layer) => draftLayerOrder[layer] > 0).length;
        const orderComplete = layers.every((layer) => draftLayerOrder[layer] > 0) && ranksUnique;
        const order = layers.slice().sort((a, b) => draftLayerOrder[a] - draftLayerOrder[b]);
        return (
          <div className="atlas-mode-body">
            <p>{trainingCase?.context}</p>
            <div className="atlas-layer-ranks">
              {layers.map((layer) => (
                <label key={layer}>
                  <span>{layerLabel(layer)}</span>
                  <select value={draftLayerOrder[layer]} onChange={(event) => setDraftLayerOrder((previous) => ({ ...previous, [layer]: Number(event.target.value) }))}>
                    <option value={0}>未排</option>
                    {[1, 2, 3, 4, 5].map((rank) => <option key={rank} value={rank} disabled={usedRanks.has(rank) && draftLayerOrder[layer] !== rank}>{rank}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="attempt-controls">
              <button className="primary" disabled={!orderComplete} onClick={() => lock({ stepId: "localization-order", kind: "layer", mode, payload: { order, rationale: draftRationale.trim() } })}><Lock size={14} /> 锁定排序</button>
              {!orderComplete && <small>{ranksUnique ? "请为五个层级各分配一个排名。" : "每个排名只能使用一次，请修正重复排名。"}</small>}
            </div>
          </div>
        );
      }
      case "claim-boundary": {
        const options = (expected.options ?? []) as Array<{ id: string; text: string }>;
        return (
          <div className="atlas-mode-body">
            <p>{trainingCase?.context}</p>
            <div className="atlas-option-list">
              {options.map((option) => (
                <label key={option.id} className={draftOption === option.id ? "selected" : ""}>
                  <input type="radio" name="atlas-boundary" checked={draftOption === option.id} onChange={() => setDraftOption(option.id)} />
                  <span><strong>{option.text}</strong></span>
                </label>
              ))}
            </div>
            <textarea rows={3} value={draftRationale} onChange={(event) => setDraftRationale(event.target.value)} placeholder="说明为什么这是最大可辩护结论，以及更强结论需要什么证据…" />
            <div className="attempt-controls">
              <button className="primary" disabled={!draftOption || draftRationale.trim().length < 8} onClick={() => lock({ stepId: "boundary-option", kind: "boundary", mode, payload: { optionId: draftOption, rationale: draftRationale.trim() } })}><Lock size={14} /> 锁定结论</button>
              {(!draftOption || draftRationale.trim().length < 8) && <small>选择一个结论并写出理由。</small>}
            </div>
          </div>
        );
      }
      case "reviewer": {
        return (
          <div className="atlas-mode-body">
            <p>{trainingCase?.context}</p>
            <div className="atlas-reviewer-form">
              <label>最需要指出的问题<select value={draftCause} onChange={(event) => setDraftCause(event.target.value)}><option value="">选择原因…</option>{orderedCauses.map((cause) => <option key={cause.id} value={cause.id}>{cause.labelCn}（{cause.labelEn}）</option>)}</select></label>
              <label>严重程度<select value={draftSeverity} onChange={(event) => setDraftSeverity(event.target.value)}>{(["minor", "major", "critical"] as const).map((severity) => <option key={severity} value={severity}>{severityLabelAtlas(severity)}</option>)}</select></label>
            </div>
            <textarea rows={3} value={draftRationale} onChange={(event) => setDraftRationale(event.target.value)} placeholder="说明为什么这个问题最可能改变结论…" />
            <div className="attempt-controls">
              <button className="primary" disabled={!draftCause || draftRationale.trim().length < 8} onClick={() => lock({ stepId: "reviewer-verdict", kind: "reviewer", mode, payload: { causeId: draftCause, severity: draftSeverity, rationale: draftRationale.trim() } })}><Lock size={14} /> 锁定审稿判断</button>
              {(!draftCause || draftRationale.trim().length < 8) && <small>选择问题与严重程度并说明理由。</small>}
            </div>
          </div>
        );
      }
      case "ai-verdict": {
        const statements = (expected.statements ?? []) as Array<{ id: string; text: string }>;
        return (
          <div className="atlas-mode-body">
            <p>{trainingCase?.context}</p>
            {statements.map((statement) => (
              <div key={statement.id} className="atlas-verdict-row">
                <p>{statement.text}</p>
                <div className="atlas-verdict-buttons">
                  {VERDICTS.map((verdict) => (
                    <button key={verdict} className={draftVerdicts[statement.id] === verdict ? `selected verdict-${verdict}` : `verdict-${verdict}`} onClick={() => setDraftVerdicts((previous) => ({ ...previous, [statement.id]: verdict }))}>
                      {verdictLabel(verdict)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="attempt-controls">
              <button className="primary" disabled={!verdictsComplete()} onClick={() => lock({ stepId: "ai-verdicts", kind: "ai-verdict", mode, payload: { verdicts: draftVerdicts } })}><Lock size={14} /> 锁定审核</button>
              {!verdictsComplete() && <small>请逐条给出判断后再锁定。</small>}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (!path || !trainingCase) {
    return <div className="empty-state"><h2>该问题缺少诊断路径或训练案例</h2><p>源包不完整，无法开始本模式训练。</p></div>;
  }

  return (
    <div className="atlas-session">
      <div className="stage-kicker"><span>{modeLabel(mode)} 会话</span>{lockedCompleted && <span className="locked"><Lock size={12} /> 本次会话已锁定</span>}</div>
      <h3>{trainingCase.prompt}</h3>

      {lockedCompleted ? (
        <div className="atlas-feedback">
          <span className="stage-kicker"><span>已完成</span><span className="verified-tag"><Check size={12} /> 判断与校准均已锁定</span></span>
          <div className="atlas-grade"><strong>{Math.round((current.score ?? 0) * 100)}%</strong><small>与参考判断的匹配度</small></div>
          <ul className="atlas-list">{trainingCase.rubric.map((item) => <li key={item}>{item}</li>)}</ul>
          <div className="atlas-history">
            <span className="stage-kicker"><History size={12} /> 已锁定步骤（共 {current.steps.length} 步）</span>
            {current.steps.filter((step) => step.kind !== "calibration").map((step) => <p key={step.id}><code>{step.id}</code> {JSON.stringify(step.payload).slice(0, 160)}</p>)}
          </div>
        </div>
      ) : (
        <>
          {renderModeInput()}
          {current.steps.length > 0 && (
            <div className="atlas-feedback">
              <span className="stage-kicker"><span>反馈</span><span className="pending-tag">诊断参考内容均为待核验演示</span></span>
              {mode === "sequential" && currentNode && !revealed(currentNode.id) && (
                <p className="atlas-required-judgment">{currentNode.requiredJudgment}</p>
              )}
              {grade.completed && (
                <div className="atlas-grade"><strong>{Math.round(grade.score * 100)}%</strong><small>当前判断与参考的匹配度</small></div>
              )}
              <ul className="atlas-list">{grade.feedback.map((item) => <li key={item}>{item}</li>)}</ul>
              {mode === "sequential" && lastRankedNode && (
                <div className="atlas-boundary"><span className="eyebrow">本步参考答案</span><p>{lastRankedNode.lockedAnswer}</p>{lastRankedNode.stopCondition && <p><strong>停止条件：</strong>{lastRankedNode.stopCondition}</p>}</div>
              )}
              {mode === "sequential" && baselineLocked && (
                <div className="atlas-history">
                  <span className="stage-kicker"><History size={12} /> 证据揭示前后的排序历史</span>
                  {rankingSteps.map((step, index) => {
                    const ranked = (step.payload.rankedCauseIds as string[] | undefined) ?? [];
                    const label = step.payload.baseline === true ? "基线排序（证据揭示前）" : `揭示证据后（第 ${index} 次更新）`;
                    const before = index === 0 ? [] : ((rankingSteps[index - 1].payload.rankedCauseIds as string[] | undefined) ?? []);
                    const moves = before.length ? rankingDelta(before, ranked) : [];
                    const spans = ranked.map((causeId, position) => {
                      const cause = orderedCauses.find((entry) => entry.id === causeId);
                      const moved = moves.find((move) => move.id === causeId);
                      return (
                        <span key={causeId} className={moved ? "moved" : ""}>
                          {position + 1}. {cause?.labelCn ?? causeId}{moved ? `（${moved.from === -1 ? "新进入" : `原第 ${moved.from + 1} 位`} → 第 ${moved.to + 1} 位）` : ""}
                        </span>
                      );
                    });
                    return (
                      <p key={step.id}><strong>{label}：</strong>{spans.flatMap((node, position) => (position < spans.length - 1 ? [node, <span key={`sep-${position}`}> · </span>] : [node]))}</p>
                    );
                  })}
                </div>
              )}
              {mode === "missing-info" && lastCheckNode && (
                <div className="atlas-boundary"><span className="eyebrow">本步参考答案</span><p>{lastCheckNode.lockedAnswer}</p></div>
              )}
              {mode === "differential" && stepOf(current, "differential-ranking") && (
                <div className="atlas-boundary"><span className="eyebrow">参考排序</span><p>{(expected.causeOrder as string[]).map((id) => orderedCauses.find((cause) => cause.id === id)?.labelCn ?? id).join(" → ")}</p></div>
              )}
              {mode === "error-localization" && stepOf(current, "localization-order") && (
                <div className="atlas-boundary"><span className="eyebrow">参考排序</span><p>{(expected.layerOrder as FailureLayer[]).map((layer) => layerLabel(layer)).join(" → ")}</p></div>
              )}
              {mode === "quick" && stepOf(current, "quick-layer") && (
                <div className="atlas-boundary"><span className="eyebrow">参考答案</span><p>根因层级：{layerLabel(expected.correctLayer as FailureLayer)}。反馈见上方评分依据。</p></div>
              )}
              {mode === "reviewer" && stepOf(current, "reviewer-verdict") && (
                <div className="atlas-boundary"><span className="eyebrow">参考审稿意见</span><p>{card.reviewerImplication}</p></div>
              )}
              {mode === "ai-verdict" && stepOf(current, "ai-verdicts") && (
                <div className="atlas-boundary"><span className="eyebrow">高级审核（Senior Review）</span><p>AI 生成解释必须逐条对照证据主张核验，不能整段采信。参见下方证据主张与审稿含义。</p></div>
              )}
              {grade.completed && <CalibrationPanel grade={grade} onFinish={finish} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
