import {
  FRESHNESS_CLASSES, KNOWLEDGE_CHANGE_TYPES, KNOWLEDGE_PROJECTION_TYPES, KNOWLEDGE_STATUSES, KNOWLEDGE_TYPES,
  type KnowledgeAudit, type KnowledgeChangeCandidate, type KnowledgeChangeType, type KnowledgeEvidenceClaim,
  type KnowledgeEvidenceSource, type KnowledgeImpact, type KnowledgeImportPreview, type KnowledgeImportRequest,
  type KnowledgeLearningBinding, type KnowledgeLedgerEntry, type KnowledgeOrigin, type KnowledgeProjection,
  type KnowledgeProjectionType, type KnowledgeProtocolFields, type KnowledgeRevisionBinding, type KnowledgeStatus,
  type KnowledgeType, type KnowledgeUnit, type KnowledgeWorkspace,
} from "../domain/knowledge";
import { canonicalJson, sha256 } from "./contentStudio";
import { parseSourcePackJsonSafe, validateSourcePackUnknown, parseMarkdownFrontmatter, MAX_PACK_BYTES } from "./sourcePack";

const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown): x is string => typeof x === "string";
const nonempty = (x: unknown): x is string => text(x) && !!x.trim();
const strings = (x: unknown): x is string[] => Array.isArray(x) && x.every(text);
const positive = (x: unknown): x is number => Number.isInteger(x) && Number(x) > 0;
const validHash = (x: unknown) => text(x) && /^sha256:[a-f0-9]{64}$/.test(x);
const validId = (x: unknown) => text(x) && /^[a-z0-9][a-z0-9._:-]{0,159}$/i.test(x);
const validDate = (x: unknown) => text(x) && /^\d{4}-\d\d-\d\d(?:T.*)?$/.test(x) && Number.isFinite(Date.parse(x));
const copy = <T>(x: T): T => structuredClone(x);
const persisted = (x: unknown): unknown => x === undefined ? null : JSON.parse(JSON.stringify(x));
const unique = <T>(xs: T[]) => [...new Set(xs)];
const refKey = (id: string, revision: number) => `${id}@${revision}`;
const learningNode = (id: string, revision: number, hash: string) => `learning:${refKey(id, revision)}:${hash}`;
const unitBinding = (u: KnowledgeUnit): KnowledgeRevisionBinding => ({ knowledgeUnitId: u.id, revision: u.revision, hash: u.hash });
const sameBinding = (a: KnowledgeRevisionBinding, b: KnowledgeRevisionBinding) => a.knowledgeUnitId === b.knowledgeUnitId && a.revision === b.revision && a.hash === b.hash;
const resolveUnit = (w: KnowledgeWorkspace, b: KnowledgeRevisionBinding) => w.units.find((u) => u.id === b.knowledgeUnitId && u.revision === b.revision && u.hash === b.hash);
const operations = ["create", "revise", "duplicate", "supersede", "deprecate", "restore", "evidence_update"] as const;
const originValues = ["user", "ai_generated", "verified_seed", "verified_external", "migration"];

export function knowledgeHash(value: unknown): string {
  if (!record(value)) return sha256(persisted(value));
  const { hash: _hash, ...payload } = value;
  return sha256(persisted(payload));
}
export function emptyKnowledgeWorkspace(): KnowledgeWorkspace {
  return { schemaVersion: 1, units: [], sources: [], claims: [], learningBindings: [], projections: [], candidates: [], ledger: [], holds: [], conflicts: [] };
}
/** Pending proposals do not change a candidate's scientific base; applied changes do. */
export function knowledgeWorkspaceHash(w: KnowledgeWorkspace): string {
  const { candidates: _candidates, conflicts: _conflicts, ...base } = w;
  return sha256(persisted(base));
}
const protocolTemplate = (): KnowledgeProtocolFields => ({ signalOrigin: "", experimentalUnit: "", biologicalReplicate: "", technicalReplicate: "", controls: [], workflowLogic: [], criticalVariables: [], qcCheckpoints: [], troubleshooting: [], quantification: "", statisticalUnit: "", allowedClaims: [], forbiddenClaims: [] });
export function createKnowledgeTemplate(knowledgeType: KnowledgeType, options: { id: string; title: string; now: string; contentOrigin?: KnowledgeOrigin }): KnowledgeUnit {
  if (!KNOWLEDGE_TYPES.includes(knowledgeType)) throw new Error("未知知识类型");
  const base = { schemaVersion: 1 as const, id: options.id, revision: 1, hash: "", title: options.title, aliases: [], domain: [], scientificQuestion: "", whyItMatters: "", intuition: "", preciseExplanation: [], inputs: [], outputs: [], assumptions: [], workflowOrLogic: [], boundaries: [], misconceptions: [], failureModes: [], alternativeExplanations: [], evidenceLinks: [], prerequisiteIds: [], downstreamIds: [], freshnessClass: knowledgeType === "guideline" ? "GUIDELINE_TRIGGERED" as const : knowledgeType === "concept" ? "FOUNDATIONAL_STABLE" as const : "EVOLVING_PRACTICE" as const, knowledgeStatus: "REVIEW_REQUIRED" as const, validFrom: options.now, supersedes: [], supersededBy: [], lifecycle: "pending_review" as const, verificationStatus: "pending" as const, contentOrigin: options.contentOrigin ?? "user", provenance: { createdAt: options.now, changeReason: "从模板创建，等待科学审核", verificationScope: "none" as const }, migrationStatus: "REVIEW_REQUIRED" as const, reviewGaps: ["科学问题、解释、边界与逐主张来源尚待填写及审核。"] };
  let unit: KnowledgeUnit;
  switch (knowledgeType) {
    case "concept": unit = { ...base, knowledgeType, concept: { definition: "", counterexamples: [] } }; break;
    case "method": unit = { ...base, knowledgeType, method: { algorithmOrStatisticalLogic: "", parameters: [], diagnostics: [], appropriateWhen: [], inappropriateWhen: [], commonMisuse: [], reviewerChecks: [], paperAppearance: "" } }; break;
    case "protocol": unit = { ...base, knowledgeType, protocol: protocolTemplate() }; break;
    case "experimental_technique": unit = { ...base, knowledgeType, technique: protocolTemplate() }; break;
    case "guideline": unit = { ...base, knowledgeType, guideline: { issuingOrganization: "", version: "", effectiveDate: "", supersededVersion: "", recommendationScope: [] } }; break;
    case "research_pattern": unit = { ...base, knowledgeType, pattern: { context: "", evidenceLogic: [], applicability: [] } }; break;
  }
  unit.hash = knowledgeHash(unit);
  return unit;
}

function provenanceErrors(p: unknown): string[] {
  if (!record(p)) return ["provenance 必须是对象"];
  const errors: string[] = [];
  if (!validDate(p.createdAt) || !nonempty(p.changeReason)) errors.push("provenance 缺少日期或变更原因");
  if (!["none", "identifier", "metadata", "claim"].includes(String(p.verificationScope))) errors.push("verificationScope 无效");
  if (p.reviewedAt !== undefined && !validDate(p.reviewedAt)) errors.push("reviewedAt 无效");
  return errors;
}
function bindingErrors(b: unknown, idField: string): string[] {
  return !record(b) || !validId(b[idField]) || !positive(b.revision) || !validHash(b.hash) ? ["精确 revision/hash 绑定无效"] : [];
}
function revisionErrors(u: Record<string, unknown>): string[] {
  const errors = provenanceErrors(u.provenance);
  if (!validId(u.id)) errors.push("ID 无效");
  if (!positive(u.revision)) errors.push("revision 必须为正整数");
  if (!validHash(u.hash) || u.hash !== knowledgeHash(u)) errors.push("revision 哈希不匹配");
  return errors;
}
export function validateKnowledgeUnit(value: unknown): string[] {
  if (!record(value)) return ["KnowledgeUnit 必须为对象"];
  const u = value, errors = revisionErrors(u);
  if (u.schemaVersion !== 1) errors.push("知识 schemaVersion 无效");
  if (!KNOWLEDGE_TYPES.includes(u.knowledgeType as KnowledgeType)) errors.push("knowledgeType 无效");
  if (!nonempty(u.title)) errors.push("标题不能为空");
  for (const key of ["aliases", "domain", "preciseExplanation", "inputs", "outputs", "assumptions", "workflowOrLogic", "boundaries", "misconceptions", "failureModes", "alternativeExplanations", "prerequisiteIds", "downstreamIds", "reviewGaps"]) if (!strings(u[key])) errors.push(`${key} 必须为字符串数组`);
  for (const key of ["scientificQuestion", "whyItMatters", "intuition"]) if (!text(u[key])) errors.push(`${key} 必须为文本`);
  for (const key of ["supersedes", "supersededBy"]) if (!Array.isArray(u[key]) || u[key].some((b) => bindingErrors(b, "knowledgeUnitId").length)) errors.push(`${key} 绑定无效`);
  if (!Array.isArray(u.evidenceLinks) || u.evidenceLinks.some((b) => bindingErrors(b, "claimId").length || !["direct", "methodology", "curriculum_synthesis", "supplemental"].includes(String((b as Record<string, unknown>).supportMode)))) errors.push("evidenceLinks 无效");
  if (!FRESHNESS_CLASSES.includes(u.freshnessClass as never)) errors.push("freshnessClass 无效");
  if (!KNOWLEDGE_STATUSES.includes(u.knowledgeStatus as KnowledgeStatus)) errors.push("knowledgeStatus 无效");
  if (!["draft", "pending_review", "active", "archived"].includes(String(u.lifecycle))) errors.push("lifecycle 无效");
  if (!["pending", "verified"].includes(String(u.verificationStatus))) errors.push("verificationStatus 无效");
  if (!["user", "ai_generated", "verified_seed", "verified_external", "migration"].includes(String(u.contentOrigin))) errors.push("contentOrigin 无效");
  if (!["complete", "REVIEW_REQUIRED"].includes(String(u.migrationStatus))) errors.push("migrationStatus 无效");
  if (!validDate(u.validFrom)) errors.push("validFrom 无效");
  for (const key of ["validUntil", "lastReviewedAt", "nextReviewAt"]) if (u[key] !== undefined && !validDate(u[key])) errors.push(`${key} 无效`);
  if (validDate(u.validUntil) && validDate(u.validFrom) && Date.parse(String(u.validUntil)) < Date.parse(String(u.validFrom))) errors.push("有效期结束早于开始");
  if (validDate(u.nextReviewAt) && validDate(u.lastReviewedAt) && Date.parse(String(u.nextReviewAt)) < Date.parse(String(u.lastReviewedAt))) errors.push("下次审核早于上次审核");
  const spec: Record<string, { field: string; strings: string[]; arrays: string[] }> = {
    concept: { field: "concept", strings: ["definition"], arrays: ["counterexamples"] },
    method: { field: "method", strings: ["algorithmOrStatisticalLogic", "paperAppearance"], arrays: ["parameters", "diagnostics", "appropriateWhen", "inappropriateWhen", "commonMisuse", "reviewerChecks"] },
    protocol: { field: "protocol", strings: ["signalOrigin", "experimentalUnit", "biologicalReplicate", "technicalReplicate", "quantification", "statisticalUnit"], arrays: ["controls", "workflowLogic", "criticalVariables", "qcCheckpoints", "troubleshooting", "allowedClaims", "forbiddenClaims"] },
    experimental_technique: { field: "technique", strings: ["signalOrigin", "experimentalUnit", "biologicalReplicate", "technicalReplicate", "quantification", "statisticalUnit"], arrays: ["controls", "workflowLogic", "criticalVariables", "qcCheckpoints", "troubleshooting", "allowedClaims", "forbiddenClaims"] },
    guideline: { field: "guideline", strings: ["issuingOrganization", "version", "effectiveDate", "supersededVersion"], arrays: ["recommendationScope"] },
    research_pattern: { field: "pattern", strings: ["context"], arrays: ["evidenceLogic", "applicability"] },
  };
  const s = spec[String(u.knowledgeType)];
  if (s) {
    const details = u[s.field];
    if (!record(details)) errors.push(`缺少 ${s.field} 专属契约`);
    else {
      for (const k of s.strings) if (!text(details[k])) errors.push(`${s.field}.${k} 必须为文本`);
      for (const k of s.arrays) if (!strings(details[k])) errors.push(`${s.field}.${k} 必须为数组`);
      if (s.field === "guideline" && details.effectiveDate !== "" && !validDate(details.effectiveDate)) errors.push("guideline.effectiveDate 无效");
    }
  }
  if (u.contentOrigin === "ai_generated" && (u.verificationStatus !== "pending" || u.lifecycle === "active")) errors.push("AI 候选不能自行核验或激活");
  if (u.lifecycle === "active" && u.verificationStatus !== "verified") errors.push("待核验知识不能激活");
  if ((u.lifecycle === "active" || u.verificationStatus === "verified") && (!record(u.provenance) || u.provenance.verificationScope !== "claim" || !nonempty(u.provenance.reviewer) || !validDate(u.provenance.reviewedAt))) errors.push("verified/active 知识缺少逐主张审核 provenance");
  if (u.lifecycle === "active" && ["SUPERSEDED", "DEPRECATED", "EMERGING"].includes(String(u.knowledgeStatus))) errors.push("不可用于新学习的知识状态不能声明 active");
  if (u.migrationStatus === "REVIEW_REQUIRED" && (!strings(u.reviewGaps) || !u.reviewGaps.length)) errors.push("迁移审核状态必须声明缺口");
  return errors;
}

function emptyImpact(errors: string[] = []): KnowledgeImpact {
  return { valid: !errors.length, errors, affectedKnowledge: [], affectedLessons: [], affectedAssessments: [], affectedCases: [], affectedProtocols: [], affectedGuides: [], affectedStudios: [], affectedLearningBindings: [], patchProposals: [], graph: { nodes: [], edges: [] } };
}
function graphFor(w: KnowledgeWorkspace): { graph: KnowledgeImpact["graph"]; errors: string[] } {
  const nodes = new Set<string>(), edges: Array<{ from: string; to: string }> = [], errors: string[] = [];
  const sourceKey = (id: string, rev: number) => `source:${refKey(id, rev)}`;
  const claimKey = (id: string, rev: number) => `claim:${refKey(id, rev)}`;
  const knowledgeKey = (id: string, rev: number) => `knowledge:${refKey(id, rev)}`;
  const assetKey = learningNode;
  const add = (from: string, to: string) => { if (!nodes.has(from) || !nodes.has(to)) errors.push(`断链 ${from} → ${to}`); else if (!edges.some((e) => e.from === from && e.to === to)) edges.push({ from, to }); };
  for (const s of w.sources) nodes.add(sourceKey(s.id, s.revision));
  for (const c of w.claims) nodes.add(claimKey(c.id, c.revision));
  for (const u of w.units) nodes.add(knowledgeKey(u.id, u.revision));
  for (const b of w.learningBindings) nodes.add(assetKey(b.assetId, b.assetRevision, b.assetHash));
  for (const p of w.projections) nodes.add(assetKey(p.id, p.revision, p.hash));
  for (const c of w.claims) for (const b of c.sourceBindings) {
    if (!w.sources.some((s) => s.id === b.sourceId && s.revision === b.revision && s.hash === b.hash)) errors.push(`claim ${c.id} 的 source 绑定不存在或哈希失配`);
    add(sourceKey(b.sourceId, b.revision), claimKey(c.id, c.revision));
  }
  for (const u of w.units) {
    for (const b of u.evidenceLinks) {
      if (!w.claims.some((c) => c.id === b.claimId && c.revision === b.revision && c.hash === b.hash)) errors.push(`knowledge ${u.id} 的 claim 绑定不存在或哈希失配`);
      add(claimKey(b.claimId, b.revision), knowledgeKey(u.id, u.revision));
    }
    for (const id of u.prerequisiteIds) {
      const matches = w.units.filter((x) => x.id === id);
      if (!matches.length) errors.push(`knowledge ${u.id} prerequisite ${id} 缺失`);
      for (const p of matches) add(knowledgeKey(p.id, p.revision), knowledgeKey(u.id, u.revision));
    }
    for (const id of u.downstreamIds) {
      const matches = w.units.filter((x) => x.id === id);
      if (!matches.length) errors.push(`knowledge ${u.id} downstream ${id} 缺失`);
      for (const p of matches) add(knowledgeKey(u.id, u.revision), knowledgeKey(p.id, p.revision));
    }
  }
  for (const b of w.learningBindings) for (const r of b.knowledgeRevisionBindings) {
    if (!resolveUnit(w, r)) errors.push(`learning ${b.assetId} 的 knowledge revision/hash 未解析`);
    add(knowledgeKey(r.knowledgeUnitId, r.revision), assetKey(b.assetId, b.assetRevision, b.assetHash));
  }
  for (const p of w.projections) for (const r of p.knowledgeRevisionBindings) {
    if (!resolveUnit(w, r)) errors.push(`projection ${p.id} 的 knowledge revision/hash 未解析`);
    add(knowledgeKey(r.knowledgeUnitId, r.revision), assetKey(p.id, p.revision, p.hash));
  }
  const outgoing = new Map<string, string[]>();
  for (const e of edges) outgoing.set(e.from, [...outgoing.get(e.from) ?? [], e.to]);
  const visiting = new Set<string>(), visited = new Set<string>();
  const walk = (n: string): void => {
    if (visiting.has(n)) { errors.push(`dependency cycle: ${n}`); return; }
    if (visited.has(n)) return;
    visiting.add(n);
    for (const next of outgoing.get(n) ?? []) walk(next);
    visiting.delete(n); visited.add(n);
  };
  for (const n of nodes) walk(n);
  return { graph: { nodes: [...nodes].sort(), edges: edges.sort((a, b) => `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`)) }, errors: unique(errors) };
}
function graphClosure(graph: KnowledgeImpact["graph"], roots: string[]): Set<string> {
  const reached = new Set<string>(), queue = [...roots];
  const outgoing = new Map<string, string[]>();
  for (const e of graph.edges) outgoing.set(e.from, [...outgoing.get(e.from) ?? [], e.to]);
  for (let i = 0; i < queue.length; i++) { const n = queue[i]; if (reached.has(n)) continue; reached.add(n); queue.push(...outgoing.get(n) ?? []); }
  return reached;
}

function auditKnowledgeWorkspaceUnchecked(value: unknown): KnowledgeAudit {
  const groups: KnowledgeAudit["groups"] = { schema: [], dependency: [], supersession: [], freshness: [], learning_binding: [], update_impact: [], activation_safety: [] }, warnings: string[] = [];
  const result = (): KnowledgeAudit => { const errors = Object.entries(groups).flatMap(([k, es]) => es.map((e) => `${k}: ${e}`)); return { ok: !errors.length, errors, warnings, groups }; };
  if (!record(value) || value.schemaVersion !== 1) { groups.schema.push("知识工作区版本无效"); return result(); }
  for (const k of ["units", "sources", "claims", "learningBindings", "projections", "candidates", "ledger", "holds", "conflicts"]) if (!Array.isArray(value[k]) || value[k].some((x) => !record(x))) groups.schema.push(`${k} 必须是对象数组`);
  if (groups.schema.length) return result();
  const w = value as unknown as KnowledgeWorkspace;
  for (const u of w.units) for (const e of validateKnowledgeUnit(u)) {
    const group = /freshness|knowledgeStatus|effectiveDate|validFrom|validUntil|lastReviewedAt|nextReviewAt|有效期|下次审核/.test(e) ? "freshness" : /激活|逐主张审核|AI 候选/.test(e) ? "activation_safety" : "schema";
    groups[group].push(`${u.id}: ${e}`);
  }
  for (const s of w.sources) {
    groups.schema.push(...revisionErrors(s as unknown as Record<string, unknown>).map((e) => `source ${s.id}: ${e}`));
    if (!text(s.title) || !["pending", "metadata_verified"].includes(s.metadataStatus)) groups.schema.push(`source ${s.id} 字段无效`);
  }
  for (const c of w.claims) {
    groups.schema.push(...revisionErrors(c as unknown as Record<string, unknown>).map((e) => `claim ${c.id}: ${e}`));
    if (!text(c.statement) || !Array.isArray(c.sourceBindings) || c.sourceBindings.some((b) => bindingErrors(b, "sourceId").length)) groups.schema.push(`claim ${c.id} 字段无效`);
    if (!["pending", "verified"].includes(c.verificationStatus)) groups.schema.push(`claim ${c.id} 核验状态无效`);
    if (c.verificationStatus === "verified" && (c.contentOrigin === "ai_generated" || !record(c.provenance) || c.provenance.verificationScope !== "claim" || !c.provenance.reviewer || !c.provenance.reviewedAt)) groups.activation_safety.push(`claim ${c.id} 缺少独立逐主张审核，元数据核验不能升级 claim`);
  }
  const duplicateKeys = (xs: Array<{ id: string; revision: number }>, label: string) => { const seen = new Set<string>(); for (const x of xs) { const k = refKey(x.id, x.revision); if (seen.has(k)) groups.schema.push(`${label} 重复revision ${k}`); seen.add(k); } };
  duplicateKeys(w.units, "knowledge"); duplicateKeys(w.sources, "source"); duplicateKeys(w.claims, "claim"); duplicateKeys(w.projections, "projection");
  const assetSeen = new Set<string>();
  for (const b of w.learningBindings) {
    const k = `${refKey(b.assetId, b.assetRevision)}:${b.assetHash}`;
    if (assetSeen.has(k)) groups.learning_binding.push(`重复 learning binding ${k}`); assetSeen.add(k);
    if (!validId(b.assetId) || !positive(b.assetRevision) || !validHash(b.assetHash) || !strings(b.knowledgeUnitIds) || !Array.isArray(b.knowledgeRevisionBindings) || b.knowledgeRevisionBindings.some((x) => bindingErrors(x, "knowledgeUnitId").length) || !strings(b.reviewGaps) || typeof b.legacyActive !== "boolean") groups.learning_binding.push(`learning binding ${k} 结构无效`);
    else if (canonicalJson([...unique(b.knowledgeUnitIds)].sort()) !== canonicalJson(unique(b.knowledgeRevisionBindings.map((x) => x.knowledgeUnitId)).sort())) groups.learning_binding.push(`learning ${k} knowledgeUnitIds 与精确绑定不一致`);
    if (!["guide", "concept_lesson", "method_lesson", "protocol_lesson", "assessment", "case_lab", "studio_task"].includes(b.kind)) groups.learning_binding.push(`learning ${k} kind无效`);
    if (!Array.isArray(b.knowledgeRevisionBindings) || !b.knowledgeRevisionBindings.length) {
      if (b.migrationStatus === "REVIEW_REQUIRED" && strings(b.reviewGaps) && b.reviewGaps.length) warnings.push(`unresolved migration learning ${k} 没有知识绑定，保留显式审核缺口。`);
      else groups.learning_binding.push(`orphan learning ${k} 没有知识绑定`);
    }
  }
  for (const p of w.projections) {
    if (!validId(p.id) || !positive(p.revision) || !validDate(p.createdAt) || !strings(p.knowledgeUnitIds) || p.hash !== knowledgeHash(p) || !KNOWLEDGE_PROJECTION_TYPES.includes(p.projectionType) || !strings(p.body) || !strings(p.reviewGaps) || !Array.isArray(p.knowledgeRevisionBindings) || p.knowledgeRevisionBindings.some((b) => bindingErrors(b, "knowledgeUnitId").length)) groups.schema.push(`projection ${p.id} 结构或哈希无效`);
    else if (canonicalJson(unique(p.knowledgeUnitIds).sort()) !== canonicalJson(unique(p.knowledgeRevisionBindings.map((b) => b.knowledgeUnitId)).sort())) groups.learning_binding.push(`projection ${p.id} knowledgeUnitIds 与精确绑定不一致`);
    if (p.lifecycle !== "pending_review" || p.verificationStatus !== "pending" || p.contentOrigin !== "ai_generated" || p.createsCompetence !== false) groups.activation_safety.push(`projection ${p.id} 不能激活或计能力`);
    if (!p.knowledgeRevisionBindings?.length) groups.learning_binding.push(`orphan projection ${p.id}`);
  }
  if (groups.schema.length || groups.learning_binding.length || groups.freshness.length) return result();
  const graph = graphFor(w); groups.dependency.push(...graph.errors);
  for (const u of w.units) {
    if (!u.evidenceLinks.length) { if (u.migrationStatus !== "REVIEW_REQUIRED" && !u.reviewGaps.length) groups.dependency.push(`orphan knowledge ${u.id} 缺来源且未声明审核缺口`); else warnings.push(`${u.id} 缺逐主张来源，保留待审核。`); }
    for (const b of [...u.supersedes, ...u.supersededBy]) if (!resolveUnit(w, b)) groups.supersession.push(`${u.id} 替代关系断链`);
    if (u.supersededBy.length) groups.supersession.push(`${u.id} 不允许修改 revision payload 的 supersededBy；使用 ledger`);
    if (u.nextReviewAt && u.freshnessClass === "FOUNDATIONAL_STABLE") warnings.push(`${u.id} 基础知识设置了复核日期；不是强制年审。`);
    if (u.lifecycle === "active" && !w.learningBindings.some((b) => b.legacyActive && b.knowledgeRevisionBindings.some((r) => sameBinding(r, unitBinding(u))))) groups.activation_safety.push(`${u.id} 没有保留原有正式学习的 migration binding；M020不支持新激活`);
  }
  const ledgerIds = new Set<string>();
  for (const l of w.ledger) {
    if (!validId(l.id) || ledgerIds.has(l.id) || !validDate(l.at) || !nonempty(l.reason) || !nonempty(l.reviewer) || bindingErrors(l.target, "knowledgeUnitId").length || !resolveUnit(w, l.target) || !KNOWLEDGE_STATUSES.includes(l.status) || !["review_required", "supersede", "deprecate", "restore_pending", "candidate_added"].includes(l.action)) { groups.supersession.push(`ledger ${l.id} 无效`); continue; }
    ledgerIds.add(l.id);
    if (!w.candidates.some((c) => c.id === l.changeId)) groups.update_impact.push(`ledger ${l.id} 缺少变更候选`);
    if (l.action === "supersede") {
      const replacement = l.replacement && resolveUnit(w, l.replacement);
      if (l.status !== "SUPERSEDED" || !replacement || sameBinding(l.target, l.replacement!) || !replacement.supersedes.some((b) => sameBinding(b, l.target))) groups.supersession.push(`ledger ${l.id} 双向替代关系不一致`);
    } else if (l.replacement) groups.supersession.push(`ledger ${l.id} 非替代动作含 replacement`);
    if (l.action === "deprecate" && l.status !== "DEPRECATED") groups.supersession.push(`ledger ${l.id} 废弃状态不一致`);
  }
  for (const u of w.units) for (const old of u.supersedes) if (!w.ledger.some((l) => l.action === "supersede" && sameBinding(l.target, old) && l.replacement && sameBinding(l.replacement, unitBinding(u)))) groups.supersession.push(`${u.id} 缺少确认替代 ledger`);
  if (groups.supersession.length) return result();
  const supersessionEdges = w.ledger.filter((l) => l.action === "supersede" && l.replacement).map((l) => ({ from: refKey(l.target.knowledgeUnitId, l.target.revision), to: refKey(l.replacement!.knowledgeUnitId, l.replacement!.revision) }));
  for (const e of supersessionEdges) {
    const seen = new Set([e.from]); let stack = [e.to];
    while (stack.length) { const n = stack.pop()!; if (n === e.from) { groups.supersession.push("supersession cycle"); break; } if (seen.has(n)) continue; seen.add(n); stack = [...stack, ...supersessionEdges.filter((x) => x.from === n).map((x) => x.to)]; }
  }
  const candidateIds = new Set<string>();
  for (const c of w.candidates) { groups.update_impact.push(...candidateErrors(c).map((e) => `candidate ${c.id}: ${e}`)); if (candidateIds.has(c.id)) groups.update_impact.push(`重复 candidate ${c.id}`); candidateIds.add(c.id); }
  for (const h of w.holds) if (h.status !== "REVIEW_REQUIRED" || !w.candidates.some((c) => c.id === h.changeId) || !w.learningBindings.some((b) => b.assetId === h.assetId && b.assetRevision === h.assetRevision && b.assetHash === h.assetHash)) groups.update_impact.push(`hold ${h.id} 缺少精确学习绑定或变更`);
  if (groups.update_impact.length) return result();
  // Persisted revisions, receipts and holds form one transaction. This invariant
  // also runs on hydration, where there is no previous state to compare against.
  for (const key of ["units", "sources", "claims"] as const) for (const value of w[key]) {
    if (!w[key].some((old) => old.id === value.id && old.revision < value.revision)) continue;
    if (!w.candidates.some((c) => key === "units" ? c.proposedUnit?.hash === value.hash : c[key].some((item) => item.id === value.id && item.revision === value.revision && item.hash === value.hash))) groups.update_impact.push(`${key} ${refKey(value.id, value.revision)} 缺少对应变更候选`);
  }
  for (const c of w.candidates) {
    const receipts = w.ledger.filter((l) => l.changeId === c.id);
    const newUnitStored = c.proposedUnit && !!resolveUnit(w, unitBinding(c.proposedUnit));
    const evidenceStored = c.sources.some((s) => w.sources.some((v) => v.id === s.id && v.revision === s.revision && v.hash === s.hash)) || c.claims.some((s) => w.claims.some((v) => v.id === s.id && v.revision === s.revision && v.hash === s.hash));
    if (!receipts.length && !newUnitStored && !evidenceStored) continue; // Saved preview only.
    if (!receipts.length) groups.update_impact.push(`已落库变更 ${c.id} 缺少操作 ledger`);
    if (c.proposedUnit && !newUnitStored) groups.update_impact.push(`变更 ${c.id} 的知识版本缺失`);
    for (const s of c.sources) if (!w.sources.some((v) => v.id === s.id && v.revision === s.revision && v.hash === s.hash)) groups.update_impact.push(`变更 ${c.id} 的来源版本缺失`);
    for (const s of c.claims) if (!w.claims.some((v) => v.id === s.id && v.revision === s.revision && v.hash === s.hash)) groups.update_impact.push(`变更 ${c.id} 的主张版本缺失`);
    const roots = [...(c.target && !["duplicate", "restore"].includes(c.operation) ? [`knowledge:${refKey(c.target.knowledgeUnitId, c.target.revision)}`] : []), ...w.sources.filter((s) => c.changedSourceIds.includes(s.id) && !c.sources.some((v) => v.id === s.id && v.revision <= s.revision)).map((s) => `source:${refKey(s.id, s.revision)}`), ...w.claims.filter((s) => c.changedClaimIds.includes(s.id) && !c.claims.some((v) => v.id === s.id && v.revision <= s.revision)).map((s) => `claim:${refKey(s.id, s.revision)}`)];
    const firstReceipt = w.ledger.findIndex((l) => l.changeId === c.id);
    const existedAtChange = (node: string) => {
      if (!node.startsWith("knowledge:")) return true;
      const createdIndex = w.ledger.findIndex((l) => ["candidate_added", "restore_pending"].includes(l.action) && `knowledge:${refKey(l.target.knowledgeUnitId, l.target.revision)}` === node);
      return createdIndex < 0 || (firstReceipt >= 0 && createdIndex < firstReceipt);
    };
    const historicalGraph = { nodes: graph.graph.nodes.filter(existedAtChange), edges: graph.graph.edges.filter((e) => existedAtChange(e.from) && existedAtChange(e.to)) };
    const reached = graphClosure(historicalGraph, roots);
    for (const b of w.learningBindings) if (reached.has(learningNode(b.assetId, b.assetRevision, b.assetHash)) && !w.holds.some((h) => h.changeId === c.id && h.assetId === b.assetId && h.assetRevision === b.assetRevision && h.assetHash === b.assetHash)) groups.update_impact.push(`已执行变更 ${c.id} 缺少下游 hold ${b.assetId}`);
    if (newUnitStored && !receipts.some((l) => sameBinding(l.target, unitBinding(c.proposedUnit!)) && l.action === (c.operation === "restore" ? "restore_pending" : "candidate_added"))) groups.update_impact.push(`变更 ${c.id} 缺少新版本 ledger`);
    for (const l of receipts) {
      const isNew = c.proposedUnit && sameBinding(l.target, unitBinding(c.proposedUnit));
      if (isNew) {
        if (l.action !== (c.operation === "restore" ? "restore_pending" : "candidate_added") || l.status !== c.proposedUnit!.knowledgeStatus) groups.update_impact.push(`ledger ${l.id} 新版本动作/状态不一致`);
      } else if (!reached.has(`knowledge:${refKey(l.target.knowledgeUnitId, l.target.revision)}`)) groups.update_impact.push(`ledger ${l.id} 超出候选影响范围`);
      if (l.action === "review_required" && l.status !== "REVIEW_REQUIRED") groups.update_impact.push(`ledger ${l.id} 审核状态不一致`);
      if (l.action === "supersede" && (c.operation !== "supersede" || !c.target || !sameBinding(l.target, c.target) || !c.proposedUnit || !l.replacement || !sameBinding(l.replacement, unitBinding(c.proposedUnit)))) groups.update_impact.push(`ledger ${l.id} 替代未获明确授权`);
      if (l.action === "deprecate" && (c.operation !== "deprecate" || !c.target || !sameBinding(l.target, c.target))) groups.update_impact.push(`ledger ${l.id} 废弃未获明确授权`);
    }
    for (const u of w.units) if (reached.has(`knowledge:${refKey(u.id, u.revision)}`) && (!c.proposedUnit || !sameBinding(unitBinding(u), unitBinding(c.proposedUnit)))) {
      const terminalReceipt = w.ledger.some((l) => sameBinding(l.target, unitBinding(u)) && ["supersede", "deprecate"].includes(l.action));
      if (!terminalReceipt && !receipts.some((l) => sameBinding(l.target, unitBinding(u)) && ["review_required", "supersede", "deprecate"].includes(l.action))) groups.update_impact.push(`已执行变更 ${c.id} 缺少知识审核 ledger ${u.id}`);
    }
  }
  return result();
}
export function auditKnowledgeWorkspace(value: unknown): KnowledgeAudit {
  try { return auditKnowledgeWorkspaceUnchecked(value); }
  catch (error) {
    const message = `无法解析知识工作区：${error instanceof Error ? error.message : String(error)}`;
    return { ok: false, errors: [`schema: ${message}`], warnings: [], groups: { schema: [message], dependency: [], supersession: [], freshness: [], learning_binding: [], update_impact: [], activation_safety: [] } };
  }
}
export const validateKnowledgeWorkspace = (value: unknown): string[] => auditKnowledgeWorkspace(value).errors;

export function effectiveKnowledgeStatus(w: KnowledgeWorkspace, unit: KnowledgeUnit): KnowledgeStatus {
  return [...w.ledger].reverse().find((l) => sameBinding(l.target, unitBinding(unit)))?.status ?? unit.knowledgeStatus;
}
export function resolveHistoricalKnowledgeBinding(w: KnowledgeWorkspace, assetId: string, revision: number, hash: string): { status: "RESOLVED" | "UNRESOLVED"; bindings: KnowledgeRevisionBinding[] } {
  const b = w.learningBindings.find((x) => x.assetId === assetId && x.assetRevision === revision && x.assetHash === hash);
  if (!b || !b.knowledgeRevisionBindings.length || b.knowledgeRevisionBindings.some((r) => !resolveUnit(w, r))) return { status: "UNRESOLVED", bindings: [] };
  return { status: "RESOLVED", bindings: copy(b.knowledgeRevisionBindings) };
}
export function isKnowledgeLearningAllowed(w: KnowledgeWorkspace, assetId: string, revision?: number, hash?: string): boolean {
  if (!auditKnowledgeWorkspace(w).ok) return false;
  return learningAllowedInValidatedWorkspace(w, assetId, revision, hash);
}
/** Validate once for a batch against an owned immutable snapshot; caller mutations cannot invalidate the result. */
export function createKnowledgeLearningGate(w: KnowledgeWorkspace): (assetId: string, revision?: number, hash?: string) => boolean {
  const snapshot = copy(w), valid = auditKnowledgeWorkspace(snapshot).ok;
  return (assetId, revision, hash) => valid && learningAllowedInValidatedWorkspace(snapshot, assetId, revision, hash);
}
function learningAllowedInValidatedWorkspace(w: KnowledgeWorkspace, assetId: string, revision?: number, hash?: string): boolean {
  if (w.projections.some((p) => p.id === assetId)) return false;
  if (w.holds.some((h) => h.assetId === assetId && (revision === undefined || h.assetRevision === revision) && (hash === undefined || h.assetHash === hash))) return false;
  const bindings = w.learningBindings.filter((b) => b.assetId === assetId && (revision === undefined || b.assetRevision === revision) && (hash === undefined || b.assetHash === hash));
  if (!bindings.length) return !w.learningBindings.some((b) => b.assetId === assetId) && !w.units.some((u) => u.id === assetId); // Unknown old IDs keep baseline behavior; known candidates/mismatches do not.
  return bindings.every((b) => b.legacyActive && b.knowledgeRevisionBindings.every((r) => {
    const u = resolveUnit(w, r);
    if (!u || ["SUPERSEDED", "DEPRECATED", "EMERGING", "UPDATE_AVAILABLE"].includes(effectiveKnowledgeStatus(w, u))) return false;
    // Migration gaps do not retrospectively alter an untouched legacy lesson.
    return !w.ledger.some((l) => sameBinding(l.target, r) && ["review_required", "supersede", "deprecate", "restore_pending"].includes(l.action));
  }));
}
export interface ProposeKnowledgeChangeOptions {
  id: string; now: string; reason: string; operation: KnowledgeChangeCandidate["operation"];
  changeType?: KnowledgeChangeType; target?: KnowledgeRevisionBinding; unit?: KnowledgeUnit;
  sources?: KnowledgeEvidenceSource[]; claims?: KnowledgeEvidenceClaim[]; changedSourceIds?: string[]; changedClaimIds?: string[];
}
function sourceErrors(value: unknown): string[] {
  if (!record(value)) return ["source 必须为对象"];
  return [...revisionErrors(value), ...(!text(value.title) || !["pending", "metadata_verified"].includes(String(value.metadataStatus)) || !originValues.includes(String(value.contentOrigin)) ? ["source 字段无效"] : [])];
}
function claimErrors(value: unknown): string[] {
  if (!record(value)) return ["claim 必须为对象"];
  return [...revisionErrors(value), ...(!text(value.statement) || !Array.isArray(value.sourceBindings) || value.sourceBindings.some((b) => bindingErrors(b, "sourceId").length) || !["pending", "verified"].includes(String(value.verificationStatus)) || !originValues.includes(String(value.contentOrigin)) ? ["claim 字段无效"] : [])];
}
function candidateErrors(value: unknown): string[] {
  if (!record(value)) return ["candidate 必须为对象"];
  const c = value, errors: string[] = [];
  if (!validId(c.id) || c.hash !== knowledgeHash(c) || !validHash(c.baseWorkspaceHash) || !nonempty(c.title) || !nonempty(c.reason) || !validDate(c.createdAt)) errors.push("候选标识、哈希、理由或日期无效");
  if (!operations.includes(c.operation as never) || !KNOWLEDGE_CHANGE_TYPES.includes(c.changeType as never)) errors.push("未知候选操作或变更类型");
  if (c.lifecycle !== "pending_review" || c.verificationStatus !== "pending" || !originValues.includes(String(c.contentOrigin))) errors.push("候选必须保持 pending_review");
  if (!Array.isArray(c.sources) || !Array.isArray(c.claims) || !strings(c.changedSourceIds) || !strings(c.changedClaimIds)) errors.push("候选证据集合无效");
  if (c.target !== undefined && bindingErrors(c.target, "knowledgeUnitId").length) errors.push("目标精确绑定无效");
  if (["revise", "supersede", "deprecate", "restore", "duplicate"].includes(String(c.operation)) && c.target === undefined) errors.push("操作缺少目标绑定");
  if (["create", "revise", "supersede", "restore", "duplicate"].includes(String(c.operation)) && !record(c.proposedUnit)) errors.push("操作缺少候选知识");
  const allowed: Record<string, readonly string[]> = { create: ["NEW", "EXTENSION", "CONTRADICTION"], duplicate: ["NEW", "EXTENSION"], revise: ["UPDATE", "EXTENSION", "CONTRADICTION"], supersede: ["SUPERSESSION"], deprecate: ["DEPRECATION"], restore: ["UPDATE"], evidence_update: ["UPDATE", "EXTENSION", "CONTRADICTION"] };
  if (allowed[String(c.operation)] && !allowed[String(c.operation)].includes(String(c.changeType))) errors.push("操作与变更类型不一致");
  if (["deprecate", "evidence_update"].includes(String(c.operation)) && c.proposedUnit !== undefined) errors.push("此操作不允许附带新知识版本");
  if (c.proposedUnit !== undefined) {
    errors.push(...validateKnowledgeUnit(c.proposedUnit));
    if (record(c.proposedUnit) && (c.proposedUnit.lifecycle !== "pending_review" || c.proposedUnit.verificationStatus !== "pending" || !["REVIEW_REQUIRED", "EMERGING", "UPDATE_AVAILABLE"].includes(String(c.proposedUnit.knowledgeStatus)))) errors.push("候选知识不允许激活或核验");
  }
  if (Array.isArray(c.sources)) for (const s of c.sources) { errors.push(...sourceErrors(s)); if (record(s) && s.metadataStatus !== "pending") errors.push("导入 source 必须 pending"); }
  if (Array.isArray(c.claims)) for (const claim of c.claims) { errors.push(...claimErrors(claim)); if (record(claim) && claim.verificationStatus !== "pending") errors.push("候选 claim 必须 pending"); }
  return unique(errors);
}
export function proposeKnowledgeChange(w: KnowledgeWorkspace, o: ProposeKnowledgeChangeOptions): KnowledgeChangeCandidate {
  const errors = validateKnowledgeWorkspace(w);
  if (errors.length) throw new Error(errors.join("；"));
  if (!validId(o.id) || !validDate(o.now) || !nonempty(o.reason)) throw new Error("变更 ID、日期和理由必须有效");
  if (!operations.includes(o.operation)) throw new Error("未知候选操作");
  const target = o.target && resolveUnit(w, o.target);
  if (o.target && !target) throw new Error("目标 revision/hash 已过期或不存在");
  if (["revise", "supersede", "deprecate", "restore", "duplicate"].includes(o.operation) && !target) throw new Error("此操作必须选择精确原始版本");
  let proposed = o.unit ? copy(o.unit) : target && o.operation !== "deprecate" && o.operation !== "evidence_update" ? copy(target) : undefined;
  if (["create", "revise", "supersede", "restore", "duplicate"].includes(o.operation) && !proposed) throw new Error("此操作需要候选知识");
  if (proposed) {
    if (target && ["revise", "restore"].includes(o.operation)) proposed.id = target.id;
    if (o.operation === "duplicate" && proposed.id === target?.id) throw new Error("复制知识需要新的稳定 ID");
    const existing = w.units.filter((u) => u.id === proposed!.id);
    if (["create", "duplicate"].includes(o.operation) && existing.length) throw new Error("新知识 ID 已存在");
    if (target && ["revise", "restore", "supersede"].includes(o.operation) && w.units.some((u) => u.id === target.id && u.revision > target.revision)) throw new Error("目标不是当前最新版本，拒绝过期候选");
    proposed.revision = existing.length ? Math.max(...existing.map((u) => u.revision)) + 1 : 1;
    proposed.lifecycle = "pending_review"; proposed.verificationStatus = "pending"; proposed.knowledgeStatus = o.changeType === "CONTRADICTION" ? "EMERGING" : "REVIEW_REQUIRED";
    proposed.contentOrigin = proposed.contentOrigin === "ai_generated" ? "ai_generated" : "user";
    proposed.supersededBy = [];
    proposed.supersedes = o.operation === "supersede" && o.target ? [copy(o.target)] : [];
    proposed.provenance = { ...proposed.provenance, createdAt: o.now, changeReason: o.reason, verificationScope: "none", reviewer: undefined, reviewedAt: undefined, supersedesRevision: target?.revision };
    proposed.migrationStatus = "REVIEW_REQUIRED";
    proposed.reviewGaps = unique([...proposed.reviewGaps, "候选变更尚未完成科学审核和教学重新验证。"]);
    proposed.validFrom = o.now; delete proposed.lastReviewedAt;
    proposed = copy(proposed); proposed.hash = knowledgeHash(proposed);
    const ue = validateKnowledgeUnit(proposed); if (ue.length) throw new Error(ue.join("；"));
  }
  const sources = copy(o.sources ?? []).map((s) => { const next = { ...s, metadataStatus: "pending" as const, contentOrigin: "user" as const, provenance: { ...s.provenance, verificationScope: "none" as const, reviewer: undefined, reviewedAt: undefined } }; const normalized = copy(next); normalized.hash = knowledgeHash(normalized); return normalized; });
  // Hash changes after safety normalization must also update candidate claim bindings.
  const claims = copy(o.claims ?? []).map((c) => { const next = copy({ ...c, verificationStatus: "pending" as const, contentOrigin: c.contentOrigin === "ai_generated" ? "ai_generated" as const : "user" as const, sourceBindings: c.sourceBindings.map((b) => { const s = sources.find((s) => s.id === b.sourceId && s.revision === b.revision); return s ? { ...b, hash: s.hash } : b; }), provenance: { ...c.provenance, verificationScope: "none" as const, reviewer: undefined, reviewedAt: undefined } }); next.hash = knowledgeHash(next); return next; });
  if (proposed) { proposed.evidenceLinks = proposed.evidenceLinks.map((b) => { const c = claims.find((c) => c.id === b.claimId && c.revision === b.revision); return c ? { ...b, hash: c.hash } : b; }); proposed.hash = knowledgeHash(proposed); }
  const changeType = o.changeType ?? ({ create: "NEW", duplicate: "NEW", revise: "UPDATE", supersede: "SUPERSESSION", deprecate: "DEPRECATION", restore: "UPDATE", evidence_update: "UPDATE" } as const)[o.operation];
  const candidate: KnowledgeChangeCandidate = { id: o.id, hash: "", changeType, operation: o.operation, title: proposed?.title ?? target?.title ?? "证据更新", reason: o.reason, createdAt: o.now, baseWorkspaceHash: knowledgeWorkspaceHash(w), ...(o.target ? { target: copy(o.target) } : {}), ...(proposed ? { proposedUnit: proposed } : {}), sources, claims, changedSourceIds: unique([...(o.changedSourceIds ?? []), ...sources.filter((s) => w.sources.some((old) => old.id === s.id)).map((s) => s.id)]), changedClaimIds: unique([...(o.changedClaimIds ?? []), ...claims.filter((c) => w.claims.some((old) => old.id === c.id)).map((c) => c.id)]), lifecycle: "pending_review", verificationStatus: "pending", contentOrigin: proposed?.contentOrigin ?? "user" };
  candidate.hash = knowledgeHash(candidate);
  const ce = candidateErrors(candidate); if (ce.length) throw new Error(ce.join("；"));
  return candidate;
}
export function previewKnowledgeImpact(w: KnowledgeWorkspace, candidate: KnowledgeChangeCandidate): KnowledgeImpact {
  const errors = [...validateKnowledgeWorkspace(w), ...candidateErrors(candidate)];
  if (errors.length) return emptyImpact(errors);
  const proposed = candidate.proposedUnit, target = candidate.target && resolveUnit(w, candidate.target);
  if (candidate.target && !target) errors.push("目标 revision/hash 不存在");
  if (target && ["revise", "restore", "supersede"].includes(candidate.operation) && w.units.some((u) => u.id === target.id && u.revision > target.revision)) errors.push("目标不是最新版本，拒绝 stale update");
  if (proposed) {
    const old = w.units.filter((u) => u.id === proposed.id);
    if (old.some((u) => u.revision >= proposed.revision)) errors.push("候选 revision 已存在或过期");
    if (["create", "duplicate"].includes(candidate.operation) && old.length) errors.push("新知识 ID 已存在");
    if (target && ["revise", "restore"].includes(candidate.operation) && proposed.id !== target.id) errors.push("修订/恢复必须保持知识 ID");
    if (candidate.operation === "supersede" ? !candidate.target || proposed.supersedes.length !== 1 || !sameBinding(proposed.supersedes[0], candidate.target) : proposed.supersedes.length > 0) errors.push("候选替代关系与操作不一致");
    if (proposed.revision !== (old.length ? Math.max(...old.map((u) => u.revision)) + 1 : 1)) errors.push("候选 revision 必须连续递增");
  }
  try {
    const prospective = { ...w, units: proposed ? appendUniqueRevisions(w.units, [proposed]) : w.units, sources: appendUniqueRevisions(w.sources, candidate.sources), claims: appendUniqueRevisions(w.claims, candidate.claims) };
    errors.push(...graphFor(prospective).errors);
  } catch (e) { errors.push(String(e)); }
  for (const s of candidate.sources) if (w.sources.some((old) => old.id === s.id) && !candidate.changedSourceIds.includes(s.id)) errors.push(`source ${s.id} 更新缺少影响根`);
  for (const c of candidate.claims) if (w.claims.some((old) => old.id === c.id) && !candidate.changedClaimIds.includes(c.id)) errors.push(`claim ${c.id} 更新缺少影响根`);
  if (errors.length) return emptyImpact(errors);
  const { graph, errors: ge } = graphFor(w);
  if (ge.length) return { ...emptyImpact(ge), graph };
  const roots: string[] = [];
  if (candidate.target && candidate.operation !== "duplicate" && candidate.operation !== "restore") {
    if (!resolveUnit(w, candidate.target)) errors.push("目标 revision/hash 不存在");
    else roots.push(`knowledge:${refKey(candidate.target.knowledgeUnitId, candidate.target.revision)}`);
  }
  for (const id of candidate.changedSourceIds) {
    const sources = w.sources.filter((s) => s.id === id);
    if (!sources.length) errors.push(`更新 source ${id} 不存在`);
    roots.push(...sources.map((s) => `source:${refKey(s.id, s.revision)}`));
  }
  for (const id of candidate.changedClaimIds) {
    const claims = w.claims.filter((c) => c.id === id);
    if (!claims.length) errors.push(`更新 claim ${id} 不存在`);
    roots.push(...claims.map((c) => `claim:${refKey(c.id, c.revision)}`));
  }
  const reached = graphClosure(graph, roots);
  const affectedLearningBindings = w.learningBindings.filter((b) => reached.has(learningNode(b.assetId, b.assetRevision, b.assetHash)));
  const ids = (kinds: KnowledgeLearningBinding["kind"][]) => unique(affectedLearningBindings.filter((b) => kinds.includes(b.kind)).map((b) => b.assetId)).sort();
  return { valid: !errors.length, errors, affectedKnowledge: w.units.filter((u) => reached.has(`knowledge:${refKey(u.id, u.revision)}`)).map(unitBinding), affectedLessons: ids(["concept_lesson", "method_lesson", "protocol_lesson"]), affectedAssessments: ids(["assessment"]), affectedCases: ids(["case_lab"]), affectedProtocols: ids(["protocol_lesson"]), affectedGuides: ids(["guide"]), affectedStudios: ids(["studio_task"]), affectedLearningBindings: copy(affectedLearningBindings), patchProposals: unique(affectedLearningBindings.map((b) => b.assetId)).map((assetId) => ({ assetId, reason: candidate.reason, lifecycle: "pending_review" })), graph };
}
export interface KnowledgeOperationResult { ok: boolean; errors: string[]; workspace: KnowledgeWorkspace }
const failed = (w: KnowledgeWorkspace, errors: string[]): KnowledgeOperationResult => ({ ok: false, errors, workspace: w });
function appendUniqueRevisions<T extends { id: string; revision: number; hash: string }>(old: T[], added: T[]): T[] {
  const seen = new Set<string>();
  for (const x of added) { const key = refKey(x.id, x.revision); if (seen.has(key)) throw new Error(`候选重复 revision ${key}`); seen.add(key); const previous = old.find((p) => p.id === x.id && p.revision === x.revision); if (previous) throw new Error(`拒绝覆盖已有 revision ${key}`); if (old.some((p) => p.id === x.id && p.revision >= x.revision)) throw new Error(`revision 必须递增 ${x.id}`); }
  return [...old, ...copy(added)];
}
export function applyKnowledgeChange(w: KnowledgeWorkspace, candidate: KnowledgeChangeCandidate, confirmation: { reviewer: string; now: string }): KnowledgeOperationResult & { impact: KnowledgeImpact } {
  const impact = previewKnowledgeImpact(w, candidate), errors = [...impact.errors];
  if (!impact.valid || !record(candidate) || !record(confirmation)) return { ...failed(w, errors.length ? errors : ["候选或确认信息无效"]), impact };
  if (!nonempty(confirmation.reviewer) || !validDate(confirmation.now)) errors.push("需要明确操作者与有效日期；此操作仅登记更新，不代表科学批准");
  if (candidate.baseWorkspaceHash !== knowledgeWorkspaceHash(w)) errors.push("候选基础已变化，请重新预览；拒绝 stale update");
  if (candidate.lifecycle !== "pending_review" || candidate.verificationStatus !== "pending") errors.push("变更必须保持 pending_review");
  if (w.ledger.some((l) => l.changeId === candidate.id)) errors.push("该变更已经执行");
  if (w.candidates.some((c) => c.id === candidate.id && c.hash !== candidate.hash)) errors.push("已保存的候选被篡改");
  if (errors.length) return { ...failed(w, errors), impact };
  try {
    const next = copy(w);
    if (!next.candidates.some((c) => c.id === candidate.id)) next.candidates.push(copy(candidate));
    next.sources = appendUniqueRevisions(next.sources, candidate.sources);
    next.claims = appendUniqueRevisions(next.claims, candidate.claims);
    if (candidate.proposedUnit) {
      if (candidate.proposedUnit.lifecycle !== "pending_review" || candidate.proposedUnit.verificationStatus !== "pending") throw new Error("候选知识不得激活/核验");
      next.units = appendUniqueRevisions(next.units, [candidate.proposedUnit]);
    }
    const addLedger = (target: KnowledgeRevisionBinding, action: KnowledgeLedgerEntry["action"], status: KnowledgeStatus, replacement?: KnowledgeRevisionBinding) => next.ledger.push({ id: `ledger-${candidate.id}-${next.ledger.length + 1}`, changeId: candidate.id, at: confirmation.now, reason: candidate.reason, reviewer: confirmation.reviewer, action, target: copy(target), status, ...(replacement ? { replacement: copy(replacement) } : {}) });
    for (const target of impact.affectedKnowledge) {
      if (candidate.target && sameBinding(candidate.target, target) && candidate.operation === "supersede") {
        if (!candidate.proposedUnit) throw new Error("替代缺少新版本");
        addLedger(target, "supersede", "SUPERSEDED", unitBinding(candidate.proposedUnit));
      } else if (candidate.target && sameBinding(candidate.target, target) && candidate.operation === "deprecate") addLedger(target, "deprecate", "DEPRECATED");
      else if (!["SUPERSEDED", "DEPRECATED"].includes(effectiveKnowledgeStatus(w, resolveUnit(w, target)!))) addLedger(target, "review_required", "REVIEW_REQUIRED");
    }
    if (candidate.proposedUnit) addLedger(unitBinding(candidate.proposedUnit), candidate.operation === "restore" ? "restore_pending" : "candidate_added", candidate.proposedUnit.knowledgeStatus);
    for (const b of impact.affectedLearningBindings) next.holds.push({ id: `hold-${candidate.id}-${next.holds.length + 1}`, changeId: candidate.id, assetId: b.assetId, assetRevision: b.assetRevision, assetHash: b.assetHash, reason: candidate.reason, createdAt: confirmation.now, status: "REVIEW_REQUIRED" });
    const transitionErrors = assertKnowledgeTransition(w, next);
    return transitionErrors.length ? { ...failed(w, transitionErrors), impact } : { ok: true, errors: [], workspace: next, impact };
  } catch (error) { return { ...failed(w, [error instanceof Error ? error.message : "更新失败"]), impact }; }
}
export function compareKnowledgeRevisions(before: KnowledgeUnit, after: KnowledgeUnit): Array<{ field: string; before: unknown; after: unknown }> {
  const a = before as unknown as Record<string, unknown>, b = after as unknown as Record<string, unknown>;
  return unique([...Object.keys(a), ...Object.keys(b)]).filter((k) => k !== "hash" && canonicalJson(a[k] ?? null) !== canonicalJson(b[k] ?? null)).map((field) => ({ field, before: a[field], after: b[field] }));
}

export function assertKnowledgeTransition(previous: KnowledgeWorkspace, next: KnowledgeWorkspace): string[] {
  const errors = [...validateKnowledgeWorkspace(previous), ...validateKnowledgeWorkspace(next)];
  if (errors.length) return unique(errors);
  const impacts = new Map<string, KnowledgeImpact>();
  const impactFor = (c: KnowledgeChangeCandidate) => { let result = impacts.get(c.id); if (!result) { result = previewKnowledgeImpact(previous, c); impacts.set(c.id, result); } return result; };
  for (const key of ["units", "sources", "claims", "learningBindings", "projections", "candidates", "ledger", "holds", "conflicts"] as const) {
    const old = previous[key], current = next[key];
    if (current.length < old.length || old.some((x, index) => canonicalJson(x) !== canonicalJson(current[index]))) errors.push(`${key} 是追加式历史，不允许删除、重排或改写`);
  }
  for (const u of next.units.slice(previous.units.length)) if (u.lifecycle === "active" || u.verificationStatus !== "pending" || !["REVIEW_REQUIRED", "EMERGING", "UPDATE_AVAILABLE"].includes(u.knowledgeStatus)) errors.push(`${u.id}: M020 新增知识只允许待审核状态`);
  for (const c of next.claims.slice(previous.claims.length)) if (c.verificationStatus !== "pending") errors.push(`${c.id}: 新增 claim 不得自动 verified`);
  for (const s of next.sources.slice(previous.sources.length)) if (s.metadataStatus !== "pending") errors.push(`${s.id}: 新增 source 不能通过写入候选自行核验元数据`);
  for (const b of next.learningBindings.slice(previous.learningBindings.length)) if (b.legacyActive) errors.push(`${b.assetId}: 不能伪造 legacyActive 绕过审核`);
  // New revisions of known identities may only enter through their exact reviewed change.
  const revisionChanges: KnowledgeChangeCandidate[] = [];
  for (const key of ["units", "sources", "claims"] as const) for (const added of next[key].slice(previous[key].length)) {
    if (!previous[key].some((old) => old.id === added.id)) continue;
    const c = next.candidates.find((candidate) => key === "units" ? candidate.proposedUnit?.hash === added.hash : candidate[key].some((value) => value.id === added.id && value.revision === added.revision && value.hash === added.hash));
    if (!c) { errors.push(`${key} ${added.id}: 新 revision 缺少明确变更候选`); continue; }
    if (!revisionChanges.some((x) => x.id === c.id)) revisionChanges.push(c);
  }
  for (const c of revisionChanges) {
    if (c.baseWorkspaceHash !== knowledgeWorkspaceHash(previous)) errors.push(`${c.id}: 变更基础已过期`);
    const impact = impactFor(c); errors.push(...impact.errors);
    for (const b of impact.affectedLearningBindings) if (!next.holds.some((h) => h.changeId === c.id && h.assetId === b.assetId && h.assetRevision === b.assetRevision && h.assetHash === b.assetHash)) errors.push(`更新 ${c.id} 缺少下游 hold ${b.assetId}`);
    for (const r of impact.affectedKnowledge) {
      const u = resolveUnit(previous, r)!;
      if (!["SUPERSEDED", "DEPRECATED"].includes(effectiveKnowledgeStatus(previous, u)) && !next.ledger.slice(previous.ledger.length).some((l) => l.changeId === c.id && sameBinding(l.target, r) && ["review_required", "supersede", "deprecate"].includes(l.action))) errors.push(`更新 ${c.id} 缺少知识审核 ledger ${r.knowledgeUnitId}`);
    }
  }
  for (const l of next.ledger.slice(previous.ledger.length)) {
    if (!["REVIEW_REQUIRED", "SUPERSEDED", "DEPRECATED", "EMERGING", "UPDATE_AVAILABLE"].includes(l.status)) errors.push(`${l.id}: 不允许用 ledger 激活知识`);
    const candidate = next.candidates.find((c) => c.id === l.changeId);
    if (!candidate) continue;
    const impact = impactFor(candidate);
    if (!impact.valid) errors.push(...impact.errors);
    if (candidate.baseWorkspaceHash !== knowledgeWorkspaceHash(previous)) errors.push(`${candidate.id}: ledger 使用过期候选`);
    const isNew = candidate.proposedUnit && sameBinding(l.target, unitBinding(candidate.proposedUnit));
    if (isNew ? !["candidate_added", "restore_pending"].includes(l.action) : !impact.affectedKnowledge.some((b) => sameBinding(b, l.target))) errors.push(`${l.id}: ledger 目标超出候选影响范围`);
    if (l.action === "supersede" && (candidate.operation !== "supersede" || !candidate.target || !sameBinding(candidate.target, l.target) || !candidate.proposedUnit || !l.replacement || !sameBinding(l.replacement, unitBinding(candidate.proposedUnit)))) errors.push(`${l.id}: 未由明确替代操作授权`);
    if (l.action === "deprecate" && (candidate.operation !== "deprecate" || !candidate.target || !sameBinding(candidate.target, l.target))) errors.push(`${l.id}: 未由明确废弃操作授权`);
    for (const b of impact.affectedLearningBindings) if (!next.holds.some((h) => h.changeId === candidate.id && h.assetId === b.assetId && h.assetRevision === b.assetRevision && h.assetHash === b.assetHash)) errors.push(`更新 ${candidate.id} 缺少下游 hold ${b.assetId}`);
  }
  return unique(errors);
}

export function generateKnowledgeProjections(w: KnowledgeWorkspace, binding: KnowledgeRevisionBinding, types: KnowledgeProjectionType[] = [...KNOWLEDGE_PROJECTION_TYPES], now = new Date().toISOString()): KnowledgeProjection[] {
  const errors = validateKnowledgeWorkspace(w); if (errors.length) throw new Error(errors.join("；"));
  const u = resolveUnit(w, binding); if (!u) throw new Error("无法解析投影所需精确知识版本");
  if (["SUPERSEDED", "DEPRECATED"].includes(effectiveKnowledgeStatus(w, u))) throw new Error("已替代/废弃版本仅保留历史，不生成新学习候选");
  if (!validDate(now) || types.some((t) => !KNOWLEDGE_PROJECTION_TYPES.includes(t))) throw new Error("投影类型或日期无效");
  return unique(types).map((projectionType) => {
    const prefix = `kp-${u.id}-r${u.revision}-${projectionType}`;
    const prior = w.projections.filter((p) => p.id === prefix);
    const p: KnowledgeProjection = { id: prefix, revision: prior.length ? Math.max(...prior.map((p) => p.revision)) + 1 : 1, hash: "", title: `${u.title} · ${projectionType}`, projectionType, knowledgeUnitIds: [u.id], knowledgeRevisionBindings: [copy(binding)], lifecycle: "pending_review", verificationStatus: "pending", contentOrigin: "ai_generated", body: [u.scientificQuestion, ...u.preciseExplanation, ...u.boundaries].filter(nonempty), reviewGaps: unique([...u.reviewGaps, "此内容只是知识投影草案，需要教学设计、独立答案键、科学审核和迁移效度审核。", ...(["apply", "remediation", "delayed_review", "case_lab"].includes(projectionType) ? ["未生成题目、答案或评分规则；不得计能力。"] : [])]), createdAt: now, createsCompetence: false };
    p.hash = knowledgeHash(p); return p;
  });
}
export function appendKnowledgeProjections(w: KnowledgeWorkspace, projections: KnowledgeProjection[]): KnowledgeOperationResult {
  try { const next = { ...w, projections: appendUniqueRevisions(w.projections, projections) }; const errors = assertKnowledgeTransition(w, next); return errors.length ? failed(w, errors) : { ok: true, errors: [], workspace: next }; } catch (e) { return failed(w, [String(e)]); }
}
export function mergeKnowledgeMigration(w: KnowledgeWorkspace, fragment: Pick<KnowledgeWorkspace, "units" | "sources" | "claims" | "learningBindings">): KnowledgeOperationResult {
  try {
    const fresh = <T extends { id: string; revision: number; hash: string }>(old: T[], added: T[]) => added.filter((x) => !old.some((p) => p.id === x.id && p.revision === x.revision && canonicalJson(p) === canonicalJson(x)));
    const bindings = fragment.learningBindings.filter((b) => !w.learningBindings.some((old) => canonicalJson(old) === canonicalJson(b)));
    const next = { ...w, units: appendUniqueRevisions(w.units, fresh(w.units, fragment.units)), sources: appendUniqueRevisions(w.sources, fresh(w.sources, fragment.sources)), claims: appendUniqueRevisions(w.claims, fresh(w.claims, fragment.claims)), learningBindings: [...w.learningBindings, ...copy(bindings)] };
    const errors = assertKnowledgeTransition(w, next); return errors.length ? failed(w, errors) : { ok: true, errors: [], workspace: next };
  } catch (e) { return failed(w, [String(e)]); }
}

/** Local parsing only: identifier and metadata imports do not verify scientific claims. */
export function previewKnowledgeImport(w: KnowledgeWorkspace, request: KnowledgeImportRequest): KnowledgeImportPreview {
  const warnings: string[] = [], errors: string[] = [];
  let candidate: KnowledgeChangeCandidate | undefined;
  try {
    if (!record(request) || !["doi", "pmid", "metadata", "source_pack", "markdown", "json", "note"].includes(request.format) || !nonempty(request.text) || request.text.length > MAX_PACK_BYTES) throw new Error("导入格式、内容或大小无效");
    if (!validId(request.id) || !validDate(request.now) || !KNOWLEDGE_TYPES.includes(request.knowledgeType)) throw new Error("导入 ID、日期或知识类型无效");
    const provenance = (raw: unknown) => ({ createdAt: request.now, changeReason: "本地导入候选；尚未科学审核", verificationScope: "none" as const, originalPayload: raw });
    let unit = createKnowledgeTemplate(request.knowledgeType, { id: request.id, title: request.title?.trim() || "导入的待审核知识", now: request.now, contentOrigin: request.contentOrigin ?? "user" });
    let sources: KnowledgeEvidenceSource[] = [], claims: KnowledgeEvidenceClaim[] = [];
    const makeSource = (id: string, raw: Record<string, unknown>): KnowledgeEvidenceSource => {
      const existing = w.sources.filter((s) => s.id === id), revision = existing.length ? Math.max(...existing.map((s) => s.revision)) + 1 : 1;
      const source: KnowledgeEvidenceSource = { id, revision, hash: "", title: text(raw.title) ? raw.title : "待核对的来源元数据", metadataStatus: "pending", contentOrigin: "user", provenance: { ...provenance(raw), originalId: id, ...(positive(raw.revision) ? { originalRevision: Number(raw.revision) } : {}) }, ...(text(raw.doi) ? { doi: raw.doi } : {}), ...(text(raw.pmid) ? { pmid: raw.pmid } : {}), ...(text(raw.url) ? { url: raw.url } : {}), ...(text(raw.version) ? { version: raw.version } : {}) };
      source.hash = knowledgeHash(source); return source;
    };
    if (request.format === "doi" || request.format === "pmid") {
      const identifier = request.format === "doi" ? request.text.trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "").toLowerCase() : request.text.trim().replace(/^pmid:?\s*/i, "");
      if (request.format === "doi" ? !/^10\.\d{4,9}\/\S+$/i.test(identifier) : !/^\d{1,12}$/.test(identifier)) throw new Error("DOI/PMID 标识格式无效");
      sources = [makeSource(`source-${request.id}`, { title: request.title || identifier, [request.format]: identifier })];
      warnings.push("仅识别标识符，未联网核验元数据、全文或任何科学主张。");
      unit.provenance.originalPayload = request.text;
    } else if (request.format === "source_pack") {
      const parsed = parseSourcePackJsonSafe(request.text);
      if (!parsed.ok || !parsed.doc) throw new Error(parsed.failure?.message ?? "源包解析失败");
      const validation = validateSourcePackUnknown(parsed.doc);
      if (validation.errors.length) throw new Error(validation.errors.join("；"));
      warnings.push(...validation.warnings, "源包原始审核状态仅保留在 provenance；所有新记录强制 pending，协议未知字段保留缺口。");
      sources = parsed.doc.sources.map((s) => makeSource(s.id, s as unknown as Record<string, unknown>));
      claims = parsed.doc.evidenceClaims.map((raw) => {
        const source = sources.find((s) => s.id === raw.sourceId); if (!source) throw new Error(`主张来源 ${raw.sourceId} 缺失`);
        const existing = w.claims.filter((c) => c.id === raw.id), revision = existing.length ? Math.max(...existing.map((c) => c.revision)) + 1 : 1;
        const claim: KnowledgeEvidenceClaim = { id: raw.id, revision, hash: "", statement: raw.claim, sourceBindings: [{ sourceId: source.id, revision: source.revision, hash: source.hash }], verificationStatus: "pending", contentOrigin: "user", provenance: provenance(raw) };
        claim.hash = knowledgeHash(claim); return claim;
      });
      unit.provenance.originalPayload = parsed.doc;
      unit.reviewGaps.push("源包需逐条知识映射；原 problem/diagnostic/transfer 数据未自动认定为完整协议。");
    } else if (request.format === "json" || request.format === "metadata") {
      const raw: unknown = JSON.parse(request.text); if (!record(raw)) throw new Error("JSON/metadata 必须是对象");
      if (request.format === "json" && "knowledgeType" in raw) {
        if (!validHash(raw.hash) || raw.hash !== knowledgeHash(raw)) throw new Error("导入知识原始哈希不匹配");
        if (!["draft", "pending_review", "active", "archived"].includes(String(raw.lifecycle)) || !["pending", "verified"].includes(String(raw.verificationStatus))) throw new Error("导入知识状态枚举无效");
        const safe = { ...raw, lifecycle: "pending_review", verificationStatus: "pending", knowledgeStatus: "REVIEW_REQUIRED", hash: "" };
        safe.hash = knowledgeHash(safe);
        const rawErrors = validateKnowledgeUnit(safe); if (rawErrors.length) throw new Error(rawErrors.join("；"));
        unit = copy(safe as unknown as KnowledgeUnit);
        unit.provenance = { ...provenance(raw), originalId: unit.id, originalRevision: unit.revision, originalHash: String(raw.hash) };
        unit.id = request.id;
      } else {
        if ("hash" in raw && raw.hash !== knowledgeHash(raw)) throw new Error("导入 metadata 哈希不匹配");
        sources = [makeSource(`source-${request.id}`, raw)];
        unit.provenance.originalPayload = raw;
        if (!request.title && nonempty(raw.title)) unit.title = raw.title;
        warnings.push("元数据候选不构成 claim verification；未自动生成支持关系。");
      }
    } else {
      const parsed = request.format === "markdown" ? parseMarkdownFrontmatter(request.text) : { fields: {}, body: request.text };
      const fields = parsed.fields as Record<string, string>;
      if (!request.title && fields.title) unit.title = fields.title;
      unit.preciseExplanation = [parsed.body];
      unit.provenance.originalPayload = request.text;
      unit.reviewGaps.push("自由文本尚未拆分为可核验主张；原文不能代替逐主张来源审核。");
    }
    // A source pack has explicit claim rows; no new claims are inferred from citations alone.
    if (claims.length) unit.evidenceLinks = claims.map((c) => ({ claimId: c.id, revision: c.revision, hash: c.hash, supportMode: "supplemental" as const }));
    unit.hash = knowledgeHash(unit);
    const changeType = request.changeType ?? (request.target ? "UPDATE" : "NEW");
    const operation = changeType === "SUPERSESSION" ? "supersede" : changeType === "DEPRECATION" ? "deprecate" : request.target ? "revise" : "create";
    candidate = proposeKnowledgeChange(w, { id: `import-${request.id}-${knowledgeHash(request).slice(-12)}`, now: request.now, reason: `导入 ${request.format} 候选，需人工审核`, operation, changeType, target: request.target, ...(operation !== "deprecate" ? { unit } : {}), sources, claims });
  } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  const impact = candidate && !errors.length ? previewKnowledgeImpact(w, candidate) : emptyImpact(errors);
  errors.push(...impact.errors.filter((e) => !errors.includes(e)));
  const preview: KnowledgeImportPreview = { valid: !errors.length, errors, warnings, request: copy(request), ...(candidate ? { candidate } : {}), impact, hash: "" };
  preview.hash = knowledgeHash(preview); return preview;
}
export function commitKnowledgeImport(w: KnowledgeWorkspace, preview: KnowledgeImportPreview): KnowledgeOperationResult {
  if (!record(preview) || preview.hash !== knowledgeHash(preview) || !preview.valid || !preview.candidate) return failed(w, ["导入预览无效或被篡改"]);
  const candidate = preview.candidate, errors = [...candidateErrors(candidate), ...previewKnowledgeImpact(w, candidate).errors];
  if (candidate.baseWorkspaceHash !== knowledgeWorkspaceHash(w)) errors.push("导入预览已过期，请重新预览");
  if (w.candidates.some((c) => c.id === candidate.id)) errors.push("候选已存在，拒绝重复导入");
  if (errors.length) return failed(w, unique(errors));
  const next = { ...w, candidates: [...w.candidates, copy(candidate)] }, transition = assertKnowledgeTransition(w, next);
  return transition.length ? failed(w, transition) : { ok: true, errors: [], workspace: next };
}
