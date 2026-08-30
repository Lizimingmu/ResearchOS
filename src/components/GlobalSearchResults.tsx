import { BookOpen, FileText, FlaskConical, FolderKanban, Network, SearchCheck, ShieldCheck } from "lucide-react";
import { auditCases } from "../data/auditCases";
import { judgmentCards } from "../data/judgmentCards";
import { methodConcepts } from "../data/methods";
import { researchPatterns } from "../data/patterns";
import { useAppStore } from "../state/store";
import { difficultyLabel, domainLabel, severityLabel, verificationLabel } from "../app/localization";
import { bilingualMethodTitle } from "../i18n/researchTerms";
import { bilingualAuditTitle } from "../i18n/scientificContent";
import { searchProblemCards } from "../problem-atlas/search";
import { knowledgeLabel } from "../problem-atlas/labels";

type SearchResult = { id: string; type: string; title: string; context: string; icon: typeof FileText; open: () => void };

export function GlobalSearchResults() {
  const query = useAppStore((state) => state.globalSearch.trim().toLowerCase());
  const papers = useAppStore((state) => state.papers);
  const projects = useAppStore((state) => state.projects);
  const notes = useAppStore((state) => state.notesByPaperId);
  const problemCards = useAppStore((state) => state.problemCards);
  const selectPaper = useAppStore((state) => state.selectPaper);
  const selectMethod = useAppStore((state) => state.selectMethod);
  const selectAudit = useAppStore((state) => state.selectAudit);
  const selectJudgment = useAppStore((state) => state.selectJudgment);
  const selectProblem = useAppStore((state) => state.selectProblem);
  const setView = useAppStore((state) => state.setView);
  const setQuery = useAppStore((state) => state.setGlobalSearch);
  if (query.length < 2) return null;
  const matches = (text: string) => text.toLowerCase().includes(query);
  const problemHits = searchProblemCards(query, problemCards).hits.slice(0, 5);
  const results: SearchResult[] = [
    ...papers.filter((paper) => matches(`${paper.title} ${paper.topic} ${paper.tags.join(" ")} ${paper.notes} ${notes[paper.id] ?? ""}`)).map((paper) => ({ id: `paper-${paper.id}`, type: "论文", title: paper.title, context: `${paper.year ?? "年份未知"} · ${paper.topic || "未分类"}`, icon: FileText, open: () => selectPaper(paper.id) })),
    ...problemHits.map(({ card }) => ({ id: `problem-${card.id}`, type: "科研问题", title: `${card.titleCn}（${card.titleEn}）`, context: `${knowledgeLabel(card.knowledgeStatus)} · ${difficultyLabel(card.difficulty)} · ${verificationLabel(card.verificationStatus)}`, icon: SearchCheck, open: () => selectProblem(card.id) })),
    ...methodConcepts.filter((method) => matches(`${bilingualMethodTitle(method.id, method.title)} ${method.domain} ${method.tags.join(" ")} ${method.coreConcept}`)).map((method) => ({ id: `method-${method.id}`, type: "方法", title: bilingualMethodTitle(method.id, method.title), context: `${domainLabel(method.domain)} · ${difficultyLabel(method.difficulty)}`, icon: FlaskConical, open: () => selectMethod(method.id) })),
    ...researchPatterns.filter((pattern) => matches(`${pattern.title} ${pattern.scientificQuestion} ${pattern.failureModes.join(" ")}`)).map((pattern) => ({ id: `pattern-${pattern.id}`, type: "研究模式", title: pattern.title, context: pattern.scientificQuestion, icon: Network, open: () => setView("frontier") })),
    ...projects.filter((project) => matches(`${project.name} ${project.disease} ${project.scientificQuestion} ${project.notes}`)).map((project) => ({ id: `project-${project.id}`, type: "项目", title: project.name, context: project.scientificQuestion || project.currentStage, icon: FolderKanban, open: () => setView("projects") })),
    ...judgmentCards.filter((card) => matches(`${card.title} ${card.domain} ${card.study} ${card.claim}`)).map((card) => ({ id: `judgment-${card.id}`, type: "判断题", title: card.title, context: `${domainLabel(card.domain)} · ${severityLabel(card.severity)}`, icon: BookOpen, open: () => { selectJudgment(card.id); setView("review"); } })),
    ...auditCases.filter((audit) => matches(`${bilingualAuditTitle(audit)} ${audit.domain} ${audit.task} ${audit.context}`)).map((audit) => ({ id: `audit-${audit.id}`, type: "AI 审核", title: bilingualAuditTitle(audit), context: domainLabel(audit.domain), icon: ShieldCheck, open: () => selectAudit(audit.id) })),
  ].slice(0, 14);
  const open = (result: SearchResult) => { result.open(); setQuery(""); };
  return <div className="global-search-results" role="listbox" aria-label="工作区搜索结果">{results.length ? results.map((result) => { const Icon = result.icon; return <button key={result.id} onClick={() => open(result)}><Icon size={13} /><span><strong>{result.title}</strong><small>{result.context}</small></span><em>{result.type}</em></button>; }) : <div className="empty-inline">没有匹配的论文、笔记、方法、科研问题、研究模式、项目、判断题或审查案例。</div>}</div>;
}
