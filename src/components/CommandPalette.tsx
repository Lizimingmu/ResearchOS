import { useEffect, useMemo, useRef, useState } from "react";
import { Command, FilePlus2, FlaskConical, FolderPlus, Search, SearchCheck, ShieldCheck } from "lucide-react";
import type { MethodConcept } from "../domain/types";
import type { ProblemCard } from "../domain/problemAtlas";
import { useAppStore } from "../state/store";
import { bilingualMethodTitle } from "../i18n/researchTerms";

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
  const selectProblem = useAppStore((state) => state.selectProblem);
  const notify = useAppStore((state) => state.notify);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [methods, setMethods] = useState<MethodConcept[]>([]);
  const [problems, setProblems] = useState<ProblemCard[]>([]);
  const input = useRef<HTMLInputElement>(null);

  const commands = useMemo<PaletteCommand[]>(() => [
    { id: "today", label: "开始今日训练", group: "导航", keywords: "daily session 今日 训练", run: () => setView("today"), icon: Command },
    { id: "paper", label: "打开论文", group: "导航", keywords: "pdf library 论文 文献库", run: () => setView("paper-lab"), icon: FilePlus2 },
    { id: "project", label: "添加项目", group: "新建", keywords: "context research 项目", run: () => setView("projects"), icon: FolderPlus },
    { id: "review", label: "进入复习", group: "导航", keywords: "retrieval due 复习", run: () => setView("review"), icon: ShieldCheck },
    { id: "audit", label: "审查当前分析", group: "训练", keywords: "ai plan critique 审查", run: () => setView("ai-audit"), icon: ShieldCheck },
    { id: "problem-atlas", label: "打开科研常见问题库", group: "导航", keywords: "problem atlas diagnose 问题 排查 诊断", run: () => setView("problem-atlas"), icon: SearchCheck },
    { id: "evidence", label: "查找证据", group: "证据", keywords: "pmid doi verify 核验", run: () => { setView("library"); notify("请在论文检查器中使用“核验 PMID / DOI”。尚未解析的元数据将保持待核验状态。", "info"); }, icon: Search },
    { id: "transfer", label: "创建迁移练习", group: "训练", keywords: "project action 迁移", run: () => setView("projects"), icon: FlaskConical },
    ...methods.map((method) => ({ id: `method-${method.id}`, label: `方法：${bilingualMethodTitle(method.id, method.title)}`, group: "方法", keywords: `${method.title} ${method.domain} ${method.tags.join(" ")}`, run: () => selectMethod(method.id), icon: FlaskConical })),
    ...problems.map((problem) => ({ id: `problem-${problem.id}`, label: `科研问题：${problem.titleCn}`, group: "科研问题", keywords: `${problem.titleEn} ${problem.aliases.join(" ")} ${problem.keywords.join(" ")}`, run: () => selectProblem(problem.id), icon: SearchCheck })),
  ], [methods, problems, notify, selectMethod, selectProblem, setView]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands.slice(0, 12);
    return commands.filter((item) => `${item.label} ${item.keywords} ${item.group}`.toLowerCase().includes(normalized)).slice(0, 14);
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      if (!methods.length) void import("../data/methods").then((module) => setMethods(module.methodConcepts));
      if (!problems.length) {
        const seeded = useAppStore.getState().problemCards;
        setProblems(seeded);
      }
      setQuery("");
      setActive(0);
      window.setTimeout(() => input.current?.focus(), 0);
    }
  }, [methods.length, open, problems.length]);

  useEffect(() => { setActive(0); }, [query]);

  if (!open) return null;
  const execute = (command?: PaletteCommand) => {
    if (!command) return;
    command.run();
    setOpen(false);
  };
  return (
    <div className="overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="命令面板">
        <label className="palette-input"><Search size={17} /><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入命令或方法…" onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(filtered.length - 1, value + 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(0, value - 1)); }
          if (event.key === "Enter") { event.preventDefault(); execute(filtered[active]); }
          if (event.key === "Escape") setOpen(false);
        }} /></label>
        <div className="palette-results">
          {filtered.length === 0 && <div className="empty-inline">没有匹配的命令。</div>}
          {filtered.map((item, index) => {
            const Icon = item.icon;
            return <button key={item.id} className={index === active ? "active" : ""} onMouseEnter={() => setActive(index)} onClick={() => execute(item)}><Icon size={15} /><span>{item.label}</span><small>{item.group}</small></button>;
          })}
        </div>
        <footer><span><kbd>↑↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span></footer>
      </section>
    </div>
  );
}
