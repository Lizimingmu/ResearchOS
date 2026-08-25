import type {
  AuthorityTier,
  ClaimVerificationStatus,
  KnowledgeStatus,
  LegacyCorpusAudit,
  LegacyCorpusConversion,
  LegacyStagingPack,
  RegistrySourceType,
  RegistryVerificationStatus,
  StagingCause,
  StagingCheck,
  StagingClaim,
  StagingEvidence,
  StagingForeignKeyRewrite,
  StagingPath,
  StagingPathNode,
  StagingProblemCard,
  StagingRowMeta,
  StagingSource,
  StagingSourceMerge,
  StagingTrainingCase,
  SupportType,
} from "../domain/problemAtlas.js";
import type { ContentOrigin, VerificationStatus } from "../domain/types.js";
import { evaluateScientificCompleteness, isRecord, normalizeDoi, normalizePmid, normalizeTitle } from "./sourcePack.js";

export const LEGACY_CONVERTER_ID = "ResearchOS M013-10 legacy→v3 staging converter";
export const STAGING_SCHEMA_VERSION = 1;

export const LEGACY_IMPORTANCE_TABLE: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2, minor: 1 };
export const LEGACY_FREQUENCY_TABLE: Record<string, number> = { very_common: 4, common: 3, occasional: 2, rare: 1 };

export const CODEX_APPROVED_METADATA_PATCHES: Array<{ key: { kind: "doi" | "pmid"; value: string } | { kind: "sourceId"; value: string }; field: "url" | "title"; value: string; basis: string }> = [
  { key: { kind: "sourceId", value: "SRC-DESPACE-2024" }, field: "url", value: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10868334/", basis: "Codex 元数据审计（M013_SOURCE_METADATA_AUDIT.md）：原 PubMed/PMC 混合 URL 无效，改用官方 PMC 文章页。" },
  { key: { kind: "pmid", value: "25482647" }, field: "title", value: "An introduction to the wound healing assay using live-cell microscopy.", basis: "Codex 元数据审计：标题按来源记录（Europe PMC 返回标题）修正。" },
  { key: { kind: "pmid", value: "26949479" }, field: "title", value: "Searching for Drug Synergy in Complex Dose-Response Landscapes Using an Interaction Potency Model.", basis: "Codex 元数据审计：标题按来源记录（Europe PMC 返回标题）修正。" },
  { key: { kind: "pmid", value: "26388771" }, field: "title", value: "What is synergy? The Saariselkä agreement revisited.", basis: "Codex 元数据审计：标题按来源记录（Europe PMC 返回标题）修正。" },
  { key: { kind: "doi", value: "10.1101/pdb.prot087288" }, field: "title", value: "Quantitation of Apoptosis and Necrosis by Annexin V Binding, Propidium Iodide Uptake, and Flow Cytometry", basis: "Codex 元数据审计：标题按来源记录（Crossref 返回标题）修正。" },
  { key: { kind: "doi", value: "10.1007/978-1-0716-2903-1_7" }, field: "title", value: "Interference in ELISA", basis: "Codex 元数据审计：标题按来源记录（Crossref 返回标题）修正。" },
  { key: { kind: "doi", value: "10.1038/s41592-025-02890-1" }, field: "title", value: "Selecting the optimal cell migration assay: fundamentals and practical guidelines", basis: "Codex 元数据审计：标题按来源记录（Crossref 返回标题）修正。" },
];

const findMetadataPatch = (row: Record<string, unknown>): { field: "url" | "title"; value: string; basis: string } | undefined => {
  const doi = str(row.doi) ? normalizeDoi(str(row.doi)!) : undefined;
  const pmid = str(row.pmid) ? normalizePmid(str(row.pmid)!) : undefined;
  const id = str(row.id);
  for (const patch of CODEX_APPROVED_METADATA_PATCHES) {
    const key = patch.key;
    if (key.kind === "sourceId" && key.value === id) return { field: patch.field, value: patch.value, basis: patch.basis };
    if (key.kind === "doi" && doi !== undefined && normalizeDoi(key.value) === doi) return { field: patch.field, value: patch.value, basis: patch.basis };
    if (key.kind === "pmid" && pmid !== undefined && normalizePmid(key.value) === pmid) return { field: patch.field, value: patch.value, basis: patch.basis };
  }
  return undefined;
};

export interface AppliedMetadataPatch {
  rowId: string;
  field: "url" | "title";
  from: string;
  to: string;
  basis: string;
}

const DIFFICULTIES = ["foundation", "intermediate", "advanced", "frontier"] as const;
const LAYERS = ["sample", "experiment", "quantification", "statistics", "interpretation"] as const;
const SOURCE_TYPES: RegistrySourceType[] = ["guideline", "consensus", "standard", "protocol", "original_method", "benchmark", "methods_review", "technical_resource", "institutional_sop", "educational", "discovery"];
const TIERS: AuthorityTier[] = ["S", "A", "B", "C", "D", "X"];
const KNOWLEDGE_STATUSES: KnowledgeStatus[] = ["current", "superseded", "deprecated", "emerging"];
const SOURCE_VERIFICATION: RegistryVerificationStatus[] = ["pending", "metadata_verified", "claim_verified", "rejected"];
const CLAIM_VERIFICATION: ClaimVerificationStatus[] = ["pending", "claim_verified", "rejected"];
const SUPPORT_TYPES: SupportType[] = ["direct", "qualified", "contextual", "contradicts", "insufficient"];
const CONTENT_ORIGINS: ContentOrigin[] = ["verified_seed", "verified_external", "user", "ai_generated", "external_source_pack"];
const CARD_VERIFICATION: VerificationStatus[] = ["verified", "pending", "rejected", "not_required"];
const MODES = ["quick", "differential", "sequential", "missing-info", "error-localization", "claim-boundary", "reviewer", "ai-verdict"] as const;

const str = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const strOr = (value: unknown, fallback: string): string => (typeof value === "string" ? value : fallback);
const strArray = (value: unknown): string[] | undefined => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : undefined);
const num = (value: unknown): number | undefined => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const hasCjk = (value: string): boolean => /[\u3400-\u9fff]/u.test(value);
const enumOf = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined => {
  const text = typeof value === "string" ? value : undefined;
  return text !== undefined && (allowed as readonly string[]).includes(text) ? (text as T) : undefined;
};

const meta = (originalId: string): StagingRowMeta => ({ originalId, stagedMissing: [], droppedFields: [], fieldMap: [], converterSupplied: [], converterNotes: [] });
const mapField = (m: StagingRowMeta, from: string, to: string): void => { m.fieldMap.push({ from, to }); };
const drop = (m: StagingRowMeta, field: string, reason: string): void => { m.droppedFields.push({ field, reason }); };
const missing = (m: StagingRowMeta, field: string): void => { if (!m.stagedMissing.includes(field)) m.stagedMissing.push(field); };
const supplied = (m: StagingRowMeta, note: string): void => { m.converterSupplied.push(note); };
const annotate = (m: StagingRowMeta, text: string): void => { m.converterNotes.push(text); };

function convertSource(value: unknown): { source: StagingSource; patches: AppliedMetadataPatch[] } {
  const row = isRecord(value) ? value : {};
  const id = strOr(row.id, "");
  const m = meta(id);
  const patches: AppliedMetadataPatch[] = [];
  if (typeof row.id !== "string") annotate(m, "legacy id 非字符串；按空字符串保留。");
  let verificationStatus: RegistryVerificationStatus | undefined;
  const rawStatus = str(row.verificationStatus);
  if (rawStatus === "pending" || rawStatus === "rejected") verificationStatus = rawStatus;
  else if (rawStatus === "metadata_verified" || rawStatus === "claim_verified") {
    verificationStatus = "pending";
    annotate(m, `verificationStatus 由 "${rawStatus}" 转为 "pending"：转换器不继承外部模型产生的验证结论，正式 gate 需重新签发。`);
  } else if (rawStatus !== undefined) {
    verificationStatus = "pending";
    annotate(m, `verificationStatus 值 "${rawStatus}" 无效；转为 "pending"（未提升）。`);
  } else {
    supplied(m, "verificationStatus=pending（legacy 未提供，使用最低状态，未提升）");
  }
  const sourceType = enumOf(row.sourceType, SOURCE_TYPES);
  if (sourceType === undefined) { missing(m, "sourceType"); if (row.sourceType !== undefined) annotate(m, `sourceType 值 "${String(row.sourceType)}" 无效，未转换。`); }
  const authorityTier = enumOf(row.authorityTier, TIERS);
  if (authorityTier === undefined) { missing(m, "authorityTier"); if (row.authorityTier !== undefined) annotate(m, `authorityTier 值 "${String(row.authorityTier)}" 无效，未转换；层级提案仍需 gate 评审。`); }
  else annotate(m, `authorityTier "${authorityTier}" 保留为来源包提案值；正式层级需 gate 评审。`);
  const knowledgeStatus = enumOf(row.knowledgeStatus, KNOWLEDGE_STATUSES);
  if (knowledgeStatus === undefined) { missing(m, "knowledgeStatus"); if (row.knowledgeStatus !== undefined) annotate(m, `knowledgeStatus 值 "${String(row.knowledgeStatus)}" 无效，未转换。`); }
  const out: StagingSource = {
    id,
    schemaVersion: 1,
    sourceType,
    organization: str(row.organization),
    journal: str(row.journal),
    title: str(row.title),
    authors: strArray(row.authors),
    year: num(row.year),
    doi: str(row.doi),
    pmid: str(row.pmid),
    url: str(row.url),
    authorityTier,
    domain: strArray(row.domain) ?? [],
    version: str(row.version),
    knowledgeStatus,
    supersedes: strArray(row.supersedes) ?? [],
    supersededBy: strArray(row.supersededBy) ?? [],
    verificationStatus,
    verificationScope: strArray(row.verificationScope),
    contentHash: str(row.contentHash),
    retrievedAt: str(row.retrievedAt),
    licenseNote: str(row.licenseNote),
    provenanceNote: str(row.provenanceNote) ?? "",
    contentOrigin: "external_source_pack",
    staging: m,
  };
  supplied(m, "schemaVersion=1（v3 实体常量）");
  supplied(m, 'contentOrigin="external_source_pack"（legacy 来源行未提供 contentOrigin）');
  const metadataPatch = findMetadataPatch(row);
  if (metadataPatch !== undefined) {
    const before = metadataPatch.field === "url" ? (out.url ?? "") : (out.title ?? "");
    if (metadataPatch.field === "url") out.url = metadataPatch.value;
    else out.title = metadataPatch.value;
    patches.push({ rowId: id, field: metadataPatch.field, from: before, to: metadataPatch.value, basis: metadataPatch.basis });
    annotate(m, `元数据修正（Codex 审计补丁）：${metadataPatch.field} "${before}" → "${metadataPatch.value}"。${metadataPatch.basis}`);
  }
  if (typeof row.title !== "string") { out.title = undefined; missing(m, "title"); }
  if (typeof row.year !== "number" || !Number.isFinite(row.year)) { out.year = undefined; missing(m, "year"); }
  if (row.authors === undefined) { out.authors = undefined; missing(m, "authors"); }
  if (row.verificationScope === undefined) { out.verificationScope = undefined; missing(m, "verificationScope"); }
  return { source: out, patches };
}

function convertClaim(value: unknown): StagingClaim {
  const row = isRecord(value) ? value : {};
  const id = strOr(row.id, "");
  const m = meta(id);
  if (typeof row.id !== "string") annotate(m, "legacy id 非字符串；按空字符串保留。");
  const supportType = enumOf(row.supportType, SUPPORT_TYPES);
  if (supportType === undefined) { missing(m, "supportType"); if (row.supportType !== undefined) annotate(m, `supportType 值 "${String(row.supportType)}" 无效，未转换。`); }
  const knowledgeStatus = enumOf(row.knowledgeStatus, KNOWLEDGE_STATUSES);
  if (knowledgeStatus === undefined) { missing(m, "knowledgeStatus"); if (row.knowledgeStatus !== undefined) annotate(m, `knowledgeStatus 值 "${String(row.knowledgeStatus)}" 无效，未转换。`); }
  const rawStatus = str(row.verificationStatus);
  let verificationStatus: ClaimVerificationStatus | undefined;
  if (rawStatus === "pending" || rawStatus === "rejected") verificationStatus = rawStatus;
  else if (rawStatus === "claim_verified") {
    verificationStatus = "pending";
    annotate(m, `verificationStatus 由 "claim_verified" 转为 "pending"：转换器不继承外部模型产生的验证结论，正式 gate 需重新签发。`);
  } else if (rawStatus !== undefined) {
    verificationStatus = "pending";
    annotate(m, `verificationStatus 值 "${rawStatus}" 无效；转为 "pending"（未提升）。`);
  } else {
    supplied(m, "verificationStatus=pending（legacy 未提供，使用最低状态，未提升）");
  }
  const out: StagingClaim = {
    id,
    claim: str(row.claim),
    scope: str(row.scope) ?? "",
    qualification: str(row.qualification) ?? "",
    sourceId: str(row.sourceId),
    supportType,
    supportingLocation: str(row.supportingLocation),
    reviewerNote: str(row.reviewerNote) ?? "",
    domain: strArray(row.domain) ?? [],
    knowledgeStatus,
    verificationStatus,
    contentOrigin: "external_source_pack",
    staging: m,
  };
  supplied(m, 'contentOrigin="external_source_pack"（legacy 主张行未提供 contentOrigin）');
  if (typeof row.claim !== "string") { out.claim = undefined; missing(m, "claim"); }
  if (typeof row.scope !== "string") { out.scope = undefined; missing(m, "scope"); }
  if (typeof row.qualification !== "string") { out.qualification = undefined; missing(m, "qualification"); }
  if (typeof row.sourceId !== "string") { out.sourceId = undefined; missing(m, "sourceId"); }
  if (typeof row.supportingLocation !== "string") { out.supportingLocation = undefined; missing(m, "supportingLocation"); }
  if (typeof row.reviewerNote !== "string") { out.reviewerNote = undefined; missing(m, "reviewerNote"); }
  return out;
}

function convertCard(value: unknown): StagingProblemCard {
  const row = isRecord(value) ? value : {};
  const id = strOr(row.id, "");
  const m = meta(id);
  if (typeof row.id !== "string") annotate(m, "legacy id 非字符串；按空字符串保留。");
  const difficulty = enumOf(row.difficulty, DIFFICULTIES);
  if (difficulty === undefined) { missing(m, "difficulty"); if (row.difficulty !== undefined) annotate(m, `difficulty 值 "${String(row.difficulty)}" 无效，未转换。`); }
  const importanceRaw = str(row.importance);
  const importance = importanceRaw !== undefined ? LEGACY_IMPORTANCE_TABLE[importanceRaw] : undefined;
  if (importanceRaw !== undefined) {
    if (importance === undefined) { missing(m, "importance"); annotate(m, `importance 值 "${importanceRaw}" 不在显式查找表中，未转换。`); }
    else { mapField(m, "importance", "importance（查找表 critical/high/medium→5/4/3）"); annotate(m, `importance "${importanceRaw}"→${importance}（显式查找表）`); }
  } else missing(m, "importance");
  const frequencyRaw = str(row.frequency);
  const frequency = frequencyRaw !== undefined ? LEGACY_FREQUENCY_TABLE[frequencyRaw] : undefined;
  if (frequencyRaw !== undefined) {
    if (frequency === undefined) { missing(m, "frequency"); annotate(m, `frequency 值 "${frequencyRaw}" 不在显式查找表中，未转换。`); }
    else { mapField(m, "frequency", "frequency（查找表 very_common/common→4/3）"); annotate(m, `frequency "${frequencyRaw}"→${frequency}（显式查找表）`); }
  } else missing(m, "frequency");
  let diagnosticPathId: string | undefined;
  const legacyPaths = strArray(row.diagnostic_path) ?? [];
  if (legacyPaths.length === 1) { diagnosticPathId = legacyPaths[0]; mapField(m, "diagnostic_path", "diagnosticPathId"); }
  else if (legacyPaths.length > 1) { missing(m, "diagnosticPathId"); annotate(m, `legacy diagnostic_path 含 ${legacyPaths.length} 条路径；规范模型为单路径，未选择。`); }
  else { missing(m, "diagnosticPathId"); }
  const legacyOrigin = enumOf(row.content_origin, CONTENT_ORIGINS);
  const contentOrigin: ContentOrigin | undefined = legacyOrigin ?? "external_source_pack";
  if (legacyOrigin === undefined) supplied(m, 'contentOrigin="external_source_pack"（legacy 未提供或值无效）');
  const legacyVerification = enumOf(row.verification_status, CARD_VERIFICATION);
  const verificationStatus: VerificationStatus | undefined = legacyVerification ?? "pending";
  if (legacyVerification === undefined) supplied(m, "verificationStatus=pending（legacy 未提供或值无效；使用最低状态，未提升）");
  const legacyVerifiedAt = str(row.verified_at);
  const out: StagingProblemCard = {
    id,
    schemaVersion: 1,
    domain: str(row.domain),
    subdomain: str(row.subdomain),
    problemType: "unclassified",
    titleCn: str(row.title_cn),
    titleEn: str(row.title_en),
    aliases: strArray(row.aliases),
    keywords: strArray(row.keywords),
    difficulty,
    importance,
    frequency,
    observation: str(row.symptom),
    context: str(row.context),
    whyItMatters: str(row.why_it_matters),
    candidateCauseIds: strArray(row.candidate_causes),
    diagnosticPathId,
    redFlags: strArray(row.red_flags),
    commonWrongActions: strArray(row.common_wrong_actions),
    recommendedReasoning: strArray(row.recommended_reasoning),
    statisticalImplication: str(row.statistical_implication),
    experimentalImplication: str(row.experimental_implication),
    bioinformaticsImplication: str(row.bioinformatics_implication),
    claimBoundary: str(row.claim_boundary),
    reviewerImplication: str(row.reviewer_implication),
    transferCaseIds: strArray(row.transfer_cases),
    misconceptionTags: strArray(row.misconception_tags),
    relatedMethodIds: strArray(row.related_methods),
    relatedProtocolIds: strArray(row.related_protocols),
    relatedPatternIds: strArray(row.related_patterns),
    evidenceClaimIds: strArray(row.evidence_claims),
    contentOrigin,
    verificationStatus,
    verifiedAt: legacyVerifiedAt,
    staging: m,
  };
  supplied(m, "schemaVersion=1（v3 实体常量）");
  supplied(m, 'problemType="unclassified"（legacy 无已评审类型；转换器与校验器不得从标题/标签/文本推断类型）');
  missing(m, "knowledgeStatus");
  supplied(m, "supersedes=[] 与 supersededBy=[]（legacy 无超集信息，非推断）");
  const renameMap: Array<[string, string]> = [
    ["title_cn", "titleCn"], ["title_en", "titleEn"], ["symptom", "observation"], ["why_it_matters", "whyItMatters"],
    ["candidate_causes", "candidateCauseIds"], ["red_flags", "redFlags"], ["common_wrong_actions", "commonWrongActions"],
    ["recommended_reasoning", "recommendedReasoning"], ["statistical_implication", "statisticalImplication"],
    ["experimental_implication", "experimentalImplication"], ["bioinformatics_implication", "bioinformaticsImplication"],
    ["claim_boundary", "claimBoundary"], ["reviewer_implication", "reviewerImplication"], ["transfer_cases", "transferCaseIds"],
    ["misconception_tags", "misconceptionTags"], ["related_methods", "relatedMethodIds"],
    ["related_protocols", "relatedProtocolIds"], ["related_patterns", "relatedPatternIds"],
    ["evidence_claims", "evidenceClaimIds"], ["content_origin", "contentOrigin"],
    ["verification_status", "verificationStatus"], ["verified_at", "verifiedAt"],
  ];
  for (const [from, to] of renameMap) {
    if (row[from] !== undefined) mapField(m, from, to);
  }
  if (typeof row.title_cn !== "string") { out.titleCn = undefined; missing(m, "titleCn"); }
  if (typeof row.title_en !== "string") { out.titleEn = undefined; missing(m, "titleEn"); }
  if (typeof row.symptom !== "string") { out.observation = undefined; missing(m, "observation"); }
  if (typeof row.claim_boundary !== "string") { out.claimBoundary = undefined; missing(m, "claimBoundary"); }
  if (typeof row.reviewer_implication !== "string") { out.reviewerImplication = undefined; missing(m, "reviewerImplication"); }
  if (row.candidate_causes !== undefined && !Array.isArray(row.candidate_causes)) { out.candidateCauseIds = undefined; missing(m, "candidateCauseIds"); }
  if (row.evidence_claims !== undefined && !Array.isArray(row.evidence_claims)) { out.evidenceClaimIds = undefined; missing(m, "evidenceClaimIds"); }
  return out;
}

function convertCause(value: unknown): StagingCause {
  const row = isRecord(value) ? value : {};
  const id = strOr(row.id, "");
  const m = meta(id);
  if (typeof row.id !== "string") annotate(m, "legacy id 非字符串；按空字符串保留。");
  const causeText = str(row.cause);
  let labelCn: string | undefined;
  let labelEn: string | undefined;
  if (causeText !== undefined) {
    if (hasCjk(causeText)) { labelCn = causeText; mapField(m, "cause", "labelCn（脚本判定含中文，原文未改写）"); }
    else { labelEn = causeText; mapField(m, "cause", "labelEn（脚本判定不含中文，原文未改写）"); }
  } else missing(m, "labelCn/labelEn");
  const out: StagingCause = {
    id,
    problemId: str(row.problemId),
    labelCn,
    labelEn,
    initialRank: undefined,
    layer: undefined,
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    evidenceClaimIds: undefined,
    staging: m,
  };
  missing(m, "mechanism");
  missing(m, "initialRank");
  missing(m, "layer");
  missing(m, "uncertaintyNote");
  if (row.supportingFindings !== undefined && strArray(row.supportingFindings)?.length) {
    drop(m, "supportingFindings", "自由文本发现描述；规范模型 supportingEvidenceIds 为证据 ID 列表，不得推断映射。");
  }
  if (row.contradictingFindings !== undefined && strArray(row.contradictingFindings)?.length) {
    drop(m, "contradictingFindings", "自由文本发现描述；规范模型 contradictingEvidenceIds 为证据 ID 列表，不得推断映射。");
  }
  if (row.evidenceSources !== undefined && strArray(row.evidenceSources)?.length) {
    drop(m, "evidenceSources", "SRC-* 来源引用不得推断为 evidenceClaimIds（逐条主张核验需正式评审）；原始值保留在源包中。");
    missing(m, "evidenceClaimIds");
  }
  if (row.priorPlausibility !== undefined) drop(m, "priorPlausibility", "先验可能性标签无规范对应字段；不得推断为 initialRank。");
  if (row.severity !== undefined) drop(m, "severity", "严重性判断需正式评审；不得机械转换。");
  return out;
}

function convertCheck(value: unknown, discriminatedBy: Map<string, string[]>): StagingCheck {
  const row = isRecord(value) ? value : {};
  const id = strOr(row.id, "");
  const m = meta(id);
  if (typeof row.id !== "string") annotate(m, "legacy id 非字符串；按空字符串保留。");
  const question = str(row.question);
  let questionCn: string | undefined;
  if (question !== undefined) {
    if (hasCjk(question)) { questionCn = question; mapField(m, "question", "questionCn（脚本判定含中文，原文未改写）"); }
    else { missing(m, "questionCn"); annotate(m, "legacy question 不含中文且规范模型无 questionEn 字段；文本保留在源包中。"); }
  } else missing(m, "questionCn");
  const discriminatesCauseIds = discriminatedBy.get(id);
  if (discriminatesCauseIds !== undefined) {
    mapField(m, "discriminatingTests（原因侧）", "discriminatesCauseIds（按 legacy cause.discriminatingTests 反向解析）");
    annotate(m, `discriminatesCauseIds 由 legacy causes 的 discriminatingTests 反向解析：${discriminatesCauseIds.join(", ")}。`);
  } else {
    missing(m, "discriminatesCauseIds");
    annotate(m, "legacy 无原因声明此检查为区分性检查。");
  }
  missing(m, "costCategory");
  missing(m, "availability");
  return {
    id,
    problemId: str(row.problemId),
    questionCn,
    informationSupplied: str(row.informationRevealed),
    discriminatesCauseIds,
    expectedUpdate: str(row.reasoningEffect),
    prerequisites: [],
    evidenceClaimIds: strArray(row.evidenceReferences),
    staging: m,
  };
}

function convertPath(value: unknown): StagingPath {
  const row = isRecord(value) ? value : {};
  const id = strOr(row.id, "");
  const m = meta(id);
  if (typeof row.id !== "string") annotate(m, "legacy id 非字符串；按空字符串保留。");
  const legacyNodes = Array.isArray(row.nodes) ? row.nodes.filter(isRecord) : [];
  const nodes: StagingPathNode[] = legacyNodes.map((node, index) => {
    const step = num(node.step) ?? index + 1;
    const checkId = str(node.checkId);
    const outNode: StagingPathNode = {
      id: `n${step}`,
      step,
      availableEvidenceIds: [],
      permittedCheckIds: checkId !== undefined ? [checkId] : [],
      expectedCheckId: checkId,
    };
    if (checkId === undefined) annotate(m, `nodes[${index}].expectedCheckId 缺失：legacy 节点未提供 checkId。`);
    return outNode;
  });
  mapField(m, "nodes[].step+checkId", "DiagnosticPathNode（step/expectedCheckId/permittedCheckIds）");
  annotate(m, "节点 question/requiredJudgment/lockedAnswer/stopCondition 无 legacy 对应字段，保留为缺失；availableEvidenceIds=[]（legacy 路径节点无证据引用）。");
  const out: StagingPath = {
    id,
    problemId: str(row.problemId),
    nodes,
    staging: m,
  };
  missing(m, "finalRanking");
  missing(m, "finalLayer");
  if (row.terminalLogic !== undefined) drop(m, "terminalLogic", "终止逻辑为自由文本；规范模型无对应字段，不得推断为 finalRanking/finalLayer。");
  return out;
}

function convertEvidence(value: unknown): StagingEvidence {
  const row = isRecord(value) ? value : {};
  const id = strOr(row.id, "");
  const m = meta(id);
  if (typeof row.id !== "string") annotate(m, "legacy id 非字符串；按空字符串保留。");
  const refs = strArray(row.evidenceReferences) ?? [];
  let evidenceClaimId: string | undefined;
  if (refs.length === 1) { evidenceClaimId = refs[0]; mapField(m, "evidenceReferences", "evidenceClaimId（唯一引用）"); }
  else if (refs.length > 1) { missing(m, "evidenceClaimId"); annotate(m, `evidenceReferences 含 ${refs.length} 条引用；规范模型为单条，未选择。`); }
  else { missing(m, "evidenceClaimId"); }
  missing(m, "sourceType");
  missing(m, "scope");
  missing(m, "affectsCauseIds");
  missing(m, "direction");
  const out: StagingEvidence = {
    id,
    problemId: str(row.problemId),
    result: str(row.reveal),
    sequenceOrder: num(row.stage),
    evidenceClaimId,
    staging: m,
  };
  mapField(m, "reveal", "result（原文未改写）");
  mapField(m, "stage", "sequenceOrder");
  if (row.label !== undefined) drop(m, "label", "短标签无规范对应字段；不得推断为 scope。");
  if (row.reasoningPrompt !== undefined) drop(m, "reasoningPrompt", "无规范对应字段。");
  if (row.expectedUpdate !== undefined) drop(m, "expectedUpdate", "无规范对应字段。");
  return out;
}

function convertTransfer(value: unknown, cardIdsById: Map<string, string[]>): StagingTrainingCase {
  const row = isRecord(value) ? value : {};
  const id = strOr(row.id, "");
  const m = meta(id);
  if (typeof row.id !== "string") annotate(m, "legacy id 非字符串；按空字符串保留。");
  const referencing = cardIdsById.get(id) ?? [];
  let problemId: string | undefined;
  if (referencing.length === 1) {
    problemId = referencing[0];
    mapField(m, "（卡片 transfer_cases 反向解析）", "problemId");
    annotate(m, `problemId 由唯一引用该案例的卡片 ${problemId} 解析。`);
  } else if (referencing.length > 1) {
    missing(m, "problemId");
    annotate(m, `transfer case 被 ${referencing.length} 张卡片引用（${referencing.join(", ")}）；无法唯一解析，保留缺失。`);
  } else {
    missing(m, "problemId");
    annotate(m, "无卡片引用此 transfer case。");
  }
  const out: StagingTrainingCase = {
    id,
    problemId,
    prompt: str(row.prompt),
    context: str(row.scenario),
    contentOrigin: "external_source_pack",
    verificationStatus: "pending",
    staging: m,
  };
  mapField(m, "prompt", "prompt（原文未改写）");
  mapField(m, "scenario", "context（原文未改写）");
  missing(m, "mode");
  missing(m, "answerSchema");
  missing(m, "rubric");
  missing(m, "expected");
  missing(m, "misconceptionTags");
  missing(m, "farTransferFamily");
  supplied(m, 'contentOrigin="external_source_pack"（legacy 未提供）');
  supplied(m, "verificationStatus=pending（legacy 未提供，使用最低状态，未提升）");
  if (row.concept !== undefined) drop(m, "concept", "概念标识不等于 misconceptionTags/farTransferFamily；不得推断。");
  if (row.expectedPrinciples !== undefined) drop(m, "expectedPrinciples", "原则标签不等于 rubric 文本；不得推断。");
  if (row.evidenceClaims !== undefined) drop(m, "evidenceClaims", "规范训练案例类型无主张列表字段。");
  return out;
}

export interface LegacyPackInput {
  packId: string;
  fileName: string;
  value: unknown;
  sha256?: string;
}

interface ConvertedPack {
  input: LegacyPackInput;
  header: { packSchemaVersion: number; title: string; createdAt: string; createdBy: string; provenance: string; verificationMetadata: unknown };
  sources: StagingSource[];
  metadataPatches: AppliedMetadataPatch[];
  claims: StagingClaim[];
  cards: StagingProblemCard[];
  causes: StagingCause[];
  checks: StagingCheck[];
  paths: StagingPath[];
  evidence: StagingEvidence[];
  transfers: StagingTrainingCase[];
}

function convertPackEntities(input: LegacyPackInput): ConvertedPack | undefined {
  const doc = isRecord(input.value) ? input.value : {};
  if (!isRecord(input.value)) return undefined;
  const sourceResults = asRecordList(doc.sources).map(convertSource);
  const sources = sourceResults.map((entry) => entry.source);
  const metadataPatches = sourceResults.flatMap((entry) => entry.patches);
  const claims = asRecordList(doc.evidenceClaims).map(convertClaim);
  const cards = asRecordList(doc.problemCards).map(convertCard);
  const causes = asRecordList(doc.diagnosticCauses).map(convertCause);
  const discriminatedBy = new Map<string, string[]>();
  for (const cause of causes) {
    const legacyRow = asRecordList(doc.diagnosticCauses).find((row) => str(row.id) === cause.id);
    for (const testId of strArray(legacyRow?.discriminatingTests) ?? []) {
      const list = discriminatedBy.get(testId) ?? [];
      if (!list.includes(cause.id)) list.push(cause.id);
      discriminatedBy.set(testId, list);
    }
  }
  const checks = asRecordList(doc.diagnosticChecks).map((row) => convertCheck(row, discriminatedBy));
  const paths = asRecordList(doc.diagnosticPaths).map(convertPath);
  const evidence = asRecordList(doc.diagnosticEvidence).map(convertEvidence);
  const cardIdsById = new Map<string, string[]>();
  for (const card of asRecordList(doc.problemCards)) {
    const cardId = str(card.id);
    for (const transferId of strArray(card.transfer_cases) ?? []) {
      const list = cardIdsById.get(transferId) ?? [];
      if (cardId !== undefined && !list.includes(cardId)) list.push(cardId);
      cardIdsById.set(transferId, list);
    }
  }
  const transfers = asRecordList(doc.transferCases).map((row) => convertTransfer(row, cardIdsById));
    return {
      input,
      header: {
        packSchemaVersion: num(doc.packSchemaVersion) ?? 1,
        title: str(doc.title) ?? "",
        createdAt: str(doc.createdAt) ?? "",
        createdBy: str(doc.createdBy) ?? "",
        provenance: str(doc.provenance) ?? "",
        verificationMetadata: doc.verificationMetadata,
      },
      sources, metadataPatches, claims, cards, causes, checks, paths, evidence, transfers,
    };
  }

const asRecordList = (value: unknown): Array<Record<string, unknown>> => (Array.isArray(value) ? value.filter(isRecord) : []);

export function convertLegacyCorpus(inputs: LegacyPackInput[], options: { archive?: string; now?: string } = {}): LegacyCorpusConversion {
  const now = options.now ?? new Date().toISOString();
  const archive = options.archive ?? "unknown-archive";
  const audit: LegacyCorpusAudit = {
    packIds: [],
    total: { sources: 0, evidenceClaims: 0, problemCards: 0, diagnosticCauses: 0, diagnosticChecks: 0, diagnosticPaths: 0, diagnosticEvidence: 0, transferCases: 0 },
    sourceCanonicalization: { doiCollisions: [], pmidCollisions: [], titleCollisions: [], collisionFreeAfterMerge: true },
    foreignKeyRewrites: [],
    metadataPatches: [],
    discardedFieldCounts: {},
    enumLookupTables: { importance: { ...LEGACY_IMPORTANCE_TABLE }, frequency: { ...LEGACY_FREQUENCY_TABLE } },
    converterPolicies: [
      "仅机械确定性映射：snake_case→camelCase、稳定 ID、显式枚举/别名查找表、来源规范 ID 与外键重写。",
      "科学文本逐字保留；除无规范字段可承载的 legacy 字段外，不删除、不改写、不补造。",
      "不得推断 problemType：全部 legacy 卡片为 unclassified，永不导入合格。",
      "不得推断 scope/qualification/候选原因/结论边界/推荐推理/严重性/可修复性/证据支持/层级/排序/成本。",
      "永不提升 pending：metadata_verified/claim_verified 一律降为 pending，verifiedAt/verifiedBy 不继承。",
      "不采用全局“候选原因≥3”规则；diagnostic 完整性允许两个有用原因、优先三个。",
      "来源去重：同规范化 DOI/PMID/标题去重，规范 ID 取字典序最小 ID；每次合并与冲突均披露。",
    ],
  };
  const converted = inputs.map((input) => ({ input, pack: convertPackEntities(input) })).filter((entry): entry is { input: LegacyPackInput; pack: ConvertedPack } => entry.pack !== undefined);
  if (converted.length === 0) {
    return { ok: false, failure: { code: "CONVERT_NO_PACKS", location: "corpus", message: "没有任何可解析的 legacy 源包。", }, packs: [], audit };
  }

  // Cross-pack source canonicalization
  const allSources: Array<{ pack: ConvertedPack; row: StagingSource }> = [];
  for (const { pack } of converted) for (const row of pack.sources) allSources.push({ pack, row });
  const doiGroups = groupSources(allSources, (row) => (row.doi ? normalizeDoi(row.doi) : undefined));
  const pmidGroups = groupSources(allSources, (row) => (row.pmid ? normalizePmid(row.pmid) : undefined));
  const titleGroups = groupSources(allSources, (row) => (row.title ? normalizeTitle(row.title).toLowerCase() : undefined));
  const canonicalOf = new Map<string, string>();
  const mergesByKind: Record<"doi" | "pmid" | "title", StagingSourceMerge[]> = { doi: [], pmid: [], title: [] };
  const applyGroup = (kind: "doi" | "pmid" | "title", groups: Map<string, Array<{ pack: ConvertedPack; row: StagingSource }>>): void => {
    for (const [key, members] of groups) {
      const ids = [...new Set(members.map((entry) => entry.row.id))];
      if (ids.length < 2) continue;
      ids.sort();
      const canonicalId = ids[0];
      const merge: StagingSourceMerge = { canonicalId, keyKind: kind, keyValue: key, originalIds: ids, mergedFieldNotes: [] };
      for (const member of members) if (member.row.id !== canonicalId) canonicalOf.set(member.row.id, canonicalId);
      mergesByKind[kind].push(merge);
    }
  };
  applyGroup("doi", doiGroups);
  applyGroup("pmid", pmidGroups);
  applyGroup("title", titleGroups);

  // Merge duplicated source rows into the canonical row (deterministic: canonical id keeps its values; gaps filled from other rows in id order)
  const mergedSourceById = new Map<string, StagingSource>();
  for (const { row } of allSources) {
    const canonicalId = canonicalOf.get(row.id) ?? row.id;
    const existing = mergedSourceById.get(canonicalId);
    if (!existing) {
      mergedSourceById.set(canonicalId, { ...row, id: canonicalId, staging: { ...row.staging, originalId: row.staging.originalId } });
      continue;
    }
    const fill = (target: StagingSource, sourceRow: StagingSource, field: keyof StagingSource): void => {
      const current = target[field];
      const incoming = sourceRow[field];
      if (current !== undefined || incoming === undefined) return;
      if (Array.isArray(incoming) && incoming.length === 0) return;
      if (typeof incoming === "string" && incoming.trim() === "") return;
      (target as unknown as Record<string, unknown>)[field] = incoming;
    };
    const notes = existing.staging.converterNotes;
    const fillable: Array<keyof StagingSource> = ["organization", "journal", "year", "doi", "pmid", "url", "version", "authors", "domain"];
    for (const field of fillable) fill(existing, row, field);
    if (Array.isArray(row.domain)) {
      const current = existing.domain ?? [];
      const merged = [...current];
      for (const item of row.domain) if (!merged.includes(item)) merged.push(item);
      if (merged.length !== current.length) { existing.domain = merged; notes.push(`domain 合并自 ${row.id}。`); }
    }
    if (row.title !== undefined && existing.title !== undefined && normalizeTitle(existing.title).toLowerCase() !== normalizeTitle(row.title).toLowerCase()) {
      notes.push(`title 与 ${row.id} 不一致；保留规范行 ${canonicalId} 的标题（冲突已披露）。`);
    }
    const merge = [...mergesByKind.doi, ...mergesByKind.pmid, ...mergesByKind.title].find((entry) => entry.canonicalId === canonicalId);
    merge?.mergedFieldNotes.push(`merged ${row.id} into ${canonicalId}`);
    notes.push(`来源去重：${row.id} 与 ${canonicalId} 同源合并（规范 ID 为字典序最小者）。`);
  }
  audit.sourceCanonicalization.doiCollisions = mergesByKind.doi;
  audit.sourceCanonicalization.pmidCollisions = mergesByKind.pmid;
  audit.sourceCanonicalization.titleCollisions = mergesByKind.title;

  // Post-merge collision check
  const postDoi = new Set<string>();
  const postPmid = new Set<string>();
  const postTitle = new Set<string>();
  let collisionFreeAfterMerge = true;
  for (const row of mergedSourceById.values()) {
    if (row.doi) { const key = normalizeDoi(row.doi); if (postDoi.has(key)) collisionFreeAfterMerge = false; postDoi.add(key); }
    if (row.pmid) { const key = normalizePmid(row.pmid); if (postPmid.has(key)) collisionFreeAfterMerge = false; postPmid.add(key); }
    if (row.title) { const key = normalizeTitle(row.title).toLowerCase(); if (postTitle.has(key)) collisionFreeAfterMerge = false; postTitle.add(key); }
  }
  audit.sourceCanonicalization.collisionFreeAfterMerge = collisionFreeAfterMerge;

  // Build per-pack staging docs with rewritten foreign keys
  const packs: LegacyStagingPack[] = [];
  for (const { input, pack } of converted) {
    audit.packIds.push(input.packId);
    const packSourceIds = new Set(pack.sources.map((row) => row.id));
    const sources: StagingSource[] = [];
    for (const row of pack.sources) {
      const canonicalId = canonicalOf.get(row.id) ?? row.id;
      const canonical = mergedSourceById.get(canonicalId);
      if (canonical === undefined || packSourceIds.has(canonicalId) === false && sources.some((entry) => entry.id === canonicalId)) continue;
      if (sources.some((entry) => entry.id === canonicalId)) continue;
      sources.push(canonical);
    }
    const claims: StagingClaim[] = pack.claims.map((row) => {
      if (row.sourceId !== undefined) {
        const canonicalId = canonicalOf.get(row.sourceId) ?? row.sourceId;
        if (canonicalId !== row.sourceId) {
          audit.foreignKeyRewrites.push({ entity: "evidenceClaim", rowId: row.id, field: "sourceId", from: row.sourceId, to: canonicalId });
          row.staging.converterNotes.push(`sourceId 由 ${row.sourceId} 重写为规范来源 ${canonicalId}（去重合并）。`);
          return { ...row, sourceId: canonicalId };
        }
      }
      return row;
    });
    for (const row of [...pack.cards, ...pack.causes, ...pack.checks, ...pack.paths, ...pack.evidence, ...pack.transfers]) {
      for (const dropField of row.staging.droppedFields) audit.discardedFieldCounts[dropField.field] = (audit.discardedFieldCounts[dropField.field] ?? 0) + 1;
    }
    audit.metadataPatches.push(...pack.metadataPatches);
    audit.total.sources += sources.length;
    audit.total.evidenceClaims += claims.length;
    audit.total.problemCards += pack.cards.length;
    audit.total.diagnosticCauses += pack.causes.length;
    audit.total.diagnosticChecks += pack.checks.length;
    audit.total.diagnosticPaths += pack.paths.length;
    audit.total.diagnosticEvidence += pack.evidence.length;
    audit.total.transferCases += pack.transfers.length;
    packs.push({
      stagingSchemaVersion: STAGING_SCHEMA_VERSION,
      stagingId: `${input.packId}-staging`,
      sourcePackId: input.packId,
      sourceArchive: archive,
      originalFileSha256: input.sha256,
      convertedAt: now,
      convertedBy: LEGACY_CONVERTER_ID,
      provenance: `${pack.header.provenance}\n[M013-10 staging] 本 staging 文档由 ${LEGACY_CONVERTER_ID} 机械转换；未新增或改写任何科学主张；legacy externalPreReview 已剥离（外部模型预审不等于正式 gate）。`,
      packSchemaVersion: pack.header.packSchemaVersion,
      title: pack.header.title,
      createdAt: pack.header.createdAt,
      createdBy: pack.header.createdBy,
      sources,
      evidenceClaims: claims,
      problemCards: pack.cards,
      diagnosticCauses: pack.causes,
      diagnosticChecks: pack.checks,
      diagnosticPaths: pack.paths,
      diagnosticEvidence: pack.evidence,
      transferCases: pack.transfers,
      verificationMetadata: { reviewStatus: "pending", reviewer: null, reviewedAt: null },
    });
  }
  return { ok: true, packs, audit };
}

function groupSources(entries: Array<{ pack: ConvertedPack; row: StagingSource }>, keyOf: (row: StagingSource) => string | undefined): Map<string, Array<{ pack: ConvertedPack; row: StagingSource }>> {
  const groups = new Map<string, Array<{ pack: ConvertedPack; row: StagingSource }>>();
  for (const entry of entries) {
    const key = keyOf(entry.row);
    if (key === undefined) continue;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }
  return groups;
}

export interface StagingStructuralReport {
  valid: boolean;
  failures: Array<{ code: string; location: string; message: string }>;
  warnings: Array<{ code: string; location: string; message: string }>;
  rejectedRows: string[];
}

const stagingAsRecordArray = (value: unknown): Array<Record<string, unknown>> => asRecordList(value);

export function validateStagingPack(value: unknown): StagingStructuralReport {
  const failures: Array<{ code: string; location: string; message: string }> = [];
  const warnings: Array<{ code: string; location: string; message: string }> = [];
  const rejectedRows: string[] = [];
  const fail = (code: string, location: string, message: string): void => { failures.push({ code, location, message }); };
  const warn = (code: string, location: string, message: string): void => { warnings.push({ code, location, message }); };
  try {
    const doc = isRecord(value) ? value : {};
    if (!isRecord(value)) fail("STAGING_NOT_OBJECT", "pack", "staging 必须是 JSON 对象。");
    if (doc.stagingSchemaVersion !== STAGING_SCHEMA_VERSION) fail("STAGING_SCHEMA_VERSION", "pack.stagingSchemaVersion", `stagingSchemaVersion=${JSON.stringify(doc.stagingSchemaVersion)}; expected ${STAGING_SCHEMA_VERSION}`);
    if (typeof doc.stagingId !== "string" || doc.stagingId.length === 0) fail("STAGING_ID", "pack.stagingId", "stagingId 缺失。");
    if (typeof doc.sourcePackId !== "string" || doc.sourcePackId.length === 0) fail("STAGING_SOURCE_PACK_ID", "pack.sourcePackId", "sourcePackId 缺失。");
    const collections = ["sources", "evidenceClaims", "problemCards", "diagnosticCauses", "diagnosticChecks", "diagnosticPaths", "diagnosticEvidence", "transferCases"] as const;
    const ids: Record<(typeof collections)[number], Set<string>> = {
      sources: new Set(), evidenceClaims: new Set(), problemCards: new Set(), diagnosticCauses: new Set(),
      diagnosticChecks: new Set(), diagnosticPaths: new Set(), diagnosticEvidence: new Set(), transferCases: new Set(),
    };
    for (const key of collections) {
      const raw = doc[key];
      if (!Array.isArray(raw)) { fail("STAGING_COLLECTION_NOT_ARRAY", `pack.${key}`, `${key} 必须是数组。`); continue; }
      const seen = new Set<string>();
      raw.forEach((item, index) => {
        if (!isRecord(item)) { fail("STAGING_ROW_NOT_OBJECT", `${key}[${index}]`, `${key} 行必须是对象。`); rejectedRows.push(`${key}[${index}]:not-object`); return; }
        const id = str(item.id) ?? "";
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(id)) { fail("STAGING_ROW_MISSING_ID", `${key}[${index}].id`, `${key} 行缺少有效 id。`); rejectedRows.push(`${key}[${index}]:id-invalid`); return; }
        if (seen.has(id)) fail("STAGING_DUPLICATE_ID", `${key}[${index}].id`, `重复 id: ${id}。`);
        seen.add(id);
        const staging = item.staging;
        if (!isRecord(staging) || typeof staging.originalId !== "string") fail("STAGING_META_MISSING", `${key}[${index}].staging`, `行 ${id} 缺少 staging 审计元数据。`);
      });
      ids[key] = seen;
    }
    const rows = (key: (typeof collections)[number]): Array<Record<string, unknown>> => stagingAsRecordArray(doc[key]);
    for (const [index, row] of rows("sources").entries()) {
      const loc = `sources[${index}]`;
      const id = str(row.id) ?? "";
      const enumFail = (fieldName: string, allowed: readonly string[]): void => {
        const value = row[fieldName];
        if (value !== undefined && value !== null && !allowed.includes(String(value))) fail("STAGING_ENUM", `${loc}.${fieldName}`, `${fieldName}=${JSON.stringify(value)} 无效。`);
      };
      enumFail("sourceType", SOURCE_TYPES);
      enumFail("authorityTier", TIERS);
      enumFail("knowledgeStatus", KNOWLEDGE_STATUSES);
      enumFail("verificationStatus", SOURCE_VERIFICATION);
      enumFail("contentOrigin", CONTENT_ORIGINS);
      for (const fieldName of ["title", "provenanceNote", "doi", "pmid", "url", "organization", "journal"]) {
        const value = row[fieldName];
        if (typeof value === "string" && value.length > 2000) fail("STAGING_OVERSIZE", `${loc}.${fieldName}`, `${fieldName} 超过字段上限。`);
      }
      for (const target of strArray(row.supersedes) ?? []) if (!ids.sources.has(target)) warn("STAGING_SUPERSEDES_UNRESOLVED", `${loc}.supersedes`, `supersedes 引用包外来源 ${target}（保留为待评审引用）。`);
      for (const target of strArray(row.supersededBy) ?? []) if (!ids.sources.has(target)) warn("STAGING_SUPERSEDED_BY_UNRESOLVED", `${loc}.supersededBy`, `supersededBy 引用包外来源 ${target}（保留为待评审引用）。`);
      if (row.doi) { const key = normalizeDoi(String(row.doi)); if (row.doi === undefined || !key.startsWith("10.")) fail("STAGING_DOI_FORMAT", `${loc}.doi`, `doi=${JSON.stringify(row.doi)} 格式无效。`); }
      if (row.pmid && !/^\d{4,9}$/.test(normalizePmid(String(row.pmid)))) fail("STAGING_PMID_FORMAT", `${loc}.pmid`, `pmid=${JSON.stringify(row.pmid)} 格式无效。`);
      void id;
    }
    for (const [index, row] of rows("evidenceClaims").entries()) {
      const loc = `evidenceClaims[${index}]`;
      const enumFail = (fieldName: string, allowed: readonly string[]): void => {
        const value = row[fieldName];
        if (value !== undefined && value !== null && !allowed.includes(String(value))) fail("STAGING_ENUM", `${loc}.${fieldName}`, `${fieldName}=${JSON.stringify(value)} 无效。`);
      };
      enumFail("supportType", SUPPORT_TYPES);
      enumFail("knowledgeStatus", KNOWLEDGE_STATUSES);
      enumFail("verificationStatus", CLAIM_VERIFICATION);
      enumFail("contentOrigin", CONTENT_ORIGINS);
      const sourceId = str(row.sourceId);
      if (sourceId !== undefined && sourceId !== "" && !ids.sources.has(sourceId)) fail("STAGING_FK", `${loc}.sourceId`, `sourceId 引用未知来源 ${sourceId}。`);
    }
    for (const [index, row] of rows("problemCards").entries()) {
      const loc = `problemCards[${index}]`;
      const problemType = str(row.problemType);
      if (problemType !== undefined && !["diagnostic", "judgment", "audit", "unclassified"].includes(problemType)) fail("STAGING_ENUM", `${loc}.problemType`, `problemType=${JSON.stringify(problemType)} 无效。`);
      for (const fieldName of ["difficulty"]) if (row[fieldName] !== undefined && !DIFFICULTIES.includes(String(row[fieldName]) as never)) fail("STAGING_ENUM", `${loc}.${fieldName}`, `${fieldName}=${JSON.stringify(row[fieldName])} 无效。`);
      for (const fieldName of ["knowledgeStatus"]) if (row[fieldName] !== undefined && !KNOWLEDGE_STATUSES.includes(String(row[fieldName]) as never)) fail("STAGING_ENUM", `${loc}.${fieldName}`, `${fieldName}=${JSON.stringify(row[fieldName])} 无效。`);
      for (const fieldName of ["verificationStatus"]) if (row[fieldName] !== undefined && !CARD_VERIFICATION.includes(String(row[fieldName]) as never)) fail("STAGING_ENUM", `${loc}.${fieldName}`, `${fieldName}=${JSON.stringify(row[fieldName])} 无效。`);
      for (const fieldName of ["contentOrigin"]) if (row[fieldName] !== undefined && !CONTENT_ORIGINS.includes(String(row[fieldName]) as never)) fail("STAGING_ENUM", `${loc}.${fieldName}`, `${fieldName}=${JSON.stringify(row[fieldName])} 无效。`);
      for (const causeId of strArray(row.candidateCauseIds) ?? []) if (!ids.diagnosticCauses.has(causeId)) fail("STAGING_FK", `${loc}.candidateCauseIds`, `引用未知原因 ${causeId}。`);
      const pathId = str(row.diagnosticPathId);
      if (pathId !== undefined && pathId !== "" && !ids.diagnosticPaths.has(pathId)) fail("STAGING_FK", `${loc}.diagnosticPathId`, `引用未知路径 ${pathId}。`);
      for (const claimId of strArray(row.evidenceClaimIds) ?? []) if (!ids.evidenceClaims.has(claimId)) fail("STAGING_FK", `${loc}.evidenceClaimIds`, `引用未知主张 ${claimId}。`);
      for (const caseId of strArray(row.transferCaseIds) ?? []) if (!ids.transferCases.has(caseId)) fail("STAGING_FK", `${loc}.transferCaseIds`, `引用未知案例 ${caseId}。`);
    }
    for (const [index, row] of rows("diagnosticCauses").entries()) {
      const loc = `diagnosticCauses[${index}]`;
      const problemId = str(row.problemId);
      if (problemId !== undefined && problemId !== "" && !ids.problemCards.has(problemId)) fail("STAGING_FK", `${loc}.problemId`, `problemId 引用未知卡片 ${problemId}。`);
      if (row.layer !== undefined && !LAYERS.includes(String(row.layer) as never)) fail("STAGING_ENUM", `${loc}.layer`, `layer=${JSON.stringify(row.layer)} 无效。`);
      for (const claimId of strArray(row.evidenceClaimIds) ?? []) if (!ids.evidenceClaims.has(claimId)) fail("STAGING_FK", `${loc}.evidenceClaimIds`, `引用未知主张 ${claimId}。`);
    }
    for (const [index, row] of rows("diagnosticChecks").entries()) {
      const loc = `diagnosticChecks[${index}]`;
      const problemId = str(row.problemId);
      if (problemId !== undefined && problemId !== "" && !ids.problemCards.has(problemId)) fail("STAGING_FK", `${loc}.problemId`, `problemId 引用未知卡片 ${problemId}。`);
      if (row.costCategory !== undefined && !["low", "medium", "high"].includes(String(row.costCategory))) fail("STAGING_ENUM", `${loc}.costCategory`, `costCategory=${JSON.stringify(row.costCategory)} 无效。`);
      if (row.availability !== undefined && !["routine", "specialized", "expert"].includes(String(row.availability))) fail("STAGING_ENUM", `${loc}.availability`, `availability=${JSON.stringify(row.availability)} 无效。`);
      for (const causeId of strArray(row.discriminatesCauseIds) ?? []) if (!ids.diagnosticCauses.has(causeId)) fail("STAGING_FK", `${loc}.discriminatesCauseIds`, `引用未知原因 ${causeId}。`);
      for (const claimId of strArray(row.evidenceClaimIds) ?? []) if (!ids.evidenceClaims.has(claimId)) fail("STAGING_FK", `${loc}.evidenceClaimIds`, `引用未知主张 ${claimId}。`);
    }
    for (const [index, row] of rows("diagnosticPaths").entries()) {
      const loc = `diagnosticPaths[${index}]`;
      const problemId = str(row.problemId);
      if (problemId !== undefined && problemId !== "" && !ids.problemCards.has(problemId)) fail("STAGING_FK", `${loc}.problemId`, `problemId 引用未知卡片 ${problemId}。`);
      if (row.finalLayer !== undefined && !LAYERS.includes(String(row.finalLayer) as never)) fail("STAGING_ENUM", `${loc}.finalLayer`, `finalLayer=${JSON.stringify(row.finalLayer)} 无效。`);
      for (const [nodeIndex, nodeValue] of (Array.isArray(row.nodes) ? row.nodes : []).entries()) {
        const node = isRecord(nodeValue) ? nodeValue : {};
        const nodeLoc = `${loc}.nodes[${nodeIndex}]`;
        for (const evidenceId of strArray(node.availableEvidenceIds) ?? []) if (!ids.diagnosticEvidence.has(evidenceId)) fail("STAGING_FK", nodeLoc, `引用未知证据 ${evidenceId}。`);
        for (const checkId of strArray(node.permittedCheckIds) ?? []) if (!ids.diagnosticChecks.has(checkId)) fail("STAGING_FK", nodeLoc, `引用未知检查 ${checkId}。`);
        const expectedCheckId = str(node.expectedCheckId);
        if (expectedCheckId !== undefined && expectedCheckId !== "" && !ids.diagnosticChecks.has(expectedCheckId)) fail("STAGING_FK", nodeLoc, `expectedCheckId 未知：${expectedCheckId}。`);
      }
      for (const causeId of strArray(row.finalRanking) ?? []) if (!ids.diagnosticCauses.has(causeId)) fail("STAGING_FK", `${loc}.finalRanking`, `引用未知原因 ${causeId}。`);
    }
    for (const [index, row] of rows("diagnosticEvidence").entries()) {
      const loc = `diagnosticEvidence[${index}]`;
      const problemId = str(row.problemId);
      if (problemId !== undefined && problemId !== "" && !ids.problemCards.has(problemId)) fail("STAGING_FK", `${loc}.problemId`, `problemId 引用未知卡片 ${problemId}。`);
      const claimId = str(row.evidenceClaimId);
      if (claimId !== undefined && claimId !== "" && !ids.evidenceClaims.has(claimId)) fail("STAGING_FK", `${loc}.evidenceClaimId`, `evidenceClaimId 未知：${claimId}。`);
      if (row.sourceType !== undefined && !["observation", "experiment", "quantification", "statistical", "interpretation"].includes(String(row.sourceType))) fail("STAGING_ENUM", `${loc}.sourceType`, `sourceType=${JSON.stringify(row.sourceType)} 无效。`);
    }
    for (const [index, row] of rows("transferCases").entries()) {
      const loc = `transferCases[${index}]`;
      const problemId = str(row.problemId);
      if (problemId !== undefined && problemId !== "" && !ids.problemCards.has(problemId)) fail("STAGING_FK", `${loc}.problemId`, `problemId 引用未知卡片 ${problemId}。`);
      if (row.mode !== undefined && !MODES.includes(String(row.mode) as never)) fail("STAGING_ENUM", `${loc}.mode`, `mode=${JSON.stringify(row.mode)} 无效。`);
      if (row.contentOrigin !== undefined && !CONTENT_ORIGINS.includes(String(row.contentOrigin) as never)) fail("STAGING_ENUM", `${loc}.contentOrigin`, `contentOrigin=${JSON.stringify(row.contentOrigin)} 无效。`);
      if (row.verificationStatus !== undefined && !CARD_VERIFICATION.includes(String(row.verificationStatus) as never)) fail("STAGING_ENUM", `${loc}.verificationStatus`, `verificationStatus=${JSON.stringify(row.verificationStatus)} 无效。`);
    }
    // Internal collision checks (must be zero after canonicalization)
    const doiOwners = new Map<string, string>();
    const pmidOwners = new Map<string, string>();
    const titleOwners = new Map<string, string>();
    for (const row of rows("sources")) {
      const id = str(row.id) ?? "";
      const doi = str(row.doi);
      const pmid = str(row.pmid);
      const title = str(row.title);
      if (doi) { const key = normalizeDoi(doi); const owner = doiOwners.get(key); if (owner !== undefined && owner !== id) fail("STAGING_DOI_COLLISION", "pack.sources", `DOI ${key} 同时用于 ${owner} 与 ${id}。`); else doiOwners.set(key, id); }
      if (pmid) { const key = normalizePmid(pmid); const owner = pmidOwners.get(key); if (owner !== undefined && owner !== id) fail("STAGING_PMID_COLLISION", "pack.sources", `PMID ${key} 同时用于 ${owner} 与 ${id}。`); else pmidOwners.set(key, id); }
      if (title) { const key = normalizeTitle(title).toLowerCase(); const owner = titleOwners.get(key); if (owner !== undefined && owner !== id) fail("STAGING_TITLE_COLLISION", "pack.sources", `标题 "${key}" 同时用于 ${owner} 与 ${id}。`); else titleOwners.set(key, id); }
    }
  } catch (error) {
    fail("STAGING_INTERNAL_ERROR", "staging", `staging 校验内部异常（已捕获）：${String(error)}`);
  }
  return { valid: failures.length === 0, failures, warnings, rejectedRows };
}

export interface StagingDryRun {
  packId: string;
  stagingId: string;
  structural: StagingStructuralReport;
  scientificCompleteness: unknown;
  registryConflicts: string[];
  internalCollisions: string[];
  importEligible: boolean;
  inserts: number;
  contentHash: string;
}

export function dryRunStagingPack(staging: LegacyStagingPack, registry: unknown): StagingDryRun {
  const structural = validateStagingPack(staging);
  const completeness = evaluateStagingCompleteness(staging);
  const registryConflicts: string[] = [];
  let inserts = 0;
  try {
    const registrySources = isRecord(registry) && Array.isArray(registry.problemAtlasSources) ? registry.problemAtlasSources.filter(isRecord) : [];
    const owners = new Map<string, string>();
    for (const row of registrySources) {
      const id = str(row.id) ?? "";
      const doi = str(row.doi);
      const pmid = str(row.pmid);
      if (doi) { const key = normalizeDoi(doi); if (!owners.has(`doi:${key}`)) owners.set(`doi:${key}`, id); }
      if (pmid) { const key = normalizePmid(pmid); if (!owners.has(`pmid:${key}`)) owners.set(`pmid:${key}`, id); }
    }
    for (const row of staging.sources) {
      const id = row.id;
      const doi = row.doi;
      const pmid = row.pmid;
      if (doi) { const key = normalizeDoi(doi); const owner = owners.get(`doi:${key}`); if (owner !== undefined && owner !== id) registryConflicts.push(`DOI ${doi} 已注册于 ${owner}（staging ${id}）。`); }
      if (pmid) { const key = normalizePmid(pmid); const owner = owners.get(`pmid:${key}`); if (owner !== undefined && owner !== id) registryConflicts.push(`PMID ${pmid} 已注册于 ${owner}（staging ${id}）。`); }
    }
    inserts = staging.problemCards.length + staging.sources.length + staging.evidenceClaims.length;
  } catch (error) {
    registryConflicts.push(`registry 冲突检查内部异常（已捕获）：${String(error)}`);
  }
  const internalCollisions = structural.failures.filter((entry) => entry.code.startsWith("STAGING_DOI_COLLISION") || entry.code.startsWith("STAGING_PMID_COLLISION") || entry.code.startsWith("STAGING_TITLE_COLLISION")).map((entry) => entry.message);
  return {
    packId: staging.sourcePackId,
    stagingId: staging.stagingId,
    structural,
    scientificCompleteness: completeness,
    registryConflicts,
    internalCollisions,
    importEligible: false,
    inserts,
    contentHash: stableHash(staging),
  };
}

function evaluateStagingCompleteness(staging: LegacyStagingPack): unknown {
  return evaluateScientificCompleteness(staging);
}

function stableHash(value: unknown): string {
  const seen = new Set<unknown>();
  const serialize = (item: unknown): string => {
    if (item === null || typeof item !== "object") return JSON.stringify(item);
    if (seen.has(item)) return '"[circular]"';
    seen.add(item);
    try {
      if (Array.isArray(item)) return `[${item.map(serialize).join(",")}]`;
      const record = item as Record<string, unknown>;
      return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${serialize(record[key])}`).join(",")}}`;
    } finally {
      seen.delete(item);
    }
  };
  const text = serialize(value);
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= BigInt(text.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

