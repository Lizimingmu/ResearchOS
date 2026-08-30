import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  guideSections,
  conceptLessons,
  learningArchitectureKernelUnits,
  learningArchitecturePracticeBindings,
  learningArchitecturePracticeAssets,
  learningContentRegistry,
  researchCases,
} from "../.build/data/learningArchitecture.js";
import { learningUnits } from "../.build/data/learningUnits.js";
import { unitCapabilityMap, validateLearningContentRegistry } from "../.build/domain/learningArchitecture.js";
import { validateBinding, validatePracticeAsset } from "../.build/domain/learningKernel.js";

const knownUnitIds = new Set([...learningUnits, ...learningArchitectureKernelUnits].map((unit) => unit.id));
const errors = validateLearningContentRegistry({
  registry: learningContentRegistry,
  assets: learningArchitecturePracticeAssets,
  guideSections,
  cases: researchCases,
  conceptLessons,
  knownUnitIds,
  unitCapabilityMapping: unitCapabilityMap,
});
errors.push(...learningArchitecturePracticeAssets.flatMap((asset) => validatePracticeAsset(asset)));
const assetMap = new Map(learningArchitecturePracticeAssets.map((asset) => [`learning_practice:${asset.id}`, { revision: asset.revision, hash: asset.contentHash }]));
errors.push(...learningArchitecturePracticeBindings.flatMap((binding) => validateBinding(binding, { units: knownUnitIds, assets: assetMap })));
const report = {
  schemaVersion: 1,
  auditedAt: "deterministic",
  registryEntries: learningContentRegistry.length,
  practiceAssets: learningArchitecturePracticeAssets.length,
  errors,
};
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m018-registry-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`M018 registry audit: ${errors.length === 0 ? "PASS" : "FAIL"} (${learningContentRegistry.length} entries, ${learningArchitecturePracticeAssets.length} assets)`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
