import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedCaseLabs, stagedConceptLessons, stagedMethodLessons, studioTemplates, curriculumClaims, curriculumContentHashes, curriculumManifest, frozenCurriculumSnapshot } from "../.build/data/curriculum/index.js";
import { selfRescueGuideSections, selfRescueGuideModules } from "../.build/data/self-rescue-guide/index.js";
import { authoredGuideContent } from "../.build/data/self-rescue-guide/content/index.js";
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
  if (!/[\u3400-\u9fff]/.test(lesson.titleCn)) errors.push(`${lesson.id} is not Chinese-first`);
  if (lesson.workedExampleCn.length < 38 || !/\d|→|×|CI|DAG|表|图|时间|队列|样本|模型|流程|矩阵|曲线|变量|数据/.test(lesson.workedExampleCn)) errors.push(`${lesson.id} lacks a concrete worked example`);
  if (lesson.primaryApply.scenarioCn === lesson.workedExampleCn) errors.push(`${lesson.id} leaks the worked example into primary Apply`);
  for (const asset of [lesson.primaryApply, lesson.remediation, lesson.delayedReview]) {
    if (asset.hints.length || !asset.confidenceRequired || !asset.responseLocked) errors.push(`${asset.id} violates locked no-hint assessment policy`);
    if (asset.expectedOptionIds.length === 0 || asset.expectedOptionIds.length === asset.options.length) errors.push(`${asset.id} lacks discriminating distractors`);
    if (asset.stimulus.rowsCn.length < 3 || asset.stimulus.columnsCn.length < 3) errors.push(`${asset.id} lacks a renderable stimulus table`);
    if (asset.scoringRule.minimumEvidenceUnits !== asset.expectedOptionIds.length || !asset.scoringRule.criticalErrorOptionIds.length || !asset.scoringRule.changeMindCriteriaCn.length || !asset.scoringRule.changeMindActionMarkersCn.length || Object.keys(asset.optionFeedbackCn).length !== asset.options.length) errors.push(`${asset.id} lacks diagnostic scoring and option feedback`);
    if (asset.scoringRule.evidenceExpectations.length !== asset.expectedOptionIds.length || asset.scoringRule.evidenceExpectations.some((expectation) => !asset.expectedOptionIds.includes(expectation.optionId) || expectation.allowedRowIds.length !== 1 || !expectation.requiredFactFragmentsCn.length || !expectation.reasoningMarkersCn.length)) errors.push(`${asset.id} lacks option-specific evidence expectations`);
    if (new Set(asset.scoringRule.evidenceExpectations.flatMap((expectation) => expectation.allowedRowIds)).size !== asset.expectedOptionIds.length) errors.push(`${asset.id} reuses one material row for multiple correct decisions`);
    if (new Set(Object.values(asset.optionFeedbackCn)).size < asset.options.length) errors.push(`${asset.id} reuses generic option feedback`);
  }
  const ids = [lesson.primaryApply.id, lesson.remediation.id, lesson.delayedReview.id];
  if (new Set(ids).size !== 3) errors.push(`${lesson.id} reuses assessment assets`);
  if (new Set([lesson.primaryApply.scenarioCn, lesson.remediation.scenarioCn, lesson.delayedReview.scenarioCn]).size !== 3) errors.push(`${lesson.id} reuses scenario wording`);
  if (new Set([lesson.primaryApply.stimulus.format, lesson.remediation.stimulus.format, lesson.delayedReview.stimulus.format]).size !== 3) errors.push(`${lesson.id} reuses one stimulus representation`);
  if ([lesson.primaryApply, lesson.remediation, lesson.delayedReview].some((asset) => asset.promptCn.includes(lesson.titleCn) || /本题聚焦/.test(asset.scenarioCn))) errors.push(`${lesson.id} assessment leaks the concept label`);
}

for (const lesson of stagedMethodLessons) {
  const dimensions = [lesson.scientificQuestionCn, lesson.inputsCn, lesson.coreLogicCn, lesson.outputsCn, lesson.assumptionsCn, lesson.appropriateWhenCn, lesson.inappropriateWhenCn, lesson.misusePatternsCn, lesson.reviewerChecksCn, lesson.paperAppearanceCn];
  if (dimensions.some((value) => Array.isArray(value) ? value.length === 0 : value.trim().length === 0)) errors.push(`${lesson.id} misses a required method dimension`);
  if (!lesson.guideSectionIds.length || lesson.guideSectionIds.some((id) => !guideIds.has(id))) errors.push(`${lesson.id} has invalid Guide mapping`);
  if (lesson.intuitionCn.length < 24 || lesson.workedExampleCn.length < 40 || lesson.walkthroughStepsCn.length < 6) errors.push(`${lesson.id} lacks intuition or a six-step worked reasoning walkthrough`);
  if (!lesson.paperReadingExample?.snippetCn || lesson.paperReadingExample.snippetCn.length < 30 || lesson.paperReadingExample.readerChecksCn.length < 3) errors.push(`${lesson.id} lacks a materialized paper-reading example`);
  if (!lesson.methodComparisonCn?.length || lesson.methodComparisonCn.some((item) => !item.alternativeCn || !item.chooseThisWhenCn || !item.chooseAlternativeWhenCn)) errors.push(`${lesson.id} lacks a materialized method comparison`);
  for (const asset of [lesson.primaryApply, lesson.remediation, lesson.delayedReview]) {
    if (asset.hints.length || !asset.confidenceRequired || !asset.responseLocked) errors.push(`${asset.id} violates locked no-hint assessment policy`);
    if (asset.expectedOptionIds.length === asset.options.length) errors.push(`${asset.id} lacks distractors`);
    if (asset.stimulus.rowsCn.length < 3 || asset.stimulus.columnsCn.length < 3) errors.push(`${asset.id} lacks a renderable stimulus table`);
    if (asset.scoringRule.minimumEvidenceUnits !== asset.expectedOptionIds.length || !asset.scoringRule.criticalErrorOptionIds.length || !asset.scoringRule.changeMindCriteriaCn.length || !asset.scoringRule.changeMindActionMarkersCn.length || Object.keys(asset.optionFeedbackCn).length !== asset.options.length) errors.push(`${asset.id} lacks diagnostic scoring and option feedback`);
    if (asset.scoringRule.evidenceExpectations.length !== asset.expectedOptionIds.length || asset.scoringRule.evidenceExpectations.some((expectation) => !asset.expectedOptionIds.includes(expectation.optionId) || expectation.allowedRowIds.length !== 1 || !expectation.requiredFactFragmentsCn.length || !expectation.reasoningMarkersCn.length)) errors.push(`${asset.id} lacks option-specific evidence expectations`);
    if (new Set(asset.scoringRule.evidenceExpectations.flatMap((expectation) => expectation.allowedRowIds)).size !== asset.expectedOptionIds.length) errors.push(`${asset.id} reuses one material row for multiple correct decisions`);
    if (new Set(Object.values(asset.optionFeedbackCn)).size < asset.options.length) errors.push(`${asset.id} reuses generic option feedback`);
    if (asset.stimulus.rowsCn.some((row) => row[1] === asset.scenarioCn)) errors.push(`${asset.id} repeats a scenario instead of materializing its stimulus`);
  }
  if (new Set([lesson.primaryApply.stimulus.format, lesson.remediation.stimulus.format, lesson.delayedReview.stimulus.format]).size !== 3) errors.push(`${lesson.id} reuses one stimulus representation`);
}

if (new Set(stagedCaseLabs.map((caseLab) => caseLab.stages.at(-1)?.calibrationCn)).size !== stagedCaseLabs.length) errors.push("Case labs reuse one generic final calibration claim");

for (const caseLab of stagedCaseLabs) {
  if (caseLab.stages.length < 4 || caseLab.stages.length > 6) errors.push(`${caseLab.id} requires 4-6 stages`);
  if (caseLab.stages.some((stage) => !stage.reasoningPromptCn || !stage.calibrationCn || !stage.updatePromptCn)) errors.push(`${caseLab.id} has an incomplete stage`);
  if (caseLab.finalTaskCn.length < 3) errors.push(`${caseLab.id} final task is too shallow`);
  if (caseLab.stages.some((stage) => !stage.informationUpdate || !stage.informationUpdate.strengthenedCn.length || !stage.informationUpdate.weakenedCn.length || !stage.informationUpdate.unresolvedCn.length || !stage.informationUpdate.forcingEvidenceCn)) errors.push(`${caseLab.id} does not explicitly change information state at every stage`);
}

const paragraphs = selfRescueGuideSections.flatMap((section) => section.bodyCn.map((body) => ({ id: section.id, body })));
const exactParagraphs = new Map();
for (const paragraph of paragraphs) exactParagraphs.set(paragraph.body, [...(exactParagraphs.get(paragraph.body) ?? []), paragraph.id]);
for (const [body, ids] of exactParagraphs) if (ids.length > 1 && body.length > 80) errors.push(`duplicated Guide paragraph in ${ids.join(", ")}`);
const guideLengths = selfRescueGuideSections.map((section) => section.bodyCn.join("").length);
const guideTierByTopic = new Map(authoredGuideContent.map((item) => [`${item.moduleId}::${item.titleEn}`, item.tier]));
const guideTierBounds = { tier1: [800, 1500], tier2: [500, 900], tier3: [250, 600] };
selfRescueGuideSections.forEach((section, index) => {
  const tier = guideTierByTopic.get(`${section.chapterId}::${section.titleEn}`);
  const [minimum, maximum] = guideTierBounds[tier] ?? [250, 1500];
  if (guideLengths[index] < minimum || guideLengths[index] > maximum) errors.push(`${section.id} ${tier ?? "unknown tier"} length ${guideLengths[index]} outside ${minimum}-${maximum}`);
  if (!section.titleEn || !/[A-Za-z]/.test(section.titleEn)) errors.push(`${section.id} lacks English terminology bridge`);
  if (/\b(?:TODO|TBD|PLACEHOLDER|lorem ipsum)\b/i.test(JSON.stringify(section))) errors.push(`${section.id} contains placeholder text`);
});

for (const claim of curriculumClaims) {
  if (!claim.sourceIds.length) errors.push(`${claim.id} has no claim-source mapping`);
  for (const sourceId of claim.sourceIds) if (!evidenceById[sourceId]) errors.push(`${claim.id} unknown source ${sourceId}`);
  if (!claim.identifierVerified || !claim.metadataVerified) warnings.push(`${claim.id} source metadata needs verification`);
  if (claim.supportMode !== "curriculum_synthesis") errors.push(`${claim.id} generated prose is not visibly marked as synthesis`);
  if (!claim.evidenceBoundaryCn) errors.push(`${claim.id} has no explicit evidence boundary`);
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
