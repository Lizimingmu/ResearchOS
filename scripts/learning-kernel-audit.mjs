import fs from "node:fs";
import path from "node:path";
import { learningUnits, practiceAssetBindings, practiceAssets, prerequisiteEdges } from "../.build/data/learningUnits.js";
import { evidenceSources } from "../.build/data/evidence.js";
import { judgmentCards } from "../.build/data/judgmentCards.js";
import { methodConcepts } from "../.build/data/methods.js";
import { problemAtlasClaims } from "../.build/data/problemAtlas.js";
import { validateLearningKernelContent, validatePracticeAsset } from "../.build/domain/learningKernel.js";
import { createInitialState } from "../.build/state/store.js";
import { generateLearningTodayTasks } from "../.build/learning/scheduler.js";
import { buildLearningGenerationPrompt, parseLearningContentPackJson } from "../.build/services/learningContentExchange.js";
import { sha256 } from "../.build/services/contentStudio.js";

const checks = [];
const failures = [];
const check = (name, condition, detail = "") => {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
};

const assets = new Map([
  ...methodConcepts.map((item) => [`method_concept:${item.id}`, { revision: 1, hash: sha256(item) }]),
  ...judgmentCards.map((item) => [`judgment_card:${item.id}`, { revision: 1, hash: sha256(item) }]),
  ...practiceAssets.map((item) => [`learning_practice:${item.id}`, { revision: item.revision, hash: item.contentHash }]),
]);
const errors = validateLearningKernelContent({
  units: learningUnits,
  edges: prerequisiteEdges,
  bindings: practiceAssetBindings,
  claims: new Set(problemAtlasClaims.map((item) => item.id)),
  sources: new Set(evidenceSources.map((item) => item.id)),
  assets,
});
check("exactly three prototype units", learningUnits.length === 3, `found ${learningUnits.length}`);
check("prototype chain is a DAG with two edges", prerequisiteEdges.length === 2, `found ${prerequisiteEdges.length}`);
check("cross-object schema validation", errors.length === 0, errors.join("; "));
check("every unit is 8–12 minutes", learningUnits.every((unit) => Number.isInteger(unit.estimatedMinutes) && unit.estimatedMinutes >= 8 && unit.estimatedMinutes <= 12));
check("every unit has all disclosure layers", learningUnits.every((unit) => ["understand", "explain", "judge"].every((layer) => unit.blocks.some((block) => block.layer === layer))));
const requiredRoles = ["prediction", "worked", "self_check", "guided", "independent", "review", "far_transfer"];
check("every practice asset passes version/hash/provenance validation", practiceAssets.every((asset) => validatePracticeAsset(asset).length === 0), practiceAssets.flatMap(validatePracticeAsset).join("; "));
check("every binding role matches its practice asset role", practiceAssetBindings.every((binding) => practiceAssets.find((asset) => asset.id === binding.assetId)?.role === binding.role));
check("every unit has all seven lesson/practice roles", learningUnits.every((unit) => requiredRoles.every((role) => practiceAssetBindings.some((binding) => binding.unitId === unit.id && binding.role === role))));
check("review and transfer use unseen assets", learningUnits.every((unit) => {
  const byRole = Object.fromEntries(practiceAssetBindings.filter((binding) => binding.unitId === unit.id).map((binding) => [binding.role, binding.assetId]));
  return byRole.independent !== byRole.review && byRole.independent !== byRole.far_transfer && byRole.review !== byRole.far_transfer;
}));
check("independent/review/transfer assets contain no hints", practiceAssets.filter((asset) => ["independent", "review", "far_transfer"].includes(asset.role)).every((asset) => asset.hints.length === 0));
check("prototype provenance exists", learningUnits.every((unit) => unit.evidenceSourceIds.length > 0 && unit.evidenceSourceIds.every((id) => evidenceSources.some((source) => source.id === id))));
const initialTasks = generateLearningTodayTasks(createInitialState(), new Date("2026-08-28T08:00:00Z"));
check("initial Today contains one explanation", initialTasks.length === 1 && initialTasks[0].activityType === "explanation" && initialTasks[0].unitId === "lu-statistical-unit-v1");
const prompt = buildLearningGenerationPrompt({ topic: "统计单位" });
check("generation prompt forces pending", /verificationStatus=pending/.test(prompt) && /禁止编造 DOI\/PMID/.test(prompt));
check("malformed AI pack is rejected", parseLearningContentPackJson("{").ok === false);
const schedulerSource = fs.readFileSync(path.resolve("src/learning/scheduler.ts"), "utf8");
check("fixed Method+Paper+AI+Problem+Transfer bundle removed", !/paper-skeleton|problemSeed|auditSeed|methodSeed/.test(schedulerSource));
const onboardingSource = fs.readFileSync(path.resolve("src/components/Onboarding.tsx"), "utf8");
check("onboarding captures goal, research context, gaps, time, and project relevance without a baseline quiz", /targetLevel/.test(onboardingSource) && /researchTypes/.test(onboardingSource) && /foundationGaps/.test(onboardingSource) && /dailyMinutes/.test(onboardingSource) && /allowProjectRelevance/.test(onboardingSource) && !/基线盲测|baseline quiz/i.test(onboardingSource));

const report = { schemaVersion: 1, auditedAt: "deterministic", checks, failures };
fs.mkdirSync(path.resolve("artifacts"), { recursive: true });
fs.writeFileSync(path.resolve("artifacts/learning-kernel-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Learning Kernel audit: ${checks.length - failures.length}/${checks.length} passed`);
for (const failure of failures) console.error(`FAIL ${failure}`);
if (failures.length) process.exitCode = 1;
