import type { AppStateData } from "../domain/types";

export type LearningExportFormat = "json" | "csv" | "markdown";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function serializeLearningData(state: AppStateData, format: LearningExportFormat): { content: string; mime: string; extension: string } {
  const exportedAt = new Date().toISOString();
  if (format === "json") return { content: `${JSON.stringify({ exportedAt, schemaVersion: state.schemaVersion, responses: state.responses, reviewLogs: state.reviewLogs, skillEvidence: state.skillEvidence, misconceptions: state.misconceptions, assessments: state.assessmentHistory }, null, 2)}\n`, mime: "application/json", extension: "json" };
  if (format === "csv") {
    const header = ["record_type", "id", "concept", "score_or_status", "confidence", "created_at", "details"].map(csvCell).join(",");
    const evidence = state.skillEvidence.map((item) => ["skill_evidence", item.id, item.conceptId ?? item.taskId, item.score, item.confidence, item.createdAt, `${item.skillId}; delayed=${item.delayed}; transfer=${item.blindTransfer}`].map(csvCell).join(","));
    const misconceptions = state.misconceptions.map((item) => ["misconception", item.id, item.conceptId, item.status, item.confidence, item.detectedAt, item.statement].map(csvCell).join(","));
    const assessments = state.assessmentHistory.map((item) => ["assessment", item.id, item.sourceCase, item.score ?? "unscored", item.confidence, item.createdAt, item.kind ?? "blind"].map(csvCell).join(","));
    return { content: [header, ...evidence, ...misconceptions, ...assessments].join("\r\n"), mime: "text/csv", extension: "csv" };
  }
  const unresolved = state.misconceptions.filter((item) => item.status !== "resolved");
  const content = `# ResearchOS Learning Export\n\n*Generated ${exportedAt}; state schema v${state.schemaVersion}.*\n\n---\n\n## 📊 Summary\n\n- Locked responses: ${state.responses.length}\n- Review events: ${state.reviewLogs.length}\n- Skill observations: ${state.skillEvidence.length}\n- Unresolved misconceptions: ${unresolved.length}\n- Completed assessments: ${state.assessmentHistory.filter((item) => item.score !== undefined).length}\n\n## ⚠️ Unresolved misconceptions\n\n${unresolved.length ? unresolved.map((item) => `- **${item.conceptId}** — ${item.statement} (${item.status}; detected ${item.detectedAt})`).join("\n") : "- None recorded."}\n\n## 🧪 Assessment history\n\n${state.assessmentHistory.length ? state.assessmentHistory.map((item) => `- ${item.createdAt}: ${item.kind ?? "blind"} · ${item.score === undefined ? "rubric pending" : `${Math.round(item.score)}/100`} · ${item.sourceCase}`).join("\n") : "- No assessments recorded."}\n`;
  return { content, mime: "text/markdown", extension: "md" };
}

export function downloadLearningData(state: AppStateData, format: LearningExportFormat): void {
  const serialized = serializeLearningData(state, format);
  const blob = new Blob([serialized.content], { type: `${serialized.mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `researchos-learning-${new Date().toISOString().slice(0, 10)}.${serialized.extension}`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
