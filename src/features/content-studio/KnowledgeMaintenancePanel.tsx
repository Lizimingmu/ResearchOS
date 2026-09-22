import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, FilePlus2, History, Inbox, Search, Sparkles } from "lucide-react";
import {
  FRESHNESS_CLASSES, KNOWLEDGE_CHANGE_TYPES, KNOWLEDGE_PROJECTION_TYPES, KNOWLEDGE_TYPES,
  type KnowledgeChangeCandidate, type KnowledgeImpact, type KnowledgeImportPreview, type KnowledgeImportRequest,
  type KnowledgeProjection, type KnowledgeProjectionType, type KnowledgeRevisionBinding,
  type KnowledgeType, type KnowledgeUnit, type KnowledgeWorkspace,
} from "../../domain/knowledge";
import {
  appendKnowledgeProjections, applyKnowledgeChange, commitKnowledgeImport, compareKnowledgeRevisions,
  createKnowledgeTemplate, effectiveKnowledgeStatus, generateKnowledgeProjections, knowledgeHash,
  knowledgeWorkspaceHash, mergeKnowledgeMigration, previewKnowledgeImpact, previewKnowledgeImport, proposeKnowledgeChange,
} from "../../services/knowledge";
import { adaptProtocolStaging, type KnowledgeMigrationFragment } from "../../services/knowledgeAdapters";
import { builtInProtocolImports } from "../../data/knowledge";
import { useAppStore } from "../../state/store";

type Mode = "maintenance" | "template" | "import";
type Queue = "all" | "updates" | "review" | "superseded" | "emerging" | "conflicts";
type Operation = KnowledgeChangeCandidate["operation"];
const typeLabels: Record<KnowledgeType, string> = { concept: "概念", method: "方法", protocol: "实验方案", guideline: "指南", research_pattern: "研究模式", experimental_technique: "实验技术" };
const freshnessLabels = { FOUNDATIONAL_STABLE: "基础稳定：按证据变化复核", EVOLVING_PRACTICE: "实践演进：关注方法和基准变化", VERSION_SENSITIVE: "版本敏感：关注软件与接口版本", GUIDELINE_TRIGGERED: "指南驱动：关注正式版本发布" };
const statusLabels: Record<string, string> = { CURRENT: "当前版本", UPDATE_AVAILABLE: "有可用更新", REVIEW_REQUIRED: "需要审核", SUPERSEDED: "已被取代", DEPRECATED: "已废弃", EMERGING: "新兴证据" };
const changeLabels = { NEW: "新知识", UPDATE: "更新", EXTENSION: "扩展", CONTRADICTION: "证据矛盾", DEPRECATION: "废弃", SUPERSESSION: "取代" };
const projectionLabels: Record<KnowledgeProjectionType, string> = { guide: "Guide 章节", concept_lesson: "概念课", method_lesson: "方法课", protocol_lesson: "实验方案课", apply: "应用练习", remediation: "补救练习", delayed_review: "延迟复习", case_lab: "案例" };
const formats: Array<{ id: KnowledgeImportRequest["format"]; label: string }> = [
  { id: "doi", label: "DOI" }, { id: "pmid", label: "PMID" }, { id: "metadata", label: "来源信息" },
  { id: "source_pack", label: "来源包" }, { id: "markdown", label: "Markdown" }, { id: "json", label: "JSON" }, { id: "note", label: "研究笔记" },
];
const now = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const binding = (unit: KnowledgeUnit): KnowledgeRevisionBinding => ({ knowledgeUnitId: unit.id, revision: unit.revision, hash: unit.hash });
// Keep trailing empty lines while typing; normalize only when preview is built.
const lines = (value: string) => value.split(/\r?\n/);
const cleanDraftFields = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.every((item) => typeof item === "string")
    ? value.map((item) => item.trim()).filter(Boolean) : value.map(cleanDraftFields);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === "provenance" ? item : cleanDraftFields(item)]));
  return value;
};
const rendered = (value: unknown) => value === undefined ? "（未填写）" : typeof value === "string" ? value : JSON.stringify(value, null, 2);
const getHeads = (workspace: KnowledgeWorkspace) => [...workspace.units.reduce((map, unit) => {
  if (!map.has(unit.id) || map.get(unit.id)!.revision < unit.revision) map.set(unit.id, unit);
  return map;
}, new Map<string, KnowledgeUnit>()).values()];

type Field = { key: string; label: string; list?: boolean };
const commonFields: Field[] = [
  { key: "scientificQuestion", label: "科学问题" }, { key: "whyItMatters", label: "为什么重要" }, { key: "intuition", label: "直觉解释" },
  { key: "preciseExplanation", label: "精确解释", list: true }, { key: "inputs", label: "输入", list: true }, { key: "outputs", label: "输出", list: true },
  { key: "assumptions", label: "成立所需的假设", list: true }, { key: "workflowOrLogic", label: "工作流程或推理逻辑", list: true },
  { key: "boundaries", label: "适用与结论边界", list: true }, { key: "misconceptions", label: "常见误解", list: true },
  { key: "failureModes", label: "失败方式", list: true }, { key: "alternativeExplanations", label: "竞争解释", list: true },
];
const protocolFields: Field[] = [
  { key: "signalOrigin", label: "信号来源" }, { key: "experimentalUnit", label: "实验单位" },
  { key: "biologicalReplicate", label: "生物学重复" }, { key: "technicalReplicate", label: "技术重复" },
  { key: "controls", label: "对照及其诊断作用", list: true }, { key: "workflowLogic", label: "实验流程逻辑", list: true },
  { key: "criticalVariables", label: "关键变量", list: true }, { key: "qcCheckpoints", label: "质量控制检查点", list: true },
  { key: "troubleshooting", label: "故障排查与区分性检查", list: true }, { key: "quantification", label: "定量与归一化" },
  { key: "statisticalUnit", label: "统计单位" }, { key: "allowedClaims", label: "允许的结论", list: true }, { key: "forbiddenClaims", label: "不可据此推出的结论", list: true },
];
const extraFields: Record<KnowledgeType, { section: string; fields: Field[] }> = {
  concept: { section: "concept", fields: [{ key: "definition", label: "定义" }, { key: "counterexamples", label: "反例", list: true }] },
  method: { section: "method", fields: [{ key: "algorithmOrStatisticalLogic", label: "算法或统计逻辑" }, { key: "parameters", label: "参数", list: true }, { key: "diagnostics", label: "诊断检查", list: true }, { key: "appropriateWhen", label: "适合何种问题", list: true }, { key: "inappropriateWhen", label: "不适合何种问题", list: true }, { key: "commonMisuse", label: "常见误用", list: true }, { key: "reviewerChecks", label: "审稿核查", list: true }, { key: "paperAppearance", label: "论文中如何呈现" }] },
  protocol: { section: "protocol", fields: protocolFields }, experimental_technique: { section: "technique", fields: protocolFields },
  guideline: { section: "guideline", fields: [{ key: "issuingOrganization", label: "发布机构" }, { key: "version", label: "指南版本" }, { key: "effectiveDate", label: "生效日期（YYYY-MM-DD）" }, { key: "supersededVersion", label: "被取代的指南版本" }, { key: "recommendationScope", label: "建议适用范围", list: true }] },
  research_pattern: { section: "pattern", fields: [{ key: "context", label: "研究情境" }, { key: "evidenceLogic", label: "证据逻辑", list: true }, { key: "applicability", label: "适用条件", list: true }] },
};

function ScienceFields({ unit, onChange }: { unit: KnowledgeUnit; onChange: (unit: KnowledgeUnit) => void }) {
  const nested = extraFields[unit.knowledgeType];
  const values = unit as unknown as Record<string, unknown>;
  const patch = (key: string, value: unknown, section?: string) => onChange((section
    ? { ...unit, [section]: { ...(values[section] as Record<string, unknown>), [key]: value } }
    : { ...unit, [key]: value }) as KnowledgeUnit);
  const field = (item: Field, section?: string) => {
    const value = (section ? values[section] as Record<string, unknown> : values)[item.key];
    return <label key={`${section ?? "common"}-${item.key}`}>{item.label}{item.list && <small>每行一项</small>}<textarea rows={3} value={Array.isArray(value) ? value.join("\n") : String(value ?? "")} onChange={(event) => patch(item.key, item.list ? lines(event.target.value) : event.target.value, section)} /></label>;
  };
  return <><div className="form-grid two"><label>标题<input value={unit.title} onChange={(event) => patch("title", event.target.value)} /></label><label>别名（每行一项）<textarea rows={2} value={unit.aliases.join("\n")} onChange={(event) => patch("aliases", lines(event.target.value))} /></label><label>研究领域（每行一项）<textarea rows={2} value={unit.domain.join("\n")} onChange={(event) => patch("domain", lines(event.target.value))} /></label><label>复核策略<select value={unit.freshnessClass} onChange={(event) => patch("freshnessClass", event.target.value)}>{FRESHNESS_CLASSES.map((value) => <option key={value} value={value}>{freshnessLabels[value]}</option>)}</select></label></div><details open><summary>通用科学内容</summary><div className="form-grid two">{commonFields.map((item) => field(item))}</div></details><details open><summary>{typeLabels[unit.knowledgeType]}专属内容</summary><div className="form-grid two">{nested.fields.map((item) => field(item, nested.section))}</div></details><details><summary>依赖与复核日期</summary><div className="form-grid two"><label>前置知识 ID（每行一项）<textarea value={unit.prerequisiteIds.join("\n")} onChange={(event) => patch("prerequisiteIds", lines(event.target.value))} /></label><label>下游知识 ID（每行一项）<textarea value={unit.downstreamIds.join("\n")} onChange={(event) => patch("downstreamIds", lines(event.target.value))} /></label><label>下次复核日期（可留空）<input type="date" value={unit.nextReviewAt?.slice(0, 10) ?? ""} onChange={(event) => patch("nextReviewAt", event.target.value || undefined)} /></label><label>有效截止日期（可留空）<input type="date" value={unit.validUntil?.slice(0, 10) ?? ""} onChange={(event) => patch("validUntil", event.target.value || undefined)} /></label></div></details></>;
}

function ImpactPanel({ impact }: { impact: KnowledgeImpact }) {
  const groups: Array<[string, string[]]> = [["知识版本", impact.affectedKnowledge.map((item) => `${item.knowledgeUnitId} · r${item.revision}`)], ["Guide", impact.affectedGuides], ["课程", impact.affectedLessons], ["评估", impact.affectedAssessments], ["案例", impact.affectedCases], ["实验方案", impact.affectedProtocols], ["Studio", impact.affectedStudios]];
  return <section className="m020-impact"><h3>影响预览</h3><p>确认变更后，受影响的学习内容需要复核。原有内容与历史作答保留。</p>{impact.errors.length > 0 && <ul role="alert">{impact.errors.map((error) => <li key={error}>{error}</li>)}</ul>}<div className="m020-impact-groups">{groups.map(([title, items]) => <details key={title}><summary>{title} · {items.length}</summary>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>没有已登记的依赖。</p>}</details>)}</div>{impact.patchProposals.length > 0 && <details><summary>待审核修订建议 · {impact.patchProposals.length}</summary><ul>{impact.patchProposals.map((item) => <li key={item.assetId}>{item.assetId}：{item.reason}</li>)}</ul></details>}</section>;
}

function RevisionDiff({ before, after }: { before?: KnowledgeUnit; after?: KnowledgeUnit }) {
  if (!after) return <p>这次操作只记录版本状态与影响，不重写科学内容。</p>;
  if (!before) return <details open><summary>新知识内容预览</summary><h4>{after.title}</h4><p>{after.scientificQuestion || "科学问题尚待填写"}</p>{after.preciseExplanation.map((item, index) => <p key={index}>{item}</p>)}<details><summary>完整候选与来源</summary><pre>{JSON.stringify(after, null, 2)}</pre></details></details>;
  const diffs = compareKnowledgeRevisions(before, after);
  return <div className="m020-diffs"><h3>版本对比：r{before.revision} → r{after.revision}</h3>{diffs.length ? diffs.map((diff) => <details key={diff.field}><summary>{commonFields.find((field) => field.key === diff.field)?.label ?? diff.field}</summary><div className="m020-diff-pair"><div><strong>原版本</strong><pre>{rendered(diff.before)}</pre></div><div><strong>候选版本</strong><pre>{rendered(diff.after)}</pre></div></div></details>) : <p>没有字段变化。</p>}</div>;
}

export function KnowledgeMaintenancePanel({ initialMode = "maintenance" }: { initialMode?: Mode }) {
  const workspace = useAppStore((state) => state.knowledgeWorkspace);
  const setWorkspace = useAppStore((state) => state.setKnowledgeWorkspace);
  const notify = useAppStore((state) => state.notify);
  const overlayConflicts = useAppStore((state) => state.contentConflicts);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [queue, setQueue] = useState<Queue>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [revision, setRevision] = useState<number>();
  const [compareRevision, setCompareRevision] = useState<number>();
  const [draft, setDraft] = useState<KnowledgeUnit>(() => createKnowledgeTemplate("concept", { id: makeId("knowledge"), title: "", now: now() }));
  const [operation, setOperation] = useState<Operation>("create");
  const [target, setTarget] = useState<KnowledgeRevisionBinding>();
  const [reason, setReason] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [candidate, setCandidate] = useState<KnowledgeChangeCandidate>();
  const [projectionTypes, setProjectionTypes] = useState<KnowledgeProjectionType[]>([...KNOWLEDGE_PROJECTION_TYPES]);
  const [projectionPreview, setProjectionPreview] = useState<KnowledgeProjection[]>([]);
  const [projectionBase, setProjectionBase] = useState("");
  const [format, setFormat] = useState<KnowledgeImportRequest["format"]>("note");
  const [importText, setImportText] = useState("");
  const [importTitle, setImportTitle] = useState("");
  const [importType, setImportType] = useState<KnowledgeType>("concept");
  const [importTarget, setImportTarget] = useState("");
  const [changeType, setChangeType] = useState<KnowledgeImportRequest["changeType"]>("NEW");
  const [origin, setOrigin] = useState<"user" | "ai_generated">("user");
  const [metadata, setMetadata] = useState({ title: "", doi: "", pmid: "", url: "", version: "" });
  const [importPreview, setImportPreview] = useState<KnowledgeImportPreview>();
  const [protocolPreview, setProtocolPreview] = useState<{ fragment: KnowledgeMigrationFragment; title: string; baseHash: string }>();
  useEffect(() => { setCandidate(undefined); }, [draft]);
  const heads = useMemo(() => getHeads(workspace), [workspace]);
  const selected = workspace.units.filter((unit) => unit.id === selectedId).find((unit) => unit.revision === revision) ?? heads.find((unit) => unit.id === selectedId);
  const history = workspace.units.filter((unit) => unit.id === selectedId).sort((a, b) => b.revision - a.revision);
  const comparison = history.find((unit) => unit.revision === compareRevision) ?? history.find((unit) => unit.revision !== selected?.revision);
  const currentState = () => useAppStore.getState().knowledgeWorkspace;
  const guarded = (action: () => void) => { try { action(); } catch (error) { notify(`未保存：${String(error)}`, "error"); } };
  const saveResult = (result: { ok: boolean; errors: string[]; workspace: KnowledgeWorkspace }, message: string) => {
    if (!result.ok) { if (result.workspace.conflicts.length > currentState().conflicts.length) setWorkspace(result.workspace); throw new Error(result.errors.join("；")); }
    setWorkspace(result.workspace); notify(message, "success");
  };
  const impact = useMemo(() => {
    if (!candidate) return undefined;
    try { return previewKnowledgeImpact(workspace, candidate); } catch { return undefined; }
  }, [workspace, candidate]);
  const candidateBase = candidate?.target ? workspace.units.find((unit) => unit.id === candidate.target!.knowledgeUnitId && unit.revision === candidate.target!.revision && unit.hash === candidate.target!.hash) : undefined;
  const selectUnit = (unit: KnowledgeUnit) => { setSelectedId(unit.id); setRevision(unit.revision); setCompareRevision(undefined); setProjectionPreview([]); };
  const begin = (next: Operation, unit?: KnowledgeUnit) => {
    setOperation(next); setTarget(unit ? binding(unit) : undefined); setReason(""); setCandidate(undefined); setMode("template");
    if (!unit) { setDraft(createKnowledgeTemplate("concept", { id: makeId("knowledge"), title: "", now: now() })); return; }
    const copy = structuredClone(unit);
    if (next === "duplicate") { copy.id = makeId("knowledge"); copy.revision = 1; copy.title += "（副本）"; }
    setDraft(copy);
  };
  const makeCandidate = () => guarded(() => {
    const updated = cleanDraftFields(draft) as KnowledgeUnit;
    updated.hash = knowledgeHash(updated);
    setCandidate(proposeKnowledgeChange(currentState(), { id: makeId("knowledge-change"), now: now(), reason: reason.trim(), operation, target, unit: ["deprecate", "restore"].includes(operation) ? undefined : updated }));
  });
  const confirmCandidate = () => guarded(() => {
    if (!candidate || !reviewer.trim()) return;
    const result = applyKnowledgeChange(currentState(), candidate, { reviewer: reviewer.trim(), now: now() });
    saveResult(result, "变更已登记并送审；历史版本保留，受影响学习内容需复核。");
    if (candidate.proposedUnit) { setSelectedId(candidate.proposedUnit.id); setRevision(candidate.proposedUnit.revision); }
    setCandidate(undefined); setMode("maintenance");
  });
  const inspectImport = () => guarded(() => {
    const found = heads.find((unit) => unit.id === importTarget);
    setProtocolPreview(undefined);
    setImportPreview(previewKnowledgeImport(currentState(), { id: makeId("knowledge-import"), now: now(), format, text: format === "metadata" ? JSON.stringify(metadata) : importText, title: importTitle.trim() || undefined, knowledgeType: importType, target: found ? binding(found) : undefined, changeType: found ? changeType : "NEW", contentOrigin: origin }));
  });
  const filtered = (queue === "superseded" ? workspace.units : heads).filter((unit) => (!search.trim() || `${unit.title} ${unit.id} ${unit.aliases.join(" ")}`.toLowerCase().includes(search.toLowerCase())) && (queue === "superseded" ? ["SUPERSEDED", "DEPRECATED"].includes(effectiveKnowledgeStatus(workspace, unit)) : queue === "emerging" ? effectiveKnowledgeStatus(workspace, unit) === "EMERGING" : queue === "updates" ? effectiveKnowledgeStatus(workspace, unit) === "UPDATE_AVAILABLE" : queue === "review" ? effectiveKnowledgeStatus(workspace, unit) === "REVIEW_REQUIRED" : true));
  const openCandidates = workspace.candidates.filter((item) => !workspace.ledger.some((entry) => entry.changeId === item.id));

  return <section className="m020-knowledge" aria-label="知识维护">
    <header className="m020-heading"><div><span className="eyebrow">Knowledge Maintenance</span><h2>可追溯的科研知识</h2><p>先维护科学知识，再生成课程候选。更新会保留原版本与来源，所有新候选都需要审核。</p></div><div className="settings-actions"><button onClick={() => { setMode("maintenance"); setCandidate(undefined); }}><History size={14} /> 知识库与维护</button><button onClick={() => begin("create")}><FilePlus2 size={14} /> 从模板新建</button><button onClick={() => { setMode("import"); setCandidate(undefined); }}><Inbox size={14} /> 添加知识</button></div></header>
    {mode === "template" && <section className="studio-editor"><h3>{operation === "create" ? "从模板新建知识" : operation === "revise" ? "创建新修订" : operation === "duplicate" ? "复制为独立知识" : operation === "supersede" ? "用新版本取代当前版本" : operation === "deprecate" ? "废弃知识版本" : "恢复为待审核版本"}</h3>{target && <p>基于 {target.knowledgeUnitId} · r{target.revision} · {target.hash}</p>}{operation === "create" && <label>知识模板<select value={draft.knowledgeType} onChange={(event) => setDraft(createKnowledgeTemplate(event.target.value as KnowledgeType, { id: draft.id, title: draft.title, now: now() }))}>{KNOWLEDGE_TYPES.map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}</select></label>}{!["deprecate", "restore"].includes(operation) && <><ScienceFields unit={draft} onChange={(unit) => { setDraft(unit); setCandidate(undefined); }} /><details><summary>关联已登记的证据主张 · {draft.evidenceLinks.length}</summary><p>关联保存准确的主张版本。来源信息通过核验，并不意味着主张已被科学审核。</p><div className="m020-evidence-list">{workspace.claims.map((claim) => <label key={`${claim.id}:${claim.revision}`}><input type="checkbox" checked={draft.evidenceLinks.some((link) => link.claimId === claim.id && link.revision === claim.revision)} onChange={(event) => setDraft((current) => ({ ...current, evidenceLinks: event.target.checked ? [...current.evidenceLinks, { claimId: claim.id, revision: claim.revision, hash: claim.hash, supportMode: "curriculum_synthesis" }] : current.evidenceLinks.filter((link) => !(link.claimId === claim.id && link.revision === claim.revision)) }))} /><span>{claim.statement}<small>{claim.id} · r{claim.revision} · {claim.verificationStatus === "verified" ? "已有主张审核记录" : "待主张审核"}</small></span></label>)}</div>{draft.evidenceLinks.map((link) => <label key={`${link.claimId}:${link.revision}`}>{link.claimId} 的支持关系<select value={link.supportMode} onChange={(event) => setDraft((current) => ({ ...current, evidenceLinks: current.evidenceLinks.map((item) => item.claimId === link.claimId && item.revision === link.revision ? { ...item, supportMode: event.target.value as typeof link.supportMode } : item) }))}><option value="direct">直接支持</option><option value="methodology">方法学支持</option><option value="curriculum_synthesis">课程综合</option><option value="supplemental">补充背景</option></select></label>)}</details></>}
      <label>变更理由<textarea rows={3} value={reason} onChange={(event) => { setReason(event.target.value); setCandidate(undefined); }} placeholder="说明改变了什么、依据是什么，以及尚待审核的部分。" /></label><div className="settings-actions"><button className="primary" disabled={reason.trim().length < 4 || (!["deprecate", "restore"].includes(operation) && !draft.title.trim())} onClick={makeCandidate}>预览差异与影响</button><button onClick={() => { setMode("maintenance"); setCandidate(undefined); }}>取消</button></div>
    </section>}
    {mode === "import" && <section className="studio-editor"><h3>添加知识</h3><p>粘贴材料后先预览。DOI、PMID 和来源信息只保存识别线索，不会自动获取全文或核验科学主张。</p><div className="form-grid three"><label>输入格式<select value={format} onChange={(event) => { setFormat(event.target.value as typeof format); setImportPreview(undefined); }}>{formats.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>知识类型<select value={importType} onChange={(event) => { setImportType(event.target.value as KnowledgeType); setImportPreview(undefined); }}>{KNOWLEDGE_TYPES.map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}</select></label><label>内容来源<select value={origin} onChange={(event) => { setOrigin(event.target.value as typeof origin); setImportPreview(undefined); }}><option value="user">本人整理</option><option value="ai_generated">AI 生成或实质改写</option></select></label><label>标题（可选）<input value={importTitle} onChange={(event) => { setImportTitle(event.target.value); setImportPreview(undefined); }} /></label><label>加入或更新<select value={importTarget} onChange={(event) => { setImportTarget(event.target.value); setChangeType(event.target.value ? "UPDATE" : "NEW"); setImportPreview(undefined); }}><option value="">建立新知识</option>{heads.map((unit) => <option key={unit.id} value={unit.id}>{unit.title} · r{unit.revision}</option>)}</select></label>{importTarget && <label>变更类别<select value={changeType} onChange={(event) => { setChangeType(event.target.value as typeof changeType); setImportPreview(undefined); }}>{KNOWLEDGE_CHANGE_TYPES.filter((type) => type !== "NEW").map((type) => <option key={type} value={type}>{changeLabels[type]}</option>)}</select></label>}</div>{format === "metadata" ? <div className="form-grid two">{([["title", "来源标题"], ["doi", "DOI"], ["pmid", "PMID"], ["url", "来源网址"], ["version", "来源版本"]] as const).map(([key, label]) => <label key={key}>{label}<input value={metadata[key]} onChange={(event) => { setMetadata((current) => ({ ...current, [key]: event.target.value })); setImportPreview(undefined); }} /></label>)}</div> : <label>{format === "doi" ? "DOI" : format === "pmid" ? "PMID" : "粘贴材料"}<textarea rows={format === "doi" || format === "pmid" ? 2 : 8} value={importText} onChange={(event) => { setImportText(event.target.value); setImportPreview(undefined); }} /></label>}<button className="primary" disabled={format === "metadata" ? !metadata.title.trim() : !importText.trim()} onClick={inspectImport}>识别并预览候选</button>
      <details><summary>导入已有实验方案 staging</summary><p>这些包保留原始来源与待审核状态。缺少字段会明确列为复核缺口。</p><div className="m020-import-packs">{builtInProtocolImports.map((pack) => <button key={pack.id} onClick={() => guarded(() => { setImportPreview(undefined); setProtocolPreview({ fragment: adaptProtocolStaging(pack.payload, now()), title: pack.title, baseHash: knowledgeWorkspaceHash(currentState()) }); })}><strong>{pack.title}</strong><span>{pack.description}</span></button>)}</div></details>
      {importPreview && <section className="m020-preview" role="status"><h3>导入预览</h3>{importPreview.errors.length > 0 && <ul>{importPreview.errors.map((error) => <li key={error}>{error}</li>)}</ul>}{importPreview.warnings.length > 0 && <ul>{importPreview.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}{importPreview.candidate && <><p>{importPreview.candidate.title} · {changeLabels[importPreview.candidate.changeType]} · 待审核</p><RevisionDiff before={importPreview.candidate.target ? workspace.units.find((unit) => unit.id === importPreview.candidate!.target!.knowledgeUnitId && unit.revision === importPreview.candidate!.target!.revision) : undefined} after={importPreview.candidate.proposedUnit} /></>}<ImpactPanel impact={importPreview.impact} /><button className="primary" disabled={!importPreview.valid} onClick={() => guarded(() => { saveResult(commitKnowledgeImport(currentState(), importPreview), "导入候选已保存。确认变更前，现有知识和课程保持原状态。"); setImportPreview(undefined); setMode("maintenance"); setQueue("updates"); })}>保存待审核候选</button></section>}
      {protocolPreview && <section className="m020-preview"><h3>{protocolPreview.title} · 迁移预览</h3><p>{protocolPreview.fragment.units.length} 个知识版本 · {protocolPreview.fragment.sources.length} 个来源 · {protocolPreview.fragment.claims.length} 个主张 · {protocolPreview.fragment.learningBindings.length} 个课程绑定</p><ul>{[...protocolPreview.fragment.errors, ...protocolPreview.fragment.warnings].map((item, index) => <li key={index}>{item}</li>)}</ul>{protocolPreview.fragment.units.map((unit) => <details key={`${unit.id}:${unit.revision}`}><summary>{unit.title} · r{unit.revision} · 待审核</summary><p>{unit.scientificQuestion}</p><ul>{unit.reviewGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul><pre>{JSON.stringify(unit, null, 2)}</pre></details>)}<button className="primary" disabled={protocolPreview.fragment.errors.length > 0 || protocolPreview.fragment.units.length === 0} onClick={() => guarded(() => { if (protocolPreview.baseHash !== knowledgeWorkspaceHash(currentState())) throw new Error("知识库已变化，请重新预览这个来源包。"); saveResult(mergeKnowledgeMigration(currentState(), protocolPreview.fragment), "现有实验方案已迁移为待审核知识，原始材料及版本绑定已保留。"); setProtocolPreview(undefined); setMode("maintenance"); setQueue("review"); })}>保存迁移记录与待审核知识</button></section>}
    </section>}
    {candidate && <section className="studio-editor m020-preview"><h3>确认变更：{candidate.title}</h3><p>{changeLabels[candidate.changeType]} · {candidate.reason}</p><RevisionDiff before={candidateBase} after={candidate.proposedUnit} />{impact ? <ImpactPanel impact={impact} /> : <p role="alert">无法解析影响，暂不能确认。</p>}<label>本次变更操作者<input value={reviewer} onChange={(event) => setReviewer(event.target.value)} placeholder="记录谁确认这次维护操作，不作为科学审核签名" /></label><p>确认会记录变更，并让受影响内容进入复核流程。新版本仍待科学审核，不能用于标准化能力评分。</p><div className="settings-actions"><button className="primary" disabled={!reviewer.trim() || !impact?.valid} onClick={confirmCandidate}>确认变更并送审</button><button onClick={() => setCandidate(undefined)}>关闭预览</button></div></section>}
    {mode === "maintenance" && <><nav className="m020-queues" aria-label="知识维护分类">{([["all", "全部知识"], ["updates", "更新候选"], ["review", "需要复核"], ["superseded", "已取代 / 废弃"], ["emerging", "新兴证据"], ["conflicts", "冲突"]] as const).map(([id, label]) => <button key={id} className={queue === id ? "active" : ""} aria-pressed={queue === id} onClick={() => setQueue(id)}>{label}</button>)}</nav>
      {queue === "conflicts" ? <section className="studio-editor"><h3>候选版本与个人覆盖冲突</h3>{workspace.conflicts.length + overlayConflicts.length === 0 && <p>暂无冲突。</p>}{workspace.conflicts.map((item) => <article className="m020-conflict" key={item.id}><strong>{item.targetId}</strong><p>{item.reason}</p><small>候选 {item.candidateId} · 预期 {item.expectedHash} · 实际 {item.actualHash}</small></article>)}{overlayConflicts.map((item) => <article className="m020-conflict" key={item.id}><strong>个人覆盖：{item.contentId}</strong><p>{item.detail}</p><small>{item.status === "open" ? "待处理" : "已有处理记录"}</small></article>)}</section> : <>
      {(queue === "updates" || queue === "all") && <section className="studio-editor"><h3>待确认的知识变更 · {openCandidates.length}</h3>{!openCandidates.length && <p>暂无新候选。可添加新来源或修订已有知识。</p>}{openCandidates.map((item) => <article className="m020-candidate-row" key={item.id}><div><strong>{item.title}</strong><small>{changeLabels[item.changeType]} · {item.contentOrigin === "ai_generated" ? "AI 生成 · 待审核" : "待审核"} · {item.reason}</small></div><button onClick={() => setCandidate(item)}>查看差异与影响</button></article>)}</section>}
      {queue === "review" && <section className="studio-editor"><h3>受影响的学习内容 · {workspace.holds.length}</h3>{!workspace.holds.length && <p>暂无已登记的下游复核任务。</p>}{workspace.holds.map((hold) => <article key={hold.id}><strong>{workspace.learningBindings.find((item) => item.assetId === hold.assetId)?.title ?? hold.assetId}</strong><p>{hold.reason}</p><small>{hold.assetId} · r{hold.assetRevision} · {hold.assetHash} · {hold.createdAt}</small></article>)}</section>}
      <label className="m020-search"><Search size={15} /> 搜索知识<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="标题、别名或 ID" /></label><div className="m020-browser"><aside className="m020-unit-list" aria-label="知识条目">{filtered.length ? filtered.map((unit) => <button key={`${unit.id}:${unit.revision}`} className={selectedId === unit.id && selected?.revision === unit.revision ? "selected" : ""} onClick={() => selectUnit(unit)}><strong>{unit.title}</strong><small>{typeLabels[unit.knowledgeType]} · r{unit.revision} · {statusLabels[effectiveKnowledgeStatus(workspace, unit)]}</small></button>) : <p>没有符合条件的知识。</p>}</aside><section className="m020-unit-detail">{selected ? <><header><h3>{selected.title}</h3><p>{typeLabels[selected.knowledgeType]} · {statusLabels[effectiveKnowledgeStatus(workspace, selected)]} · {selected.verificationStatus === "verified" ? "保留原审核范围" : "待科学审核"}</p></header><div className="settings-actions"><button onClick={() => begin("revise", selected)}>修订</button><button onClick={() => begin("duplicate", selected)}><Copy size={13} /> 复制</button><button onClick={() => begin("supersede", selected)}>取代</button><button onClick={() => begin("deprecate", selected)}>废弃</button><button onClick={() => begin("restore", selected)}>恢复为待审核</button></div><dl className="m020-metadata"><dt>准确版本</dt><dd>{selected.id} · r{selected.revision}<code>{selected.hash}</code></dd><dt>变更原因</dt><dd>{selected.provenance.changeReason}</dd><dt>来源与原版本</dt><dd>{selected.contentOrigin} · {selected.provenance.originalId ?? "本地创建"}{selected.provenance.originalRevision ? ` · 原 r${selected.provenance.originalRevision}` : ""}</dd><dt>审核记录</dt><dd>{selected.provenance.reviewer ?? "尚无科学审核者"} · 范围：{selected.provenance.verificationScope} · {selected.provenance.reviewedAt ?? "未审核"}</dd><dt>复核策略</dt><dd>{freshnessLabels[selected.freshnessClass]}{selected.nextReviewAt ? ` · 下次 ${selected.nextReviewAt}` : ""}</dd><dt>创建日期</dt><dd>{selected.provenance.createdAt}</dd></dl><p>{selected.scientificQuestion || "科学问题尚待补充"}</p>{selected.preciseExplanation.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{selected.reviewGaps.length > 0 && <details open><summary>复核缺口 · {selected.reviewGaps.length}</summary><ul>{selected.reviewGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul></details>}<details><summary>证据链 · {selected.evidenceLinks.length} 个主张</summary>{selected.evidenceLinks.map((link) => { const claim = workspace.claims.find((item) => item.id === link.claimId && item.revision === link.revision && item.hash === link.hash); return <article key={`${link.claimId}:${link.revision}`}><strong>{claim?.statement ?? "主张尚未解析"}</strong><small>{link.claimId} · r{link.revision} · {link.supportMode} · {link.hash}</small><ul>{claim?.sourceBindings.map((source) => <li key={`${source.sourceId}:${source.revision}`}>{workspace.sources.find((item) => item.id === source.sourceId && item.revision === source.revision)?.title ?? source.sourceId} · r{source.revision} · {source.hash}</li>)}</ul></article>; })}</details><details><summary>完整不可变版本快照</summary><pre>{JSON.stringify(selected, null, 2)}</pre></details>
      <details><summary>历史版本与差异</summary><div className="form-grid two"><label>查看版本<select value={selected.revision} onChange={(event) => { setRevision(Number(event.target.value)); setProjectionPreview([]); }}>{history.map((unit) => <option key={unit.revision} value={unit.revision}>r{unit.revision} · {unit.provenance.createdAt}</option>)}</select></label>{history.length > 1 && <label>对比版本<select value={comparison?.revision ?? ""} onChange={(event) => setCompareRevision(Number(event.target.value))}>{history.filter((unit) => unit.revision !== selected.revision).map((unit) => <option key={unit.revision} value={unit.revision}>r{unit.revision}</option>)}</select></label>}</div>{comparison ? <RevisionDiff before={comparison} after={selected} /> : <p>当前只有一个版本。</p>}<ul>{workspace.ledger.filter((entry) => entry.target.knowledgeUnitId === selected.id).map((entry) => <li key={entry.id}>{entry.at} · {entry.reviewer} · {statusLabels[entry.status]} · {entry.reason}{entry.replacement ? ` → ${entry.replacement.knowledgeUnitId} r${entry.replacement.revision}` : ""}</li>)}</ul></details>
      <details><summary>生成候选学习资产</summary><p>生成内容绑定当前选中的知识版本。没有可推导的科学内容和答案键会保留为待补充项。</p><div className="m020-projection-types">{KNOWLEDGE_PROJECTION_TYPES.map((type) => <label key={type}><input type="checkbox" checked={projectionTypes.includes(type)} onChange={(event) => setProjectionTypes((current) => event.target.checked ? [...current, type] : current.filter((item) => item !== type))} />{projectionLabels[type]}</label>)}</div><button disabled={!projectionTypes.length || ["SUPERSEDED", "DEPRECATED"].includes(effectiveKnowledgeStatus(workspace, selected))} onClick={() => guarded(() => { setProjectionPreview(generateKnowledgeProjections(currentState(), binding(selected), projectionTypes, now())); setProjectionBase(knowledgeWorkspaceHash(currentState())); })}><Sparkles size={14} /> 预览学习候选</button></details>
      {projectionPreview.length > 0 && <section className="m020-preview"><h3>学习候选预览 · 不进入 Today / Review / 能力评分</h3><p>原课程保持不变。每份候选都保留精确的知识版本与审核缺口。</p>{projectionPreview.map((projection) => { const previous = workspace.projections.filter((item) => item.projectionType === projection.projectionType && item.knowledgeUnitIds.includes(selected.id)).at(-1); return <details key={projection.id}><summary>{projectionLabels[projection.projectionType]} · 待审核</summary><p>{projection.title}</p><small>{projection.knowledgeRevisionBindings.map((item) => `${item.knowledgeUnitId} · r${item.revision} · ${item.hash}`).join("\n")}</small><div className="m020-diff-pair"><div><strong>已有候选</strong><pre>{previous ? previous.body.join("\n") : "尚无候选"}</pre></div><div><strong>本次候选</strong><pre>{projection.body.join("\n")}</pre></div></div><ul>{projection.reviewGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul></details>; })}<details><summary>关联学习内容与后续复核范围</summary><ul>{workspace.learningBindings.filter((item) => item.knowledgeUnitIds.includes(selected.id)).map((item) => <li key={`${item.assetId}:${item.assetRevision}`}>{item.title} · {item.kind} · r{item.assetRevision}</li>)}</ul></details><button className="primary" onClick={() => guarded(() => { if (projectionBase !== knowledgeWorkspaceHash(currentState())) throw new Error("知识库已变化，请重新生成预览。"); saveResult(appendKnowledgeProjections(currentState(), projectionPreview), "学习候选已保存为待审核，未替换任何正式课程。"); setProjectionPreview([]); })}>保存待审核学习候选</button></section>}
      <details><summary>已保存的学习候选 · {workspace.projections.filter((item) => item.knowledgeUnitIds.includes(selected.id)).length}</summary>{workspace.projections.filter((item) => item.knowledgeUnitIds.includes(selected.id)).map((item) => <article key={`${item.id}:${item.revision}`}><h4>{projectionLabels[item.projectionType]} · r{item.revision} · 待审核</h4><small>{item.createdAt} · {item.hash}</small><ul>{item.knowledgeRevisionBindings.map((ref) => <li key={`${ref.knowledgeUnitId}:${ref.revision}`}>{ref.knowledgeUnitId} · 知识 r{ref.revision} · {ref.hash}</li>)}</ul>{item.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<ul>{item.reviewGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul></article>)}</details>
      <details><summary>本知识的学习资产版本绑定</summary>{workspace.learningBindings.filter((item) => item.knowledgeUnitIds.includes(selected.id)).map((item) => <article key={`${item.assetId}:${item.assetRevision}`}><strong>{item.title}</strong><small>{item.assetId} · r{item.assetRevision} · {item.assetHash}</small><ul>{item.knowledgeRevisionBindings.map((ref) => <li key={`${ref.knowledgeUnitId}:${ref.revision}`}>{ref.knowledgeUnitId} · r{ref.revision} · {ref.hash}</li>)}</ul></article>)}</details>
      </> : <div className="empty-state"><ArrowLeft size={18} /><p>选择一条知识，查看来源、历史版本及其学习资产。</p></div>}</section></div></>}
    </>}
  </section>;
}
