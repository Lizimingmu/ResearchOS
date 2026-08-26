import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { Activity, Database, Download, FileJson, FileSpreadsheet, GraduationCap, KeyRound, Moon, RefreshCw, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { auditCases } from "../../data/auditCases";
import { evidenceSources } from "../../data/evidence";
import { judgmentCards } from "../../data/judgmentCards";
import { usableMethodConcepts } from "../../data/methods";
import { researchPatterns } from "../../data/patterns";
import type { AIProvider } from "../../domain/types";
import type { SourcePackDocument } from "../../domain/problemAtlas";
import { databaseHealth, exportBackup, importBackup, loadPersistedState, setProviderKey, testProvider } from "../../services/desktop";
import type { DatabaseHealth } from "../../services/desktop";
import { downloadLearningData, type LearningExportFormat } from "../../services/learningExport";
import { parseSourcePackCsv, parseSourcePackJsonSafe, parseSourcePackMarkdown, type SourcePackDryRun } from "../../services/sourcePack";
import { useAppStore } from "../../state/store";
import { persistenceLabel, weightLabel } from "../../app/localization";
import { supportedLocales, t } from "../../i18n";

const makePackHeader = (fileNames: string[]) => ({
  packSchemaVersion: "1",
  packId: `user-import-${Date.now().toString(36)}`,
  title: `用户导入源包（${fileNames[0] ?? "未命名"}）`,
  createdAt: new Date().toISOString(),
  createdBy: "user",
  provenance: "用户通过 ResearchOS 源包导入界面显式导入；解析与校验由本地确定性流程处理。",
});

const tabs = [
  { id: "general", label: "常规设置" }, { id: "ai", label: "AI 设置" }, { id: "learning", label: "学习设置" },
  { id: "evidence", label: "证据与核验" }, { id: "data", label: "数据与备份" }, { id: "system", label: "系统状态" },
] as const;

export function SettingsView() {
  const settings = useAppStore((state) => state.settings);
  const providers = useAppStore((state) => state.providers);
  const persistenceStatus = useAppStore((state) => state.persistenceStatus);
  const lastSavedAt = useAppStore((state) => state.lastSavedAt);
  const misconceptions = useAppStore((state) => state.misconceptions);
  const draftCount = useAppStore((state) => Object.keys(state.draftResponses).length);
  const problemCardCount = useAppStore((state) => state.problemCards.length);
  const registrySourceCount = useAppStore((state) => state.problemAtlasSources.length);
  const claimCount = useAppStore((state) => state.problemAtlasClaims.length);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const updateWeights = useAppStore((state) => state.updateWeights);
  const updateProvider = useAppStore((state) => state.updateProvider);
  const replaceData = useAppStore((state) => state.replaceData);
  const resetDemo = useAppStore((state) => state.resetDemo);
  const notify = useAppStore((state) => state.notify);
  const openTutorial = useAppStore((state) => state.openTutorial);
  const dryRunSourcePackState = useAppStore((state) => state.dryRunSourcePack);
  const confirmSourcePackImport = useAppStore((state) => state.confirmSourcePackImport);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("general");
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [health, setHealth] = useState<DatabaseHealth>();
  const [importFiles, setImportFiles] = useState<string[]>([]);
  const [importError, setImportError] = useState("");
  const [importDryRun, setImportDryRun] = useState<SourcePackDryRun>();
  const importDocRef = useRef<SourcePackDocument | undefined>(undefined);
  const activeProvider = providers.find((provider) => provider.id === settings.activeProviderId) ?? providers[0];

  const refreshHealth = () => void databaseHealth().then(setHealth).catch(() => undefined);
  useEffect(refreshHealth, []);

  const saveKey = async () => {
    try { await setProviderKey(activeProvider.id, key); updateProvider(activeProvider.id, { hasApiKey: Boolean(key) }); setKey(""); notify("API 密钥已存入 Windows 凭据管理器，不会写入 SQLite 或源代码文件。", "success"); }
    catch (error) { notify(`凭据保存失败：${String(error)}`, "error"); }
  };
  const test = async () => {
    setTesting(true);
    try { const result = await testProvider(activeProvider); notify(`模型服务返回 HTTP ${result.status}。`, "success"); }
    catch (error) { notify(`模型服务测试失败：${String(error)}`, "error"); }
    finally { setTesting(false); }
  };
  const updateActiveProvider = (patch: Partial<AIProvider>) => updateProvider(activeProvider.id, patch);
  const exportDb = async () => {
    try { const path = await saveDialog({ defaultPath: `ResearchOS-v0.12.0-backup-${new Date().toISOString().slice(0,10)}.sqlite3`, filters: [{ name: "SQLite 数据库", extensions: ["sqlite3"] }] }); if (path) { await exportBackup(path); notify(`备份已导出到 ${path}`, "success"); } }
    catch (error) { notify(`备份失败：${String(error)}`, "error"); }
  };
  const importDb = async () => {
    try { const source = await openDialog({ multiple: false, directory: false, filters: [{ name: "ResearchOS SQLite 备份", extensions: ["sqlite3", "db"] }] }); if (typeof source === "string") { await importBackup(source); const data = await loadPersistedState(); if (data) replaceData(data); refreshHealth(); notify("备份完整性检查通过，已在必要时迁移并恢复应用状态。", "success"); } }
    catch (error) { notify(`恢复失败：${String(error)}`, "error"); }
  };
  const exportLearning = (format: LearningExportFormat) => { downloadLearningData(useAppStore.getState(), format); notify(`已创建 ${format.toUpperCase()} 学习数据导出。`, "success"); };

  const chooseSourcePack = async (files: FileList | null) => {
    setImportError("");
    setImportDryRun(undefined);
    importDocRef.current = undefined;
    if (!files || files.length === 0) { setImportFiles([]); return; }
    const list = Array.from(files);
    setImportFiles(list.map((file) => file.name));
    try {
      const jsonFiles = list.filter((file) => file.name.toLowerCase().endsWith(".json"));
      const csvFiles = list.filter((file) => file.name.toLowerCase().endsWith(".csv"));
      const mdFiles = list.filter((file) => file.name.toLowerCase().endsWith(".md"));
      if (jsonFiles.length + csvFiles.length + mdFiles.length !== list.length) throw new Error("仅支持 .json / .csv / .md 源包文件。");
      let doc: SourcePackDocument;
      const header = makePackHeader(list.map((file) => file.name));
      if (jsonFiles.length === 1 && csvFiles.length === 0 && mdFiles.length === 0) {
        const parsed = parseSourcePackJsonSafe(await jsonFiles[0].text());
        if (!parsed.ok || !parsed.doc) throw new Error(parsed.failure ? `${parsed.failure.code} ${parsed.failure.location}: ${parsed.failure.message}` : "JSON 解析失败。");
        doc = parsed.doc;
      } else if (jsonFiles.length === 0 && csvFiles.length > 0 && mdFiles.length === 0) {
        const filesRecord: Record<string, string> = {};
        for (const file of csvFiles) filesRecord[file.name.toLowerCase()] = await file.text();
        doc = parseSourcePackCsv(filesRecord, header);
        const hasEntities = ["sources", "evidenceClaims", "problemCards", "diagnosticCauses", "diagnosticChecks", "diagnosticPaths", "diagnosticEvidence", "transferCases"].some((entity) => Array.isArray((doc as unknown as Record<string, unknown>)[entity]) && ((doc as unknown as Record<string, unknown>)[entity] as unknown[]).length > 0);
        if (!hasEntities) throw new Error("未识别到任何实体 CSV（sources.csv / evidence_claims.csv / problem_cards.csv 等）。");
      } else if (jsonFiles.length === 0 && csvFiles.length === 0 && mdFiles.length > 0) {
        const filesRecord: Record<string, string> = {};
        for (const file of mdFiles) filesRecord[file.name] = await file.text();
        doc = parseSourcePackMarkdown(filesRecord, header);
      } else {
        throw new Error("请选择同一种格式：单个 JSON 文件，或多个 CSV 实体文件，或多个 Markdown 实体文件。");
      }
      importDocRef.current = doc;
      setImportDryRun(dryRunSourcePackState(doc));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : String(error));
    }
  };

  const importEligible = Boolean(importDryRun && importDryRun.errors.length === 0 && importDryRun.conflicts.length === 0 && importDryRun.rejectedRows.length === 0 && importDryRun.updates === 0 && importDryRun.importEligible);

  const confirmImport = () => {
    const doc = importDocRef.current;
    if (!doc || !importDryRun) return;
    try {
      const result = confirmSourcePackImport(doc);
      notify(result.applied ? "源包已通过全部门禁并事务导入。" : "源包未写入（与已导入内容一致）。", "success");
      setImportDryRun(undefined);
      setImportFiles([]);
      importDocRef.current = undefined;
    } catch (error) {
      notify(`导入被拒绝，未写入任何数据：${error instanceof Error ? error.message : String(error)}`, "error");
    }
  };

  return (
    <div className="settings-layout">
      <aside className="settings-tabs">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}</aside>
      <section className="settings-panel scrollable">
        <header><span className="eyebrow">设置</span><h1>{tabs.find((item) => item.id === tab)?.label}</h1></header>
        {tab === "general" && <div className="settings-group"><h2>工作区</h2><label>{t(settings.language, "settings.language")}<select value={settings.language} onChange={(event) => updateSettings({ language: event.target.value as typeof settings.language })}>{supportedLocales.map((locale) => <option key={locale.value} value={locale.value}>{locale.label}</option>)}</select></label><div className="setting-note"><ShieldCheck size={15} /><p>{t(settings.language, "settings.languageHelp")}</p></div><label>主题<select value={settings.theme} onChange={(event) => updateSettings({ theme: event.target.value as typeof settings.theme })}><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></select></label><label>启动页面<select value={settings.startPage} onChange={(event) => updateSettings({ startPage: event.target.value })}><option value="today">今日学习</option><option value="review">复习</option><option value="library">文献库</option></select></label><label>每日目标（分钟）<input type="number" min={20} max={120} value={settings.dailyMinutes} onChange={(event) => updateSettings({ dailyMinutes: Number(event.target.value) })} /></label><div className="setting-note"><Moon size={15} /><p>主题会立即应用。本地数据无需登录或联网即可打开。</p></div><h2>新手教程</h2><div className="settings-actions"><button onClick={openTutorial}><GraduationCap size={14} /> 重新打开新手教程</button><span>约 5 分钟；可随时跳过。练习运行在隔离预览状态，不会写入任何学习记录。</span></div></div>}
        {tab === "ai" && <div className="settings-group"><h2>OpenAI 兼容服务</h2><label>服务<select value={activeProvider.id} onChange={(event) => updateSettings({ activeProviderId: event.target.value })}>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></label><label>服务名称<input value={activeProvider.name} onChange={(event) => updateActiveProvider({ name: event.target.value })} /></label><label>API 地址（Base URL）<input value={activeProvider.baseUrl} onChange={(event) => updateActiveProvider({ baseUrl: event.target.value })} /></label><label>模型（Model）<input value={activeProvider.model} onChange={(event) => updateActiveProvider({ model: event.target.value })} /></label><div className="form-grid two"><label>随机性（Temperature）<input type="number" min={0} max={2} step={.1} value={activeProvider.temperature} onChange={(event) => updateActiveProvider({ temperature: Number(event.target.value) })} /></label><label>最大令牌数（Max Tokens）<input type="number" min={100} max={10000} value={activeProvider.maxTokens} onChange={(event) => updateActiveProvider({ maxTokens: Number(event.target.value) })} /></label></div><label>API 密钥<div className="input-action"><input type="password" value={key} placeholder={activeProvider.hasApiKey ? "•••••••• 已存入 Windows 凭据管理器" : "尚未配置——仍可使用离线模式"} onChange={(event) => setKey(event.target.value)} /><button disabled={!key} onClick={() => void saveKey()}><KeyRound size={13} /> 保存</button></div></label><div className="settings-actions"><button disabled={testing} onClick={() => void test()}><RefreshCw size={14} /> {testing ? "正在测试…" : "测试连接"}</button><span>AI 只评议已锁定的作答，仅接收明确证据，并以待核验生成内容保存。</span></div></div>}
        {tab === "learning" && <div className="settings-group"><h2>调度权重</h2>{Object.entries(settings.weights).map(([keyName, value]) => <label key={keyName}>{weightLabel(keyName)}<div className="range-input"><input type="range" min={0} max={1} step={.05} value={value} onChange={(event) => updateWeights({ [keyName]: Number(event.target.value) })} /><output>{value.toFixed(2)}</output></div></label>)}<div className="setting-note"><ShieldCheck size={15} /><p>错误且高信心的作答会形成明确的错误观念，并安排次日陌生变式提取。只有正确完成变式才能解除。</p></div></div>}
        {tab === "evidence" && <div className="settings-group"><h2>元数据核验</h2><label className="toggle-row"><span>PubMed 核验<small>NCBI E-utilities</small></span><input type="checkbox" checked={settings.pubmedVerification} onChange={(event) => updateSettings({ pubmedVerification: event.target.checked })} /></label><label className="toggle-row"><span>DOI 核验<small>Crossref REST API</small></span><input type="checkbox" checked={settings.doiVerification} onChange={(event) => updateSettings({ doiVerification: event.target.checked })} /></label><label className="toggle-row"><span>离线模式<small>跳过模型服务和元数据请求</small></span><input type="checkbox" checked={settings.offlineMode} onChange={(event) => updateSettings({ offlineMode: event.target.checked })} /></label><div className="setting-note"><ShieldCheck size={15} /><p>标识符解析只核验元数据。主张级核验还需要阅读来源是否真正支持训练陈述。</p></div></div>}
        {tab === "data" && <div className="settings-group"><h2>SQLite 备份</h2><div className="database-status"><Database size={18} /><div><strong>{health?.ok ? "SQLite 完整性正常" : "数据库状态不可用"}</strong><code>{health?.path ?? "正在检查…"}</code><small>架构 v{health?.schemaVersion ?? "—"} · {health?.integrity} · {health?.journalMode ?? "日志未知"}</small></div></div><div className="backup-actions"><button onClick={() => void exportDb()}><Download size={14} /> 导出 SQLite</button><button onClick={() => void importDb()}><Upload size={14} /> 导入备份</button></div><h2>可移植学习数据</h2><div className="backup-actions"><button onClick={() => exportLearning("json")}><FileJson size={14} /> JSON</button><button onClick={() => exportLearning("csv")}><FileSpreadsheet size={14} /> CSV</button><button onClick={() => exportLearning("markdown")}><Download size={14} /> Markdown</button></div><h2>源包导入（科研问题库）</h2><div className="setting-note"><ShieldCheck size={15} /><p>选择源包文件 → 本地解析并生成 dry-run 报告 → 仅当零结构错误、零冲突、零被拒行、零更新且科学完整性通过时才能确认事务导入。超长字段会被确定性拒绝，绝不静默截断；已有行不会被静默覆盖。</p></div><label className="import-file-row"><input type="file" multiple accept=".json,.csv,.md" onChange={(event) => void chooseSourcePack(event.target.files)} /><span>{importFiles.length ? importFiles.join("、") : "选择源包文件…（单个 JSON，或多个 CSV/Markdown 实体文件）"}</span></label>{importError && <p className="import-error">{importError}</p>}{importDryRun && <div className="import-report"><p><strong>Dry-run 报告：</strong>新增 {importDryRun.inserts} · 更新 {importDryRun.updates} · 冲突 {importDryRun.conflicts.length} · 被拒行 {importDryRun.rejectedRows.length} · 警告 {importDryRun.warnings.length} · 结构错误 {importDryRun.errors.length} · 科学完整性 {importDryRun.scientificCompleteness.status}{importDryRun.noop ? "（与已导入包内容一致，无需变更）" : ""}</p>{importDryRun.errors.length > 0 && <ul className="import-failures">{importDryRun.errors.slice(0, 8).map((error) => <li key={error}>{error}</li>)}</ul>}{importDryRun.conflicts.length > 0 && <ul className="import-failures">{importDryRun.conflicts.map((conflict) => <li key={conflict}>{conflict}</li>)}</ul>}<div className="backup-actions"><button className="primary" disabled={!importEligible} onClick={confirmImport}><Upload size={14} /> 确认导入</button></div>{!importEligible && <small>确认导入仅在零结构错误、零冲突、零被拒行、零更新且科学完整性通过时可用。</small>}</div>}<h2>初始状态</h2><button className="danger-button" onClick={() => { if (window.confirm("要将学习数据、项目、论文、笔记、引导状态和历史记录重置为内置初始状态吗？如有需要，请先导出备份。")) resetDemo(); }}>重置本地学习数据</button><p className="setting-footnote">备份不会复制 PDF 文件，只保留本地路径。API 密钥始终保存在 Windows 凭据管理器中，绝不会导出。</p></div>}
        {tab === "system" && <div className="settings-group"><h2>运行状态</h2><div className="health-grid"><article><Activity /><span>持久化</span><strong>{persistenceLabel(persistenceStatus)}</strong><small>{lastSavedAt ? `上次保存 ${new Date(lastSavedAt).toLocaleTimeString("zh-CN")}` : "本次会话尚未保存"}</small></article><article><Database /><span>数据库架构</span><strong>v{health?.schemaVersion ?? "—"}</strong><small>{health?.recoverySnapshots ?? 0} 个恢复快照</small></article><article><ShieldCheck /><span>状态架构</span><strong>v{useAppStore.getState().schemaVersion}</strong><small>{draftCount} 个崩溃安全草稿</small></article><article><RefreshCw /><span>错误观念</span><strong>{misconceptions.filter((item) => item.status !== "resolved").length}</strong><small>{misconceptions.filter((item) => item.status === "resolved").length} 个已通过变式解除</small></article></div><h2>科研内容清单</h2><div className="health-inventory"><span>{evidenceSources.length}<small>条证据来源</small></span><span>{usableMethodConcepts.length}<small>个可用方法</small></span><span>{researchPatterns.length}<small>个研究模式</small></span><span>{judgmentCards.length}<small>张判断卡</small></span><span>{auditCases.length}<small>个 AI 审查案例</small></span><span>{problemCardCount}<small>张问题卡</small></span><span>{registrySourceCount}<small>条注册来源</small></span><span>{claimCount}<small>条证据主张</small></span></div><div className="setting-note"><Activity size={15} /><p>ResearchOS v0.12.0 · 功能模块按需加载 · 本地优先 SQLite/WAL · 有界恢复快照 · 内容门禁已通过。</p></div><button onClick={refreshHealth}><RefreshCw size={14} /> 刷新诊断</button></div>}
      </section>
    </div>
  );
}
