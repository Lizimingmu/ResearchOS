import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applySourcePackImport, dryRunSourcePack, evaluateScientificCompleteness, parseSourcePackJsonSafe, validateSourcePackUnknown } from "../.build/services/sourcePack.js";
import { convertLegacyCorpus, dryRunStagingPack, validateStagingPack } from "../.build/services/legacyStaging.js";
import { demoSourcePack } from "../.build/data/problemAtlas.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packDirEnv = process.env.M013_PACK_DIR;
const packDir = packDirEnv ? path.resolve(packDirEnv) : path.join(root, "test-fixtures", "m013-legacy", "ResearchOS_M013_COMPLETE");
const archiveName = "ResearchOS_M013_COMPLETE_SourcePacks_20260824.zip";
const failures = [];
const checks = [];
const check = (name, passed, detail) => { checks.push({ name, passed: Boolean(passed), detail }); if (!passed) failures.push(`${name}: ${detail}`); };
const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

const emptyAtlas = () => ({
  problemAtlasSources: [], problemAtlasClaims: [], problemCards: [], diagnosticCauses: [],
  diagnosticChecks: [], diagnosticPaths: [], diagnosticEvidence: [], problemTrainingCases: [],
  diagnosticSessions: [], sourcePackImports: [], problemSearchLog: [],
});

if (!existsSync(packDir)) {
  console.error(`M013 pack directory missing: ${packDir}`);
  console.error("Set M013_PACK_DIR to the extracted ResearchOS_M013_COMPLETE directory.");
  process.exit(1);
}

const batchDirs = (await readdir(packDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const originalPacks = [];
for (const batchDir of batchDirs) {
  const dir = path.join(packDir, batchDir);
  const jsonName = (await readdir(dir)).find((name) => name.endsWith("_SourcePack.json"));
  if (!jsonName) { failures.push(`batch ${batchDir}: no SourcePack.json`); continue; }
  const filePath = path.join(dir, jsonName);
  const raw = await readFile(filePath, "utf8");
  let manifestHash = null;
  try {
    const manifest = JSON.parse(await readFile(path.join(dir, "SHA256_MANIFEST.json"), "utf8"));
    const entry = manifest.files?.find((item) => item.name === jsonName);
    manifestHash = entry?.sha256 ?? null;
  } catch { /* manifest missing is reported below */ }
  const actualHash = sha256(raw);
  const parseResult = parseSourcePackJsonSafe(raw);
  let validation = null;
  let threw = false;
  try {
    validation = parseResult.ok ? validateSourcePackUnknown(parseResult.doc) : null;
  } catch (error) {
    threw = true;
    failures.push(`batch ${batchDir}: validator threw ${String(error)}`);
  }
  const errorCodes = {};
  for (const failureItem of validation?.failures ?? []) errorCodes[failureItem.code] = (errorCodes[failureItem.code] ?? 0) + 1;
  const packId = parseResult.ok ? parseResult.doc.packId : "unknown";
  originalPacks.push({
    batchDir, packId, fileName: jsonName,
    sha256Verified: manifestHash !== null && manifestHash === actualHash,
    parsed: parseResult.ok,
    threw,
    structuralPass: Boolean(validation && validation.errors.length === 0),
    failureCount: validation?.failures.length ?? 0,
    errorCodes,
  });
}

check("original archive contains 8 legacy packs", originalPacks.length === 8, `${originalPacks.length} packs`);
check("original pack SHA256 verified", originalPacks.every((entry) => entry.sha256Verified), originalPacks.filter((entry) => !entry.sha256Verified).map((entry) => entry.batchDir).join(", ") || "all verified");
check("original packs parse", originalPacks.every((entry) => entry.parsed), "all parsed");
check("validator never throws on originals", originalPacks.every((entry) => !entry.threw), "no crash");
check("all 8 originals return structured rejection", originalPacks.every((entry) => !entry.structuralPass && entry.failureCount > 0), originalPacks.map((entry) => `${entry.batchDir}:${entry.failureCount}`).join(", "));

const inputs = originalPacks.map((entry, index) => {
  const batchDir = entry.batchDir;
  const jsonName = entry.fileName;
  return { packId: entry.packId, fileName: jsonName, value: null, sha256: null };
});
// Re-read values (avoid keeping 8 raw JSON strings in memory twice)
for (let index = 0; index < inputs.length; index += 1) {
  const entry = originalPacks[index];
  const filePath = path.join(packDir, entry.batchDir, entry.fileName);
  inputs[index] = {
    packId: entry.packId,
    fileName: entry.fileName,
    value: JSON.parse(await readFile(filePath, "utf8")),
    sha256: sha256(await readFile(filePath, "utf8")),
  };
}

const conversion = convertLegacyCorpus(inputs, { archive: archiveName, now: new Date().toISOString() });
check("corpus conversion succeeds", conversion.ok, conversion.failure?.message ?? "ok");
check("8 staging documents produced", conversion.packs.length === 8, `${conversion.packs.length} staging docs`);

const canon = conversion.audit.sourceCanonicalization;
check("6 DOI collisions canonicalized", canon.doiCollisions.length === 6, JSON.stringify(canon.doiCollisions.map((entry) => `${entry.canonicalId}<=${entry.originalIds.join("|")}`)));
check("6 PMID collisions canonicalized", canon.pmidCollisions.length === 6, `${canon.pmidCollisions.length} pmid merges`);
check("4 normalized-title duplicates canonicalized", canon.titleCollisions.length === 4, `${canon.titleCollisions.length} title merges`);
check("collision-free after canonicalization", canon.collisionFreeAfterMerge === true, "collision-free");
const uniqueSourceCount = new Set(conversion.packs.flatMap((pack) => pack.sources.map((source) => source.id))).size;
const cardBoundaryGaps = conversion.packs.flatMap((pack) => pack.problemCards).filter((card) => typeof card.claimBoundary !== "string" || card.claimBoundary.trim() === "").length;
const cardReasoningGaps = conversion.packs.flatMap((pack) => pack.problemCards).filter((card) => !Array.isArray(card.recommendedReasoning) || card.recommendedReasoning.length === 0).length;
check("merged source registry size = 120 - 6", uniqueSourceCount === 114, `unique sources=${uniqueSourceCount}`);
check("claims total 138", conversion.audit.total.evidenceClaims === 138, `claims=${conversion.audit.total.evidenceClaims}`);
check("cards total 166", conversion.audit.total.problemCards === 166, `cards=${conversion.audit.total.problemCards}`);
check("foreign keys rewritten for merged sources", conversion.audit.foreignKeyRewrites.length > 0, `${conversion.audit.foreignKeyRewrites.length} rewrites`);
const metadataPatches = conversion.audit.metadataPatches;
check("DESpace URL corrected", metadataPatches.some((entry) => entry.rowId === "SRC-DESPACE-2024" && entry.field === "url" && entry.to === "https://pmc.ncbi.nlm.nih.gov/articles/PMC10868334/"), JSON.stringify(metadataPatches.filter((entry) => entry.rowId === "SRC-DESPACE-2024")));
check("6 formal-title corrections applied", metadataPatches.filter((entry) => entry.field === "title").length === 6, JSON.stringify(metadataPatches.filter((entry) => entry.field === "title").map((entry) => entry.rowId)));

const registrySeeded = applySourcePackImport(emptyAtlas(), demoSourcePack, { allowUpdates: true });
const registry = { ...emptyAtlas(), ...registrySeeded.collections, sourcePackImports: [registrySeeded.importRecord] };

const stagingResults = [];
const gapCodeCounts = {};
let problemTypeCounts = { diagnostic: 0, judgment: 0, audit: 0, unclassified: 0 };
let pendingCounts = { sources: 0, claims: 0, cards: 0, transferCases: 0 };
for (const staging of conversion.packs) {
  const structural = validateStagingPack(staging);
  const dry = dryRunStagingPack(staging, registry);
  const completeness = dry.scientificCompleteness;
  for (const gap of completeness.gaps ?? []) gapCodeCounts[gap.code] = (gapCodeCounts[gap.code] ?? 0) + 1;
  for (const card of staging.problemCards) problemTypeCounts[card.problemType] = (problemTypeCounts[card.problemType] ?? 0) + 1;
  for (const source of staging.sources) if (source.verificationStatus === "pending") pendingCounts.sources += 1;
  pendingCounts.claims += staging.evidenceClaims.filter((claim) => claim.verificationStatus === "pending").length;
  pendingCounts.cards += staging.problemCards.filter((card) => card.verificationStatus === "pending").length;
  pendingCounts.transferCases += staging.transferCases.filter((transfer) => transfer.verificationStatus === "pending").length;
  stagingResults.push({
    packId: staging.sourcePackId,
    stagingId: staging.stagingId,
    structuralValid: structural.valid,
    structuralFailures: structural.failures.map((failureItem) => `${failureItem.code} ${failureItem.location}`),
    structuralWarnings: structural.warnings.map((warningItem) => `${warningItem.code} ${warningItem.location}: ${warningItem.message}`),
    internalCollisions: dry.internalCollisions,
    registryConflicts: dry.registryConflicts,
    importEligible: dry.importEligible,
    completeness: {
      status: completeness.status,
      counts: completeness.counts,
    },
  });
  check(`staging ${staging.sourcePackId} structurally valid`, structural.valid, JSON.stringify(structural.failures.slice(0, 5)));
  check(`staging ${staging.sourcePackId} internally collision-free`, dry.internalCollisions.length === 0, dry.internalCollisions.join("; ") || "clean");
  check(`staging ${staging.sourcePackId} import-ineligible`, dry.importEligible === false, "importEligible=false");
  check(`staging ${staging.sourcePackId} scientifically patch-required`, completeness.status === "scientific_patch_required", completeness.status);
}

check("problemType rows: 166 unclassified, 0 classified", problemTypeCounts.unclassified === 166 && problemTypeCounts.diagnostic + problemTypeCounts.judgment + problemTypeCounts.audit === 0, JSON.stringify(problemTypeCounts));
check("claims missing scope = 86", gapCodeCounts.CLAIM_MISSING_SCOPE === 86, `${gapCodeCounts.CLAIM_MISSING_SCOPE}`);
check("claims missing qualification = 88", gapCodeCounts.CLAIM_MISSING_QUALIFICATION === 88, `${gapCodeCounts.CLAIM_MISSING_QUALIFICATION}`);
check("claims missing reviewerNote = 18", gapCodeCounts.CLAIM_MISSING_REVIEWER_NOTE === 18, `${gapCodeCounts.CLAIM_MISSING_REVIEWER_NOTE}`);
const preMergeMissingProvenance = inputs.reduce((sum, input) => sum + (Array.isArray(input.value.sources) ? input.value.sources.filter((source) => !source || typeof source.provenanceNote !== "string" || source.provenanceNote.trim() === "").length : 0), 0);
check("sources missing provenanceNote before merge = 50", preMergeMissingProvenance === 50, `${preMergeMissingProvenance}`);
check("sources missing provenanceNote after canonicalization = 48", gapCodeCounts.SOURCE_MISSING_PROVENANCE === 48, `${gapCodeCounts.SOURCE_MISSING_PROVENANCE}`);
check("cards missing claim boundary = 111 (staged-missing/empty, type-required)", cardBoundaryGaps === 111, `${cardBoundaryGaps}`);
check("cards missing recommended reasoning = 79 (staged-missing/empty, type-required)", cardReasoningGaps === 79, `${cardReasoningGaps}`);
check("cards unclassified = 166", gapCodeCounts.CARD_UNCLASSIFIED === 166, `${gapCodeCounts.CARD_UNCLASSIFIED}`);
check("cards missing knowledge status = 166", gapCodeCounts.CARD_MISSING_KNOWLEDGE_STATUS === 166, `${gapCodeCounts.CARD_MISSING_KNOWLEDGE_STATUS}`);
check("all staged verification statuses remain pending", pendingCounts.sources === conversion.audit.total.sources && pendingCounts.claims === 138 && pendingCounts.cards === 166, JSON.stringify(pendingCounts));

const demoValidation = validateSourcePackUnknown(demoSourcePack);
const demoCompleteness = evaluateScientificCompleteness(demoSourcePack);
const demoDryRun = dryRunSourcePack(demoSourcePack, emptyAtlas());
check("demo pack structurally valid", demoValidation.errors.length === 0, demoValidation.errors.join("; ") || "clean");
check("demo pack scientifically complete", demoCompleteness.status === "scientifically_complete", demoCompleteness.status);
check("demo pack import-eligible (two gates separated)", demoDryRun.importEligible === true, `importEligible=${demoDryRun.importEligible}`);

const outputDir = path.join(root, "artifacts", "m013-v3-staging");
await mkdir(outputDir, { recursive: true });
for (const staging of conversion.packs) {
  await writeFile(path.join(outputDir, `${staging.stagingId}.json`), `${JSON.stringify(staging, null, 2)}\n`, "utf8");
}
const corpusAudit = { generatedAt: new Date().toISOString(), archive: archiveName, audit: conversion.audit };
await writeFile(path.join(outputDir, "corpus-audit.json"), `${JSON.stringify(corpusAudit, null, 2)}\n`, "utf8");

const report = {
  generatedAt: new Date().toISOString(),
  archive: archiveName,
  contract: { passed: failures.length === 0, failures },
  checks,
  originalPacks,
  conversion: {
    ok: conversion.ok,
    packs: conversion.packs.length,
    totals: conversion.audit.total,
    uniqueSourceCount,
    cardBoundaryGaps,
    cardReasoningGaps,
    preMergeMissingProvenance,
    metadataPatches: conversion.audit.metadataPatches,
    canonicalization: {
      doiCollisions: canon.doiCollisions.map((entry) => ({ canonicalId: entry.canonicalId, keyValue: entry.keyValue, originalIds: entry.originalIds })),
      pmidCollisions: canon.pmidCollisions.map((entry) => ({ canonicalId: entry.canonicalId, keyValue: entry.keyValue, originalIds: entry.originalIds })),
      titleCollisions: canon.titleCollisions.map((entry) => ({ canonicalId: entry.canonicalId, keyValue: entry.keyValue, originalIds: entry.originalIds })),
      collisionFreeAfterMerge: canon.collisionFreeAfterMerge,
    },
    foreignKeyRewrites: conversion.audit.foreignKeyRewrites,
    discardedFieldCounts: conversion.audit.discardedFieldCounts,
    enumLookupTables: conversion.audit.enumLookupTables,
    converterPolicies: conversion.audit.converterPolicies,
  },
  staging: stagingResults,
  problemTypeCounts,
  scientificGapCounts: gapCodeCounts,
  pendingCounts,
  demoPackGate: {
    structuralErrors: demoValidation.errors.length,
    completeness: demoCompleteness.status,
    importEligible: demoDryRun.importEligible,
  },
};

const agentDir = path.join(root, ".agent");
await writeFile(path.join(agentDir, "M013_V3_STAGING_REPORT.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

const md = `# M013 V3 Staging Report — Legacy → v3 Auditable Conversion (M013-10)

Generated: ${report.generatedAt}

## Result

**${failures.length === 0 ? "PASS" : "FAIL"}** — ${failures.length} contract failure(s).

## Safety decision

- Production mutation: **NO**. No apply-import call was made against the legacy corpus; only dry-run staging.
- Verification promotion: **NO**. All staged rows remain \`pending\`; legacy \`metadata_verified\` was demoted to \`pending\`.
- problemType inference: **NO**. All 166 legacy cards are \`unclassified\` (166 unclassified / 0 classified).
- Global "candidate causes >= 3" rule: **NOT APPLIED**. Diagnostic completeness prefers three useful causes but allows two and never manufactures a third.

## Original legacy packs (untouched)

| Pack | SHA256 | Parse | Structural | Failures |
|---|---|---|---|---|
${report.originalPacks.map((entry) => `| ${entry.packId} | ${entry.sha256Verified ? "PASS" : "FAIL"} | ${entry.parsed ? "ok" : "fail"} | ${entry.structuralPass ? "pass" : "structured rejection"} | ${entry.failureCount} |`).join("\n")}

- Validator crash: **none** (exception-safe hardened validator; every pack returned deterministic structured failures with codes and locations).

## Staging conversion

- Per-pack rows: sources ${report.conversion.totals.sources} (8 packs), claims ${report.conversion.totals.evidenceClaims}, cards ${report.conversion.totals.problemCards}, causes ${report.conversion.totals.diagnosticCauses}, checks ${report.conversion.totals.diagnosticChecks}, paths ${report.conversion.totals.diagnosticPaths}, evidence ${report.conversion.totals.diagnosticEvidence}, transfer cases ${report.conversion.totals.transferCases}.
- Unique canonical sources after dedup: **${report.conversion.uniqueSourceCount}** (= 120 − 6 DOI merges; PMID/title merges are subsets of the same pairs).
- Source canonicalization: **${report.conversion.canonicalization.doiCollisions.length} DOI** merges, **${report.conversion.canonicalization.pmidCollisions.length} PMID** merges, **${report.conversion.canonicalization.titleCollisions.length} title** merges; collision-free after merge: **${report.conversion.canonicalization.collisionFreeAfterMerge}**.
- Foreign-key rewrites (claim.sourceId → canonical source ID): **${report.conversion.foreignKeyRewrites.length}**.
- Enum lookup tables: importance critical/high/medium → 5/4/3; frequency very_common/common → 4/3 (disclosed, deterministic).

### Codex-approved metadata patches applied (exact, from metadata audit)

| Row | Field | From | To |
|---|---|---|---|
${report.conversion.metadataPatches.map((entry) => `| ${entry.rowId} | ${entry.field} | ${entry.from} | ${entry.to} |`).join("\n")}

- Sources missing provenanceNote: **${report.conversion.preMergeMissingProvenance}** of 120 legacy rows → **${report.scientificGapCounts.SOURCE_MISSING_PROVENANCE ?? 0}** after canonicalization (2 duplicated rows with missing provenance were absorbed into canonical rows that carry provenance).
- Claim-level scientific patches listed in SCIENTIFIC_CHANGESET.md (CLM-QPCR-006, CLM-SP-008, CLM-AI-004, CLM-REV-003, scope/qualification fills) were **NOT applied**: the changeset specifies group-level dispositions, not exact patch text; composing them would rewrite scientific content. They remain for M013-11 classification and type-specific repair.

## Staging dry-run

| Pack | Structural | Internal collisions | Registry conflicts | Import-eligible |
|---|---|---|---|---|
${report.staging.map((entry) => `| ${entry.packId} | ${entry.structuralValid ? "valid" : "INVALID"} | ${entry.internalCollisions.length} | ${entry.registryConflicts.length} | ${entry.importEligible} |`).join("\n")}

Registry conflicts are disclosed only; every staging document is import-ineligible because 166 cards are \`unclassified\` (scientific_patch_required).

Staging warnings (non-blocking, disclosed): supersession references to sources outside the pack (e.g. legacy \`TRIPOD-2015\`, \`CONSORT-2010\`, \`SPIRIT-2013\`, \`MIQE-2009\`, \`CAP-IHC-2014\`) are preserved as unresolved references pending registry-level review — ${report.staging.reduce((sum, entry) => sum + entry.structuralWarnings.length, 0)} warning(s) total.

## Scientific completeness (second gate)

| Code | Count |
|---|---:|
${Object.entries(report.scientificGapCounts).sort().map(([code, count]) => `| ${code} | ${count} |`).join("\n")}

- Status per pack: \`scientific_patch_required\` (8/8). \`scientifically_complete\` does not mean verified; pending content stays pending.
- Demo pack control: structural errors ${report.demoPackGate.structuralErrors}; completeness ${report.demoPackGate.completeness}; importEligible ${report.demoPackGate.importEligible}.

## Converter policies (audited)

${report.conversion.converterPolicies.map((policy) => `- ${policy}`).join("\n")}

## Checks

| Status | Check | Detail |
|---|---|---|
${report.checks.map((entry) => `| ${entry.passed ? "PASS" : "FAIL"} | ${entry.name} | ${entry.detail} |`).join("\n")}
`;

await writeFile(path.join(agentDir, "M013_V3_STAGING_REPORT.md"), md, "utf8");
await writeFile(path.join(root, "artifacts", "m013-v3-staging", "manifest.json"), `${JSON.stringify({ generatedAt: report.generatedAt, archive: archiveName, packs: conversion.packs.map((staging) => ({ stagingId: staging.stagingId, sourcePackId: staging.sourcePackId })) }, null, 2)}\n`, "utf8");

console.log(`M013 staging gate ${failures.length === 0 ? "PASSED" : "FAILED"}: ${checks.length} checks, ${failures.length} failures.`);
for (const failure of failures) console.error(`ERROR: ${failure}`);
if (failures.length) process.exit(1);
