import { AlertTriangle, Clock3, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { learningUnits } from "../../data/learningUnits";
import { learningContentRegistry } from "../../data/learningArchitecture";
import { judgmentCards } from "../../data/judgmentCards";
import { methodConcepts } from "../../data/methods";
import type { Confidence, ReviewItem } from "../../domain/types";
import { isReviewDue } from "../../learning/review";
import { useAppStore } from "../../state/store";
import { createKnowledgeLearningGate } from "../../services/knowledge";

function referenceFor(item: ReviewItem) {
  const method = methodConcepts.find((concept) => concept.id === item.conceptId);
  if (method) return { findings: [method.coreConcept, "核对独立单位、关键假设、偏倚来源和信息泄漏。", "报告效应量、不确定性与结论边界。"], boundary: "结论不得强于设计、测量与验证支持的证据层级。" };
  return { findings: ["观察与解释分离。", "识别独立统计单位与关键偏倚。", "区分关联、预测与因果主张。"], boundary: "只陈述当前证据直接支持的最大结论。" };
}

function OtherPracticeReview({ item }: { item: ReviewItem }) {
  const logs = useAppStore((state) => state.reviewLogs.filter((log) => log.reviewItemId === item.id));
  const submitResponse = useAppStore((state) => state.submitResponse), rateReview = useAppStore((state) => state.rateReview), addSkillEvidence = useAppStore((state) => state.addSkillEvidence), notify = useAppStore((state) => state.notify);
  const [answer, setAnswer] = useState(""), [confidence, setConfidence] = useState<Confidence>(2), [locked, setLocked] = useState(false), [rated, setRated] = useState(false);
  const reference = referenceFor(item);
  const submit = () => { if (answer.trim().length < 12) { notify("请先写出有实质内容的提取答案，再锁定。", "warning"); return; } submitResponse({ taskId: `review-${item.id}-${logs.length + 1}`, userText: answer.trim(), confidence }); setLocked(true); };
  const rate = (correctness: number) => { if (rated) return; setRated(true); rateReview(item.id, correctness, confidence); addSkillEvidence({ skillId: item.conceptType === "audit" ? "ai-oversight" : item.conceptType === "paper" ? "patterns" : item.conceptType === "problem" ? "troubleshooting" : "methods", taskId: item.conceptId, conceptId: item.conceptId, misconceptionId: item.misconceptionId, score: correctness, delayed: true, blindTransfer: Boolean(item.isVariant), confidence }); notify("已重新安排复习。", "success"); };
  return <div className="due-review-workspace"><div className="review-memory-state"><span>{item.isVariant ? "陌生变式" : "到期提取"}</span>{item.dangerousMisconception && <strong><AlertTriangle size={13}/>错误观念尚未解除</strong>}<small>难度 {item.difficulty.toFixed(1)} · 稳定度 {item.stability.toFixed(1)} 天</small></div><h2>{item.prompt}</h2><textarea rows={7} disabled={locked} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="提取相关原则，识别风险，并说明最大结论边界…"/><div className="attempt-controls"><label>信心程度<select disabled={locked} value={confidence} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>{!locked && <button className="primary" onClick={submit}>锁定提取答案</button>}</div>{locked && <div className="review-reference"><span>专家参考</span><ul>{reference.findings.map((finding) => <li key={finding}>{finding}</li>)}</ul><p><strong>结论边界：</strong>{reference.boundary}</p><div className="calibration-row"><span>评价本次提取：</span><button disabled={rated} onClick={() => rate(1)}>正确</button><button disabled={rated} onClick={() => rate(.5)}>部分正确</button><button disabled={rated} className="danger" onClick={() => rate(0)}>错误 / 不安全</button></div></div>}</div>;
}

export function ReviewView() {
  const knowledgeWorkspace = useAppStore((state) => state.knowledgeWorkspace);
  const knowledgeAllowed = useMemo(() => createKnowledgeLearningGate(knowledgeWorkspace), [knowledgeWorkspace]);
  const reviewItems = useAppStore((state) => state.reviewItems), learnerStates = useAppStore((state) => state.learnerUnitStates), selectLearningUnit = useAppStore((state) => state.selectLearningUnit), openLearningContentTask = useAppStore((state) => state.openLearningContentTask), selectJudgment = useAppStore((state) => state.selectJudgment);
  const [tab, setTab] = useState<"learning" | "other">("learning"), [selectedId, setSelectedId] = useState(reviewItems.find((item) => isReviewDue(item))?.id);
  const due = useMemo(() => reviewItems.filter((item) => isReviewDue(item) && knowledgeAllowed(item.conceptId)), [reviewItems, knowledgeAllowed]);
  const learningDue = learnerStates.filter((state) => {
    if (!knowledgeAllowed(state.unitId)) return false;
    const content = learningContentRegistry.find((entry) => entry.unitId === state.unitId);
    if (content && !knowledgeAllowed(content.id)) return false;
    if (!state.dueAt || Date.parse(state.dueAt) > Date.now()) return false;
    const architectureContent = learningContentRegistry.some((entry) => entry.unitId === state.unitId && ["concept_lesson", "method_lesson"].includes(entry.contentType));
    return architectureContent ? state.stage === "review_eligible" : ["review_eligible", "consolidating", "transferable"].includes(state.stage);
  });
  const current = due.find((item) => item.id === selectedId) ?? due[0];
  const openLearningReview = (unitId: string) => {
    const content = learningContentRegistry.find((entry) => entry.unitId === unitId && ["concept_lesson", "method_lesson"].includes(entry.contentType));
    if (content) openLearningContentTask({ contentId: content.id, activityType: "delayed_retrieval" });
    else selectLearningUnit(unitId);
  };
  return <div className="page unified-review"><header className="page-header"><div><span className="eyebrow">Review</span><h1>一个入口，两类复习来源</h1><p>Today 的 Due Review 与这里的 Learning Reviews 使用同一 Learning Kernel source。</p></div></header><div className="review-tabs"><button className={tab === "learning" ? "active" : ""} onClick={() => setTab("learning")}>Learning Reviews <b>{learningDue.length}</b></button><button className={tab === "other" ? "active" : ""} onClick={() => setTab("other")}>Other Practice Reviews <b>{due.length}</b></button></div>{tab === "learning" ? <div className="learning-review-list">{learningDue.length ? learningDue.map((state) => <button key={state.unitId} onClick={() => openLearningReview(state.unitId)}><RotateCcw/><span><strong>{learningContentRegistry.find((entry) => entry.unitId === state.unitId)?.titleCn ?? learningUnits.find((unit) => unit.id === state.unitId)?.titleCn ?? state.unitId}</strong><small><Clock3 size={11}/>现在到期 · 使用不同版本化 surface asset</small></span></button>) : <div className="empty-state"><h2>暂无真正到期的学习复习</h2><p>未到期不是落后；间隔本身是学习设计的一部分。</p></div>}</div> : <div className="split-page review-page"><aside className="feature-list-pane"><div className="review-list">{due.map((item) => <button key={item.id} className={item.id === current?.id ? "active" : ""} onClick={() => setSelectedId(item.id)}><RotateCcw size={14}/><span>{item.prompt}<small>现在到期</small></span></button>)}</div><h3>Judgment cards</h3>{judgmentCards.slice(0, 6).map((card) => <button key={card.id} onClick={() => selectJudgment(card.id)}>{card.title}</button>)}</aside><section className="feature-workspace scrollable">{current ? <OtherPracticeReview key={`${current.id}-${current.lastReview}`} item={current}/> : <div className="empty-state"><h2>暂无 Other Practice Review</h2></div>}</section></div>}</div>;
}
