import { BookMarked, CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AttemptFlow } from "../../components/AttemptFlow";
import { methodConcepts, usableMethodConcepts } from "../../data/methods";
import { useAppStore } from "../../state/store";
import { domainLabel } from "../../app/localization";

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
        <div className="pane-heading"><span className="eyebrow">方法微课</span><strong>{usableMethodConcepts.length} 个可用</strong></div>
        <label className="compact-search"><Search size={13} /><select value={domain} onChange={(event) => setDomain(event.target.value)}><option value="all">全部领域</option><option value="clinical">临床研究</option><option value="statistics">统计学</option><option value="single-cell">单细胞</option><option value="omics">组学</option><option value="prediction">预测模型</option></select></label>
        <div className="method-list">
          {filtered.map((concept) => <button key={concept.id} className={concept.id === selected.id ? "active" : ""} onClick={() => selectMethod(concept.id)}><span>{concept.title}</span><small>{concept.minutes} 分钟 · {domainLabel(concept.domain)}</small>{concept.status === "usable" ? <CheckCircle2 size={13} /> : <span className="draft-label">草稿</span>}</button>)}
        </div>
      </aside>
      <section className="feature-workspace scrollable">
        <header className="detail-header"><div><span className="eyebrow">{domainLabel(selected.domain)} · {selected.minutes} 分钟</span><h1>{selected.title}</h1><p>{selected.whyItMatters}</p></div><BookMarked size={24} /></header>
        <AttemptFlow
          key={selected.id}
          taskId={`method-attempt-${selected.id}`}
          conceptId={selected.id}
          conceptType="method"
          skillId={selected.domain === "omics" || selected.domain === "single-cell" ? "omics" : "methods"}
          prompt={`阅读解释前：你会如何识别“${selected.title}”的主要风险，并作出哪些修改？`}
          feedbackText={`${selected.coreConcept} Common wrong practice: ${selected.commonWrongPractice} Reviewer attack: ${selected.reviewerAttack}`}
          feedback={<div className="method-feedback-grid"><div><span>核心概念</span><p>{selected.coreConcept}</p></div><div><span>最小示例</span><p>{selected.minimalExample}</p></div><div className="danger-block"><span>常见错误做法</span><p>{selected.commonWrongPractice}</p></div><div><span>审稿人可能的质疑</span><p>{selected.reviewerAttack}</p></div><div><span>适用情境</span><p>{selected.whenToUse}</p></div><div><span>不适用情境</span><p>{selected.whenNotToUse}</p></div></div>}
          sourceIds={selected.sourceIds}
          transferPrompt={selected.transferPrompt}
          difficulty={selected.difficulty}
          variantPrompt={`一项新研究在不同测量条件下遇到“${selected.title}”。请识别风险并限定结论边界，不要照搬本例。`}
        />
      </section>
    </div>
  );
}
