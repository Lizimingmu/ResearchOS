import { BookOpenCheck, FlaskConical, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { curriculumManifest, stagedCaseLabs, stagedConceptLessons, stagedMethodLessons, studioTemplates } from "../../data/curriculum";

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
  return <details><summary>{asset.role} · {asset.id}</summary><p>{asset.scenarioCn}</p><p><strong>{asset.promptCn}</strong></p><ol>{asset.options.map((option) => <li key={option.id}>{option.labelCn}</li>)}</ol><small>locked={String(asset.responseLocked)} · confidence={String(asset.confidenceRequired)} · hints={asset.hints.length}</small></details>;
}

function PreviewDetail({ tab, item }: { tab: Tab; item: ReturnType<typeof listFor>[number] }) {
  if (tab === "manifest") {
    const record = item as (typeof curriculumManifest)[number];
    return <article><span className="eyebrow">{record.classification} · {record.scientificRisk} risk</span><h2>{record.titleCn}</h2><p>{record.titleEn}</p><dl className="preview-metadata"><div><dt>Guide</dt><dd>{record.guideSectionId}</dd></div><div><dt>Capabilities</dt><dd>{record.capabilityIds.join(" · ")}</dd></div><div><dt>Routes</dt><dd>{record.recommendedContentTypes.join(" · ")}</dd></div><div><dt>Sources</dt><dd>{record.sourceRequirements.join(" · ")}</dd></div><div><dt>Prerequisites</dt><dd>{record.prerequisiteIds.join(" · ") || "foundation root"}</dd></div><div><dt>Status</dt><dd>{record.contentOrigin} · {record.verificationStatus} · {record.lifecycle}</dd></div></dl></article>;
  }
  if (tab === "concept") {
    const lesson = item as (typeof stagedConceptLessons)[number];
    return <article><span className="eyebrow">Concept Lesson · 8–12 min candidate</span><h2>{lesson.titleCn}</h2><p>{lesson.titleEn}</p><section><h3>Why → Intuition → Precision</h3><p>{lesson.whyItMattersCn}</p><p>{lesson.intuitionCn}</p><p>{lesson.preciseExplanationCn}</p><blockquote>{lesson.workedExampleCn}</blockquote></section><section><h3>Explain</h3><p>{lesson.explainPromptCn}</p><ul>{lesson.explanationChecklistCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>{[lesson.primaryApply, lesson.remediation, lesson.delayedReview].map((asset) => <AssetPreview key={asset.id} asset={asset}/>)}</article>;
  }
  if (tab === "method") {
    const lesson = item as (typeof stagedMethodLessons)[number];
    return <article><span className="eyebrow">Method Lesson · ten-dimension contract</span><h2>{lesson.titleCn}</h2><p>{lesson.scientificQuestionCn}</p><section><h3>直觉与 worked example</h3><p>{lesson.intuitionCn}</p><blockquote>{lesson.workedExampleCn}</blockquote><ol>{lesson.walkthroughStepsCn.map((entry) => <li key={entry}>{entry}</li>)}</ol></section><div className="method-grid"><section><h3>Inputs</h3><ul>{lesson.inputsCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h3>Outputs</h3><ul>{lesson.outputsCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h3>Assumptions</h3><ul>{lesson.assumptionsCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h3>Reviewer checks</h3><ul>{lesson.reviewerChecksCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></section></div><p>{lesson.paperAppearanceCn}</p>{[lesson.primaryApply, lesson.remediation, lesson.delayedReview].map((asset) => <AssetPreview key={asset.id} asset={asset}/>)}</article>;
  }
  if (tab === "case") {
    const caseLab = item as (typeof stagedCaseLabs)[number];
    return <article><span className="eyebrow">Case Lab · {caseLab.theme}</span><h2>{caseLab.titleCn}</h2><p>{caseLab.initialContextCn}</p>{caseLab.stages.map((stage) => <section className="preview-case-stage" key={stage.id}><h3>{stage.titleCn}</h3><p>{stage.evidenceCn}</p><strong>{stage.reasoningPromptCn}</strong><small>Calibration: {stage.calibrationCn}</small><small>Update: {stage.updatePromptCn}</small></section>)}<h3>Final task</h3><ul>{caseLab.finalTaskCn.map((entry) => <li key={entry}>{entry}</li>)}</ul></article>;
  }
  const template = item as (typeof studioTemplates)[number];
  return <article><span className="eyebrow">{template.studioType} Studio · transfer only</span><h2>{template.titleCn}</h2><p>{template.purposeCn}</p><p><BookOpenCheck size={14}/> 生成 Transfer Artifact；不创建标准化能力。</p>{template.fields.map((field) => <section className="preview-studio-field" key={field.id}><strong>{field.labelCn}{field.required ? " *" : ""}</strong><p>{field.promptCn}</p></section>)}</article>;
}
