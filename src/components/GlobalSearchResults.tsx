import { BookOpen, FileText, FlaskConical, FolderKanban, Network, ShieldCheck } from "lucide-react";
import { auditCases } from "../data/auditCases";
import { judgmentCards } from "../data/judgmentCards";
import { methodConcepts } from "../data/methods";
import { researchPatterns } from "../data/patterns";
import { useAppStore } from "../state/store";

type SearchResult = { id: string; type: string; title: string; context: string; icon: typeof FileText; open: () => void };

export function GlobalSearchResults() {
  const query = useAppStore((state) => state.globalSearch.trim().toLowerCase());
  const papers = useAppStore((state) => state.papers);
  const projects = useAppStore((state) => state.projects);
  const notes = useAppStore((state) => state.notesByPaperId);
  const selectPaper = useAppStore((state) => state.selectPaper);
  const selectMethod = useAppStore((state) => state.selectMethod);
  const selectAudit = useAppStore((state) => state.selectAudit);
  const selectJudgment = useAppStore((state) => state.selectJudgment);
  const setView = useAppStore((state) => state.setView);
  const setQuery = useAppStore((state) => state.setGlobalSearch);
  if (query.length < 2) return null;
  const matches = (text: string) => text.toLowerCase().includes(query);
  const results: SearchResult[] = [
    ...papers.filter((paper) => matches(`${paper.title} ${paper.topic} ${paper.tags.join(" ")} ${paper.notes} ${notes[paper.id] ?? ""}`)).map((paper) => ({ id: `paper-${paper.id}`, type: "Paper", title: paper.title, context: `${paper.year ?? "year?"} · ${paper.topic || "unclassified"}`, icon: FileText, open: () => selectPaper(paper.id) })),
    ...methodConcepts.filter((method) => matches(`${method.title} ${method.domain} ${method.tags.join(" ")} ${method.coreConcept}`)).map((method) => ({ id: `method-${method.id}`, type: "Method", title: method.title, context: `${method.domain} · ${method.difficulty}`, icon: FlaskConical, open: () => selectMethod(method.id) })),
    ...researchPatterns.filter((pattern) => matches(`${pattern.title} ${pattern.scientificQuestion} ${pattern.failureModes.join(" ")}`)).map((pattern) => ({ id: `pattern-${pattern.id}`, type: "Pattern", title: pattern.title, context: pattern.scientificQuestion, icon: Network, open: () => setView("frontier") })),
    ...projects.filter((project) => matches(`${project.name} ${project.disease} ${project.scientificQuestion} ${project.notes}`)).map((project) => ({ id: `project-${project.id}`, type: "Project", title: project.name, context: project.scientificQuestion || project.currentStage, icon: FolderKanban, open: () => setView("projects") })),
    ...judgmentCards.filter((card) => matches(`${card.title} ${card.domain} ${card.study} ${card.claim}`)).map((card) => ({ id: `judgment-${card.id}`, type: "Judgment", title: card.title, context: `${card.domain} · ${card.severity}`, icon: BookOpen, open: () => { selectJudgment(card.id); setView("review"); } })),
    ...auditCases.filter((audit) => matches(`${audit.title} ${audit.domain} ${audit.task} ${audit.context}`)).map((audit) => ({ id: `audit-${audit.id}`, type: "AI audit", title: audit.title, context: audit.domain, icon: ShieldCheck, open: () => selectAudit(audit.id) })),
  ].slice(0, 14);
  const open = (result: SearchResult) => { result.open(); setQuery(""); };
  return <div className="global-search-results" role="listbox" aria-label="Workspace search results">{results.length ? results.map((result) => { const Icon = result.icon; return <button key={result.id} onClick={() => open(result)}><Icon size={13} /><span><strong>{result.title}</strong><small>{result.context}</small></span><em>{result.type}</em></button>; }) : <div className="empty-inline">No paper, note, method, pattern, project, judgment, or audit matches.</div>}</div>;
}
