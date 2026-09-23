import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";
import { singleBestKeyManifest } from "../.build/data/curriculum/assessment-validity-adjudication.js";

const lessons = [...stagedConceptLessons, ...stagedMethodLessons];
const assessments = lessons.flatMap((lesson) => [lesson.primaryApply, lesson.remediation, lesson.delayedReview]);
const singleBestContracts = new Set(["classification","claim_rewrite","error_localization","choose_next_evidence"]);
const normalize = (value) => value.toLowerCase().replace(/[\s，。；：、“”‘’（）()\[\]\-—_/|0-9]/g, "");
const grams = (value, n = 3) => {
  const text = normalize(value); const result = new Set();
  for (let index = 0; index <= text.length - n; index += 1) result.add(text.slice(index, index + n));
  return result;
};
const dice = (left, right) => {
  const a = grams(left); const b = grams(right); if (!a.size || !b.size) return 0;
  let overlap = 0; for (const token of a) if (b.has(token)) overlap += 1;
  return (2 * overlap) / (a.size + b.size);
};
const results = [];

for (const asset of assessments) {
  const reasons = [];
  let classification = "CLEAR";
  const labels = asset.options.map((option) => option.labelCn);
  const normalizedLabels = labels.map(normalize);
  if (new Set(normalizedLabels).size !== normalizedLabels.length) { classification = "AMBIGUOUS"; reasons.push("duplicate option meaning"); }
  for (let left = 0; left < labels.length; left += 1) for (let right = left + 1; right < labels.length; right += 1) {
    if (dice(labels[left], labels[right]) >= 0.88) { classification = "AMBIGUOUS"; reasons.push(`near-duplicate options O${left + 1}/O${right + 1}`); }
  }
  const logicalId = asset.id.replace(/-v[23]$/, "");
  const isSingleBest = singleBestContracts.has(asset.taskContract) || asset.expectedOptionIds.length === 1;
  const expectedAction = isSingleBest ? singleBestKeyManifest[logicalId]?.expectedActionKey : undefined;
  if (isSingleBest) {
    if (!expectedAction) { classification = "AUTHOR_DEPENDENT"; reasons.push("single-best item lacks an item-specific key manifest entry"); }
    if (asset.expectedOptionIds.length !== 1) { classification = "AMBIGUOUS"; reasons.push("single-best contract has multiple expected options"); }
    const expectedId = asset.expectedOptionIds[0] ?? "";
    if (expectedAction && !expectedId.endsWith(`-${expectedAction}`)) { classification = "AUTHOR_DEPENDENT"; reasons.push("materialized key differs from item-specific manifest"); }
    const expectation = asset.scoringRule.evidenceExpectations.find((item) => item.optionId === expectedId);
    if (!expectation?.allowedRowIds.length || expectation.allowedRowIds.length !== expectation.requiredFactFragmentsCn.length) { classification = "AUTHOR_DEPENDENT"; reasons.push("single-best answer lacks an exact evidence basis"); }
    if (asset.id.endsWith("-v3") && !asset.materialization.authorRationaleCn.some((item) => /item-specific key manifest/.test(item))) { classification = "AUTHOR_DEPENDENT"; reasons.push("revised single-best key lacks an adjudication trace"); }
  }
  if (!asset.promptCn || !asset.scenarioCn || asset.stimulus.rowsCn.length < 3) { classification = "AUTHOR_DEPENDENT"; reasons.push("task lacks a bounded prompt or sufficient stimulus"); }
  results.push({ assessmentId: asset.id, taskContract: asset.taskContract, classification, reasons });
}

const counts = Object.fromEntries(["CLEAR", "AMBIGUOUS", "AUTHOR_DEPENDENT"].map((classification) => [classification, results.filter((item) => item.classification === classification).length]));
const singleBest = assessments.filter((asset) => singleBestContracts.has(asset.taskContract) || asset.expectedOptionIds.length === 1).length;
const errors = [];
if (assessments.length !== 183) errors.push(`expected 183 assessments, got ${assessments.length}`);
if (counts.AMBIGUOUS) errors.push(`${counts.AMBIGUOUS} assessments remain ambiguous`);
if (counts.AUTHOR_DEPENDENT) errors.push(`${counts.AUTHOR_DEPENDENT} assessments remain author-dependent`);
const report = { schemaVersion: 1, status: errors.length ? "FAIL" : "PASS", counts: { assessments: assessments.length, singleBest, ...counts }, results, errors };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1b-ambiguity-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Assessment ambiguity audit: ${report.status} (CLEAR ${counts.CLEAR}, AMBIGUOUS ${counts.AMBIGUOUS}, AUTHOR_DEPENDENT ${counts.AUTHOR_DEPENDENT})`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
