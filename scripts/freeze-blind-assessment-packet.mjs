import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const lessons = [...stagedConceptLessons, ...stagedMethodLessons];
const items = lessons.flatMap((lesson) => [lesson.primaryApply, lesson.remediation, lesson.delayedReview].map((asset) => ({
  assessmentId: asset.id,
  lessonId: lesson.id,
  lessonTitleCn: lesson.titleCn,
  role: asset.role,
  scenarioCn: asset.scenarioCn,
  promptCn: asset.promptCn,
  stimulus: asset.stimulus,
  options: asset.options.map((option, index) => ({ id: `O${index + 1}`, labelCn: option.labelCn })),
  maximumAnswerSlots: 4,
})));
const payload = { schemaVersion: 1, frozenAt: "deterministic", itemCount: items.length, items };
const canonical = JSON.stringify(payload);
const packet = { ...payload, packetHash: sha256(canonical) };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1-blind-assessment-packet.json"), `${JSON.stringify(packet, null, 2)}\n`, "utf8");
console.log(`Blind assessment packet: ${items.length} items, ${packet.packetHash}`);
