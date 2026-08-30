import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Beaker, Compass, ExternalLink, HelpCircle, Search, ShieldCheck } from "lucide-react";
import { methodConcepts } from "../../data/methods";
import { researchPatterns } from "../../data/patterns";
import type { KnowledgeStatus, ProblemCard } from "../../domain/problemAtlas";
import type { DifficultyLevel, VerificationStatus } from "../../domain/types";
import { atlasDomainLabel, knowledgeLabel, modeDescription, modeLabel, sourceTypeLabel, supportTypeLabel, tierLabel } from "../../problem-atlas/labels";
import { searchProblemCards } from "../../problem-atlas/search";
import { bilingualMethodTitle } from "../../i18n/researchTerms";
import { difficultyLabel, verificationLabel } from "../../app/localization";
import { useAppStore } from "../../state/store";
import { DiagnosticSessionView, type ModeState } from "./DiagnosticSessionView";
import { DIAGNOSTIC_MODES } from "../../problem-atlas/diagnosticEngine";

const knowledgeBadgeClass = (status: KnowledgeStatus) => ({ current: "badge-current", superseded: "badge-superseded", deprecated: "badge-deprecated", emerging: "badge-emerging" }[status]);

export function ProblemAtlasView() {
  const problemCards = useAppStore((state) => state.problemCards);
  const claims = useAppStore((state) => state.problemAtlasClaims);
  const sources = useAppStore((state) => state.problemAtlasSources);
  const selectedProblemId = useAppStore((state) => state.selectedProblemId);
  const selectProblem = useAppStore((state) => state.selectProblem);
  const selectMethod = useAppStore((state) => state.selectMethod);
  const setView = useAppStore((state) => state.setView);
  const recordProblemSearch = useAppStore((state) => state.recordProblemSearch);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "">("");
  const [knowledge, setKnowledge] = useState<KnowledgeStatus | "">("");
  const [verification, setVerification] = useState<VerificationStatus | "">("");
  const [mode, setMode] = useState<ModeState>("quick");

  const domains = useMemo(() => [...new Set(problemCards.map((card) => card.domain))].sort(), [problemCards]);
  const searchQuery = query.trim();
  const search = useMemo(
    () => (searchQuery.length >= 2
      ? searchProblemCards(searchQuery, problemCards, {
        domain: domain || undefined,
        difficulty: difficulty || undefined,
        knowledgeStatus: knowledge || undefined,
        verificationStatus: verification || undefined,
      })
      : null),
    [searchQuery, problemCards, domain, difficulty, knowledge, verification],
  );
  const listed = useMemo(() => {
    if (search) return search.hits.map((hit) => hit.card);
    return problemCards.filter((card) =>
      (!domain || card.domain === domain)
      && (!difficulty || card.difficulty === difficulty)
      && (!knowledge || card.knowledgeStatus === knowledge)
      && (!verification || card.verificationStatus === verification));
  }, [search, problemCards, domain, difficulty, knowledge, verification]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    const timer = window.setTimeout(() => {
      const results = searchProblemCards(trimmed, problemCards);
      recordProblemSearch(trimmed, results.hits.length > 0, results.hits.length);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [query, problemCards, recordProblemSearch]);

  const selected: ProblemCard | undefined = problemCards.find((card) => card.id === selectedProblemId) ?? problemCards[0];

  useEffect(() => {
    if (!selected) return;
    setMode("quick");
  }, [selected?.id]);

  const claimFor = (claimId: string) => claims.find((claim) => claim.id === claimId);
  const sourceFor = (sourceId: string) => sources.find((source) => source.id === sourceId);

  return (
    <div className="split-page atlas-page">
      <aside className="feature-list-pane">
        <div className="atlas-search-header">
          <span className="eyebrow">我遇到了什么问题？</span>
          <label className="compact-search atlas-search">
            <Search size={13} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="中文 / English / 缩写 / 别名 / 关键词…" />
          </label>
          <div className="atlas-filters">
            <select value={domain} onChange={(event) => setDomain(event.target.value)}><option value="">全部领域</option>{domains.map((item) => <option key={item} value={item}>{atlasDomainLabel(item)}</option>)}</select>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyLevel | "")}><option value="">全部难度</option>{(["foundation", "intermediate", "advanced", "frontier"] as const).map((item) => <option key={item} value={item}>{difficultyLabel(item)}</option>)}</select>
            <select value={knowledge} onChange={(event) => setKnowledge(event.target.value as KnowledgeStatus | "")}><option value="">全部知识状态</option>{(["current", "superseded", "deprecated", "emerging"] as const).map((item) => <option key={item} value={item}>{knowledgeLabel(item)}</option>)}</select>
            <select value={verification} onChange={(event) => setVerification(event.target.value as VerificationStatus | "")}><option value="">全部核验状态</option>{(["pending", "verified", "rejected", "not_required"] as const).map((item) => <option key={item} value={item}>{verificationLabel(item)}</option>)}</select>
          </div>
        </div>
        <div className="review-list">
          {listed.map((card) => (
            <button key={card.id} className={card.id === selected?.id ? "active" : ""} onClick={() => selectProblem(card.id)}>
              <span>
                {card.titleCn}
                <small>{card.titleEn} · {atlasDomainLabel(card.domain)} · {difficultyLabel(card.difficulty)}</small>
                <span className="atlas-badges">
                  <em className={`atlas-badge ${knowledgeBadgeClass(card.knowledgeStatus)}`}>{knowledgeLabel(card.knowledgeStatus)}</em>
                  <em className={`atlas-badge badge-verification-${card.verificationStatus}`}>{verificationLabel(card.verificationStatus)}</em>
                </span>
              </span>
            </button>
          ))}
        </div>
        {searchQuery.length >= 2 && listed.length === 0 && (
          <div className="atlas-unmatched">
            <HelpCircle size={14} />
            <p>没有匹配的科研问题。这不是聊天框，不会生成答案。可尝试以下相关概念：</p>
            <div>{search?.suggestions.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
            <small>该查询已作为“未匹配查询”记录在案，供后续内容规划使用。</small>
          </div>
        )}
      </aside>

      <section className="feature-workspace scrollable">
        {selected ? (
          <>
            <header className="detail-header">
              <div>
                <span className="eyebrow">科研常见问题库 · {atlasDomainLabel(selected.domain)} / {selected.subdomain}</span>
                <h1>{selected.titleCn}</h1>
                <p className="atlas-subtitle">{selected.titleEn}</p>
              </div>
              <div className="atlas-badges">
                <em className={`atlas-badge ${knowledgeBadgeClass(selected.knowledgeStatus)}`}>{knowledgeLabel(selected.knowledgeStatus)}</em>
                <em className={`atlas-badge badge-verification-${selected.verificationStatus}`}>{verificationLabel(selected.verificationStatus)}</em>
                <em className="atlas-badge badge-difficulty">{difficultyLabel(selected.difficulty)} · 重要性 {selected.importance}/5 · 频率 {selected.frequency}/5</em>
              </div>
            </header>

            <div className="case-brief">
              <div><span>观察（Observation）</span><p>{selected.observation}</p></div>
              <div><span>情境（Context）</span><p>{selected.context}</p></div>
              <div><span>为什么重要</span><p>{selected.whyItMatters}</p></div>
            </div>

            <div className="atlas-columns">
              <div>
                <h3 className="atlas-section-title">警示信号（Red Flags）</h3>
                <ul className="atlas-list">{selected.redFlags.map((item) => <li key={item}><AlertTriangle size={13} />{item}</li>)}</ul>
                <h3 className="atlas-section-title">常见错误做法</h3>
                <ul className="atlas-list">{selected.commonWrongActions.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3 className="atlas-section-title">推荐推理路径</h3>
                <ol className="atlas-list">{selected.recommendedReasoning.map((item) => <li key={item}>{item}</li>)}</ol>
                {selected.statisticalImplication && <p className="atlas-implication"><strong>统计含义：</strong>{selected.statisticalImplication}</p>}
                {selected.experimentalImplication && <p className="atlas-implication"><strong>实验含义：</strong>{selected.experimentalImplication}</p>}
                {selected.bioinformaticsImplication && <p className="atlas-implication"><strong>生信含义：</strong>{selected.bioinformaticsImplication}</p>}
              </div>
            </div>

            <div className="atlas-boundary">
              <span className="eyebrow">结论边界（Claim Boundary）</span>
              <p>{selected.claimBoundary}</p>
            </div>
            <div className="atlas-boundary reviewer">
              <span className="eyebrow">审稿含义（Reviewer Implication）</span>
              <p>{selected.reviewerImplication}</p>
            </div>

            <div className="atlas-related">
              <h3 className="atlas-section-title">关联实体（按稳定 ID 链接，不复制内容）</h3>
              <div className="atlas-related-links">
                {selected.relatedMethodIds.map((id) => {
                  const concept = methodConcepts.find((item) => item.id === id);
                  return concept ? <button key={id} onClick={() => selectMethod(id)}><Beaker size={13} /> 方法：{bilingualMethodTitle(concept.id, concept.title)}</button> : null;
                })}
                {selected.relatedPatternIds.map((id) => {
                  const pattern = researchPatterns.find((item) => item.id === id);
                  return pattern ? <button key={id} onClick={() => setView("frontier")}><Compass size={13} /> 研究模式：{pattern.title}</button> : null;
                })}
                {selected.relatedMethodIds.length === 0 && selected.relatedPatternIds.length === 0 && selected.relatedProtocolIds.length === 0 && <small>暂无关联实体链接。</small>}
              </div>
            </div>

            <div className="atlas-claims">
              <h3 className="atlas-section-title">证据主张（Evidence Claims）</h3>
              {selected.evidenceClaimIds.map((claimId) => {
                const entry = claimFor(claimId);
                if (!entry) return null;
                const source = sourceFor(entry.sourceId);
                return (
                  <article key={claimId} className="atlas-claim">
                    <span className="stage-kicker">
                      <em className={`atlas-badge badge-tier-${source?.authorityTier ?? "X"}`}>{source ? `${tierLabel(source.authorityTier)} · Tier ${source.authorityTier}` : "来源缺失"}</em>
                      <em className="atlas-badge badge-support">{entry.verificationStatus === "claim_verified" ? supportTypeLabel(entry.supportType) : `拟${supportTypeLabel(entry.supportType)} · 待核验`}</em>
                      <em className={`atlas-badge badge-verification-${entry.verificationStatus}`}>{entry.verificationStatus === "claim_verified" ? "主张已核验" : "待核验"}</em>
                    </span>
                    <p>{entry.claim}</p>
                    <small><strong>范围：</strong>{entry.scope} · <strong>限定：</strong>{entry.qualification}</small>
                    {source && <small><ShieldCheck size={11} /> {source.title}（{source.year}） · 类型：{sourceTypeLabel(source.sourceType)}{source.doi ? ` · DOI ${source.doi}` : ""}{source.pmid ? ` · PMID ${source.pmid}` : ""}{source.url ? <a href={source.url} target="_blank" rel="noreferrer"> 来源 <ExternalLink size={10} /></a> : null}</small>}
                  </article>
                );
              })}
            </div>

            <div className="atlas-modes">
              <div className="atlas-mode-tabs">
                {DIAGNOSTIC_MODES.map((item) => (
                  <button key={item} className={item === mode ? "active" : ""} onClick={() => setMode(item)}>
                    <strong>{modeLabel(item)}</strong>
                    <small>{modeDescription(item)}</small>
                  </button>
                ))}
              </div>
              <DiagnosticSessionView card={selected} mode={mode} />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h2>科研常见问题库为空</h2>
            <p>导入源包后即可开始诊断训练。当前演示源包未加载。</p>
          </div>
        )}
      </section>
    </div>
  );
}
