import type { ConceptLessonV1, MethodLessonV1 } from "../domain/learningArchitecture";
import type { StagedConceptLessonV1, StagedMethodLessonV1, CurriculumClaimV1 } from "../domain/curriculum";
import type { LearningUnitV1 } from "../domain/learningKernel";
import type {
  KnowledgeUnit, KnowledgeEvidenceSource, KnowledgeEvidenceClaim, KnowledgeLearningBinding,
  KnowledgeOrigin, KnowledgeEvidenceLink, KnowledgeLearningKind, KnowledgeWorkspace,
} from "../domain/knowledge";
import { createKnowledgeTemplate, knowledgeHash } from "./knowledge";

export interface KnowledgeMigrationFragment {
  units: KnowledgeUnit[];
  sources: KnowledgeEvidenceSource[];
  claims: KnowledgeEvidenceClaim[];
  learningBindings: KnowledgeLearningBinding[];
  errors: string[];
  warnings: string[];
}

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const rows = (value: unknown): RecordValue[] => Array.isArray(value) ? value.map(record).filter((item) => Object.keys(item).length > 0) : [];
const text = (value: unknown): string => typeof value === "string" ? value : "";
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const stringList = (value: unknown): string[] => typeof value === "string" ? (value ? [value] : []) : strings(value);
const unique = <T>(values: T[]): T[] => [...new Set(values)];
const origin = (value: unknown): KnowledgeOrigin => ["user", "ai_generated", "verified_seed", "verified_external", "migration"].includes(text(value)) ? value as KnowledgeOrigin : "migration";
const originalRevision = (value: unknown): number => Number.isInteger(value) && Number(value) > 0 ? Number(value) : 1;
const rehash = <T extends { hash: string }>(value: T): T => ({ ...value, hash: knowledgeHash(value) });
export const knowledgeBindingFor = (unit: KnowledgeUnit) => ({ knowledgeUnitId: unit.id, revision: unit.revision, hash: unit.hash });

export function adaptEvidenceSource(raw: unknown, now: string, trustedBuiltIn = false): KnowledgeEvidenceSource {
  const source = record(raw);
  return rehash({
    id: text(source.id), revision: originalRevision(source.revision), hash: "", title: text(source.title),
    ...(text(source.doi) ? { doi: text(source.doi) } : {}),
    ...(text(source.pmid) ? { pmid: text(source.pmid) } : {}),
    ...(text(source.url) ? { url: text(source.url) } : {}),
    ...(text(source.version) ? { version: text(source.version) } : {}),
    metadataStatus: trustedBuiltIn && source.verificationStatus === "verified" ? "metadata_verified" as const : "pending" as const,
    contentOrigin: origin(source.contentOrigin),
    provenance: {
      createdAt: text(source.createdAt) || text(source.retrievedAt) || now, changeReason: "M020 无损来源适配；来源核验不升级具体主张。",
      verificationScope: trustedBuiltIn && source.verificationStatus === "verified" ? "metadata" as const : "none" as const,
      originalId: text(source.id), originalRevision: originalRevision(source.revision),
      originalHash: text(source.contentHash) || knowledgeHash(source), originalPayload: raw,
    },
  });
}

/** Existing content-level attribution is retained as pending synthesis, never upgraded to direct support. */
export function adaptCurriculumClaim(raw: CurriculumClaimV1, sources: KnowledgeEvidenceSource[], now: string): KnowledgeEvidenceClaim {
  return makeMigratedClaim(raw.id, raw.claimCn, raw.sourceIds, sources, raw, now);
}

export function makeMigratedClaim(id: string, statement: string, sourceIds: string[], sources: KnowledgeEvidenceSource[], raw: unknown, now: string): KnowledgeEvidenceClaim {
  return rehash({
    id, revision: originalRevision(record(raw).revision), hash: "", statement,
    sourceBindings: unique(sourceIds).flatMap((sourceId) => {
      const source = sources.find((item) => item.id === sourceId);
      return source ? [{ sourceId, revision: source.revision, hash: source.hash }] : [];
    }),
    verificationStatus: "pending" as const, contentOrigin: origin(record(raw).contentOrigin),
    provenance: {
      createdAt: text(record(raw).createdAt) || now,
      changeReason: "M020 迁移原有主张/显式内容引用；保留原文，逐主张支持范围仍需复核。",
      verificationScope: "none" as const, originalId: text(record(raw).id) || id,
      originalRevision: originalRevision(record(raw).revision), originalHash: knowledgeHash(raw), originalPayload: raw,
    },
  });
}

export function evidenceLinksFor(claims: KnowledgeEvidenceClaim[], supportMode: KnowledgeEvidenceLink["supportMode"] = "curriculum_synthesis"): KnowledgeEvidenceLink[] {
  return claims.map((claim) => ({ claimId: claim.id, revision: claim.revision, hash: claim.hash, supportMode }));
}

function finishMigration(unit: KnowledgeUnit, raw: unknown, now: string, claims: KnowledgeEvidenceClaim[], gaps: string[]): KnowledgeUnit {
  const original = record(raw);
  unit.revision = originalRevision(original.revision);
  unit.aliases = unique([...unit.aliases, text(original.titleEn), ...strings(original.aliases)].filter(Boolean));
  unit.evidenceLinks = evidenceLinksFor(claims);
  unit.contentOrigin = origin(original.contentOrigin);
  // A canonical wrapper has not received a new scientific review. Legacy approval
  // remains in the original payload and the exact learning binding only.
  unit.lifecycle = "pending_review";
  unit.verificationStatus = "pending";
  unit.provenance = {
    createdAt: now, changeReason: "M020 adapter：原科学内容与审核状态保存在 originalPayload；新知识封装待审，未确认字段列为迁移缺口。",
    verificationScope: "none", originalId: text(original.id), originalRevision: originalRevision(original.revision),
    originalHash: text(original.contentHash) || knowledgeHash(raw), originalPayload: raw,
  };
  unit.reviewGaps = unique(gaps);
  unit.migrationStatus = gaps.length ? "REVIEW_REQUIRED" : "complete";
  unit.knowledgeStatus = gaps.length ? "REVIEW_REQUIRED" : "CURRENT";
  if (!claims.length) unit.reviewGaps.push("evidenceLinks：原资产没有可确定的逐主张引用。");
  if (unit.reviewGaps.length) { unit.migrationStatus = "REVIEW_REQUIRED"; unit.knowledgeStatus = "REVIEW_REQUIRED"; }
  return rehash(unit);
}

export function adaptConceptLesson(lesson: ConceptLessonV1 | StagedConceptLessonV1, claims: KnowledgeEvidenceClaim[], now: string, kernelUnit?: LearningUnitV1): KnowledgeUnit {
  const unit = createKnowledgeTemplate("concept", { id: lesson.id, title: lesson.titleCn, now, contentOrigin: lesson.contentOrigin });
  if (unit.knowledgeType !== "concept") throw new Error("Concept template mismatch");
  unit.scientificQuestion = "";
  unit.whyItMatters = lesson.whyItMattersCn;
  unit.intuition = lesson.intuitionCn;
  unit.preciseExplanation = [lesson.preciseExplanationCn];
  unit.concept = { definition: lesson.preciseExplanationCn, counterexamples: [] };
  unit.domain = kernelUnit ? [kernelUnit.domain] : [];
  unit.prerequisiteIds = "prerequisiteIds" in lesson ? [...lesson.prerequisiteIds] : [];
  unit.workflowOrLogic = kernelUnit?.blocks.filter((item) => item.kind === "mechanism").map((item) => item.bodyCn) ?? [];
  unit.boundaries = "primaryApply" in lesson ? [lesson.primaryApply.maximumConclusionCn] : kernelUnit?.blocks.filter((item) => item.kind === "claim_boundary").map((item) => item.bodyCn) ?? [];
  unit.misconceptions = kernelUnit?.blocks.filter((item) => item.kind === "misconception").map((item) => item.bodyCn) ?? [];
  const gaps = ["scientificQuestion：原概念课未独立标注科学问题。", "inputs/outputs/assumptions：原课缺少通用知识字段的明确标注。", "failureModes/alternativeExplanations/counterexamples：未从自由文本猜测。", "逐主张支持范围和复核日期须由正式审核确认。"];
  if (!kernelUnit) gaps.push("domain：原课程未提供科学领域字段。");
  if (["concept-statistical-unit-v1", "staged-concept-statistical-unit", "staged-concept-confidence-interval"].includes(lesson.id)) unit.freshnessClass = "FOUNDATIONAL_STABLE";
  else gaps.push("freshnessClass：保留模板复核策略，待领域审核确认。");
  const result = finishMigration(unit, lesson, now, claims, gaps);
  if (kernelUnit) {
    result.provenance.originalPayload = { lesson, kernelUnit };
    result.provenance.originalHash = knowledgeHash({ lesson, kernelUnit });
  }
  return rehash(result);
}

export function adaptMethodLesson(lesson: MethodLessonV1 | StagedMethodLessonV1, claims: KnowledgeEvidenceClaim[], now: string): KnowledgeUnit {
  const unit = createKnowledgeTemplate("method", { id: lesson.id, title: lesson.titleCn, now, contentOrigin: lesson.contentOrigin });
  if (unit.knowledgeType !== "method") throw new Error("Method template mismatch");
  unit.scientificQuestion = lesson.scientificQuestionCn;
  unit.intuition = "intuitionCn" in lesson ? lesson.intuitionCn : "";
  unit.preciseExplanation = [lesson.coreLogicCn];
  unit.inputs = [...lesson.inputsCn]; unit.outputs = [...lesson.outputsCn]; unit.assumptions = [...lesson.assumptionsCn];
  unit.workflowOrLogic = "walkthroughStepsCn" in lesson ? [...lesson.walkthroughStepsCn] : [];
  unit.boundaries = [...lesson.inappropriateWhenCn]; unit.misconceptions = [...lesson.misusePatternsCn];
  unit.prerequisiteIds = "prerequisiteIds" in lesson ? [...lesson.prerequisiteIds] : [];
  unit.method = {
    algorithmOrStatisticalLogic: lesson.coreLogicCn, parameters: [], diagnostics: [],
    appropriateWhen: [...lesson.appropriateWhenCn], inappropriateWhen: [...lesson.inappropriateWhenCn],
    commonMisuse: [...lesson.misusePatternsCn], reviewerChecks: [...lesson.reviewerChecksCn], paperAppearance: lesson.paperAppearanceCn,
  };
  return finishMigration(unit, lesson, now, claims, ["whyItMatters/domain：原课未提供可无歧义映射的字段。", "parameters/diagnostics：不把 reviewerChecks 猜作已指定参数或诊断方案。", "failureModes/alternativeExplanations：须科学审核补充。", "freshnessClass/复核日期/逐主张支持范围待确认。"]);
}

export function adaptKernelConcept(lesson: LearningUnitV1, claims: KnowledgeEvidenceClaim[], now: string): KnowledgeUnit {
  const unit = createKnowledgeTemplate("concept", { id: lesson.id, title: lesson.titleCn, now, contentOrigin: lesson.contentOrigin });
  if (unit.knowledgeType !== "concept") throw new Error("Concept template mismatch");
  const blockTexts = (kind: string) => lesson.blocks.filter((block) => block.kind === kind).map((block) => block.bodyCn);
  unit.domain = [lesson.domain]; unit.whyItMatters = blockTexts("why_important").join("\n"); unit.intuition = blockTexts("intuition").join("\n");
  unit.preciseExplanation = [...blockTexts("precise_definition"), ...blockTexts("mechanism")];
  unit.concept = { definition: blockTexts("precise_definition").join("\n"), counterexamples: [] };
  unit.workflowOrLogic = blockTexts("mechanism"); unit.boundaries = blockTexts("claim_boundary"); unit.misconceptions = blockTexts("misconception");
  unit.freshnessClass = "FOUNDATIONAL_STABLE";
  return finishMigration(unit, lesson, now, claims, ["科学问题、输入输出、假设、反例及替代解释未从正文自动推断。", "旧 block evidenceClaimIds 为空；现有来源仅是内容层归属，逐主张支持待核查。"]);
}

export function makeKnowledgeLearningBinding(asset: { id: string; revision?: number; contentHash?: string; titleCn?: string; title?: string; lifecycle?: string; verificationStatus?: string }, kind: KnowledgeLearningKind, units: KnowledgeUnit[], gaps: string[] = [], rawPayload: unknown = asset): KnowledgeLearningBinding {
  const distinct = [...new Map(units.map((unit) => [unit.id, unit])).values()];
  const reviewGaps = unique([...gaps, ...(!distinct.length ? ["没有显式 KnowledgeUnit 映射；不得按标题或主题猜测依赖。"] : [])]);
  return {
    assetId: asset.id, assetRevision: asset.revision ?? 1, assetHash: asset.contentHash || knowledgeHash(rawPayload),
    kind, title: asset.titleCn || asset.title || asset.id, knowledgeUnitIds: distinct.map((unit) => unit.id),
    knowledgeRevisionBindings: distinct.map(knowledgeBindingFor), legacyActive: asset.lifecycle === "active" && asset.verificationStatus === "verified",
    migrationStatus: reviewGaps.length ? "REVIEW_REQUIRED" : "complete", reviewGaps,
  };
}

/** Pure adapter for actual legacy/source-pack staging. No classification from title text, no activation. */
export function adaptProtocolStaging(payload: unknown, now: string): KnowledgeMigrationFragment {
  const pack = record(payload);
  const result: KnowledgeMigrationFragment = { units: [], sources: [], claims: [], learningBindings: [], errors: [], warnings: [] };
  if (!Object.keys(pack).length) { result.errors.push("Protocol staging 必须是 JSON 对象。"); return result; }
  // Shared source/claim rows must retain the same immutable revision across
  // independently imported excerpts of the same pack.
  const evidenceAt = text(pack.createdAt) || text(pack.convertedAt) || now;
  const sourceRows = rows(pack.sources);
  if (sourceRows.some((source) => !text(source.id))) result.errors.push("来源条目缺少稳定 ID。");
  result.sources = sourceRows.filter((source) => text(source.id)).map((source) => adaptEvidenceSource(source, evidenceAt));
  if (new Set(result.sources.map((source) => source.id)).size !== result.sources.length) result.errors.push("来源 ID 重复。");
  const claimRows = rows(pack.evidenceClaims);
  if (claimRows.some((claim) => !text(claim.id))) result.errors.push("主张条目缺少稳定 ID。");
  result.claims = claimRows.filter((claim) => text(claim.id)).map((claim) => {
    const sourceIds = unique([text(claim.sourceId), ...strings(claim.sourceIds)].filter(Boolean));
    for (const sourceId of sourceIds) if (!result.sources.some((source) => source.id === sourceId)) result.warnings.push(`${text(claim.id)}：显式来源 ${sourceId} 未包含在本包，依赖待补。`);
    return makeMigratedClaim(text(claim.id), text(claim.claim) || text(claim.statement), sourceIds, result.sources, claim, evidenceAt);
  });
  const typedRows = [...rows(pack.protocolTopics), ...rows(pack.protocols), ...rows(pack.experimentalTechniques)];
  const cards = rows(pack.problemCards);
  // Transfer-only excerpts (e.g. existing PDO case) remain visibly incomplete protocol candidates.
  const contentRows = typedRows.length ? typedRows : cards.length ? cards : rows(pack.transferCases);
  if (!contentRows.length) result.errors.push("未找到 protocolTopics/protocols/experimentalTechniques/problemCards/transferCases；未猜测自由文本为正式 protocol。");
  const seen = new Set<string>();
  for (const item of contentRows) {
    const id = text(item.id);
    if (!id || seen.has(id)) { result.errors.push(id ? `知识 ID 重复：${id}` : "staging 条目缺少稳定 ID。"); continue; }
    seen.add(id);
    const unit = createKnowledgeTemplate("protocol", { id, title: text(item.titleCn) || text(item.title) || id, now, contentOrigin: "migration" });
    if (unit.knowledgeType !== "protocol") throw new Error("Protocol template mismatch");
    unit.domain = unique([text(item.domain), text(item.subdomain)].filter(Boolean));
    unit.scientificQuestion = text(item.scientificQuestion);
    unit.whyItMatters = text(item.whyItMatters); unit.intuition = text(item.intuition);
    unit.preciseExplanation = stringList(item.preciseExplanation);
    unit.inputs = strings(item.inputs); unit.outputs = strings(item.outputs); unit.assumptions = strings(item.assumptions);
    unit.workflowOrLogic = stringList(item.workflowLogic); unit.boundaries = stringList(item.claimBoundary);
    unit.misconceptions = strings(item.misconceptions); unit.failureModes = strings(item.failureModes); unit.alternativeExplanations = strings(item.alternativeExplanations);
    unit.prerequisiteIds = strings(item.prerequisiteIds);
    unit.protocol = {
      signalOrigin: text(item.signalOrigin), experimentalUnit: text(item.experimentalUnit), biologicalReplicate: text(item.biologicalReplicate), technicalReplicate: text(item.technicalReplicate),
      controls: strings(item.controls), workflowLogic: stringList(item.workflowLogic), criticalVariables: strings(item.criticalVariables), qcCheckpoints: strings(item.qcCheckpoints),
      troubleshooting: strings(item.troubleshooting), quantification: text(item.quantification), statisticalUnit: text(item.statisticalUnit), allowedClaims: strings(item.allowedClaims), forbiddenClaims: strings(item.forbiddenClaims),
    };
    const linkedIds = strings(item.evidenceClaimIds);
    const linked = result.claims.filter((claim) => linkedIds.includes(claim.id));
    const gaps = ["staging 导入不提升 verificationStatus / lifecycle；需要逐条科学审核。", "freshnessClass/validFrom/复核日期为迁移元数据，尚无领域审核结论。"];
    if (item.problemType === "unclassified") gaps.push("problemType=unclassified：保留原问题类型待分类，不能冒称完整 protocol lesson。");
    for (const field of ["scientificQuestion", "whyItMatters", "intuition", "preciseExplanation", "inputs", "outputs", "assumptions", "boundaries", "alternativeExplanations"] as const) if (!unit[field]?.length) gaps.push(`${field}：原 staging 未提供明确字段。`);
    for (const [field, value] of Object.entries(unit.protocol)) if (!value.length) gaps.push(`protocol.${field}：原 staging 未提供明确字段；未从诊断标签猜测。`);
    for (const claimId of linkedIds) if (!linked.some((claim) => claim.id === claimId)) gaps.push(`evidenceClaimIds：未解析 ${claimId}。`);
    for (const claim of claimRows.filter((row) => linkedIds.includes(text(row.id)))) {
      const sourceIds = unique([text(claim.sourceId), ...strings(claim.sourceIds)].filter(Boolean));
      for (const sourceId of sourceIds) if (!result.sources.some((source) => source.id === sourceId)) gaps.push(`claim ${text(claim.id)}：未解析显式来源 ${sourceId}。`);
    }
    gaps.push(...strings(record(item.staging).stagedMissing).map((field) => `legacy.${field}：转换器原有缺失标记。`));
    const adapted = finishMigration(unit, item, now, linked, gaps);
    const related = {
      record: item,
      packMetadata: Object.fromEntries(Object.entries(pack).filter(([key]) => !["sources", "evidenceClaims", "problemCards", "protocolTopics", "protocols", "experimentalTechniques", "transferCases", "diagnosticCauses", "diagnosticChecks", "diagnosticPaths", "diagnosticEvidence"].includes(key))),
      diagnosticCauses: rows(pack.diagnosticCauses).filter((row) => row.problemId === id || strings(item.candidateCauseIds).includes(text(row.id))),
      diagnosticPaths: rows(pack.diagnosticPaths).filter((row) => row.problemId === id || item.diagnosticPathId === row.id),
      diagnosticChecks: rows(pack.diagnosticChecks), diagnosticEvidence: rows(pack.diagnosticEvidence),
      transferCases: rows(pack.transferCases).filter((row) => strings(item.transferCaseIds).includes(text(row.id)) || row.id === id),
    };
    adapted.provenance.originalPayload = related;
    adapted.provenance.originalHash = knowledgeHash(related);
    adapted.provenance.changeReason = `M020 无损迁移 ${text(pack.sourcePackId) || text(pack.packId) || text(pack.stagingId) || "source pack"}；原 problemType 与缺失字段保留。`;
    const complete = rehash(adapted);
    result.units.push(complete);
    result.learningBindings.push(makeKnowledgeLearningBinding({ id, revision: originalRevision(item.revision), titleCn: text(item.titleCn), contentHash: text(item.contentHash), lifecycle: "pending_review", verificationStatus: "pending" }, "protocol_lesson", [complete], ["原 staging 仅为候选投影，尚无完成的 protocol lesson。"], item));
    for (const transfer of related.transferCases) {
      if (text(transfer.id) && transfer.id !== id) result.learningBindings.push(makeKnowledgeLearningBinding({ id: text(transfer.id), titleCn: text(transfer.prompt), lifecycle: "pending_review", verificationStatus: "pending" }, "case_lab", [complete], ["原 transfer case 仍待科学/教学审核。"], transfer));
    }
  }
  // A transfer case may explicitly depend on several cards. Keep one immutable
  // asset snapshot and union its recorded dependencies instead of dropping any.
  const bindingRows = new Map<string, KnowledgeLearningBinding>();
  for (const binding of result.learningBindings) {
    const key = `${binding.assetId}:${binding.assetRevision}:${binding.assetHash}`;
    const prior = bindingRows.get(key);
    if (!prior) { bindingRows.set(key, binding); continue; }
    prior.knowledgeUnitIds = unique([...prior.knowledgeUnitIds, ...binding.knowledgeUnitIds]);
    prior.knowledgeRevisionBindings = [...new Map([...prior.knowledgeRevisionBindings, ...binding.knowledgeRevisionBindings].map((ref) => [`${ref.knowledgeUnitId}:${ref.revision}:${ref.hash}`, ref])).values()];
    prior.reviewGaps = unique([...prior.reviewGaps, ...binding.reviewGaps]);
  }
  result.learningBindings = [...bindingRows.values()];
  result.warnings.push(...result.units.flatMap((unit) => unit.reviewGaps.map((gap) => `${unit.id}: ${gap}`)));
  return result;
}

/** Explicit seed fragments are merged only during the initial deterministic migration. */
export function appendKnowledgeSeed(workspace: KnowledgeWorkspace, fragment: Pick<KnowledgeMigrationFragment, "units" | "sources" | "claims" | "learningBindings">): void {
  workspace.units.push(...fragment.units); workspace.sources.push(...fragment.sources); workspace.claims.push(...fragment.claims); workspace.learningBindings.push(...fragment.learningBindings);
}
