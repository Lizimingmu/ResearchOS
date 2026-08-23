import type { PropsWithChildren } from "react";
import { Command, Search } from "lucide-react";
import { navigation } from "../app/navigation";
import { useAppStore } from "../state/store";

export function AppShell({ children }: PropsWithChildren) {
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);
  const setPaletteOpen = useAppStore((state) => state.setPaletteOpen);
  const globalSearch = useAppStore((state) => state.globalSearch);
  const setGlobalSearch = useAppStore((state) => state.setGlobalSearch);
  const active = navigation.find((item) => item.id === view)!;

  return (
    <div className="desktop-shell">
      <nav className="activity-bar" aria-label="Primary navigation">
        <button className="app-symbol" aria-label="ResearchOS Today" onClick={() => setView("today")}>R</button>
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
        <button className={`activity-button bottom ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")} title="Settings (Ctrl+,)" aria-label="Settings">
          {(() => { const Icon = navigation[navigation.length - 1].icon; return <Icon size={18} strokeWidth={1.7} />; })()}
        </button>
      </nav>
      <aside className="workspace-sidebar">
        <div className="sidebar-title"><span>RESEARCHOS</span><small>v0.9</small></div>
        <button className="command-trigger" onClick={() => setPaletteOpen(true)}><Command size={14} /><span>Command palette</span><kbd>Ctrl K</kbd></button>
        <label className="sidebar-search">
          <Search size={14} />
          <input id="workspace-search" aria-label="Workspace search" value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Filter workspace" />
        </label>
        <div className="sidebar-section-label">WORKSPACES</div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={`sidebar-nav-item ${item.id === view ? "active" : ""}`} onClick={() => setView(item.id)}><Icon size={15} /><span>{item.label}</span>{item.key && <kbd>{item.key}</kbd>}</button>;
        })}
        <div className="sidebar-footer">
          <span className="status-dot" /> Local-first · offline ready
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-titlebar">
          <div><span className="eyebrow">WORKSPACE</span><strong>{active.label}</strong></div>
          <div className="titlebar-meta"><span>Human first</span><span>Evidence locked</span></div>
        </header>
        <div className="workspace-content">{children}</div>
      </main>
    </div>
  );
}
