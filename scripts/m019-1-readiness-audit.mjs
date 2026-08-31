import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedCaseLabs, stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";
import { selfRescueGuideSections } from "../.build/data/self-rescue-guide/index.js";

const root = path.resolve(".");
const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"));
const binding = await readJson("artifacts/m019-1-content-binding.json");
const scientific = await readJson("reviews/m019-1-c1-scientific.json");
const evidence = await readJson("reviews/m019-1-c2-evidence.json");
const pedagogy = await readJson("reviews/m019-1-c3-pedagogy.json");
const solvability = await readJson("artifacts/assessment-solvability-registry.json");
const expectedHashes = {
  guide_snapshot_sha256: binding.guide_snapshot_sha256,
  assessment_snapshot_sha256: binding.assessment_snapshot_sha256,
  source_registry_sha256: binding.source_registry_sha256,
};
const errors = [];
for (const [name, review] of Object.entries({ scientific, evidence, pedagogy })) {
  for (const [key, value] of Object.entries(expectedHashes)) if (review.snapshotHashes?.[key] !== value) errors.push(`${name} decisions are stale at ${key}`);
}

const decisionMap = (review, name) => {
  const map = new Map();
  for (const decision of review.decisions ?? []) {
    if (!decision.contentId || map.has(decision.contentId)) errors.push(`${name} has duplicate or missing contentId ${decision.contentId ?? "<missing>"}`);
    else map.set(decision.contentId, decision);
  }
  return map;
};
const scientificById = decisionMap(scientific, "scientific");
const evidenceById = decisionMap(evidence, "evidence");
const pedagogyById = decisionMap(pedagogy, "pedagogy");
const solveById = new Map((solvability.results ?? []).map((item) => [item.assessmentId, item]));

const guideItems = selfRescueGuideSections.map((item) => ({ kind: "guide", contentId: item.id, titleCn: item.titleCn, sourceIds: item.evidenceSourceIds, lifecycle: item.lifecycle, contentComplete: item.bodyCn.join("").length >= 250, assessmentIds: [] }));
const lessonItems = [...stagedConceptLessons.map((item) => ({ ...item, kind: "concept" })), ...stagedMethodLessons.map((item) => ({ ...item, kind: "method" }))].map((item) => ({
  kind: item.kind, contentId: item.id, titleCn: item.titleCn, sourceIds: item.sourceIds, lifecycle: item.lifecycle,
  contentComplete: Boolean(item.workedExampleCn && item.primaryApply.materialization && item.remediation.materialization && item.delayedReview.materialization),
  assessmentIds: [item.primaryApply.id, item.remediation.id, item.delayedReview.id],
}));
const caseItems = stagedCaseLabs.map((item) => ({
  kind: "case", contentId: item.id, titleCn: item.titleCn, sourceIds: item.sourceIds, lifecycle: item.lifecycle,
  contentComplete: item.stages.every((stage) => stage.informationUpdate.strengthenedCn.length && stage.informationUpdate.weakenedCn.length && stage.informationUpdate.unresolvedCn.length && stage.informationUpdate.forcingEvidenceCn),
  assessmentIds: [],
}));
const inventory = [...guideItems, ...lessonItems, ...caseItems];
const evidenceReadyStatuses = new Set(["DIRECT", "SYNTHESIS"]);
const records = inventory.map((item) => {
  const scienceDecision = scientificById.get(item.contentId);
  const evidenceDecision = evidenceById.get(item.contentId);
  const pedagogyDecision = pedagogyById.get(item.contentId);
  if (!scienceDecision) errors.push(`missing scientific decision ${item.contentId}`);
  if (!evidenceDecision) errors.push(`missing evidence decision ${item.contentId}`);
  if (!pedagogyDecision) errors.push(`missing pedagogy decision ${item.contentId}`);
  const assessmentAgreement = item.assessmentIds.length ? item.assessmentIds.every((id) => solveById.get(id)?.agreement === "AGREE") : null;
  if (item.assessmentIds.some((id) => !solveById.has(id))) errors.push(`missing blind solvability decision for ${item.contentId}`);
  const checklist = {
    contentComplete: item.contentComplete,
    sourceReview: evidenceDecision?.status ?? "MISSING",
    scientificReview: scienceDecision?.status ?? "MISSING",
    pedagogyReview: pedagogyDecision?.status ?? "MISSING",
    assessmentSolvability: assessmentAgreement === null ? "NOT_APPLICABLE" : assessmentAgreement ? "AGREE" : "BLOCKED",
    pendingLifecyclePreserved: item.lifecycle === "pending_review",
  };
  const eligibleForSelectiveApproval = checklist.contentComplete && evidenceReadyStatuses.has(checklist.sourceReview) && checklist.scientificReview === "PASS" && checklist.pedagogyReview === "PASS" && checklist.assessmentSolvability !== "BLOCKED" && checklist.pendingLifecyclePreserved;
  return { ...item, checklist, eligibleForSelectiveApproval, activationState: "pending_user_approval" };
});
for (const item of inventory) if (item.lifecycle !== "pending_review") errors.push(`${item.contentId} escaped pending_review`);
for (const id of scientificById.keys()) if (!inventory.some((item) => item.contentId === id)) errors.push(`orphan scientific decision ${id}`);
for (const id of evidenceById.keys()) if (!inventory.some((item) => item.contentId === id)) errors.push(`orphan evidence decision ${id}`);
for (const id of pedagogyById.keys()) if (!inventory.some((item) => item.contentId === id)) errors.push(`orphan pedagogy decision ${id}`);

const report = {
  schemaVersion: 1,
  status: errors.length ? "FAIL" : "PASS",
  snapshotHashes: expectedHashes,
  counts: {
    total: records.length,
    guide: records.filter((item) => item.kind === "guide").length,
    concept: records.filter((item) => item.kind === "concept").length,
    method: records.filter((item) => item.kind === "method").length,
    case: records.filter((item) => item.kind === "case").length,
    eligibleForSelectiveApproval: records.filter((item) => item.eligibleForSelectiveApproval).length,
    blockedByEvidence: records.filter((item) => !evidenceReadyStatuses.has(item.checklist.sourceReview)).length,
    blockedByScience: records.filter((item) => item.checklist.scientificReview !== "PASS").length,
    blockedByPedagogy: records.filter((item) => item.checklist.pedagogyReview !== "PASS").length,
    blockedBySolvability: records.filter((item) => item.checklist.assessmentSolvability === "BLOCKED").length,
  },
  records,
  errors,
};
await mkdir(path.join(root, "artifacts"), { recursive: true });
await writeFile(path.join(root, "artifacts/m019-1-item-readiness.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`M019.1 readiness audit: ${report.status}; ${report.counts.eligibleForSelectiveApproval}/${report.counts.total} eligible for selective approval`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
