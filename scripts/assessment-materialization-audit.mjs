import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedCaseLabs, stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";

const errors = [];
const lessons = [...stagedConceptLessons, ...stagedMethodLessons];
const assessments = lessons.flatMap((lesson) => [lesson.primaryApply, lesson.remediation, lesson.delayedReview]);
if (lessons.length !== 61) errors.push(`expected 61 formal lessons, got ${lessons.length}`);
if (assessments.length !== 183) errors.push(`expected 183 formal assessments, got ${assessments.length}`);
const concreteData = /\d|患者|供体|样本|事件|风险表|效应|CI|FDR|批次|中心|时间|比例|loading|方差|阈值|队列|病例|对照/;

for (const lesson of lessons) {
  const assets = [lesson.primaryApply, lesson.remediation, lesson.delayedReview];
  for (const asset of assets) {
    const material = asset.materialization;
    if (!material || material.contentVersion !== "m019.1") { errors.push(`${asset.id} lacks M019.1 materialization`); continue; }
    if (material.independentFactsCn.length !== 4 || new Set(material.independentFactsCn.map((fact) => fact.replace(/\s/g, ""))).size !== 4) errors.push(`${asset.id} requires four distinct independent facts`);
    if (material.independentFactsCn.filter((fact) => concreteData.test(fact)).length < 3) errors.push(`${asset.id} lacks independently solvable concrete data`);
    if (!material.diseaseAreaCn || !material.studyDesignCn || !material.dataModalityCn || !material.representationPurposeCn) errors.push(`${asset.id} lacks context or representation purpose`);
    if (material.authorRationaleCn.length !== asset.expectedOptionIds.length) errors.push(`${asset.id} rationale count does not match the author answer`);
    if (asset.expectedOptionIds.length < 2 || asset.expectedOptionIds.length > 4) errors.push(`${asset.id} has a templated or non-discriminating correct-answer count`);
    if (asset.options.length < asset.expectedOptionIds.length + 2) errors.push(`${asset.id} lacks two plausible distractors`);
    if (asset.stimulus.rowsCn.length !== 4 || new Set(asset.stimulus.rowsCn.map((row) => row.slice(1).join(""))).size !== 4) errors.push(`${asset.id} stimulus is not four-row materialized evidence`);
    for (const option of asset.options) {
      const feedback = asset.optionFeedbackCn[option.id] ?? "";
      if (!asset.expectedOptionIds.includes(option.id) && (!/这里不成立/.test(feedback) || !/可能合理/.test(feedback) || !/本题/.test(feedback))) errors.push(`${asset.id}/${option.id} distractor feedback lacks why/when/here chain`);
    }
  }
  const [apply, remediation, review] = assets.map((asset) => asset.materialization);
  if (apply && review && (apply.diseaseAreaCn === review.diseaseAreaCn || apply.studyDesignCn === review.studyDesignCn || apply.dataModalityCn === review.dataModalityCn)) errors.push(`${lesson.id} delayed review does not change disease, design and modality`);
  if (apply && remediation && apply.representationPurposeCn === remediation.representationPurposeCn) errors.push(`${lesson.id} remediation does not use a new representation`);
  if (new Set(assets.map((asset) => asset.stimulus.format)).size < 3) errors.push(`${lesson.id} does not use three distinct assessment representations`);
}

for (const lesson of stagedMethodLessons) {
  if (lesson.walkthroughStepsCn.length < 6) errors.push(`${lesson.id} needs a six-step worked walkthrough`);
  if (!lesson.paperReadingExample?.snippetCn || lesson.paperReadingExample.snippetCn.length < 30 || lesson.paperReadingExample.readerChecksCn.length < 3) errors.push(`${lesson.id} lacks a usable paper-reading exercise`);
  if (!lesson.methodComparisonCn?.length || lesson.methodComparisonCn.some((item) => !item.alternativeCn || !item.chooseThisWhenCn || !item.chooseAlternativeWhenCn)) errors.push(`${lesson.id} lacks an explicit method choice comparison`);
}

for (const caseLab of stagedCaseLabs) {
  for (const stage of caseLab.stages) {
    const update = stage.informationUpdate;
    if (!update || !update.strengthenedCn.length || !update.weakenedCn.length || !update.unresolvedCn.length || !update.forcingEvidenceCn) errors.push(`${caseLab.id}/${stage.id} does not change the information state`);
    if (update && /还需要更多证据|仍需更多证据/.test(JSON.stringify(update))) errors.push(`${caseLab.id}/${stage.id} uses a generic more-evidence update`);
  }
  if (new Set(caseLab.stages.map((stage) => stage.informationUpdate?.forcingEvidenceCn)).size !== caseLab.stages.length) errors.push(`${caseLab.id} repeats forcing evidence across stages`);
}

const correctCountDistribution = Object.fromEntries([2, 3, 4].map((count) => [count, assessments.filter((asset) => asset.expectedOptionIds.length === count).length]));
for (const count of [2, 3, 4]) if (!correctCountDistribution[count]) errors.push(`no assessments use ${count} correct decisions`);
const report = { schemaVersion: 1, status: errors.length ? "FAIL" : "PASS", counts: { lessons: lessons.length, assessments: assessments.length, caseLabs: stagedCaseLabs.length, fullyMaterialized: assessments.filter((asset) => asset.materialization?.contentVersion === "m019.1").length, correctCountDistribution }, errors };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/assessment-materialization-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Assessment materialization audit: ${report.status} (${report.counts.fullyMaterialized}/${assessments.length})`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
