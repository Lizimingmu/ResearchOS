import { ArrowRight, CheckCircle2, Layers3, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../state/store";

export function Onboarding() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const correct = choice === 1;
  return <div className="onboarding-overlay">
    <section className="onboarding-card learning-onboarding">
      <div className="onboarding-progress"><i style={{ width: `${(step + 1) * 33.33}%` }} /></div>
      {step === 0 && <>
        <span className="eyebrow">5 分钟入门 · 不是功能导览</span>
        <h1>3 位患者，每人测了 2,000 个细胞：n 是 6,000 吗？</h1>
        <p>先别急着答。这个问题决定了单细胞、病理视野、类器官孔和重复测量研究中的不确定性应该怎样计算。</p>
        <div className="onboarding-principles"><span><Lightbulb/> 先建立直觉</span><span><Layers3/> 再看数据层级</span><span><CheckCircle2/> 最后才做低压力自检</span></div>
        <button className="primary" onClick={() => setStep(1)}>先理解这个问题 <ArrowRight size={14}/></button>
      </>}
      {step === 1 && <>
        <span className="eyebrow">一句话直觉</span>
        <h1>n 不是表里有多少行。</h1>
        <p>n 要和你想推断的对象、独立采样或分配的层级对应。若目标是比较患者组，许多细胞可以让每位患者的测量更稳定，却不会把 3 位患者变成 6,000 位患者。</p>
        <div className="onboarding-levels"><div><strong>患者</strong><small>独立生物来源</small></div><span>→</span><div><strong>样本</strong><small>属于患者</small></div><span>→</span><div><strong>细胞</strong><small>嵌套测量</small></div></div>
        <button className="primary" onClick={() => setStep(2)}>用一个例子确认理解 <ArrowRight size={14}/></button>
      </>}
      {step === 2 && <>
        <span className="eyebrow">低压力自检</span>
        <h1>4 只小鼠/组，每只取 10 个视野。</h1>
        <p>若处理分配给小鼠，目标也是比较小鼠层效应，主要独立单位是什么？</p>
        <div className="choice-grid onboarding-quiz">
          {["80 个视野", "8 只小鼠", "视野中的所有细胞"].map((option, index) => <button key={option} className={choice === index ? "selected" : ""} onClick={() => setChoice(index)}>{option}</button>)}
        </div>
        {choice !== null && <div className={correct ? "onboarding-answer correct" : "onboarding-answer"}><strong>{correct ? "对：独立信息主要来自 8 只小鼠" : "再看一眼层级：处理是分配给小鼠的"}</strong><p>视野增加小鼠内测量精度，但共享同一只小鼠的视野不能无条件当成独立小鼠。</p></div>}
        <button className="primary" disabled={!correct} onClick={() => completeOnboarding([], {})}>进入学习路径 <ArrowRight size={14}/></button>
      </>}
    </section>
  </div>;
}
