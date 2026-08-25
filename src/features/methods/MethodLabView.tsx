import { BookMarked, CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AttemptFlow } from "../../components/AttemptFlow";
import { methodConcepts, usableMethodConcepts } from "../../data/methods";
import { useAppStore } from "../../state/store";
import { domainLabel } from "../../app/localization";
import { t } from "../../i18n";
import { bilingualMethodTitle, getResearchTerm } from "../../i18n/researchTerms";

export function MethodLabView() {
  const selectedId = useAppStore((state) => state.selectedMethodId);
  const selectMethod = useAppStore((state) => state.selectMethod);
  const globalSearch = useAppStore((state) => state.globalSearch);
  const locale = useAppStore((state) => state.settings.language);
  const [domain, setDomain] = useState("all");
  const selected = methodConcepts.find((concept) => concept.id === selectedId) ?? usableMethodConcepts[0];
  const selectedTerm = getResearchTerm(selected.id, selected.title);
  const filtered = useMemo(() => methodConcepts.filter((concept) => (domain === "all" || concept.domain === domain) && `${concept.title} ${concept.tags.join(" ")}`.toLowerCase().includes(globalSearch.toLowerCase())), [domain, globalSearch]);

  return (
    <div className="split-page methods-page">
      <aside className="feature-list-pane">
        <div className="pane-heading"><span className="eyebrow">方法学训练</span><strong>{usableMethodConcepts.length} 个方法主题</strong></div>
        <label className="compact-search"><Search size={13} /><select value={domain} onChange={(event) => setDomain(event.target.value)}><option value="all">全部领域</option><option value="clinical">临床研究</option><option value="statistics">统计学</option><option value="single-cell">单细胞</option><option value="omics">组学</option><option value="prediction">预测模型</option></select></label>
        <div className="method-list">
          {filtered.map((concept) => <button key={concept.id} className={concept.id === selected.id ? "active" : ""} onClick={() => selectMethod(concept.id)}><span>{locale === "zh-CN" ? bilingualMethodTitle(concept.id, concept.title) : concept.title}</span><small>{concept.minutes} 分钟 · {domainLabel(concept.domain)}</small>{concept.status === "usable" ? <CheckCircle2 size={13} /> : <span className="draft-label">草稿</span>}</button>)}
        </div>
      </aside>
      <section className="feature-workspace scrollable">
        <header className="detail-header"><div><span className="eyebrow">{domainLabel(selected.domain)} · {selected.minutes} 分钟</span><h1>{locale === "zh-CN" ? bilingualMethodTitle(selected.id, selected.title) : selected.title}</h1><p>{locale === "zh-CN" ? selectedTerm.definition : selected.whyItMatters}</p></div><BookMarked size={24} /></header>
        <AttemptFlow
          key={selected.id}
          taskId={`method-attempt-${selected.id}`}
          conceptId={selected.id}
          conceptType="method"
          skillId={selected.domain === "omics" || selected.domain === "single-cell" ? "omics" : "methods"}
          prompt={`阅读解释前：你会如何识别“${bilingualMethodTitle(selected.id, selected.title)}”的主要风险，并作出哪些修改？`}
          feedbackText={`${selected.coreConcept} Common wrong practice: ${selected.commonWrongPractice} Reviewer attack: ${selected.reviewerAttack}`}
          feedback={<div className="method-feedback-grid bilingual-method"><div><span>{t(locale, "method.core")}</span><p>{selectedTerm.definition}</p></div><div><span>{t(locale, "method.english")}</span><p><strong>{selectedTerm.english}</strong>{selectedTerm.abbreviation ? ` · ${selectedTerm.abbreviation}` : ""}</p></div><div><span>{t(locale, "method.appears")}</span><p>在真实研究中，应先明确研究问题、独立单位、数据层级和目标结论，再判断该方法对应的设计或分析风险。</p></div><div className="danger-block"><span>{t(locale, "method.wrong")}</span><p>常见问题是只看软件输出或 P 值，而没有核对研究设计、方法假设、信息泄漏和结论边界。</p></div><div><span>{t(locale, "method.reviewer")}</span><p>审稿人会要求说明方法选择依据、关键假设、独立重复、不确定性以及结果能支持到哪一层结论。</p></div><div><span>{t(locale, "method.correct")}</span><p>预先写清估计目标与分析层级，检查假设和诊断，报告效应量与不确定性，并进行与风险相匹配的敏感性分析。</p></div><div><span>{t(locale, "method.use")}</span><p>当研究问题、数据结构和目标推断与该方法的适用条件一致，且关键假设能够检查或合理说明时使用。</p></div><div><span>{t(locale, "method.avoid")}</span><p>当独立单位、时间顺序、样本信息或可识别性不足时，不要用复杂模型掩盖设计缺陷或扩大结论。</p></div><details className="method-original"><summary>{t(locale, "method.original")}</summary><dl><dt>Why it matters</dt><dd>{selected.whyItMatters}</dd><dt>Core concept</dt><dd>{selected.coreConcept}</dd><dt>Example</dt><dd>{selected.minimalExample}</dd><dt>Common wrong practice</dt><dd>{selected.commonWrongPractice}</dd><dt>Reviewer attack</dt><dd>{selected.reviewerAttack}</dd></dl></details></div>}
          sourceIds={selected.sourceIds}
          transferPrompt={selected.transferPrompt}
          difficulty={selected.difficulty}
          variantPrompt={`一项新研究在不同测量条件下遇到“${selected.title}”。请识别风险并限定结论边界，不要照搬本例。`}
        />
      </section>
    </div>
  );
}
