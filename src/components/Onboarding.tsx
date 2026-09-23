import { ArrowLeft, ArrowRight, BookOpen, Clock, Target } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../state/store";

const researchTypes = ["临床观察研究", "实验/动物研究", "组学与生物信息", "预测模型", "论文与课题设计"];
const gaps = ["科研问题与假设", "研究设计", "统计推断", "组学方法", "论文阅读", "AI 结果审查"];

export function Onboarding() {
  const complete = useAppStore((s) => s.completeOnboarding);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const startPilotSession = useAppStore((s) => s.startPilotSession);
  const [step, setStep] = useState(0);
  const [targetLevel, setTargetLevel] = useState<"foundation" | "working" | "independent">("working");
  const [types, setTypes] = useState<string[]>(["临床观察研究"]);
  const [foundationGaps, setGaps] = useState<string[]>(["科研问题与假设"]);
  const [minutes, setMinutes] = useState(30);
  const [allowProjectRelevance, setAllow] = useState(false);

  const toggle = (v: string, list: string[], set: (x: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const finish = () => {
    updateSettings({ dailyMinutes: minutes });
    complete(types, Object.fromEntries(foundationGaps.map((x) => [x, "new"])), {
      targetLevel,
      researchTypes: types,
      foundationGaps,
      allowProjectRelevance,
    });
  };

  const handleStartPilot = () => {
    updateSettings({ dailyMinutes: 30 });
    startPilotSession();
  };

  return (
    <div className="onboarding-overlay">
      <section className="onboarding-card apprenticeship-onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        {/* Pilot 1-Click Fast Start Entry */}
        <div className="pilot-onboarding-banner" style={{ margin: "0 0 16px", padding: "12px 16px", borderRadius: "8px", background: "var(--accent-soft)", border: "1px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} />
                <strong>ResearchOS Pilot · 试用模式</strong>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                先判断 → 学习 → 再判断 → 迁移（建议 30–45 分钟）
              </p>
            </div>
            <button className="primary" onClick={handleStartPilot} style={{ fontSize: "13px", padding: "6px 14px" }}>
              开始试用 (一键开始) <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="onboarding-progress" role="progressbar" aria-label="入门设置进度" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1}>
          <i style={{ width: `${(step + 1) * 20}%` }} />
        </div>
        {step === 0 && (
          <>
            <Target aria-hidden="true" />
            <span className="eyebrow">1 / 5 · 训练目标</span>
            <h1 id="onboarding-title">你希望训练到什么程度？</h1>
            <div className="choice-grid">
              {[
                ["foundation", "系统补齐基础"],
                ["working", "能独立推进常见科研步骤"],
                ["independent", "能审查复杂设计与 AI 建议"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  aria-pressed={targetLevel === v}
                  className={targetLevel === v ? "selected" : ""}
                  onClick={() => setTargetLevel(v as typeof targetLevel)}
                >
                  {l}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <span className="eyebrow">2 / 5 · 真实科研情境</span>
            <h1 id="onboarding-title">你目前主要做什么类型的科研？</h1>
            <div className="choice-grid">
              {researchTypes.map((x) => (
                <button
                  key={x}
                  aria-pressed={types.includes(x)}
                  className={types.includes(x) ? "selected" : ""}
                  onClick={() => toggle(x, types, setTypes)}
                >
                  {x}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <BookOpen aria-hidden="true" />
            <span className="eyebrow">3 / 5 · 基础缺口</span>
            <h1 id="onboarding-title">哪些基础你没有系统学过？</h1>
            <div className="choice-grid">
              {gaps.map((x) => (
                <button
                  key={x}
                  aria-pressed={foundationGaps.includes(x)}
                  className={foundationGaps.includes(x) ? "selected" : ""}
                  onClick={() => toggle(x, foundationGaps, setGaps)}
                >
                  {x}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <span className="eyebrow">4 / 5 · 每日投入</span>
            <h1 id="onboarding-title">每天愿意投入多少时间？</h1>
            <div className="choice-grid">
              {[10, 20, 30, 40].map((x) => (
                <button
                  key={x}
                  aria-pressed={minutes === x}
                  className={minutes === x ? "selected" : ""}
                  onClick={() => setMinutes(x)}
                >
                  {x} 分钟
                </button>
              ))}
            </div>
            <p>学习单元仍保持 8–12 分钟，同时最多两个 active learning threads。</p>
          </>
        )}
        {step === 4 && (
          <>
            <span className="eyebrow">5 / 5 · 项目相关性</span>
            <h1 id="onboarding-title">是否根据真实项目提高相关内容优先级？</h1>
            <div className="choice-grid">
              <button
                aria-pressed={allowProjectRelevance}
                className={allowProjectRelevance ? "selected" : ""}
                onClick={() => setAllow(true)}
              >
                允许，仅使用本地项目状态
              </button>
              <button
                aria-pressed={!allowProjectRelevance}
                className={!allowProjectRelevance ? "selected" : ""}
                onClick={() => setAllow(false)}
              >
                暂不使用项目相关性
              </button>
            </div>
            <blockquote>ResearchOS 会先教，再让你练，最后要求你把知识用到真实科研问题。</blockquote>
            <p>默认使用 Learning Mode；Challenge 只作为你主动选择的诊断快速通道。</p>
          </>
        )}
        <footer className="onboarding-actions">
          <button disabled={step === 0} onClick={() => setStep((x) => x - 1)}>
            <ArrowLeft aria-hidden="true" /> 上一步
          </button>
          {step < 4 ? (
            <button className="primary" onClick={() => setStep((x) => x + 1)}>
              下一步 <ArrowRight aria-hidden="true" />
            </button>
          ) : (
            <button className="primary" onClick={finish}>
              开始第一节 Guided Lesson <ArrowRight aria-hidden="true" />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
