import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { OnboardingState } from "../domain/types";
import { useAppStore } from "../state/store";

const focusAreas = ["临床推断", "统计学", "预测模型", "批量组学", "单细胞", "空间组学", "AI 监督"];
const familiarityAreas = ["methods", "omics", "prediction", "causal-inference"];

export function Onboarding() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [familiarity, setFamiliarity] = useState<OnboardingState["familiarity"]>({});
  const toggle = (value: string) => setInterests((items) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  return (
    <div className="onboarding-overlay">
      <section className="onboarding-card">
        <div className="onboarding-progress"><i style={{ width: `${(step + 1) * 33.33}%` }} /></div>
        {step === 0 && <><span className="eyebrow">RESEARCHOS · 使用引导</span><h1>训练科研判断，而不是练习聊天提示词。</h1><p>你需要先独立作出研究决策，再查看精选参考答案，校准自己的判断，随后通过延迟复习和真实项目迁移来巩固原则。</p><div className="onboarding-principles"><span><CheckCircle2 /> 首次作答锁定</span><span><ShieldCheck /> 证据与来源可追溯</span><span><ArrowRight /> 陌生情境迁移</span></div><button className="primary" onClick={() => setStep(1)}>选择关注方向 <ArrowRight size={14} /></button></>}
        {step === 1 && <><span className="eyebrow">关注方向</span><h1>你希望训练队列关注哪些研究工作？</h1><p>可选择一个或多个方向。之后系统会结合项目相关性和薄弱项证据进一步调整队列。</p><div className="choice-grid">{focusAreas.map((area) => <button key={area} className={interests.includes(area) ? "selected" : ""} onClick={() => toggle(area)}>{area}</button>)}</div><button className="primary" disabled={!interests.length} onClick={() => setStep(2)}>设置熟悉程度 <ArrowRight size={14} /></button></>}
        {step === 2 && <><span className="eyebrow">基线</span><h1>校准你的起点。</h1><p>熟悉程度只用于调整初始难度，不代表已经掌握。下一步将进入锁定答案的陌生情境基线盲测。</p><div className="familiarity-grid">{familiarityAreas.map((area) => <label key={area}><span>{{ methods: "研究方法", omics: "组学", prediction: "预测模型", "causal-inference": "因果推断" }[area]}</span><select value={familiarity[area] ?? "new"} onChange={(event) => setFamiliarity((value) => ({ ...value, [area]: event.target.value as OnboardingState["familiarity"][string] }))}><option value="new">初学</option><option value="working">具备工作知识</option><option value="experienced">经验丰富</option></select></label>)}</div><button className="primary" onClick={() => completeOnboarding(interests, familiarity)}>开始基线盲测 <ArrowRight size={14} /></button></>}
      </section>
    </div>
  );
}
