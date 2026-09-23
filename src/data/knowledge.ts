import type { KnowledgeWorkspace, KnowledgeEvidenceClaim } from "../domain/knowledge";
import { createKnowledgeTemplate, emptyKnowledgeWorkspace, knowledgeHash } from "../services/knowledge";
import {
  adaptConceptLesson, adaptCurriculumClaim, adaptEvidenceSource, adaptGuideSectionSnapshot, adaptKernelConcept,
  adaptLegacyMethodConcept, adaptMethodLesson, adaptStudioTemplateSnapshot,
  evidenceLinksFor, makeKnowledgeLearningBinding, makeMigratedClaim,
} from "../services/knowledgeAdapters";
import { evidenceSources } from "./evidence";
import {
  conceptLessons, methodLessons, guideSections, researchCases, learningContentRegistry,
  learningArchitectureKernelUnits, learningArchitecturePracticeAssets, learningArchitecturePracticeBindings,
} from "./learningArchitecture";
import { learningUnits, practiceAssets, practiceAssetBindings } from "./learningUnits";
import { methodConcepts } from "./methods";
import { curriculumClaims, stagedConceptLessons, stagedMethodLessons, stagedCaseLabs, studioTemplates } from "./curriculum";
import protocolExamples from "../../data/knowledge/protocol-staging-examples.json";

export const KNOWLEDGE_MIGRATION_AT = "2026-09-22T00:00:00+08:00";
export interface BuiltInProtocolImport {
  id: string; title: string; description: string; knowledgeType: "protocol"; sourcePath: string; payload: unknown;
}
/** Mechanical excerpts of the existing staging corpus; never active lesson seeds. */
export const builtInProtocolImports: BuiltInProtocolImport[] = protocolExamples.map((example) => ({ ...example, knowledgeType: "protocol" }));

function buildInitialKnowledgeWorkspace(): KnowledgeWorkspace {
  const workspace = emptyKnowledgeWorkspace();
  const now = KNOWLEDGE_MIGRATION_AT;
  workspace.sources = evidenceSources.map((source) => adaptEvidenceSource(source, now, true));
  workspace.claims = curriculumClaims.map((claim) => adaptCurriculumClaim(claim, workspace.sources, now));
  const claimsByContent = new Map<string, KnowledgeEvidenceClaim[]>();
  for (const original of curriculumClaims) {
    const claim = workspace.claims.find((item) => item.id === original.id)!;
    claimsByContent.set(original.contentId, [...(claimsByContent.get(original.contentId) ?? []), claim]);
  }
  const addLegacyClaim = (id: string, statement: string, sourceIds: string[], raw: unknown) => {
    const claim = makeMigratedClaim(`migration-claim-${id}`, statement, sourceIds, workspace.sources, raw, now);
    workspace.claims.push(claim);
    claimsByContent.set(id, [...(claimsByContent.get(id) ?? []), claim]);
    return claim;
  };
  for (const lesson of conceptLessons) addLegacyClaim(lesson.id, lesson.preciseExplanationCn, lesson.evidenceSourceIds, lesson);
  for (const lesson of methodLessons) addLegacyClaim(lesson.id, lesson.coreLogicCn, lesson.evidenceSourceIds, lesson);
  const kernels = [...new Map([...learningUnits, ...learningArchitectureKernelUnits].map((item) => [item.id, item])).values()];
  const kernelClaims = new Map(kernels.map((kernel) => [kernel.id, addLegacyClaim(`kernel-${kernel.id}`, kernel.blocks.map((block) => block.bodyCn).join("\n") || kernel.learningObjectives.join("\n"), kernel.evidenceSourceIds, kernel)]));
  const guideIdsByKnowledge = new Map<string, string[]>();
  for (const lesson of conceptLessons) guideIdsByKnowledge.set(lesson.id, guideSections.filter((guide) => guide.links.some((link) => link.type === "concept_lesson" && link.targetId === lesson.id)).map((guide) => guide.id));
  for (const lesson of stagedConceptLessons) guideIdsByKnowledge.set(lesson.id, [lesson.guideSectionId]);
  for (const lesson of [...methodLessons, ...stagedMethodLessons]) guideIdsByKnowledge.set(lesson.id, [...lesson.guideSectionIds]);
  for (const guide of guideSections.filter((item) => !claimsByContent.has(item.id))) addLegacyClaim(guide.id, guide.summaryCn, guide.evidenceSourceIds, guide);
  const relatedClaims = (id: string) => [...new Map([
    ...(claimsByContent.get(id) ?? []),
    ...(guideIdsByKnowledge.get(id) ?? []).flatMap((guideId) => claimsByContent.get(guideId) ?? []),
  ].map((claim) => [claim.id, claim])).values()];
  const kernelKnowledgeIds = new Map<string, string>();
  for (const lesson of conceptLessons) {
    const kernel = kernels.find((item) => item.id === lesson.unitId);
    const claims = [...relatedClaims(lesson.id), ...(kernelClaims.get(lesson.unitId) ? [kernelClaims.get(lesson.unitId)!] : [])];
    workspace.units.push(adaptConceptLesson(lesson, claims, now, kernel));
    kernelKnowledgeIds.set(lesson.unitId, lesson.id);
  }
  for (const lesson of methodLessons) {
    const claims = [...relatedClaims(lesson.id), ...(kernelClaims.get(lesson.unitId) ? [kernelClaims.get(lesson.unitId)!] : [])];
    const unit = adaptMethodLesson(lesson, claims, now);
    const kernel = kernels.find((item) => item.id === lesson.unitId);
    if (kernel) { unit.provenance.originalPayload = { lesson, kernelUnit: kernel }; unit.provenance.originalHash = knowledgeHash({ lesson, kernelUnit: kernel }); unit.domain = [kernel.domain]; unit.hash = knowledgeHash(unit); }
    workspace.units.push(unit); kernelKnowledgeIds.set(lesson.unitId, lesson.id);
  }
  for (const lesson of stagedConceptLessons) workspace.units.push(adaptConceptLesson(lesson, relatedClaims(lesson.id), now));
  for (const lesson of stagedMethodLessons) workspace.units.push(adaptMethodLesson(lesson, relatedClaims(lesson.id), now));
  const explicitlyBridgedLegacyMethodIds = new Set([
    ...conceptLessons.map((lesson) => lesson.conceptId),
    ...methodLessons.map((lesson) => lesson.methodId),
    "cox-ph",
  ]);
  for (const original of methodConcepts.filter((item) => !explicitlyBridgedLegacyMethodIds.has(item.id))) {
    const claim = addLegacyClaim(original.id, original.coreConcept, original.sourceIds, original);
    workspace.units.push(adaptLegacyMethodConcept(original, [claim], now));
  }
  for (const guide of guideSections) {
    const hasExplicitLessonOwner = [...guideIdsByKnowledge.values()].some((guideIds) => guideIds.includes(guide.id));
    if (!hasExplicitLessonOwner) workspace.units.push(adaptGuideSectionSnapshot(guide, claimsByContent.get(guide.id) ?? [], now));
  }
  for (const studio of studioTemplates) workspace.units.push(adaptStudioTemplateSnapshot(studio, now));
  for (const kernel of kernels.filter((item) => !kernelKnowledgeIds.has(item.id))) {
    workspace.units.push(adaptKernelConcept(kernel, [kernelClaims.get(kernel.id)!], now));
    kernelKnowledgeIds.set(kernel.id, kernel.id);
  }
  // A case's source attribution belongs to its own immutable research-pattern snapshot,
  // not to every prerequisite concept. Existing cases are not rewritten or activated.
  for (const item of [...researchCases, ...stagedCaseLabs]) {
    const staged = "initialContextCn" in item;
    const unit = createKnowledgeTemplate("research_pattern", { id: item.id, title: item.titleCn, now, contentOrigin: item.contentOrigin });
    if (unit.knowledgeType !== "research_pattern") throw new Error("Research pattern template mismatch");
    const context = staged ? item.initialContextCn : item.initialContext;
    const evidenceLogic = staged ? item.stages.map((stage) => stage.calibrationCn) : item.stages.flatMap((stage) => stage.revealExplanation ? [stage.revealExplanation] : []);
    if (!claimsByContent.has(item.id)) addLegacyClaim(item.id, evidenceLogic.join("\n"), staged ? item.sourceIds : item.evidenceSourceIds, item);
    unit.aliases = [item.titleEn]; unit.preciseExplanation = [...evidenceLogic];
    unit.pattern = { context, evidenceLogic, applicability: [] };
    unit.evidenceLinks = evidenceLinksFor(claimsByContent.get(item.id) ?? []);
    unit.prerequisiteIds = staged ? [...item.prerequisiteIds] : item.prerequisiteConceptIds.flatMap((conceptId) => conceptLessons.filter((lesson) => lesson.conceptId === conceptId).map((lesson) => lesson.id));
    unit.provenance = { createdAt: now, changeReason: "M020 无损保留既有 case 的证据逻辑；作为研究模式候选快照而非新增课程。", verificationScope: "none", originalId: item.id, originalRevision: "revision" in item ? item.revision : 1, originalHash: "contentHash" in item ? item.contentHash : knowledgeHash(item), originalPayload: item };
    unit.migrationStatus = "REVIEW_REQUIRED"; unit.knowledgeStatus = "REVIEW_REQUIRED";
    unit.reviewGaps = ["case→research_pattern 为迁移投影；科学问题、适用域、假设与反例未从病例文本猜测。", "来源仅为课程综合支持，逐主张支持范围待复核。"];
    unit.lifecycle = "pending_review"; unit.verificationStatus = "pending";
    unit.hash = knowledgeHash(unit); workspace.units.push(unit);
  }
  // Known registry prerequisites are exact IDs. Unresolved IDs remain explicit review gaps.
  for (const unit of workspace.units) {
    const registry = learningContentRegistry.find((entry) => entry.id === unit.id);
    if (registry) unit.prerequisiteIds = [...new Set([...unit.prerequisiteIds, ...registry.prerequisiteIds])];
    for (const missing of unit.prerequisiteIds.filter((id) => !workspace.units.some((candidate) => candidate.id === id))) unit.reviewGaps.push(`未解析 prerequisiteId：${missing}`);
    unit.prerequisiteIds = unit.prerequisiteIds.filter((id) => workspace.units.some((candidate) => candidate.id === id));
    unit.hash = knowledgeHash(unit);
  }
  for (const unit of workspace.units) {
    unit.downstreamIds = workspace.units.filter((candidate) => candidate.prerequisiteIds.includes(unit.id)).map((candidate) => candidate.id);
  }
  for (const unit of workspace.units) unit.hash = knowledgeHash(unit);
  const byId = new Map(workspace.units.map((unit) => [unit.id, unit]));
  const known = (ids: string[]) => [...new Set(ids)].flatMap((id) => byId.has(id) ? [byId.get(id)!] : []);
  for (const lesson of [...conceptLessons, ...stagedConceptLessons]) {
    workspace.learningBindings.push(makeKnowledgeLearningBinding(lesson, "concept_lesson", known([lesson.id])));
    if ("primaryApply" in lesson) for (const asset of [lesson.primaryApply, lesson.remediation, lesson.delayedReview]) workspace.learningBindings.push(makeKnowledgeLearningBinding({ ...asset, lifecycle: "pending_review", verificationStatus: "pending" }, "assessment", known([lesson.id]), [], asset));
  }
  for (const lesson of [...methodLessons, ...stagedMethodLessons]) {
    workspace.learningBindings.push(makeKnowledgeLearningBinding(lesson, "method_lesson", known([lesson.id])));
    if ("primaryApply" in lesson) for (const asset of [lesson.primaryApply, lesson.remediation, lesson.delayedReview]) workspace.learningBindings.push(makeKnowledgeLearningBinding({ ...asset, lifecycle: "pending_review", verificationStatus: "pending" }, "assessment", known([lesson.id]), [], asset));
  }
  for (const kernel of kernels) workspace.learningBindings.push(makeKnowledgeLearningBinding(kernel, kernel.id === "method-cox-v1" ? "method_lesson" : "concept_lesson", known([kernelKnowledgeIds.get(kernel.id)!])));
  // Legacy review/calibration uses conceptId or methodId instead of lesson IDs.
  // These aliases come from explicit registry fields, never title similarity.
  for (const lesson of [...conceptLessons, ...methodLessons]) {
    const aliasId = "conceptId" in lesson ? lesson.conceptId : lesson.methodId;
    const original = methodConcepts.find((item) => item.id === aliasId);
    const rawAlias = original ?? { id: aliasId, lessonId: lesson.id, sourceField: "conceptId" in lesson ? "conceptId" : "methodId", lessonRevision: lesson.revision };
    workspace.learningBindings.push(makeKnowledgeLearningBinding({ id: aliasId, titleCn: lesson.titleCn, lifecycle: lesson.lifecycle, verificationStatus: lesson.verificationStatus }, "conceptId" in lesson ? "concept_lesson" : "method_lesson", known([lesson.id]), [], rawAlias));
  }
  for (const original of methodConcepts.filter((item) => !workspace.learningBindings.some((binding) => binding.assetId === item.id))) {
    // Root independently reviewed this legacy identifier bridge against both
    // records and src-cox. It propagates maintenance holds, not text equivalence.
    const ids = original.id === "cox-ph" ? ["method-cox-v1"] : [original.id];
    const gaps = original.id === "cox-ph"
      ? ["M020 root review：cox-ph → method-cox-v1 仅为保守维护影响桥接；两篇正文未被判定为逐主张等价。"]
      : [];
    workspace.learningBindings.push(makeKnowledgeLearningBinding({ ...original, lifecycle: original.status === "usable" ? "active" : "pending_review" }, "method_lesson", known(ids), gaps, original));
  }
  const assets = [...new Map([...practiceAssets, ...learningArchitecturePracticeAssets].map((asset) => [asset.id, asset])).values()];
  const practiceBindings = [...practiceAssetBindings, ...learningArchitecturePracticeBindings];
  for (const asset of assets) {
    const unitIds = practiceBindings.filter((binding) => binding.assetId === asset.id && binding.assetRevision === asset.revision && binding.assetHash === asset.contentHash).flatMap((binding) => kernelKnowledgeIds.get(binding.unitId) ? [kernelKnowledgeIds.get(binding.unitId)!] : []);
    workspace.learningBindings.push(makeKnowledgeLearningBinding({ ...asset, lifecycle: "active", verificationStatus: "verified" }, "assessment", known(unitIds), [], asset));
  }
  for (const guide of guideSections) {
    const ids = [...guideIdsByKnowledge.entries()].filter(([, guideIds]) => guideIds.includes(guide.id)).map(([id]) => id);
    workspace.learningBindings.push(makeKnowledgeLearningBinding(guide, "guide", known(ids.length ? ids : [guide.id])));
  }
  for (const item of [...researchCases, ...stagedCaseLabs]) {
    const unit = byId.get(item.id)!;
    workspace.learningBindings.push(makeKnowledgeLearningBinding(item, "case_lab", known([item.id, ...unit.prerequisiteIds])));
  }
  for (const studio of studioTemplates) workspace.learningBindings.push(makeKnowledgeLearningBinding(studio, "studio_task", known([studio.id])));
  workspace.learningBindings = [...new Map(workspace.learningBindings.map((binding) => [`${binding.assetId}:${binding.assetRevision}:${binding.assetHash}`, binding])).values()];
  return workspace;
}

let initialSnapshot: KnowledgeWorkspace | undefined;
/** Returns an isolated copy: persisted user revisions never mutate the built-in snapshot. */
export function createInitialKnowledgeWorkspace(): KnowledgeWorkspace {
  // Match JSON persistence semantics before hashing history snapshots in tests
  // and returning them to the store. Legacy optional fields may be undefined.
  initialSnapshot ??= JSON.parse(JSON.stringify(buildInitialKnowledgeWorkspace())) as KnowledgeWorkspace;
  return structuredClone(initialSnapshot);
}

export function knowledgeMigrationSummary(workspace = createInitialKnowledgeWorkspace()) {
  return {
    units: workspace.units.length, sources: workspace.sources.length, claims: workspace.claims.length,
    learningBindings: workspace.learningBindings.length,
    unresolvedBindings: workspace.learningBindings.filter((binding) => !binding.knowledgeRevisionBindings.length).length,
    reviewRequiredBindings: workspace.learningBindings.filter((binding) => binding.migrationStatus === "REVIEW_REQUIRED").length,
    protocolExamples: builtInProtocolImports.length,
  };
}
