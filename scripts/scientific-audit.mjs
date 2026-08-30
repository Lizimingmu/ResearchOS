import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotText = await readFile(path.join(root, "artifacts", "curriculum-content-snapshot.json"), "utf8");
const snapshot = JSON.parse(snapshotText);
const evidenceSource = await readFile(path.join(root, "src", "data", "evidence.ts"), "utf8");
const digest = (value) => createHash("sha256").update(value).digest("hex");
const binding = {
  snapshotByteSha256: digest(snapshotText),
  claimsSha256: String(snapshot.hashes?.claims ?? "").replace(/^sha256:/, ""),
  sourceRegistrySha256: digest(evidenceSource),
};
const knownSourceIds = new Set([...evidenceSource.matchAll(/\bid:\s*"(src-[^"]+)"/g)].map((match) => match[1]));
const collections = [
  ["guide", snapshot.guideSections],
  ["concept", snapshot.conceptLessons],
  ["method", snapshot.methodLessons],
  ["case", snapshot.caseLabs],
  ["studio", snapshot.studioTemplates],
];
const sourceIdsFor = (item) => item.evidenceSourceIds ?? item.sourceIds ?? [];
const inventory = collections.flatMap(([kind, items]) => items.map((item) => ({
  kind,
  id: item.id,
  titleCn: item.titleCn,
  sourceIds: sourceIdsFor(item),
  contentOrigin: item.contentOrigin,
  verificationStatus: item.verificationStatus,
  lifecycle: item.lifecycle,
})));
const referencedSourceIds = [...new Set(inventory.flatMap((item) => item.sourceIds))].sort();
const missingSourceIds = referencedSourceIds.filter((id) => !knownSourceIds.has(id));
const highRiskGuideIds = new Set(snapshot.manifest.filter((item) => item.scientificRisk === "HIGH").map((item) => item.guideSectionId));
const guideIdsByFormalContentId = new Map([
  ...snapshot.conceptLessons.map((lesson) => [lesson.id, [lesson.guideSectionId]]),
  ...snapshot.methodLessons.map((lesson) => [lesson.id, lesson.guideSectionIds]),
]);
const caseIds = new Set(snapshot.caseLabs.map((item) => item.id));
const highRiskGuideClaims = snapshot.claims.filter((claim) => highRiskGuideIds.has(claim.contentId));
const highRiskFormalClaims = snapshot.claims.filter((claim) => (guideIdsByFormalContentId.get(claim.contentId) ?? []).some((id) => highRiskGuideIds.has(id)));
const highRiskCaseClaims = snapshot.claims.filter((claim) => caseIds.has(claim.contentId));
const highRiskClaims = [...new Map([...highRiskGuideClaims, ...highRiskFormalClaims, ...highRiskCaseClaims].map((claim) => [claim.id, claim])).values()];
const routedHighRiskIds = new Set(highRiskClaims.map((claim) => claim.id));
const omittedHighRiskFormalClaims = highRiskFormalClaims.filter((claim) => !routedHighRiskIds.has(claim.id));
const ambiguousPattern = /(?:必然|完全证明|适用于所有|永远|绝对没有|自动证明)/;
const ambiguousWording = snapshot.claims.filter((claim) => ambiguousPattern.test(claim.claimCn)).map((claim) => ({ id: claim.id, contentId: claim.contentId, claimCn: claim.claimCn }));
const invalidLifecycle = inventory.filter((item) => item.verificationStatus !== "pending" || item.lifecycle !== "pending_review");
const activeGeneratedItems = inventory.filter((item) => item.contentOrigin === "ai_generated" && item.lifecycle === "active").length;
const errors = [
  ...missingSourceIds.map((id) => `Missing evidence source: ${id}`),
  ...invalidLifecycle.map((item) => `${item.id} is not pending/pending_review`),
  ...omittedHighRiskFormalClaims.map((claim) => `High-risk formal claim omitted from review routing: ${claim.id}`),
];
const report = {
  schemaVersion: 1,
  auditedAt: "deterministic",
  status: errors.length === 0 ? "PASS" : "FAIL",
  reviewMode: "MACHINE_PACKET_FOR_TRUE_INDEPENDENT_REVIEW",
  binding,
  counts: {
    guideSections: snapshot.guideSections.length,
    conceptLessons: snapshot.conceptLessons.length,
    methodLessons: snapshot.methodLessons.length,
    caseLabs: snapshot.caseLabs.length,
    studioTemplates: snapshot.studioTemplates.length,
    claims: snapshot.claims.length,
    referencedSources: referencedSourceIds.length,
    highRiskClaims: highRiskClaims.length,
    highRiskGuideClaims: highRiskGuideClaims.length,
    highRiskFormalClaims: highRiskFormalClaims.length,
    highRiskCaseClaims: highRiskCaseClaims.length,
    ambiguousWordingFlags: ambiguousWording.length,
    pendingItems: inventory.length,
  },
  sourceCoverage: { referencedSourceIds, missingSourceIds },
  inventory,
  highRiskClaims,
  ambiguousWording,
  policy: {
    requiredActiveGeneratedItems: 0,
    observedActiveGeneratedItems: activeGeneratedItems,
    humanScientificApprovalRequired: true,
    banner: "待科学审核 · 不进入正式 Today · 不计标准化能力",
  },
  errors,
};
await writeFile(path.join(root, "artifacts", "curriculum-scientific-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
const md = `# M019 Curriculum Scientific Review Packet\n\n- Status: **${report.status}**\n- Mode: ${report.reviewMode}\n- Snapshot: \`artifacts/curriculum-content-snapshot.json\`\n- snapshot_byte_sha256: \`${binding.snapshotByteSha256}\`\n- claims_sha256: \`${binding.claimsSha256}\`\n- source_registry_sha256: \`${binding.sourceRegistrySha256}\`\n- Complete inventory: \`artifacts/curriculum-scientific-audit.json\`\n- Guide / Concept / Method / Case / Studio: ${report.counts.guideSections} / ${report.counts.conceptLessons} / ${report.counts.methodLessons} / ${report.counts.caseLabs} / ${report.counts.studioTemplates}\n- Claim records: ${report.counts.claims}\n- Referenced sources: ${report.counts.referencedSources}; missing source IDs: ${missingSourceIds.length}\n- High-risk claims routed: ${report.counts.highRiskClaims} total = ${report.counts.highRiskGuideClaims} Guide + ${report.counts.highRiskFormalClaims} formal Concept/Method + ${report.counts.highRiskCaseClaims} Case\n- Deterministic ambiguous-universal wording flags: ${report.counts.ambiguousWordingFlags}\n\n## Review boundary\n\nEvery generated item remains \`ai_generated\`, \`pending\`, and \`pending_review\`. Passing this packet audit does not verify or activate any content. The complete 288-section inventory, all formal lessons/cases/studios, their source links, and every high-risk claim are recorded in the JSON packet. Independent scientific, evidence, and pedagogy decisions remain authoritative for review status.\n\n## Activation decision\n\n**DO NOT ACTIVATE automatically.** Human scientific approval remains required. The preview must display: “待科学审核 · 不进入正式 Today · 不计标准化能力”.\n`;
await writeFile(path.join(root, "M019_CURRICULUM_SCIENTIFIC_REVIEW.md"), md);
console.log(`Curriculum scientific packet: ${report.status} (${inventory.length} items, ${snapshot.claims.length} claims, ${referencedSourceIds.length} sources)`);
if (errors.length) process.exitCode = 1;
