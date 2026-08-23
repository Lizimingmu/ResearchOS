import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Database } from "lucide-react";
import { summarizeSkills } from "../../learning/scoring";
import { useAppStore } from "../../state/store";

export function SkillMapView() {
  const evidence = useAppStore((state) => state.skillEvidence);
  const summaries = summarizeSkills(evidence);
  return (
    <div className="page skills-page">
      <header className="page-header">
        <div><span className="eyebrow">SKILL MAP</span><h1>Evidence-weighted capability</h1><p>Scores combine retrieval delay, transfer, difficulty, confidence calibration, and concept coverage.</p></div>
        <div className="evidence-count"><Database size={16} /><span>{evidence.length} observations</span></div>
      </header>
      <div className="skill-table">
        <div className="skill-table-head"><span>Capability</span><span>Band</span><span>Evidence</span><span>Trend</span><span>Recent weak concepts</span></div>
        {summaries.map((skill) => {
          const Trend = skill.trend === "up" ? ArrowUpRight : skill.trend === "down" ? ArrowDownRight : ArrowRight;
          return (
            <article key={skill.id}>
              <div><strong>{skill.name}</strong>{skill.score === null ? <small>Score withheld</small> : <div className="skill-meter"><i style={{ width: `${Math.round(skill.score * 100)}%` }} /><small>≈{Math.round(skill.score * 10) * 10}/100</small></div>}</div>
              <span className={`skill-band ${skill.band.replace(" ", "-")}`}>{skill.band}</span>
              <span>{skill.reliability}<small>{skill.evidenceCount} observations · {skill.conceptCount} concepts</small></span>
              <span><Trend size={15} /> {skill.trend}<small>{skill.lastTestedAt ? `tested ${new Date(skill.lastTestedAt).toLocaleDateString()}` : "not tested"}</small></span>
              <span>{skill.recentWeakConcepts.length ? skill.recentWeakConcepts.join(", ") : "No supported weak point yet"}</span>
            </article>
          );
        })}
      </div>
      <section className="skill-caution"><AlertTriangle size={16} /><div><strong>No false precision</strong><p>A score is withheld until at least three observations cover two concepts. High-confidence errors create explicit misconception evidence and raise review priority.</p></div></section>
    </div>
  );
}
