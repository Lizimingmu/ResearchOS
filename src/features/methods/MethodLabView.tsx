import { BookMarked, CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AttemptFlow } from "../../components/AttemptFlow";
import { methodConcepts, usableMethodConcepts } from "../../data/methods";
import { useAppStore } from "../../state/store";

export function MethodLabView() {
  const selectedId = useAppStore((state) => state.selectedMethodId);
  const selectMethod = useAppStore((state) => state.selectMethod);
  const globalSearch = useAppStore((state) => state.globalSearch);
  const [domain, setDomain] = useState("all");
  const selected = methodConcepts.find((concept) => concept.id === selectedId) ?? usableMethodConcepts[0];
  const filtered = useMemo(() => methodConcepts.filter((concept) => (domain === "all" || concept.domain === domain) && `${concept.title} ${concept.tags.join(" ")}`.toLowerCase().includes(globalSearch.toLowerCase())), [domain, globalSearch]);

  return (
    <div className="split-page methods-page">
      <aside className="feature-list-pane">
        <div className="pane-heading"><span className="eyebrow">METHOD BITES</span><strong>{usableMethodConcepts.length} usable</strong></div>
        <label className="compact-search"><Search size={13} /><select value={domain} onChange={(event) => setDomain(event.target.value)}><option value="all">All domains</option><option value="clinical">Clinical</option><option value="statistics">Statistics</option><option value="single-cell">Single-cell</option><option value="omics">Omics</option><option value="prediction">Prediction</option></select></label>
        <div className="method-list">
          {filtered.map((concept) => <button key={concept.id} className={concept.id === selected.id ? "active" : ""} onClick={() => selectMethod(concept.id)}><span>{concept.title}</span><small>{concept.minutes} min · {concept.domain}</small>{concept.status === "usable" ? <CheckCircle2 size={13} /> : <span className="draft-label">DRAFT</span>}</button>)}
        </div>
      </aside>
      <section className="feature-workspace scrollable">
        <header className="detail-header"><div><span className="eyebrow">{selected.domain.toUpperCase()} · {selected.minutes} MIN</span><h1>{selected.title}</h1><p>{selected.whyItMatters}</p></div><BookMarked size={24} /></header>
        <AttemptFlow
          key={selected.id}
          taskId={`method-attempt-${selected.id}`}
          conceptId={selected.id}
          conceptType="method"
          skillId={selected.domain === "omics" || selected.domain === "single-cell" ? "omics" : "methods"}
          prompt={`Before reading the explanation: how would you detect the main ${selected.title.toLowerCase()} risk, and what would you change?`}
          feedbackText={`${selected.coreConcept} Common wrong practice: ${selected.commonWrongPractice} Reviewer attack: ${selected.reviewerAttack}`}
          feedback={<div className="method-feedback-grid"><div><span>CORE CONCEPT</span><p>{selected.coreConcept}</p></div><div><span>MINIMAL EXAMPLE</span><p>{selected.minimalExample}</p></div><div className="danger-block"><span>COMMON WRONG PRACTICE</span><p>{selected.commonWrongPractice}</p></div><div><span>REVIEWER ATTACK</span><p>{selected.reviewerAttack}</p></div><div><span>WHEN TO USE</span><p>{selected.whenToUse}</p></div><div><span>WHEN NOT TO USE</span><p>{selected.whenNotToUse}</p></div></div>}
          sourceIds={selected.sourceIds}
          transferPrompt={selected.transferPrompt}
          difficulty={selected.difficulty}
          variantPrompt={`A new study encounters ${selected.title.toLowerCase()} under different measurements. Identify the risk and bound the conclusion without repeating this example.`}
        />
      </section>
    </div>
  );
}
