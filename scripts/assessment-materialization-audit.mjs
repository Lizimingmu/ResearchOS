import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedCaseLabs, stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";

const errors = [];
const lessons = [...stagedConceptLessons, ...stagedMethodLessons];
const assessments = lessons.flatMap((lesson) => [lesson.primaryApply, lesson.remediation, lesson.delayedReview]);
if (lessons.length !== 61) errors.push(`expected 61 formal lessons, got ${lessons.length}`);
if (assessments.length !== 183) errors.push(`expected 183 formal assessments, got ${assessments.length}`);
const concreteData = /\d|患者|供体|样本|事件|风险|效应|CI|FDR|批次|中心|时间|比例|loading|方差|阈值|队列|病例|对照|基线|暴露|结局|治疗|测量|模型|变量|算法|分支|关联|调整|复现|数据|标签|代码|指南/;
const validContracts = new Set(["multi_select_audit", "classification", "claim_rewrite", "error_localization", "choose_next_evidence", "ordering_sequence", "integrated_judgment"]);
const obviousDistractorCue = /(?:P|q)\s*[<≤=].*(?:证明|确证|必然)|(?:AI|模型).*(?:完整|合理).*(?:直接执行|无需测试)|(?:所有|一切).*(?:证明|无偏|可靠)/i;
const obviousDistractorFlags = [];
const duplicateDistractorFlags = [];
const materialSpecificityFlags = [];

for (const lesson of lessons) {
  const assets = [lesson.primaryApply, lesson.remediation, lesson.delayedReview];
  for (const asset of assets) {
    const material = asset.materialization;
    if (!material || material.contentVersion !== "m019.1") { errors.push(`${asset.id} lacks M019.1 materialization`); continue; }
    if (material.independentFactsCn.length < 3 || material.independentFactsCn.length > 7 || new Set(material.independentFactsCn.map((fact) => fact.replace(/\s/g, ""))).size !== material.independentFactsCn.length) errors.push(`${asset.id} requires 3-7 distinct independent facts`);
    if (material.independentFactsCn.some((fact) => fact.trim().length < 10) || material.independentFactsCn.filter((fact) => concreteData.test(fact)).length < 2) materialSpecificityFlags.push(asset.id);
    if (!material.diseaseAreaCn || !material.studyDesignCn || !material.dataModalityCn || !material.representationPurposeCn) errors.push(`${asset.id} lacks context or representation purpose`);
    if (material.authorRationaleCn.length !== asset.expectedOptionIds.length) errors.push(`${asset.id} rationale count does not match the author answer`);
    if (!validContracts.has(asset.taskContract)) errors.push(`${asset.id} has an invalid task contract`);
    if (asset.expectedOptionIds.length < 1 || asset.expectedOptionIds.length > 4) errors.push(`${asset.id} has a non-discriminating correct-answer count`);
    if (asset.options.length < asset.expectedOptionIds.length + 2) errors.push(`${asset.id} lacks two plausible distractors`);
    if (asset.stimulus.rowsCn.length !== material.independentFactsCn.length || new Set(asset.stimulus.rowsCn.map((row) => row.slice(1).join(""))).size !== material.independentFactsCn.length) errors.push(`${asset.id} stimulus does not preserve its materialized facts`);
    const authoredDistractors = asset.options.filter((option) => option.id.includes("-distractor-"));
    if (new Set(authoredDistractors.map((option) => option.labelCn.replace(/\s/g, ""))).size !== authoredDistractors.length) duplicateDistractorFlags.push(asset.id);
    for (const option of authoredDistractors) {
      const feedback = asset.optionFeedbackCn[option.id] ?? "";
      if (!/这里不成立/.test(feedback) || !/可能合理/.test(feedback) || !/本题/.test(feedback) || !/边界/.test(feedback)) errors.push(`${asset.id}/${option.id} distractor feedback lacks why/when/here/consequence chain`);
      if (obviousDistractorCue.test(option.labelCn)) obviousDistractorFlags.push({ assessmentId: asset.id, optionId: option.id, labelCn: option.labelCn });
    }
    if (!authoredDistractors.some((option) => !obviousDistractorCue.test(option.labelCn))) errors.push(`${asset.id} lacks a credible near-miss distractor`);
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

const correctCountDistribution = Object.fromEntries([1, 2, 3, 4].map((count) => [count, assessments.filter((asset) => asset.expectedOptionIds.length === count).length]));
const taskContractDistribution = Object.fromEntries([...validContracts].map((contract) => [contract, assessments.filter((asset) => asset.taskContract === contract).length]));
const roleContractDistribution = Object.fromEntries(["apply", "remediation", "review"].map((role) => [role, Object.fromEntries([...validContracts].map((contract) => [contract, assessments.filter((asset) => asset.role === role && asset.taskContract === contract).length]))]));
const instantiatedContractTypes = Object.values(taskContractDistribution).filter(Boolean).length;
const roleContractTypes = Object.fromEntries(Object.entries(roleContractDistribution).map(([role, distribution]) => [role, Object.values(distribution).filter(Boolean).length]));
const variableFactCountAssessments = assessments.filter((asset) => asset.materialization?.independentFactsCn.length !== 4).length;
const multiFactEvidenceMappings = assessments.filter((asset) => asset.scoringRule.evidenceExpectations.some((expectation) => expectation.allowedRowIds.length > 1)).length;
if (instantiatedContractTypes < 5) errors.push(`expected at least 5 task contract types, got ${instantiatedContractTypes}`);
for (const [role, count] of Object.entries(roleContractTypes)) if (count < 2) errors.push(`${role} remains mechanically bound to one task contract`);
if (variableFactCountAssessments < Math.ceil(assessments.length * 0.25)) errors.push(`variable fact count requires >=25%, got ${variableFactCountAssessments}/${assessments.length}`);
if (multiFactEvidenceMappings < Math.ceil(assessments.length * 0.20)) errors.push(`multi-fact reasoning requires >=20%, got ${multiFactEvidenceMappings}/${assessments.length}`);
if (materialSpecificityFlags.length) errors.push(`material specificity flags remain: ${materialSpecificityFlags.join(", ")}`);
if (obviousDistractorFlags.length) errors.push(`${obviousDistractorFlags.length} obvious distractor cues remain`);
if (duplicateDistractorFlags.length) errors.push(`duplicate distractors within assessments: ${duplicateDistractorFlags.join(", ")}`);
const report = { schemaVersion: 3, status: errors.length ? "FAIL" : "PASS", counts: { lessons: lessons.length, assessments: assessments.length, caseLabs: stagedCaseLabs.length, fullyMaterialized: assessments.filter((asset) => asset.materialization?.contentVersion === "m019.1").length, correctCountDistribution, taskContractDistribution, roleContractDistribution, roleContractTypes, instantiatedContractTypes, variableFactCountAssessments, multiFactEvidenceMappings, obviousDistractorFlags: obviousDistractorFlags.length, duplicateDistractorFlags: duplicateDistractorFlags.length, materialSpecificityFlags: materialSpecificityFlags.length }, obviousDistractorFlags, duplicateDistractorFlags, materialSpecificityFlags, errors };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/assessment-materialization-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Assessment materialization audit: ${report.status} (${report.counts.fullyMaterialized}/${assessments.length})`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
