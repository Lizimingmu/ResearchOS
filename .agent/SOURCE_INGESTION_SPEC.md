# M013 — Source Ingestion Specification

## Source-first pipeline

```text
Authoritative source → Source quality gate → Claim extraction
→ Claim–evidence mapping → Problem transformation → Training transformation
→ Scientific review → Verified
```

Automated lookup may validate identifier syntax and metadata. It must never make the final claim-support or authority decision.

## Evidence Source Registry

### EvidenceSource

- `id`, `schemaVersion`
- `sourceType`: guideline | consensus | standard | protocol | original_method | benchmark | methods_review | technical_resource | institutional_sop | educational | discovery
- `organization?`, `journal?`, `title`, `authors[]`, `year`
- `doi?`, `pmid?`, `url?`
- `authorityTier`: S | A | B | C | D | X
- `domain[]`, `version?`
- `knowledgeStatus`: current | superseded | deprecated | emerging
- `supersedes[]`, `supersededBy[]`
- `verificationStatus`: pending | metadata_verified | claim_verified | rejected
- `verificationScope[]`, `verifiedAt?`, `verifiedBy?`
- `contentHash?`, `retrievedAt?`, `licenseNote?`, `provenanceNote`

Tier meanings:

- S: authoritative guideline/consensus/standard.
- A: peer-reviewed method, protocol, benchmark or authoritative computational best practice.
- B: validated technical/vendor resource; implementation-specific.
- C: high-quality review/education used for explanation.
- D: discovery-only and never a verified truth source.
- X: rejected/unreliable.

Tier is assigned through scientific review; importer defaults to pending and cannot infer S/A from journal or organization names.

### EvidenceClaim

- `id`, `claim`, `scope`, `qualification`
- `sourceId`, `supportType`: direct | qualified | contextual | contradicts | insufficient
- `supportingLocation`: section/title plus optional page/table/figure/paragraph locator
- `supportingExcerptHash?` and short reviewer note; do not bundle copyrighted long excerpts
- `domain[]`, `knowledgeStatus`
- `verificationStatus`: pending | claim_verified | rejected
- `verifiedAt?`, `verifiedBy?`

A metadata-verified source may still have only pending or insufficient claims.

## Canonical JSON source pack

```json
{
  "packSchemaVersion": 1,
  "packId": "stable-id",
  "title": "Human-readable title",
  "createdAt": "ISO-8601",
  "createdBy": "person/process",
  "provenance": "how this pack was produced",
  "sources": [],
  "evidenceClaims": [],
  "problemCards": [],
  "diagnosticCauses": [],
  "diagnosticChecks": [],
  "diagnosticPaths": [],
  "diagnosticEvidence": [],
  "transferCases": [],
  "verificationMetadata": {
    "reviewStatus": "pending",
    "reviewer": null,
    "reviewedAt": null
  }
}
```

JSON is canonical. CSV import uses one file per entity with stable foreign-key IDs. Markdown import uses one item per file with YAML frontmatter containing the same identifiers/status fields; body sections map only to declared schema fields.

## Import workflow

1. Parse without mutation.
2. Validate schema version, required fields and enums.
3. Normalize DOI/PMID/aliases without silently rewriting claims.
4. Validate unique IDs and all foreign keys.
5. Check duplicate identifiers, normalized titles and claim hashes against existing registry and within pack.
6. Reject verified AI-generated content, D/X-backed verified claims, impossible version cycles and unsupported status transitions.
7. Produce dry-run report: inserts, updates, conflicts, warnings and rejected rows.
8. Require explicit user confirmation for mutation.
9. Import transactionally; rollback all changes on an error.
10. Record pack ID, checksum, import time and result.

## Collision and update policy

- Same ID + same content hash: idempotent no-op.
- Same ID + changed content: explicit update requiring a newer pack/version; never silent overwrite.
- Same DOI/PMID with different source ID: conflict for review.
- Source supersession updates badges but does not delete historical learning records.
- Verified → pending/rejected/deprecated is allowed only with provenance and audit record.
- Pending → claim_verified requires Codex/formal source-pack gate, verifier identity, time and scope.

## Evidence badges

Use categorical labels only: ✓ 权威规范, ✓ 方法学证据, 技术参考, 前沿证据, 待核验, 已被取代, 已弃用. Do not create numeric evidence scores.

## Deterministic validation

The source-pack validator must check schemas, enums, identifiers, duplicate IDs/titles/DOIs/PMIDs, foreign keys, version cycles, evidence-claim completeness, status transition rules, forbidden self-verification, missing provenance, broken related-entity links and checksum. It emits machine-readable JSON plus a short Markdown summary and exits nonzero on errors.

## Security and scope

No automatic website crawling, remote code, embedded executable content or automatic verified promotion. Treat imported Markdown/CSV/JSON as untrusted data, bound file/row/field sizes, escape rendered text and preserve local-first behavior.

