import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const packet = JSON.parse(await readFile(path.resolve("artifacts/m019-1-strict-blind-assessment-packet.json"), "utf8"));
const errors = [];
const allowedItemKeys = ["anonymousAssessmentId", "maximumSelections", "options", "scenario", "stimulus"];
const allowedOptionKeys = ["id", "labelCn"];
const forbiddenKeys = new Set(["assessmentId", "lessonId", "lessonTitleCn", "role", "taskContract", "expectedOptionIds", "authorRationaleCn", "materialization", "distractor", "scoringRule", "feedbackCn", "optionFeedbackCn", "promptCn", "correct", "key"]);
const leakedPaths = [];
const walk = (value, location = "packet") => {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) leakedPaths.push(`${location}.${key}`);
    walk(child, `${location}.${key}`);
  }
};
walk(packet);
if (packet.itemCount !== 183 || packet.items?.length !== 183) errors.push(`expected 183 strict blind items, got ${packet.itemCount}/${packet.items?.length ?? 0}`);
const ids = packet.items?.map((item) => item.anonymousAssessmentId) ?? [];
if (new Set(ids).size !== 183 || ids.some((id, index) => id !== `A${String(index + 1).padStart(3, "0")}`)) errors.push("anonymous assessment IDs are missing, duplicated, or unstable");
for (const item of packet.items ?? []) {
  if (JSON.stringify(Object.keys(item).sort()) !== JSON.stringify(allowedItemKeys)) errors.push(`${item.anonymousAssessmentId} contains non-strict item fields`);
  if (!Number.isInteger(item.maximumSelections) || item.maximumSelections < 1 || item.maximumSelections > 4) errors.push(`${item.anonymousAssessmentId} has invalid maximumSelections`);
  if (!item.scenario || !item.stimulus?.rowsCn?.length || !item.options?.length) errors.push(`${item.anonymousAssessmentId} lacks solvable public material`);
  if (item.options?.some((option, index) => JSON.stringify(Object.keys(option).sort()) !== JSON.stringify(allowedOptionKeys) || option.id !== `O${index + 1}`)) errors.push(`${item.anonymousAssessmentId} options leak metadata or use non-opaque IDs`);
}
if (leakedPaths.length) errors.push(`strict packet leaks forbidden metadata at ${leakedPaths.slice(0, 10).join(", ")}`);
const report = { schemaVersion: 1, status: errors.length ? "FAIL" : "PASS", counts: { items: packet.items?.length ?? 0, metadataLeaks: leakedPaths.length }, leakedPaths, errors };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1-strict-blind-packet-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Strict blind packet audit: ${report.status} (${report.counts.items} items, ${report.counts.metadataLeaks} leaks)`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
