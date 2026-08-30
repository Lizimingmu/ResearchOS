import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedCaseLabs, stagedConceptLessons, stagedMethodLessons, studioTemplates, curriculumClaims, curriculumContentHashes, curriculumManifest, frozenCurriculumSnapshot } from "../.build/data/curriculum/index.js";
import { selfRescueGuideSections, selfRescueGuideModules } from "../.build/data/self-rescue-guide/index.js";
import { evidenceById } from "../.build/data/evidence.js";

const errors = [];
const warnings = [];
const allIds = [
  ...selfRescueGuideSections.map((item) => item.id), ...curriculumManifest.map((item) => item.id),
  ...stagedConceptLessons.map((item) => item.id), ...stagedMethodLessons.map((item) => item.id),
  ...stagedCaseLabs.map((item) => item.id), ...studioTemplates.map((item) => item.id),
];
const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
if (duplicateIds.length) errors.push(`duplicate IDs: ${[...new Set(duplicateIds)].join(", ")}`);

const expectedModuleCounts = [18, 32, 47, 23, 23, 58, 25, 22, 20, 20];
selfRescueGuideModules.forEach((module, index) => {
  if (module.topics.length !== expectedModuleCounts[index]) errors.push(`${module.id} expected ${expectedModuleCounts[index]} topics, got ${module.topics.length}`);
});
if (selfRescueGuideSections.length !== 288) errors.push(`Guide requires 288 sections, got ${selfRescueGuideSections.length}`);
if (stagedConceptLessons.length < 35 || stagedConceptLessons.length > 45) errors.push(`Concept target 35-45, got ${stagedConceptLessons.length}`);
if (stagedMethodLessons.length < 18 || stagedMethodLessons.length > 25) errors.push(`Method target 18-25, got ${stagedMethodLessons.length}`);
if (stagedCaseLabs.length < 10 || stagedCaseLabs.length > 14) errors.push(`Case target 10-14, got ${stagedCaseLabs.length}`);
if (studioTemplates.length < 13) errors.push(`Studio target >=13, got ${studioTemplates.length}`);

const guideIds = new Set(selfRescueGuideSections.map((item) => item.id));
for (const item of curriculumManifest) {
  if (!guideIds.has(item.guideSectionId)) errors.push(`${item.id} has no Guide section`);
  if (!item.capabilityIds.length) errors.push(`${item.id} has no capabilities`);
  if (!item.sourceRequirements.length) errors.push(`${item.id} has no source requirements`);
  if (item.lifecycle !== "pending_review" || item.verificationStatus !== "pending" || item.contentOrigin !== "ai_generated") errors.push(`${item.id} violates pending provenance`);
}

const candidateIds = new Set([...curriculumManifest.map((item) => item.id), ...stagedConceptLessons.map((item) => item.id), ...stagedMethodLessons.map((item) => item.id)]);
for (const item of [...stagedConceptLessons, ...stagedMethodLessons, ...stagedCaseLabs]) {
  if (!item.capabilityIds.length || !item.sourceIds.length) errors.push(`${item.id} misses capabilities or sources`);
  if (item.lifecycle !== "pending_review" || item.verificationStatus !== "pending" || item.contentOrigin !== "ai_generated") errors.push(`${item.id} may leak into active curriculum`);
  for (const prerequisiteId of item.prerequisiteIds) if (!candidateIds.has(prerequisiteId)) errors.push(`${item.id} unknown prerequisite ${prerequisiteId}`);
  for (const sourceId of item.sourceIds) if (!evidenceById[sourceId]) errors.push(`${item.id} unknown source ${sourceId}`);
}

for (const lesson of stagedConceptLessons) {
  for (const asset of [lesson.primaryApply, lesson.remediation, lesson.delayedReview]) {
    if (asset.hints.length || !asset.confidenceRequired || !asset.responseLocked) errors.push(`${asset.id} violates locked no-hint assessment policy`);
    if (asset.expectedOptionIds.length === 0 || asset.expectedOptionIds.length === asset.options.length) errors.push(`${asset.id} lacks discriminating distractors`);
  }
  const ids = [lesson.primaryApply.id, lesson.remediation.id, lesson.delayedReview.id];
  if (new Set(ids).size !== 3) errors.push(`${lesson.id} reuses assessment assets`);
  if (new Set([lesson.primaryApply.scenarioCn, lesson.remediation.scenarioCn, lesson.delayedReview.scenarioCn]).size !== 3) errors.push(`${lesson.id} reuses scenario wording`);
}

for (const lesson of stagedMethodLessons) {
  const dimensions = [lesson.scientificQuestionCn, lesson.inputsCn, lesson.coreLogicCn, lesson.outputsCn, lesson.assumptionsCn, lesson.appropriateWhenCn, lesson.inappropriateWhenCn, lesson.misusePatternsCn, lesson.reviewerChecksCn, lesson.paperAppearanceCn];
  if (dimensions.some((value) => Array.isArray(value) ? value.length === 0 : value.trim().length === 0)) errors.push(`${lesson.id} misses a required method dimension`);
  if (!lesson.guideSectionIds.length || lesson.guideSectionIds.some((id) => !guideIds.has(id))) errors.push(`${lesson.id} has invalid Guide mapping`);
  for (const asset of [lesson.primaryApply, lesson.remediation, lesson.delayedReview]) {
    if (asset.hints.length || !asset.confidenceRequired || !asset.responseLocked) errors.push(`${asset.id} violates locked no-hint assessment policy`);
    if (asset.expectedOptionIds.length === asset.options.length) errors.push(`${asset.id} lacks distractors`);
  }
}

for (const caseLab of stagedCaseLabs) {
  if (caseLab.stages.length < 4 || caseLab.stages.length > 6) errors.push(`${caseLab.id} requires 4-6 stages`);
  if (caseLab.stages.some((stage) => !stage.reasoningPromptCn || !stage.calibrationCn || !stage.updatePromptCn)) errors.push(`${caseLab.id} has an incomplete stage`);
  if (caseLab.finalTaskCn.length < 4) errors.push(`${caseLab.id} final task is too shallow`);
}

const paragraphs = selfRescueGuideSections.flatMap((section) => section.bodyCn.map((body) => ({ id: section.id, body })));
const exactParagraphs = new Map();
for (const paragraph of paragraphs) exactParagraphs.set(paragraph.body, [...(exactParagraphs.get(paragraph.body) ?? []), paragraph.id]);
for (const [body, ids] of exactParagraphs) if (ids.length > 1 && body.length > 80) errors.push(`duplicated Guide paragraph in ${ids.join(", ")}`);
const guideLengths = selfRescueGuideSections.map((section) => section.bodyCn.join("").length);
selfRescueGuideSections.forEach((section, index) => {
  if (guideLengths[index] < 400) errors.push(`${section.id} is below 400 Chinese-character target (${guideLengths[index]})`);
  if (guideLengths[index] > 1500) warnings.push(`${section.id} exceeds 1500 characters (${guideLengths[index]})`);
  if (!section.titleEn || !/[A-Za-z]/.test(section.titleEn)) errors.push(`${section.id} lacks English terminology bridge`);
  if (/\b(?:TODO|TBD|PLACEHOLDER|lorem ipsum)\b/i.test(JSON.stringify(section))) errors.push(`${section.id} contains placeholder text`);
});

for (const claim of curriculumClaims) {
  if (!claim.sourceIds.length) errors.push(`${claim.id} has no claim-source mapping`);
  for (const sourceId of claim.sourceIds) if (!evidenceById[sourceId]) errors.push(`${claim.id} unknown source ${sourceId}`);
  if (!claim.identifierVerified || !claim.metadataVerified) warnings.push(`${claim.id} source metadata needs verification`);
}

const publicPayload = JSON.stringify(frozenCurriculumSnapshot);
if (/(?:[A-Z]:\\Users\\|D:\\Agents\\|\.codex|patient[_ -]?id|medical record number|private chat|\b1[3-9]\d{9}\b)/i.test(publicPayload)) errors.push("curriculum snapshot contains private path or identifier");
if (/"lifecycle":"active"|"verificationStatus":"verified"/.test(publicPayload)) errors.push("new generated curriculum self-promoted to active/verified");

const report = {
  schemaVersion: 1, auditedAt: "deterministic", status: errors.length ? "FAIL" : "PASS",
  counts: { modules: selfRescueGuideModules.length, guideSections: selfRescueGuideSections.length, manifestItems: curriculumManifest.length, conceptLessons: stagedConceptLessons.length, methodLessons: stagedMethodLessons.length, caseLabs: stagedCaseLabs.length, studioTemplates: studioTemplates.length, claims: curriculumClaims.length },
  guideLength: { min: Math.min(...guideLengths), max: Math.max(...guideLengths), average: Math.round(guideLengths.reduce((sum, value) => sum + value, 0) / guideLengths.length) },
  provenance: { activeGeneratedItems: 0, pendingGeneratedItems: selfRescueGuideSections.length + stagedConceptLessons.length + stagedMethodLessons.length + stagedCaseLabs.length + studioTemplates.length },
  snapshotHashes: curriculumContentHashes,
  errors, warnings,
};
const claimReport = {
  schemaVersion: 1, auditedAt: "deterministic", claims: curriculumClaims,
  counts: { claim_level_review_pending: curriculumClaims.filter((item) => item.supportStatus === "claim_level_review_pending").length },
  errors: errors.filter((item) => /source|claim/i.test(item)), warnings: warnings.filter((item) => /source/i.test(item)),
};
const coverageReport = {
  schemaVersion: 1, auditedAt: "deterministic", status: errors.length ? "FAIL" : "PASS",
  modules: selfRescueGuideModules.map((module) => ({ id: module.id, topics: module.topics.length })),
  mappedManifestItems: curriculumManifest.filter((item) => guideIds.has(item.guideSectionId)).length,
  formalContent: { concepts: stagedConceptLessons.length, methods: stagedMethodLessons.length, cases: stagedCaseLabs.length, studios: studioTemplates.length },
  errors: errors.filter((item) => /Guide|target|module|mapping/i.test(item)),
};
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/curriculum-content-snapshot.json"), `${JSON.stringify(frozenCurriculumSnapshot, null, 2)}\n`, "utf8");
await writeFile(path.resolve("artifacts/curriculum-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(path.resolve("artifacts/guide-coverage-audit.json"), `${JSON.stringify(coverageReport, null, 2)}\n`, "utf8");
await writeFile(path.resolve("artifacts/claim-source-audit.json"), `${JSON.stringify(claimReport, null, 2)}\n`, "utf8");
console.log(`Curriculum audit: ${report.status} (${report.counts.guideSections} Guide, ${report.counts.conceptLessons} Concept, ${report.counts.methodLessons} Method, ${report.counts.caseLabs} Case, ${report.counts.studioTemplates} Studio)`);
console.log(`Guide length: min ${report.guideLength.min}, average ${report.guideLength.average}, max ${report.guideLength.max}`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
