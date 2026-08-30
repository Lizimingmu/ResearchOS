// Shared deterministic path-safety gates for explicit exports and curated Obsidian publishing.
// Every filesystem-writing feature must pass through these validators before any write happens.

const WINDOWS_ABSOLUTE = /^[a-zA-Z]:[\\/]/;
const RESERVED_WINDOWS_NAMES = new Set(["con", "prn", "aux", "nul", "com1", "com2", "com3", "com4", "lpt1", "lpt2", "lpt3"]);
export const MAX_RELATIVE_PATH_LENGTH = 200;
export const MAX_RELATIVE_PATH_DEPTH = 8;

export class UnsafePathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafePathError";
  }
}

/** Normalizes separators for comparison without touching the filesystem. */
export function normalizePathForComparison(input: string): string {
  return input.replace(/[\\/]+/g, "/").replace(/\/+$/, "");
}

/**
 * Validates a relative path used for an explicit export or publish target.
 * Throws UnsafePathError on absolute paths, traversal, `.obsidian`, control
 * characters, reserved Windows names, oversized paths or unsafe segments.
 * Returns the normalized forward-slash form.
 */
export function validateSafeRelativePath(input: string): string {
  if (typeof input !== "string" || input.trim().length === 0) throw new UnsafePathError("路径不能为空");
  const normalized = normalizePathForComparison(input);
  if (normalized.length > MAX_RELATIVE_PATH_LENGTH) throw new UnsafePathError(`路径过长：${normalized.length} 字符`);
  if (normalized.startsWith("/")) throw new UnsafePathError("不允许绝对路径");
  if (WINDOWS_ABSOLUTE.test(normalized)) throw new UnsafePathError("不允许盘符或绝对路径");
  if (/^[\\/]{2}/.test(input)) throw new UnsafePathError("不允许 UNC 网络路径");
  if (/[\u0000-\u001f\u007f]/.test(normalized)) throw new UnsafePathError("路径包含控制字符");
  const segments = normalized.split("/");
  if (segments.length > MAX_RELATIVE_PATH_DEPTH) throw new UnsafePathError(`路径层级过深：${segments.length}`);
  for (const segment of segments) {
    if (segment.length === 0) throw new UnsafePathError("路径包含空片段");
    if (segment === "." || segment === "..") throw new UnsafePathError("不允许路径遍历片段");
    if (segment.toLowerCase() === ".obsidian") throw new UnsafePathError(".obsidian 目录受保护，禁止访问");
    if (segment.endsWith(".") || segment.endsWith(" ")) throw new UnsafePathError("Windows 片段不能以点或空格结尾");
    if (RESERVED_WINDOWS_NAMES.has(segment.split(".")[0].toLowerCase())) throw new UnsafePathError(`保留设备名：${segment}`);
  }
  return normalized;
}

function comparableAbsolute(input: string): string {
  return normalizePathForComparison(input).toLowerCase();
}

/** True when `candidate` is the vault root itself or lives anywhere inside it. */
export function isInsideRoot(candidate: string, root: string): boolean {
  const candidateKey = comparableAbsolute(candidate);
  const rootKey = comparableAbsolute(root);
  if (rootKey.length === 0) return false;
  return candidateKey === rootKey || candidateKey.startsWith(`${rootKey}/`);
}

/**
 * Validates an explicit export destination chosen by the user.
 * The default policy keeps review packs outside any configured Obsidian vault.
 */
export function validateExportDestination(destination: string, vaultRoot?: string): void {
  if (typeof destination !== "string" || destination.trim().length === 0) throw new UnsafePathError("导出目标目录不能为空");
  if (!WINDOWS_ABSOLUTE.test(normalizePathForComparison(destination)) && !normalizePathForComparison(destination).startsWith("/")) {
    throw new UnsafePathError("导出目标必须是绝对目录");
  }
  if (vaultRoot && isInsideRoot(destination, vaultRoot)) {
    throw new UnsafePathError("审核包默认保存在 Obsidian 库之外；请选择库外的目标目录");
  }
}
