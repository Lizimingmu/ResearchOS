import type { SkillEvidence } from "../domain/types";

export const topSkills = [
  { id: "literature", name: "文献版图认知（Literature Landscape）" },
  { id: "patterns", name: "论文范式识别（Paper Pattern Recognition）" },
  { id: "reasoning", name: "科学推理（Scientific Reasoning）" },
  { id: "methods", name: "方法学与统计（Methods & Statistics）" },
  { id: "omics", name: "组学分析能力（Omics Literacy）" },
  { id: "storytelling", name: "科研叙事（Scientific Storytelling）" },
  { id: "ai-oversight", name: "AI 科研监督（AI Oversight）" },
  { id: "troubleshooting", name: "问题排查（Troubleshooting）" },
  { id: "failure-recognition", name: "失败模式识别（Failure-mode Recognition）" },
  { id: "scientific-diagnosis", name: "科学诊断（Scientific Diagnosis）" },
  { id: "evidence-discrimination", name: "证据鉴别（Evidence Discrimination）" },
  { id: "claim-calibration", name: "结论校准（Claim Calibration）" },
] as const;

export interface SkillSummary {
  id: string;
  name: string;
  band: "insufficient evidence" | "developing" | "functional" | "strong";
  score: number | null;
  evidenceCount: number;
  conceptCount: number;
  reliability: "low" | "moderate" | "substantial";
  lastTestedAt?: string;
  trend: "up" | "flat" | "down" | "unknown";
  recentWeakConcepts: string[];
}

export function summarizeSkills(evidence: SkillEvidence[]): SkillSummary[] {
  return topSkills.map((skill) => {
    const rows = evidence.filter((row) => row.skillId === skill.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const conceptCount = new Set(rows.map((row) => row.conceptId ?? row.taskId)).size;
    const reliability = rows.length < 4 || conceptCount < 2 ? "low" : rows.length < 10 || conceptCount < 4 ? "moderate" : "substantial";
    const shared = { conceptCount, reliability, lastTestedAt: rows.at(-1)?.createdAt } as const;
    if (rows.length < 3 || conceptCount < 2) return { ...skill, ...shared, band: "insufficient evidence", score: null, evidenceCount: rows.length, trend: "unknown", recentWeakConcepts: rows.filter((row) => row.score < 0.7).slice(-3).map((row) => row.taskId) };
    const weighted = rows.reduce((sum, row, index) => {
      const recency = 0.7 + 0.3 * ((index + 1) / rows.length);
      const transfer = row.blindTransfer ? 1.15 : 1;
      const delayed = row.delayed ? 1.1 : 1;
      const calibrationPenalty = row.score < 0.5 && row.confidence >= 3 ? 0.72 : 1;
      const difficulty = row.difficulty === "frontier" ? 1.15 : row.difficulty === "advanced" ? 1.08 : row.difficulty === "foundation" ? 0.95 : 1;
      const misconceptionPenalty = row.misconceptionId && row.score < 0.75 ? 0.85 : 1;
      return sum + row.score * recency * transfer * delayed * difficulty * calibrationPenalty * misconceptionPenalty;
    }, 0);
    const denominator = rows.reduce((sum, _row, index) => sum + 0.7 + 0.3 * ((index + 1) / rows.length), 0);
    const score = Math.max(0, Math.min(1, weighted / denominator));
    const recent = rows.slice(-Math.min(4, rows.length));
    const earlier = rows.slice(0, Math.min(4, rows.length));
    const recentMean = recent.reduce((sum, row) => sum + row.score, 0) / recent.length;
    const earlierMean = earlier.reduce((sum, row) => sum + row.score, 0) / earlier.length;
    const trend = recentMean > earlierMean + 0.08 ? "up" : recentMean < earlierMean - 0.08 ? "down" : "flat";
    const band = score < 0.55 ? "developing" : score < 0.78 ? "functional" : "strong";
    return { ...skill, ...shared, band, score, evidenceCount: rows.length, trend, recentWeakConcepts: rows.filter((row) => row.score < 0.7).slice(-3).map((row) => row.taskId) };
  });
}
