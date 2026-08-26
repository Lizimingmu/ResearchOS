import type {
  ContentConflict,
  ContentFieldDiff,
  ContentPatchPack,
  ContentPatchPreview,
  ContentRevisionRecord,
  PersonalContentEntry,
  PortableContentRecord,
  ReviewPack,
} from "../domain/contentStudio";

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
    if (item.lifecycle === "draft" || item.lifecycle === "pending_review" || item.lifecycle === "archived") continue;
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
  const stale = patch.baseRevision !== target.revision || patch.baseHash !== target.hash;
  if (stale) errors.push("修订包基线已过期");
  if (patch.proposedVerificationStatus === "verified" && target.contentOrigin === "ai_generated") errors.push("AI 生成内容不能通过修订包自行核验");
  const nextPayload = { ...target.payload, ...patch.changes };
  const fields = new Set([...Object.keys(target.payload), ...Object.keys(nextPayload)]);
  const fieldDiffs: ContentFieldDiff[] = [...fields].filter((field) => canonicalJson(target.payload[field]) !== canonicalJson(nextPayload[field])).map((field) => ({ field, before: target.payload[field], after: nextPayload[field] }));
  if (!fieldDiffs.length) errors.push("修订包没有产生内容变化");
  return { valid: errors.length === 0, stale, errors, targetId: target.id, currentRevision: target.revision, nextRevision: target.revision + 1, fieldDiffs, affectedDependencyKeys: [...target.dependencyKeys] };
}

export function applyPatchTransaction(entries: PersonalContentEntry[], history: ContentRevisionRecord[], conflicts: ContentConflict[], patch: ContentPatchPack, now = new Date()): { entries: PersonalContentEntry[]; history: ContentRevisionRecord[]; conflicts: ContentConflict[]; applied: PersonalContentEntry } {
  const target = entries.find((entry) => entry.id === patch.targetId && entry.kind === patch.targetKind);
  if (!target) throw new Error("修订目标不存在");
  const preview = previewPatch(patch, target);
  if (!preview.valid) throw new Error(preview.errors.join("；"));
  const snapshot: ContentRevisionRecord = { id: `${target.id}@${target.revision}`, contentId: target.id, revision: target.revision, hash: target.hash, lifecycle: target.lifecycle, payload: structuredClone(target.payload), reason: patch.reason, reviewer: patch.reviewer, createdAt: now.toISOString() };
  const payload = { ...structuredClone(target.payload), ...structuredClone(patch.changes) };
  const proposedLifecycle = patch.proposedLifecycle === "active" && patch.proposedVerificationStatus !== "verified" ? "pending_review" : patch.proposedLifecycle;
  const applied: PersonalContentEntry = { ...target, payload, hash: sha256(payload), revision: target.revision + 1, lifecycle: proposedLifecycle, activeForLearning: proposedLifecycle === "active", verificationStatus: patch.proposedVerificationStatus, updatedAt: now.toISOString() };
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
