import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const agentRoot = path.join(root, ".agent");
const required = [
  "PRODUCT_CONSTITUTION.md", "SCIENTIFIC_GATES.md", "PROJECT_STATE.md", "CURRENT_MILESTONE.md",
  "TASK_QUEUE.md", "OPENCODE_HANDOFF.md", "IMPLEMENTATION_REPORT.md", "SCIENTIFIC_CHANGESET.md", "REVIEW_RESULT.md",
];
const errors = [];
const warnings = [];
const read = (name) => readFileSync(path.join(agentRoot, name), "utf8");

for (const name of required) if (!existsSync(path.join(agentRoot, name))) errors.push(`Missing .agent/${name}`);
if (!errors.length) {
  const state = read("PROJECT_STATE.md");
  const baseline = state.match(/Approved baseline: commit `([0-9a-f]{7,40})`/i)?.[1];
  if (!baseline) errors.push("PROJECT_STATE.md has no machine-readable approved baseline commit.");
  else {
    try { execFileSync("git", ["cat-file", "-e", `${baseline}^{commit}`], { cwd: root, stdio: "ignore" }); }
    catch { errors.push(`Approved baseline ${baseline} is not a local commit.`); }
  }

  const review = read("REVIEW_RESULT.md");
  if (!/^# Review Result\r?\n\r?\n(ACCEPT|REJECT|PATCH REQUIRED)\b/m.test(review)) errors.push("REVIEW_RESULT.md must begin with ACCEPT, REJECT, or PATCH REQUIRED.");

  const report = read("IMPLEMENTATION_REPORT.md");
  for (const section of ["## Changed files", "## Implemented", "## Tests", "## Failures", "## Remaining issues"]) {
    if (!report.includes(section)) errors.push(`IMPLEMENTATION_REPORT.md missing ${section}.`);
  }

  const changeset = read("SCIENTIFIC_CHANGESET.md");
  const entryCount = (changeset.match(/^### SC-/gm) ?? []).length;
  if (!/^Status: (NONE|INCOMPLETE|READY FOR REVIEW|ACCEPTED)/m.test(changeset)) errors.push("SCIENTIFIC_CHANGESET.md has an invalid Status.");
  if (entryCount) for (const field of ["Concept", "Claim", "Answer/rubric", "Evidence source IDs", "PMID/DOI", "Risk level", "Verification status", "Changed files"]) {
    if (!changeset.includes(`- ${field}:`)) errors.push(`SCIENTIFIC_CHANGESET entries missing ${field}.`);
  }

  let changed = "";
  try { changed = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }); } catch {}
  const scientificPaths = ["src/data/", "src/i18n/scientificContent", "src/features/methods/", "src/features/ai-audit/", "src/features/review/", "src/features/assessment/", "src/learning/"];
  const hasScientificWork = changed.split(/\r?\n/).some((line) => scientificPaths.some((part) => line.includes(part)));
  if (hasScientificWork && entryCount === 0) warnings.push("Scientific-path changes exist but the changeset has no completed SC entry yet.");
}

console.log(`Agent handoff validation: ${errors.length ? "FAILED" : "PASSED"}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);
if (errors.length) process.exit(1);
