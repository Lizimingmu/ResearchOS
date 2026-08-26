import { AlertTriangle, Clock3, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AttemptFlow } from "../../components/AttemptFlow";
import { auditCases } from "../../data/auditCases";
import { judgmentCards } from "../../data/judgmentCards";
import { methodConcepts } from "../../data/methods";
import type { Confidence, ReviewItem } from "../../domain/types";
import { isReviewDue } from "../../learning/review";
import { useAppStore } from "../../state/store";
import { judgmentDisplay } from "../../i18n/scientificContent";
import { getResearchTerm } from "../../i18n/researchTerms";

function referenceFor(item: ReviewItem) {
  const method = methodConcepts.find((concept) => concept.id === item.conceptId);
  if (method) { const item = getResearchTerm(method.id, method.title); return { findings: [item.definition, "核对独立单位、关键假设、偏倚来源和信息泄漏。", "报告效应量、不确定性与结论边界。"], better: "让研究问题和设计决定分析方法，并用诊断与敏感性分析检验关键假设。", conclusion: "结论不得强于研究设计、测量和实际验证所支持的证据层级。", sources: method.sourceIds }; }
  const judgment = judgmentCards.find((card) => card.id === item.conceptId);
  if (judgment) return { findings: ["识别独立统计单位与数据嵌套。", "优先处理可能改变结论的偏倚和泄漏。", "区分关联、预测与因果主张。"], better: "重新对齐研究问题、设计、分析和证据层级，并报告不确定性。", conclusion: "只陈述当前设计与测量直接支持的最大结论。", sources: judgment.sourceIds };
  const audit = auditCases.find((entry) => entry.id === item.conceptId);
  if (audit) return { findings: ["检查每一步的适用前提。", "确认独立单位、多重检验与不确定性。", "生成内容必须保留来源与待核验状态。"], better: "移除不安全捷径后再执行分析，并把结论限制在证据支持范围内。", conclusion: "AI 方案只能作为待审核建议，不能替代研究者判断。", sources: audit.sourceIds };
  const problem = useAppStore.getState().problemCards.find((card) => card.id === item.conceptId);
  if (problem) {
    const claims = useAppStore.getState().problemAtlasClaims;
    return {
      findings: ["观察与解释分离，保留多个候选原因直到证据改变排序。", "下一步检查由信息价值决定，而不是由便利性决定。", "区分样本、实验、定量、统计与解释五层错误。", `结论边界：${problem.claimBoundary}`],
      better: problem.recommendedReasoning.join("；"),
      conclusion: problem.claimBoundary,
      sources: problem.evidenceClaimIds.map((claimId) => claims.find((claim) => claim.id === claimId)?.sourceId).filter((id): id is string => Boolean(id)),
    };
  }
  return { findings: ["回忆独立单位、估计目标、主要偏倚与结论边界。"], better: "返回原始任务，并与证据来源逐项比较。", conclusion: "不要让主张超过记忆中证据实际支持的范围。", sources: ["src-strobe"] };
}

function DueReview({ item }: { item: ReviewItem }) {
  const allReviewLogs = useAppStore((state) => state.reviewLogs);
  const logs = useMemo(() => allReviewLogs.filter((log) => log.reviewItemId === item.id), [allReviewLogs, item.id]);
  const submitResponse = useAppStore((state) => state.submitResponse);
  const rateReview = useAppStore((state) => state.rateReview);
  const addSkillEvidence = useAppStore((state) => state.addSkillEvidence);
  const notify = useAppStore((state) => state.notify);
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [locked, setLocked] = useState(false);
  const [rated, setRated] = useState(false);
  const reference = referenceFor(item);
  const taskId = `review-${item.id}-${logs.length + 1}`;
  const submit = () => {
    if (answer.trim().length < 12) { notify("请先写出有实质内容的提取答案，再锁定。", "warning"); return; }
    submitResponse({ taskId, userText: answer.trim(), confidence });
    setLocked(true);
  };
  const rate = (correctness: number) => {
    if (rated) return;
    setRated(true);
    rateReview(item.id, correctness, confidence);
    addSkillEvidence({ skillId: item.conceptType === "audit" ? "ai-oversight" : item.conceptType === "paper" ? "patterns" : item.conceptType === "problem" ? "troubleshooting" : "methods", taskId: item.conceptId, conceptId: item.conceptId, misconceptionId: item.misconceptionId, score: correctness, delayed: true, blindTransfer: Boolean(item.isVariant), confidence });
    notify(correctness < .5 && confidence >= 3 ? "高信心提取错误已安排在明天复测。" : "已根据信心与正确程度重新安排复习。", correctness < .5 && confidence >= 3 ? "warning" : "success");
  };
  return <div className="due-review-workspace"><div className="review-memory-state"><span>{item.isVariant ? "陌生变式" : "到期提取"}</span>{item.dangerousMisconception && <strong><AlertTriangle size={13} /> 错误观念尚未解除</strong>}<small>难度 {item.difficulty.toFixed(1)} · 稳定度 {item.stability.toFixed(1)} 天 · 遗忘 {item.lapses} 次</small></div><h2>{item.prompt}</h2><textarea rows={7} disabled={locked} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="提取相关原则，识别风险，并说明最大结论边界…" /><div className="attempt-controls"><label>信心程度<select disabled={locked} value={confidence} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value} — {value < 3 ? "谨慎" : "高"}</option>)}</select></label>{!locked && <button className="primary" onClick={submit}>锁定提取答案</button>}</div>{locked && <div className="review-reference"><span>专家参考</span><ul>{reference.findings.map((finding) => <li key={finding}>{finding}</li>)}</ul><p><strong>更好的做法：</strong> {reference.better}</p><p><strong>结论边界：</strong> {reference.conclusion}</p><div className="calibration-row"><span>评价本次提取：</span><button disabled={rated} onClick={() => rate(1)}>正确</button><button disabled={rated} onClick={() => rate(.5)}>部分正确</button><button disabled={rated} className="danger" onClick={() => rate(0)}>错误 / 不安全</button></div></div>}</div>;
}

export function ReviewView() {
  const reviewItems = useAppStore((state) => state.reviewItems);
  const selectedJudgmentId = useAppStore((state) => state.selectedJudgmentId);
  const selectJudgment = useAppStore((state) => state.selectJudgment);
  const [tab, setTab] = useState<"due" | "cards">("due");
  const [selectedReview, setSelectedReview] = useState(reviewItems.find((item) => isReviewDue(item))?.id ?? reviewItems[0]?.id);
  const [query, setQuery] = useState("");
  const due = reviewItems.filter((item) => isReviewDue(item));
  const currentReview = due.find((item) => item.id === selectedReview) ?? due[0];
  const currentCard = judgmentCards.find((card) => card.id === selectedJudgmentId) ?? judgmentCards[0];
  const cardDisplay = judgmentDisplay(currentCard);
  const filteredCards = useMemo(() => judgmentCards.filter((card) => `${card.title} ${card.domain}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="split-page review-page"><aside className="feature-list-pane"><div className="review-tabs"><button className={tab === "due" ? "active" : ""} onClick={() => setTab("due")}>到期复习 <b>{due.length}</b></button><button className={tab === "cards" ? "active" : ""} onClick={() => setTab("cards")}>判断卡 <b>{judgmentCards.length}</b></button></div>{tab === "due" ? <div className="review-list">{due.map((item) => <button key={item.id} className={item.id === currentReview?.id ? "active" : ""} onClick={() => setSelectedReview(item.id)}><RotateCcw size={14} /><span>{item.prompt}<small><Clock3 size={11} /> {isReviewDue(item) ? "现在到期" : new Date(item.due).toLocaleDateString("zh-CN")}</small></span>{item.dangerousMisconception && <AlertTriangle size={14} />}</button>)}</div> : <><label className="compact-search"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="筛选案例" /></label><div className="review-list">{filteredCards.map((card) => <button key={card.id} className={card.id === currentCard.id ? "active" : ""} onClick={() => selectJudgment(card.id)}><span>{judgmentDisplay(card).title}<small>{card.domain} · {card.severity}</small></span></button>)}</div></>}</aside><section className="feature-workspace scrollable">{tab === "due" ? (currentReview ? <DueReview key={`${currentReview.id}-${currentReview.lastReview}`} item={currentReview} /> : <div className="empty-state"><h2>暂无复习项目</h2><p>完成一次方法、论文或审查作答后，系统会安排提取复习。</p></div>) : <><header className="detail-header"><div><span className="eyebrow">判断卡 · {currentCard.domain.toUpperCase()}</span><h1>{cardDisplay.title}</h1></div><span className={`severity ${currentCard.severity}`}>{{ minor: "轻微问题", major: "重大问题（Major Concern）", critical: "致命 / 结构性问题" }[currentCard.severity]}</span></header><div className="case-brief"><div><span>{cardDisplay.studyLabel}</span><p>{currentCard.study}</p></div><div><span>{cardDisplay.analysisLabel}</span><p>{currentCard.analysis}</p></div><div><span>{cardDisplay.claimLabel}</span><p>{currentCard.claim}</p></div></div><AttemptFlow key={currentCard.id} taskId={`judgment-${currentCard.id}`} conceptId={currentCard.id} conceptType="judgment" skillId={currentCard.domain.includes("single") || currentCard.domain.includes("omics") ? "omics" : "reasoning"} prompt={cardDisplay.question} feedbackText={`${currentCard.expectedFindings.join(" ")} Better: ${currentCard.betterApproach} Boundary: ${currentCard.maximalConclusion}`} feedback={<div className="senior-review"><div><span>识别正确</span><ul><li>明确独立统计单位与数据层级。</li><li>识别可能改变结论的偏倚、泄漏或伪重复。</li><li>把主张限制在设计与测量支持的范围内。</li></ul></div><div><span>建议如何处理</span><p>重新对齐研究问题、设计和分析，报告效应量与不确定性，并针对关键风险开展敏感性分析。</p></div><div><span>最大结论</span><p>当前结果只能支持与实际证据层级一致的有限结论，不能自动解释为因果或临床效用。</p></div><details><summary>查看英文专家参考原文</summary><p>{currentCard.betterApproach}</p><p>{currentCard.maximalConclusion}</p></details></div>} sourceIds={currentCard.sourceIds} difficulty={currentCard.difficulty} variantPrompt={currentCard.variantPrompt} transferPrompt={cardDisplay.transfer} /></>}</section></div>;
}
