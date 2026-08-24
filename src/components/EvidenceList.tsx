import { ExternalLink, ShieldCheck, ShieldQuestion } from "lucide-react";
import { evidenceById } from "../data/evidence";
import { verificationLabel } from "../app/localization";

export function EvidenceList({ sourceIds }: { sourceIds: string[] }) {
  return (
    <div className="evidence-list">
      {sourceIds.map((id) => evidenceById[id]).filter(Boolean).map((source) => (
        <article key={source.id} className="evidence-row">
          {source.verificationStatus === "verified" ? <ShieldCheck size={15} /> : <ShieldQuestion size={15} />}
          <div>
            <strong>{source.title}</strong>
            <span>证据级别 {source.tier} · {source.sourceName} · {verificationLabel(source.verificationStatus)}</span>
            <p>{source.coreEvidence}</p>
            <div className="evidence-identifiers">
              {source.pmid && <code>PMID {source.pmid}</code>}
              {source.doi && <code>DOI {source.doi}</code>}
              {source.url && <a href={source.url} target="_blank" rel="noreferrer">来源 <ExternalLink size={11} /></a>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
