import type { SkillEvidence } from "../domain/types";

export const topSkills = [
  { id: "literature", name: "Literature Landscape" },
  { id: "patterns", name: "Paper Pattern Recognition" },
  { id: "reasoning", name: "Scientific Reasoning" },
  { id: "methods", name: "Methods & Statistics" },
  { id: "omics", name: "Omics Literacy" },
  { id: "storytelling", name: "Scientific Storytelling" },
  { id: "ai-oversight", name: "AI Oversight" },
] as const;

export interface SkillSummary {
  id: string;
  name: string;
  band: "insufficient evidence" | "developing" | "functional" | "strong";
  score: number | null;
  evidenceCount: number;
  trend: "up" | "flat" | "down" | "unknown";
  recentWeakConcepts: string[];
}

export function summarizeSkills(evidence: SkillEvidence[]): SkillSummary[] {
  return topSkills.map((skill) => {
    const rows = evidence.filter((row) => row.skillId === skill.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (rows.length < 2) return { ...skill, band: "insufficient evidence", score: null, evidenceCount: rows.length, trend: "unknown", recentWeakConcepts: rows.filter((row) => row.score < 0.7).slice(-3).map((row) => row.taskId) };
    const weighted = rows.reduce((sum, row, index) => {
      const recency = 0.7 + 0.3 * ((index + 1) / rows.length);
      const transfer = row.blindTransfer ? 1.15 : 1;
      const delayed = row.delayed ? 1.1 : 1;
      const calibrationPenalty = row.score < 0.5 && row.confidence >= 3 ? 0.72 : 1;
      return sum + row.score * recency * transfer * delayed * calibrationPenalty;
    }, 0);
    const denominator = rows.reduce((sum, _row, index) => sum + 0.7 + 0.3 * ((index + 1) / rows.length), 0);
    const score = Math.max(0, Math.min(1, weighted / denominator));
    const recent = rows.slice(-Math.min(4, rows.length));
    const earlier = rows.slice(0, Math.min(4, rows.length));
    const recentMean = recent.reduce((sum, row) => sum + row.score, 0) / recent.length;
    const earlierMean = earlier.reduce((sum, row) => sum + row.score, 0) / earlier.length;
    const trend = recentMean > earlierMean + 0.08 ? "up" : recentMean < earlierMean - 0.08 ? "down" : "flat";
    const band = score < 0.55 ? "developing" : score < 0.78 ? "functional" : "strong";
    return { ...skill, band, score, evidenceCount: rows.length, trend, recentWeakConcepts: rows.filter((row) => row.score < 0.7).slice(-3).map((row) => row.taskId) };
  });
}

