import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Database } from "lucide-react";
import { summarizeSkills } from "../../learning/scoring";
import { useAppStore } from "../../state/store";

export function SkillMapView() {
  const evidence = useAppStore((state) => state.skillEvidence);
  const summaries = summarizeSkills(evidence);
  return (
    <div className="page skills-page">
      <header className="page-header">
        <div><span className="eyebrow">能力图谱</span><h1>证据加权的能力评估</h1><p>评分综合延迟提取、迁移、难度、信心校准和概念覆盖度。</p></div>
        <div className="evidence-count"><Database size={16} /><span>{evidence.length} 条观察</span></div>
      </header>
      <div className="skill-table">
        <div className="skill-table-head"><span>能力</span><span>等级</span><span>证据</span><span>趋势</span><span>近期薄弱概念</span></div>
        {summaries.map((skill) => {
          const Trend = skill.trend === "up" ? ArrowUpRight : skill.trend === "down" ? ArrowDownRight : ArrowRight;
          return (
            <article key={skill.id}>
              <div><strong>{skill.name}</strong>{skill.score === null ? <small>证据不足，暂不评分</small> : <div className="skill-meter"><i style={{ width: `${Math.round(skill.score * 100)}%` }} /><small>≈{Math.round(skill.score * 10) * 10}/100</small></div>}</div>
              <span className={`skill-band ${skill.band.replace(" ", "-")}`}>{skill.band}</span>
              <span>{skill.reliability}<small>{skill.evidenceCount} 条观察 · {skill.conceptCount} 个概念</small></span>
              <span><Trend size={15} /> {{ up: "上升", down: "下降", flat: "稳定", unknown: "未知" }[skill.trend]}<small>{skill.lastTestedAt ? `测试于 ${new Date(skill.lastTestedAt).toLocaleDateString("zh-CN")}` : "尚未测试"}</small></span>
              <span>{skill.recentWeakConcepts.length ? skill.recentWeakConcepts.join(", ") : "暂无证据支持的薄弱点"}</span>
            </article>
          );
        })}
      </div>
      <section className="skill-caution"><AlertTriangle size={16} /><div><strong>拒绝虚假精确</strong><p>至少有三条观察覆盖两个概念后才会显示评分。高信心错误会形成明确的错误观念证据，并提高复习优先级。</p></div></section>
    </div>
  );
}
