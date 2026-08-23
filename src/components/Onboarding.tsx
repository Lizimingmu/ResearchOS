import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { OnboardingState } from "../domain/types";
import { useAppStore } from "../state/store";

const focusAreas = ["Clinical inference", "Statistics", "Prediction models", "Bulk omics", "Single-cell", "Spatial omics", "AI oversight"];
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
        {step === 0 && <><span className="eyebrow">RESEARCHOS · ORIENTATION</span><h1>Practice judgment, not chat prompts.</h1><p>You will attempt a research decision before seeing a curated reference, classify your calibration, retrieve it later, and transfer the principle to a real project.</p><div className="onboarding-principles"><span><CheckCircle2 /> Locked first attempts</span><span><ShieldCheck /> Evidence and provenance</span><span><ArrowRight /> Unfamiliar transfer</span></div><button className="primary" onClick={() => setStep(1)}>Choose a focus <ArrowRight size={14} /></button></>}
        {step === 1 && <><span className="eyebrow">FOCUS</span><h1>What work should the scheduler recognize?</h1><p>Select one or more. Project relevance and weakness evidence will refine the queue later.</p><div className="choice-grid">{focusAreas.map((area) => <button key={area} className={interests.includes(area) ? "selected" : ""} onClick={() => toggle(area)}>{area}</button>)}</div><button className="primary" disabled={!interests.length} onClick={() => setStep(2)}>Set familiarity <ArrowRight size={14} /></button></>}
        {step === 2 && <><span className="eyebrow">BASELINE</span><h1>Calibrate the starting point.</h1><p>Familiarity only tunes initial difficulty; it never grants mastery. The next screen is a locked, unfamiliar baseline assessment.</p><div className="familiarity-grid">{familiarityAreas.map((area) => <label key={area}><span>{area}</span><select value={familiarity[area] ?? "new"} onChange={(event) => setFamiliarity((value) => ({ ...value, [area]: event.target.value as OnboardingState["familiarity"][string] }))}><option value="new">New</option><option value="working">Working knowledge</option><option value="experienced">Experienced</option></select></label>)}</div><button className="primary" onClick={() => completeOnboarding(interests, familiarity)}>Start blind baseline <ArrowRight size={14} /></button></>}
      </section>
    </div>
  );
}
