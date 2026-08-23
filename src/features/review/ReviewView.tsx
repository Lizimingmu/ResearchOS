import { AlertTriangle, Clock3, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AttemptFlow } from "../../components/AttemptFlow";
import { auditCases } from "../../data/auditCases";
import { judgmentCards } from "../../data/judgmentCards";
import { methodConcepts } from "../../data/methods";
import type { Confidence, ReviewItem } from "../../domain/types";
import { isReviewDue } from "../../learning/review";
import { useAppStore } from "../../state/store";

function referenceFor(item: ReviewItem) {
  const method = methodConcepts.find((concept) => concept.id === item.conceptId);
  if (method) return { findings: [method.coreConcept, method.commonWrongPractice, method.reviewerAttack], better: method.whenToUse, conclusion: method.whenNotToUse, sources: method.sourceIds };
  const judgment = judgmentCards.find((card) => card.id === item.conceptId);
  if (judgment) return { findings: judgment.expectedFindings, better: judgment.betterApproach, conclusion: judgment.maximalConclusion, sources: judgment.sourceIds };
  const audit = auditCases.find((entry) => entry.id === item.conceptId);
  if (audit) return { findings: audit.missedRisks, better: audit.seniorSummary, conclusion: audit.transferPrompt, sources: audit.sourceIds };
  return { findings: ["Recover the independent unit, estimand, major bias, and conclusion boundary."], better: "Return to the originating task and compare against its evidence source.", conclusion: "Do not increase the claim beyond remembered evidence.", sources: ["src-strobe"] };
}

function DueReview({ item }: { item: ReviewItem }) {
  const logs = useAppStore((state) => state.reviewLogs.filter((log) => log.reviewItemId === item.id));
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
    if (answer.trim().length < 12) { notify("Write a substantive retrieval before locking.", "warning"); return; }
    submitResponse({ taskId, userText: answer.trim(), confidence });
    setLocked(true);
  };
  const rate = (correctness: number) => {
    if (rated) return;
    setRated(true);
    rateReview(item.id, correctness, confidence);
    addSkillEvidence({ skillId: item.conceptType === "audit" ? "ai-oversight" : item.conceptType === "paper" ? "patterns" : "methods", taskId: item.conceptId, conceptId: item.conceptId, misconceptionId: item.misconceptionId, score: correctness, delayed: true, blindTransfer: Boolean(item.isVariant), confidence });
    notify(correctness < .5 && confidence >= 3 ? "High-confidence retrieval error scheduled for tomorrow." : "Review rescheduled from correctness and confidence.", correctness < .5 && confidence >= 3 ? "warning" : "success");
  };
  return <div className="due-review-workspace"><div className="review-memory-state"><span>{item.isVariant ? "UNFAMILIAR VARIANT" : "DUE RETRIEVAL"}</span>{item.dangerousMisconception && <strong><AlertTriangle size={13} /> Misconception unresolved</strong>}<small>difficulty {item.difficulty.toFixed(1)} · stability {item.stability.toFixed(1)}d · lapses {item.lapses}</small></div><h2>{item.prompt}</h2><textarea rows={7} disabled={locked} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Retrieve the principle, identify the risk, and state the maximal conclusion…" /><div className="attempt-controls"><label>Confidence<select disabled={locked} value={confidence} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value} — {value < 3 ? "guarded" : "high"}</option>)}</select></label>{!locked && <button className="primary" onClick={submit}>Lock retrieval</button>}</div>{locked && <div className="review-reference"><span>SENIOR REFERENCE</span><ul>{reference.findings.map((finding) => <li key={finding}>{finding}</li>)}</ul><p><strong>Better approach:</strong> {reference.better}</p><p><strong>Conclusion boundary:</strong> {reference.conclusion}</p><div className="calibration-row"><span>Rate this retrieval:</span><button disabled={rated} onClick={() => rate(1)}>Correct</button><button disabled={rated} onClick={() => rate(.5)}>Partial</button><button disabled={rated} className="danger" onClick={() => rate(0)}>Wrong / unsafe</button></div></div>}</div>;
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
  const filteredCards = useMemo(() => judgmentCards.filter((card) => `${card.title} ${card.domain}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="split-page review-page"><aside className="feature-list-pane"><div className="review-tabs"><button className={tab === "due" ? "active" : ""} onClick={() => setTab("due")}>Due <b>{due.length}</b></button><button className={tab === "cards" ? "active" : ""} onClick={() => setTab("cards")}>Judgment cards <b>{judgmentCards.length}</b></button></div>{tab === "due" ? <div className="review-list">{due.map((item) => <button key={item.id} className={item.id === currentReview?.id ? "active" : ""} onClick={() => setSelectedReview(item.id)}><RotateCcw size={14} /><span>{item.prompt}<small><Clock3 size={11} /> {isReviewDue(item) ? "Due now" : new Date(item.due).toLocaleDateString()}</small></span>{item.dangerousMisconception && <AlertTriangle size={14} />}</button>)}</div> : <><label className="compact-search"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter cases" /></label><div className="review-list">{filteredCards.map((card) => <button key={card.id} className={card.id === currentCard.id ? "active" : ""} onClick={() => selectJudgment(card.id)}><span>{card.title}<small>{card.domain} · {card.severity}</small></span></button>)}</div></>}</aside><section className="feature-workspace scrollable">{tab === "due" ? (currentReview ? <DueReview key={`${currentReview.id}-${currentReview.lastReview}`} item={currentReview} /> : <div className="empty-state"><h2>No review items yet</h2><p>Complete a method, paper, or audit attempt to schedule retrieval.</p></div>) : <><header className="detail-header"><div><span className="eyebrow">JUDGMENT CARD · {currentCard.domain.toUpperCase()}</span><h1>{currentCard.title}</h1></div><span className={`severity ${currentCard.severity}`}>{currentCard.severity}</span></header><div className="case-brief"><div><span>STUDY</span><p>{currentCard.study}</p></div><div><span>ANALYSIS</span><p>{currentCard.analysis}</p></div><div><span>CLAIM</span><p>{currentCard.claim}</p></div></div><AttemptFlow key={currentCard.id} taskId={`judgment-${currentCard.id}`} conceptId={currentCard.id} conceptType="judgment" skillId={currentCard.domain.includes("single") || currentCard.domain.includes("omics") ? "omics" : "reasoning"} prompt={currentCard.question} feedbackText={`${currentCard.expectedFindings.join(" ")} Better: ${currentCard.betterApproach} Boundary: ${currentCard.maximalConclusion}`} feedback={<div className="senior-review"><div><span>EXPECTED FINDINGS</span><ul>{currentCard.expectedFindings.map((finding) => <li key={finding}>{finding}</li>)}</ul></div><div><span>BETTER APPROACH</span><p>{currentCard.betterApproach}</p></div><div><span>MAXIMAL CONCLUSION</span><p>{currentCard.maximalConclusion}</p></div><div><span>SEVERITY</span><p>{currentCard.severity}</p></div></div>} sourceIds={currentCard.sourceIds} difficulty={currentCard.difficulty} variantPrompt={currentCard.variantPrompt} transferPrompt="How would this inference risk appear in your real project?" /></>}</section></div>;
}
