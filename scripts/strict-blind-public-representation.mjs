import { createHash } from "node:crypto";
import { stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";

export const expectedAssessmentSourceCommitSha = "195b53cc1d33f0c15364017041e88a448179415d";
export const stableJson = (value) => JSON.stringify(value, (_key, child) => child && typeof child === "object" && !Array.isArray(child)
  ? Object.fromEntries(Object.entries(child).sort(([left], [right]) => left.localeCompare(right)))
  : child);
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export const stagedAssessmentAssets = [...stagedConceptLessons, ...stagedMethodLessons]
  .flatMap((lesson) => [lesson.primaryApply, lesson.remediation, lesson.delayedReview]);

export const strictBlindItemsFromAssets = (assets = stagedAssessmentAssets) => assets.map((asset, index) => ({
  anonymousAssessmentId: `A${String(index + 1).padStart(3, "0")}`,
  scenario: `${asset.scenarioCn}\n作答要求：${asset.promptCn}`,
  stimulus: asset.stimulus,
  options: asset.options.map((option, optionIndex) => ({ id: `O${optionIndex + 1}`, labelCn: option.labelCn })),
  maximumSelections: asset.expectedOptionIds.length,
}));

export const stagedAssessmentSnapshotHash = (assets = stagedAssessmentAssets) => sha256(stableJson(assets));
export const strictBlindPacketHash = (packetWithoutHash) => sha256(stableJson(packetWithoutHash));
