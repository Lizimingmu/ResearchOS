import { useEffect, useMemo, useRef, useState } from "react";
import { Command, FilePlus2, FlaskConical, FolderPlus, Search, ShieldCheck } from "lucide-react";
import { methodConcepts } from "../data/methods";
import { useAppStore } from "../state/store";

interface PaletteCommand {
  id: string;
  label: string;
  group: string;
  keywords: string;
  run: () => void;
  icon: typeof Command;
}

export function CommandPalette() {
  const open = useAppStore((state) => state.paletteOpen);
  const setOpen = useAppStore((state) => state.setPaletteOpen);
  const setView = useAppStore((state) => state.setView);
  const selectMethod = useAppStore((state) => state.selectMethod);
  const notify = useAppStore((state) => state.notify);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const commands = useMemo<PaletteCommand[]>(() => [
    { id: "today", label: "Start today", group: "Navigate", keywords: "daily session", run: () => setView("today"), icon: Command },
    { id: "paper", label: "Open paper", group: "Navigate", keywords: "pdf library", run: () => setView("paper-lab"), icon: FilePlus2 },
    { id: "project", label: "Add project", group: "Create", keywords: "context research", run: () => setView("projects"), icon: FolderPlus },
    { id: "review", label: "Go to review", group: "Navigate", keywords: "retrieval due", run: () => setView("review"), icon: ShieldCheck },
    { id: "audit", label: "Audit current analysis", group: "Practice", keywords: "ai plan critique", run: () => setView("ai-audit"), icon: ShieldCheck },
    { id: "evidence", label: "Find evidence", group: "Evidence", keywords: "pmid doi verify", run: () => { setView("library"); notify("Use Verify PMID / DOI in the paper inspector. Unresolved metadata stays pending.", "info"); }, icon: Search },
    { id: "transfer", label: "Create transfer exercise", group: "Practice", keywords: "project action", run: () => setView("projects"), icon: FlaskConical },
    ...methodConcepts.map((method) => ({ id: `method-${method.id}`, label: `Method: ${method.title}`, group: "Methods", keywords: `${method.domain} ${method.tags.join(" ")}`, run: () => selectMethod(method.id), icon: FlaskConical })),
  ], [notify, selectMethod, setView]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands.slice(0, 12);
    return commands.filter((item) => `${item.label} ${item.keywords} ${item.group}`.toLowerCase().includes(normalized)).slice(0, 14);
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      window.setTimeout(() => input.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  if (!open) return null;
  const execute = (command?: PaletteCommand) => {
    if (!command) return;
    command.run();
    setOpen(false);
  };
  return (
    <div className="overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <label className="palette-input"><Search size={17} /><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a command or method…" onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(filtered.length - 1, value + 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(0, value - 1)); }
          if (event.key === "Enter") { event.preventDefault(); execute(filtered[active]); }
          if (event.key === "Escape") setOpen(false);
        }} /></label>
        <div className="palette-results">
          {filtered.length === 0 && <div className="empty-inline">No command matches this query.</div>}
          {filtered.map((item, index) => {
            const Icon = item.icon;
            return <button key={item.id} className={index === active ? "active" : ""} onMouseEnter={() => setActive(index)} onClick={() => execute(item)}><Icon size={15} /><span>{item.label}</span><small>{item.group}</small></button>;
          })}
        </div>
        <footer><span><kbd>↑↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></footer>
      </section>
    </div>
  );
}

