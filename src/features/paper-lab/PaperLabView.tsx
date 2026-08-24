import { BookOpen, ChevronRight, FileText, GitCompare, ListChecks, Scale, ScanSearch, Swords, WandSparkles } from "lucide-react";
import { useState } from "react";
import { AttemptFlow } from "../../components/AttemptFlow";
import { PdfViewer } from "../../components/PdfViewer";
import { researchPatterns } from "../../data/patterns";
import { useAppStore } from "../../state/store";
import { verificationLabel } from "../../app/localization";

const modes = [
  { id: "prediction", label: "图表预测", icon: ChevronRight, prompt: "说明核心科学问题、当前图表承担的证据任务，以及下一个尚未解决的问题。", transfer: "在你自己的论文中，下一步需要补充哪项证据？" },
  { id: "skeleton", label: "论文骨架", icon: ListChecks, prompt: "用一句证据功能描述分别重建图 1→5，不要描述图表类型。", transfer: "为你当前的稿件写出五步功能骨架。" },
  { id: "ladder", label: "证据阶梯", icon: Scale, prompt: "把中心主张放到证据阶梯上，并说明最大可接受结论。", transfer: "你项目的中心主张位于证据阶梯的哪一级？" },
  { id: "reviewer", label: "审稿人攻击", icon: Swords, prompt: "写出三项主要问题、两项次要问题，并给出接受/小修/大修/拒稿建议。", transfer: "本周你的项目最能落实哪一项审稿意见？" },
  { id: "reconstruct", label: "图表重建", icon: ScanSearch, prompt: "不依赖图注，推断暴露、结局、统计单位、视觉编码、允许的结论和可能的过度主张。", transfer: "审查你的一张图所采用的统计单位和结论边界。" },
  { id: "compare", label: "论文比较", icon: GitCompare, prompt: "比较科学问题、队列、组学深度、验证、因果性、可推广性、图表架构和预期期刊层级。", transfer: "指出一项值得你项目借鉴的证据链差异。" },
  { id: "why-good", label: "好在哪里？", icon: WandSparkles, prompt: "哪张图提升了论文层次？哪张图在结构上不可缺少？哪项结果技术上亮眼但科学增量有限？", transfer: "找出必须提升稿件证据层级的那张图。" },
];

export function PaperLabView() {
  const papers = useAppStore((state) => state.papers);
  const selectedId = useAppStore((state) => state.selectedPaperId);
  const updatePaper = useAppStore((state) => state.updatePaper);
  const [modeId, setModeId] = useState("prediction");
  const [patternId, setPatternId] = useState("biomarker-discovery");
  const [comparisonId, setComparisonId] = useState(papers[1]?.id ?? papers[0]?.id);
  const paper = papers.find((item) => item.id === selectedId) ?? papers[0];
  const mode = modes.find((item) => item.id === modeId)!;
  const pattern = researchPatterns.find((item) => item.id === patternId)!;
  if (!paper) return <div className="page empty-state"><h2>暂无论文记录</h2><p>请先在文献库中导入 PDF 或添加元数据。</p></div>;

  const feedback = (
    <div className="senior-review">
      <div><span>正确目标</span><p>每张图都应承担证据任务，而不只是展示结果。证据链应从问题与发现，经过定位、验证和功能，最终到达边界恰当的结论。</p></div>
      <div><span>重点检查</span><p>区分测量单位与独立生物学单位。视觉上信息密集的图，可能仍然只提供描述性表达证据。</p></div>
      <div><span>主张边界</span><p>关联、空间邻近、扰动、挽救、体内效应和临床验证是不同阶梯。结论应止于实际展示的最强证据层级。</p></div>
      <div><span>模式参考 · {pattern.title.toUpperCase()}</span><ol>{pattern.evidenceChain.map((item) => <li key={item}>{item}</li>)}</ol></div>
      {modeId === "reviewer" && <div><span>严重程度分类</span><p>致命：独立单位无效或混杂无法恢复。补充分析：稳健性或敏感性。额外实验：功能证据缺口。次要：报告或呈现问题。</p></div>}
      {modeId === "compare" && <div><span>比较对象</span><p>{papers.find((item) => item.id === comparisonId)?.title ?? "请选择第二篇论文"}</p></div>}
    </div>
  );

  return (
    <div className="paper-lab-layout">
      <aside className="paper-lab-library">
        <div className="pane-heading"><span className="eyebrow">论文</span><small>{papers.length}</small></div>
        {papers.map((item) => <button key={item.id} className={item.id === paper.id ? "active" : ""} onClick={() => useAppStore.setState({ selectedPaperId: item.id })}><FileText size={14} /><span>{item.title}<small>{item.journal || "元数据待补充"} · {item.year || "—"}</small></span></button>)}
        <div className="pane-subheading">参考模式</div>
        <select value={patternId} onChange={(event) => setPatternId(event.target.value)}>{researchPatterns.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
        <div className="pattern-mini"><strong>典型证据链</strong>{pattern.evidenceChain.map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}</div>
      </aside>
      <section className="paper-document-pane">
        <header className="paper-document-title"><div><span className="eyebrow">PDF / 图表</span><strong>{paper.title}</strong></div><span className={`status-pill ${paper.verificationStatus}`}>{verificationLabel(paper.verificationStatus)}</span></header>
        <PdfViewer path={paper.pdfPath} currentPage={paper.currentPage} onPageChange={(currentPage) => updatePaper(paper.id, { currentPage })} />
        <div className="paper-note-strip"><BookOpen size={14} /><textarea rows={2} placeholder="与当前页面关联的工作笔记…" value={paper.notes} onChange={(event) => updatePaper(paper.id, { notes: event.target.value })} /></div>
      </section>
      <aside className="training-inspector">
        <div className="training-mode-tabs">{modes.map((item) => { const Icon = item.icon; return <button key={item.id} className={item.id === modeId ? "active" : ""} onClick={() => setModeId(item.id)} title={item.label}><Icon size={14} /><span>{item.label}</span></button>; })}</div>
        {modeId === "compare" && <label className="compare-picker">比较对象<select value={comparisonId} onChange={(event) => setComparisonId(event.target.value)}>{papers.filter((item) => item.id !== paper.id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
        <AttemptFlow
          key={`${paper.id}-${mode.id}`}
          taskId={`paper-${paper.id}-${mode.id}`}
          conceptId={`${paper.id}-${mode.id}`}
          conceptType="paper"
          skillId={modeId === "reviewer" ? "reasoning" : modeId === "why-good" ? "storytelling" : "patterns"}
          prompt={mode.prompt}
          feedback={feedback}
          feedbackText={`每张图都必须承担证据任务。参考模式 ${pattern.title}：${pattern.evidenceChain.join(" → ")}。区分独立单位，并把主张限制在已展示的最强证据层级。`}
          sourceIds={pattern.sourceIds}
          transferPrompt={mode.transfer}
          placeholder="打开图注或外部摘要前，先根据论文或图表独立作答…"
          difficulty={pattern.difficulty}
          variantPrompt={`使用“${pattern.title}”模式，在一篇陌生论文中重建相同的证据功能，再指出一项这些图表无法支持的主张。`}
        />
      </aside>
    </div>
  );
}
