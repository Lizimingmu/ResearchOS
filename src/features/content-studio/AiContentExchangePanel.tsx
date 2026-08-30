import { useMemo, useState } from "react";
import { CheckCircle2, Clipboard, FileInput, ShieldCheck, Sparkles } from "lucide-react";
import type { PersonalContentEntry, PortableContentRecord } from "../../domain/contentStudio";
import { buildBaseContentInventory } from "../../services/contentInventory";
import { buildLearningAuditPrompt, buildLearningGenerationPrompt, parseLearningContentPackJson, type LearningPackDryRun } from "../../services/learningContentExchange";
import { contentKey } from "../../services/contentStudio";
import { useAppStore } from "../../state/store";

const personalRecord = (entry: PersonalContentEntry): PortableContentRecord => ({
  key: entry.baseKey ?? contentKey(entry.kind, entry.id), id: entry.id, kind: entry.kind, title: entry.title,
  owner: entry.baseKey ? "overlay" : "personal", revision: entry.revision, hash: entry.hash,
  contentOrigin: entry.contentOrigin, verificationStatus: entry.verificationStatus, risk: entry.risk,
  dependencyKeys: [...entry.dependencyKeys], payload: structuredClone(entry.payload),
});

async function copyText(text: string): Promise<void> {
  if (!text) return;
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("系统剪贴板不可用，请从文本框手动复制");
}

export function AiContentExchangePanel() {
  const personal = useAppStore((state) => state.personalContent);
  const createDraft = useAppStore((state) => state.createPersonalDraft);
  const ensureOverlay = useAppStore((state) => state.ensurePersonalOverlay);
  const notify = useAppStore((state) => state.notify);
  const base = useMemo(() => buildBaseContentInventory(), []);
  const auditable = useMemo(() => [...base.filter((item) => item.kind === "learning-unit"), ...personal.map(personalRecord)], [base, personal]);
  const auditOptions = useMemo(() => auditable.map((item) => ({ selectionId: `${item.owner}:${item.id}:${item.key}`, item })), [auditable]);
  const [topic, setTopic] = useState("医学科研中的统计单位");
  const [objective, setObjective] = useState("能区分观察单位、实验单位与统计单位，并在嵌套数据中说明 n 和结论边界");
  const [prompt, setPrompt] = useState("");
  const [packText, setPackText] = useState("");
  const [dryRun, setDryRun] = useState<LearningPackDryRun | null>(null);
  const [auditSelection, setAuditSelection] = useState(auditOptions[0]?.selectionId ?? "");
  const [auditPrompt, setAuditPrompt] = useState("");

  const generate = () => setPrompt(buildLearningGenerationPrompt({ topic, objective }));
  const preview = () => setDryRun(parseLearningContentPackJson(packText));
  const importPack = () => {
    const report = parseLearningContentPackJson(packText);
    setDryRun(report);
    if (!report.ok || !report.normalizedPack) return;
    const unit = report.normalizedPack.unit;
    const id = `ai-${unit.id}-${Date.now().toString(36)}`;
    try {
      createDraft({
        id,
        kind: "learning-unit",
        title: unit.titleCn,
        risk: unit.scientificRisk,
        contentOrigin: "ai_generated",
        dependencyKeys: unit.evidenceSourceIds.map((sourceId) => contentKey("evidence-source", sourceId)),
        payload: { ...unit, exchangePackageId: report.normalizedPack.packageId, evidenceNotes: report.normalizedPack.evidenceNotes, authorNotes: report.normalizedPack.authorNotes },
      });
      notify("学习内容包已作为 AI 草稿导入；状态保持待核验，不会进入 Today。", "success");
      setPackText(""); setDryRun(null);
    } catch (error) { notify(`导入失败，内容未变化：${String(error)}`, "error"); }
  };
  const prepareAudit = () => {
    const record = auditOptions.find((item) => item.selectionId === auditSelection)?.item;
    if (!record) return;
    try {
      const target = record.owner === "builtin" ? personalRecord(ensureOverlay(record)) : record;
      setAuditPrompt(buildLearningAuditPrompt(target));
      notify(record.owner === "builtin" ? "已建立只读基线的个人修订 overlay；审计补丁将只修改个人版本。" : "审计提示词已生成。", "info");
    } catch (error) { notify(`无法准备审计：${String(error)}`, "error"); }
  };

  return <div className="ai-exchange-grid">
    <section className="studio-editor">
      <span className="eyebrow">外部 AI · 内容生成</span><h2>生成可复制的结构化任务</h2>
      <p>ResearchOS 不自动调用外部模型。你明确复制提示词，外部 AI 只返回内容包；导入后仍是待核验草稿。</p>
      <div className="form-grid two"><label>主题<input value={topic} onChange={(event) => setTopic(event.target.value)} /></label><label>学习目标<input value={objective} onChange={(event) => setObjective(event.target.value)} /></label></div>
      <div className="settings-actions"><button className="primary" onClick={generate}><Sparkles size={14}/> 生成提示词</button>{prompt && <button onClick={() => void copyText(prompt).then(() => notify("提示词已复制。", "success"))}><Clipboard size={14}/> 复制给外部 AI</button>}</div>
      {prompt && <label className="studio-payload">可复制提示词<textarea rows={12} readOnly value={prompt} /></label>}
    </section>

    <section className="studio-editor">
      <span className="eyebrow">安全导入 · 默认 pending</span><h2>粘贴 Learning Content Pack</h2>
      <p>先做确定性 dry-run。任何 AI 声称的 verified/active 都会被强制降级；导入不等于科学批准。</p>
      <label className="studio-payload">内容包 JSON<textarea rows={12} value={packText} onChange={(event) => { setPackText(event.target.value); setDryRun(null); }} placeholder='{"schemaVersion":1,"packageId":"lcp-…","unit":{…}}' spellCheck={false}/></label>
      <div className="settings-actions"><button disabled={!packText.trim()} onClick={preview}><ShieldCheck size={14}/> Dry-run</button><button className="primary" disabled={!dryRun?.ok} onClick={importPack}><FileInput size={14}/> 导入为待核验草稿</button></div>
      {dryRun && <div className={dryRun.ok ? "exchange-report ok" : "exchange-report"}><strong>{dryRun.ok ? <><CheckCircle2 size={14}/> 结构可导入</> : "结构被拒绝"}</strong>{dryRun.normalizedPack && <p>预览：{dryRun.normalizedPack.unit.titleCn} · {dryRun.normalizedPack.unit.estimatedMinutes} 分钟 · {dryRun.normalizedPack.unit.blocks.length} 个教学块 · {dryRun.normalizedPack.evidenceNotes.length} 条 evidence note</p>}{dryRun.errors.map((item) => <p key={item}>错误：{item}</p>)}{dryRun.warnings.map((item) => <p key={item}>提示：{item}</p>)}</div>}
    </section>

    <section className="studio-editor ai-audit-builder">
      <span className="eyebrow">旧内容也能拿出去审计</span><h2>生成内部内容审计提示词</h2>
      <p>选择内置或个人内容。内置内容会先建立个人 overlay，外部 AI 返回标准 patch；之后在“版本历史”中预览字段 diff，再决定是否应用。</p>
      <div className="form-grid two"><label>审计对象<select value={auditSelection} onChange={(event) => setAuditSelection(event.target.value)}>{auditOptions.map(({ selectionId, item }) => <option key={selectionId} value={selectionId}>{item.title} · {item.owner === "builtin" ? "内置" : "个人"} · r{item.revision}</option>)}</select></label><label>&nbsp;</label></div>
      <div className="settings-actions"><button className="primary" disabled={!auditSelection} onClick={prepareAudit}>建立可修订目标并生成审计提示词</button>{auditPrompt && <button onClick={() => void copyText(auditPrompt).then(() => notify("审计提示词已复制。", "success"))}><Clipboard size={14}/> 复制审计提示词</button>}</div>
      {auditPrompt && <label className="studio-payload">审计提示词<textarea rows={12} readOnly value={auditPrompt}/></label>}
    </section>
  </div>;
}
