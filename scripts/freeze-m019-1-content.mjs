import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedCaseLabs, stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";
import { authoredGuideContent } from "../.build/data/self-rescue-guide/content/index.js";
import { selfRescueGuideSections } from "../.build/data/self-rescue-guide/index.js";
import { evidenceSources } from "../.build/data/evidence.js";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const stable = (value) => JSON.stringify(value, (_key, child) => child && typeof child === "object" && !Array.isArray(child) ? Object.fromEntries(Object.entries(child).sort(([left], [right]) => left.localeCompare(right))) : child);
const guideSnapshot = { schemaVersion: 1, contentVersion: "m019.1", records: authoredGuideContent, renderedSections: selfRescueGuideSections };
const assessmentSnapshot = { schemaVersion: 1, contentVersion: "m019.1", conceptLessons: stagedConceptLessons, methodLessons: stagedMethodLessons, caseLabs: stagedCaseLabs };
const sourceSnapshot = { schemaVersion: 1, sources: evidenceSources };
const guideText = `${JSON.stringify(guideSnapshot, null, 2)}\n`;
const assessmentText = `${JSON.stringify(assessmentSnapshot, null, 2)}\n`;
const sourceCanonical = stable(sourceSnapshot);
const binding = {
  schemaVersion: 1,
  guide_snapshot_sha256: sha256(guideText),
  assessment_snapshot_sha256: sha256(assessmentText),
  source_registry_sha256: sha256(sourceCanonical),
  guide_records: authoredGuideContent.length,
  formal_assessments: [...stagedConceptLessons, ...stagedMethodLessons].length * 3,
  case_labs: stagedCaseLabs.length,
};
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/guide-materialization-snapshot.json"), guideText, "utf8");
await writeFile(path.resolve("artifacts/assessment-materialization-snapshot.json"), assessmentText, "utf8");
await writeFile(path.resolve("artifacts/m019-1-content-binding.json"), `${JSON.stringify(binding, null, 2)}\n`, "utf8");
console.log(`M019.1 content frozen: ${binding.guide_snapshot_sha256} / ${binding.assessment_snapshot_sha256} / ${binding.source_registry_sha256}`);
