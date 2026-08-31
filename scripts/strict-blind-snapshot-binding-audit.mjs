import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expectedAssessmentSourceCommitSha, stagedAssessmentAssets, stagedAssessmentSnapshotHash, stableJson, strictBlindItemsFromAssets, strictBlindPacketHash } from "./strict-blind-public-representation.mjs";

const packetPath = path.resolve("artifacts/m019-1-strict-blind-assessment-packet.json");
const packet = JSON.parse(await readFile(packetPath, "utf8"));
const reconstructedItems = strictBlindItemsFromAssets(stagedAssessmentAssets);
const mismatches = [];
for (let index = 0; index < Math.max(packet.items?.length ?? 0, reconstructedItems.length); index += 1) {
  const packetItem = packet.items?.[index];
  const currentItem = reconstructedItems[index];
  if (stableJson(packetItem) !== stableJson(currentItem)) mismatches.push({
    anonymousAssessmentId: currentItem?.anonymousAssessmentId ?? packetItem?.anonymousAssessmentId ?? `index-${index}`,
    fields: ["scenario", "stimulus", "options", "maximumSelections"].filter((field) => stableJson(packetItem?.[field]) !== stableJson(currentItem?.[field])),
  });
}

const currentStagedAssessmentSnapshotHash = stagedAssessmentSnapshotHash(stagedAssessmentAssets);
const packetPayload = { schemaVersion: packet.schemaVersion, sourceCommitSha: packet.sourceCommitSha, stagedAssessmentSnapshotHash: packet.stagedAssessmentSnapshotHash, itemCount: packet.itemCount, items: packet.items };
const recomputedPacketHash = strictBlindPacketHash(packetPayload);
const errors = [];
if (reconstructedItems.length !== 183 || packet.items?.length !== 183) errors.push(`expected current/packet inventory 183/183, got ${reconstructedItems.length}/${packet.items?.length ?? 0}`);
if (mismatches.length) errors.push(`${mismatches.length} strict-blind items differ from current staged assets`);
if (packet.sourceCommitSha !== expectedAssessmentSourceCommitSha) errors.push("source commit SHA does not match the frozen assessment-source baseline");
if (packet.stagedAssessmentSnapshotHash !== currentStagedAssessmentSnapshotHash) errors.push("staged-assessment snapshot hash mismatch");
if (packet.packetHash !== recomputedPacketHash) errors.push("strict-blind packet hash mismatch");
const report = {
  schemaVersion: 1,
  status: errors.length ? "FAIL" : "PASS",
  counts: { currentAssets: reconstructedItems.length, packetItems: packet.items?.length ?? 0, boundItems: reconstructedItems.length - mismatches.length, mismatches: mismatches.length },
  hashes: { sourceCommitSha: packet.sourceCommitSha ?? null, stagedAssessmentSnapshotHash: currentStagedAssessmentSnapshotHash, strictBlindPacketHash: packet.packetHash ?? null, recomputedStrictBlindPacketHash: recomputedPacketHash },
  mismatches,
  errors,
};
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1-strict-blind-snapshot-binding-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Strict blind snapshot binding audit: ${report.status} (${report.counts.boundItems}/183 bound, ${report.counts.mismatches} mismatches)`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
