import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const lessons = [...stagedConceptLessons, ...stagedMethodLessons];
const assets = lessons.flatMap((lesson) => [lesson.primaryApply, lesson.remediation, lesson.delayedReview]);
const items = assets.map((asset, index) => {
  const anonymousAssessmentId = `A${String(index + 1).padStart(3, "0")}`;
  return {
    anonymousAssessmentId,
    scenario: `${asset.scenarioCn}\n作答要求：${asset.promptCn}`,
    stimulus: asset.stimulus,
    options: asset.options.map((option, optionIndex) => ({ id: `O${optionIndex + 1}`, labelCn: option.labelCn })),
    maximumSelections: asset.expectedOptionIds.length,
  };
});
const payload = { schemaVersion: 1, itemCount: items.length, items };
const packet = { ...payload, packetHash: sha256(JSON.stringify(payload)) };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1-strict-blind-assessment-packet.json"), `${JSON.stringify(packet, null, 2)}\n`, "utf8");
console.log(`Strict blind assessment packet: ${items.length} anonymous items, ${packet.packetHash}`);
