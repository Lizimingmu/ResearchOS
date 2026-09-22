import type { ContentConflict, PersonalContentEntry } from "../domain/contentStudio";
import type { KnowledgeWorkspace } from "../domain/knowledge";
import { sha256 } from "./contentStudio";

/** Explicit base keys only. Scientific text/title similarity is not a dependency. */
export function knowledgeOverlayConflicts(previous: KnowledgeWorkspace, next: KnowledgeWorkspace, overlays: PersonalContentEntry[], existing: ContentConflict[]): ContentConflict[] {
  const result = [...existing];
  const oldIds = new Set(previous.ledger.map((item) => item.id));
  for (const entry of next.ledger.filter((item) => !oldIds.has(item.id) && item.action !== "candidate_added")) {
    const target = previous.units.find((item) => item.id === entry.target.knowledgeUnitId && item.revision === entry.target.revision && item.hash === entry.target.hash);
    if (!target) continue;
    const raw = target.provenance.originalPayload as { kernelUnit?: { id?: string }; lesson?: { unitId?: string } } | undefined;
    const explicitIds = new Set([target.id, target.provenance.originalId, raw?.kernelUnit?.id, raw?.lesson?.unitId].filter(Boolean));
    for (const overlay of overlays) {
      if (!overlay.baseKey) continue;
      const baseId = overlay.baseKey.slice(overlay.baseKey.indexOf(":") + 1);
      if (!explicitIds.has(baseId)) continue;
      const id = `knowledge-overlay-${sha256(`${overlay.id}:${entry.id}`).slice(7, 31)}`;
      if (result.some((conflict) => conflict.id === id)) continue;
      result.push({ id, contentId: overlay.id, kind: "base_update", expectedHash: overlay.baseHash,
        actualHash: entry.replacement?.hash ?? entry.target.hash,
        detail: `基础知识 ${target.title} r${target.revision} 发生 ${entry.action}；个人覆盖层必须重新审核，未自动合并。${entry.reason}`,
        status: "open", createdAt: entry.at });
    }
  }
  return result;
}
