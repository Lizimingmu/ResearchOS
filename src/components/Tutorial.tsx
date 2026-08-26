import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Lock, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FailureLayer } from "../domain/problemAtlas";
import { diagnosticEvidence, diagnosticPaths, problemAtlasClaims, problemAtlasSources, problemCards, problemTrainingCases } from "../data/problemAtlas";
import { createDiagnosticSession, gradeSession, lockSessionStep } from "../problem-atlas/diagnosticEngine";
import { layerLabel, tierLabel } from "../problem-atlas/labels";
import { useAppStore } from "../state/store";

export const TUTORIAL_STEPS = ["today", "atlas", "evidence", "human-first", "review"] as const;
export type TutorialStepId = (typeof TUTORIAL_STEPS)[number];
export const TUTORIAL_STEP_LABELS: Record<TutorialStepId, string> = {
  today: "今日学习",
  atlas: "科研常见问题库",
  evidence: "待核验证据状态",
  "human-first": "先锁定再反馈",
  review: "复习与迁移",
};

export function tutorialStepFromKey(key: string, current: number, total: number): number | "close" | "none" {
  const normalized = key.toLowerCase();
  if (normalized === "arrowright" || normalized === "enter") return Math.min(current + 1, total - 1);
  if (normalized === "arrowleft" || normalized === "backspace") return Math.max(current - 1, 0);
  if (normalized === "escape") return "close";
  return "none";
}

const demoCard = problemCards[0];
const demoPath = diagnosticPaths.find((path) => path.id === demoCard.diagnosticPathId);
const demoQuickCase = problemTrainingCases.find((entry) => entry.problemId === demoCard.id && entry.mode === "quick");
const demoEvidence = diagnosticEvidence.filter((entry) => entry.problemId === demoCard.id);
const demoClaim = problemAtlasClaims.find((claim) => claim.id === demoCard.evidenceClaimIds[0]);
const demoSource = problemAtlasSources.find((source) => source.id === demoClaim?.sourceId);
const LAYERS: FailureLayer[] = ["sample", "experiment", "quantification", "statistics", "interpretation"];

function HumanFirstPreview() {
  const [session, setSession] = useState(() => createDiagnosticSession("tutorial-preview", demoCard.id, "quick", new Date(0)));
  const locked = session.steps.some((step) => step.kind === "layer");
  const grade = useMemo(() => {
    if (!demoPath || !demoQuickCase) return { score: 0, feedback: [], completed: false };
    return gradeSession(session, demoCard, demoPath, demoQuickCase, demoEvidence);
  }, [session]);
  const lockPreview = (layer: FailureLayer) => {
    const result = lockSessionStep(session, { stepId: "quick-layer", kind: "layer", mode: "quick", payload: { layer, rationale: "教程预览作答（隔离预览状态）。" } }, new Date(0));
    setSession(result.session);
  };
  return (
    <div className="tutorial-preview">
      <p>先独立判断：这个故障最可能属于哪一层？选择后锁定，再看反馈。</p>
      <div className="tutorial-layer-picker">
        {LAYERS.map((layer) => (
          <button key={layer} disabled={locked} onClick={() => lockPreview(layer)}><Lock size={12} /> {layerLabel(layer)}</button>
        ))}
      </div>
      {locked ? (
        <div className="tutorial-feedback">
          <span className="eyebrow">锁定后反馈（演示）</span>
          {grade.feedback.map((item) => <p key={item}>{item}</p>)}
        </div>
      ) : (
        <p className="tutorial-note">在真实训练中，反馈只会在锁定后出现；本题仅作预览，不会写入任何学习记录。</p>
      )}
    </div>
  );
}

export function Tutorial({ forceOpen, initialStep = 0 }: { forceOpen?: boolean; initialStep?: number } = {}) {
  const storeOpen = useAppStore((state) => state.tutorialOpen);
  const open = forceOpen ?? storeOpen;
  const skipTutorial = useAppStore((state) => state.skipTutorial);
  const completeTutorial = useAppStore((state) => state.completeTutorial);
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 0), TUTORIAL_STEPS.length - 1));
  const panelRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  const launchRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open && !wasOpen.current) {
      launchRef.current = document.activeElement;
      setStep(0);
      window.requestAnimationFrame(() => panelRef.current?.focus());
    }
    if (!open && wasOpen.current) {
      const restore = launchRef.current;
      launchRef.current = null;
      if (restore instanceof HTMLElement) restore.focus();
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      if (key === "escape") {
        event.preventDefault();
        skipTutorial();
        return;
      }
      if (key === "enter" && target && ["BUTTON", "A", "SELECT", "TEXTAREA", "INPUT"].includes(target.tagName)) return;
      const next = tutorialStepFromKey(key, step, TUTORIAL_STEPS.length);
      if (next === "none" || next === "close") return;
      event.preventDefault();
      setStep(next);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, step, skipTutorial]);

  if (!open) return null;

  const renderStep = () => {
    switch (TUTORIAL_STEPS[step]) {
      case "today":
        return (
          <div className="tutorial-step">
            <span className="eyebrow">1 · 有界每日队列</span>
            <p>今日学习是一个有界的每日队列：一条最高优先级的到期/高风险提取复习槽位排在首位并受到保护，不会被任何新任务挤掉；其余到期项按权重进入后续调度，而不是各自占一张卡片。</p>
            <p>队列控制在约 30–50 分钟：提取 → 论文 → 方法 → AI 审查 → 问题 → 迁移，问题任务每天最多一个新。</p>
            <p className="tutorial-note">ResearchOS 不是聊天框；训练的是科研判断，而不是提示词。</p>
          </div>
        );
      case "atlas":
        return (
          <div className="tutorial-step">
            <span className="eyebrow">2 · 科研常见问题库</span>
            <p>在问题图谱中通过中文、英文、缩写或别名确定性地找到问题。示例（演示内容，待核验）：</p>
            <div className="tutorial-card-preview">
              <strong>{demoCard.titleCn}</strong>
              <small>{demoCard.titleEn} · {demoCard.aliases.slice(0, 3).join(" / ")}</small>
              <em className="atlas-badge badge-verification-pending">待核验</em>
            </div>
            <p><Search size={13} /> 搜索没有结果时不会生成答案，只会给出相关概念并记录未匹配查询。</p>
          </div>
        );
      case "evidence":
        return (
          <div className="tutorial-step">
            <span className="eyebrow">3 · 待核验证据状态</span>
            <p>演示主张都显示为“待核验”，支持关系标注为拟议（例如“拟直接支持 · 待核验”）：</p>
            <div className="tutorial-claim-preview">
              <p>{demoClaim?.claim}</p>
              <span className="stage-kicker">
                <em className="atlas-badge badge-support">拟{demoClaim?.supportType === "direct" ? "直接支持" : "限定支持"} · 待核验</em>
                {demoSource ? <em className={`atlas-badge badge-tier-${demoSource.authorityTier}`}>{tierLabel(demoSource.authorityTier)} · Tier {demoSource.authorityTier}</em> : null}
              </span>
            </div>
            <p><ShieldCheck size={13} /> 标识符（DOI/PMID）解析只证明来源存在，不等于主张被证实；徽章不是证据。</p>
          </div>
        );
      case "human-first":
        return (
          <div className="tutorial-step">
            <span className="eyebrow">4 · 先锁定，再反馈</span>
            <HumanFirstPreview />
          </div>
        );
      case "review":
        return (
          <div className="tutorial-step">
            <span className="eyebrow">5 · 复习与迁移</span>
            <p>错误且高信心的作答会形成明确的错误观念，并安排次日陌生变式复习；只有正确完成变式才能解除。</p>
            <p>变式跨领域迁移（例如 细胞 → 空间斑点 → 类器官孔 → 病理 ROI），训练的是原则而不是原文复述。</p>
            <p className="tutorial-note">技能地图依据作答准确性、信息选择质量与校准评分，而不是浏览次数。</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="tutorial-panel" ref={panelRef} tabIndex={-1} role="dialog" aria-modal="false" aria-label="新手教程">
      <header className="tutorial-header">
        <span className="eyebrow"><GraduationCap size={13} /> 新手教程 · 第 {step + 1} / {TUTORIAL_STEPS.length} 步</span>
        <span className="tutorial-duration">约 5 分钟</span>
        <button className="tutorial-close" onClick={skipTutorial} aria-label="跳过并关闭教程"><X size={14} /></button>
      </header>
      <ol className="tutorial-step-list">
        {TUTORIAL_STEPS.map((id, index) => (
          <li key={id} className={index === step ? "active" : index < step ? "done" : ""}>{TUTORIAL_STEP_LABELS[id]}</li>
        ))}
      </ol>
      <div className="tutorial-body">{renderStep()}</div>
      <footer className="tutorial-footer">
        <button className="tutorial-skip" onClick={skipTutorial}>跳过教程</button>
        <span className="tutorial-spacer" />
        <button disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}><ArrowLeft size={14} /> 上一步</button>
        {step < TUTORIAL_STEPS.length - 1
          ? <button className="primary" onClick={() => setStep(step + 1)}>下一步 <ArrowRight size={14} /></button>
          : <button className="primary" onClick={completeTutorial}><CheckCircle2 size={14} /> 完成</button>}
      </footer>
      <p className="tutorial-note">键盘：← 上一步 · → / Enter 下一步 · Esc 跳过。教程练习运行在隔离预览状态，不会写入任何学习记录。</p>
    </section>
  );
}
