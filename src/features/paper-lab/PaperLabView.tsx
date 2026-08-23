import { BookOpen, ChevronRight, FileText, GitCompare, ListChecks, Scale, ScanSearch, Swords, WandSparkles } from "lucide-react";
import { useState } from "react";
import { AttemptFlow } from "../../components/AttemptFlow";
import { PdfViewer } from "../../components/PdfViewer";
import { researchPatterns } from "../../data/patterns";
import { useAppStore } from "../../state/store";

const modes = [
  { id: "prediction", label: "Figure Prediction", icon: ChevronRight, prompt: "State the core scientific question, the evidence job of the current figure, and the next unresolved question.", transfer: "Which next evidence step would you require in your own paper?" },
  { id: "skeleton", label: "Paper Skeleton", icon: ListChecks, prompt: "Reconstruct Figure 1→5 using one evidence-function phrase per figure. Do not describe chart types.", transfer: "Write the five-function skeleton for your current manuscript." },
  { id: "ladder", label: "Evidence Ladder", icon: Scale, prompt: "Place the central claim on the evidence ladder and state the maximal acceptable conclusion.", transfer: "Where does your central project claim sit on the evidence ladder?" },
  { id: "reviewer", label: "Reviewer Attack", icon: Swords, prompt: "Write three major concerns, two minor concerns, and an accept/minor/major/reject recommendation.", transfer: "Which reviewer concern is most actionable in your project this week?" },
  { id: "reconstruct", label: "Figure Reconstruction", icon: ScanSearch, prompt: "Without relying on the legend, infer the exposure, outcome, statistical unit, encodings, allowed conclusion, and likely overclaim.", transfer: "Audit the statistical unit and conclusion boundary of one of your figures." },
  { id: "compare", label: "Compare Papers", icon: GitCompare, prompt: "Compare question, cohort, omics depth, validation, causality, generalizability, figure architecture, and expected journal tier.", transfer: "Name one evidence-chain difference your project should learn from." },
  { id: "why-good", label: "Why Is This Good?", icon: WandSparkles, prompt: "Which figure raises the paper's level, which figure is structurally indispensable, and which result is technically attractive but scientifically incremental?", transfer: "Identify the figure that must raise your manuscript's evidence level." },
];

export function PaperLabView() {
  const papers = useAppStore((state) => state.papers);
  const selectedId = useAppStore((state) => state.selectedPaperId);
  const updatePaper = useAppStore((state) => state.updatePaper);
  const [modeId, setModeId] = useState("prediction");
  const [patternId, setPatternId] = useState("biomarker-discovery");
  const [comparisonId, setComparisonId] = useState(papers[1]?.id ?? papers[0]?.id);
  const paper = papers.find((item) => item.id === selectedId) ?? papers[0];
  const mode = modes.find((item) => item.id === modeId)!;
  const pattern = researchPatterns.find((item) => item.id === patternId)!;
  if (!paper) return <div className="page empty-state"><h2>No paper records</h2><p>Import a PDF or add metadata in Library first.</p></div>;

  const feedback = (
    <div className="senior-review">
      <div><span>CORRECT TARGET</span><p>Each figure should perform an evidence job—not merely display a result. The chain should move from question and discovery through localization, validation, function, and a bounded conclusion.</p></div>
      <div><span>MAJOR CHECK</span><p>Separate measurement units from independent biological units. A visually dense figure can still contribute only descriptive expression evidence.</p></div>
      <div><span>CLAIM BOUNDARY</span><p>Association, spatial proximity, perturbation, rescue, in vivo effect, and clinical validation are distinct rungs. Stop at the strongest rung actually shown.</p></div>
      <div><span>PATTERN REFERENCE · {pattern.title.toUpperCase()}</span><ol>{pattern.evidenceChain.map((item) => <li key={item}>{item}</li>)}</ol></div>
      {modeId === "reviewer" && <div><span>SEVERITY SORT</span><p>Fatal: invalid independent unit or unrecoverable confounding. Additional analysis: robustness or sensitivity. Extra experiment: functional gap. Minor: reporting or presentation.</p></div>}
      {modeId === "compare" && <div><span>COMPARATOR</span><p>{papers.find((item) => item.id === comparisonId)?.title ?? "Select a second paper"}</p></div>}
    </div>
  );

  return (
    <div className="paper-lab-layout">
      <aside className="paper-lab-library">
        <div className="pane-heading"><span className="eyebrow">PAPERS</span><small>{papers.length}</small></div>
        {papers.map((item) => <button key={item.id} className={item.id === paper.id ? "active" : ""} onClick={() => useAppStore.setState({ selectedPaperId: item.id })}><FileText size={14} /><span>{item.title}<small>{item.journal || "Metadata pending"} · {item.year || "—"}</small></span></button>)}
        <div className="pane-subheading">REFERENCE PATTERN</div>
        <select value={patternId} onChange={(event) => setPatternId(event.target.value)}>{researchPatterns.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
        <div className="pattern-mini"><strong>Typical evidence chain</strong>{pattern.evidenceChain.map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}</div>
      </aside>
      <section className="paper-document-pane">
        <header className="paper-document-title"><div><span className="eyebrow">PDF / FIGURE</span><strong>{paper.title}</strong></div><span className={`status-pill ${paper.verificationStatus}`}>{paper.verificationStatus}</span></header>
        <PdfViewer path={paper.pdfPath} currentPage={paper.currentPage} onPageChange={(currentPage) => updatePaper(paper.id, { currentPage })} />
        <div className="paper-note-strip"><BookOpen size={14} /><textarea rows={2} placeholder="Page-linked working note…" value={paper.notes} onChange={(event) => updatePaper(paper.id, { notes: event.target.value })} /></div>
      </section>
      <aside className="training-inspector">
        <div className="training-mode-tabs">{modes.map((item) => { const Icon = item.icon; return <button key={item.id} className={item.id === modeId ? "active" : ""} onClick={() => setModeId(item.id)} title={item.label}><Icon size={14} /><span>{item.label}</span></button>; })}</div>
        {modeId === "compare" && <label className="compare-picker">Compare with<select value={comparisonId} onChange={(event) => setComparisonId(event.target.value)}>{papers.filter((item) => item.id !== paper.id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
        <AttemptFlow
          key={`${paper.id}-${mode.id}`}
          taskId={`paper-${paper.id}-${mode.id}`}
          conceptId={`${paper.id}-${mode.id}`}
          conceptType="paper"
          skillId={modeId === "reviewer" ? "reasoning" : modeId === "why-good" ? "storytelling" : "patterns"}
          prompt={mode.prompt}
          feedback={feedback}
          feedbackText={`Each figure must perform an evidence job. Reference pattern ${pattern.title}: ${pattern.evidenceChain.join(" -> ")}. Separate independent units and stop claims at the strongest shown rung.`}
          sourceIds={pattern.sourceIds}
          transferPrompt={mode.transfer}
          placeholder="Write from the paper/figure before opening legends or external summaries…"
          difficulty={pattern.difficulty}
          variantPrompt={`Reconstruct the same evidence function in an unfamiliar paper using the ${pattern.title} pattern, then state one claim the figures cannot support.`}
        />
      </aside>
    </div>
  );
}
