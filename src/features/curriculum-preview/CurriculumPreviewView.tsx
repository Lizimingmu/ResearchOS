import { BookOpenCheck, FlaskConical, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { curriculumManifest, stagedCaseLabs, stagedConceptLessons, stagedMethodLessons, studioTemplates } from "../../data/curriculum";
import { evaluateStagedAssessment, type StagedAssessmentEvaluation } from "../../services/stagedAssessment";

type Tab = "manifest" | "concept" | "method" | "case" | "studio";

const tabs: Array<{ id: Tab; label: string; count: number }> = [
  { id: "manifest", label: "Curriculum Manifest", count: curriculumManifest.length },
  { id: "concept", label: "Concept Lessons", count: stagedConceptLessons.length },
  { id: "method", label: "Method Lessons", count: stagedMethodLessons.length },
  { id: "case", label: "Case Labs", count: stagedCaseLabs.length },
  { id: "studio", label: "Studio Templates", count: studioTemplates.length },
];

const listFor = (tab: Tab) => tab === "manifest" ? curriculumManifest : tab === "concept" ? stagedConceptLessons : tab === "method" ? stagedMethodLessons : tab === "case" ? stagedCaseLabs : studioTemplates;

export function CurriculumPreviewView() {
  const [tab, setTab] = useState<Tab>("manifest");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(curriculumManifest[0]?.id ?? "");
  const items = listFor(tab);
  const filtered = useMemo(() => items.filter((item) => `${item.id} ${item.titleCn} ${"titleEn" in item ? item.titleEn : ""}`.toLowerCase().includes(query.trim().toLowerCase())), [items, query]);
  const selected = items.find((item) => item.id === selectedId) ?? filtered[0] ?? items[0];
  const switchTab = (next: Tab) => { setTab(next); setSelectedId(listFor(next)[0]?.id ?? ""); };
  return <div className="curriculum-preview page">
    <header className="page-header"><div><span className="eyebrow">Curriculum Preview · read-only staging</span><h1>Research Self-Rescue Curriculum v1</h1><p>查看覆盖、来源、先修图和训练资产；此页面没有提交、评分或能力写入动作。</p></div><ShieldAlert/></header>
    <div className="pending-curriculum-banner" role="status">待科学审核 · 不进入正式 Today · 不计标准化能力</div>
    <nav className="curriculum-preview-tabs" aria-label="课程预览类型">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => switchTab(item.id)}>{item.label}<b>{item.count}</b></button>)}</nav>
    <div className="curriculum-preview-layout">
      <aside><label><Search size={14}/><span className="sr-only">搜索课程候选</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题或 ID"/></label><div className="curriculum-preview-list">{filtered.map((item) => <button key={item.id} className={item.id === selected?.id ? "active" : ""} onClick={() => setSelectedId(item.id)}><strong>{item.titleCn}</strong><small>{item.id}</small></button>)}</div></aside>
      <main className="scrollable" aria-live="polite">{selected ? <PreviewDetail tab={tab} item={selected}/> : <div className="empty-state"><h2>没有匹配内容</h2></div>}</main>
    </div>
  </div>;
}

function AssetPreview({ asset }: { asset: (typeof stagedConceptLessons)[number]["primaryApply"] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [evidenceText, setEvidenceText] = useState("");
  const [changeMindCn, setChangeMindCn] = useState("");
  const [evaluation, setEvaluation] = useState<StagedAssessmentEvaluation>();
  const locked = Boolean(evaluation);
  const optionEntries = asset.options.map((option, index) => ({ option, code: `O${index + 1}` }));
  const optionIdByCode = Object.fromEntries(optionEntries.map(({ option, code }) => [code, option.id]));
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const runReviewSimulation = () => {
    const evidenceUnits = evidenceText.split("\n").map((line) => {
      const [rowId, optionCode, quotedFactCn, ...reasoning] = line.split("|");
      return { rowId: rowId?.trim() ?? "", supportsOptionId: optionIdByCode[optionCode?.trim().toUpperCase() ?? ""] ?? "", quotedFactCn: quotedFactCn?.trim() ?? "", reasoningCn: reasoning.join("|").trim() };
    }).filter((unit) => unit.rowId && unit.supportsOptionId && unit.quotedFactCn && unit.reasoningCn);
    setEvaluation(evaluateStagedAssessment(asset, selectedIds, evidenceUnits, changeMindCn));
  };
  return <details><summary>{asset.role} · {asset.id}</summary><p>{asset.scenarioCn}</p><p><small>stimulus={asset.stimulus.format}</small></p><table><thead><tr>{asset.stimulus.columnsCn.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{asset.stimulus.rowsCn.map((row, rowIndex) => <tr key={`${asset.id}-row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${asset.id}-cell-${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table><small>{asset.stimulus.noteCn}</small><p><strong>{asset.promptCn}</strong></p><fieldset disabled={locked}><legend>审核用结构预检（不自动通过、不写入学习状态）</legend>{optionEntries.map(({ option, code }) => <label key={option.id}><input type="checkbox" checked={selectedIds.includes(option.id)} onChange={() => toggle(option.id)}/><span>{code} · {option.labelCn}</span>{evaluation ? <small>{evaluation.feedbackByOptionId[option.id]}</small> : null}</label>)}<label><span>证据单元（每行：材料行ID | 选项编号 | 材料原文短引 | 推理）</span><textarea value={evidenceText} onChange={(event) => setEvidenceText(event.target.value)} placeholder={`${asset.stimulus.rowsCn[0][0]} | O1 | 材料原文 | 说明事实与决定的关系`}/></label><label><span>什么反证结果会改变当前决定，出现后将怎样更新？</span><textarea value={changeMindCn} onChange={(event) => setChangeMindCn(event.target.value)}/></label></fieldset><button type="button" disabled={locked} onClick={runReviewSimulation}>{locked ? "结构预检已锁定" : "锁定并运行结构预检"}</button>{evaluation ? <div role="status"><strong>预检结果：{evaluation.status}</strong><p>recommendedNextRoute={evaluation.recommendedNextRoute}（仅建议、未实现自动路由） · requiresHumanReview={String(evaluation.requiresHumanReview)} · createsCompetence={String(evaluation.createsCompetence)}</p><p>{evaluation.requiresHumanReview ? "结构条件满足；自由文本关系与反证更新必须由独立人工评分，机器不会标记完成。" : asset.scoringRule.partialCreditCn}</p></div> : null}<p><small>预检：每个正确决定都须有独立证据单元，共至少 {asset.scoringRule.minimumEvidenceUnits} 个；{asset.scoringRule.stopRuleCn}</small></p><small>responseLocked={String(asset.responseLocked)} · confidence={String(asset.confidenceRequired)} · hints={asset.hints.length}</small></details>;
}

function PreviewDetail({ tab, item }: { tab: Tab; item: ReturnType<typeof listFor>[number] }) {
  if (tab === "manifest") {
    const record = item as (typeof curriculumManifest)[number];
    return <article><span className="eyebrow">{record.classification} · {record.scientificRisk} risk</span><h2>{record.titleCn}</h2><p>{record.titleEn}</p><dl className="preview-metadata"><div><dt>Guide</dt><dd>{record.guideSectionId}</dd></div><div><dt>Capabilities</dt><dd>{record.capabilityIds.join(" · ")}</dd></div><div><dt>Routes</dt><dd>{record.recommendedContentTypes.join(" · ")}</dd></div><div><dt>Sources</dt><dd>{record.sourceRequirements.join(" · ")}</dd></div><div><dt>Prerequisites</dt><dd>{record.prerequisiteIds.join(" · ") || "foundation root"}</dd></div><div><dt>Status</dt><dd>{record.contentOrigin} · {record.verificationStatus} · {record.lifecycle}</dd></div></dl></article>;
  }
  if (tab === "concept") {
    const lesson = item as (typeof stagedConceptLessons)[number];
    return <article><span className="eyebrow">Concept Lesson · {lesson.estimatedMinutes} min candidate</span><h2>{lesson.titleCn}</h2><p>{lesson.titleEn}</p><section><h3>Why → Intuition → Precision</h3><p>{lesson.whyItMattersCn}</p><p>{lesson.intuitionCn}</p><p>{lesson.preciseExplanationCn}</p><blockquote>{lesson.workedExampleCn}</blockquote></section><section><h3>Explain</h3><p>{lesson.explainPromptCn}</p><ul>{lesson.explanationChecklistCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>{[lesson.primaryApply, lesson.remediation, lesson.delayedReview].map((asset) => <AssetPreview key={asset.id} asset={asset}/>)}</article>;
  }
  if (tab === "method") {
    const lesson = item as (typeof stagedMethodLessons)[number];
    return <article><span className="eyebrow">Method Lesson · {lesson.estimatedMinutes} min · ten-dimension contract</span><h2>{lesson.titleCn}</h2><p>{lesson.scientificQuestionCn}</p><section><h3>直觉与 worked example</h3><p>{lesson.intuitionCn}</p><blockquote>{lesson.workedExampleCn}</blockquote><ol>{lesson.walkthroughStepsCn.map((entry) => <li key={entry}>{entry}</li>)}</ol></section><div className="method-grid"><section><h3>Inputs</h3><ul>{lesson.inputsCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h3>Outputs</h3><ul>{lesson.outputsCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h3>Assumptions</h3><ul>{lesson.assumptionsCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h3>Reviewer checks</h3><ul>{lesson.reviewerChecksCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section></div><p>{lesson.paperAppearanceCn}</p>{[lesson.primaryApply, lesson.remediation, lesson.delayedReview].map((asset) => <AssetPreview key={asset.id} asset={asset}/>)}</article>;
  }
  if (tab === "case") {
    const caseLab = item as (typeof stagedCaseLabs)[number];
    return <article><span className="eyebrow">Case Lab · {caseLab.theme}</span><h2>{caseLab.titleCn}</h2><p>{caseLab.initialContextCn}</p>{caseLab.stages.map((stage) => <section className="preview-case-stage" key={stage.id}><h3>{stage.titleCn}</h3><p>{stage.evidenceCn}</p><strong>{stage.reasoningPromptCn}</strong><small>Calibration: {stage.calibrationCn}</small><small>Update: {stage.updatePromptCn}</small></section>)}<h3>Final task</h3><ul>{caseLab.finalTaskCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></article>;
  }
  const template = item as (typeof studioTemplates)[number];
  return <article><span className="eyebrow">{template.studioType} Studio · transfer only</span><h2>{template.titleCn}</h2><p>{template.purposeCn}</p><p><BookOpenCheck size={14}/> 生成 Transfer Artifact；不创建标准化能力。</p>{template.fields.map((field) => <section className="preview-studio-field" key={field.id}><strong>{field.labelCn}{field.required ? " *" : ""}</strong><p>{field.promptCn}</p></section>)}</article>;
}
