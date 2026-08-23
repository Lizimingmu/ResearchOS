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

const tabs = ["General", "AI", "Learning", "Evidence", "Data", "System"] as const;

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
  const [tab, setTab] = useState<(typeof tabs)[number]>("General");
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [health, setHealth] = useState<DatabaseHealth>();
  const activeProvider = providers.find((provider) => provider.id === settings.activeProviderId) ?? providers[0];

  const refreshHealth = () => void databaseHealth().then(setHealth).catch(() => undefined);
  useEffect(refreshHealth, []);

  const saveKey = async () => {
    try { await setProviderKey(activeProvider.id, key); updateProvider(activeProvider.id, { hasApiKey: Boolean(key) }); setKey(""); notify("API key stored in Windows Credential Manager. It is not written to SQLite or source files.", "success"); }
    catch (error) { notify(`Credential save failed: ${String(error)}`, "error"); }
  };
  const test = async () => {
    setTesting(true);
    try { const result = await testProvider(activeProvider); notify(`Provider responded with HTTP ${result.status}.`, "success"); }
    catch (error) { notify(`Provider test failed: ${String(error)}`, "error"); }
    finally { setTesting(false); }
  };
  const updateActiveProvider = (patch: Partial<AIProvider>) => updateProvider(activeProvider.id, patch);
  const exportDb = async () => {
    try { const path = await saveDialog({ defaultPath: `ResearchOS-v0.10-backup-${new Date().toISOString().slice(0,10)}.sqlite3`, filters: [{ name: "SQLite database", extensions: ["sqlite3"] }] }); if (path) { await exportBackup(path); notify(`Backup exported to ${path}`, "success"); } }
    catch (error) { notify(`Backup failed: ${String(error)}`, "error"); }
  };
  const importDb = async () => {
    try { const source = await openDialog({ multiple: false, directory: false, filters: [{ name: "ResearchOS SQLite backup", extensions: ["sqlite3", "db"] }] }); if (typeof source === "string") { await importBackup(source); const data = await loadPersistedState(); if (data) replaceData(data); refreshHealth(); notify("Backup integrity checked, migrated if needed, and application state restored.", "success"); } }
    catch (error) { notify(`Restore failed: ${String(error)}`, "error"); }
  };
  const exportLearning = (format: LearningExportFormat) => { downloadLearningData(useAppStore.getState(), format); notify(`${format.toUpperCase()} learning export created.`, "success"); };

  return (
    <div className="settings-layout">
      <aside className="settings-tabs">{tabs.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</aside>
      <section className="settings-panel scrollable">
        <header><span className="eyebrow">SETTINGS</span><h1>{tab}</h1></header>
        {tab === "General" && <div className="settings-group"><h2>Workspace</h2><label>Theme<select value={settings.theme} onChange={(event) => updateSettings({ theme: event.target.value as typeof settings.theme })}><option value="system">Follow system</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Start page<select value={settings.startPage} onChange={(event) => updateSettings({ startPage: event.target.value })}><option value="today">Today</option><option value="review">Review</option><option value="library">Library</option></select></label><label>Daily target (minutes)<input type="number" min={20} max={120} value={settings.dailyMinutes} onChange={(event) => updateSettings({ dailyMinutes: Number(event.target.value) })} /></label><div className="setting-note"><Moon size={15} /><p>Theme is applied immediately. Local data can be opened without login or network access.</p></div></div>}
        {tab === "AI" && <div className="settings-group"><h2>OpenAI-compatible provider</h2><label>Provider<select value={activeProvider.id} onChange={(event) => updateSettings({ activeProviderId: event.target.value })}>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></label><label>Provider name<input value={activeProvider.name} onChange={(event) => updateActiveProvider({ name: event.target.value })} /></label><label>Base URL<input value={activeProvider.baseUrl} onChange={(event) => updateActiveProvider({ baseUrl: event.target.value })} /></label><label>Model<input value={activeProvider.model} onChange={(event) => updateActiveProvider({ model: event.target.value })} /></label><div className="form-grid two"><label>Temperature<input type="number" min={0} max={2} step={.1} value={activeProvider.temperature} onChange={(event) => updateActiveProvider({ temperature: Number(event.target.value) })} /></label><label>Max tokens<input type="number" min={100} max={10000} value={activeProvider.maxTokens} onChange={(event) => updateActiveProvider({ maxTokens: Number(event.target.value) })} /></label></div><label>API key<div className="input-action"><input type="password" value={key} placeholder={activeProvider.hasApiKey ? "•••••••• stored in Windows Credential Manager" : "Not configured — offline mode remains usable"} onChange={(event) => setKey(event.target.value)} /><button disabled={!key} onClick={() => void saveKey()}><KeyRound size={13} /> Store</button></div></label><div className="settings-actions"><button disabled={testing} onClick={() => void test()}><RefreshCw size={14} /> {testing ? "Testing…" : "Test connection"}</button><span>AI only critiques a locked attempt, receives explicit evidence, and is saved as pending generated content.</span></div></div>}
        {tab === "Learning" && <div className="settings-group"><h2>Scheduler weights</h2>{Object.entries(settings.weights).map(([keyName, value]) => <label key={keyName}>{keyName.replace(/([A-Z])/g, " $1")}<div className="range-input"><input type="range" min={0} max={1} step={.05} value={value} onChange={(event) => updateWeights({ [keyName]: Number(event.target.value) })} /><output>{value.toFixed(2)}</output></div></label>)}<div className="setting-note"><ShieldCheck size={15} /><p>Wrong plus high confidence creates an explicit misconception and an unfamiliar next-day retrieval. Resolution requires a correct variant.</p></div></div>}
        {tab === "Evidence" && <div className="settings-group"><h2>Metadata verification</h2><label className="toggle-row"><span>PubMed verification<small>NCBI E-utilities</small></span><input type="checkbox" checked={settings.pubmedVerification} onChange={(event) => updateSettings({ pubmedVerification: event.target.checked })} /></label><label className="toggle-row"><span>DOI verification<small>Crossref REST API</small></span><input type="checkbox" checked={settings.doiVerification} onChange={(event) => updateSettings({ doiVerification: event.target.checked })} /></label><label className="toggle-row"><span>Offline mode<small>Skip provider and metadata requests</small></span><input type="checkbox" checked={settings.offlineMode} onChange={(event) => updateSettings({ offlineMode: event.target.checked })} /></label><div className="setting-note"><ShieldCheck size={15} /><p>Identifier resolution verifies metadata only. Claim-level verification requires reading whether the source supports the training statement.</p></div></div>}
        {tab === "Data" && <div className="settings-group"><h2>SQLite backup</h2><div className="database-status"><Database size={18} /><div><strong>{health?.ok ? "SQLite integrity OK" : "Database status unavailable"}</strong><code>{health?.path ?? "Checking…"}</code><small>schema v{health?.schemaVersion ?? "—"} · {health?.integrity} · {health?.journalMode ?? "journal?"}</small></div></div><div className="backup-actions"><button onClick={() => void exportDb()}><Download size={14} /> Export SQLite</button><button onClick={() => void importDb()}><Upload size={14} /> Import backup</button></div><h2>Portable learning export</h2><div className="backup-actions"><button onClick={() => exportLearning("json")}><FileJson size={14} /> JSON</button><button onClick={() => exportLearning("csv")}><FileSpreadsheet size={14} /> CSV</button><button onClick={() => exportLearning("markdown")}><Download size={14} /> Markdown</button></div><h2>Seed state</h2><button className="danger-button" onClick={() => { if (window.confirm("Reset user learning data, projects, papers, notes, onboarding, and history to the bundled seed state? Export a backup first if needed.")) resetDemo(); }}>Reset local learning data</button><p className="setting-footnote">PDF files are not copied into backups; local paths are retained. API keys remain in Windows Credential Manager and are never exported.</p></div>}
        {tab === "System" && <div className="settings-group"><h2>Runtime health</h2><div className="health-grid"><article><Activity /><span>Persistence</span><strong>{persistenceStatus}</strong><small>{lastSavedAt ? `last saved ${new Date(lastSavedAt).toLocaleTimeString()}` : "not saved this session"}</small></article><article><Database /><span>Database schema</span><strong>v{health?.schemaVersion ?? "—"}</strong><small>{health?.recoverySnapshots ?? 0} recovery snapshots</small></article><article><ShieldCheck /><span>State schema</span><strong>v{useAppStore.getState().schemaVersion}</strong><small>{draftCount} crash-safe drafts</small></article><article><RefreshCw /><span>Misconceptions</span><strong>{misconceptions.filter((item) => item.status !== "resolved").length}</strong><small>{misconceptions.filter((item) => item.status === "resolved").length} resolved by variants</small></article></div><h2>Scientific inventory</h2><div className="health-inventory"><span>{evidenceSources.length}<small>evidence sources</small></span><span>{usableMethodConcepts.length}<small>usable methods</small></span><span>{researchPatterns.length}<small>patterns</small></span><span>{judgmentCards.length}<small>judgment cards</small></span><span>{auditCases.length}<small>AI audits</small></span></div><div className="setting-note"><Activity size={15} /><p>ResearchOS v0.10.0 · lazy feature modules · local-first SQLite/WAL · bounded recovery snapshots · content gate passed.</p></div><button onClick={refreshHealth}><RefreshCw size={14} /> Refresh diagnostics</button></div>}
      </section>
    </div>
  );
}
