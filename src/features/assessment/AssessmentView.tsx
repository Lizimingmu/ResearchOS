import { ClipboardCheck, Lock, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { blindAssessmentPrompts } from "../../data/starterTrack";
import type { Confidence } from "../../domain/types";
import { makeId } from "../../lib/ids";
import { useAppStore } from "../../state/store";

const cases = [
  { id: "unfamiliar-oncology-omics-v1", text: "一项回顾性多中心肿瘤队列研究利用批量 RNA 测序（bulk RNA-seq）开发 42 基因复发模型。研究进行了特征选择、标准化和模型调参，并随机拆分患者。作者又在 4 个验证肿瘤中加入细胞层面的单细胞 RNA 测序（scRNA-seq）关联；AI 方案建议合并全部细胞进行差异表达（DEG），采用未经校正的 P<0.05 做 KEGG 富集，并据此提出因果机制。" },
  { id: "unfamiliar-diagnostic-ai-v1", text: "一个诊断影像模型使用某医院经手术证实的病例和健康对照进行训练。同一患者的多张图像可能进入不同数据拆分。报告仅给出曲线下面积（AUC），在测试集上选择阈值，并宣称模型可用于社区筛查。" },
  { id: "unfamiliar-spatial-causal-v1", text: "研究对 6 例治疗响应者和 6 例无响应者的肿瘤开展基于点位的空间转录组学，每位患者分析一个切片。AI 方案把点位当作独立重复，根据空间共定位推断配体—受体通讯，并声称该通路导致治疗响应。" },
];

const rubric = [
  ["研究问题", "明确目标人群、目标问题或估计目标（Estimand）、时间起点与结论尺度。"],
  ["研究设计", "在选择模型前识别设计错配、选择偏倚、数据泄漏和时间对齐风险。"],
  ["统计单位", "指出独立生物学单位（Biological Replicate），并正确处理嵌套或聚类结构。"],
  ["偏倚", "优先识别最可能逆转结论的偏倚，并指出缺失的关键假设。"],
  ["分析方法", "提出与设计、多重检验、缺失数据和不确定性相匹配的分析。"],
  ["AI 监督", "拒绝不安全的 AI 步骤，并要求生成内容保留证据与来源。"],
  ["结论边界", "给出不强于测量和研究设计实际支持的最大结论。"],
  ["科研迁移", "提出一个可迁移到其他项目的具体核查或流程修改动作。"],
] as const;

export function AssessmentView() {
  const history = useAppStore((state) => state.assessmentHistory);
  const addAssessment = useAppStore((state) => state.addAssessment);
  const updateAssessment = useAppStore((state) => state.updateAssessment);
  const notify = useAppStore((state) => state.notify);
  const active = history.find((item) => item.score === undefined && item.rubricVersion === "research-judgment-v1");
  const completed = history.filter((item) => item.score !== undefined);
  const baselineAvailable = !history.some((item) => item.kind === "baseline" && item.score !== undefined);
  const [assessmentKind] = useState<"baseline" | "blind">(active?.kind ?? (baselineAvailable ? "baseline" : "blind"));
  const baseline = assessmentKind === "baseline";
  const selectedCase = cases.find((item) => item.id === active?.sourceCase) ?? cases[baseline ? 0 : completed.length % cases.length];
  const [answers, setAnswers] = useState<Record<string, string>>(active?.answers ?? {});
  const [confidence, setConfidence] = useState<Confidence>(active?.confidence ?? 2);
  const [assessmentId, setAssessmentId] = useState(active?.id);
  const [ratings, setRatings] = useState<Record<string, number>>(active?.domainScores ?? {});
  const [finalized, setFinalized] = useState(Boolean(active?.score !== undefined));
  const locked = Boolean(assessmentId);
  const historySummary = useMemo(() => completed.slice(0, 3).map((item) => `${item.kind ?? "blind"}: ${Math.round(item.score ?? 0)}`).join(" · "), [completed]);

  const submit = () => {
    if (blindAssessmentPrompts.some((_prompt, index) => (answers[String(index)] ?? "").trim().length < 8)) { notify("锁定前请完成盲测的每一项作答。", "warning"); return; }
    const id = makeId("assessment");
    addAssessment({ id, createdAt: new Date().toISOString(), answers, confidence, sourceCase: selectedCase.id, kind: baseline ? "baseline" : "blind", rubricVersion: "research-judgment-v1" });
    setAssessmentId(id);
    notify("评估已锁定。请应用量规；仅仅完成作答不会提高掌握度。", "success");
  };

  const finalize = () => {
    if (!assessmentId || rubric.some(([key]) => ratings[key] === undefined)) { notify("完成前请评价量规的每个维度。", "warning"); return; }
    const domainScores = Object.fromEntries(rubric.map(([key]) => [key, ratings[key]]));
    const score = Object.values(domainScores).reduce((sum, value) => sum + value, 0) / (rubric.length * 2) * 100;
    updateAssessment(assessmentId, { domainScores, score, kind: baseline ? "baseline" : "blind" });
    setFinalized(true);
    notify("量规结果已保存，可用于纵向比较。系统未自动添加任何掌握度证据。", "success");
  };

  return (
    <div className="page assessment-page">
      <header className="page-header"><div><span className="eyebrow">{baseline ? "基线盲测" : "盲测评估"}</span><h1>独立审查陌生案例</h1><p>提交前不会显示来源提示、量规或专家答案。</p></div><div className="assessment-history"><ClipboardCheck size={16} /><span>已完成 {completed.length} 次<small>{historySummary || "暂无纵向评分"}</small></span></div></header>
      <section className="assessment-case"><span>CASE · {selectedCase.id}</span><p>{selectedCase.text}</p></section>
      <div className="assessment-form">{blindAssessmentPrompts.map((prompt, index) => <label key={prompt}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{prompt}</strong><textarea disabled={locked} rows={3} value={answers[String(index)] ?? ""} onChange={(event) => setAnswers((value) => ({ ...value, [String(index)]: event.target.value }))} /></div></label>)}</div>
      <div className="assessment-submit"><label>总体信心<select disabled={locked} value={confidence} onChange={(event) => setConfidence(Number(event.target.value) as Confidence)}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><button className="primary" disabled={locked} onClick={submit}><Lock size={14} /> 锁定评估</button></div>
      {locked && <section className="assessment-rubric"><div className="stage-kicker"><span>量规 · research-judgment-v1</span><span><ShieldCheck size={12} /> 用于自我校准，不代表掌握</span></div>{rubric.map(([key, description]) => <div className="rubric-row" key={key}><div><strong>{key}</strong><p>{description}</p></div><div>{[0,1,2].map((value) => <button key={value} disabled={finalized} className={ratings[key] === value ? "selected" : ""} onClick={() => setRatings((current) => ({ ...current, [key]: value }))}>{value}<small>{value === 0 ? "遗漏" : value === 1 ? "部分支持" : "有充分支持"}</small></button>)}</div></div>)}<button className="primary" disabled={finalized} onClick={finalize}>{finalized ? "量规已保存" : "完成量规评分"}</button></section>}
    </div>
  );
}
