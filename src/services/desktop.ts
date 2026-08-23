import { invoke } from "@tauri-apps/api/core";
import type { AppStateData, AIProvider } from "../domain/types";

export const isTauri = (): boolean => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const browserStateKey = "researchos-browser-state-v1";
const transientKeys = new Map<string, string>();

export async function loadPersistedState(): Promise<AppStateData | null> {
  if (isTauri()) return invoke<AppStateData | null>("load_state");
  const raw = localStorage.getItem(browserStateKey);
  return raw ? JSON.parse(raw) as AppStateData : null;
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
  if (!isTauri()) throw new Error("Provider connection tests run in the desktop build.");
  const apiKey = await getProviderKey(provider.id);
  return invoke("test_ai_provider", { provider: { ...provider, apiKey } });
}

export async function requestAiReview(provider: AIProvider, prompt: string, evidence: string): Promise<string> {
  if (!isTauri()) throw new Error("AI review is unavailable in browser preview. Seed senior review remains available.");
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
  if (!isTauri()) throw new Error("Evidence verification runs in the desktop build. Continue offline with status pending.");
  return invoke("verify_evidence", { kind, identifier });
}

export async function databaseHealth(): Promise<{ ok: boolean; integrity: string; path: string; schemaVersion: number }> {
  if (!isTauri()) return { ok: true, integrity: "browser-preview", path: "localStorage preview", schemaVersion: 1 };
  return invoke("database_health");
}

export async function exportBackup(destination: string): Promise<string> {
  if (!isTauri()) throw new Error("SQLite backup export requires the desktop build.");
  return invoke("export_backup", { destination });
}

export async function importBackup(source: string): Promise<void> {
  if (!isTauri()) throw new Error("SQLite backup import requires the desktop build.");
  return invoke("import_backup", { source });
}

