import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";

const sha256 = (value) => createHash("sha256").update(JSON.stringify([...value].sort())).digest("hex");
const registryPath = path.resolve("reviews/m019-1-blind-solvability.json");
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const expected = new Map([...stagedConceptLessons, ...stagedMethodLessons].flatMap((lesson) => [lesson.primaryApply, lesson.remediation, lesson.delayedReview].map((asset) => [asset.id, asset.options.flatMap((option, index) => asset.expectedOptionIds.includes(option.id) ? [`O${index + 1}`] : [])])));
const errors = [];
const results = [];
for (const record of registry.records ?? []) {
  const author = expected.get(record.assessmentId);
  if (!author) { errors.push(`unknown blind-review assessment ${record.assessmentId}`); continue; }
  const authorAnswerHash = sha256(author);
  const reviewerAnswerHash = sha256(record.reviewerSelectedOptionIds ?? []);
  const agreement = authorAnswerHash === reviewerAnswerHash ? "AGREE" : record.verdict === "AMBIGUOUS" ? "AMBIGUOUS" : "DISAGREE";
  results.push({ assessmentId: record.assessmentId, blindReviewerVerdict: record.verdict, reviewerAnswerHash, authorAnswerHash, agreement, reviewerNoteCn: record.reviewerNoteCn ?? "" });
}
for (const assessmentId of expected.keys()) if (!results.some((item) => item.assessmentId === assessmentId)) errors.push(`missing blind review ${assessmentId}`);
for (const result of results) if (result.agreement !== "AGREE") errors.push(`${result.assessmentId} blind solve ${result.agreement}`);
const counts = { agree: results.filter((item) => item.agreement === "AGREE").length, ambiguous: results.filter((item) => item.agreement === "AMBIGUOUS").length, disagree: results.filter((item) => item.agreement === "DISAGREE").length };
const report = { schemaVersion: 1, status: errors.length ? "FAIL" : "PASS", counts, results, errors };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/assessment-solvability-registry.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Blind solvability audit: ${report.status} (agree ${counts.agree}, ambiguous ${counts.ambiguous}, disagree ${counts.disagree})`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
