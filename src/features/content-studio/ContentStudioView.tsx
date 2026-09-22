import { useMemo, useState } from "react";
import { Archive, BookOpenCheck, Copy, Download, FilePlus2, FileWarning, History, Inbox, Library, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { AiContentExchangePanel } from "./AiContentExchangePanel";
import { KnowledgeMaintenancePanel } from "./KnowledgeMaintenancePanel";
import type { ContentKind, ContentLifecycle, ContentPatchPreview, PersonalContentEntry, ScientificRisk } from "../../domain/contentStudio";
import type { ContentRevisionRecord } from "../../domain/contentStudio";
import { buildBaseContentInventory } from "../../services/contentInventory";
import {
  KIND_TEMPLATES,
  buildReviewPack,
  detectBaseUpdateConflicts,
  diffPayloads,
  parsePatchPackJson,
  resolveEffectiveContent,
  reviewPackFileEntries,
  validatePersonalContentDetailed,
} from "../../services/contentStudio";
import { sha256 } from "../../services/contentStudio";
import { validateExportDestination } from "../../services/safePaths";
import { exportFiles } from "../../services/desktop";
import { parseReviewFeedback, type ReviewPatchCandidate } from "../../services/obsidianPublish";
import { useAppStore } from "../../state/store";

type Tab = "library" | "knowledge" | "ai" | "drafts" | "review" | "outbox" | "history" | "conflicts";
const tabs: Array<{ id: Tab; label: string; icon: typeof Library }> = [
  { id: "library", label: "内容库", icon: Library }, { id: "knowledge", label: "知识维护", icon: BookOpenCheck }, { id: "ai", label: "外部 AI 协作", icon: Sparkles }, { id: "drafts", label: "草稿", icon: FilePlus2 },
  { id: "review", label: "待审核", icon: BookOpenCheck }, { id: "outbox", label: "发布箱", icon: Inbox },
  { id: "history", label: "版本历史", icon: History }, { id: "conflicts", label: "冲突", icon: ShieldAlert },
];
const kindLabels: Record<ContentKind,string> = { "evidence-source":"证据来源", "evidence-claim":"证据主张", method:"方法", pattern:"论文模式", "judgment-card":"判断卡", "audit-case":"审稿案例", "problem-card":"问题卡", "learning-unit":"学习单元" };
const lifecycleLabels: Record<ContentLifecycle,string> = { draft:"草稿", pending_review:"待审核", active:"已启用", archived:"已归档", deprecated:"已弃用", superseded:"已取代" };

const jsonText = (value: unknown): string => JSON.stringify(value, null, 2);

function ValidationPanel({ entry, inventory, personal }: { entry: PersonalContentEntry; inventory: ReturnType<typeof buildBaseContentInventory>; personal: PersonalContentEntry[] }) {
  const report = useMemo(() => validatePersonalContentDetailed(entry, { inventory, personal }), [entry, inventory, personal]);
  return <div className="studio-validation">
    <h3>确定性校验结果</h3>
    <ul>
      {report.errors.map((error) => <li key={error} className="changed">错误：{error}</li>)}
      {report.warnings.map((warning) => <li key={warning}>提醒：{warning}</li>)}
      {report.evidenceGaps.map((gap) => <li key={gap.dependencyKey}>证据缺口:{gap.dependencyKey}——{gap.reason}</li>)}
      {report.dependencyImpact.map((impact) => <li key={impact.key}>依赖影响：{impact.title}（{impact.relation}）</li>)}
      {!report.errors.length && !report.warnings.length && !report.evidenceGaps.length && !report.dependencyImpact.length && <li>未发现问题。</li>}
    </ul>
    <small>{report.entersLearning ? "该项当前进入学习系统。" : "该项当前不进入学习系统。"} 状态：{lifecycleLabels[report.lifecycle]} · 核验：待核验（私人启用不会改变核验状态）。</small>
  </div>;
}

function PersonalDraftEditor({ entry, inventory, personal }: { entry: PersonalContentEntry; inventory: ReturnType<typeof buildBaseContentInventory>; personal: PersonalContentEntry[] }) {
  const updateDraft = useAppStore((state) => state.updatePersonalDraft);
  const notify = useAppStore((state) => state.notify);
  const [title,setTitle] = useState(entry.title);
  const [risk,setRisk] = useState<ScientificRisk>(entry.risk);
  const [payloadText,setPayloadText] = useState(jsonText(entry.payload));
  const [dependencyText,setDependencyText] = useState(entry.dependencyKeys.join(", "));
  const parsed = (() => { try { const value = JSON.parse(payloadText); return typeof value === "object" && value !== null && !Array.isArray(value) ? { ok: true as const, value } : { ok: false as const }; } catch { return { ok: false as const }; } })();
  const save = () => {
    try {
      if (!parsed.ok) throw new Error("载荷必须是 JSON 对象");
      const dependencyKeys = dependencyText.split(/[,\s]+/).map((key) => key.trim()).filter(Boolean);
      updateDraft(entry.id, { title: title.trim(), risk, payload: parsed.value, dependencyKeys });
      notify("草稿已保存；核验状态保持待核验。","success");
    } catch (error) { notify(`保存失败：${String(error)}`,"error"); }
  };
  return <section className="studio-editor">
    <h2>编辑：{entry.title}</h2>
    <div className="form-grid three">
      <label>标题<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label>科研风险<select value={risk} onChange={(event) => setRisk(event.target.value as ScientificRisk)}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label>
      <label>依赖键（逗号分隔）<input value={dependencyText} onChange={(event) => setDependencyText(event.target.value)} placeholder="evidence-source:xxx" /></label>
    </div>
    <label className="studio-payload">载荷 JSON<textarea rows={10} value={payloadText} onChange={(event) => setPayloadText(event.target.value)} spellCheck={false} /></label>
    {!parsed.ok && <small>载荷不是有效的 JSON 对象，保存前请修正。</small>}
    <div className="settings-actions">
      <button className="primary" disabled={!parsed.ok || !title.trim()} onClick={save}>保存修改</button>
      <span>内置内容不可编辑；个人修订以覆盖记录保存，旧版本保留在版本历史中。</span>
    </div>
    <ValidationPanel entry={{ ...entry, title: title.trim() || entry.title, risk, payload: parsed.ok ? parsed.value : entry.payload }} inventory={inventory} personal={personal} />
  </section>;
}

function PatchImportPanel({ personal }: { personal: PersonalContentEntry[] }) {
  const previewAction = useAppStore((state) => state.previewPersonalPatch);
  const applyPatch = useAppStore((state) => state.applyContentPatch);
  const notify = useAppStore((state) => state.notify);
  const [patchText,setPatchText] = useState("");
  const [preview,setPreview] = useState<{ found: boolean; stale: boolean; valid?: boolean; data?: ContentPatchPreview; targetTitle?: string; parseErrors?: string[] } | null>(null);
  const runPreview = () => {
    const parsed = parsePatchPackJson(patchText);
    if (!parsed.ok || !parsed.patch) { setPreview({ found: false, stale: false, parseErrors: parsed.errors }); return; }
    const result = previewAction(parsed.patch);
    const target = personal.find((entry) => entry.id === parsed.patch!.targetId);
    setPreview({ found: result.found, stale: result.stale, valid: result.preview?.valid, data: result.preview, targetTitle: target?.title });
  };
  const apply = () => {
    const parsed = parsePatchPackJson(patchText);
    if (!parsed.ok || !parsed.patch) return;
    try {
      const applied = applyPatch(parsed.patch);
      notify(`修订包已应用：${applied.title} → r${applied.revision}；旧版本已保留。`,"success");
      setPatchText(""); setPreview(null);
    } catch (error) { notify(`修订包未应用，内容保持不变：${String(error)}`,"error"); }
  };
  return <section className="studio-editor">
    <h2>修订包导入（全部或放弃）</h2>
    <label className="studio-payload">修订包 JSON<textarea rows={8} value={patchText} onChange={(event) => setPatchText(event.target.value)} placeholder='{"patchSchemaVersion":1,…}' spellCheck={false} /></label>
    <div className="settings-actions"><button disabled={!patchText.trim()} onClick={runPreview}>解析并预览</button><span>过期基线会记为冲突且零写入；应用是原子操作。</span></div>
    {preview?.parseErrors && <ul className="studio-diff">{preview.parseErrors.map((error) => <li key={error} className="changed">解析失败：{error}</li>)}</ul>}
    {preview && !preview.parseErrors && !preview.found && <ul className="studio-diff"><li className="changed">修订目标不存在或不是个人内容；内置对象不可通过修订包修改。</li></ul>}
    {preview?.found && preview.data && <div>
      <p><strong>{preview.targetTitle}</strong> · r{preview.data.currentRevision} → r{preview.data.nextRevision}{preview.stale ? " · 基线已过期（已记录冲突）" : ""}{!preview.data.valid && !preview.stale ? " · 校验未通过" : ""}</p>
      <ul className="studio-diff">
        {preview.data.fieldDiffs.map((diff) => <li key={diff.field} className="changed"><code>{diff.field}</code>：{jsonText(diff.before)} → {jsonText(diff.after)}</li>)}
        {preview.data.fieldDiffs.length === 0 && <li>没有字段变化。</li>}
      </ul>
      <small>影响依赖：{preview.data.affectedDependencyKeys.join("、") || "无"}</small>
      <div className="settings-actions"><button className="primary" disabled={!preview.valid || preview.stale} onClick={apply}>应用修订包（全部或放弃）</button></div>
    </div>}
  </section>;
}

function HistoryCompare({ history, personal }: { history: ContentRevisionRecord[]; personal: PersonalContentEntry[] }) {
  const rollback = useAppStore((state) => state.rollbackContent);
  const notify = useAppStore((state) => state.notify);
  const [selectedId,setSelectedId] = useState<string>(history[0]?.id ?? "");
  const [reason,setReason] = useState("恢复到历史版本");
  const selected = history.find((item) => item.id === selectedId);
  const current = selected ? personal.find((entry) => entry.id === selected.contentId) : undefined;
  const diffs = selected ? diffPayloads(selected.payload, current?.payload ?? selected.payload) : [];
  return <section className="studio-editor">
    <h2>版本比较与恢复</h2>
    <div className="form-grid two">
      <label>历史快照<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{history.map((item) => <option key={item.id} value={item.id}>{item.contentId} · r{item.revision} · {item.reason}</option>)}</select></label>
      <label>恢复原因<input value={reason} onChange={(event) => setReason(event.target.value)} /></label>
    </div>
    {selected && <div>
      <ul className="studio-diff">
        {diffs.map((diff) => <li key={diff.field} className="changed"><code>{diff.field}</code>：r{selected.revision} 的 {jsonText(diff.before)} → 当前的 {jsonText(diff.after)}</li>)}
        {diffs.length === 0 && <li>该快照与当前内容一致。</li>}
      </ul>
      <div className="settings-actions">
        <button disabled={!current || diffs.length === 0} onClick={() => {
          try { const restored = rollback(selected.contentId, selected.revision, reason); notify(`已恢复 ${restored.title} 为新版本 r${restored.revision}；状态回到待审核且不进入学习。`,"success"); }
          catch (error) { notify(`恢复失败：${String(error)}`,"error"); }
        }}><RotateCcw size={13}/> 恢复此版本（生成新版本，不覆盖历史）</button>
        <span>恢复后内容回到待审核；所有历史快照保持可解析。</span>
      </div>
    </div>}
  </section>;
}

const actionLabels: Record<string, string> = { create: "新建", update: "更新", unchanged: "无变化（零写入）", conflict: "冲突（拒绝写入）" };

function ObsidianConnectionCard() {
  const connection = useAppStore((state) => state.obsidianConnection);
  const saveConnection = useAppStore((state) => state.saveObsidianConnection);
  const notify = useAppStore((state) => state.notify);
  const [vaultRoot,setVaultRoot] = useState(connection?.vaultRoot ?? "");
  const [subfolder,setSubfolder] = useState(connection?.dedicatedSubfolder ?? "ResearchOS");
  const [busy,setBusy] = useState(false);
  const pick = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const dir = await open({ directory: true, multiple: false, title: "选择 Obsidian 库根目录（只读验证，不写文件）" });
      if (typeof dir === "string" && dir) setVaultRoot(dir);
    } catch (error) { notify(String(error),"error"); }
  };
  return <section className="studio-editor">
    <h2>Obsidian 连接（专用子文件夹 · 只读验证）</h2>
    <div className="form-grid three">
      <label>库根目录<input value={vaultRoot} onChange={(event) => setVaultRoot(event.target.value)} placeholder="D:\\MyVault" /></label>
      <label>专用子文件夹<input value={subfolder} onChange={(event) => setSubfolder(event.target.value)} placeholder="ResearchOS" /></label>
      <label>&nbsp;</label>
    </div>
    <div className="settings-actions">
      <button onClick={pick}>选择目录…</button>
      <button className="primary" disabled={!vaultRoot.trim() || busy} onClick={async () => {
        setBusy(true);
        try { await saveConnection(vaultRoot, subfolder); notify("连接已验证；本次只读取目录信息，未创建或修改任何文件。","success"); }
        catch (error) { notify(`验证失败，未写入任何文件：${String(error)}`,"error"); }
        finally { setBusy(false); }
      }}>验证并保存（只读）</button>
    </div>
    {connection && <small>已验证：{connection.validatedResolvedDir ?? "?"} · ResearchOS 绝不读写该文件夹之外的内容，也不访问 .obsidian。</small>}
  </section>;
}

function OutboxPanel({ effective }: { effective: ReturnType<typeof buildBaseContentInventory> }) {
  const batches = useAppStore((state) => state.obsidianPublishBatches);
  const connection = useAppStore((state) => state.obsidianConnection);
  const createBatch = useAppStore((state) => state.createPublishBatch);
  const previewBatch = useAppStore((state) => state.previewPublishBatch);
  const applyBatch = useAppStore((state) => state.confirmAndApplyPublishBatch);
  const cancelBatch = useAppStore((state) => state.cancelPublishBatch);
  const notify = useAppStore((state) => state.notify);
  const [selected,setSelected] = useState<ReadonlySet<string>>(new Set());
  const [query,setQuery] = useState("");
  const [exactConfirmed,setExactConfirmed] = useState(false);
  const [secondConfirmed,setSecondConfirmed] = useState(false);
  const [busy,setBusy] = useState(false);
  const filtered = useMemo(() => effective.filter((item) => !query.trim() || `${item.title} ${item.id}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,50), [effective,query]);
  const activeBatch = batches.find((batch) => batch.status === "previewed" || batch.status === "conflict");
  const toggle = (key: string) => setSelected((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  const runPreview = async () => {
    setBusy(true); setExactConfirmed(false); setSecondConfirmed(false);
    try {
      const batchId = createBatch([...selected]);
      await previewBatch(batchId);
      notify("预览完成：未写入任何文件。请核对精确路径后确认。","info");
    } catch (error) { notify(`预览失败，未写入任何文件：${String(error)}`,"error"); }
    finally { setBusy(false); }
  };
  return <>
    {!connection && <div className="setting-note"><ShieldAlert size={15}/><p>尚未连接。连接只做只读验证；不会创建文件夹、不会写入文件、不会触发同步。</p></div>}
    <ObsidianConnectionCard />
    <section className="studio-editor">
      <h2>选择要发布的永久笔记</h2>
      <div className="form-grid two studio-filters"><label>搜索<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="标题或 ID" /></label><label>&nbsp;</label></div>
      <div className="studio-list">{filtered.map((item) => <article key={item.key}>
        <label className="studio-select"><input type="checkbox" checked={selected.has(item.key)} onChange={() => toggle(item.key)} aria-label={`发布 ${item.title}`} /></label>
        <div><strong>{item.title}</strong><small>{kindLabels[item.kind]} · r{item.revision} · {item.verificationStatus === "verified" ? "已核验" : "待核验（笔记中会如实显示）"}</small></div>
      </article>)}</div>
      <div className="settings-actions">
        <button className="primary" disabled={selected.size === 0 || busy || !connection} onClick={() => void runPreview()}>创建批次并预览（{selected.size} 项 · 不写文件）</button>
        <span>默认每批最多 20 条永久笔记；超出需要第二次明确确认。</span>
      </div>
    </section>
    {activeBatch && <section className="studio-editor">
      <h2>发布预览 · {activeBatch.id}（{activeBatch.status === "conflict" ? "存在冲突" : "待确认"}）</h2>
      <div className="studio-list">{activeBatch.items.map((item) => <article key={item.relativePath}>
        <div><strong>{item.title}</strong><small>{item.relativePath} · r{item.revision} · {actionLabels[item.action ?? "create"]}{item.detail ? ` · ${item.detail}` : ""}</small></div>
        <span>{item.action === "conflict" ? "⛔" : item.action === "unchanged" ? "＝" : "✎"}</span>
      </article>)}</div>
      {activeBatch.requiresSecondConfirmation && <p><FileWarning size={13}/> 本批超过 20 条笔记：请勾选第二次确认。</p>}
      {activeBatch.status === "conflict" && <p>存在冲突项：整批保持零写入；请先解决冲突后重新预览。</p>}
      <div className="settings-actions">
        <label className="studio-select"><input type="checkbox" checked={exactConfirmed} disabled={activeBatch.status === "conflict"} onChange={(event) => setExactConfirmed(event.target.checked)} /> 我已逐条核对以上精确路径</label>
        {activeBatch.requiresSecondConfirmation && <label className="studio-select"><input type="checkbox" checked={secondConfirmed} disabled={activeBatch.status === "conflict"} onChange={(event) => setSecondConfirmed(event.target.checked)} /> 第二次确认（超过 20 条）</label>}
        <button className="primary" disabled={!exactConfirmed || activeBatch.status === "conflict" || busy || (activeBatch.requiresSecondConfirmation && !secondConfirmed)} onClick={async () => {
          setBusy(true);
          try { const written = await applyBatch(activeBatch.id, secondConfirmed); notify(written.length ? `已原子写入 ${written.length} 个文件；用户手写内容保留在受管块之外。` : "没有需要写入的变化（全部无变化）。","success"); setSelected(new Set()); }
          catch (error) { notify(`发布失败，整批未写入：${String(error)}`,"error"); }
          finally { setBusy(false); }
        }}>确认并原子写入</button>
        <button onClick={() => cancelBatch(activeBatch.id)}>取消批次</button>
      </div>
    </section>}
    {batches.length > 0 && <section>
      <div className="section-title"><h2>历史批次</h2><span>{batches.length} 个</span></div>
      <div className="studio-list">{batches.slice(0,10).map((batch) => <article key={batch.id}><div><strong>{batch.id}</strong><small>{batch.batchType === "review_round_trip" ? "审核往返" : "发布"} · {batch.status} · {batch.items.length} 项{batch.appliedAt ? ` · 应用于 ${batch.appliedAt}` : ""}</small></div></article>)}</div>
    </section>}
  </>;
}

function ReviewRoundTripPanel({ effective }: { effective: ReturnType<typeof buildBaseContentInventory> }) {
  const exportRoundTrip = useAppStore((state) => state.exportReviewRoundTrip);
  const checkReview = useAppStore((state) => state.checkReviewRoundTrip);
  const applyPatch = useAppStore((state) => state.applyContentPatch);
  const applyOverlayPatch = useAppStore((state) => state.applyOverlayPatch);
  const batches = useAppStore((state) => state.obsidianPublishBatches);
  const connection = useAppStore((state) => state.obsidianConnection);
  const notify = useAppStore((state) => state.notify);
  const [selected,setSelected] = useState<ReadonlySet<string>>(new Set());
  const [exactConfirmed,setExactConfirmed] = useState(false);
  const [busy,setBusy] = useState(false);
  const [result,setResult] = useState<{ batchId: string; feedback: ReturnType<typeof parseReviewFeedback>; candidates: ReviewPatchCandidate[]; appliedIds: ReadonlySet<string> } | null>(null);
  const reviewBatches = batches.filter((batch) => batch.batchType === "review_round_trip" && batch.reviewManifest);
  const latestBatchId = reviewBatches[0]?.id;
  const toggle = (key: string) => setSelected((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  return <section className="studio-editor">
    <h2>可选的 Obsidian 审核往返（有限批次 · 无监听 · 无自动拉取）</h2>
    <div className="studio-list">{effective.slice(0,30).map((item) => <article key={item.key}>
      <label className="studio-select"><input type="checkbox" checked={selected.has(item.key)} onChange={() => toggle(item.key)} aria-label={`送审 ${item.title}`} /></label>
      <div><strong>{item.title}</strong><small>{item.id} · r{item.revision}</small></div>
    </article>)}</div>
    <div className="settings-actions">
      <label className="studio-select"><input type="checkbox" checked={exactConfirmed} onChange={(event) => setExactConfirmed(event.target.checked)} /> 我确认只写入 _Review/批次ID/ 下的清单与所选笔记</label>
      <button className="primary" disabled={!connection || selected.size === 0 || !exactConfirmed || busy} onClick={async () => {
        setBusy(true);
        try { const id = await exportRoundTrip([...selected]); notify(`审核批次 ${id} 已导出；这是唯一的自动外发动作之外的手动确认写入。`,"success"); }
        catch (error) { notify(`导出失败，未写入：${String(error)}`,"error"); }
        finally { setBusy(false); }
      }}>导出审核批次（{selected.size} 项）</button>
      <button disabled={!latestBatchId || busy} onClick={async () => {
        setBusy(true);
        try { const checked = await checkReview(latestBatchId!); setResult({ batchId: latestBatchId!, feedback: checked.feedback, candidates: checked.candidates, appliedIds: new Set() }); notify("已按清单逐文件读取审核意见；未修改任何文件。","info"); }
        catch (error) { notify(`读取失败：${String(error)}`,"error"); }
        finally { setBusy(false); }
      }}>检查 Obsidian 审核意见{latestBatchId ? `（${latestBatchId}）` : ""}</button>
    </div>
    <small>读取严格限定在已导出清单中的路径；意见只会变成待核验的修订候选，绝不自动合并或提升状态。</small>
    {result && <div>
      <h3>读取结果 · {result.batchId}</h3>
      <ul className="studio-diff">
        {result.feedback.map((entry) => <li key={entry.relativePath}>{entry.relativePath} · 意见 {entry.annotations.length} 条{entry.managedEdited ? " · 受管块被改动" : ""}</li>)}
        {result.feedback.length === 0 && <li>清单中没有笔记。</li>}
      </ul>
      {result.candidates.map((candidate) => <article key={candidate.patch.patchId} className="studio-candidate">
        <strong>{candidate.targetId}</strong> · {candidate.summary} · {candidate.source === "annotation" ? "来自审核意见" : "来自受管块修订"} · 候选保持待核验
        <ul className="studio-diff">{candidate.preview.fieldDiffs.map((diff) => <li key={diff.field} className="changed"><code>{diff.field}</code>：{JSON.stringify(diff.before)} → {JSON.stringify(diff.after)}</li>)}</ul>
        {!result.appliedIds.has(candidate.patch.patchId) && <button onClick={() => {
          try {
            const builtinRecord = candidate.overlayBase ? effective.find((item) => item.key === candidate.overlayBase!.key) : undefined;
            const appliedEntry = candidate.overlayBase
              ? applyOverlayPatch(candidate.patch, builtinRecord)
              : applyPatch(candidate.patch);
            notify(`候选已应用为待审核修订 r${appliedEntry.revision}；未提升核验状态。${candidate.overlayBase ? "（内置对象已建立个人修订 overlay）" : ""}`,"success");
            setResult((current) => current ? { ...current, appliedIds: new Set([...current.appliedIds, candidate.patch.patchId]) } : current);
          } catch (error) { notify(`应用失败，内容未变化：${String(error)}`,"error"); }
        }}>{candidate.overlayBase ? "应用此候选（先建立内置对象 overlay）" : "应用此候选（生成待审核修订）"}</button>}
        {result.appliedIds.has(candidate.patch.patchId) && <span>已应用</span>}
      </article>)}
    </div>}
  </section>;
}

export function ContentStudioView() {
  const [tab,setTab] = useState<Tab>("library");
  const [knowledgeEntry,setKnowledgeEntry] = useState<{ mode: "maintenance" | "template" | "import"; sequence: number }>({ mode: "maintenance", sequence: 0 });
  const [creating,setCreating] = useState(false);
  const [title,setTitle] = useState("");
  const [kind,setKind] = useState<ContentKind>("method");
  const [risk,setRisk] = useState<ScientificRisk>("HIGH");
  const [selectedKeys,setSelectedKeys] = useState<ReadonlySet<string>>(new Set());
  const [exporting,setExporting] = useState(false);
  const [editingId,setEditingId] = useState<string>("");
  const [filterKind,setFilterKind] = useState<"all" | ContentKind>("all");
  const [query,setQuery] = useState("");
  const personal = useAppStore((state) => state.personalContent);
  const history = useAppStore((state) => state.contentRevisionHistory);
  const conflicts = useAppStore((state) => state.contentConflicts);
  const batches = useAppStore((state) => state.obsidianPublishBatches);
  const connection = useAppStore((state) => state.obsidianConnection);
  const createDraft = useAppStore((state) => state.createPersonalDraft);
  const duplicateDraft = useAppStore((state) => state.duplicatePersonalDraft);
  const ensureOverlay = useAppStore((state) => state.ensurePersonalOverlay);
  const applyOverlayPatch = useAppStore((state) => state.applyOverlayPatch);
  const setLifecycle = useAppStore((state) => state.setPersonalLifecycle);
  const notify = useAppStore((state) => state.notify);
  const base = useMemo(() => buildBaseContentInventory(), []);
  const effective = useMemo(() => resolveEffectiveContent(base,personal), [base,personal]);
  const baseUpdateConflicts = useMemo(() => detectBaseUpdateConflicts(personal, base, new Date()), [base, personal]);
  const matchesFilter = (item: PersonalContentEntry) =>
    (filterKind === "all" || item.kind === filterKind)
    && (!query.trim() || `${item.title} ${item.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  const visiblePersonal = tab === "drafts"
    ? personal.filter((item) => item.lifecycle === "draft" && matchesFilter(item))
    : tab === "review"
      ? personal.filter((item) => item.lifecycle === "pending_review" && matchesFilter(item))
      : personal;
  const editing = personal.find((item) => item.id === editingId);

  const submit = () => {
    const clean = title.trim();
    if (!clean) return;
    const id = `personal-${kind}-${Date.now().toString(36)}`;
    createDraft({ id,kind,title:clean,risk,payload:{ ...KIND_TEMPLATES[kind], id,title:clean,contentOrigin:"user",verificationStatus:"pending" } });
    setTitle(""); setCreating(false); setTab("drafts"); notify("草稿已按类型模板保存；尚未进入学习、搜索或 Obsidian。","success");
  };

  const toggleSelected = (key: string) => {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const runExport = async () => {
    if (selectedKeys.size === 0 || exporting) return;
    setExporting(true);
    try {
      const pack = buildReviewPack([...selectedKeys], effective, `review-${Date.now().toString(36)}`);
      const entries = reviewPackFileEntries(pack);
      const { open } = await import("@tauri-apps/plugin-dialog");
      const destination = await open({ directory: true, multiple: false, title: "选择审核包导出目录（请保持在 Obsidian 库之外）" });
      if (typeof destination !== "string" || !destination) return;
      validateExportDestination(destination, connection?.vaultRoot);
      const written = await exportFiles(destination, entries.map((entry) => ({ relativePath: entry.path, contents: entry.content })));
      notify(written.length ? `审核包已写入 ${written.length} 个文件：${entries.map((entry) => entry.path).join("、")}` : "审核包与目标目录内容一致，没有写入新文件。","success");
    } catch (error) {
      notify(`导出已取消，未写入任何文件：${String(error)}`,"error");
    } finally {
      setExporting(false);
    }
  };

  return <div className="page content-studio-page">
    <header className="page-header"><div><span className="eyebrow">个人内容维护</span><h1>内容工作台</h1><p>ResearchOS 保存主版本；只有明确确认的批次才会写入 Obsidian。</p></div><div className="settings-actions"><button onClick={() => { setTab("knowledge"); setCreating(false); setKnowledgeEntry((current) => ({ mode: "import", sequence: current.sequence + 1 })); }}><Inbox size={14}/> 添加知识</button><button onClick={() => { setTab("knowledge"); setCreating(false); setKnowledgeEntry((current) => ({ mode: "template", sequence: current.sequence + 1 })); }}><FilePlus2 size={14}/> 从模板新建知识</button><button className="primary" onClick={() => setCreating((value) => !value)}><FilePlus2 size={14}/> 新建草稿</button></div></header>
    <div className="studio-tabs" role="tablist" aria-label="内容工作台视图">{tabs.map((item) => { const Icon=item.icon; return <button key={item.id} role="tab" aria-selected={tab===item.id} className={tab===item.id?"active":""} onClick={() => setTab(item.id)}><Icon size={14}/>{item.label}</button>; })}</div>
    {creating && <section className="studio-editor"><h2>新建个人内容</h2><div className="form-grid three"><label>类型<select value={kind} onChange={(event) => setKind(event.target.value as ContentKind)}>{Object.entries(kindLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>科研风险<select value={risk} onChange={(event) => setRisk(event.target.value as ScientificRisk)}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label><label>标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="输入清晰、稳定的标题"/></label></div><div className="settings-actions"><button className="primary" disabled={!title.trim()} onClick={submit}>按类型模板保存为草稿</button><span>模板只提供结构占位；草稿默认待核验且不进入训练。</span></div></section>}
    {tab === "ai" && <AiContentExchangePanel />}
    {tab === "knowledge" && <KnowledgeMaintenancePanel key={knowledgeEntry.sequence} initialMode={knowledgeEntry.mode} />}
    {(tab === "drafts" || tab === "review") && <section>
      <div className="section-title"><h2>{tab === "drafts"?"草稿":"待审核"}</h2><span>{visiblePersonal.length} 项</span></div>
      <div className="form-grid three studio-filters">
        <label>类型筛选<select value={filterKind} onChange={(event) => setFilterKind(event.target.value as typeof filterKind)}><option value="all">全部类型</option>{Object.entries(kindLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>搜索<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="标题或 ID" /></label>
      </div>
      {visiblePersonal.length === 0 ? <div className="empty-state"><p>这里还没有符合条件的内容。</p></div> : <div className="studio-list">{visiblePersonal.map((item) => <article key={`${item.kind}:${item.id}`}>
        <div><strong>{item.title}</strong><small>{kindLabels[item.kind]} · {lifecycleLabels[item.lifecycle]} · {item.risk} · r{item.revision} · {item.verificationStatus === "verified"?"已核验":"待核验"}{item.activeForLearning ? " · 已私人启用（仍待核验）" : ""}</small></div>
        <div className="row-actions">
          {(item.lifecycle === "draft" || item.lifecycle === "pending_review") && <button onClick={() => { setEditingId(editingId === item.id ? "" : item.id); }}>编辑详情</button>}
          <button onClick={() => { const copy = duplicateDraft(item.id); setTab("drafts"); setEditingId(copy.id); notify("已创建独立副本草稿；原内容未更改。","success"); }}><Copy size={13}/>复制</button>
          {item.lifecycle === "draft" && <button onClick={() => setLifecycle(item.id,"pending_review")}>提交审核</button>}
          {item.lifecycle === "pending_review" && <button onClick={() => setLifecycle(item.id,"active",true)}>私人启用（仍待核验）</button>}
          <button onClick={() => setLifecycle(item.id,"archived")}><Archive size={13}/>归档</button>
          {item.lifecycle === "archived" && <button onClick={() => setLifecycle(item.id,"deprecated")}>标记弃用</button>}
        </div>
      </article>)}</div>}
      {editing && <PersonalDraftEditor key={editing.id} entry={editing} inventory={base} personal={personal} />}
    </section>}
    {tab === "library" && <section>
      <div className="section-title"><h2>有效内容</h2><span>{effective.length} 项（内置基线 + 已启用个人覆盖）</span></div>
      <div className="settings-actions">
        <button className="primary" disabled={selectedKeys.size === 0 || exporting} onClick={() => void runExport()}><Download size={14}/> 导出审核包（{selectedKeys.size} 项，含依赖闭包，共 5 个文件）</button>
        <span>导出目录默认在 Obsidian 库之外；未知 ID、依赖环或不安全路径会整体失败且零写入。</span>
      </div>
      <div className="studio-list">{effective.slice(0,80).map((item) => <article key={item.key}>
        <label className="studio-select"><input type="checkbox" checked={selectedKeys.has(item.key)} onChange={() => toggleSelected(item.key)} aria-label={`选择 ${item.title}`} /></label>
        <div><strong>{item.title}</strong><small>{kindLabels[item.kind]} · r{item.revision} · {item.owner === "builtin"?"内置只读":"个人覆盖"} · {item.dependencyKeys.length} 个依赖</small></div>
        <div className="row-actions">
          {item.owner === "builtin" && <button onClick={() => {
            try {
              const overlay = ensureOverlay(item);
              setTab("drafts"); setEditingId(overlay.id);
              notify("已建立个人修订（overlay）：内置基线保持只读，修订走待审核流程。","success");
            } catch (error) { notify(`建立失败：${String(error)}`,"error"); }
          }}>建立个人修订</button>}
        </div>
        <span className={`status-badge ${item.verificationStatus}`}>{item.verificationStatus === "verified"?"已核验":"待核验"}</span>
      </article>)}</div>
    </section>}
    {tab === "outbox" && <section>
      <div className="section-title"><h2>Obsidian 发布箱</h2><span>{batches.length} 个批次</span></div>
      <OutboxPanel effective={effective} />
      <ReviewRoundTripPanel effective={effective} />
    </section>}
    {tab === "history" && <section>
      <div className="section-title"><h2>版本历史</h2><span>{history.length} 个快照</span></div>
      {history.length > 0 && <HistoryCompare history={history} personal={personal} />}
      <PatchImportPanel personal={personal} />
      <div className="studio-list">{history.map((item) => <article key={item.id}><div><strong>{item.contentId}</strong><small>r{item.revision} · {item.reason}{item.reviewer ? ` · 复核：${item.reviewer}` : ""}</small></div><code>{item.hash.slice(0,20)}…</code></article>)}</div>
    </section>}
    {tab === "conflicts" && <section><div className="section-title"><h2>冲突</h2><span>{conflicts.filter((item) => item.status==="open").length + baseUpdateConflicts.length} 个待处理</span></div>{conflicts.length === 0 && baseUpdateConflicts.length === 0 ? <div className="empty-state"><p>当前没有冲突。基础内容与个人覆盖不会静默互相覆盖。</p></div> : <div className="studio-list">{[...baseUpdateConflicts, ...conflicts].map((item) => <article key={item.id}><div><strong>{item.contentId}</strong><small>{item.detail}</small></div><span className={`status-badge ${item.status === "open" ? "pending" : "verified"}`}>{item.status === "open" ? <><FileWarning size={12}/> 待处理</> : "已解决"}</span></article>)}</div>}</section>}
  </div>;
}
