import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { KNOWLEDGE_TYPES } from "../.build/domain/knowledge.js";
import { createInitialKnowledgeWorkspace } from "../.build/data/knowledge.js";
import {
  createKnowledgeTemplate, knowledgeHash, validateKnowledgeUnit, auditKnowledgeWorkspace,
  assertKnowledgeTransition, isKnowledgeLearningAllowed, resolveHistoricalKnowledgeBinding,
  proposeKnowledgeChange, previewKnowledgeImpact, applyKnowledgeChange, effectiveKnowledgeStatus,
  emptyKnowledgeWorkspace, generateKnowledgeProjections, appendKnowledgeProjections,
  previewKnowledgeImport, commitKnowledgeImport,
} from "../.build/services/knowledge.js";
import { adaptProtocolStaging } from "../.build/services/knowledgeAdapters.js";
import { createInitialState, useAppStore } from "../.build/state/store.js";
import { migratePersistedState, CURRENT_STATE_SCHEMA } from "../.build/state/migrations.js";
import { generateTodayTasks, generateLearningTodayTasks } from "../.build/learning/scheduler.js";
import { serializeLearningData } from "../.build/services/learningExport.js";
import { learningUnits } from "../.build/data/learningUnits.js";
import { knowledgeOverlayConflicts } from "../.build/services/knowledgeOverlay.js";
import { demoSourcePack } from "../.build/data/problemAtlas.js";

const now = "2026-09-22T00:00:00.000Z";
const root = process.cwd();
const ref = (unit) => ({ knowledgeUnitId: unit.id, revision: unit.revision, hash: unit.hash });
const rehash = (record) => ({ ...record, hash: knowledgeHash(record) });
const apply = (workspace, candidate) => {
  const result = applyKnowledgeChange(workspace, candidate, { reviewer: "验收操作人（不是科学审核）", now });
  assert.equal(result.ok, true, result.errors.join("\n"));
  return result.workspace;
};
const provenance = { createdAt: now, changeReason: "M020 deterministic engineering fixture; no scientific endorsement", verificationScope: "none" };

test("M020 A: Confidence Interval source revision has bounded impact and never rewrites existing knowledge or lessons", () => {
  const workspace = createInitialKnowledgeWorkspace();
  const unit = workspace.units.find((item) => item.id === "staged-concept-confidence-interval");
  assert.ok(unit);
  assert.equal(unit.freshnessClass, "FOUNDATIONAL_STABLE");
  const claim = workspace.claims.find((item) => item.id === unit.evidenceLinks[0].claimId);
  const source = workspace.sources.find((item) => item.id === claim.sourceBindings[0].sourceId);
  const updated = rehash({ ...source, revision: source.revision + 1, version: "metadata-revision-fixture", provenance: { ...provenance, originalId: source.id } });
  const candidate = proposeKnowledgeChange(workspace, { id: "ci-source-update", operation: "evidence_update", sources: [updated], now, reason: "来源元数据版本更新；科学解释是否需改由审核判定" });
  const impact = previewKnowledgeImpact(workspace, candidate);
  assert.equal(impact.valid, true, impact.errors.join("\n"));
  assert.ok(impact.affectedKnowledge.some((item) => item.knowledgeUnitId === unit.id));
  assert.ok(impact.affectedKnowledge.length < workspace.units.length, "source update must not mark the entire corpus without explicit dependency");
  const next = apply(workspace, candidate);
  assert.deepEqual(next.units, workspace.units);
  assert.deepEqual(next.learningBindings, workspace.learningBindings);
  assert.equal(next.units.find((item) => item.id === unit.id).nextReviewAt, unit.nextReviewAt);
  assert.equal(next.sources.filter((item) => item.id === source.id).length, 2);
  assert.ok(next.holds.length > 0);
});

test("M020 B: Pseudobulk benchmark input yields exact impact, pending update, and no implicit scientific approval", () => {
  const workspace = createInitialKnowledgeWorkspace();
  const unit = workspace.units.find((item) => item.knowledgeType === "method" && /pseudobulk/.test(item.id));
  assert.ok(unit);
  const source = rehash({ id: "benchmark-input-fixture", revision: 1, hash: "", title: "用户提交的 benchmark 待审输入（工程夹具）", metadataStatus: "metadata_verified", contentOrigin: "user", provenance: { ...provenance, verificationScope: "metadata" } });
  const claim = rehash({ id: "benchmark-claim-fixture", revision: 1, hash: "", statement: "候选 benchmark 的适用范围待逐主张核验。", sourceBindings: [{ sourceId: source.id, revision: 1, hash: source.hash }], verificationStatus: "verified", contentOrigin: "ai_generated", provenance });
  const proposed = rehash({ ...unit, evidenceLinks: [...unit.evidenceLinks, { claimId: claim.id, revision: 1, hash: claim.hash, supportMode: "supplemental" }], contentOrigin: "ai_generated" });
  const candidate = proposeKnowledgeChange(workspace, { id: "pseudobulk-benchmark", operation: "revise", changeType: "EXTENSION", target: ref(unit), unit: proposed, sources: [source], claims: [claim], now, reason: "新 benchmark 待审，不能据此自动推荐方法" });
  const before = JSON.stringify(workspace);
  const impact = previewKnowledgeImpact(workspace, candidate);
  assert.equal(impact.valid, true, impact.errors.join("\n"));
  assert.ok(impact.affectedLessons.includes(unit.id));
  assert.ok(impact.affectedAssessments.length > 0);
  assert.equal(JSON.stringify(workspace), before);
  const next = apply(workspace, candidate);
  const revision = next.units.find((item) => item.id === unit.id && item.revision === unit.revision + 1);
  assert.equal(revision.verificationStatus, "pending");
  assert.equal(revision.lifecycle, "pending_review");
  assert.equal(next.claims.find((item) => item.id === claim.id).verificationStatus, "pending");
  assert.equal(next.claims.find((item) => item.id === claim.id).provenance.verificationScope, "none");
  assert.deepEqual(next.units.find((item) => item.id === unit.id && item.revision === unit.revision), unit);
  assert.ok(impact.affectedAssessments.every((id) => !isKnowledgeLearningAllowed(next, id)));
});

function guidelineFixture() {
  const workspace = emptyKnowledgeWorkspace();
  const unit = createKnowledgeTemplate("guideline", { id: "guideline-simulation", title: "Guideline v1（架构模拟，无临床建议）", now });
  unit.guideline = { issuingOrganization: "工程验收夹具", version: "v1", effectiveDate: "2026-01-01", supersededVersion: "", recommendationScope: ["仅模拟版本关系"] };
  unit.hash = knowledgeHash(unit);
  workspace.units.push(unit);
  for (const kind of ["guide", "concept_lesson", "method_lesson", "protocol_lesson", "assessment", "case_lab", "studio_task"]) workspace.learningBindings.push({ assetId: `fixture-${kind}`, assetRevision: 1, assetHash: knowledgeHash({ kind }), kind, title: kind, knowledgeUnitIds: [unit.id], knowledgeRevisionBindings: [ref(unit)], legacyActive: true, migrationStatus: "complete", reviewGaps: [] });
  return { workspace, unit };
}

test("M020 D: guideline v1→v2 supersedes v1, holds every dependent kind and preserves historical exact bindings", () => {
  const { workspace, unit } = guidelineFixture();
  const oldBytes = JSON.stringify(unit), asset = workspace.learningBindings.find((item) => item.kind === "assessment");
  const oldEvent = { asset: { id: asset.assetId, revision: 1, hash: asset.assetHash }, knowledgeRevisionBindings: [ref(unit)] };
  const oldEventBytes = JSON.stringify(oldEvent);
  const proposal = { ...unit, title: "Guideline v2（架构模拟）", guideline: { ...unit.guideline, version: "v2", supersededVersion: "v1" } };
  const candidate = proposeKnowledgeChange(workspace, { id: "guideline-v2", operation: "supersede", target: ref(unit), unit: proposal, now, reason: "模拟新版指南替代；新建议尚未科学审核" });
  const impact = previewKnowledgeImpact(workspace, candidate);
  for (const key of ["affectedLessons", "affectedAssessments", "affectedCases", "affectedProtocols", "affectedGuides", "affectedStudios"]) assert.ok(impact[key].length, key);
  const next = apply(workspace, candidate);
  assert.equal(effectiveKnowledgeStatus(next, unit), "SUPERSEDED");
  const v2 = next.units.find((item) => item.revision === 2);
  assert.equal(v2.lifecycle, "pending_review");
  assert.equal(v2.verificationStatus, "pending");
  assert.deepEqual(v2.supersedes, [ref(unit)]);
  assert.equal(JSON.stringify(next.units[0]), oldBytes);
  assert.equal(JSON.stringify(oldEvent), oldEventBytes);
  assert.ok(workspace.learningBindings.every((binding) => !isKnowledgeLearningAllowed(next, binding.assetId)));
  assert.deepEqual(resolveHistoricalKnowledgeBinding(next, asset.assetId, 1, asset.assetHash).bindings, [ref(unit)]);
  assert.equal(auditKnowledgeWorkspace(next).ok, true);
  const removedHold = structuredClone(next); removedHold.holds.pop();
  assert.ok(assertKnowledgeTransition(workspace, removedHold).length, "missing impact hold must be rejected");
  const brokenReciprocity = structuredClone(next); brokenReciprocity.ledger = brokenReciprocity.ledger.filter((item) => item.action !== "supersede");
  assert.ok(auditKnowledgeWorkspace(brokenReciprocity).groups.supersession.length);
});

test("M020 safety: duplicate does not freeze its base; stale changes are atomic failures; restore remains pending", () => {
  const { workspace, unit } = guidelineFixture();
  const duplicate = proposeKnowledgeChange(workspace, { id: "duplicate", operation: "duplicate", target: ref(unit), unit: { ...unit, id: "copied-guideline" }, now, reason: "建立独立副本" });
  assert.equal(previewKnowledgeImpact(workspace, duplicate).affectedKnowledge.length, 0);
  const copied = apply(workspace, duplicate);
  assert.equal(copied.holds.length, 0);
  const stale = proposeKnowledgeChange(workspace, { id: "stale", operation: "deprecate", target: ref(unit), now, reason: "旧基础候选" });
  const rejected = applyKnowledgeChange(copied, stale, { reviewer: "测试", now });
  assert.equal(rejected.ok, false);
  assert.deepEqual(rejected.workspace, copied);
  const deprecate = proposeKnowledgeChange(copied, { id: "deprecate", operation: "deprecate", target: ref(unit), now, reason: "停止使用" });
  const deprecated = apply(copied, deprecate);
  assert.equal(effectiveKnowledgeStatus(deprecated, unit), "DEPRECATED");
  const restore = proposeKnowledgeChange(deprecated, { id: "restore", operation: "restore", target: ref(unit), now, reason: "以新待审版本恢复" });
  const restored = apply(deprecated, restore);
  assert.equal(restored.units.at(-1).lifecycle, "pending_review");
  assert.equal(effectiveKnowledgeStatus(restored, unit), "DEPRECATED");
  assert.ok(restored.holds.length >= deprecated.holds.length);
});

test("M020 safety: all eight generated projection types remain pending and outside competence", () => {
  const { workspace, unit } = guidelineFixture();
  const projections = generateKnowledgeProjections(workspace, ref(unit), undefined, now);
  assert.equal(projections.length, 8);
  const added = appendKnowledgeProjections(workspace, projections);
  assert.equal(added.ok, true, added.errors.join("\n"));
  for (const projection of projections) {
    assert.equal(projection.createsCompetence, false);
    assert.equal(projection.lifecycle, "pending_review");
    assert.equal(projection.verificationStatus, "pending");
    assert.deepEqual(projection.knowledgeRevisionBindings, [ref(unit)]);
    assert.equal(isKnowledgeLearningAllowed(added.workspace, projection.id), false);
  }
  const tampered = structuredClone(added.workspace);
  tampered.projections[0] = rehash({ ...tampered.projections[0], lifecycle: "active", createsCompetence: true });
  assert.ok(auditKnowledgeWorkspace(tampered).groups.activation_safety.length);
});

test("M020 integration: updating active knowledge blocks Today, Review submission and direct Kernel submission", () => {
  useAppStore.setState({ ...createInitialState(), hydrated: true });
  const before = useAppStore.getState();
  const unit = before.knowledgeWorkspace.units.find((item) => item.id === "concept-statistical-unit-v1");
  const candidate = proposeKnowledgeChange(before.knowledgeWorkspace, { id: "active-update", operation: "revise", target: ref(unit), unit, now, reason: "需要重新审核的科学更新" });
  const next = apply(before.knowledgeWorkspace, candidate);
  const overlays = [{ id: "my-statistical-unit", baseKey: "learning-unit:lu-statistical-unit-v1", baseHash: "original-overlay-base" }, { id: "unrelated", baseKey: "learning-unit:unrelated" }];
  const conflicts = knowledgeOverlayConflicts(before.knowledgeWorkspace, next, overlays, []);
  assert.ok(conflicts.some((item) => item.contentId === "my-statistical-unit" && item.kind === "base_update"));
  assert.ok(!conflicts.some((item) => item.contentId === "unrelated"));
  assert.deepEqual(knowledgeOverlayConflicts(before.knowledgeWorkspace, next, overlays, conflicts), conflicts);
  const oldEvents = JSON.stringify(before.learningEvents), oldStates = JSON.stringify(before.learnerUnitStates);
  useAppStore.getState().setKnowledgeWorkspace(next);
  assert.equal(JSON.stringify(useAppStore.getState().learningEvents), oldEvents);
  assert.equal(JSON.stringify(useAppStore.getState().learnerUnitStates), oldStates);
  assert.ok(!generateTodayTasks(useAppStore.getState()).some((task) => task.learningContentId === unit.id));
  assert.ok(!generateLearningTodayTasks(useAppStore.getState()).some((task) => task.unitId === "lu-statistical-unit-v1"));
  assert.throws(() => useAppStore.getState().openLearningContentTask({ contentId: unit.id, activityType: "explanation" }), /暂停/);
  assert.throws(() => useAppStore.getState().recordLearningContentPractice(unit.id, "apply", {}, 3), /暂停/);
  assert.throws(() => useAppStore.getState().startLearningUnit("lu-statistical-unit-v1", "learning"), /暂停/);
  assert.throws(() => useAppStore.getState().recordLearningTransition("lu-statistical-unit-v1", { type: "independent_attempt" }), /暂停/);
  const review = { id: "held-review", conceptId: unit.id };
  useAppStore.setState({ reviewItems: [review] });
  assert.throws(() => useAppStore.getState().rateReview(review.id, 1, 3), /暂停/);
});

test("M020 negative audits: broken dependencies, cycles, undeclared orphans, freshness and learning bindings fail", () => {
  const { workspace, unit } = guidelineFixture();
  const malformed = structuredClone(workspace);
  malformed.units[0] = rehash({ ...unit, prerequisiteIds: ["missing-id"] });
  malformed.learningBindings = [];
  assert.ok(auditKnowledgeWorkspace(malformed).groups.dependency.length);
  const cycle = structuredClone(workspace); cycle.learningBindings = [];
  cycle.units[0] = rehash({ ...unit, prerequisiteIds: [unit.id] });
  assert.ok(auditKnowledgeWorkspace(cycle).groups.dependency.length);
  const orphan = structuredClone(workspace); orphan.learningBindings[0].knowledgeUnitIds = []; orphan.learningBindings[0].knowledgeRevisionBindings = [];
  assert.ok(auditKnowledgeWorkspace(orphan).groups.learning_binding.length);
  const freshness = structuredClone(workspace); freshness.learningBindings = [];
  freshness.units[0] = rehash({ ...unit, validUntil: "2020-01-01" });
  assert.ok(auditKnowledgeWorkspace(freshness).groups.freshness.length);
  const binding = structuredClone(workspace); binding.learningBindings[0].knowledgeRevisionBindings[0].hash = "sha256:" + "0".repeat(64);
  assert.equal(auditKnowledgeWorkspace(binding).ok, false);
});

test("M020 imports: seven input formats save pending candidates only and never call the network", () => {
  const workspace = emptyKnowledgeWorkspace();
  const jsonUnit = createKnowledgeTemplate("concept", { id: "raw-json-unit", title: "JSON 待审概念", now, contentOrigin: "ai_generated" });
  const inputs = { doi: "10.1234/m020-local-fixture", pmid: "12345678", metadata: JSON.stringify({ title: "来源元数据", verificationStatus: "verified" }), source_pack: JSON.stringify(demoSourcePack), markdown: "---\ntitle: 研究笔记\n---\n待核验的解释。", json: JSON.stringify(jsonUnit), note: "用户的研究笔记，尚无逐主张科学核验。" };
  const oldFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = () => { networkCalls++; throw new Error("network is forbidden for local import"); };
  try {
    for (const [format, text] of Object.entries(inputs)) {
      const preview = previewKnowledgeImport(workspace, { format, text, knowledgeType: "concept", id: `import-${format}`, now, contentOrigin: "ai_generated" });
      assert.equal(preview.valid, true, `${format}: ${preview.errors.join("\n")}`);
      const committed = commitKnowledgeImport(workspace, preview);
      assert.equal(committed.ok, true, committed.errors.join("\n"));
      assert.equal(committed.workspace.units.length, 0);
      assert.equal(committed.workspace.holds.length, 0);
      const candidate = committed.workspace.candidates[0];
      assert.equal(candidate.lifecycle, "pending_review");
      assert.equal(candidate.verificationStatus, "pending");
      assert.ok(candidate.claims.every((claim) => claim.verificationStatus === "pending"));
      assert.equal(commitKnowledgeImport(committed.workspace, preview).ok, false);
      const forged = rehash({ ...preview, candidate: rehash({ ...candidate, lifecycle: "active" }) });
      assert.equal(commitKnowledgeImport(workspace, forged).ok, false);
    }
  } finally { globalThis.fetch = oldFetch; }
  assert.equal(networkCalls, 0);
  for (const text of ["{", "[]", "null"]) assert.equal(previewKnowledgeImport(workspace, { format: "json", text, knowledgeType: "concept", id: "bad-json", now }).valid, false);
  assert.equal(previewKnowledgeImport(workspace, undefined).valid, false);
  const malicious = rehash({ ...jsonUnit, lifecycle: "active", verificationStatus: "verified" });
  const sanitized = previewKnowledgeImport(workspace, { format: "json", text: JSON.stringify(malicious), knowledgeType: "concept", id: "malicious", now });
  assert.equal(sanitized.valid, true, sanitized.errors.join("\n"));
  assert.equal(sanitized.candidate.proposedUnit.lifecycle, "pending_review");
  assert.equal(sanitized.candidate.proposedUnit.verificationStatus, "pending");
});

test("M020 restart: forged legacy authorization cannot enter state through hydration", () => {
  const initial = createInitialState();
  const tampered = structuredClone(initial);
  tampered.knowledgeWorkspace.learningBindings.push({ ...tampered.knowledgeWorkspace.learningBindings.find((item) => item.legacyActive), assetId: "forged-compatibility" });
  assert.throws(() => migratePersistedState(tampered, initial), /未经授权/);
  assert.throws(() => migratePersistedState({ ...initial, knowledgeWorkspace: emptyKnowledgeWorkspace() }, initial), /基础记录/);
});

test("M020 restart: deleting applied update decisions and holds cannot reopen old knowledge", () => {
  const initial = createInitialState(), workspace = initial.knowledgeWorkspace;
  const source = workspace.sources.find((item) => item.id === "src-pseudorep");
  const candidate = proposeKnowledgeChange(workspace, { id: "persisted-source-update", operation: "evidence_update", now, reason: "验证重载历史完整性", sources: [rehash({ ...source, revision: source.revision + 1, provenance })] });
  const applied = apply(workspace, candidate);
  const persisted = JSON.parse(JSON.stringify({ ...initial, knowledgeWorkspace: applied }));
  const reloaded = migratePersistedState(persisted, initial);
  assert.equal(isKnowledgeLearningAllowed(reloaded.knowledgeWorkspace, "statistical-unit"), false);
  persisted.knowledgeWorkspace.ledger = [];
  persisted.knowledgeWorkspace.holds = [];
  assert.equal(auditKnowledgeWorkspace(persisted.knowledgeWorkspace).ok, false);
  assert.throws(() => migratePersistedState(persisted, initial), /数据库未被修改/);
});

test("M020 exact impact: same asset id/revision with different historical hashes are separate nodes", () => {
  const workspace = emptyKnowledgeWorkspace();
  const a = createKnowledgeTemplate("concept", { id: "hash-concept-a", title: "A", now });
  const b = createKnowledgeTemplate("concept", { id: "hash-concept-b", title: "B", now });
  workspace.units.push(a, b);
  for (const unit of [a, b]) workspace.learningBindings.push({ assetId: "same-asset", assetRevision: 1, assetHash: knowledgeHash({ original: unit.id }), kind: "assessment", title: unit.title, knowledgeUnitIds: [unit.id], knowledgeRevisionBindings: [ref(unit)], legacyActive: true, migrationStatus: "complete", reviewGaps: [] });
  const candidate = proposeKnowledgeChange(workspace, { id: "update-only-a", operation: "revise", target: ref(a), unit: a, now, reason: "只影响历史A" });
  const impact = previewKnowledgeImpact(workspace, candidate);
  assert.equal(impact.affectedLearningBindings.length, 1);
  assert.equal(impact.affectedLearningBindings[0].assetHash, workspace.learningBindings[0].assetHash);
  const next = apply(workspace, candidate);
  assert.equal(isKnowledgeLearningAllowed(next, "same-asset", 1, workspace.learningBindings[0].assetHash), false);
  assert.equal(isKnowledgeLearningAllowed(next, "same-asset", 1, workspace.learningBindings[1].assetHash), true);
});

test("M020 templates: all six types are structurally valid pending scientific records", () => {
  for (const type of KNOWLEDGE_TYPES) {
    const unit = createKnowledgeTemplate(type, { id: `test-${type}`, title: "待填写知识", now });
    assert.deepEqual(validateKnowledgeUnit(unit), [], type);
    assert.equal(unit.hash, knowledgeHash(unit));
    assert.equal(unit.lifecycle, "pending_review");
    assert.equal(unit.verificationStatus, "pending");
    assert.equal(unit.provenance.verificationScope, "none");
    assert.equal(unit.migrationStatus, "REVIEW_REQUIRED");
  }
});

test("M020 migration: canonical seed and all seven audits are deterministic", () => {
  const a = createInitialKnowledgeWorkspace(), b = createInitialKnowledgeWorkspace();
  assert.deepEqual(a, b);
  const audit = auditKnowledgeWorkspace(a);
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  assert.equal(Object.keys(audit.groups).length, 7);
  assert.ok(a.units.length >= 64);
  assert.ok(a.learningBindings.length >= 297);
  assert.ok(a.units.every((unit) => unit.provenance.originalPayload !== undefined));
  assert.ok(a.units.filter((unit) => unit.contentOrigin === "ai_generated").every((unit) => unit.verificationStatus === "pending" && unit.lifecycle !== "active"));
  a.units[0].title = "independent clone";
  assert.notEqual(createInitialKnowledgeWorkspace().units[0].title, "independent clone");
});

test("M020 migration: v8 history and competence are byte-preserved; malformed/future knowledge fails closed", () => {
  const initial = createInitialState();
  const previous = { ...initial, schemaVersion: 8,
    learningEvents: [{ id: "legacy", unitId: "unknown-historical-unit", unitRevision: 3, unitHash: "old-exact-hash", asset: { id: "old-asset", revision: 2, hash: "old-asset-hash" } }],
    learnerUnitStates: [{ unitId: "old-unit", competence: { level: "independent_once" } }],
    projects: [{ id: "private-project-stays-local" }] };
  delete previous.knowledgeWorkspace;
  const before = JSON.stringify(previous);
  const migrated = migratePersistedState(previous, initial);
  assert.equal(migrated.schemaVersion, CURRENT_STATE_SCHEMA);
  assert.equal(JSON.stringify(previous), before);
  for (const key of ["learningEvents", "learnerUnitStates", "projects", "personalContent", "contentRevisionHistory", "caseSessions"]) assert.deepEqual(migrated[key], previous[key]);
  assert.equal(migrated.learningEvents[0].knowledgeRevisionBindings, undefined);
  assert.equal(JSON.stringify(migratePersistedState(JSON.parse(JSON.stringify(migrated)), initial)), JSON.stringify(migrated));
  assert.throws(() => migratePersistedState({ ...migrated, knowledgeWorkspace: { schemaVersion: 99 } }, initial), /数据库未被修改/);
  assert.throws(() => migratePersistedState({ ...migrated, schemaVersion: CURRENT_STATE_SCHEMA + 1 }, initial), /数据库未被修改/);
});

test("M020 history: exact revision/hash resolver never binds an unknown historical version to current knowledge", () => {
  const workspace = createInitialKnowledgeWorkspace();
  const binding = workspace.learningBindings.find((item) => item.knowledgeRevisionBindings.length && item.legacyActive);
  assert.ok(binding);
  assert.deepEqual(resolveHistoricalKnowledgeBinding(workspace, binding.assetId, binding.assetRevision, binding.assetHash), { status: "RESOLVED", bindings: binding.knowledgeRevisionBindings });
  assert.equal(resolveHistoricalKnowledgeBinding(workspace, binding.assetId, binding.assetRevision + 1, binding.assetHash).status, "UNRESOLVED");
  assert.equal(resolveHistoricalKnowledgeBinding(workspace, binding.assetId, binding.assetRevision, "sha256:" + "0".repeat(64)).status, "UNRESOLVED");
  assert.equal(resolveHistoricalKnowledgeBinding(workspace, "missing", 1, "missing").status, "UNRESOLVED");
});

test("M020 schema: malformed input, bad enums and changed hash are rejected without exceptions", () => {
  for (const malformed of [null, [], {}, { schemaVersion: 1, units: null }, { schemaVersion: 1, units: [null] }]) {
    assert.equal(auditKnowledgeWorkspace(malformed).ok, false);
  }
  const workspace = createInitialKnowledgeWorkspace();
  workspace.units[0].title += " tampered";
  assert.equal(auditKnowledgeWorkspace(workspace).ok, false);
  const unit = createKnowledgeTemplate("method", { id: "method-test", title: "示例", now });
  assert.ok(validateKnowledgeUnit(rehash({ ...unit, knowledgeStatus: "FAKE" })).length);
  assert.ok(validateKnowledgeUnit(rehash({ ...unit, method: undefined })).length);
});

test("M020 transition: append-only history cannot be deleted, edited, activated or forged as legacy", () => {
  const previous = createInitialKnowledgeWorkspace();
  assert.deepEqual(assertKnowledgeTransition(previous, structuredClone(previous)), []);
  for (const mutation of [
    (next) => { next.units.pop(); },
    (next) => { next.units[0] = rehash({ ...next.units[0], title: "silent edit" }); },
    (next) => { const unit = createKnowledgeTemplate("concept", { id: "injected", title: "注入", now }); next.units.push(rehash({ ...unit, lifecycle: "active", verificationStatus: "verified" })); },
    (next) => { next.learningBindings.push({ assetId: "forged", assetRevision: 1, assetHash: "sha256:" + "1".repeat(64), title: "注入", kind: "assessment", knowledgeUnitIds: [next.units[0].id], knowledgeRevisionBindings: [ref(next.units[0])], legacyActive: true, migrationStatus: "complete", reviewGaps: [] }); },
  ]) {
    const next = structuredClone(previous); mutation(next);
    assert.ok(assertKnowledgeTransition(previous, next).length);
  }
});

test("M020 C: actual WB/qPCR/IHC/flow/PDO staging preserves IDs, raw payload and pending states", () => {
  const payload = JSON.parse(readFileSync(path.join(root, "data/knowledge/protocol-staging-examples.json"), "utf8"));
  const fragments = payload.map((example) => adaptProtocolStaging(example.payload, now));
  assert.deepEqual(fragments.flatMap((item) => item.errors), []);
  const units = fragments.flatMap((item) => item.units);
  assert.ok(units.length >= 5);
  assert.ok(units.some((unit) => /western|blot|wb/i.test(unit.title + unit.id)));
  for (const unit of units) {
    assert.equal(unit.lifecycle, "pending_review");
    assert.equal(unit.verificationStatus, "pending");
    assert.equal(unit.id, unit.provenance.originalId);
    assert.ok(unit.provenance.originalPayload);
    assert.equal(unit.hash, knowledgeHash(unit));
    assert.equal(unit.migrationStatus, "REVIEW_REQUIRED");
  }
});

test("M020 store: new kernel events bind exact knowledge and JSON export preserves both histories", () => {
  useAppStore.setState({ ...createInitialState(), hydrated: true });
  const unit = learningUnits[0];
  useAppStore.getState().startLearningUnit(unit.id, "learning");
  useAppStore.getState().recordLearningTransition(unit.id, { type: "instruction_block_completed", mode: "learning", blockId: unit.blocks[0].id, hintsUsed: [] });
  const state = useAppStore.getState();
  const event = state.learningEvents[0];
  assert.equal(event.knowledgeBindingStatus, "RESOLVED");
  assert.ok(event.knowledgeRevisionBindings.length);
  const exported = JSON.parse(serializeLearningData(state, "json").content);
  assert.deepEqual(exported.learningEvents, JSON.parse(JSON.stringify(state.learningEvents)));
  assert.deepEqual(exported.knowledgeWorkspace, JSON.parse(JSON.stringify(state.knowledgeWorkspace)));
});

test("M020 privacy: public migration fixture has no workstation paths, identifiers or credentials", () => {
  const workspace = createInitialKnowledgeWorkspace();
  const text = JSON.stringify(workspace);
  assert.doesNotMatch(text, /(?:[A-Z]:\\Users\\|D:\\Agents\\|\.codex|medical record number|private chat)/i);
  assert.equal(/(?:\bsk-(?:proj-)?[A-Za-z0-9_-]{25,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----)/.test(text), false, "credential-shaped value found in public fixture");
  for (const file of ["knowledge.ts", "knowledgeAdapters.ts", "knowledgeLearningSafety.ts", "knowledgeOverlay.ts"]) {
    assert.doesNotMatch(readFileSync(path.join(root, "src/services", file), "utf8"), /\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|https?\.request\s*\(/);
  }
});
