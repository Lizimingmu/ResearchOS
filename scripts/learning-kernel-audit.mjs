import fs from "node:fs";
import path from "node:path";
import { learningUnits, practiceAssetBindings, prerequisiteEdges } from "../.build/data/learningUnits.js";
import { evidenceSources } from "../.build/data/evidence.js";
import { judgmentCards } from "../.build/data/judgmentCards.js";
import { methodConcepts } from "../.build/data/methods.js";
import { problemAtlasClaims } from "../.build/data/problemAtlas.js";
import { validateLearningKernelContent } from "../.build/domain/learningKernel.js";
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
check("every unit has guided/independent/review/far-transfer bindings", learningUnits.every((unit) => ["guided", "independent", "review", "far_transfer"].every((role) => practiceAssetBindings.some((binding) => binding.unitId === unit.id && binding.role === role))));
check("prototype provenance exists", learningUnits.every((unit) => unit.evidenceSourceIds.length > 0 && unit.evidenceSourceIds.every((id) => evidenceSources.some((source) => source.id === id))));
const initialTasks = generateLearningTodayTasks(createInitialState(), new Date("2026-08-28T08:00:00Z"));
check("initial Today contains one explanation", initialTasks.length === 1 && initialTasks[0].activityType === "explanation" && initialTasks[0].unitId === "lu-statistical-unit-v1");
const prompt = buildLearningGenerationPrompt({ topic: "统计单位" });
check("generation prompt forces pending", /verificationStatus=pending/.test(prompt) && /禁止编造 DOI\/PMID/.test(prompt));
check("malformed AI pack is rejected", parseLearningContentPackJson("{").ok === false);
const schedulerSource = fs.readFileSync(path.resolve("src/learning/scheduler.ts"), "utf8");
check("fixed Method+Paper+AI+Problem+Transfer bundle removed", !/paper-skeleton|problemSeed|auditSeed|methodSeed/.test(schedulerSource));
const onboardingSource = fs.readFileSync(path.resolve("src/components/Onboarding.tsx"), "utf8");
check("onboarding teaches n and has no blind baseline", /n 不是表里有多少行/.test(onboardingSource) && !/基线盲测/.test(onboardingSource));

const report = { schemaVersion: 1, auditedAt: "deterministic", checks, failures };
fs.mkdirSync(path.resolve("artifacts"), { recursive: true });
fs.writeFileSync(path.resolve("artifacts/learning-kernel-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Learning Kernel audit: ${checks.length - failures.length}/${checks.length} passed`);
for (const failure of failures) console.error(`FAIL ${failure}`);
if (failures.length) process.exitCode = 1;
