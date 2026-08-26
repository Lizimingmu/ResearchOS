import { useMemo, useState } from "react";
import { Archive, BookOpenCheck, FilePlus2, History, Inbox, Library, ShieldAlert } from "lucide-react";
import type { ContentKind, ContentLifecycle, ScientificRisk } from "../../domain/contentStudio";
import { buildBaseContentInventory } from "../../services/contentInventory";
import { resolveEffectiveContent } from "../../services/contentStudio";
import { useAppStore } from "../../state/store";

type Tab = "library" | "drafts" | "review" | "outbox" | "history" | "conflicts";
const tabs: Array<{ id: Tab; label: string; icon: typeof Library }> = [
  { id: "library", label: "内容库", icon: Library }, { id: "drafts", label: "草稿", icon: FilePlus2 },
  { id: "review", label: "待审核", icon: BookOpenCheck }, { id: "outbox", label: "发布箱", icon: Inbox },
  { id: "history", label: "版本历史", icon: History }, { id: "conflicts", label: "冲突", icon: ShieldAlert },
];
const kindLabels: Record<ContentKind,string> = { "evidence-source":"证据来源", "evidence-claim":"证据主张", method:"方法", pattern:"论文模式", "judgment-card":"判断卡", "audit-case":"审稿案例", "problem-card":"问题卡" };
const lifecycleLabels: Record<ContentLifecycle,string> = { draft:"草稿", pending_review:"待审核", active:"已启用", archived:"已归档", deprecated:"已弃用", superseded:"已取代" };

export function ContentStudioView() {
  const [tab,setTab] = useState<Tab>("library");
  const [creating,setCreating] = useState(false);
  const [title,setTitle] = useState("");
  const [kind,setKind] = useState<ContentKind>("method");
  const [risk,setRisk] = useState<ScientificRisk>("HIGH");
  const personal = useAppStore((state) => state.personalContent);
  const history = useAppStore((state) => state.contentRevisionHistory);
  const conflicts = useAppStore((state) => state.contentConflicts);
  const batches = useAppStore((state) => state.obsidianPublishBatches);
  const createDraft = useAppStore((state) => state.createPersonalDraft);
  const setLifecycle = useAppStore((state) => state.setPersonalLifecycle);
  const notify = useAppStore((state) => state.notify);
  const base = useMemo(() => buildBaseContentInventory(), []);
  const effective = useMemo(() => resolveEffectiveContent(base,personal), [base,personal]);
  const visiblePersonal = tab === "drafts" ? personal.filter((item) => item.lifecycle === "draft") : tab === "review" ? personal.filter((item) => item.lifecycle === "pending_review") : personal;

  const submit = () => {
    const clean = title.trim();
    if (!clean) return;
    const id = `personal-${kind}-${Date.now().toString(36)}`;
    createDraft({ id,kind,title:clean,risk,payload:{ id,title:clean,contentOrigin:"user",verificationStatus:"pending" } });
    setTitle(""); setCreating(false); setTab("drafts"); notify("草稿已保存；尚未进入学习、搜索或 Obsidian。","success");
  };

  return <div className="page content-studio-page">
    <header className="page-header"><div><span className="eyebrow">个人内容维护</span><h1>内容工作台</h1><p>ResearchOS 保存主版本；只有明确确认的批次才会写入 Obsidian。</p></div><button className="primary" onClick={() => setCreating((value) => !value)}><FilePlus2 size={14}/> 新建草稿</button></header>
    <div className="studio-tabs" role="tablist" aria-label="内容工作台视图">{tabs.map((item) => { const Icon=item.icon; return <button key={item.id} role="tab" aria-selected={tab===item.id} className={tab===item.id?"active":""} onClick={() => setTab(item.id)}><Icon size={14}/>{item.label}</button>; })}</div>
    {creating && <section className="studio-editor"><h2>新建个人内容</h2><div className="form-grid three"><label>类型<select value={kind} onChange={(event) => setKind(event.target.value as ContentKind)}>{Object.entries(kindLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>科研风险<select value={risk} onChange={(event) => setRisk(event.target.value as ScientificRisk)}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label><label>标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="输入清晰、稳定的标题"/></label></div><div className="settings-actions"><button className="primary" disabled={!title.trim()} onClick={submit}>保存为草稿</button><span>草稿默认待核验且不进入训练。</span></div></section>}
    {tab === "library" && <section><div className="section-title"><h2>有效内容</h2><span>{effective.length} 项（内置基线 + 已启用个人覆盖）</span></div><div className="studio-list">{effective.slice(0,80).map((item) => <article key={item.key}><div><strong>{item.title}</strong><small>{kindLabels[item.kind]} · r{item.revision} · {item.owner === "builtin"?"内置只读":"个人覆盖"}</small></div><span className={`status-badge ${item.verificationStatus}`}>{item.verificationStatus === "verified"?"已核验":"待核验"}</span></article>)}</div></section>}
    {(tab === "drafts" || tab === "review") && <section><div className="section-title"><h2>{tab === "drafts"?"草稿":"待审核"}</h2><span>{visiblePersonal.length} 项</span></div>{visiblePersonal.length === 0 ? <div className="empty-state"><p>这里还没有内容。</p></div> : <div className="studio-list">{visiblePersonal.map((item) => <article key={`${item.kind}:${item.id}`}><div><strong>{item.title}</strong><small>{kindLabels[item.kind]} · {lifecycleLabels[item.lifecycle]} · {item.risk} · {item.verificationStatus === "verified"?"已核验":"待核验"}</small></div><div className="row-actions">{item.lifecycle === "draft" && <button onClick={() => setLifecycle(item.id,"pending_review")}>提交审核</button>}{item.lifecycle === "pending_review" && <button onClick={() => setLifecycle(item.id,"active",true)}>私人启用（仍待核验）</button>}<button onClick={() => setLifecycle(item.id,"archived")}><Archive size={13}/>归档</button></div></article>)}</div>}</section>}
    {tab === "outbox" && <section><div className="section-title"><h2>Obsidian 发布箱</h2><span>{batches.length} 个批次</span></div><div className="setting-note"><ShieldAlert size={15}/><p>连接、预览或取消都不会写文件。只有列出精确路径并确认批次后才会执行原子写入。</p></div></section>}
    {tab === "history" && <section><div className="section-title"><h2>版本历史</h2><span>{history.length} 个快照</span></div><div className="studio-list">{history.map((item) => <article key={item.id}><div><strong>{item.contentId}</strong><small>r{item.revision} · {item.reason}</small></div><code>{item.hash.slice(0,20)}…</code></article>)}</div></section>}
    {tab === "conflicts" && <section><div className="section-title"><h2>冲突</h2><span>{conflicts.filter((item) => item.status==="open").length} 个待处理</span></div>{conflicts.length === 0 ? <div className="empty-state"><p>当前没有冲突。基础内容与个人覆盖不会静默互相覆盖。</p></div> : <div className="studio-list">{conflicts.map((item) => <article key={item.id}><div><strong>{item.contentId}</strong><small>{item.detail}</small></div><span>{item.status}</span></article>)}</div>}</section>}
  </div>;
}
