import type {
  AtlasCollectionState,
  AuthorityTier,
  ClaimVerificationStatus,
  CompletenessGap,
  KnowledgeStatus,
  ProblemType,
  RegistrySourceType,
  RegistryVerificationStatus,
  ScientificCompletenessReport,
  SourcePackDocument,
  SourcePackImportRecord,
  SupportType,
} from "../domain/problemAtlas.js";
import type { ContentOrigin, VerificationStatus } from "../domain/types.js";
import { PACK_SCHEMA_VERSION } from "../domain/problemAtlas.js";

export const MAX_PACK_BYTES = 2_000_000;
export const MAX_ENTITY_FILES = 40;
export const MAX_ROWS = 5_000;
export const MAX_FIELD_LENGTH = 2_000;

const SOURCE_TYPES: RegistrySourceType[] = ["guideline", "consensus", "standard", "protocol", "original_method", "benchmark", "methods_review", "technical_resource", "institutional_sop", "educational", "discovery"];
const TIERS: AuthorityTier[] = ["S", "A", "B", "C", "D", "X"];
const SOURCE_VERIFICATION: RegistryVerificationStatus[] = ["pending", "metadata_verified", "claim_verified", "rejected"];
const CLAIM_VERIFICATION: ClaimVerificationStatus[] = ["pending", "claim_verified", "rejected"];
const SUPPORT_TYPES: SupportType[] = ["direct", "qualified", "contextual", "contradicts", "insufficient"];
const KNOWLEDGE_STATUSES: KnowledgeStatus[] = ["current", "superseded", "deprecated", "emerging"];
const CONTENT_ORIGINS: ContentOrigin[] = ["verified_seed", "verified_external", "user", "ai_generated", "external_source_pack"];
const CARD_VERIFICATION: VerificationStatus[] = ["verified", "pending", "rejected", "not_required"];
const PROBLEM_TYPES: ProblemType[] = ["diagnostic", "judgment", "audit", "unclassified"];
const MODES = ["quick", "differential", "sequential", "missing-info", "error-localization", "claim-boundary", "reviewer", "ai-verdict"];

export interface ValidationFailure {
  code: string;
  location: string;
  message: string;
}

export interface ValidationCheck { name: string; passed: boolean; detail: string }
export interface SourcePackValidation {
  errors: string[];
  failures: ValidationFailure[];
  warnings: string[];
  rejectedRows: string[];
  checks: ValidationCheck[];
  contentHash: string;
}

export interface SourcePackDryRun {
  inserts: number;
  updates: number;
  conflicts: string[];
  rejectedRows: string[];
  warnings: string[];
  noop: boolean;
  contentHash: string;
  errors: string[];
  failures: ValidationFailure[];
  checks: ValidationCheck[];
  scientificCompleteness: ScientificCompletenessReport;
  importEligible: boolean;
}

export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const asString = (value: unknown): string => (typeof value === "string" ? value : "");
const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const asNumber = (value: unknown): number | undefined => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const asRecordArray = (value: unknown): Array<Record<string, unknown>> => (Array.isArray(value) ? value.filter(isRecord) : []);
const validId = (value: string): boolean => /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);

export function normalizeDoi(value: string): string {
  const trimmed = value.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  return trimmed;
}

export function normalizePmid(value: string): string {
  return value.trim().replace(/^pmid:?\s*/i, "").replace(/\D+/g, "");
}

export function normalizeAliases(value: string[]): string[] {
  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

export function normalizeTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

export function computeContentHash(value: unknown): string {
  const serialized = stableStringify(value);
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= BigInt(serialized.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

export function entityHash(entity: unknown): string {
  return computeContentHash(entity);
}

const collect = <T extends { id: string }>(doc: SourcePackDocument, key: keyof SourcePackDocument): T[] => (doc[key] as unknown as T[]) ?? [];

export const ENTITY_COLLECTIONS = ["sources", "evidenceClaims", "problemCards", "diagnosticCauses", "diagnosticChecks", "diagnosticPaths", "diagnosticEvidence", "transferCases"] as const;

export function validateSourcePackUnknown(value: unknown): SourcePackValidation {
  const errors: string[] = [];
  const failures: ValidationFailure[] = [];
  const warnings: string[] = [];
  const rejectedRows: string[] = [];
  const checks: ValidationCheck[] = [];
  const fail = (code: string, location: string, message: string) => { failures.push({ code, location, message }); errors.push(`${code} ${location}: ${message}`); };
  const check = (name: string, passed: boolean, detail: string) => { checks.push({ name, passed, detail }); if (!passed) errors.push(`${name}: ${detail}`); };
  const warn = (name: string, passed: boolean, detail: string) => { if (!passed) warnings.push(`${name}: ${detail}`); };
  let contentHash = "";
  try {
    contentHash = computeContentHash(value);
    if (!isRecord(value)) {
      fail("PACK_NOT_OBJECT", "pack", "源包必须是 JSON 对象。");
      return { errors, failures, warnings, rejectedRows, checks, contentHash };
    }
    const doc = value;

    check("pack schema version", doc.packSchemaVersion === PACK_SCHEMA_VERSION, `packSchemaVersion=${doc.packSchemaVersion}; expected ${PACK_SCHEMA_VERSION}`);
    check("pack id", /^[a-z0-9][a-z0-9._-]{2,63}$/i.test(asString(doc.packId)), `packId=${JSON.stringify(doc.packId)}`);
    check("pack provenance", asString(doc.provenance).trim().length >= 10, "provenance 太短");
    check("pack created", !Number.isNaN(Date.parse(asString(doc.createdAt))), `createdAt=${doc.createdAt}`);
    check("verification metadata", isRecord(doc.verificationMetadata) && ["pending", "verified", "rejected"].includes(asString(doc.verificationMetadata.reviewStatus)), "verificationMetadata 无效");

    const idsByCollection: Record<(typeof ENTITY_COLLECTIONS)[number], Set<string>> = {
      sources: new Set(), evidenceClaims: new Set(), problemCards: new Set(), diagnosticCauses: new Set(),
      diagnosticChecks: new Set(), diagnosticPaths: new Set(), diagnosticEvidence: new Set(), transferCases: new Set(),
    };
    for (const key of ENTITY_COLLECTIONS) {
      const raw = doc[key];
      if (!Array.isArray(raw)) {
        fail("COLLECTION_NOT_ARRAY", `pack.${key}`, `${key} 必须是数组。`);
        continue;
      }
      if (raw.length > MAX_ROWS) fail("COLLECTION_TOO_LARGE", `pack.${key}`, `${raw.length} rows; limit ${MAX_ROWS}`);
      const seen = new Map<string, number>();
      raw.forEach((item, index) => {
        if (!isRecord(item)) {
          fail("ROW_NOT_OBJECT", `${key}[${index}]`, `${key} 行必须是对象。`);
          rejectedRows.push(`${key}[${index}]:not-object`);
          return;
        }
        const id = item.id;
        if (typeof id !== "string" || !validId(id)) {
          fail("ROW_MISSING_ID", `${key}[${index}].id`, `${key} 行缺少有效 id。`);
          rejectedRows.push(`${key}[${index}]:id-invalid`);
          return;
        }
        seen.set(id, (seen.get(id) ?? 0) + 1);
      });
      idsByCollection[key] = new Set(seen.keys());
      const duplicates = [...seen.entries()].filter(([, count]) => count > 1).map(([id]) => id);
      check(`${key} unique ids`, duplicates.length === 0, duplicates.length ? `重复 id: ${duplicates.join(", ")}` : "unique");
    }

    const sourceIds = idsByCollection.sources;
    const claimIds = idsByCollection.evidenceClaims;
    const cardIds = idsByCollection.problemCards;
    const causeIds = idsByCollection.diagnosticCauses;
    const checkIds = idsByCollection.diagnosticChecks;
    const pathIds = idsByCollection.diagnosticPaths;
    const evidenceIds = idsByCollection.diagnosticEvidence;
    const caseIds = idsByCollection.transferCases;

    const sources = asRecordArray(doc.sources);
    const claims = asRecordArray(doc.evidenceClaims);
    const cards = asRecordArray(doc.problemCards);
    const causes = asRecordArray(doc.diagnosticCauses);
    const checksCol = asRecordArray(doc.diagnosticChecks);
    const paths = asRecordArray(doc.diagnosticPaths);
    const evidence = asRecordArray(doc.diagnosticEvidence);
    const transferCases = asRecordArray(doc.transferCases);

    const dupDoi: string[] = [];
    const doiOwners = new Map<string, string>();
    const dupPmid: string[] = [];
    const pmidOwners = new Map<string, string>();
    for (const [index, row] of sources.entries()) {
      const id = asString(row.id);
      if (!id) continue;
      const doi = asString(row.doi);
      const pmid = asString(row.pmid);
      if (doi) {
        const key = normalizeDoi(doi);
        const existing = doiOwners.get(key);
        if (existing !== undefined && existing !== id) { dupDoi.push(`DOI ${key} 同时用于 ${existing} 与 ${id}`); fail("DOI_DUPLICATE", `pack.sources[${index}].doi`, `DOI ${key} 同时用于 ${existing} 与 ${id}`); }
        else doiOwners.set(key, id);
      }
      if (pmid) {
        const key = normalizePmid(pmid);
        const existing = pmidOwners.get(key);
        if (existing !== undefined && existing !== id) { dupPmid.push(`PMID ${key} 同时用于 ${existing} 与 ${id}`); fail("PMID_DUPLICATE", `pack.sources[${index}].pmid`, `PMID ${key} 同时用于 ${existing} 与 ${id}`); }
        else pmidOwners.set(key, id);
      }
    }
    check("pack DOI unique", dupDoi.length === 0, dupDoi.join("; ") || "unique");
    check("pack PMID unique", dupPmid.length === 0, dupPmid.join("; ") || "unique");

    const normalizedTitles = new Map<string, string>();
    const dupTitles: string[] = [];
    for (const [index, row] of sources.entries()) {
      const id = asString(row.id);
      const key = normalizeTitle(asString(row.title)).toLowerCase();
      if (!key || !id) continue;
      const existing = normalizedTitles.get(key);
      if (existing !== undefined && existing !== id) { dupTitles.push(`${existing} 与 ${id}`); fail("TITLE_DUPLICATE", `pack.sources[${index}].title`, `标题 "${key}" 同时用于 ${existing} 与 ${id}`); }
      else normalizedTitles.set(key, id);
    }
    check("pack source titles unique", dupTitles.length === 0, dupTitles.join("; ") || "unique");

    const checkStr = (loc: string, value: unknown): boolean => {
      if (typeof value !== "string") return false;
      if (value.length > MAX_FIELD_LENGTH) { fail("FIELD_OVERSIZE", loc, `字段超过 ${MAX_FIELD_LENGTH} 字符上限。`); return false; }
      return true;
    };

    for (const [index, row] of sources.entries()) {
      const loc = `sources[${index}]`;
      const id = asString(row.id);
      if (!id) continue;
      const rowErrors: string[] = [];
      const field = (code: string, fieldName: string, passed: boolean, message: string) => {
        if (passed) return;
        rowErrors.push(message);
        fail(code, `${loc}.${fieldName}`, message);
      };
      const tier = asString(row.authorityTier) as AuthorityTier;
      const verificationStatus = asString(row.verificationStatus);
      const origin = asString(row.contentOrigin);
      field("SOURCE_SCHEMA_VERSION", "schemaVersion", row.schemaVersion === 1, `schemaVersion=${JSON.stringify(row.schemaVersion)}`);
      field("SOURCE_TYPE_ENUM", "sourceType", SOURCE_TYPES.includes(asString(row.sourceType) as RegistrySourceType), `sourceType=${JSON.stringify(row.sourceType)}`);
      field("SOURCE_TIER_ENUM", "authorityTier", TIERS.includes(tier), `authorityTier=${JSON.stringify(row.authorityTier)}`);
      field("SOURCE_TITLE_EMPTY", "title", checkStr(`${loc}.title`, row.title) && asString(row.title).trim().length > 0, "title 为空或类型无效。");
      field("SOURCE_AUTHORS", "authors", Array.isArray(row.authors) && row.authors.length > 0 && row.authors.every((item) => typeof item === "string"), "authors 必须是非空字符串数组。");
      {
        const year = asNumber(row.year);
        field("SOURCE_YEAR", "year", year !== undefined && year >= 1500 && year <= 2100, `year=${JSON.stringify(row.year)}`);
      }
      field("SOURCE_KNOWLEDGE_ENUM", "knowledgeStatus", KNOWLEDGE_STATUSES.includes(asString(row.knowledgeStatus) as KnowledgeStatus), `knowledgeStatus=${JSON.stringify(row.knowledgeStatus)}`);
      field("SOURCE_VERIFICATION_ENUM", "verificationStatus", SOURCE_VERIFICATION.includes(verificationStatus as RegistryVerificationStatus), `verificationStatus=${JSON.stringify(row.verificationStatus)}`);
      field("SOURCE_VERIFICATION_SCOPE_TYPE", "verificationScope", Array.isArray(row.verificationScope) && row.verificationScope.every((item) => typeof item === "string"), "verificationScope 必须是字符串数组。");
      field("SOURCE_CONTENT_ORIGIN_ENUM", "contentOrigin", CONTENT_ORIGINS.includes(origin as ContentOrigin), `contentOrigin=${JSON.stringify(row.contentOrigin)}`);
      field("SOURCE_SUPERSEDES_TYPE", "supersedes", Array.isArray(row.supersedes) && row.supersedes.every((item) => typeof item === "string"), "supersedes 必须是字符串数组。");
      field("SOURCE_SUPERSEDED_BY_TYPE", "supersededBy", Array.isArray(row.supersededBy) && row.supersededBy.every((item) => typeof item === "string"), "supersededBy 必须是字符串数组。");
      checkStr(`${loc}.provenanceNote`, row.provenanceNote);
      if (row.doi) field("SOURCE_DOI_FORMAT", "doi", normalizeDoi(asString(row.doi)).startsWith("10."), `doi=${JSON.stringify(row.doi)}`);
      if (row.pmid) field("SOURCE_PMID_FORMAT", "pmid", /^\d{4,9}$/.test(normalizePmid(asString(row.pmid))), `pmid=${JSON.stringify(row.pmid)}`);
      if (verificationStatus === "claim_verified" && (asStringArray(row.verificationScope).includes("claim") === false || !asString(row.verifiedAt) || !asString(row.verifiedBy))) {
        field("SOURCE_CLAIM_VERIFIED_GATE", "verificationStatus", false, "claim_verified 需要 claim 范围、verifiedAt 和 verifiedBy。");
      }
      if (origin === "ai_generated" && verificationStatus === "claim_verified") {
        field("SOURCE_AI_SELF_VERIFY", "contentOrigin", false, "AI 生成内容不能进入 claim_verified。");
      }
      if (["D", "X"].includes(tier) && verificationStatus === "claim_verified") {
        field("SOURCE_TIER_DX_VERIFIED", "authorityTier", false, "Tier D/X 不能支撑已验证主张。");
      }
      if (tier === "X") {
        field("SOURCE_TIER_X_REJECTED", "authorityTier", false, "Tier X 被拒绝。");
        rejectedRows.push(`source ${id}: Tier X 被拒绝`);
      }
      const supersedes = asStringArray(row.supersedes);
      const supersededBy = asStringArray(row.supersededBy);
      if (supersedes.some((target) => !sourceIds.has(target)) || supersededBy.some((target) => !sourceIds.has(target))) {
        warn(`source ${id} supersession`, false, `supersedes/supersededBy 指向未知源 id。`);
      }
      if (rowErrors.length) rejectedRows.push(`source ${id}`);
    }

    for (const [index, row] of claims.entries()) {
      const loc = `evidenceClaims[${index}]`;
      const id = asString(row.id);
      if (!id) continue;
      const rowErrors: string[] = [];
      const field = (code: string, fieldName: string, passed: boolean, message: string) => {
        if (passed) return;
        rowErrors.push(message);
        fail(code, `${loc}.${fieldName}`, message);
      };
      const verificationStatus = asString(row.verificationStatus);
      const origin = asString(row.contentOrigin);
      field("CLAIM_TEXT_TYPE", "claim", checkStr(`${loc}.claim`, row.claim), "claim 必须是字符串。");
      field("CLAIM_SOURCE_FK", "sourceId", sourceIds.has(asString(row.sourceId)), `sourceId=${JSON.stringify(row.sourceId)} 未知。`);
      field("CLAIM_SUPPORT_ENUM", "supportType", SUPPORT_TYPES.includes(asString(row.supportType) as SupportType), `supportType=${JSON.stringify(row.supportType)}`);
      field("CLAIM_SUPPORTING_LOCATION_TYPE", "supportingLocation", checkStr(`${loc}.supportingLocation`, row.supportingLocation), "supportingLocation 必须是字符串。");
      field("CLAIM_SCOPE_TYPE", "scope", checkStr(`${loc}.scope`, row.scope), "scope 必须是字符串。");
      field("CLAIM_QUALIFICATION_TYPE", "qualification", checkStr(`${loc}.qualification`, row.qualification), "qualification 必须是字符串。");
      field("CLAIM_VERIFICATION_ENUM", "verificationStatus", CLAIM_VERIFICATION.includes(verificationStatus as ClaimVerificationStatus), `verificationStatus=${JSON.stringify(row.verificationStatus)}`);
      field("CLAIM_CONTENT_ORIGIN_ENUM", "contentOrigin", CONTENT_ORIGINS.includes(origin as ContentOrigin), `contentOrigin=${JSON.stringify(row.contentOrigin)}`);
      field("CLAIM_KNOWLEDGE_ENUM", "knowledgeStatus", KNOWLEDGE_STATUSES.includes(asString(row.knowledgeStatus) as KnowledgeStatus), `knowledgeStatus=${JSON.stringify(row.knowledgeStatus)}`);
      if (origin === "ai_generated" && verificationStatus === "claim_verified") {
        field("CLAIM_AI_SELF_VERIFY", "contentOrigin", false, "AI 生成内容不能进入 claim_verified。");
      }
      if (verificationStatus === "claim_verified" && (!asString(row.verifiedAt) || !asString(row.verifiedBy))) {
        field("CLAIM_VERIFIED_GATE", "verificationStatus", false, "claim_verified 需要 verifiedAt 与 verifiedBy。");
      }
      const backingSource = sources.find((item) => asString(item.id) === asString(row.sourceId));
      if (verificationStatus === "claim_verified" && backingSource && ["D", "X"].includes(asString(backingSource.authorityTier))) {
        field("CLAIM_TIER_DX_VERIFIED", "sourceId", false, "Tier D/X 来源不能支撑已验证主张。");
      }
      if (rowErrors.length) rejectedRows.push(`evidenceClaim ${id}`);
    }

    for (const [index, row] of cards.entries()) {
      const loc = `problemCards[${index}]`;
      const id = asString(row.id);
      if (!id) continue;
      const rowErrors: string[] = [];
      const field = (code: string, fieldName: string, passed: boolean, message: string) => {
        if (passed) return;
        rowErrors.push(message);
        fail(code, `${loc}.${fieldName}`, message);
      };
      const origin = asString(row.contentOrigin);
      const verificationStatus = asString(row.verificationStatus);
      field("CARD_SCHEMA_VERSION", "schemaVersion", row.schemaVersion === 1, `schemaVersion=${JSON.stringify(row.schemaVersion)}`);
      field("CARD_TITLE_CN", "titleCn", checkStr(`${loc}.titleCn`, row.titleCn) && asString(row.titleCn).trim().length > 0, "titleCn 为空或类型无效。");
      field("CARD_TITLE_EN", "titleEn", checkStr(`${loc}.titleEn`, row.titleEn) && asString(row.titleEn).trim().length > 0, "titleEn 为空或类型无效。");
      field("CARD_TYPE_ENUM", "problemType", PROBLEM_TYPES.includes(asString(row.problemType) as ProblemType), `problemType=${JSON.stringify(row.problemType)}`);
      field("CARD_KNOWLEDGE_ENUM", "knowledgeStatus", KNOWLEDGE_STATUSES.includes(asString(row.knowledgeStatus) as KnowledgeStatus), `knowledgeStatus=${JSON.stringify(row.knowledgeStatus)}`);
      field("CARD_VERIFICATION_ENUM", "verificationStatus", CARD_VERIFICATION.includes(verificationStatus as VerificationStatus), `verificationStatus=${JSON.stringify(row.verificationStatus)}`);
      field("CARD_CONTENT_ORIGIN_ENUM", "contentOrigin", CONTENT_ORIGINS.includes(origin as ContentOrigin), `contentOrigin=${JSON.stringify(row.contentOrigin)}`);
      field("CARD_DIFFICULTY_ENUM", "difficulty", row.difficulty === undefined || ["foundation", "intermediate", "advanced", "frontier"].includes(asString(row.difficulty)), `difficulty=${JSON.stringify(row.difficulty)}`);
      {
        const importance = asNumber(row.importance);
        field("CARD_IMPORTANCE_TYPE", "importance", row.importance === undefined || (importance !== undefined && importance >= 1 && importance <= 5), `importance=${JSON.stringify(row.importance)}`);
      }
      {
        const frequency = asNumber(row.frequency);
        field("CARD_FREQUENCY_TYPE", "frequency", row.frequency === undefined || (frequency !== undefined && frequency >= 1 && frequency <= 5), `frequency=${JSON.stringify(row.frequency)}`);
      }
      for (const listName of ["aliases", "keywords", "candidateCauseIds", "redFlags", "commonWrongActions", "recommendedReasoning", "transferCaseIds", "misconceptionTags", "relatedMethodIds", "relatedProtocolIds", "relatedPatternIds", "evidenceClaimIds", "supersedes", "supersededBy"] as const) {
        const value = row[listName];
        if (value !== undefined && !(Array.isArray(value) && value.every((item) => typeof item === "string"))) {
          field("CARD_FIELD_TYPE", listName, false, `${listName} 必须是字符串数组。`);
        }
      }
      for (const textName of ["observation", "context", "whyItMatters", "claimBoundary", "reviewerImplication", "domain", "subdomain", "diagnosticPathId"] as const) {
        checkStr(`${loc}.${textName}`, row[textName]);
      }
      if (origin === "ai_generated" && verificationStatus === "verified") {
        field("CARD_AI_SELF_VERIFY", "contentOrigin", false, "AI 生成内容不能进入 verified。");
      }
      for (const causeId of asStringArray(row.candidateCauseIds)) {
        if (!causeIds.has(causeId)) field("CARD_CAUSE_FK", "candidateCauseIds", false, `引用未知 ${causeId}。`);
      }
      if (!pathIds.has(asString(row.diagnosticPathId))) field("CARD_PATH_FK", "diagnosticPathId", false, "diagnosticPathId 未知。");
      for (const claimId of asStringArray(row.evidenceClaimIds)) {
        if (!claimIds.has(claimId)) field("CARD_CLAIM_FK", "evidenceClaimIds", false, `引用未知 ${claimId}。`);
      }
      for (const caseId of asStringArray(row.transferCaseIds)) {
        if (!caseIds.has(caseId)) field("CARD_CASE_FK", "transferCaseIds", false, `引用未知 ${caseId}。`);
      }
      if (rowErrors.length) rejectedRows.push(`problemCard ${id}`);
    }

    for (const [index, row] of causes.entries()) {
      const loc = `diagnosticCauses[${index}]`;
      const id = asString(row.id);
      if (!id) continue;
      const rowErrors: string[] = [];
      const field = (code: string, fieldName: string, passed: boolean, message: string) => {
        if (passed) return;
        rowErrors.push(message);
        fail(code, `${loc}.${fieldName}`, message);
      };
      field("CAUSE_PROBLEM_FK", "problemId", cardIds.has(asString(row.problemId)), `problemId=${JSON.stringify(row.problemId)} 未知。`);
      field("CAUSE_LAYER_ENUM", "layer", ["sample", "experiment", "quantification", "statistics", "interpretation"].includes(asString(row.layer)), `layer=${JSON.stringify(row.layer)}`);
      field("CAUSE_INITIAL_RANK_TYPE", "initialRank", asNumber(row.initialRank) !== undefined, `initialRank=${JSON.stringify(row.initialRank)}`);
      for (const claimId of asStringArray(row.evidenceClaimIds)) {
        if (!claimIds.has(claimId)) field("CAUSE_CLAIM_FK", "evidenceClaimIds", false, `引用未知 ${claimId}。`);
      }
      if (rowErrors.length) rejectedRows.push(`diagnosticCause ${id}`);
    }
    for (const [index, row] of checksCol.entries()) {
      const loc = `diagnosticChecks[${index}]`;
      const id = asString(row.id);
      if (!id) continue;
      const rowErrors: string[] = [];
      const field = (code: string, fieldName: string, passed: boolean, message: string) => {
        if (passed) return;
        rowErrors.push(message);
        fail(code, `${loc}.${fieldName}`, message);
      };
      field("CHECK_PROBLEM_FK", "problemId", cardIds.has(asString(row.problemId)), `problemId=${JSON.stringify(row.problemId)} 未知。`);
      field("CHECK_COST_ENUM", "costCategory", ["low", "medium", "high"].includes(asString(row.costCategory)), `costCategory=${JSON.stringify(row.costCategory)}`);
      field("CHECK_AVAILABILITY_ENUM", "availability", ["routine", "specialized", "expert"].includes(asString(row.availability)), `availability=${JSON.stringify(row.availability)}`);
      for (const claimId of asStringArray(row.evidenceClaimIds)) {
        if (!claimIds.has(claimId)) field("CHECK_CLAIM_FK", "evidenceClaimIds", false, `引用未知 ${claimId}。`);
      }
      if (rowErrors.length) rejectedRows.push(`diagnosticCheck ${id}`);
    }
    for (const [index, row] of paths.entries()) {
      const loc = `diagnosticPaths[${index}]`;
      const id = asString(row.id);
      if (!id) continue;
      const rowErrors: string[] = [];
      const field = (code: string, fieldName: string, passed: boolean, message: string) => {
        if (passed) return;
        rowErrors.push(message);
        fail(code, `${loc}.${fieldName}`, message);
      };
      field("PATH_PROBLEM_FK", "problemId", cardIds.has(asString(row.problemId)), `problemId=${JSON.stringify(row.problemId)} 未知。`);
      field("PATH_LAYER_ENUM", "finalLayer", ["sample", "experiment", "quantification", "statistics", "interpretation"].includes(asString(row.finalLayer)), `finalLayer=${JSON.stringify(row.finalLayer)}`);
      for (const [nodeIndex, nodeValue] of (Array.isArray(row.nodes) ? row.nodes : []).entries()) {
        const nodeLoc = `${loc}.nodes[${nodeIndex}]`;
        const node = isRecord(nodeValue) ? nodeValue : {};
        if (!isRecord(nodeValue)) fail("PATH_NODE_TYPE", nodeLoc, "节点必须是对象。");
        for (const evidenceId of asStringArray(node.availableEvidenceIds)) {
          if (!evidenceIds.has(evidenceId)) field("PATH_NODE_EVIDENCE_FK", "nodes", false, `节点 ${asString(node.id)} 引用未知证据 ${evidenceId}。`);
        }
        for (const checkId of asStringArray(node.permittedCheckIds)) {
          if (!checkIds.has(checkId)) field("PATH_NODE_CHECK_FK", "nodes", false, `节点 ${asString(node.id)} 引用未知检查 ${checkId}。`);
        }
        if (!checkIds.has(asString(node.expectedCheckId))) field("PATH_EXPECTED_CHECK_FK", "nodes", false, `节点 ${asString(node.id)} expectedCheckId 未知。`);
      }
      for (const causeId of asStringArray(row.finalRanking)) {
        if (!causeIds.has(causeId)) field("PATH_FINAL_RANKING_FK", "finalRanking", false, `引用未知原因 ${causeId}。`);
      }
      if (rowErrors.length) rejectedRows.push(`diagnosticPath ${id}`);
    }
    for (const [index, row] of evidence.entries()) {
      const loc = `diagnosticEvidence[${index}]`;
      const id = asString(row.id);
      if (!id) continue;
      const rowErrors: string[] = [];
      const field = (code: string, fieldName: string, passed: boolean, message: string) => {
        if (passed) return;
        rowErrors.push(message);
        fail(code, `${loc}.${fieldName}`, message);
      };
      field("EVIDENCE_PROBLEM_FK", "problemId", cardIds.has(asString(row.problemId)), `problemId=${JSON.stringify(row.problemId)} 未知。`);
      field("EVIDENCE_CLAIM_FK", "evidenceClaimId", claimIds.has(asString(row.evidenceClaimId)), `evidenceClaimId=${JSON.stringify(row.evidenceClaimId)} 未知。`);
      if (rowErrors.length) rejectedRows.push(`diagnosticEvidence ${id}`);
    }
    for (const [index, row] of transferCases.entries()) {
      const loc = `transferCases[${index}]`;
      const id = asString(row.id);
      if (!id) continue;
      const rowErrors: string[] = [];
      const field = (code: string, fieldName: string, passed: boolean, message: string) => {
        if (passed) return;
        rowErrors.push(message);
        fail(code, `${loc}.${fieldName}`, message);
      };
      const origin = asString(row.contentOrigin);
      const verificationStatus = asString(row.verificationStatus);
      field("CASE_PROBLEM_FK", "problemId", cardIds.has(asString(row.problemId)), `problemId=${JSON.stringify(row.problemId)} 未知。`);
      field("CASE_MODE_ENUM", "mode", MODES.includes(asString(row.mode)), `mode=${JSON.stringify(row.mode)}`);
      field("CASE_RUBRIC", "rubric", Array.isArray(row.rubric) && row.rubric.length > 0 && row.rubric.every((item) => typeof item === "string"), "rubric 必须是非空字符串数组。");
      field("CASE_CONTENT_ORIGIN_ENUM", "contentOrigin", CONTENT_ORIGINS.includes(origin as ContentOrigin), `contentOrigin=${JSON.stringify(row.contentOrigin)}`);
      if (origin === "ai_generated" && verificationStatus === "verified") {
        field("CASE_AI_SELF_VERIFY", "contentOrigin", false, "AI 生成内容不能进入 verified。");
      }
      if (rowErrors.length) rejectedRows.push(`transferCase ${id}`);
    }

    const graph = new Map<string, string[]>();
    for (const row of sources) {
      const supersedes = asStringArray(row.supersedes);
      if (supersedes.length) graph.set(asString(row.id), supersedes);
    }
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const cycle = (node: string): boolean => {
      if (visiting.has(node)) return true;
      if (visited.has(node)) return false;
      visiting.add(node);
      for (const next of graph.get(node) ?? []) if (cycle(next)) { visiting.delete(node); return true; }
      visiting.delete(node);
      visited.add(node);
      return false;
    };
    const cycles = [...graph.keys()].filter((node) => cycle(node));
    check("no supersession cycles", cycles.length === 0, cycles.length ? `版本环: ${cycles.join(", ")}` : "acyclic");

    const claimHashes = new Map<string, string>();
    const dupClaimHashes: string[] = [];
    for (const row of claims) {
      const id = asString(row.id);
      if (!id) continue;
      const hash = computeContentHash({ claim: normalizeTitle(asString(row.claim)), sourceId: asString(row.sourceId) });
      const existing = claimHashes.get(hash);
      if (existing !== undefined && existing !== id) dupClaimHashes.push(`${existing} 与 ${id}`);
      claimHashes.set(hash, id);
    }
    check("claim hashes unique", dupClaimHashes.length === 0, dupClaimHashes.join("; ") || "unique");

    const packVerification = isRecord(doc.verificationMetadata) ? doc.verificationMetadata : {};
    const gateVerified = packVerification.reviewStatus === "verified" && Boolean(packVerification.reviewer) && Boolean(packVerification.reviewedAt);
    const forbiddenSelfVerification = [...sources, ...claims, ...cards, ...transferCases].filter(
      (row) => asString(row.contentOrigin) === "ai_generated" && (asString(row.verificationStatus) === "verified" || asString(row.verificationStatus) === "claim_verified"),
    ).map((row) => asString(row.id));
    check("no AI self-verification", forbiddenSelfVerification.length === 0, forbiddenSelfVerification.length ? forbiddenSelfVerification.join(", ") : "clean");
    const importedVerified = claims.filter((row) => asString(row.verificationStatus) === "claim_verified");
    if (importedVerified.length && !gateVerified) {
      fail("VERIFIED_CLAIM_GATE_MISSING", "pack.verificationMetadata", `${importedVerified.map((row) => asString(row.id)).join(", ")} 为 claim_verified，但 pack 缺少正式 gate（reviewer/reviewedAt/verified 状态）。`);
    }
    check("verified-claim gate", importedVerified.length === 0 || gateVerified, `${importedVerified.length} verified claims; gate=${gateVerified ? "passed" : "missing"}`);
  } catch (error) {
    fail("INTERNAL_ERROR", "validator", `内部校验异常（已捕获，返回结构化失败）：${String(error)}`);
  }
  return { errors, failures, warnings, rejectedRows, checks, contentHash };
}

export function validateSourcePack(doc: SourcePackDocument): SourcePackValidation {
  return validateSourcePackUnknown(doc);
}

export function evaluateScientificCompleteness(value: unknown): ScientificCompletenessReport {
  const report: ScientificCompletenessReport = {
    status: "scientific_patch_required",
    importEligible: false,
    counts: {
      problemCards: { total: 0, complete: 0, patchRequired: 0, unclassified: 0 },
      evidenceClaims: { total: 0, complete: 0, patchRequired: 0 },
      evidenceSources: { total: 0, complete: 0, patchRequired: 0 },
    },
    byType: {
      diagnostic: { complete: 0, patchRequired: 0 },
      judgment: { complete: 0, patchRequired: 0 },
      audit: { complete: 0, patchRequired: 0 },
      unclassified: { complete: 0, patchRequired: 0 },
    },
    gaps: [],
  };
  const gap = (entity: CompletenessGap["entity"], rowId: string, code: string, location: string, detail: string) => {
    report.gaps.push({ entity, rowId, code, location, detail });
  };
  try {
    const doc = isRecord(value) ? value : {};
    const sources = asRecordArray(doc.sources);
    const claims = asRecordArray(doc.evidenceClaims);
    const cards = asRecordArray(doc.problemCards);
    const checks = asRecordArray(doc.diagnosticChecks);

    for (const [index, row] of sources.entries()) {
      const id = asString(row.id);
      const loc = `sources[${index}]`;
      const problems: string[] = [];
      if (asString(row.provenanceNote).trim().length < 8) {
        problems.push("SOURCE_MISSING_PROVENANCE");
        gap("evidenceSource", id, "SOURCE_MISSING_PROVENANCE", `${loc}.provenanceNote`, "来源缺少 provenanceNote（来源出处说明）。");
      }
      if (asStringArray(row.verificationScope).length === 0) {
        problems.push("SOURCE_MISSING_VERIFICATION_SCOPE");
        gap("evidenceSource", id, "SOURCE_MISSING_VERIFICATION_SCOPE", `${loc}.verificationScope`, "来源缺少 verificationScope。");
      }
      report.counts.evidenceSources.total += 1;
      if (problems.length) report.counts.evidenceSources.patchRequired += 1;
      else report.counts.evidenceSources.complete += 1;
    }

    for (const [index, row] of claims.entries()) {
      const id = asString(row.id);
      const loc = `evidenceClaims[${index}]`;
      const problems: string[] = [];
      if (asString(row.claim).trim().length < 12) {
        problems.push("CLAIM_MISSING_TEXT");
        gap("evidenceClaim", id, "CLAIM_MISSING_TEXT", `${loc}.claim`, "主张文本缺失或过短（<12 字符）。");
      }
      if (asString(row.scope).trim().length === 0) {
        problems.push("CLAIM_MISSING_SCOPE");
        gap("evidenceClaim", id, "CLAIM_MISSING_SCOPE", `${loc}.scope`, "主张缺少 scope（适用范围）。");
      }
      if (asString(row.qualification).trim().length === 0) {
        problems.push("CLAIM_MISSING_QUALIFICATION");
        gap("evidenceClaim", id, "CLAIM_MISSING_QUALIFICATION", `${loc}.qualification`, "主张缺少 qualification（限定条件）。");
      }
      if (asString(row.supportingLocation).trim().length === 0) {
        problems.push("CLAIM_MISSING_LOCATION");
        gap("evidenceClaim", id, "CLAIM_MISSING_LOCATION", `${loc}.supportingLocation`, "主张缺少 supportingLocation（出处定位）。");
      }
      if (asString(row.reviewerNote).trim().length === 0) {
        problems.push("CLAIM_MISSING_REVIEWER_NOTE");
        gap("evidenceClaim", id, "CLAIM_MISSING_REVIEWER_NOTE", `${loc}.reviewerNote`, "主张缺少 reviewerNote（核验注记）。");
      }
      report.counts.evidenceClaims.total += 1;
      if (problems.length) report.counts.evidenceClaims.patchRequired += 1;
      else report.counts.evidenceClaims.complete += 1;
    }

    for (const [index, row] of cards.entries()) {
      const id = asString(row.id);
      const loc = `problemCards[${index}]`;
      const declaredType = asString(row.problemType);
      const type: ProblemType = (PROBLEM_TYPES as string[]).includes(declaredType) ? declaredType as ProblemType : "unclassified";
      const problems: string[] = [];
      if (type === "unclassified") {
        problems.push("CARD_UNCLASSIFIED");
        gap("problemCard", id, "CARD_UNCLASSIFIED", `${loc}.problemType`, `未分类卡片（problemType=${JSON.stringify(row.problemType)}）：必须由正式评审声明类型，转换器与校验器不得推断。`);
      } else {
        if (asString(row.observation).trim().length < 12) {
          problems.push("CARD_MISSING_OBSERVATION");
          gap("problemCard", id, "CARD_MISSING_OBSERVATION", `${loc}.observation`, `${type} 卡片缺少 observation（观察/情景）。`);
        }
        if (asStringArray(row.recommendedReasoning).length === 0) {
          problems.push("CARD_MISSING_RECOMMENDED_REASONING");
          gap("problemCard", id, "CARD_MISSING_RECOMMENDED_REASONING", `${loc}.recommendedReasoning`, `${type} 卡片缺少 recommendedReasoning（推荐推理/修复策略）。`);
        }
        if (asString(row.claimBoundary).trim().length === 0) {
          problems.push("CARD_MISSING_CLAIM_BOUNDARY");
          gap("problemCard", id, "CARD_MISSING_CLAIM_BOUNDARY", `${loc}.claimBoundary`, `${type} 卡片缺少 claimBoundary（结论边界）。`);
        }
        if (asStringArray(row.evidenceClaimIds).length === 0) {
          problems.push("CARD_MISSING_EVIDENCE_CLAIMS");
          gap("problemCard", id, "CARD_MISSING_EVIDENCE_CLAIMS", `${loc}.evidenceClaimIds`, `${type} 卡片缺少 evidenceClaimIds（证据主张链接）。`);
        }
        if (type === "diagnostic") {
          const causeCount = asStringArray(row.candidateCauseIds).length;
          if (causeCount < 2) {
            problems.push("DIAGNOSTIC_MISSING_DIFFERENTIAL");
            gap("problemCard", id, "DIAGNOSTIC_MISSING_DIFFERENTIAL", `${loc}.candidateCauseIds`, `diagnostic 卡片需要至少两个有据可查的候选解释（当前 ${causeCount}）；优先三个有用解释，允许两个，不得为凑数编造。`);
          }
          const hasDiscriminatingCheck = checks.some((check) => asString(check.problemId) === id && asStringArray(check.discriminatesCauseIds).length > 0);
          if (!hasDiscriminatingCheck) {
            problems.push("DIAGNOSTIC_MISSING_DISCRIMINATING_CHECKS");
            gap("problemCard", id, "DIAGNOSTIC_MISSING_DISCRIMINATING_CHECKS", `${loc}.diagnosticPathId`, "diagnostic 卡片缺少区分性检查（至少一条 diagnosticCheck 指向该卡片并声明区分的原因）。");
          }
          if (asStringArray(row.commonWrongActions).length === 0) {
            problems.push("DIAGNOSTIC_MISSING_WRONG_ACTIONS");
            gap("problemCard", id, "DIAGNOSTIC_MISSING_WRONG_ACTIONS", `${loc}.commonWrongActions`, "diagnostic 卡片缺少 commonWrongActions（常见错误操作）。");
          }
        }
        if (type === "judgment") {
          if (asString(row.reviewerImplication).trim().length === 0) {
            problems.push("JUDGMENT_MISSING_REVIEWER_IMPLICATION");
            gap("problemCard", id, "JUDGMENT_MISSING_REVIEWER_IMPLICATION", `${loc}.reviewerImplication`, "judgment 卡片缺少 reviewerImplication（相称的审稿影响）。");
          }
          if (asStringArray(row.transferCaseIds).length === 0) {
            problems.push("JUDGMENT_MISSING_FAR_TRANSFER");
            gap("problemCard", id, "JUDGMENT_MISSING_FAR_TRANSFER", `${loc}.transferCaseIds`, "judgment 卡片缺少 far-transfer 案例（transferCaseIds）。");
          }
        }
        if (type === "audit" && asString(row.reviewerImplication).trim().length === 0) {
          problems.push("AUDIT_MISSING_REVIEWER_IMPLICATION");
          gap("problemCard", id, "AUDIT_MISSING_REVIEWER_IMPLICATION", `${loc}.reviewerImplication`, "audit 卡片缺少 reviewerImplication（严重性/类别判断）。");
        }
      }
      if (!KNOWLEDGE_STATUSES.includes(asString(row.knowledgeStatus) as KnowledgeStatus)) {
        problems.push("CARD_MISSING_KNOWLEDGE_STATUS");
        gap("problemCard", id, "CARD_MISSING_KNOWLEDGE_STATUS", `${loc}.knowledgeStatus`, "卡片缺少 knowledgeStatus（知识版本状态）。");
      }
      report.counts.problemCards.total += 1;
      if (type === "unclassified") report.counts.problemCards.unclassified += 1;
      if (problems.length) {
        report.counts.problemCards.patchRequired += 1;
        report.byType[type].patchRequired += 1;
      } else {
        report.counts.problemCards.complete += 1;
        report.byType[type].complete += 1;
      }
    }

    const patchRequired = report.counts.problemCards.patchRequired + report.counts.evidenceClaims.patchRequired + report.counts.evidenceSources.patchRequired;
    report.status = patchRequired === 0 ? "scientifically_complete" : "scientific_patch_required";
    report.importEligible = report.status === "scientifically_complete";
  } catch (error) {
    report.status = "scientific_patch_required";
    report.importEligible = false;
    report.gaps.push({ entity: "problemCard", rowId: "", code: "COMPLETENESS_INTERNAL_ERROR", location: "completeness", detail: `完整性评估内部异常（已捕获）：${String(error)}` });
  }
  return report;
}

export function dryRunSourcePack(doc: SourcePackDocument, state: AtlasCollectionState): SourcePackDryRun {
  let validation: SourcePackValidation;
  let completeness: ScientificCompletenessReport;
  try {
    validation = validateSourcePackUnknown(doc);
    completeness = evaluateScientificCompleteness(doc);
  } catch (error) {
    validation = { errors: ["INTERNAL_ERROR dryRun: 内部异常（已捕获）：" + String(error)], failures: [{ code: "INTERNAL_ERROR", location: "dryRun", message: `内部异常（已捕获）：${String(error)}` }], warnings: [], rejectedRows: [], checks: [], contentHash: "" };
    completeness = evaluateScientificCompleteness(undefined);
  }
  const conflicts: string[] = [];
  const rejectedRows = [...validation.rejectedRows];
  let inserts = 0;
  let updates = 0;
  const warnings = [...validation.warnings];
  const base = (extra: Partial<SourcePackDryRun>): SourcePackDryRun => ({
    inserts: 0, updates: 0, conflicts, rejectedRows, warnings, noop: false, contentHash: validation.contentHash,
    errors: validation.errors, failures: validation.failures, checks: validation.checks,
    scientificCompleteness: completeness, importEligible: false, ...extra,
  });
  if (validation.errors.length) return base({});

  let existingImport = false;
  try {
    existingImport = Array.isArray(state?.sourcePackImports)
      ? state.sourcePackImports.some((record) => record && record.packId === doc.packId && record.contentHash === validation.contentHash)
      : false;
  } catch { existingImport = false; }
  if (existingImport) {
    return base({ noop: true, importEligible: completeness.status === "scientifically_complete" });
  }

  const collections = [
    "problemAtlasSources", "problemAtlasClaims", "problemCards", "diagnosticCauses",
    "diagnosticChecks", "diagnosticPaths", "diagnosticEvidence", "problemTrainingCases",
  ] as const;
  const docKey: Record<(typeof collections)[number], keyof SourcePackDocument> = {
    problemAtlasSources: "sources",
    problemAtlasClaims: "evidenceClaims",
    problemCards: "problemCards",
    diagnosticCauses: "diagnosticCauses",
    diagnosticChecks: "diagnosticChecks",
    diagnosticPaths: "diagnosticPaths",
    diagnosticEvidence: "diagnosticEvidence",
    problemTrainingCases: "transferCases",
  };
  const stateRows = (isRecord(state) ? state : {}) as Record<string, unknown>;
  const existingById = new Map<string, { hash: string }>();
  try {
    for (const key of collections) {
      for (const row of asRecordArray(stateRows[key])) {
        const id = asString(row.id);
        if (id) existingById.set(`${key}:${id}`, { hash: entityHash(row) });
      }
    }
  } catch { /* state hash failures are non-blocking */ }
  for (const key of collections) {
    const rows = asRecordArray(doc[docKey[key]]);
    for (const row of rows) {
      const id = asString(row.id);
      if (!id) continue;
      if (rejectedRows.some((entry) => entry.endsWith(` ${id}`) || entry === `source ${id}`)) continue;
      const existing = existingById.get(`${key}:${id}`);
      if (!existing) { inserts += 1; continue; }
      if (existing.hash === entityHash(row)) continue;
      updates += 1;
      warnings.push(`${String(key)} ${id} 已存在且内容不同；需要显式更新确认。`);
    }
  }

  const registrySources = [
    ...(isRecord(state) && Array.isArray(state.problemAtlasSources) ? state.problemAtlasSources : []),
    ...sourcesSafe(doc),
  ];
  const doiOwners = new Map<string, string>();
  const pmidOwners = new Map<string, string>();
  for (const row of registrySources) {
    const id = asString(row.id);
    const doi = asString(row.doi);
    const pmid = asString(row.pmid);
    if (doi) {
      const key = normalizeDoi(doi);
      const owner = doiOwners.get(key);
      if (owner !== undefined && owner !== id) conflicts.push(`DOI ${doi} 同时用于 ${owner} 与 ${id}`);
      doiOwners.set(key, id);
    }
    if (pmid) {
      const key = normalizePmid(pmid);
      const owner = pmidOwners.get(key);
      if (owner !== undefined && owner !== id) conflicts.push(`PMID ${pmid} 同时用于 ${owner} 与 ${id}`);
      pmidOwners.set(key, id);
    }
  }
  const uniqueConflicts = [...new Set(conflicts)];
  const importEligible = rejectedRows.length === 0 && uniqueConflicts.length === 0 && completeness.status === "scientifically_complete";
  return base({ inserts, updates, conflicts: uniqueConflicts, noop: false, importEligible });
}

const sourcesSafe = (doc: SourcePackDocument): Array<Record<string, unknown>> => (isRecord(doc) && Array.isArray(doc.sources) ? (doc.sources as unknown[]).filter(isRecord) : []);

export interface ApplyImportResult {
  collections: Pick<AtlasCollectionState, "problemAtlasSources" | "problemAtlasClaims" | "problemCards" | "diagnosticCauses" | "diagnosticChecks" | "diagnosticPaths" | "diagnosticEvidence" | "problemTrainingCases">;
  importRecord: SourcePackImportRecord;
  dryRun: SourcePackDryRun;
}

export function applySourcePackImport(state: AtlasCollectionState, doc: SourcePackDocument, options: { allowUpdates: boolean }): ApplyImportResult {
  const dryRun = dryRunSourcePack(doc, state);
  if (!dryRun.importEligible) {
    const reason = dryRun.errors.length
      ? `结构校验失败（${dryRun.errors.length} 项错误）`
      : dryRun.conflicts.length
        ? `存在冲突（${dryRun.conflicts.length} 项）`
        : dryRun.rejectedRows.length
          ? `存在被拒绝行（${dryRun.rejectedRows.length} 行）`
          : "科学完整性未通过（scientific_patch_required 或未分类卡片）";
    throw new SourcePackImportError(`源包未通过导入门禁（${reason}），未写入任何数据。`, dryRun);
  }
  const rejected = new Set(dryRun.rejectedRows.map((entry) => entry.split(" ").slice(-1)[0] ?? ""));
  const conflicts = new Set(
    dryRun.conflicts.flatMap((entry) => {
      const match = entry.match(/与\s+([A-Za-z0-9][A-Za-z0-9._-]*)\s*$/);
      return match ? [match[1]] : [];
    }),
  );

  const next = {
    problemAtlasSources: state.problemAtlasSources,
    problemAtlasClaims: state.problemAtlasClaims,
    problemCards: state.problemCards,
    diagnosticCauses: state.diagnosticCauses,
    diagnosticChecks: state.diagnosticChecks,
    diagnosticPaths: state.diagnosticPaths,
    diagnosticEvidence: state.diagnosticEvidence,
    problemTrainingCases: state.problemTrainingCases,
  };
  const docMap: Array<[keyof typeof next, keyof SourcePackDocument]> = [
    ["problemAtlasSources", "sources"],
    ["problemAtlasClaims", "evidenceClaims"],
    ["problemCards", "problemCards"],
    ["diagnosticCauses", "diagnosticCauses"],
    ["diagnosticChecks", "diagnosticChecks"],
    ["diagnosticPaths", "diagnosticPaths"],
    ["diagnosticEvidence", "diagnosticEvidence"],
    ["problemTrainingCases", "transferCases"],
  ];
  for (const [stateKey, docKey] of docMap) {
    const incoming = (doc[docKey] as Array<{ id: string }>) ?? [];
    const existing = next[stateKey] as Array<{ id: string }>;
    const existingById = new Map(existing.map((row) => [row.id, row]));
    let rows = existing;
    for (const row of incoming) {
      if (rejected.has(row.id) || conflicts.has(row.id)) continue;
      const present = existingById.get(row.id);
      if (!present) {
        rows = [...rows, row as never];
        existingById.set(row.id, row);
      } else if (entityHash(present) !== entityHash(row)) {
        if (!options.allowUpdates) continue;
        rows = rows.map((item) => (item.id === row.id ? (row as never) : item));
      }
    }
    next[stateKey] = rows as never;
  }

  const importRecord: SourcePackImportRecord = {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    packId: doc.packId,
    title: doc.title,
    contentHash: dryRun.contentHash,
    importedAt: new Date().toISOString(),
    result: dryRun.noop ? "noop" : "applied",
    dryRun: { inserts: dryRun.inserts, updates: dryRun.updates, conflicts: dryRun.conflicts.length, rejectedRows: dryRun.rejectedRows.length, warnings: dryRun.warnings.length },
    note: dryRun.noop ? "与已导入包内容一致，无需变更。" : undefined,
  };
  return { collections: next, importRecord, dryRun };
}

export class SourcePackImportError extends Error {
  dryRun: SourcePackDryRun;
  constructor(message: string, dryRun: SourcePackDryRun) {
    super(message);
    this.dryRun = dryRun;
  }
}

export class SourcePackParseError extends Error {
  code: string;
  location: string;
  constructor(code: string, location: string, message: string) {
    super(`${code} ${location}: ${message}`);
    this.name = "SourcePackParseError";
    this.code = code;
    this.location = location;
  }
}

export function parseSourcePackJson(text: string): SourcePackDocument {
  if (text.length > MAX_PACK_BYTES) throw new Error(`JSON 源包超过大小上限（${MAX_PACK_BYTES} 字节）。`);
  const value = JSON.parse(text) as SourcePackDocument;
  if (!isRecord(value)) throw new Error("源包 JSON 必须是对象。");
  return value as unknown as SourcePackDocument;
}

export interface SafeParseResult {
  ok: boolean;
  doc?: SourcePackDocument;
  failure?: { code: string; location: string; message: string };
}

export function parseSourcePackJsonSafe(text: unknown): SafeParseResult {
  try {
    if (typeof text !== "string") return { ok: false, failure: { code: "PARSE_NOT_STRING", location: "input", message: "输入必须是字符串。" } };
    if (text.length > MAX_PACK_BYTES) return { ok: false, failure: { code: "PARSE_OVERSIZE", location: "input", message: `JSON 源包超过大小上限（${MAX_PACK_BYTES} 字节）。` } };
    const value = JSON.parse(text) as unknown;
    if (!isRecord(value)) return { ok: false, failure: { code: "PARSE_NOT_OBJECT", location: "pack", message: "源包 JSON 必须是对象。" } };
    return { ok: true, doc: value as unknown as SourcePackDocument };
  } catch (error) {
    return { ok: false, failure: { code: "PARSE_INVALID_JSON", location: "input", message: `JSON 解析失败：${String(error)}` } };
  }
}

export function parseCsvLine(line: string, lineIndex = 0): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') { current += '"'; index += 1; }
        else quoted = false;
      } else current += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { cells.push(current); current = ""; }
    else current += char;
  }
  cells.push(current);
  cells.forEach((cell, cellIndex) => {
    if (cell.length > MAX_FIELD_LENGTH) {
      throw new SourcePackParseError("CSV_FIELD_OVERSIZE", `csv line ${lineIndex + 1} field ${cellIndex + 1}`, `字段长度 ${cell.length} 超过上限 ${MAX_FIELD_LENGTH}；该行/文件被拒绝，不截断。`);
    }
  });
  return cells;
}

export function parseCsv(text: string): string[][] {
  if (text.length > MAX_PACK_BYTES) throw new Error("CSV 文件超过大小上限。");
  const lines = text.replace(/^\uFEFF/, "").split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0);
  if (lines.length > MAX_ROWS + 1) throw new Error(`CSV 行数超过上限（${MAX_ROWS}）。`);
  return lines.map((line, index) => parseCsvLine(line, index));
}

export function csvToRecords(rows: string[][]): Array<Record<string, string>> {
  const [header, ...body] = rows;
  if (!header) return [];
  return body.map((row) => {
    const record: Record<string, string> = {};
    header.forEach((key, index) => { record[key.trim()] = (row[index] ?? "").trim(); });
    return record;
  });
}

export function parseMarkdownFrontmatter(text: string): { fields: Record<string, string>; body: string } {
  if (text.length > MAX_PACK_BYTES) throw new Error("Markdown 文件超过大小上限。");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { fields: {}, body: text };
  const body = match[2];
  if (body.length > MAX_FIELD_LENGTH * 40) {
    throw new SourcePackParseError("MARKDOWN_BODY_OVERSIZE", "markdown body", `正文长度 ${body.length} 超过上限 ${MAX_FIELD_LENGTH * 40}；该文件被拒绝，不截断。`);
  }
  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!pair) continue;
    fields[pair[1]] = pair[2].trim().replace(/^["']|["']$/g, "");
  }
  return { fields, body };
}

const CSV_ENTITY_FILES: Record<string, keyof SourcePackDocument> = {
  "sources.csv": "sources",
  "evidence_claims.csv": "evidenceClaims",
  "problem_cards.csv": "problemCards",
  "diagnostic_causes.csv": "diagnosticCauses",
  "diagnostic_checks.csv": "diagnosticChecks",
  "diagnostic_paths.csv": "diagnosticPaths",
  "diagnostic_evidence.csv": "diagnosticEvidence",
  "transfer_cases.csv": "transferCases",
};

function listField(value: string): string[] {
  return value.split(";").map((item) => item.trim()).filter(Boolean);
}

export function parseSourcePackCsv(files: Record<string, string>, packHeader: Record<string, string>): SourcePackDocument {
  const names = Object.keys(files);
  if (names.length > MAX_ENTITY_FILES) throw new Error("文件数量超过上限。");
  const doc: SourcePackDocument = {
    packSchemaVersion: Number(packHeader.packSchemaVersion ?? PACK_SCHEMA_VERSION),
    packId: packHeader.packId ?? "",
    title: packHeader.title ?? "",
    createdAt: packHeader.createdAt ?? "",
    createdBy: packHeader.createdBy ?? "",
    provenance: packHeader.provenance ?? "",
    sources: [],
    evidenceClaims: [],
    problemCards: [],
    diagnosticCauses: [],
    diagnosticChecks: [],
    diagnosticPaths: [],
    diagnosticEvidence: [],
    transferCases: [],
    verificationMetadata: { reviewStatus: "pending", reviewer: null, reviewedAt: null },
  };
  for (const [fileName, docKey] of Object.entries(CSV_ENTITY_FILES)) {
    if (!(fileName in files)) continue;
    const records = csvToRecords(parseCsv(files[fileName]));
    (doc as unknown as Record<string, unknown[]>)[docKey] = records.map((record) => recordToEntity(docKey, record));
  }
  return doc;
}

function recordToEntity(docKey: keyof SourcePackDocument, record: Record<string, string>): unknown {
  switch (docKey) {
    case "sources":
      return {
        id: record.id, schemaVersion: Number(record.schemaVersion ?? 1), sourceType: record.sourceType,
        organization: record.organization || undefined, journal: record.journal || undefined,
        title: record.title ?? "",
        authors: listField(record.authors ?? ""), year: Number(record.year ?? 0),
        doi: record.doi || undefined, pmid: record.pmid || undefined, url: record.url || undefined,
        authorityTier: record.authorityTier, domain: listField(record.domain ?? ""), version: record.version || undefined,
        knowledgeStatus: record.knowledgeStatus, supersedes: listField(record.supersedes ?? ""), supersededBy: listField(record.supersededBy ?? ""),
        verificationStatus: record.verificationStatus, verificationScope: listField(record.verificationScope ?? ""),
        verifiedAt: record.verifiedAt || undefined, verifiedBy: record.verifiedBy || undefined,
        contentHash: record.contentHash || undefined, retrievedAt: record.retrievedAt || undefined,
        licenseNote: record.licenseNote || undefined, provenanceNote: record.provenanceNote ?? "",
        contentOrigin: record.contentOrigin,
      };
    case "evidenceClaims":
      return {
        id: record.id, claim: record.claim ?? "", scope: record.scope ?? "", qualification: record.qualification ?? "",
        sourceId: record.sourceId ?? "", supportType: record.supportType, supportingLocation: record.supportingLocation ?? "",
        supportingExcerptHash: record.supportingExcerptHash || undefined, reviewerNote: record.reviewerNote ?? "",
        domain: listField(record.domain ?? ""), knowledgeStatus: record.knowledgeStatus,
        verificationStatus: record.verificationStatus, verifiedAt: record.verifiedAt || undefined, verifiedBy: record.verifiedBy || undefined,
        contentOrigin: record.contentOrigin,
      };
    case "problemCards":
      return {
        id: record.id, schemaVersion: Number(record.schemaVersion ?? 1), domain: record.domain ?? "", subdomain: record.subdomain ?? "",
        titleCn: record.titleCn ?? "", titleEn: record.titleEn ?? "", aliases: listField(record.aliases ?? ""), keywords: listField(record.keywords ?? ""),
        difficulty: record.difficulty, importance: Number(record.importance ?? 3), frequency: Number(record.frequency ?? 3),
        observation: record.observation ?? "", context: record.context ?? "", whyItMatters: record.whyItMatters ?? "",
        candidateCauseIds: listField(record.candidateCauseIds ?? ""), diagnosticPathId: record.diagnosticPathId ?? "",
        redFlags: listField(record.redFlags ?? ""), commonWrongActions: listField(record.commonWrongActions ?? ""),
        recommendedReasoning: listField(record.recommendedReasoning ?? ""),
        statisticalImplication: record.statisticalImplication || undefined, experimentalImplication: record.experimentalImplication || undefined,
        bioinformaticsImplication: record.bioinformaticsImplication || undefined,
        claimBoundary: record.claimBoundary ?? "", reviewerImplication: record.reviewerImplication ?? "",
        transferCaseIds: listField(record.transferCaseIds ?? ""), misconceptionTags: listField(record.misconceptionTags ?? ""),
        relatedMethodIds: listField(record.relatedMethodIds ?? ""), relatedProtocolIds: listField(record.relatedProtocolIds ?? ""),
        relatedPatternIds: listField(record.relatedPatternIds ?? ""), evidenceClaimIds: listField(record.evidenceClaimIds ?? ""),
        contentOrigin: record.contentOrigin, verificationStatus: record.verificationStatus, verifiedAt: record.verifiedAt || undefined,
        knowledgeStatus: record.knowledgeStatus, supersedes: listField(record.supersedes ?? ""), supersededBy: listField(record.supersededBy ?? ""),
      };
    case "diagnosticCauses":
      return {
        id: record.id, problemId: record.problemId ?? "", labelCn: record.labelCn ?? "", labelEn: record.labelEn ?? "",
        mechanism: record.mechanism ?? "", initialRank: Number(record.initialRank ?? 1), layer: record.layer,
        supportingEvidenceIds: listField(record.supportingEvidenceIds ?? ""), contradictingEvidenceIds: listField(record.contradictingEvidenceIds ?? ""),
        uncertaintyNote: record.uncertaintyNote ?? "", evidenceClaimIds: listField(record.evidenceClaimIds ?? ""),
      };
    case "diagnosticChecks":
      return {
        id: record.id, problemId: record.problemId ?? "", questionCn: record.questionCn ?? "",
        informationSupplied: record.informationSupplied ?? "", discriminatesCauseIds: listField(record.discriminatesCauseIds ?? ""),
        expectedUpdate: record.expectedUpdate ?? "", costCategory: record.costCategory, availability: record.availability,
        prerequisites: listField(record.prerequisites ?? ""), evidenceClaimIds: listField(record.evidenceClaimIds ?? ""),
      };
    case "diagnosticPaths":
      return {
        id: record.id, problemId: record.problemId ?? "",
        nodes: (record.nodes ?? "").split("|").map((chunk) => {
          const parts = chunk.split("::");
          return {
            id: parts[0], step: Number(parts[1] ?? 0), question: parts[2] ?? "",
            availableEvidenceIds: listField(parts[3] ?? ""), requiredJudgment: parts[4] ?? "",
            permittedCheckIds: listField(parts[5] ?? ""), expectedCheckId: parts[6] ?? "",
            lockedAnswer: parts[7] ?? "", stopCondition: parts[8] ?? "",
          };
        }),
        finalRanking: listField(record.finalRanking ?? ""), finalLayer: record.finalLayer,
      };
    case "diagnosticEvidence":
      return {
        id: record.id, problemId: record.problemId ?? "", sourceType: record.sourceType,
        result: record.result ?? "", scope: record.scope ?? "",
        affectsCauseIds: listField(record.affectsCauseIds ?? ""),
        direction: Object.fromEntries(listField(record.direction ?? "").map((pair) => pair.split("="))),
        sequenceOrder: Number(record.sequenceOrder ?? 0), evidenceClaimId: record.evidenceClaimId ?? "",
      };
    case "transferCases":
      return {
        id: record.id, problemId: record.problemId ?? "", mode: record.mode, prompt: record.prompt ?? "",
        context: record.context ?? "", answerSchema: record.answerSchema ?? "", rubric: listField(record.rubric ?? ""),
        expected: JSON.parse(record.expected || "{}"), misconceptionTags: listField(record.misconceptionTags ?? ""),
        farTransferFamily: record.farTransferFamily ?? "", relatedProblemId: record.relatedProblemId || undefined,
        contentOrigin: record.contentOrigin, verificationStatus: record.verificationStatus,
      };
    default:
      return {};
  }
}

export function parseSourcePackMarkdown(files: Record<string, string>, packHeader: Record<string, string>): SourcePackDocument {
  const names = Object.keys(files);
  if (names.length > MAX_ENTITY_FILES) throw new Error("文件数量超过上限。");
  const doc: SourcePackDocument = {
    packSchemaVersion: Number(packHeader.packSchemaVersion ?? PACK_SCHEMA_VERSION),
    packId: packHeader.packId ?? "",
    title: packHeader.title ?? "",
    createdAt: packHeader.createdAt ?? "",
    createdBy: packHeader.createdBy ?? "",
    provenance: packHeader.provenance ?? "",
    sources: [],
    evidenceClaims: [],
    problemCards: [],
    diagnosticCauses: [],
    diagnosticChecks: [],
    diagnosticPaths: [],
    diagnosticEvidence: [],
    transferCases: [],
    verificationMetadata: { reviewStatus: "pending", reviewer: null, reviewedAt: null },
  };
  for (const [fileName, content] of Object.entries(files)) {
    const { fields } = parseMarkdownFrontmatter(content);
    if (!fields.id) throw new Error(`${fileName}: 缺少 frontmatter id。`);
    const record: Record<string, string> = { ...fields, body: content };
    const docKey = markdownKindToDocKey(fields.kind ?? fileName);
    if (!docKey) throw new Error(`${fileName}: 未知实体类型 ${fields.kind ?? ""}。`);
    (doc as unknown as Record<string, unknown[]>)[docKey].push(recordToEntity(docKey, record));
  }
  return doc;
}

function markdownKindToDocKey(kind: string): keyof SourcePackDocument | undefined {
  const map: Record<string, keyof SourcePackDocument> = {
    source: "sources", claim: "evidenceClaims", problem: "problemCards", cause: "diagnosticCauses",
    check: "diagnosticChecks", path: "diagnosticPaths", evidence: "diagnosticEvidence", case: "transferCases",
  };
  return map[kind];
}
