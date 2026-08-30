import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotText = await readFile(path.join(root, "artifacts", "curriculum-content-snapshot.json"), "utf8");
const snapshot = JSON.parse(snapshotText);
const sourceRegistryText = await readFile(path.join(root, "src", "data", "evidence.ts"), "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const expected = {
  snapshot_byte_sha256: sha256(snapshotText),
  claims_sha256: String(snapshot.hashes?.claims ?? "").replace(/^sha256:/, ""),
  source_registry_sha256: sha256(sourceRegistryText),
};
const requiredReviews = [
  "M019_SCIENTIFIC_REREVIEW_FINAL2.md",
  "M019_EVIDENCE_REREVIEW_FINAL4.md",
  "M019_PEDAGOGY_REREVIEW_FINAL5.md",
  "M019_AUDIT_ROUND4_RECHECK.md",
];
const errors = [];
const reviews = [];
for (const file of requiredReviews) {
  let text;
  try {
    text = await readFile(path.join(root, file), "utf8");
  } catch {
    errors.push(`${file}: missing required review`);
    continue;
  }
  const observed = Object.fromEntries(Object.keys(expected).map((key) => [key, text.match(new RegExp(key + ": `([a-f0-9]{64})`"))?.[1] ?? "missing"]));
  for (const [key, value] of Object.entries(expected)) if (observed[key] !== value) errors.push(`${file}: ${key} expected ${value}, got ${observed[key]}`);
  reviews.push({ file, observed, bindingMatches: Object.entries(expected).every(([key, value]) => observed[key] === value) });
}
const report = { schemaVersion: 1, auditedAt: "deterministic", status: errors.length ? "FAIL_STALE_REVIEW" : "PASS", expected, reviews, errors };
await writeFile(path.join(root, "artifacts", "review-binding-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Review binding audit: ${report.status} (${reviews.length}/${requiredReviews.length} reviews present)`);
if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
}
