import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { Activity, Database, Download, FileJson, FileSpreadsheet, KeyRound, Moon, RefreshCw, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { auditCases } from "../../data/auditCases";
import { evidenceSources } from "../../data/evidence";
import { judgmentCards } from "../../data/judgmentCards";
import { usableMethodConcepts } from "../../data/methods";
import { researchPatterns } from "../../data/patterns";
import type { AIProvider } from "../../domain/types";
import { databaseHealth, exportBackup, importBackup, loadPersistedState, setProviderKey, testProvider } from "../../services/desktop";
import type { DatabaseHealth } from "../../services/desktop";
import { downloadLearningData, type LearningExportFormat } from "../../services/learningExport";
import { useAppStore } from "../../state/store";
import { persistenceLabel, weightLabel } from "../../app/localization";

const tabs = [
  { id: "general", label: "常规" }, { id: "ai", label: "AI" }, { id: "learning", label: "学习" },
  { id: "evidence", label: "证据" }, { id: "data", label: "数据" }, { id: "system", label: "系统" },
] as const;

export function SettingsView() {
  const settings = useAppStore((state) => state.settings);
  const providers = useAppStore((state) => state.providers);
  const persistenceStatus = useAppStore((state) => state.persistenceStatus);
  const lastSavedAt = useAppStore((state) => state.lastSavedAt);
  const misconceptions = useAppStore((state) => state.misconceptions);
  const draftCount = useAppStore((state) => Object.keys(state.draftResponses).length);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const updateWeights = useAppStore((state) => state.updateWeights);
  const updateProvider = useAppStore((state) => state.updateProvider);
  const replaceData = useAppStore((state) => state.replaceData);
  const resetDemo = useAppStore((state) => state.resetDemo);
  const notify = useAppStore((state) => state.notify);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("general");
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [health, setHealth] = useState<DatabaseHealth>();
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
    try { const path = await saveDialog({ defaultPath: `ResearchOS-v0.10.2-backup-${new Date().toISOString().slice(0,10)}.sqlite3`, filters: [{ name: "SQLite 数据库", extensions: ["sqlite3"] }] }); if (path) { await exportBackup(path); notify(`备份已导出到 ${path}`, "success"); } }
    catch (error) { notify(`备份失败：${String(error)}`, "error"); }
  };
  const importDb = async () => {
    try { const source = await openDialog({ multiple: false, directory: false, filters: [{ name: "ResearchOS SQLite 备份", extensions: ["sqlite3", "db"] }] }); if (typeof source === "string") { await importBackup(source); const data = await loadPersistedState(); if (data) replaceData(data); refreshHealth(); notify("备份完整性检查通过，已在必要时迁移并恢复应用状态。", "success"); } }
    catch (error) { notify(`恢复失败：${String(error)}`, "error"); }
  };
  const exportLearning = (format: LearningExportFormat) => { downloadLearningData(useAppStore.getState(), format); notify(`已创建 ${format.toUpperCase()} 学习数据导出。`, "success"); };

  return (
    <div className="settings-layout">
      <aside className="settings-tabs">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}</aside>
      <section className="settings-panel scrollable">
        <header><span className="eyebrow">设置</span><h1>{tabs.find((item) => item.id === tab)?.label}</h1></header>
        {tab === "general" && <div className="settings-group"><h2>工作区</h2><label>主题<select value={settings.theme} onChange={(event) => updateSettings({ theme: event.target.value as typeof settings.theme })}><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></select></label><label>启动页面<select value={settings.startPage} onChange={(event) => updateSettings({ startPage: event.target.value })}><option value="today">今日训练</option><option value="review">复习</option><option value="library">文献库</option></select></label><label>每日目标（分钟）<input type="number" min={20} max={120} value={settings.dailyMinutes} onChange={(event) => updateSettings({ dailyMinutes: Number(event.target.value) })} /></label><div className="setting-note"><Moon size={15} /><p>主题会立即应用。本地数据无需登录或联网即可打开。</p></div></div>}
        {tab === "ai" && <div className="settings-group"><h2>OpenAI 兼容服务</h2><label>服务<select value={activeProvider.id} onChange={(event) => updateSettings({ activeProviderId: event.target.value })}>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></label><label>服务名称<input value={activeProvider.name} onChange={(event) => updateActiveProvider({ name: event.target.value })} /></label><label>基础 URL<input value={activeProvider.baseUrl} onChange={(event) => updateActiveProvider({ baseUrl: event.target.value })} /></label><label>模型<input value={activeProvider.model} onChange={(event) => updateActiveProvider({ model: event.target.value })} /></label><div className="form-grid two"><label>温度<input type="number" min={0} max={2} step={.1} value={activeProvider.temperature} onChange={(event) => updateActiveProvider({ temperature: Number(event.target.value) })} /></label><label>最大令牌数<input type="number" min={100} max={10000} value={activeProvider.maxTokens} onChange={(event) => updateActiveProvider({ maxTokens: Number(event.target.value) })} /></label></div><label>API 密钥<div className="input-action"><input type="password" value={key} placeholder={activeProvider.hasApiKey ? "•••••••• 已存入 Windows 凭据管理器" : "尚未配置——仍可使用离线模式"} onChange={(event) => setKey(event.target.value)} /><button disabled={!key} onClick={() => void saveKey()}><KeyRound size={13} /> 保存</button></div></label><div className="settings-actions"><button disabled={testing} onClick={() => void test()}><RefreshCw size={14} /> {testing ? "正在测试…" : "测试连接"}</button><span>AI 只评议已锁定的作答，仅接收明确证据，并以待核验生成内容保存。</span></div></div>}
        {tab === "learning" && <div className="settings-group"><h2>调度权重</h2>{Object.entries(settings.weights).map(([keyName, value]) => <label key={keyName}>{weightLabel(keyName)}<div className="range-input"><input type="range" min={0} max={1} step={.05} value={value} onChange={(event) => updateWeights({ [keyName]: Number(event.target.value) })} /><output>{value.toFixed(2)}</output></div></label>)}<div className="setting-note"><ShieldCheck size={15} /><p>错误且高信心的作答会形成明确的错误观念，并安排次日陌生变式提取。只有正确完成变式才能解除。</p></div></div>}
        {tab === "evidence" && <div className="settings-group"><h2>元数据核验</h2><label className="toggle-row"><span>PubMed 核验<small>NCBI E-utilities</small></span><input type="checkbox" checked={settings.pubmedVerification} onChange={(event) => updateSettings({ pubmedVerification: event.target.checked })} /></label><label className="toggle-row"><span>DOI 核验<small>Crossref REST API</small></span><input type="checkbox" checked={settings.doiVerification} onChange={(event) => updateSettings({ doiVerification: event.target.checked })} /></label><label className="toggle-row"><span>离线模式<small>跳过模型服务和元数据请求</small></span><input type="checkbox" checked={settings.offlineMode} onChange={(event) => updateSettings({ offlineMode: event.target.checked })} /></label><div className="setting-note"><ShieldCheck size={15} /><p>标识符解析只核验元数据。主张级核验还需要阅读来源是否真正支持训练陈述。</p></div></div>}
        {tab === "data" && <div className="settings-group"><h2>SQLite 备份</h2><div className="database-status"><Database size={18} /><div><strong>{health?.ok ? "SQLite 完整性正常" : "数据库状态不可用"}</strong><code>{health?.path ?? "正在检查…"}</code><small>架构 v{health?.schemaVersion ?? "—"} · {health?.integrity} · {health?.journalMode ?? "日志未知"}</small></div></div><div className="backup-actions"><button onClick={() => void exportDb()}><Download size={14} /> 导出 SQLite</button><button onClick={() => void importDb()}><Upload size={14} /> 导入备份</button></div><h2>可移植学习数据</h2><div className="backup-actions"><button onClick={() => exportLearning("json")}><FileJson size={14} /> JSON</button><button onClick={() => exportLearning("csv")}><FileSpreadsheet size={14} /> CSV</button><button onClick={() => exportLearning("markdown")}><Download size={14} /> Markdown</button></div><h2>初始状态</h2><button className="danger-button" onClick={() => { if (window.confirm("要将学习数据、项目、论文、笔记、引导状态和历史记录重置为内置初始状态吗？如有需要，请先导出备份。")) resetDemo(); }}>重置本地学习数据</button><p className="setting-footnote">备份不会复制 PDF 文件，只保留本地路径。API 密钥始终保存在 Windows 凭据管理器中，绝不会导出。</p></div>}
        {tab === "system" && <div className="settings-group"><h2>运行状态</h2><div className="health-grid"><article><Activity /><span>持久化</span><strong>{persistenceLabel(persistenceStatus)}</strong><small>{lastSavedAt ? `上次保存 ${new Date(lastSavedAt).toLocaleTimeString("zh-CN")}` : "本次会话尚未保存"}</small></article><article><Database /><span>数据库架构</span><strong>v{health?.schemaVersion ?? "—"}</strong><small>{health?.recoverySnapshots ?? 0} 个恢复快照</small></article><article><ShieldCheck /><span>状态架构</span><strong>v{useAppStore.getState().schemaVersion}</strong><small>{draftCount} 个崩溃安全草稿</small></article><article><RefreshCw /><span>错误观念</span><strong>{misconceptions.filter((item) => item.status !== "resolved").length}</strong><small>{misconceptions.filter((item) => item.status === "resolved").length} 个已通过变式解除</small></article></div><h2>科研内容清单</h2><div className="health-inventory"><span>{evidenceSources.length}<small>条证据来源</small></span><span>{usableMethodConcepts.length}<small>个可用方法</small></span><span>{researchPatterns.length}<small>个研究模式</small></span><span>{judgmentCards.length}<small>张判断卡</small></span><span>{auditCases.length}<small>个 AI 审查案例</small></span></div><div className="setting-note"><Activity size={15} /><p>ResearchOS v0.10.2 · 功能模块按需加载 · 本地优先 SQLite/WAL · 有界恢复快照 · 内容门禁已通过。</p></div><button onClick={refreshHealth}><RefreshCw size={14} /> 刷新诊断</button></div>}
      </section>
    </div>
  );
}
