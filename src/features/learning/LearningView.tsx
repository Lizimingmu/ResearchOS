import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Brain, CheckCircle2, ChevronDown, ChevronUp, Clock3, FastForward, Lightbulb, Pause, Play, ShieldCheck } from "lucide-react";
import { learningUnits, prerequisiteEdges, prototypePracticeByUnitId } from "../../data/learningUnits";
import type { DisclosureLayer, LearningMode } from "../../domain/learningKernel";
import { projectSkillMap } from "../../domain/learningKernel";
import { canStartUnit } from "../../learning/learningKernelEngine";
import { useAppStore } from "../../state/store";

const layerMeta: Record<DisclosureLayer, { label: string; description: string }> = {
  understand: { label: "先懂", description: "先建立需要和直觉，不急着背术语。" },
  explain: { label: "弄明白", description: "再看定义、机制、专家示范和常见误区。" },
  judge: { label: "会判断", description: "最后练习独立判断、结论边界和审稿视角。" },
};

const stageLabel: Record<string, string> = {
  unseen: "尚未开始", learning: "正在学习", guided: "引导练习", independent_ready: "可独立练习",
  review_eligible: "等待延迟复习", consolidating: "正在巩固", transferable: "可迁移应用",
};

function PracticePanel({ unitId, mode }: { unitId: string; mode: LearningMode }) {
  const practice = prototypePracticeByUnitId.get(unitId);
  const learner = useAppStore((state) => state.learnerUnitStates.find((item) => item.unitId === unitId));
  const record = useAppStore((state) => state.recordLearningTransition);
  const notify = useAppStore((state) => state.notify);
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4>(2);
  const [boundary, setBoundary] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [locked, setLocked] = useState(false);
  if (!practice) return null;
  const isChallenge = mode === "challenge";
  const isGuided = !isChallenge && learner?.stage === "guided";
  const task = isGuided ? practice.guided : practice.independent;
  const submit = () => {
    if (choice == null) return;
    const correct = choice === task.correctOption;
    const type = isChallenge ? "challenge_attempt" : isGuided ? "guided_attempt" : learner?.stage === "review_eligible" ? "retrieval_attempt" : learner?.stage === "consolidating" || learner?.stage === "transferable" ? "far_transfer_attempt" : "independent_attempt";
    try {
      record(unitId, {
        type,
        mode,
        outcome: correct && (!('boundaryPrompt' in task) || boundary.trim().length >= 8) ? "pass" : "fail",
        score: correct ? 1 : 0,
        confidence: isGuided ? undefined : confidence,
        hintsUsed: isGuided ? practice.guided.hints.slice(0, hintCount).map((_, index) => `hint-${index + 1}`) : [],
        highConfidenceConceptualError: !correct && confidence >= 3,
      });
      setLocked(true);
      notify(correct ? "已锁定。现在可以对照解释；能力与学习经历会分开记录。" : "已锁定。错误不会被当成零能力，系统会把你带回需要补学的位置。", correct ? "success" : "warning");
    } catch (error) { notify(String(error), "error"); }
  };
  return <section className="learning-practice">
    <span className="eyebrow">{isChallenge ? "可选快速路径 · 无提示" : isGuided ? "引导练习 · 可看提示" : "独立练习 · 锁定后反馈"}</span>
    <h2>{task.scenario}</h2>
    <p>{task.question}</p>
    <div className="learning-options">{task.options.map((option, index) => <button key={option} disabled={locked} className={choice === index ? "selected" : ""} onClick={() => setChoice(index)}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>
    {isGuided && <div className="learning-hints">
      {practice.guided.hints.slice(0, hintCount).map((hint, index) => <p key={hint}><Lightbulb size={14}/> 提示 {index + 1}：{hint}</p>)}
      <button className="subtle" disabled={locked || hintCount >= practice.guided.hints.length} onClick={() => setHintCount((value) => value + 1)}>给我下一层提示</button>
    </div>}
    {!isGuided && <div className="learning-confidence"><span>作答信心</span>{([1,2,3,4] as const).map((value) => <button key={value} disabled={locked} className={confidence === value ? "selected" : ""} onClick={() => setConfidence(value)}>{value}</button>)}</div>}
    {'boundaryPrompt' in task && <label className="learning-boundary">{task.boundaryPrompt}<textarea disabled={locked} rows={3} value={boundary} onChange={(event) => setBoundary(event.target.value)} placeholder="先用自己的话写，不必像标准答案。" /></label>}
    {!locked ? <button className="primary" disabled={choice == null || ('boundaryPrompt' in task && boundary.trim().length < 8)} onClick={submit}>锁定作答并查看反馈</button>
      : <div className={choice === task.correctOption ? "learning-feedback correct" : "learning-feedback"}><strong>{choice === task.correctOption ? "核心判断正确" : "这一步值得重新拆开"}</strong><p>{'explanation' in task ? task.explanation : `参考边界：${task.referenceBoundary}`}</p></div>}
  </section>;
}

export function LearningView() {
  const selectedId = useAppStore((state) => state.selectedLearningUnitId);
  const learnerStates = useAppStore((state) => state.learnerUnitStates);
  const pausedIds = useAppStore((state) => state.pausedLearningUnitIds);
  const startUnit = useAppStore((state) => state.startLearningUnit);
  const record = useAppStore((state) => state.recordLearningTransition);
  const selectUnit = useAppStore((state) => state.selectLearningUnit);
  const togglePause = useAppStore((state) => state.toggleLearningUnitPaused);
  const notify = useAppStore((state) => state.notify);
  const unit = learningUnits.find((item) => item.id === selectedId) ?? learningUnits[0];
  const learner = learnerStates.find((item) => item.unitId === unit.id);
  const [layer, setLayer] = useState<DisclosureLayer>("understand");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const blocks = useMemo(() => unit.blocks.filter((block) => block.layer === layer), [unit, layer]);
  const completed = new Set(learner?.instruction.completedBlockIds ?? []);
  const projection = projectSkillMap(unit, learner);
  const gate = canStartUnit({ unitId: unit.id, states: learnerStates, edges: prerequisiteEdges, pausedUnitIds: new Set(pausedIds) });
  const isPaused = pausedIds.includes(unit.id);
  const toggleBlock = (id: string) => setExpanded((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const completeBlock = (id: string) => {
    try { record(unit.id, { type: "instruction_block_completed", mode: "learning", blockId: id, hintsUsed: [] }); }
    catch (error) { notify(String(error), "error"); }
  };
  const allRequiredDone = unit.blocks.filter((block) => block.required).every((block) => completed.has(block.id));

  return <div className="page learning-page">
    <header className="page-header learning-header">
      <div><span className="eyebrow">学习路径 · {unit.curriculumOrder}/3</span><h1>{unit.titleCn}</h1><p>{unit.titleEn} · 约 {unit.estimatedMinutes} 分钟</p></div>
      <div className="learning-header-actions"><button className="subtle" onClick={() => togglePause(unit.id)}>{isPaused ? <Play size={14}/> : <Pause size={14}/>} {isPaused ? "继续主题" : "暂停主题"}</button></div>
    </header>

    <section className="learning-path-strip">{learningUnits.map((item) => {
      const state = learnerStates.find((entry) => entry.unitId === item.id);
      const itemGate = canStartUnit({ unitId: item.id, states: learnerStates, edges: prerequisiteEdges, pausedUnitIds: new Set(pausedIds) });
      return <button key={item.id} className={item.id === unit.id ? "active" : ""} disabled={!state && !itemGate.allowed} onClick={() => selectUnit(item.id)}><span>{item.curriculumOrder}</span><div><strong>{item.titleCn}</strong><small>{stageLabel[state?.stage ?? "unseen"]}{!state && !itemGate.allowed ? " · 前置未完成" : ""}</small></div></button>;
    })}</section>

    {!learner ? <section className="learning-start-card">
      <BookOpen size={28}/><h2>默认从讲解开始，不先考试</h2><p>先用真实问题建立直觉，再看定义和专家示范，最后才进入练习。已经熟悉时，可以主动选择无提示挑战。</p>
      <div><button className="primary" disabled={!gate.allowed} onClick={() => startUnit(unit.id, "learning")}>开始学习 <ArrowRight size={14}/></button><button className="subtle" disabled={!gate.allowed} onClick={() => startUnit(unit.id, "challenge")}><FastForward size={14}/> 我已熟悉，直接挑战</button></div>
      {!gate.allowed && <small>{gate.reasonCn}</small>}
    </section> : <>
      <section className="learning-axis-card">
        <div><BookOpen size={18}/><span>学习进度</span><strong>{projection.learningProgress.completedRequired}/{projection.learningProgress.totalRequired} 个必需块</strong></div>
        <div><Brain size={18}/><span>已证明能力</span><strong>{projection.demonstratedCompetence.level === "unassessed" ? "尚未评估" : projection.labelCn.split(" · ")[1]}</strong></div>
        <div><Clock3 size={18}/><span>当前阶段</span><strong>{stageLabel[learner.stage]}</strong></div>
      </section>

      {learner.selectedMode === "challenge" && learner.stage === "unseen" ? <PracticePanel unitId={unit.id} mode="challenge"/> : <>
        <nav className="learning-layers" aria-label="教学层级">{(Object.keys(layerMeta) as DisclosureLayer[]).map((value) => <button key={value} className={layer === value ? "active" : ""} onClick={() => setLayer(value)}><strong>{layerMeta[value].label}</strong><small>{layerMeta[value].description}</small></button>)}</nav>
        <div className="learning-blocks">{blocks.map((item) => {
          const open = expanded.has(item.id) || !completed.has(item.id);
          return <article key={item.id} className={completed.has(item.id) ? "completed" : ""}>
            <button className="learning-block-title" onClick={() => toggleBlock(item.id)}><div>{completed.has(item.id) ? <CheckCircle2 size={17}/> : <span className="block-dot"/>}<strong>{item.titleCn}</strong></div>{open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>
            {open && <div className="learning-block-body"><p>{item.bodyCn}</p>{item.terms?.map((term) => <dl key={term.en}><dt>{term.zh} <span>{term.en}</span></dt><dd>{term.definitionCn}</dd></dl>)}<button className="subtle" disabled={completed.has(item.id)} onClick={() => completeBlock(item.id)}>{completed.has(item.id) ? "已完成" : "我理解了这一块"}</button></div>}
          </article>;
        })}</div>
        {allRequiredDone && learner.stage === "learning" && <section className="learning-checkpoint"><ShieldCheck size={22}/><div><h2>讲解已完成，做一个低压力自检</h2><p>这一步只是确认可以进入带提示练习，不作为独立能力证明。</p></div><button onClick={() => record(unit.id, { type: "self_check_attempt", mode: "learning", outcome: "pass", score: 1, hintsUsed: [] })}>进入引导练习</button></section>}
        {learner.stage === "guided" && <PracticePanel unitId={unit.id} mode="learning"/>}
        {learner.stage === "independent_ready" && <PracticePanel unitId={unit.id} mode="learning"/>}
        {learner.stage === "review_eligible" && <section className="learning-wait"><Clock3/><h2>先让记忆隔一段时间</h2><p>到期时间：{learner.dueAt ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(learner.dueAt)) : "待安排"}。立即重答不算延迟提取。</p></section>}
        {(learner.stage === "consolidating" || learner.stage === "transferable") && <PracticePanel unitId={unit.id} mode="learning"/>}
      </>}
    </>}
  </div>;
}
