import { invoke } from "@tauri-apps/api/core";
import type { AppStateData, AIProvider } from "../domain/types";

export const isTauri = (): boolean => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const browserStateKey = "researchos-browser-state-v1";
const transientKeys = new Map<string, string>();

export async function loadPersistedState(): Promise<unknown | null> {
  if (isTauri()) return invoke<unknown | null>("load_state");
  const raw = localStorage.getItem(browserStateKey);
  return raw ? JSON.parse(raw) as unknown : null;
}

export async function savePersistedState(state: AppStateData): Promise<void> {
  if (isTauri()) {
    await invoke("save_state", { payload: state });
    return;
  }
  localStorage.setItem(browserStateKey, JSON.stringify(state));
}

export async function setProviderKey(providerId: string, apiKey: string): Promise<void> {
  if (isTauri()) {
    await invoke("secure_set_api_key", { providerId, apiKey });
    return;
  }
  transientKeys.set(providerId, apiKey);
}

export async function getProviderKey(providerId: string): Promise<string | null> {
  if (isTauri()) return invoke<string | null>("secure_get_api_key", { providerId });
  return transientKeys.get(providerId) ?? null;
}

export async function deleteProviderKey(providerId: string): Promise<void> {
  if (isTauri()) {
    await invoke("secure_delete_api_key", { providerId });
    return;
  }
  transientKeys.delete(providerId);
}

export async function testProvider(provider: AIProvider): Promise<{ ok: boolean; status: number }> {
  if (!isTauri()) throw new Error("模型服务连接测试只能在桌面版中运行。");
  const apiKey = await getProviderKey(provider.id);
  return invoke("test_ai_provider", { provider: { ...provider, apiKey } });
}

export async function requestAiReview(provider: AIProvider, prompt: string, evidence: string): Promise<string> {
  if (!isTauri()) throw new Error("浏览器预览中无法使用 AI 评议，内置专家参考仍可使用。");
  const apiKey = await getProviderKey(provider.id);
  return invoke<string>("ai_review", { provider: { ...provider, apiKey }, prompt, evidence });
}

export interface EvidenceVerificationResult {
  kind: "pmid" | "doi";
  identifier: string;
  title?: string;
  journal?: string;
  published?: unknown;
  doi?: string;
  verificationStatus: "verified";
  verifiedAt: string;
  source: string;
}

export async function verifyEvidence(kind: "pmid" | "doi", identifier: string): Promise<EvidenceVerificationResult> {
  if (!isTauri()) throw new Error("证据核验只能在桌面版中运行，可继续离线使用并保持待核验状态。");
  return invoke("verify_evidence", { kind, identifier });
}

export interface DatabaseHealth {
  ok: boolean;
  integrity: string;
  path: string;
  schemaVersion: number;
  recoverySnapshots?: number;
  journalMode?: string;
}

export async function databaseHealth(): Promise<DatabaseHealth> {
  if (!isTauri()) return { ok: true, integrity: "browser-preview", path: "localStorage preview", schemaVersion: 2, recoverySnapshots: 0, journalMode: "localStorage" };
  return invoke("database_health");
}

export async function exportBackup(destination: string): Promise<string> {
  if (!isTauri()) throw new Error("导出 SQLite 备份需要桌面版。");
  return invoke("export_backup", { destination });
}

export async function importBackup(source: string): Promise<void> {
  if (!isTauri()) throw new Error("导入 SQLite 备份需要桌面版。");
  return invoke("import_backup", { source });
}
