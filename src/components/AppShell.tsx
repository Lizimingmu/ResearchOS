import { lazy, Suspense, type PropsWithChildren } from "react";
import { Command, MessageSquareQuote, Search } from "lucide-react";
import { getNavigation } from "../app/navigation";
import { t } from "../i18n";
import { useAppStore } from "../state/store";

const GlobalSearchResults = lazy(() => import("./GlobalSearchResults").then((module) => ({ default: module.GlobalSearchResults })));

export function AppShell({ children }: PropsWithChildren) {
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);
  const setPaletteOpen = useAppStore((state) => state.setPaletteOpen);
  const globalSearch = useAppStore((state) => state.globalSearch);
  const setGlobalSearch = useAppStore((state) => state.setGlobalSearch);
  const persistenceStatus = useAppStore((state) => state.persistenceStatus);
  const isPilotMode = useAppStore((state) => state.isPilotMode);
  const pilotFeedbackCount = useAppStore((state) => state.pilotFeedback?.length ?? 0);
  const locale = useAppStore((state) => state.settings.language);
  const navigation = getNavigation(locale);
  const active = navigation.find((item) => item.id === view) ?? { label: view === "learning" ? "学习单元" : "工作区" };

  return (
    <div className="desktop-shell">
      <nav className="activity-bar" aria-label="主导航">
        <button className="app-symbol" aria-label="ResearchOS 今日训练" onClick={() => setView("today")}>R</button>
        <div className="activity-stack">
          {navigation.slice(0, -1).map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`activity-button ${item.id === view ? "active" : ""}`} onClick={() => setView(item.id)} title={`${item.label}${item.key ? ` (${item.key})` : ""}`} aria-label={item.label}>
                <Icon size={18} strokeWidth={1.7} />
              </button>
            );
          })}
        </div>
        <button className={`activity-button bottom ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")} title="设置 (Ctrl+,)" aria-label="设置">
          {(() => { const Icon = navigation[navigation.length - 1].icon; return <Icon size={18} strokeWidth={1.7} />; })()}
        </button>
      </nav>
      <aside className="workspace-sidebar">
        <div className="sidebar-title"><span>RESEARCHOS</span><small>v0.12.0</small></div>
        <button className="command-trigger" onClick={() => setPaletteOpen(true)}><Command size={14} /><span>{t(locale, "shell.commandPalette")}</span><kbd>Ctrl K</kbd></button>
        <label className="sidebar-search">
          <Search size={14} />
          <input id="workspace-search" aria-label={t(locale, "shell.search")} value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder={t(locale, "shell.search")} />
        </label>
        {globalSearch.trim().length >= 2 && <Suspense fallback={null}><GlobalSearchResults /></Suspense>}
        <div className="sidebar-section-label">{t(locale, "shell.workspaces")}</div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={`sidebar-nav-item ${item.id === view ? "active" : ""}`} onClick={() => setView(item.id)}><Icon size={15} /><span>{item.label}</span>{item.key && <kbd>{item.key}</kbd>}</button>;
        })}
        <div className="sidebar-footer">
          <span className={`status-dot ${persistenceStatus}`} /> {t(locale, "shell.localFirst")} · {persistenceStatus === "error" ? "保存失败" : persistenceStatus === "saving" ? "正在保存" : "可离线使用"}
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-titlebar">
          <div><span className="eyebrow">工作区</span><strong>{active.label}</strong></div>
          <div className="titlebar-meta">
            {isPilotMode && (
              <button
                type="button"
                className="subtle"
                style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", fontSize: "12px", borderRadius: "6px" }}
                onClick={() => setView("pilot-feedback")}
              >
                <MessageSquareQuote size={13} />
                <span>试用反馈 ({pilotFeedbackCount})</span>
              </button>
            )}
            <span>{t(locale, "shell.humanFirst")}</span>
            <span>{t(locale, "shell.evidence")}</span>
          </div>
        </header>
        <div className="workspace-content">{children}</div>
      </main>
    </div>
  );
}
