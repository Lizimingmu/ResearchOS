import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expectedAssessmentSourceCommitSha, stagedAssessmentAssets, stagedAssessmentSnapshotHash, strictBlindItemsFromAssets, strictBlindPacketHash } from "./strict-blind-public-representation.mjs";

const items = strictBlindItemsFromAssets();
const payload = { schemaVersion: 2, sourceCommitSha: expectedAssessmentSourceCommitSha, stagedAssessmentSnapshotHash: stagedAssessmentSnapshotHash(stagedAssessmentAssets), itemCount: items.length, items };
const packet = { ...payload, packetHash: strictBlindPacketHash(payload) };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1-strict-blind-assessment-packet.json"), `${JSON.stringify(packet, null, 2)}\n`, "utf8");
console.log(`Strict blind assessment packet: ${items.length} anonymous items, staged ${packet.stagedAssessmentSnapshotHash}, packet ${packet.packetHash}`);
