import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedCaseLabs, stagedConceptLessons, stagedMethodLessons, studioTemplates } from "../.build/data/curriculum/index.js";
import { conceptAssessmentMaterial, methodAssessmentMaterial } from "../.build/data/curriculum/assessment-material/index.js";
import { authoredGuideContent } from "../.build/data/self-rescue-guide/content/index.js";
import { selfRescueGuideSections } from "../.build/data/self-rescue-guide/index.js";

const errors = [];
const missingMaterial = [];
const lessons = [...stagedConceptLessons, ...stagedMethodLessons];
const assessments = lessons.flatMap((lesson) => [lesson.primaryApply, lesson.remediation, lesson.delayedReview]);
const guideKeys = authoredGuideContent.map((item) => `${item.moduleId}::${item.titleEn}`);
const ids = [
  ...selfRescueGuideSections.map((item) => item.id),
  ...lessons.map((item) => item.id),
  ...assessments.map((item) => item.id),
  ...stagedCaseLabs.map((item) => item.id),
  ...studioTemplates.map((item) => item.id),
];
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (authoredGuideContent.length !== 288 || selfRescueGuideSections.length !== 288 || new Set(guideKeys).size !== 288) errors.push(`Guide inventory expected 288 authored/rendered/unique, got ${authoredGuideContent.length}/${selfRescueGuideSections.length}/${new Set(guideKeys).size}`);
if (stagedConceptLessons.length !== 40 || Object.keys(conceptAssessmentMaterial).length !== 40) errors.push(`Concept inventory expected 40/40, got ${stagedConceptLessons.length}/${Object.keys(conceptAssessmentMaterial).length}`);
if (stagedMethodLessons.length !== 21 || Object.keys(methodAssessmentMaterial).length !== 21) errors.push(`Method inventory expected 21/21, got ${stagedMethodLessons.length}/${Object.keys(methodAssessmentMaterial).length}`);
if (lessons.length !== 61 || assessments.length !== 183) errors.push(`Formal inventory expected 61/183, got ${lessons.length}/${assessments.length}`);
if (duplicateIds.length) errors.push(`duplicate IDs: ${duplicateIds.join(", ")}`);

for (const item of authoredGuideContent) {
  if (!item.whyItMattersCn || !item.intuitionCn || !item.preciseExplanationCn.length || !item.biomedicalExample?.setupCn || !item.biomedicalExample.dataCn.length || !item.biomedicalExample.reasoningStepsCn.length || !item.misconceptionCn.length || !item.boundaryCn.length) missingMaterial.push(`guide:${item.moduleId}::${item.titleEn}`);
}
for (const lesson of lessons) {
  const assets = [lesson.primaryApply, lesson.remediation, lesson.delayedReview];
  if (new Set(assets.map((asset) => asset.stimulus.format)).size !== 3) missingMaterial.push(`lesson-representations:${lesson.id}`);
  for (const asset of assets) {
    const complete = asset.materialization?.contentVersion === "m019.1"
      && asset.materialization.independentFactsCn.length === 4
      && asset.stimulus.rowsCn.length === 4
      && asset.options.length >= 4
      && asset.expectedOptionIds.length >= 2
      && asset.expectedOptionIds.every((id) => asset.options.some((option) => option.id === id))
      && Object.keys(asset.optionFeedbackCn).length === asset.options.length
      && asset.scoringRule.evidenceExpectations.length === asset.expectedOptionIds.length;
    if (!complete) missingMaterial.push(`assessment:${asset.id}`);
  }
}
for (const lesson of stagedMethodLessons) {
  if (lesson.walkthroughStepsCn.length < 6 || !lesson.paperReadingExample.snippetCn || lesson.paperReadingExample.readerChecksCn.length < 3 || !lesson.methodComparisonCn.length) missingMaterial.push(`method-teaching:${lesson.id}`);
}
if (missingMaterial.length) errors.push(`${missingMaterial.length} records have obvious missing material`);

const blindPacket = JSON.parse(await readFile(path.resolve("artifacts/m019-1-blind-assessment-packet.json"), "utf8"));
const forbiddenBlindKeys = new Set(["expectedOptionIds", "authorRationaleCn", "materialization", "optionFeedbackCn", "scoringRule", "correct", "key"]);
const internalAnswerMetadataLeaks = [];
const visit = (value, location = "packet") => {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenBlindKeys.has(key)) internalAnswerMetadataLeaks.push(`${location}.${key}`);
    visit(child, `${location}.${key}`);
  }
};
visit(blindPacket);
if (blindPacket.itemCount !== 183 || blindPacket.items?.length !== 183) errors.push(`blind packet expected 183 items, got ${blindPacket.itemCount}/${blindPacket.items?.length ?? 0}`);
const blindIds = blindPacket.items?.map((item) => item.assessmentId) ?? [];
if (new Set(blindIds).size !== 183 || assessments.some((asset) => !blindIds.includes(asset.id))) errors.push("blind packet inventory does not exactly match formal assessments");
if (blindPacket.items?.some((item) => !item.options.length || item.options.some((option, index) => option.id !== `O${index + 1}`))) errors.push("blind packet option IDs are not opaque sequential codes");
if (internalAnswerMetadataLeaks.length) errors.push(`blind packet leaks answer metadata at ${internalAnswerMetadataLeaks.slice(0, 5).join(", ")}`);

const tierCounts = Object.fromEntries(["tier1", "tier2", "tier3"].map((tier) => [tier, authoredGuideContent.filter((item) => item.tier === tier).length]));
const report = {
  schemaVersion: 1,
  status: errors.length ? "FAIL" : "PASS",
  counts: {
    guideAuthored: authoredGuideContent.length,
    guideRendered: selfRescueGuideSections.length,
    guideUniqueModuleTopicKeys: new Set(guideKeys).size,
    ...tierCounts,
    conceptLessons: stagedConceptLessons.length,
    conceptAssessmentRoles: stagedConceptLessons.length * 3,
    methodLessons: stagedMethodLessons.length,
    methodAssessmentRoles: stagedMethodLessons.length * 3,
    formalLessons: lessons.length,
    formalAssessmentRoles: assessments.length,
    duplicateIds: duplicateIds.length,
    missingMaterial: missingMaterial.length,
    blindPacketItems: blindPacket.items?.length ?? 0,
    blindMetadataLeaks: internalAnswerMetadataLeaks.length,
  },
  duplicateIds,
  missingMaterial,
  internalAnswerMetadataLeaks,
  errors,
};
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1-content-fill-checkpoint.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`M019.1 content fill checkpoint: ${report.status}`);
console.log(JSON.stringify(report.counts, null, 2));
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
