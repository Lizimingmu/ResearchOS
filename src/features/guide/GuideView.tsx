import { BookOpen, Link2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { guideSections, learningContentRegistry } from "../../data/learningArchitecture";
import { selfRescueModuleLabels } from "../../data/self-rescue-guide";
import { useAppStore } from "../../state/store";
import { createKnowledgeLearningGate } from "../../services/knowledge";

const chapterNames: Record<string, string> = { "research-foundations": "Research Foundations", "study-design": "Study Design", statistics: "Statistics", ...selfRescueModuleLabels };
const registeredGuideSections = guideSections.filter((section) => learningContentRegistry.some((entry) => entry.id === section.id && entry.contentType === "guide"));

export function GuideView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(registeredGuideSections[0].id);
  const readIds = useAppStore((state) => state.guideReadSectionIds);
  const knowledgeWorkspace = useAppStore((state) => state.knowledgeWorkspace);
  const knowledgeAllowed = useMemo(() => createKnowledgeLearningGate(knowledgeWorkspace), [knowledgeWorkspace]);
  const markRead = useAppStore((state) => state.markGuideSectionRead);
  const setView = useAppStore((state) => state.setView);
  const openLearningContentTask = useAppStore((state) => state.openLearningContentTask);
  const filtered = useMemo(() => registeredGuideSections.filter((section) => `${section.titleCn} ${section.titleEn} ${section.summaryCn} ${section.glossaryTerms.map((term) => term.en).join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const section = registeredGuideSections.find((item) => item.id === selectedId) ?? filtered[0] ?? registeredGuideSections[0];
  const onHold = knowledgeWorkspace.holds.some((hold) => hold.assetId === section.id);
  return <div className="guide-layout">
    <aside className="guide-index"><header><span className="eyebrow">Research Guide</span><h1>科研自救指南</h1><p>可搜索的参考层；阅读不会产生能力证据。</p></header><label><Search size={14}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索概念或术语"/></label>{Object.keys(chapterNames).map((chapterId) => <section key={chapterId}><strong>{chapterNames[chapterId]}</strong>{filtered.filter((item) => item.chapterId === chapterId).map((item) => <button key={item.id} className={item.id === section.id ? "active" : ""} onClick={() => setSelectedId(item.id)}>{item.titleCn}{readIds.includes(item.id) && <small>已读</small>}</button>)}</section>)}</aside>
    <article className="guide-reader scrollable" id={section.anchor}><header><span className="eyebrow">{chapterNames[section.chapterId]} · {section.classification}</span><h1>{section.titleCn}</h1><p>{section.titleEn}</p><div className="provenance-strip">{section.verificationStatus} · revision {section.revision} · sources {section.evidenceSourceIds.join(", ")}</div>{section.verificationStatus === "pending" && <div className="pending-curriculum-banner">待科学审核 · 不进入正式 Today · 不计标准化能力</div>}</header>{onHold && <div className="pending-curriculum-banner" role="status">知识更新待审核：本节原文保留供追溯，相关正式学习已暂停。<button onClick={() => setView("content-studio")}>查看知识维护</button></div>}<blockquote>{section.summaryCn}</blockquote>{section.bodyCn.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.glossaryTerms.length > 0 && <section className="guide-glossary"><h2>Glossary</h2>{section.glossaryTerms.map((term) => <dl key={term.en}><dt>{term.zh} <span>{term.en}</span></dt><dd>{term.definitionCn}</dd></dl>)}</section>}{section.advancedNotes && <details><summary>进阶说明</summary>{section.advancedNotes.map((note) => <p key={note}>{note}</p>)}</details>}<div className="guide-links">{section.links.map((link) => <button key={link.targetId} disabled={!knowledgeAllowed(link.targetId)} onClick={() => ["case_lab", "concept_lesson", "method_lesson"].includes(link.type) ? openLearningContentTask({ contentId: link.targetId, activityType: link.type === "case_lab" ? "independent_case" : "explanation" }) : setView("learning")}><Link2 size={14}/>{link.labelCn}</button>)}</div><button className="primary" disabled={readIds.includes(section.id)} onClick={() => markRead(section.id)}><BookOpen size={14}/>{readIds.includes(section.id) ? "已标记阅读（不计能力）" : "标记为已读"}</button></article>
  </div>;
}
