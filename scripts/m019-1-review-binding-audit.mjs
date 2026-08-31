import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(".");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const guideText = await readFile(path.join(root, "artifacts/guide-materialization-snapshot.json"), "utf8");
const assessmentText = await readFile(path.join(root, "artifacts/assessment-materialization-snapshot.json"), "utf8");
const sourceBinding = JSON.parse(await readFile(path.join(root, "artifacts/m019-1-content-binding.json"), "utf8"));
const expected = { guide_snapshot_sha256: sha256(guideText), assessment_snapshot_sha256: sha256(assessmentText), source_registry_sha256: sourceBinding.source_registry_sha256 };
const requiredReviews = ["M019_1_REVIEW_C1_SCIENTIFIC.md", "M019_1_REVIEW_C2_EVIDENCE.md", "M019_1_REVIEW_C3_PEDAGOGY.md", "M019_1_REVIEW_C4_BLIND_REDUNDANCY.md"];
const errors = [];
const reviews = [];
const tick = String.fromCharCode(96);
for (const file of requiredReviews) {
  let text;
  try { text = await readFile(path.join(root, file), "utf8"); } catch { errors.push(`${file}: missing`); continue; }
  const observed = Object.fromEntries(Object.keys(expected).map((key) => [key, text.match(new RegExp(`${key}: ${tick}([a-f0-9]{64})${tick}`))?.[1] ?? "missing"]));
  for (const [key, value] of Object.entries(expected)) if (observed[key] !== value) errors.push(`${file}: ${key} expected ${value}, got ${observed[key]}`);
  reviews.push({ file, observed, bindingMatches: Object.entries(expected).every(([key, value]) => observed[key] === value) });
}
const report = { schemaVersion: 1, status: errors.length ? "FAIL_STALE_REVIEW" : "PASS", expected, reviews, errors };
await writeFile(path.join(root, "artifacts/m019-1-review-binding-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`M019.1 review binding audit: ${report.status} (${reviews.length}/${requiredReviews.length})`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
