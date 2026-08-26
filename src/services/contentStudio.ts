import type {
  ContentConflict,
  ContentFieldDiff,
  ContentPatchPack,
  ContentPatchPreview,
  ContentRevisionRecord,
  ParsedPatchPack,
  PersonalContentEntry,
  PersonalContentValidationReport,
  PortableContentRecord,
  ReviewPack,
} from "../domain/contentStudio";
import { validateSafeRelativePath } from "./safePaths";

const MAX_PATCH_JSON_BYTES = 200_000;
const PATCH_TARGET_KINDS: ReadonlySet<string> = new Set(["evidence-source", "evidence-claim", "method", "pattern", "judgment-card", "audit-case", "problem-card"]);
/** Patch packs may only ever produce draft or pending_review material. */
const PATCH_ALLOWED_LIFECYCLES: ReadonlySet<string> = new Set(["draft", "pending_review"]);

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}

// Browser-safe synchronous SHA-256. The output is tested against published known vectors.
export function sha256(value: unknown): string {
  const text = typeof value === "string" ? value : canonicalJson(value);
  const bytes = new TextEncoder().encode(text);
  const bitLength = bytes.length * 8;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const data = new Uint8Array(paddedLength);
  data.set(bytes);
  data[bytes.length] = 0x80;
  const view = new DataView(data.buffer);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  const k = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  for (let offset = 0; offset < data.length; offset += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(7,w[i-15]) ^ rotr(18,w[i-15]) ^ (w[i-15] >>> 3);
      const s1 = rotr(17,w[i-2]) ^ rotr(19,w[i-2]) ^ (w[i-2] >>> 10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0;
    }
    let [a,b,c,d,e,f,g,hh] = h;
    for (let i = 0; i < 64; i += 1) {
      const s1 = rotr(6,e) ^ rotr(11,e) ^ rotr(25,e);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + s1 + ch + k[i] + w[i]) >>> 0;
      const s0 = rotr(2,a) ^ rotr(13,a) ^ rotr(22,a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) >>> 0;
      hh=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    h[0]=(h[0]+a)>>>0; h[1]=(h[1]+b)>>>0; h[2]=(h[2]+c)>>>0; h[3]=(h[3]+d)>>>0;
    h[4]=(h[4]+e)>>>0; h[5]=(h[5]+f)>>>0; h[6]=(h[6]+g)>>>0; h[7]=(h[7]+hh)>>>0;
  }
  return `sha256:${h.map((part) => part.toString(16).padStart(8,"0")).join("")}`;
}

export const contentKey = (kind: string, id: string): string => `${kind}:${id}`;

export function validatePersonalContent(entry: PersonalContentEntry): string[] {
  const errors: string[] = [];
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(entry.id)) errors.push("内容 ID 格式无效");
  if (!entry.title.trim()) errors.push("标题不能为空");
  if (!isRecord(entry.payload)) errors.push("内容必须是对象");
  if (entry.lifecycle === "draft" && entry.activeForLearning) errors.push("草稿不能进入学习系统");
  if (["archived","deprecated","superseded"].includes(entry.lifecycle) && entry.activeForLearning) errors.push("归档或停用内容不能进入学习系统");
  if (entry.contentOrigin === "ai_generated" && entry.verificationStatus === "verified") errors.push("AI 生成内容不能自行标记为已核验");
  if (entry.risk === "HIGH" && entry.lifecycle === "active" && entry.verificationStatus !== "verified" && !entry.activeForLearning) {
    errors.push("高风险内容只有在明确私人启用时才能保持待核验并激活");
  }
  if (entry.hash !== sha256(entry.payload)) errors.push("内容哈希不匹配");
  return errors;
}

export function resolveEffectiveContent(base: PortableContentRecord[], personal: PersonalContentEntry[]): PortableContentRecord[] {
  const resolved = new Map(base.map((item) => [item.key, item]));
  for (const item of personal) {
    // Only explicitly active content may replace the base. Draft, pending,
    // archived, deprecated and superseded items never leak into learning,
    // search or publishing surfaces.
    if (item.lifecycle !== "active" || !item.activeForLearning) continue;
    const key = item.baseKey ?? contentKey(item.kind, item.id);
    resolved.set(key, {
      key, id: item.id, kind: item.kind, title: item.title, owner: item.baseKey ? "overlay" : "personal",
      revision: item.revision, hash: item.hash, contentOrigin: item.contentOrigin,
      verificationStatus: item.verificationStatus, risk: item.risk,
      dependencyKeys: [...item.dependencyKeys], payload: structuredClone(item.payload),
    });
  }
  return [...resolved.values()].sort((a,b) => a.key.localeCompare(b.key));
}

/** Structural, non-scientific starter payloads per supported kind. Values stay empty by design. */
export const KIND_TEMPLATES: Record<string, Record<string, unknown>> = {
  "evidence-source": { sourceName: "", sourceType: "", year: null },
  "evidence-claim": { claim: "", scope: "", qualification: "" },
  method: { coreConcept: "", domain: "", explanation: "" },
  pattern: { scientificQuestion: "", failureModes: [] },
  "judgment-card": { claim: "", domain: "", study: "" },
  "audit-case": { task: "", domain: "", context: "" },
  "problem-card": { observation: "", context: "", claimBoundary: "" },
};

export function duplicatePersonalEntry(source: PersonalContentEntry, newId: string, now = new Date()): PersonalContentEntry {
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(newId)) throw new Error("副本 ID 格式无效");
  const payload = structuredClone(source.payload);
  payload.id = newId;
  return {
    ...source,
    id: newId,
    title: `${source.title}（副本）`,
    lifecycle: "draft",
    activeForLearning: false,
    revision: 1,
    hash: sha256(payload),
    baseKey: undefined,
    baseRevision: undefined,
    baseHash: undefined,
    verificationStatus: "pending",
    dependencyKeys: [...source.dependencyKeys],
    payload,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/**
 * Stages a personal revision of a built-in object as a versioned overlay.
 * The built-in baseline stays read-only; the overlay keeps the original key,
 * revision and hash so upgrades can detect divergence.
 */
export function createOverlayFromBuiltin(record: PortableContentRecord, overlayId: string, now = new Date()): PersonalContentEntry {
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(overlayId)) throw new Error("overlay ID 格式无效");
  const payload = structuredClone(record.payload);
  return {
    id: overlayId,
    kind: record.kind,
    title: `${record.title}（个人修订）`,
    lifecycle: "draft",
    activeForLearning: false,
    revision: 1,
    hash: sha256(payload),
    baseKey: record.key,
    baseRevision: record.revision,
    baseHash: record.hash,
    contentOrigin: "user",
    verificationStatus: "pending",
    risk: record.risk,
    dependencyKeys: [...record.dependencyKeys],
    payload,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/**
 * Deterministic upgrade-conflict detection: an overlay whose recorded base
 * hash/revision no longer matches the current built-in catalog gets an open
 * `base_update` conflict instead of a silent winner.
 */
export function detectBaseUpdateConflicts(personal: PersonalContentEntry[], inventory: PortableContentRecord[], now = new Date()): ContentConflict[] {
  const byKey = new Map(inventory.map((item) => [item.key, item]));
  const conflicts: ContentConflict[] = [];
  for (const entry of [...personal].sort((a,b) => a.id.localeCompare(b.id))) {
    if (!entry.baseKey || entry.baseRevision === undefined || !entry.baseHash) continue;
    const currentBase = byKey.get(entry.baseKey);
    if (!currentBase) continue;
    if (currentBase.hash === entry.baseHash && currentBase.revision === entry.baseRevision) continue;
    conflicts.push({
      id: `base-update-${entry.id}`,
      contentId: entry.id,
      kind: "base_update",
      expectedHash: entry.baseHash,
      actualHash: currentBase.hash,
      detail: `应用升级后基础内容已变化（${entry.baseKey} 现为 r${currentBase.revision}）；个人修订 r${entry.revision} 需要人工审阅是否仍然适用。`,
      status: "open",
      createdAt: now.toISOString(),
    });
  }
  return conflicts;
}

export function diffPayloads(before: Record<string, unknown>, after: Record<string, unknown>): ContentFieldDiff[] {
  const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...fields].sort().filter((field) => canonicalJson(before[field]) !== canonicalJson(after[field])).map((field) => ({ field, before: before[field], after: after[field] }));
}

export function validatePersonalContentDetailed(entry: PersonalContentEntry, context: { inventory: PortableContentRecord[]; personal: PersonalContentEntry[] }): PersonalContentValidationReport {
  const errors = [...validatePersonalContent(entry)];
  const warnings: string[] = [];
  const evidenceGaps: PersonalContentValidationReport["evidenceGaps"] = [];
  const knownKeys = new Set(context.inventory.map((item) => item.key));
  for (const sibling of context.personal) {
    if (sibling.id === entry.id && sibling.kind === entry.kind) continue;
    if (sibling.lifecycle === "active") knownKeys.add(sibling.baseKey ?? contentKey(sibling.kind, sibling.id));
    if (sibling.dependencyKeys.includes(contentKey(entry.kind, entry.id))) {
      warnings.push(`个人内容“${sibling.title}”依赖此项；修改会影响其依赖闭包。`);
    }
  }
  for (const dependencyKey of entry.dependencyKeys) {
    if (!knownKeys.has(dependencyKey)) evidenceGaps.push({ dependencyKey, reason: "依赖的证据来源或内容不存在或尚未启用" });
  }
  if (entry.payload.id !== entry.id) errors.push("载荷中的 id 与内容 ID 不一致");
  if (typeof entry.payload.title === "string" && entry.payload.title !== entry.title) warnings.push("载荷标题与内容标题不一致");
  const duplicateId = context.personal.some((sibling) => sibling.id === entry.id && sibling.kind === entry.kind ? false : sibling.id === entry.id);
  if (duplicateId) errors.push("存在相同 ID 的其他类型内容，容易造成引用歧义");
  const dependencyImpact: PersonalContentValidationReport["dependencyImpact"] = [];
  for (const sibling of context.personal) {
    if (sibling.id === entry.id && sibling.kind === entry.kind) continue;
    if (sibling.dependencyKeys.includes(contentKey(entry.kind, entry.id))) {
      dependencyImpact.push({ key: contentKey(sibling.kind, sibling.id), title: sibling.title, relation: "个人依赖" });
    }
  }
  for (const record of context.inventory) {
    if (record.dependencyKeys.includes(contentKey(entry.kind, entry.id))) {
      dependencyImpact.push({ key: record.key, title: record.title, relation: "内置依赖" });
    }
  }
  dependencyImpact.sort((a,b) => a.key.localeCompare(b.key));
  return {
    contentId: entry.id,
    kind: entry.kind,
    lifecycle: entry.lifecycle,
    errors,
    warnings,
    evidenceGaps,
    dependencyImpact,
    entersLearning: entry.lifecycle === "active" && entry.activeForLearning,
  };
}

/** Strict ISO-8601 instant: date, T, time with seconds, optional fractional part, Z or ±HH:MM. */
const ISO_8601_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/;

/** True only when the wall-clock fields are a real calendar date/time and the
 * timezone offset stays inside the RFC3339 mechanical bounds (hour 00..23,
 * minute 00..59). Real-world zone limits are intentionally not narrower; this
 * contract is the deterministic mechanical bound stated in the tests. */
function isValidIsoInstant(value: string): boolean {
  const match = ISO_8601_PATTERN.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute, second, fraction, offset] = match;
  if (offset !== "Z") {
    const offsetHour = Number(offset.slice(1, 3));
    const offsetMinute = Number(offset.slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) return false;
  }
  const milliseconds = fraction ? Number(fraction.padEnd(3, "0")) : 0;
  // Interpret the wall-clock fields as UTC and read them back: nonexistent
  // dates like 2026-02-29 or 2026-04-31 roll over and stop matching. The
  // stated offset does not affect calendar validity.
  const asUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), milliseconds);
  if (Number.isNaN(asUtc)) return false;
  const rounded = new Date(asUtc);
  return rounded.getUTCFullYear() === Number(year)
    && rounded.getUTCMonth() === Number(month) - 1
    && rounded.getUTCDate() === Number(day)
    && rounded.getUTCHours() === Number(hour)
    && rounded.getUTCMinutes() === Number(minute)
    && rounded.getUTCSeconds() === Number(second);
}

/** Total parser over untrusted patch-pack JSON; never throws, bounded input, strict schema. */
export function parsePatchPackJson(text: string): ParsedPatchPack {
  const errors: string[] = [];
  if (typeof text !== "string" || text.trim().length === 0) return { ok: false, errors: ["修订包内容为空"] };
  if (text.length > MAX_PATCH_JSON_BYTES) return { ok: false, errors: [`修订包超过 ${MAX_PATCH_JSON_BYTES} 字节上限`] };
  let value: unknown;
  try { value = JSON.parse(text); } catch (error) { return { ok: false, errors: [`JSON 解析失败：${String(error)}`] }; }
  if (!isRecord(value)) return { ok: false, errors: ["修订包必须是 JSON 对象"] };
  if (value.patchSchemaVersion !== 1) errors.push("不支持的修订包版本");
  for (const field of ["patchId", "targetId", "reason", "createdAt"] as const) {
    if (typeof value[field] !== "string" || !(value[field] as string).trim()) errors.push(`缺少字段：${field}`);
  }
  if (typeof value.targetKind !== "string" || !PATCH_TARGET_KINDS.has(value.targetKind)) errors.push("未知的修订目标类型");
  // Scientific gate: a patch is review material and may only propose draft/pending_review + pending.
  if (typeof value.proposedLifecycle !== "string" || !PATCH_ALLOWED_LIFECYCLES.has(value.proposedLifecycle)) errors.push("修订包只能产生草稿或待审核状态");
  if (value.proposedVerificationStatus !== "pending") errors.push("修订包不能改变核验状态；核验只能由记录复核人与证据范围的专用审核门产生");
  if (typeof value.baseRevision !== "number" || !Number.isInteger(value.baseRevision) || value.baseRevision < 1) errors.push("缺少有效的 baseRevision");
  if (typeof value.baseHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(value.baseHash)) errors.push("缺少有效的 baseHash（sha256:…）");
  if (typeof value.createdAt !== "string" || !isValidIsoInstant(value.createdAt)) errors.push("createdAt 必须是真实存在的 ISO-8601 时间（例如 2026-08-26T08:00:00Z 或 +08:00 偏移）");
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(String(value.patchId ?? ""))) errors.push("patchId 格式无效");
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/i.test(String(value.targetId ?? ""))) errors.push("targetId 格式无效");
  if (!isRecord(value.changes) || Object.keys(value.changes).length === 0) errors.push("changes 必须是非空对象");
  else {
    const serialized = JSON.stringify(value.changes);
    if (serialized.length > 100_000) errors.push("changes 超过 100 KB 上限");
    const keys = Object.keys(value.changes);
    if (keys.length > 50) errors.push("changes 字段数量超过 50 个上限");
    // Every key is validated — no early exit.
    for (const key of keys) {
      if (!key.trim()) { errors.push("changes 存在空字段名"); break; }
    }
  }
  if (value.reviewer !== undefined && typeof value.reviewer !== "string") errors.push("reviewer 必须是字符串");
  if (value.evidenceChanges !== undefined && (!Array.isArray(value.evidenceChanges) || value.evidenceChanges.some((entry) => typeof entry !== "string"))) errors.push("evidenceChanges 必须是字符串数组");
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    patch: {
      patchSchemaVersion: 1,
      patchId: String(value.patchId),
      targetId: String(value.targetId),
      targetKind: value.targetKind as ContentPatchPack["targetKind"],
      baseRevision: value.baseRevision as number,
      baseHash: String(value.baseHash),
      changes: value.changes as Record<string, unknown>,
      reason: String(value.reason),
      reviewer: typeof value.reviewer === "string" ? value.reviewer : undefined,
      evidenceChanges: Array.isArray(value.evidenceChanges) ? value.evidenceChanges.map(String) : undefined,
      proposedLifecycle: value.proposedLifecycle as ContentPatchPack["proposedLifecycle"],
      proposedVerificationStatus: "pending",
      createdAt: String(value.createdAt),
    },
  };
}

export function createDraft(input: Pick<PersonalContentEntry,"id"|"kind"|"title"|"payload"|"risk"> & Partial<Pick<PersonalContentEntry,"baseKey"|"baseRevision"|"baseHash"|"dependencyKeys"|"contentOrigin">>, now = new Date()): PersonalContentEntry {
  const payload = structuredClone(input.payload);
  return {
    id: input.id, kind: input.kind, title: input.title, lifecycle: "draft", activeForLearning: false,
    revision: 1, hash: sha256(payload), baseKey: input.baseKey, baseRevision: input.baseRevision,
    baseHash: input.baseHash, contentOrigin: input.contentOrigin ?? "user", verificationStatus: "pending",
    risk: input.risk, dependencyKeys: [...(input.dependencyKeys ?? [])], payload,
    createdAt: now.toISOString(), updatedAt: now.toISOString(),
  };
}

export function previewPatch(patch: ContentPatchPack, target: PersonalContentEntry): ContentPatchPreview {
  const errors: string[] = [];
  if (patch.patchSchemaVersion !== 1) errors.push("不支持的修订包版本");
  if (patch.targetId !== target.id || patch.targetKind !== target.kind) errors.push("修订目标不匹配");
  if (!patch.reason.trim()) errors.push("修订原因不能为空");
  // Scientific gate: patches are review material only. They can never set a
  // lifecycle outside draft/pending_review and can never claim verification.
  if (!PATCH_ALLOWED_LIFECYCLES.has(patch.proposedLifecycle)) errors.push("修订包只能产生草稿或待审核状态");
  if (patch.proposedVerificationStatus !== "pending") errors.push("修订包不能改变核验状态；核验只能由记录复核人与证据范围的专用审核门产生");
  const stale = patch.baseRevision !== target.revision || patch.baseHash !== target.hash;
  if (stale) errors.push("修订包基线已过期");
  const nextPayload = { ...target.payload, ...patch.changes };
  const fieldDiffs = diffPayloads(target.payload, nextPayload);
  if (!fieldDiffs.length) errors.push("修订包没有产生内容变化");
  return { valid: errors.length === 0, stale, errors, targetId: target.id, currentRevision: target.revision, nextRevision: target.revision + 1, fieldDiffs, affectedDependencyKeys: [...target.dependencyKeys] };
}

export function applyPatchTransaction(entries: PersonalContentEntry[], history: ContentRevisionRecord[], conflicts: ContentConflict[], patch: ContentPatchPack, now = new Date()): { entries: PersonalContentEntry[]; history: ContentRevisionRecord[]; conflicts: ContentConflict[]; applied: PersonalContentEntry } {
  const target = entries.find((entry) => entry.id === patch.targetId && entry.kind === patch.targetKind);
  if (!target) throw new Error("修订目标不存在");
  // Fail closed on any promotion attempt before touching state.
  if (!PATCH_ALLOWED_LIFECYCLES.has(patch.proposedLifecycle)) throw new Error("修订包只能产生草稿或待审核状态");
  if (patch.proposedVerificationStatus !== "pending") throw new Error("修订包不能改变核验状态；核验只能由专用审核门产生");
  const preview = previewPatch(patch, target);
  if (!preview.valid) throw new Error(preview.errors.join("；"));
  const snapshot: ContentRevisionRecord = { id: `${target.id}@${target.revision}`, contentId: target.id, revision: target.revision, hash: target.hash, lifecycle: target.lifecycle, payload: structuredClone(target.payload), reason: patch.reason, reviewer: patch.reviewer, createdAt: now.toISOString() };
  const payload = { ...structuredClone(target.payload), ...structuredClone(patch.changes) };
  const applied: PersonalContentEntry = {
    ...target,
    payload,
    hash: sha256(payload),
    revision: target.revision + 1,
    lifecycle: patch.proposedLifecycle,
    activeForLearning: false,
    verificationStatus: "pending",
    updatedAt: now.toISOString(),
  };
  return { entries: entries.map((entry) => entry === target ? applied : entry), history: [snapshot, ...history], conflicts, applied };
}

export function rollbackRevision(entries: PersonalContentEntry[], history: ContentRevisionRecord[], contentId: string, revision: number, reason: string, now = new Date()): { entries: PersonalContentEntry[]; history: ContentRevisionRecord[]; restored: PersonalContentEntry } {
  const current = entries.find((entry) => entry.id === contentId);
  const prior = history.find((entry) => entry.contentId === contentId && entry.revision === revision);
  if (!current || !prior) throw new Error("找不到可恢复的历史版本");
  const currentSnapshot: ContentRevisionRecord = { id: `${current.id}@${current.revision}`, contentId: current.id, revision: current.revision, hash: current.hash, lifecycle: current.lifecycle, payload: structuredClone(current.payload), reason, createdAt: now.toISOString(), supersedesRevision: revision };
  const payload = structuredClone(prior.payload);
  const restored: PersonalContentEntry = { ...current, payload, hash: sha256(payload), revision: current.revision + 1, lifecycle: "pending_review", activeForLearning: false, verificationStatus: "pending", updatedAt: now.toISOString() };
  return { entries: entries.map((entry) => entry === current ? restored : entry), history: [currentSnapshot, ...history], restored };
}

export function buildReviewPack(selectedKeys: string[], inventory: PortableContentRecord[], batchId: string, now = new Date()): ReviewPack {
  const byKey = new Map(inventory.map((item) => [item.key, item]));
  const included = new Set<string>();
  const visit = (key: string, stack: string[]) => {
    if (stack.includes(key)) throw new Error(`依赖环：${[...stack,key].join(" -> ")}`);
    if (included.has(key)) return;
    const item = byKey.get(key);
    if (!item) throw new Error(`缺少内容或依赖：${key}`);
    included.add(key);
    item.dependencyKeys.forEach((dependency) => visit(dependency, [...stack,key]));
  };
  [...new Set(selectedKeys)].sort().forEach((key) => visit(key, []));
  const content = [...included].sort().map((key) => structuredClone(byKey.get(key)!));
  const dependencies = Object.fromEntries(content.map((item) => [item.key, [...item.dependencyKeys].sort()]));
  const reviewCopy = content.map((item) => `## ${item.title}\n\n- ID: ${item.key}\n- Revision: ${item.revision}\n- Status: ${item.verificationStatus}\n- Risk: ${item.risk}\n- Hash: ${item.hash}\n\n\`\`\`json\n${JSON.stringify(item.payload,null,2)}\n\`\`\``).join("\n\n");
  const scientificChangeset = content.filter((item) => item.risk !== "LOW").map((item) => `- ${item.key} | ${item.risk} | ${item.verificationStatus} | ${item.hash}`).join("\n") || "- No MEDIUM/HIGH scientific content selected.";
  return { manifest: { schemaVersion: 1, batchId, createdAt: now.toISOString(), selectedKeys: [...new Set(selectedKeys)].sort(), includedKeys: content.map((item) => item.key), hashes: Object.fromEntries(content.map((item) => [item.key,item.hash])) }, content, dependencies, reviewCopy, scientificChangeset };
}

export interface InventoryAudit {
  ok: boolean;
  totalRecords: number;
  duplicates: Array<{ key: string; count: number }>;
  hashMismatches: Array<{ key: string; expected: string; actual: string }>;
  provenanceGaps: Array<{ key: string; field: string }>;
  missingDependencies: Array<{ key: string; dependencyKey: string }>;
  dependencyCycles: string[][];
}

const HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;
const RISKS: ReadonlySet<string> = new Set(["LOW", "MEDIUM", "HIGH"]);

/** Deterministic duplicate/hash/provenance/dependency audit over an arbitrary inventory. */
export function auditContentInventory(inventory: PortableContentRecord[]): InventoryAudit {
  const counts = new Map<string, number>();
  for (const item of inventory) counts.set(item.key, (counts.get(item.key) ?? 0) + 1);
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([key, count]) => ({ key, count })).sort((a,b) => a.key.localeCompare(b.key));
  const firstByKey = new Map<string, PortableContentRecord>();
  for (const item of inventory) if (!firstByKey.has(item.key)) firstByKey.set(item.key, item);

  const hashMismatches: InventoryAudit["hashMismatches"] = [];
  const provenanceGaps: InventoryAudit["provenanceGaps"] = [];
  const missingDependencies: InventoryAudit["missingDependencies"] = [];
  for (const key of [...firstByKey.keys()].sort()) {
    const item = firstByKey.get(key)!;
    const actualHash = sha256(item.payload);
    if (actualHash !== item.hash) hashMismatches.push({ key, expected: item.hash, actual: actualHash });
    if (!item.id.trim()) provenanceGaps.push({ key, field: "id" });
    if (!item.title.trim()) provenanceGaps.push({ key, field: "title" });
    if (typeof item.contentOrigin !== "string" || !item.contentOrigin.trim()) provenanceGaps.push({ key, field: "contentOrigin" });
    if (typeof item.verificationStatus !== "string" || !item.verificationStatus.trim()) provenanceGaps.push({ key, field: "verificationStatus" });
    if (!RISKS.has(item.risk)) provenanceGaps.push({ key, field: "risk" });
    if (!Number.isInteger(item.revision) || item.revision < 1) provenanceGaps.push({ key, field: "revision" });
    if (!HASH_PATTERN.test(item.hash)) provenanceGaps.push({ key, field: "hash" });
    for (const dependency of item.dependencyKeys) {
      if (!firstByKey.has(dependency)) missingDependencies.push({ key, dependencyKey: dependency });
    }
  }
  missingDependencies.sort((a,b) => a.key.localeCompare(b.key) || a.dependencyKey.localeCompare(b.dependencyKey));

  // Deterministic cycle detection over the deduplicated graph.
  const dependencyCycles: string[][] = [];
  const seenCycles = new Set<string>();
  const state = new Map<string, 0 | 1 | 2>();
  const visit = (key: string, stack: string[]) => {
    const mark = state.get(key) ?? 0;
    if (mark === 1) {
      const cycle = stack.slice(stack.indexOf(key));
      const signature = [...cycle].sort().join("\u0000");
      if (!seenCycles.has(signature)) { seenCycles.add(signature); dependencyCycles.push(cycle); }
      return;
    }
    if (mark === 2) return;
    state.set(key, 1);
    const item = firstByKey.get(key);
    if (item) for (const dependency of [...item.dependencyKeys].sort()) {
      if (firstByKey.has(dependency)) visit(dependency, [...stack, key]);
    }
    state.set(key, 2);
  };
  for (const key of [...firstByKey.keys()].sort()) visit(key, []);
  dependencyCycles.sort((a,b) => a.join("|").localeCompare(b.join("|")));

  return {
    ok: duplicates.length === 0 && hashMismatches.length === 0 && provenanceGaps.length === 0 && missingDependencies.length === 0 && dependencyCycles.length === 0,
    totalRecords: inventory.length,
    duplicates, hashMismatches, provenanceGaps, missingDependencies, dependencyCycles,
  };
}

export const REVIEW_PACK_FILE_NAMES = ["manifest.json", "content.json", "REVIEW_COPY.md", "SCIENTIFIC_CHANGESET.md", "dependencies.json"] as const;

export interface ReviewPackFileEntry {
  path: string;
  content: string;
}

/**
 * Materializes a review pack as exactly five deterministic file entries.
 * Callers must still run `validateSafeRelativePath`/destination gates before writing.
 */
export function reviewPackFileEntries(pack: ReviewPack): ReviewPackFileEntry[] {
  const entries: ReviewPackFileEntry[] = [
    { path: REVIEW_PACK_FILE_NAMES[0], content: `${JSON.stringify(pack.manifest, null, 2)}\n` },
    { path: REVIEW_PACK_FILE_NAMES[1], content: `${JSON.stringify(pack.content, null, 2)}\n` },
    { path: REVIEW_PACK_FILE_NAMES[2], content: `# 审核副本 · ${pack.manifest.batchId}\n\n${pack.reviewCopy}\n` },
    { path: REVIEW_PACK_FILE_NAMES[3], content: `# 科学变更清单（待审核）\n\n${pack.scientificChangeset}\n` },
    { path: REVIEW_PACK_FILE_NAMES[4], content: `${JSON.stringify(pack.dependencies, null, 2)}\n` },
  ];
  for (const entry of entries) validateSafeRelativePath(entry.path);
  return entries;
}
