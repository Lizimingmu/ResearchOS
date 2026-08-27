import { auditCases } from "../data/auditCases";
import { evidenceSources } from "../data/evidence";
import { judgmentCards } from "../data/judgmentCards";
import { methodConcepts } from "../data/methods";
import { problemAtlasClaims, problemAtlasSources, problemCards } from "../data/problemAtlas";
import { researchPatterns } from "../data/patterns";
import { learningUnits } from "../data/learningUnits";
import type { ContentKind, PortableContentRecord, ScientificRisk } from "../domain/contentStudio";
import { contentKey, sha256 } from "./contentStudio";

const sourceDependencies = (value: Record<string, unknown>): string[] => Array.isArray(value.sourceIds) ? value.sourceIds.map((id) => contentKey("evidence-source", String(id))) : [];
const riskFor = (kind: ContentKind): ScientificRisk => kind === "evidence-source" ? "LOW" : kind === "pattern" || kind === "audit-case" ? "MEDIUM" : "HIGH";

function record(kind: ContentKind, value: Record<string, unknown>, dependencyKeys: string[] = []): PortableContentRecord {
  const id = String(value.id);
  const title = String(value.title ?? value.titleCn ?? value.claim ?? id);
  return {
    key: contentKey(kind,id), id, kind, title, owner: "builtin", revision: 1,
    hash: sha256(value), contentOrigin: (value.contentOrigin as PortableContentRecord["contentOrigin"]) ?? "verified_seed",
    verificationStatus: (value.verificationStatus as PortableContentRecord["verificationStatus"]) ?? "pending",
    risk: riskFor(kind), dependencyKeys: [...new Set(dependencyKeys)].sort(), payload: structuredClone(value),
  };
}

export function buildBaseContentInventory(): PortableContentRecord[] {
  const rows: PortableContentRecord[] = [
    ...evidenceSources.map((item) => record("evidence-source", item as unknown as Record<string,unknown>)),
    ...problemAtlasSources.map((item) => record("evidence-source", item as unknown as Record<string,unknown>)),
    ...problemAtlasClaims.map((item) => record("evidence-claim", item as unknown as Record<string,unknown>, [contentKey("evidence-source",item.sourceId)])),
    ...methodConcepts.map((item) => record("method", item as unknown as Record<string,unknown>, sourceDependencies(item as unknown as Record<string,unknown>))),
    ...researchPatterns.map((item) => record("pattern", item as unknown as Record<string,unknown>, sourceDependencies(item as unknown as Record<string,unknown>))),
    ...judgmentCards.map((item) => record("judgment-card", item as unknown as Record<string,unknown>, sourceDependencies(item as unknown as Record<string,unknown>))),
    ...auditCases.map((item) => record("audit-case", item as unknown as Record<string,unknown>, sourceDependencies(item as unknown as Record<string,unknown>))),
    ...problemCards.map((item) => record("problem-card", item as unknown as Record<string,unknown>, item.evidenceClaimIds.map((id) => contentKey("evidence-claim",id)))),
    ...learningUnits.map((item) => record("learning-unit", item as unknown as Record<string,unknown>, item.evidenceSourceIds.map((id) => contentKey("evidence-source",id)))),
  ];
  const byKey = new Map<string,PortableContentRecord>();
  for (const row of rows) {
    const existing = byKey.get(row.key);
    if (existing && existing.hash !== row.hash) throw new Error(`内置内容键冲突：${row.key}`);
    byKey.set(row.key,row);
  }
  return [...byKey.values()].sort((a,b) => a.key.localeCompare(b.key));
}
