import type {
  AppliedPublishFingerprint,
  ContentFieldDiff,
  ContentKind,
  ContentPatchPack,
  ContentPatchPreview,
  ObsidianPublishAction,
  ObsidianPublishBatch,
  ObsidianPublishItem,
  PortableContentRecord,
  ReviewBatchManifest,
} from "../domain/contentStudio";
import { canonicalJson, sha256 } from "./contentStudio";
import { normalizePathForComparison, UnsafePathError, validateSafeRelativePath } from "./safePaths";

export const MANAGED_START = "<!-- researchos:managed:start -->";
export const MANAGED_END = "<!-- researchos:managed:end -->";
export const USER_SECTION_HEADING = "## 我的笔记";
export const DEFAULT_NOTE_LIMIT = 20;
const MAX_TITLE_FILENAME = 60;

const KIND_LABELS: Record<string, string> = {
  "evidence-source": "证据来源", "evidence-claim": "证据主张", method: "方法", pattern: "论文模式",
  "judgment-card": "判断卡", "audit-case": "审稿案例", "problem-card": "问题卡",
};

export interface ParsedObsidianNote {
  frontmatter: Record<string, string> | null;
  managedInner: string | null;
  /** Everything after the MANAGED_END marker, byte-for-byte as it exists on disk. */
  userTail: string;
}

/** Byte-preserving structural split of an existing note. Never throws. Tolerates CRLF. */
export function parseObsidianNote(text: string): ParsedObsidianNote {
  const empty: ParsedObsidianNote = { frontmatter: null, managedInner: null, userTail: "" };
  if (typeof text !== "string") return empty;
  let rest = text;
  let frontmatter: Record<string, string> | null = null;
  const openingMatch = rest.match(/^---\r?\n/);
  if (openingMatch) {
    const closingMatch = rest.slice(openingMatch[0].length).match(/\r?\n---\r?\n/);
    if (closingMatch && typeof closingMatch.index === "number") {
      frontmatter = {};
      for (const line of rest.slice(openingMatch[0].length, openingMatch[0].length + closingMatch.index).split(/\r?\n/)) {
        const sep = line.indexOf(":");
        if (sep <= 0) continue;
        frontmatter[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
      }
      rest = rest.slice(openingMatch[0].length + closingMatch.index + closingMatch[0].length);
    }
  }
  const startIndex = rest.indexOf(MANAGED_START);
  const endIndex = rest.indexOf(MANAGED_END);
  if (startIndex < 0 || endIndex < startIndex) return { frontmatter, managedInner: null, userTail: rest };
  const innerStart = startIndex + MANAGED_START.length;
  const managedRaw = rest.slice(innerStart, endIndex).replace(/^\r?\n/, "").replace(/\r?\n$/, "");
  // Hash against normalized line endings so an external CRLF rewrite of the
  // same content is not mistaken for a managed-block edit.
  const managedInner = normalizeEol(managedRaw);
  // The whole unmanaged suffix is preserved verbatim — including its exact
  // leading newline characters — so updates can splice it back unchanged.
  const userTail = rest.slice(endIndex + MANAGED_END.length);
  return { frontmatter, managedInner, userTail };
}

const normalizeEol = (value: string): string => value.replace(/\r\n/g, "\n");

export function publishedStatusFor(record: PortableContentRecord): string {
  if (record.owner === "builtin") return "builtin";
  return record.verificationStatus === "verified" ? "user_reviewed" : "user_pending";
}

/**
 * Deterministic managed body. It intentionally contains no timestamps so an
 * unchanged revision always renders byte-identical managed content.
 */
export function renderManagedBody(record: PortableContentRecord): string {
  const statusText = record.verificationStatus === "verified" ? "已核验" : "待核验（ResearchOS 不将未核验内容标记为已核验）";
  return [
    `# ${record.title}`,
    "",
    `- 类型：${KIND_LABELS[record.kind] ?? record.kind}`,
    `- 稳定 ID：\`${record.id}\``,
    `- 版本：r${record.revision}`,
    "- 核验状态：" + statusText,
    "- 来源：" + (record.owner === "builtin" ? "ResearchOS 内置目录" : "个人内容"),
    "",
    "```json",
    JSON.stringify(record.payload, null, 2),
    "```",
  ].join("\n");
}

function renderFrontmatter(record: PortableContentRecord, publishedAtIso: string): string {
  return [
    "---",
    `researchos_id: ${record.id}`,
    `researchos_kind: ${record.kind}`,
    `researchos_revision: ${record.revision}`,
    `researchos_status: ${publishedStatusFor(record)}`,
    `researchos_hash: ${record.hash}`,
    `researchos_published_at: ${publishedAtIso}`,
    "---",
  ].join("\n");
}

export function renderFullNote(record: PortableContentRecord, publishedAtIso: string, userTail = ""): string {
  return `${renderFrontmatter(record, publishedAtIso)}\n${MANAGED_START}\n${renderManagedBody(record)}\n${MANAGED_END}\n${USER_SECTION_HEADING}\n\n${userTail}`;
}

export function safeNoteFileName(title: string, id: string): string {
  const cleaned = title
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, MAX_TITLE_FILENAME)
    .trim();
  const base = cleaned || id;
  try {
    return validateSafeRelativePath(`${base}.md`);
  } catch (error) {
    if (error instanceof UnsafePathError) return validateSafeRelativePath(`${id}.md`);
    throw error;
  }
}

export interface PublishPlan {
  batchId: string;
  createdAt: string;
  items: ObsidianPublishItem[];
  createCount: number;
  updateCount: number;
  unchangedCount: number;
  conflictCount: number;
  writeCount: number;
  requiresSecondConfirmation: boolean;
  confirmationToken: string;
}

export interface PublishPlanInput {
  batchId: string;
  records: PortableContentRecord[];
  /** relativePath -> exact current file bytes observed inside the dedicated subfolder. */
  existingFiles: Map<string, string>;
  /** Most recent applied publishes first; used as the last-known managed hash. */
  appliedHistory: AppliedPublishFingerprint[];
  now: Date;
}

/**
 * Pure planner: computes the exact create/update/conflict/unchanged operations
 * for a candidate batch without touching the filesystem.
 * - Files are located by stable `researchos_id`, never inferred from the title.
 * - A managed section edited outside ResearchOS produces a conflict, not a merge.
 */
export function planPublishBatch(input: PublishPlanInput): PublishPlan {
  const byKey = new Map(input.records.map((record) => [record.key, record]));
  const sortedKeys = [...byKey.keys()].sort();
  const items: ObsidianPublishItem[] = [];
  const publishedAtIso = input.now.toISOString();

  const filesById = new Map<string, Array<{ path: string; contents: string }>>();
  for (const [path, contents] of [...input.existingFiles.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const id = parseObsidianNote(contents).frontmatter?.researchos_id;
    if (!id) continue;
    const bucket = filesById.get(id) ?? [];
    bucket.push({ path, contents });
    filesById.set(id, bucket);
  }

  for (const key of sortedKeys) {
    const record = structuredClone(byKey.get(key)!);
    const candidates = filesById.get(record.id) ?? [];
    // Duplicate stable IDs across existing notes are ambiguous: refuse to pick a winner.
    if (candidates.length > 1) {
      items.push({
        contentId: record.id,
        contentKey: record.key,
        contentKind: record.kind,
        revision: record.revision,
        hash: record.hash,
        title: record.title,
        relativePath: candidates[0].path,
        markdown: renderFullNote(record, publishedAtIso),
        previousContents: null,
        action: "conflict",
        detail: `存在 ${candidates.length} 个携带同一稳定 ID 的现有笔记；请先人工处理重复后再发布`,
      });
      continue;
    }
    // Rename tracking: the first note carrying this stable ID wins over title-derived names.
    const found = candidates[0];
    const defaultPath = safeNoteFileName(record.title, record.id);
    const targetPath = found ? found.path : defaultPath;
    const rendered = renderFullNote(record, publishedAtIso);
    const expectedManagedHash = sha256(renderManagedBody(record));
    const base: Omit<ObsidianPublishItem, "action"> = {
      contentId: record.id,
      contentKey: record.key,
      contentKind: record.kind,
      revision: record.revision,
      hash: record.hash,
      title: record.title,
      relativePath: targetPath,
      markdown: rendered,
      previousContents: found ? found.contents : null,
    };
    if (!found) {
      items.push({ ...base, action: "create", detail: "新建永久笔记" });
      continue;
    }
    const parsed = parseObsidianNote(found.contents);
    if (parsed.frontmatter?.researchos_id !== record.id) {
      items.push({ ...base, action: "conflict", detail: "目标文件身份不一致，拒绝写入" });
      continue;
    }
    if (parsed.managedInner == null) {
      items.push({ ...base, action: "conflict", detail: "受管块缺失或标记被改动；拒绝覆盖" });
      continue;
    }
    const actualManagedHash = sha256(parsed.managedInner);
    if (found.contents === rendered) {
      items.push({ ...base, action: "unchanged", detail: "内容与上次发布完全一致，不写文件" });
      continue;
    }
    const frontmatterUnchanged = parsed.frontmatter?.researchos_hash === record.hash && parsed.frontmatter?.researchos_revision === String(record.revision);
    if (actualManagedHash === expectedManagedHash) {
      items.push({
        ...base,
        action: frontmatterUnchanged ? "unchanged" : "update",
        detail: frontmatterUnchanged ? "仅用户区或时间戳不同；保持零写入以保护手写内容" : "更新受管块，保留用户区字节",
      });
      continue;
    }
    const prior = input.appliedHistory.find((entry) => entry.contentId === record.id);
    if (prior && actualManagedHash === prior.managedHash) {
      items.push({ ...base, action: "update", detail: `从 r${prior.revision} 更新受管块，保留用户区字节` });
      continue;
    }
    items.push({
      ...base,
      action: "conflict",
      detail: prior ? "受管块在上次发布后被外部修改；请先解决冲突" : "已存在同名稳定 ID 的外部笔记且受管内容未知；拒绝覆盖",
    });
  }

  const createCountBefore = () => items.filter((item) => item.action === "create").length;

  // Duplicate output paths from different contents must never reach the write
  // transaction: mark every member of a colliding path group as a conflict.
  const byPath = new Map<string, ObsidianPublishItem[]>();
  for (const item of items) {
    const key = normalizePathForComparison(item.relativePath).toLowerCase();
    const bucket = byPath.get(key) ?? [];
    bucket.push(item);
    byPath.set(key, bucket);
  }
  for (const bucket of byPath.values()) {
    if (bucket.length <= 1) continue;
    for (const item of bucket) {
      item.action = "conflict";
      item.detail = "不同内容产生了相同的输出路径（同标题）；请修改标题或先处理重复后再发布";
    }
  }
  void createCountBefore;

  const createCount = items.filter((item) => item.action === "create").length;
  const updateCount = items.filter((item) => item.action === "update").length;
  const unchangedCount = items.filter((item) => item.action === "unchanged").length;
  const conflictCount = items.filter((item) => item.action === "conflict").length;
  const writeCount = createCount + updateCount;
  const requiresSecondConfirmation = writeCount > DEFAULT_NOTE_LIMIT;
  const confirmationToken = sha256(canonicalJson({
    batchId: input.batchId,
    operations: items.map((item) => [item.relativePath, item.action ?? "draft", item.hash]),
  }));
  return { batchId: input.batchId, createdAt: publishedAtIso, items, createCount, updateCount, unchangedCount, conflictCount, writeCount, requiresSecondConfirmation, confirmationToken };
}

export class PublishApplyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublishApplyError";
  }
}

export interface PlannedWrite {
  relativePath: string;
  contents: string;
  /** Exact bytes that must currently exist on disk (`null` = file must not exist). */
  expectedExisting: string | null;
}

/**
 * Pure applier: turns a confirmed plan into exact filesystem writes.
 * Conflicts, wrong tokens, missing second confirmation or missing previews abort everything.
 */
export function applyPlannedBatch(plan: PublishPlan, options: { confirmationToken: string; secondConfirmed: boolean }): PlannedWrite[] {
  if (!options.confirmationToken || options.confirmationToken !== plan.confirmationToken) throw new PublishApplyError("确认令牌不匹配；批次未预览或已被更改");
  if (plan.conflictCount > 0) throw new PublishApplyError(`存在 ${plan.conflictCount} 个冲突；冲突未解决前整批零写入`);
  if (plan.requiresSecondConfirmation && !options.secondConfirmed) throw new PublishApplyError(`本批超过 ${DEFAULT_NOTE_LIMIT} 条笔记，需要第二次明确确认`);
  const writes: PlannedWrite[] = [];
  for (const item of plan.items.sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
    validateSafeRelativePath(item.relativePath);
    if (item.action === "unchanged" || item.action === "conflict") continue;
    let contents = item.markdown;
    if (item.action === "update" && typeof item.previousContents === "string") {
      const parsed = parseObsidianNote(item.previousContents);
      // Rebuild ResearchOS-owned regions deterministically and splice back the
      // ENTIRE unmanaged suffix byte-for-byte.
      const headAndManaged = item.markdown.split(MANAGED_END)[0];
      const frontmatter = headAndManaged.split(MANAGED_START)[0];
      const managedPart = headAndManaged.split(MANAGED_START)[1] ?? "";
      contents = `${frontmatter}${MANAGED_START}${managedPart}${MANAGED_END}${parsed.userTail}`;
    }
    writes.push({ relativePath: item.relativePath, contents, expectedExisting: item.previousContents ?? null });
  }
  return writes;
}

/** Fingerprint recorded after a successful apply so future plans can prove provenance. */
export function fingerprintWrites(plan: PublishPlan): AppliedPublishFingerprint[] {
  return plan.items
    .filter((item) => item.action === "create" || item.action === "update")
    .map((item) => ({
      contentId: item.contentId,
      revision: item.revision,
      managedHash: sha256(item.markdown.split(MANAGED_START)[1]?.split(MANAGED_END)[0]?.replace(/^\r?\n/, "").replace(/\r?\n$/, "") ?? ""),
      appliedAt: plan.createdAt,
    }))
    .sort((a, b) => a.contentId.localeCompare(b.contentId));
}

export interface PersistedBatchShape {
  id: string;
  status: ObsidianPublishBatch["status"];
  items: ObsidianPublishItem[];
  confirmationToken?: string;
  createdAt: string;
  requiresSecondConfirmation?: boolean;
}

/** Reconstructs a plannable shape from a persisted previewed batch. */
export function planFromPersistedBatch(batch: PersistedBatchShape): PublishPlan {
  const count = (action: ObsidianPublishAction) => batch.items.filter((item) => item.action === action).length;
  const createCount = count("create");
  const updateCount = count("update");
  return {
    batchId: batch.id,
    createdAt: batch.createdAt,
    items: batch.items,
    createCount,
    updateCount,
    unchangedCount: count("unchanged"),
    conflictCount: count("conflict"),
    writeCount: createCount + updateCount,
    requiresSecondConfirmation: Boolean(batch.requiresSecondConfirmation),
    confirmationToken: batch.confirmationToken ?? "",
  };
}

// ---------------------------------------------------------------------------
// Optional finite review round trip (M015-05). No watcher, no automatic pull.
// ---------------------------------------------------------------------------

export const REVIEW_FOLDER = "_Review";
export const REVIEW_ANNOTATION_HEADING = "## 审核意见";
const REVIEW_ANNOTATION_PROMPT = "（请在本节下方写下审核意见；不要修改受管块。）";

export interface ReviewRoundTrip {
  manifestPath: string;
  manifestJson: string;
  manifest: ReviewBatchManifest;
  files: Array<{ relativePath: string; contents: string }>;
}

/** Builds the finite review batch: exactly one manifest plus its listed notes under `_Review/<batch-id>/`. */
export function buildReviewRoundTrip(batchId: string, records: PortableContentRecord[], now = new Date()): ReviewRoundTrip {
  if (!/^[a-z0-9][a-z0-9._-]{2,60}$/i.test(batchId)) throw new UnsafePathError("审核批次 ID 格式无效");
  const createdAt = now.toISOString();
  const files: ReviewRoundTrip["files"] = [];
  const notes: ReviewBatchManifest["notes"] = [];
  const usedPaths = new Set<string>();
  const pathKey = (path: string): string => normalizePathForComparison(path).toLowerCase();
  for (const record of [...records].sort((a, b) => a.key.localeCompare(b.key))) {
    // Deterministic disambiguation when two contents share a title. The
    // stable content ID is appended with SUFFIX-AWARE truncation: the title
    // part reserves room for the ID/counter marker, so identical over-long
    // titles can never truncate the marker away and loop forever.
    let relativePath = validateSafeRelativePath(`${REVIEW_FOLDER}/${batchId}/${safeNoteFileName(record.title, record.id)}`);
    if (usedPaths.has(pathKey(relativePath))) {
      const stemWithExtension = safeNoteFileName(record.title, record.id);
      const stemBase = stemWithExtension.slice(0, -".md".length);
      const idMarker = `-${record.id}`;
      const counterStart = 2;
      const candidateFor = (counter: number): string => {
        const numericSuffix = counter > counterStart ? `-${counter}` : "";
        const marker = `${idMarker}${numericSuffix}`;
        const allowance = Math.max(1, MAX_TITLE_FILENAME - marker.length);
        const trimmedStem = stemBase.slice(0, Math.min(stemBase.length, allowance));
        return validateSafeRelativePath(`${REVIEW_FOLDER}/${batchId}/${trimmedStem}${marker}.md`);
      };
      let counter = counterStart;
      relativePath = candidateFor(counter);
      while (usedPaths.has(pathKey(relativePath))) {
        counter += 1;
        relativePath = candidateFor(counter);
      }
    }
    usedPaths.add(pathKey(relativePath));
    const body = `${renderFullNote(record, createdAt)}${REVIEW_ANNOTATION_HEADING}\n${REVIEW_ANNOTATION_PROMPT}\n`;
    const managedHash = sha256(renderManagedBody(record));
    files.push({ relativePath, contents: body });
    notes.push({ relativePath, contentId: record.id, kind: record.kind, revision: record.revision, hash: record.hash, managedHash });
  }
  const manifest: ReviewBatchManifest = { schemaVersion: 1, batchId, createdAt, notes };
  const manifestPath = validateSafeRelativePath(`${REVIEW_FOLDER}/${batchId}/manifest.json`);
  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  return { manifestPath, manifestJson, manifest, files };
}

export interface ReviewFeedbackEntry {
  relativePath: string;
  contentId: string;
  annotations: string[];
  managedEdited: boolean;
  contents: string;
}

/**
 * Reads back ONLY the paths listed in the exact exported manifest.
 * Any extra or missing path fails closed. Pure function over already-read entries.
 */
export function parseReviewFeedback(entries: Array<{ relativePath: string; contents: string | null }>, manifest: ReviewBatchManifest): ReviewFeedbackEntry[] {
  const expected = new Map(manifest.notes.map((note) => [note.relativePath, note]));
  const seen = new Set<string>();
  for (const entry of entries) {
    const path = normalizePathForComparison(entry.relativePath);
    if (!expected.has(path)) throw new Error(`清单之外的路径被拒绝读取：${entry.relativePath}`);
    seen.add(path);
    const note = expected.get(path)!;
    if (entry.contents == null) throw new Error(`清单中的文件缺失：${path}`);
    const parsed = parseObsidianNote(entry.contents);
    if (parsed.frontmatter?.researchos_id !== note.contentId || parsed.frontmatter?.researchos_hash !== note.hash) {
      throw new Error(`文件身份与清单不符：${path}`);
    }
  }
  for (const path of expected.keys()) {
    if (!seen.has(path)) throw new Error(`清单中的文件未被读取：${path}`);
  }
  return manifest.notes.map((note) => {
    const contents = entries.find((entry) => normalizePathForComparison(entry.relativePath) === note.relativePath)!.contents!;
    const parsed = parseObsidianNote(contents);
    const annotationStart = contents.indexOf(REVIEW_ANNOTATION_HEADING);
    const annotations = annotationStart >= 0
      ? contents.slice(annotationStart + REVIEW_ANNOTATION_HEADING.length).split("\n").map((line) => line.trim()).filter((line) => line.length > 0 && line !== REVIEW_ANNOTATION_PROMPT)
      : [];
    const managedEdited = parsed.managedInner == null || sha256(parsed.managedInner) !== note.managedHash;
    return { relativePath: note.relativePath, contentId: note.contentId, annotations, managedEdited, contents };
  });
}

export interface ReviewPatchCandidate {
  targetId: string;
  targetKind: ContentKind;
  patch: ContentPatchPack;
  preview: ContentPatchPreview;
  source: "annotation" | "managed_edit";
  summary: string;
  /** Present when the candidate targets a NEW overlay of a built-in object. */
  overlayBase?: { key: string; id: string; kind: ContentKind };
}

/**
 * Converts review feedback into pending patch candidates with dry-run diffs.
 * Built-in objects are never modified in place: their candidates target a
 * `overlay-<id>` personal overlay that must be staged before applying.
 * Candidates are never verified and never auto-applied.
 */
export function toReviewPatchCandidates(feedback: ReviewFeedbackEntry[], targets: PortableContentRecord[], now = new Date()): ReviewPatchCandidate[] {
  const candidates: ReviewPatchCandidate[] = [];
  for (const entry of feedback) {
    const target = targets.find((record) => record.id === entry.contentId);
    if (!target) continue;
    const isBuiltin = target.owner === "builtin";
    const patchTargetId = isBuiltin ? `overlay-${target.id}` : target.id;
    const baseRevision = isBuiltin ? target.revision : target.revision;
    const baseHash = target.hash;
    const base: Omit<ContentPatchPack, "changes" | "reason" | "patchId"> = {
      patchSchemaVersion: 1,
      targetId: patchTargetId,
      targetKind: target.kind,
      baseRevision,
      baseHash,
      proposedLifecycle: "pending_review",
      proposedVerificationStatus: "pending",
      createdAt: now.toISOString(),
    };
    const dryRun = (changes: Record<string, unknown>): { preview: ContentPatchPreview } => ({
      preview: {
        valid: true,
        stale: false,
        errors: [],
        targetId: patchTargetId,
        currentRevision: baseRevision,
        nextRevision: baseRevision + 1,
        fieldDiffs: diffAgainst(target.payload, changes),
        affectedDependencyKeys: [...target.dependencyKeys],
      },
    });
    if (entry.annotations.length > 0) {
      const changes = { 审核意见: entry.annotations.join("\n") };
      const reason = isBuiltin ? `Obsidian 审核意见导入（内置对象个人修订，待审核）` : "Obsidian 审核意见导入（待审核）";
      const candidate: ReviewPatchCandidate = { targetId: patchTargetId, targetKind: target.kind, source: "annotation", summary: `${entry.annotations.length} 条意见`, ...dryRun(changes), patch: { ...base, patchId: `review-${entry.contentId}-notes-${now.getTime().toString(36)}`, changes, reason, reviewer: "obsidian-review" } };
      if (isBuiltin) candidate.overlayBase = { key: target.key, id: target.id, kind: target.kind };
      candidates.push(candidate);
    }
    if (entry.managedEdited) {
      const extracted = extractPayloadFromManaged(entry.contents);
      if (extracted && canonicalJson(extracted) !== canonicalJson(target.payload)) {
        const reason = isBuiltin ? "受管块在 Obsidian 中被修订（内置对象个人修订，待审核）" : "受管块在 Obsidian 中被修订（待审核）";
        const candidate: ReviewPatchCandidate = { targetId: patchTargetId, targetKind: target.kind, source: "managed_edit", summary: "受管块内容被修改", ...dryRun(extracted as Record<string, unknown>), patch: { ...base, patchId: `review-${entry.contentId}-managed-${now.getTime().toString(36)}`, changes: extracted as Record<string, unknown>, reason, reviewer: "obsidian-review" } };
        if (isBuiltin) candidate.overlayBase = { key: target.key, id: target.id, kind: target.kind };
        candidates.push(candidate);
      }
    }
  }
  return candidates.sort((a, b) => a.targetId.localeCompare(b.targetId) || a.source.localeCompare(b.source));
}

function diffAgainst(payload: Record<string, unknown>, changes: Record<string, unknown>): ContentFieldDiff[] {
  const nextPayload = { ...structuredClone(payload), ...structuredClone(changes) };
  const fields = new Set([...Object.keys(payload), ...Object.keys(nextPayload)]);
  return [...fields].filter((field) => canonicalJson(payload[field]) !== canonicalJson(nextPayload[field]))
    .sort().map((field) => ({ field, before: payload[field], after: nextPayload[field] }));
}

/** Extracts the mechanical JSON payload embedded in a managed block, if any. */
export function extractPayloadFromManaged(noteContents: string): Record<string, unknown> | null {
  const managed = parseObsidianNote(noteContents).managedInner;
  if (!managed) return null;
  const fence = managed.indexOf("```json");
  if (fence < 0) return null;
  const start = managed.indexOf("\n", fence) + 1;
  const end = managed.indexOf("```", start);
  if (start <= 0 || end < 0) return null;
  try {
    const value = JSON.parse(managed.slice(start, end));
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
