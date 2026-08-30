import { CheckCircle2, Lightbulb, LockKeyhole } from "lucide-react";
import { useState } from "react";
import type { PracticeAssetBindingV1, PracticeAssetV1, PracticeResponseV1 } from "../../domain/learningKernel";
import { scorePracticeAsset } from "../../domain/learningKernel";

interface PracticeActivityProps {
  asset: PracticeAssetV1;
  binding: PracticeAssetBindingV1;
  projects?: Array<{ id: string; name: string }>;
  onSubmit: (input: { response: PracticeResponseV1; passed: boolean; score: number; confidence?: 1 | 2 | 3 | 4; hintsUsed: string[] }) => void;
  onContinue?: (passed: boolean) => void;
}

export function PracticeActivity({ asset, binding, projects = [], onSubmit, onContinue }: PracticeActivityProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [ordered, setOrdered] = useState<string[]>(asset.orderingItems?.map((item) => item.id) ?? []);
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [reasoning, setReasoning] = useState("");
  const [boundary, setBoundary] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4>(2);
  const [hintCount, setHintCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const response: PracticeResponseV1 = { selectedOptionIds: selected, orderedItemIds: ordered, classifications, shortReasoning: reasoning, claimBoundary: boundary, projectId: projectId || undefined };
  const scored = scorePracticeAsset(asset, response);
  const needsReasoning = (asset.rubric.minReasoningChars ?? 0) > 0;
  const needsBoundary = (asset.rubric.minClaimBoundaryChars ?? 0) > 0 || asset.interaction === "claim_boundary" || asset.interaction === "project_transfer";
  const choose = (id: string) => setSelected((current) => asset.interaction === "multi_select" ? (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]) : [id]);
  const hasStructuredAnswer = asset.interaction === "ordering" ? ordered.length > 0 : asset.interaction === "classification" ? Object.keys(classifications).length === (asset.classificationItems?.length ?? 0) : selected.length > 0;
  const valid = hasStructuredAnswer && (!needsReasoning || reasoning.trim().length >= (asset.rubric.minReasoningChars ?? 0)) && (!needsBoundary || boundary.trim().length >= (asset.rubric.minClaimBoundaryChars ?? 8)) && (asset.interaction !== "project_transfer" || Boolean(projectId));
  const submit = () => {
    if (!valid) return;
    setLocked(true);
    onSubmit({ response, passed: scored.passed, score: scored.score, confidence: binding.confidenceRequired ? confidence : undefined, hintsUsed: asset.hints.slice(0, hintCount).map((_, index) => `hint-${index + 1}`) });
  };
  const moveUp = (index: number) => setOrdered((items) => items.map((value, itemIndex) => itemIndex === index - 1 ? items[index] : itemIndex === index ? items[index - 1] : value));

  return <section className="lesson-practice">
    <span className="eyebrow">{asset.titleCn}</span><h2>{asset.scenarioCn}</h2><p>{asset.promptCn}</p>
    <div className="lesson-options">{asset.options?.map((option) => <button key={option.id} disabled={locked} className={selected.includes(option.id) ? "selected" : ""} onClick={() => choose(option.id)}>{option.labelCn}</button>)}</div>
    {asset.orderingItems && <ol className="ordering-practice">{ordered.map((id, index) => <li key={id}>{asset.orderingItems?.find((item) => item.id === id)?.labelCn}<button disabled={locked || index === 0} onClick={() => moveUp(index)}>上移</button></li>)}</ol>}
    {asset.classificationItems?.map((item) => <label key={item.id}>{item.labelCn}<select disabled={locked} value={classifications[item.id] ?? ""} onChange={(event) => setClassifications((current) => ({ ...current, [item.id]: event.target.value }))}><option value="">请选择层级</option>{item.categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>)}
    {asset.interaction === "project_transfer" && <label>迁移到真实项目<select disabled={locked} value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">选择项目</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>}
    {asset.role === "guided" && <div className="lesson-hints">{asset.hints.slice(0, hintCount).map((hint, index) => <p key={hint}><Lightbulb size={14} /> 提示 {index + 1}：{hint}</p>)}<button disabled={locked || hintCount >= asset.hints.length} onClick={() => setHintCount((value) => value + 1)}>给我下一层提示</button></div>}
    {needsReasoning && <label>为什么？<textarea disabled={locked} rows={4} value={reasoning} onChange={(event) => setReasoning(event.target.value)} placeholder="用自己的话写出判断依据；系统不伪造 AI 精确评分。" /></label>}
    {needsBoundary && <label>最大可接受结论<textarea disabled={locked} rows={3} value={boundary} onChange={(event) => setBoundary(event.target.value)} placeholder="这项设计最多支持什么？" /></label>}
    {binding.confidenceRequired && <div className="lesson-confidence"><span>作答信心</span>{([1, 2, 3, 4] as const).map((value) => <button key={value} disabled={locked} className={confidence === value ? "selected" : ""} onClick={() => setConfidence(value)}>{value}</button>)}</div>}
    {!locked ? <button className="primary" disabled={!valid} onClick={submit}><LockKeyhole size={14} /> 锁定作答</button> : <div className={scored.passed ? "lesson-feedback correct" : "lesson-feedback"}><h3>{scored.passed ? <><CheckCircle2 size={17} /> 核心判断成立</> : "这一步需要再校准"}</h3><div><strong>你抓对了什么</strong><ul>{asset.feedback.correctCn.map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong>你漏掉了什么</strong><ul>{(scored.missing.length ? scored.missing : asset.feedback.missedCn).map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong>哪里存在过度推断</strong><ul>{asset.feedback.overreachCn.map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong>参考推理链</strong><ol>{asset.feedback.reasoningChainCn.map((item) => <li key={item}>{item}</li>)}</ol></div><p><strong>最大可接受结论：</strong>{asset.feedback.maximalConclusionCn}</p>{onContinue&&<button className="primary" onClick={()=>onContinue(scored.passed)}>看完反馈，继续</button>}</div>}
  </section>;
}
