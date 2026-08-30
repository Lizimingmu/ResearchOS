import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { evidenceSources } from "../.build/data/evidence.js";
import { methodConcepts, usableMethodConcepts } from "../.build/data/methods.js";
import { researchPatterns } from "../.build/data/patterns.js";
import { judgmentCards } from "../.build/data/judgmentCards.js";
import { auditCases } from "../.build/data/auditCases.js";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];
const checks = [];
const sourceIds = new Set(evidenceSources.map((source) => source.id));
const difficulties = new Set(["foundation", "intermediate", "advanced", "frontier"]);

function check(name, condition, detail) {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) errors.push(`${name}: ${detail}`);
}

function duplicates(items, key) {
  const seen = new Set();
  return items.map(key).filter((value) => seen.has(value) || !seen.add(value));
}

function auditCollection(name, items, minimum) {
  check(`${name} count`, items.length >= minimum, `${items.length} present; minimum ${minimum}`);
  const duplicateIds = [...new Set(duplicates(items, (item) => item.id))];
  const duplicateTitles = [...new Set(duplicates(items, (item) => item.title.trim().toLowerCase()))];
  check(`${name} IDs unique`, duplicateIds.length === 0, duplicateIds.join(", ") || "no duplicates");
  check(`${name} titles unique`, duplicateTitles.length === 0, duplicateTitles.join(", ") || "no duplicates");
}

auditCollection("Evidence sources", evidenceSources, 40);
auditCollection("Method concepts", methodConcepts, 80);
auditCollection("Research patterns", researchPatterns, 25);
auditCollection("Judgment cards", judgmentCards, 80);
auditCollection("AI audit cases", auditCases, 40);
check("Usable methods", usableMethodConcepts.length >= 80, `${usableMethodConcepts.length} usable methods`);

for (const source of evidenceSources) {
  if (!source.title || !source.sourceName || !source.coreEvidence) errors.push(`Evidence ${source.id} has an empty required field.`);
  if (!Number.isInteger(source.year) || source.year < 1900 || source.year > new Date().getFullYear()) errors.push(`Evidence ${source.id} has an invalid or missing year.`);
  if (!source.doi && !source.pmid && !source.url) errors.push(`Evidence ${source.id} has no resolvable identifier or URL.`);
  if (source.doi && !/^10\.\d{4,9}\/\S+$/i.test(source.doi)) errors.push(`Evidence ${source.id} has malformed DOI ${source.doi}.`);
  if (source.pmid && !/^\d{5,9}$/.test(source.pmid)) errors.push(`Evidence ${source.id} has malformed PMID ${source.pmid}.`);
  if (source.verificationStatus === "verified" && !source.lastVerifiedAt) errors.push(`Evidence ${source.id} is verified without a verification time.`);
  if (source.verificationStatus === "verified" && !source.verificationScope) errors.push(`Evidence ${source.id} is verified without identifier/metadata/claim scope.`);
  if (source.contentOrigin === "ai_generated" && source.verificationStatus === "verified") errors.push(`AI-generated evidence ${source.id} self-declares verified.`);
}

const trainingCollections = [
  ["method", methodConcepts], ["pattern", researchPatterns], ["judgment", judgmentCards], ["audit", auditCases],
];
for (const [kind, items] of trainingCollections) {
  for (const item of items) {
    const unknown = item.sourceIds.filter((id) => !sourceIds.has(id));
    if (unknown.length) errors.push(`${kind} ${item.id} references unknown sources: ${unknown.join(", ")}.`);
    if (!item.sourceIds.length) errors.push(`${kind} ${item.id} has no source.`);
    if (!difficulties.has(item.difficulty)) errors.push(`${kind} ${item.id} has no valid difficulty.`);
    if (!Array.isArray(item.misconceptionTags) || item.misconceptionTags.length === 0) errors.push(`${kind} ${item.id} has no misconception tag.`);
    if (item.contentOrigin === "ai_generated" && item.verificationStatus === "verified") errors.push(`${kind} ${item.id} self-declares AI content verified.`);
  }
}

for (const method of methodConcepts) {
  for (const field of ["whyItMatters", "coreConcept", "minimalExample", "commonWrongPractice", "reviewerAttack", "whenToUse", "whenNotToUse", "transferPrompt"]) {
    if (String(method[field] ?? "").trim().length < 20) errors.push(`Method ${method.id} field ${field} is too thin.`);
  }
}
for (const card of judgmentCards) {
  if (card.expectedFindings.length < 3) errors.push(`Judgment ${card.id} has fewer than three expected findings.`);
  if (!card.variantPrompt || card.variantPrompt.length < 20) errors.push(`Judgment ${card.id} lacks an unfamiliar variant prompt.`);
}
for (const audit of auditCases) {
  if (audit.steps.length < 4) errors.push(`Audit ${audit.id} has fewer than four decision steps.`);
  if (!audit.steps.some((step) => step.expected === "reject")) errors.push(`Audit ${audit.id} has no unsafe step to reject.`);
  if (!audit.steps.some((step) => step.expected === "approve")) warnings.push(`Audit ${audit.id} is an all-unsafe plan; every step is expected to be rejected.`);
  if (!audit.variantPrompt || audit.variantPrompt.length < 20) errors.push(`Audit ${audit.id} lacks an unfamiliar variant prompt.`);
}
for (const pattern of researchPatterns) {
  if (pattern.evidenceChain.length < 4 || pattern.figureOrder.length < 4 || pattern.failureModes.length < 3) errors.push(`Pattern ${pattern.id} is structurally incomplete.`);
}

const doiDuplicates = [...new Set(duplicates(evidenceSources.filter((source) => source.doi), (source) => source.doi.toLowerCase()))];
const pmidDuplicates = [...new Set(duplicates(evidenceSources.filter((source) => source.pmid), (source) => source.pmid))];
check("DOIs unique", doiDuplicates.length === 0, doiDuplicates.join(", ") || "no duplicates");
check("PMIDs unique", pmidDuplicates.length === 0, pmidDuplicates.join(", ") || "no duplicates");

const report = {
  generatedAt: new Date().toISOString(), passed: errors.length === 0, errors, warnings, checks,
  counts: { evidence: evidenceSources.length, methods: methodConcepts.length, usableMethods: usableMethodConcepts.length, patterns: researchPatterns.length, judgmentCards: judgmentCards.length, auditCases: auditCases.length },
  provenance: {
    verifiedSeed: [...evidenceSources, ...methodConcepts, ...researchPatterns, ...judgmentCards, ...auditCases].filter((item) => item.contentOrigin === "verified_seed").length,
    verifiedExternal: [...evidenceSources, ...methodConcepts, ...researchPatterns, ...judgmentCards, ...auditCases].filter((item) => item.contentOrigin === "verified_external").length,
    aiGenerated: [...evidenceSources, ...methodConcepts, ...researchPatterns, ...judgmentCards, ...auditCases].filter((item) => item.contentOrigin === "ai_generated").length,
  },
};

const checkRows = checks.map((item) => `| ${item.passed ? "PASS" : "FAIL"} | ${item.name} | ${item.detail} |`).join("\n");
const issueLines = errors.length ? errors.map((error) => `- ${error}`).join("\n") : "- No blocking content defects detected.";
const markdown = `# ResearchOS Content Audit

*Release-gate audit for scientific training content, provenance, identifiers, structure, and misconception metadata.*

---

## 🔍 Audit scope

This report is generated by \`npm run content:audit\`. The gate checks minimum inventory, duplicate IDs and titles, DOI/PMID syntax and uniqueness, source foreign keys, verification scope, required scientific fields, difficulty, misconception tags, unfamiliar variants, and the rule that AI-generated content cannot self-declare verification.

| Content type | Count | Release minimum |
|---|---:|---:|
| Evidence sources | ${report.counts.evidence} | 40 |
| Method concepts | ${report.counts.methods} (${report.counts.usableMethods} usable) | 80 usable |
| Research patterns | ${report.counts.patterns} | 25 |
| Judgment cards | ${report.counts.judgmentCards} | 80 |
| AI audit cases | ${report.counts.auditCases} | 40 |

## ✅ Gate results

| Status | Check | Detail |
|---|---|---|
${checkRows}

## 🧬 Provenance

- Verified seed records: ${report.provenance.verifiedSeed}
- Externally verified records: ${report.provenance.verifiedExternal}
- AI-generated records: ${report.provenance.aiGenerated}
- Verified evidence records distinguish claim-level review from identifier-only resolution through \`verificationScope\`.

## ⚠️ Blocking issues

${issueLines}

## 📚 Verification basis

Identifier metadata was resolved through NCBI PubMed and official publisher records; claim-level summaries were written to stay inside the reported design and abstract-level evidence. Identifier resolution alone never upgrades an unsupported claim.[^pubmed] Reporting checklists are treated as transparency tools, not numerical risk-of-bias scores.[^tripod]

[^pubmed]: [NCBI PubMed](https://pubmed.ncbi.nlm.nih.gov/)
[^tripod]: [TRIPOD+AI scope](https://www.tripod-statement.org/scope/)
`;

await mkdir(path.join(root, "artifacts"), { recursive: true });
await writeFile(path.join(root, "artifacts", "content-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(root, "docs", "CONTENT_AUDIT.md"), markdown);
console.log(`Content audit ${report.passed ? "PASSED" : "FAILED"}: ${errors.length} error(s), ${warnings.length} warning(s).`);
console.log(JSON.stringify(report.counts));
if (!report.passed) process.exitCode = 1;
