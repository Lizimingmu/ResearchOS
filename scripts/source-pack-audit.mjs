import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoSourcePack, problemAtlasSources, problemAtlasClaims } from "../.build/data/problemAtlas.js";
import { evidenceSources } from "../.build/data/evidence.js";
import {
  applySourcePackImport,
  computeContentHash,
  dryRunSourcePack,
  entityHash,
  evaluateScientificCompleteness,
  normalizeDoi,
  normalizePmid,
  parseCsv,
  parseMarkdownFrontmatter,
  parseSourcePackJsonSafe,
  validateSourcePack,
  validateSourcePackUnknown,
} from "../.build/services/sourcePack.js";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];
const checks = [];
const check = (name, passed, detail) => { checks.push({ name, passed: Boolean(passed), detail }); if (!passed) errors.push(`${name}: ${detail}`); };

const doc = demoSourcePack;
const validation = validateSourcePack(doc);
check("demo pack schema valid", validation.errors.length === 0, validation.errors.join("; ") || `validated with ${validation.warnings.length} warning(s)`);
check("demo pack hash computed", /^[0-9a-f]{16}$/.test(validation.contentHash), validation.contentHash);

const emptyAtlas = {
  problemAtlasSources: [],
  problemAtlasClaims: [],
  problemCards: [],
  diagnosticCauses: [],
  diagnosticChecks: [],
  diagnosticPaths: [],
  diagnosticEvidence: [],
  problemTrainingCases: [],
  diagnosticSessions: [],
  sourcePackImports: [],
  problemSearchLog: [],
};
const seeded = applySourcePackImport(emptyAtlas, doc, { allowUpdates: true });
const state = { ...emptyAtlas, ...seeded.collections, sourcePackImports: [seeded.importRecord] };

const dryRun = dryRunSourcePack(doc, state);
check("seed pack idempotent no-op", dryRun.noop === true, `noop=${dryRun.noop}; inserts=${dryRun.inserts}; updates=${dryRun.updates}`);
check("seed pack no conflicts", dryRun.conflicts.length === 0, dryRun.conflicts.join("; ") || "clean");
check("seed import recorded", state.sourcePackImports.some((record) => record.packId === doc.packId && record.result === "applied"), `${state.sourcePackImports.length} import records`);

const sourceIds = new Set(doc.sources.map((item) => item.id));
const claimIds = new Set(doc.evidenceClaims.map((item) => item.id));
const cardIds = new Set(doc.problemCards.map((item) => item.id));
const causeIds = new Set(doc.diagnosticCauses.map((item) => item.id));
const checkIds = new Set(doc.diagnosticChecks.map((item) => item.id));
const pathIds = new Set(doc.diagnosticPaths.map((item) => item.id));
const evidenceIds = new Set(doc.diagnosticEvidence.map((item) => item.id));
const caseIds = new Set(doc.transferCases.map((item) => item.id));

check("sources normalized enums", doc.sources.every((item) => ["S", "A", "B", "C", "D", "X"].includes(item.authorityTier) && ["pending", "metadata_verified", "claim_verified", "rejected"].includes(item.verificationStatus) && ["current", "superseded", "deprecated", "emerging"].includes(item.knowledgeStatus)), "enums clean");
check("no Tier X sources", doc.sources.every((item) => item.authorityTier !== "X"), "Tier X rejected");

const CODEX_TIER_MAPPING = {
  "pa-src-tripod": "S",
  "pa-src-tripod-ai": "S",
  "pa-src-probast": "S",
  "pa-src-internal-validation": "A",
  "pa-src-pseudobulk": "A",
  "pa-src-altman-validation": "A",
  "pa-src-pseudorep": "C",
  "pa-src-leakage": "C",
  "pa-src-calibration": "C",
};
const CODEX_ADDED_SOURCES = new Set(["pa-src-altman-validation"]);
for (const source of problemAtlasSources) {
  const mirror = evidenceSources.find((entry) => {
    const sameDoi = source.doi && entry.doi && normalizeDoi(source.doi) === normalizeDoi(entry.doi);
    const samePmid = source.pmid && entry.pmid && normalizePmid(source.pmid) === normalizePmid(entry.pmid);
    const sameUrl = !source.doi && !source.pmid && source.url && entry.url === source.url;
    return sameDoi || samePmid || sameUrl;
  });
  if (!mirror && !CODEX_ADDED_SOURCES.has(source.id)) { errors.push(`registry source ${source.id} has no verified-seed mirror by DOI/PMID.`); continue; }
  if (CODEX_ADDED_SOURCES.has(source.id)) {
    if (source.verificationStatus !== "pending") errors.push(`Codex-added source ${source.id} must stay pending.`);
    if (source.authorityTier !== "A") errors.push(`Codex-added source ${source.id} must be Tier A.`);
    continue;
  }
  const expectedTier = CODEX_TIER_MAPPING[source.id];
  if (!expectedTier) { errors.push(`registry source ${source.id} has no Codex-reviewed M013 tier mapping.`); continue; }
  if (source.authorityTier !== expectedTier) errors.push(`registry source ${source.id} tier ${source.authorityTier} != Codex-reviewed ${expectedTier}.`);
  if (source.verificationStatus !== "metadata_verified") warnings.push(`registry source ${source.id} status ${source.verificationStatus} != metadata_verified.`);
  if (source.verificationScope.includes("claim")) errors.push(`registry source ${source.id} must not declare claim-level verification.`);
}
check("registry tiers match Codex-reviewed M013 mapping", errors.filter((item) => item.includes("registry source") || item.includes("Codex-added source")).length === 0, `${problemAtlasSources.length} sources mapped`);
const altmanSource = problemAtlasSources.find((source) => source.id === "pa-src-altman-validation");
check("Altman BMJ source DOI↔PMID mapping", Boolean(altmanSource) && normalizeDoi(altmanSource.doi ?? "") === "10.1136/bmj.b605" && normalizePmid(altmanSource.pmid ?? "") === "19477892", `doi=${altmanSource?.doi ?? "missing"}; pmid=${altmanSource?.pmid ?? "missing"}`);

check("claims never claim_verified", doc.evidenceClaims.every((item) => item.verificationStatus === "pending"), `${doc.evidenceClaims.length} claims pending`);
check("cards never verified", doc.problemCards.every((item) => item.verificationStatus === "pending" && item.contentOrigin === "ai_generated"), `${doc.problemCards.length} cards pending`);
check("training cases never verified", doc.transferCases.every((item) => item.verificationStatus === "pending" && item.contentOrigin === "ai_generated"), `${doc.transferCases.length} cases pending`);
check("demo scope limited to four concepts", doc.problemCards.every((item) => ["pa-pseudorep", "pa-bio-tech-rep", "pa-data-leakage", "pa-internal-external"].includes(item.id)), doc.problemCards.map((item) => item.id).join(", "));

for (const card of doc.problemCards) {
  if (!cardIds.has(card.id)) continue;
  if (card.candidateCauseIds.length < 3) errors.push(`card ${card.id}: fewer than 3 causes.`);
  if (!pathIds.has(card.diagnosticPathId)) errors.push(`card ${card.id}: broken path link.`);
  for (const causeId of card.candidateCauseIds) if (!causeIds.has(causeId)) errors.push(`card ${card.id}: broken cause ${causeId}.`);
  for (const claimId of card.evidenceClaimIds) if (!claimIds.has(claimId)) errors.push(`card ${card.id}: broken claim ${claimId}.`);
  for (const caseId of card.transferCaseIds) if (!caseIds.has(caseId)) errors.push(`card ${card.id}: broken case ${caseId}.`);
  const modes = new Set(doc.transferCases.filter((item) => item.problemId === card.id).map((item) => item.mode));
  const missingModes = ["quick", "differential", "sequential", "missing-info", "error-localization", "claim-boundary", "reviewer", "ai-verdict"].filter((mode) => !modes.has(mode));
  if (missingModes.length) errors.push(`card ${card.id}: missing training modes ${missingModes.join(", ")}.`);
}
check("cards have complete mode rubrics", errors.filter((item) => item.includes("missing training modes")).length === 0, "8 modes per card");

for (const p of doc.diagnosticPaths) {
  const card = doc.problemCards.find((item) => item.diagnosticPathId === p.id);
  if (!card) continue;
  if (!p.nodes.length) errors.push(`path ${p.id}: no nodes.`);
  const nodeIds = new Set(p.nodes.map((node) => node.id));
  if (nodeIds.size !== p.nodes.length) errors.push(`path ${p.id}: duplicate node ids.`);
  if (!p.finalRanking.length) errors.push(`path ${p.id}: no final ranking.`);
  for (const causeId of p.finalRanking) if (!card.candidateCauseIds.includes(causeId)) errors.push(`path ${p.id}: final ranking cites foreign cause ${causeId}.`);
  for (const node of p.nodes) {
    if (!checkIds.has(node.expectedCheckId)) errors.push(`path ${p.id} node ${node.id}: expectedCheckId missing.`);
    for (const evidenceId of node.availableEvidenceIds) if (!evidenceIds.has(evidenceId)) errors.push(`path ${p.id} node ${node.id}: broken evidence ${evidenceId}.`);
  }
}
check("paths are well-formed", errors.filter((item) => item.includes("path ")).length === 0, `${doc.diagnosticPaths.length} paths`);

for (const item of doc.diagnosticEvidence) {
  if (!claimIds.has(item.evidenceClaimId)) errors.push(`evidence ${item.id}: broken claim ${item.evidenceClaimId}.`);
  for (const causeId of item.affectsCauseIds) {
    if (!causeIds.has(causeId)) errors.push(`evidence ${item.id}: broken cause ${causeId}.`);
    if (!item.direction[causeId]) errors.push(`evidence ${item.id}: missing direction for ${causeId}.`);
  }
}
check("evidence links intact", errors.filter((item) => item.includes("evidence ")).length === 0, `${doc.diagnosticEvidence.length} evidence items`);

for (const claim of problemAtlasClaims) {
  if (!sourceIds.has(claim.sourceId)) { errors.push(`claim ${claim.id}: broken source ${claim.sourceId}.`); continue; }
  if (!["direct", "qualified", "contextual", "contradicts", "insufficient"].includes(claim.supportType)) errors.push(`claim ${claim.id}: bad supportType.`);
  if (claim.claim.trim().length < 12) errors.push(`claim ${claim.id}: claim too short.`);
  if (!claim.supportingLocation.trim()) errors.push(`claim ${claim.id}: missing supportingLocation.`);
}
check("claims link to registry sources", errors.filter((item) => item.includes("claim ")).length === 0, `${problemAtlasClaims.length} claims`);

const identical = computeContentHash(doc) === computeContentHash(structuredClone(doc));
check("content hash deterministic", identical, validation.contentHash);

const duplicateEntityHash = entityHash(doc.sources[0]) === entityHash(structuredClone(doc.sources[0]));
check("entity hash deterministic", duplicateEntityHash, "entity hash stable");

const supersession = doc.sources.find((item) => item.id === "pa-src-tripod-ai");
const superseded = doc.sources.find((item) => item.id === "pa-src-tripod");
check("non-destructive supersession links", supersession?.supersedes.includes("pa-src-tripod") === true && superseded?.supersededBy.includes("pa-src-tripod-ai") === true, "TRIPOD 2015 ↔ TRIPOD+AI");
check("superseded source keeps its history", superseded?.knowledgeStatus === "superseded" && superseded?.verificationStatus === "metadata_verified", `TRIPOD 2015 status=${superseded?.knowledgeStatus}/${superseded?.verificationStatus}`);

const csvRows = parseCsv('id,title,year\n"s1","A, ""quoted"" title",2020\n');
check("CSV parser handles quotes", csvRows.length === 2 && csvRows[1][1] === 'A, "quoted" title', JSON.stringify(csvRows[1]));
const md = parseMarkdownFrontmatter('---\nkind: source\nid: s1\ntitle: "T"\n---\nBody');
check("Markdown frontmatter parser", md.fields.id === "s1" && md.fields.title === "T" && md.body.startsWith("Body"), md.fields.id);

const invalidPack = structuredClone(doc);
invalidPack.packId = "broken-pack";
invalidPack.sources[0].authorityTier = "X";
const invalidDryRun = dryRunSourcePack(invalidPack, state);
check("Tier X pack rejected", invalidDryRun.rejectedRows.length > 0 && invalidDryRun.errors.length > 0, invalidDryRun.rejectedRows.join(", "));

const selfVerifiedPack = structuredClone(doc);
selfVerifiedPack.packId = "self-verified-pack";
selfVerifiedPack.evidenceClaims[0].verificationStatus = "claim_verified";
selfVerifiedPack.evidenceClaims[0].verifiedAt = "2026-08-24T00:00:00+08:00";
selfVerifiedPack.evidenceClaims[0].verifiedBy = "self";
const selfVerifiedValidation = validateSourcePack(selfVerifiedPack);
check("AI self-verification rejected", selfVerifiedValidation.errors.some((item) => item.includes("AI 生成内容不能进入 claim_verified")), selfVerifiedValidation.errors.filter((item) => item.includes("claim_verified")).join("; "));

let hardeningCrashes = 0;
const hardenedInputs = [null, 42, "text", [], {}, { packSchemaVersion: 1, sources: "not-array" }, { packSchemaVersion: 1, problemCards: [{ id: "c1", title_cn: "legacy" }] }];
for (const input of hardenedInputs) {
  try {
    const report = validateSourcePackUnknown(input);
    if (!Array.isArray(report.failures)) hardeningCrashes += 1;
  } catch { hardeningCrashes += 1; }
}
check("validator exception-safe on arbitrary shapes", hardeningCrashes === 0, `${hardeningCrashes} crashes`);

const legacyRow = validateSourcePackUnknown({ packSchemaVersion: 1, packId: "legacy-probe", problemCards: [{ id: "c1", title_cn: "legacy" }] });
check("legacy snake_case rows return structured rejection", legacyRow.failures.some((failure) => failure.code === "CARD_TITLE_CN") && legacyRow.failures.every((failure) => typeof failure.code === "string" && typeof failure.location === "string"), `${legacyRow.failures.length} structured failures`);

const incompletePack = structuredClone(doc);
incompletePack.packId = "incomplete-pack";
incompletePack.problemCards[0].claimBoundary = "";
incompletePack.problemCards[0].recommendedReasoning = [];
const incompleteValidation = validateSourcePack(incompletePack);
const incompleteCompleteness = evaluateScientificCompleteness(incompletePack);
check("structural and completeness gates stay independent", incompleteValidation.errors.length === 0 && incompleteCompleteness.status === "scientific_patch_required", `structural=${incompleteValidation.errors.length}; completeness=${incompleteCompleteness.status}`);
const incompleteDryRun = dryRunSourcePack(incompletePack, state);
check("scientifically incomplete pack is import-ineligible", incompleteDryRun.importEligible === false && incompleteDryRun.scientificCompleteness.status === "scientific_patch_required", `importEligible=${incompleteDryRun.importEligible}`);
let incompleteApplyRejected = false;
try { applySourcePackImport(state, incompletePack, { allowUpdates: true }); } catch { incompleteApplyRejected = true; }
check("apply rejects scientifically incomplete packs", incompleteApplyRejected, "threw SourcePackImportError");

const unclassifiedPack = structuredClone(doc);
unclassifiedPack.packId = "unclassified-probe-pack";
unclassifiedPack.problemCards[0].problemType = "unclassified";
const unclassifiedDryRun = dryRunSourcePack(unclassifiedPack, state);
check("unclassified card blocks import eligibility", unclassifiedDryRun.importEligible === false && unclassifiedDryRun.scientificCompleteness.counts.problemCards.unclassified === 1, `importEligible=${unclassifiedDryRun.importEligible}`);

const parseBad = parseSourcePackJsonSafe("{broken json");
check("safe JSON parser returns structured failure", parseBad.ok === false && parseBad.failure.code === "PARSE_INVALID_JSON", parseBad.failure?.code ?? "ok");
const parseOversize = parseSourcePackJsonSafe("x".repeat(2_000_001));
check("safe JSON parser rejects oversize input", parseOversize.ok === false && parseOversize.failure.code === "PARSE_OVERSIZE", parseOversize.failure?.code ?? "ok");

let csvOversizeRejected = false;
let csvOversizeMessage = "accepted or truncated";
try {
  parseCsv(`id,title\n"s1","${"x".repeat(2001)}"\n`);
} catch (error) {
  csvOversizeRejected = String(error?.message ?? error).includes("CSV_FIELD_OVERSIZE");
  csvOversizeMessage = String(error?.message ?? error).slice(0, 120);
}
check("oversized CSV field rejected without truncation", csvOversizeRejected, csvOversizeMessage);

const noopProbePack = structuredClone(doc);
noopProbePack.packId = "noop-incomplete-probe";
noopProbePack.problemCards[0].problemType = "unclassified";
const noopProbeHash = computeContentHash(noopProbePack);
const noopState = {
  ...state,
  sourcePackImports: [{ id: "import-probe", packId: "noop-incomplete-probe", title: "probe", contentHash: noopProbeHash, importedAt: new Date().toISOString(), result: "applied", dryRun: { inserts: 1, updates: 0, conflicts: 0, rejectedRows: 0, warnings: 0 } }],
};
const noopDryRun = dryRunSourcePack(noopProbePack, noopState);
check("identical-import noop cannot bypass the scientific gate", noopDryRun.noop === true && noopDryRun.importEligible === false && noopDryRun.scientificCompleteness.status === "scientific_patch_required", `noop=${noopDryRun.noop}; importEligible=${noopDryRun.importEligible}; completeness=${noopDryRun.scientificCompleteness.status}`);
let noopApplyRejected = false;
try { applySourcePackImport(noopState, noopProbePack, { allowUpdates: true }); } catch { noopApplyRejected = true; }
check("apply rejects incomplete identical-import without mutation", noopApplyRejected, noopApplyRejected ? "threw SourcePackImportError" : "did not throw");

check("dry-run reports importEligible for clean demo", dryRun.importEligible === true, `importEligible=${dryRun.importEligible}`);

const report = {
  generatedAt: new Date().toISOString(),
  passed: errors.length === 0,
  errors,
  warnings,
  checks,
  counts: {
    packSources: doc.sources.length,
    claims: doc.evidenceClaims.length,
    cards: doc.problemCards.length,
    causes: doc.diagnosticCauses.length,
    checks: doc.diagnosticChecks.length,
    paths: doc.diagnosticPaths.length,
    evidence: doc.diagnosticEvidence.length,
    transferCases: doc.transferCases.length,
  },
  contentHash: validation.contentHash,
};

const markdown = `# Source Pack Audit

*M013 source registry, claim mapping, knowledge versioning and transactional import gate.*

**Result: ${report.passed ? "PASSED" : "FAILED"}** — ${errors.length} error(s), ${warnings.length} warning(s).

## Checks

| Status | Check | Detail |
|---|---|---|
${checks.map((entry) => `| ${entry.passed ? "PASS" : "FAIL"} | ${entry.name} | ${entry.detail} |`).join("\n")}

## Counts

| Entity | Count |
|---|---:|
${Object.entries(report.counts).map(([key, value]) => `| ${key} | ${value} |`).join("\n")}

## Rules enforced

- Canonical pack schema v1; JSON/CSV/Markdown parsers with size bounds; oversize CSV fields and Markdown bodies are deterministically rejected, never truncated; exception-safe hardened validator with structured failure codes and locations.
- Tier X rejected; D/X cannot back verified claims; AI-generated content cannot self-verify.
- Duplicate DOI/PMID/title and claim hashes rejected; supersession cycles detected.
- Import is transactional and idempotent per pack ID + content hash; the identical-import/noop shortcut never overrides the structural and scientific gates.
- Two independent gates: structural validation vs scientific completeness (scientifically_complete | scientific_patch_required); unclassified cards are never import-eligible; the apply path rejects every import-ineligible document.
- Registry authority tiers match the Codex-reviewed M013 mapping (TRIPOD/TRIPOD+AI/PROBAST S; peer-reviewed methods/benchmarks A; explanatory reviews C).
- All demo transformations remain pending; sources remain metadata_verified via seed mirroring.
`;

await mkdir(path.join(root, "artifacts"), { recursive: true });
await writeFile(path.join(root, "artifacts", "source-pack-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(root, "docs", "SOURCE_PACK_AUDIT.md"), markdown);
console.log(`Source pack audit ${report.passed ? "PASSED" : "FAILED"}: ${errors.length} error(s), ${warnings.length} warning(s).`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);
if (!report.passed) process.exit(1);
