import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { curriculumManifest, stagedCaseLabs, stagedConceptLessons, stagedMethodLessons, studioTemplates } from "../.build/data/curriculum/index.js";
import { selfRescueGuideSections } from "../.build/data/self-rescue-guide/index.js";

const records = [...selfRescueGuideSections, ...curriculumManifest, ...stagedConceptLessons, ...stagedMethodLessons, ...stagedCaseLabs, ...studioTemplates];
const generated = records.filter((item) => item.contentOrigin === "ai_generated");
const activeOrVerified = generated.filter((item) => item.lifecycle === "active" || item.verificationStatus === "verified");
const nonPending = generated.filter((item) => item.lifecycle !== "pending_review" || item.verificationStatus !== "pending");
const errors = [];
if (activeOrVerified.length) errors.push(`${activeOrVerified.length} generated records are active or verified`);
if (nonPending.length) errors.push(`${nonPending.length} generated records are not pending/pending_review`);
const report = { schemaVersion: 1, status: errors.length ? "FAIL" : "PASS", counts: { records: records.length, generated: generated.length, activeOrVerified: activeOrVerified.length, nonPending: nonPending.length }, errors };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1b-generated-lifecycle-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Generated lifecycle audit: ${report.status} (${generated.length} generated, ${activeOrVerified.length} active/verified)`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
