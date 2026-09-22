import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInitialKnowledgeWorkspace } from "../.build/data/knowledge.js";
import { auditKnowledgeWorkspace } from "../.build/services/knowledge.js";

const names = {
  schema: "knowledge-schema-audit", dependency: "knowledge-dependency-audit",
  supersession: "supersession-audit", freshness: "freshness-audit",
  learning_binding: "learning-binding-audit", update_impact: "update-impact-audit",
  activation_safety: "activation-safety-audit",
};
const selected = process.argv[2];
if (selected && !(selected in names)) throw new Error(`Unknown audit group: ${selected}`);
const workspace = createInitialKnowledgeWorkspace();
const audit = auditKnowledgeWorkspace(workspace);
const report = {
  auditedAt: "deterministic", schemaVersion: 1,
  counts: { revisions: workspace.units.length, sources: workspace.sources.length,
    claims: workspace.claims.length, learningBindings: workspace.learningBindings.length,
    bindingsRequiringReview: workspace.learningBindings.filter((item) => item.migrationStatus === "REVIEW_REQUIRED").length,
    unresolvedBindings: workspace.learningBindings.filter((item) => !item.knowledgeRevisionBindings.length).length },
  ...audit,
};
await mkdir(path.resolve("artifacts/m020"), { recursive: true });
await writeFile(path.resolve("artifacts/m020/knowledge-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
for (const [group, name] of Object.entries(names)) {
  if (selected && group !== selected) continue;
  const errors = audit.groups[group];
  console.log(`${name}: ${errors.length ? "FAIL" : "PASS"} (${errors.length} errors)`);
  for (const error of errors) console.error(error);
  if (errors.length) process.exitCode = 1;
}
console.log(`Migration review gaps: ${audit.warnings.length} (preserved, no scientific verification implied).`);
// A selected audit cannot claim a usable workspace when its prerequisites fail.
if (!audit.ok) {
  if (selected && !audit.groups[selected].length) console.error(`${names[selected]} blocked by another failed workspace invariant.`);
  process.exitCode = 1;
}
