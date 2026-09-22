# M020 architecture and review notes

Baseline: `7a41b4926e3a2a408acce7c073b2351c4fc230cc`.
Scope: the user's M020 request supersedes the unfinished independent audit and older milestone restrictions. No M019 assessment repairs, scientific activation, external publishing, or M021 work is authorized by this implementation.

## Canonical content and historical facts

`KnowledgeUnit` owns typed scientific content, provenance, freshness and evidence references. A unit revision is immutable. Append-only decisions carry later review/deprecation/supersession state; deriving current status never changes the original revision's hash. Learning bindings store an asset id/revision/hash and exact knowledge id/revision/hash references. Candidate learning projections remain outside the active registry and cannot create competence.

The additive application state migration is v8 → v9; SQLite storage version remains unchanged. Existing events, competence and personal overlays are not reinterpreted. Old events without canonical references may be resolved only through their exact historical asset/unit revision and hash. Unknown historical versions remain unresolved. New events acquire binding metadata outside the Learning Kernel engine.

## Safety boundaries

- A proposed change and its impact are previewable before the user confirms an append-only update transaction.
- DOI/PMID/source metadata are local import inputs; this milestone does not make network resolution or new scientific verification claims.
- Metadata verification is separate from claim verification. Imported assertions of verification or activation are not authority.
- Persistent state refuses malformed or future knowledge schemas. Compatibility bindings and privileged records must match the built-in seed exactly.
- `setKnowledgeWorkspace` rejects illegal state transitions. Today, Review and direct practice/store actions check maintenance holds independently of the UI.
- Exact base-key matches create personal overlay conflicts when the base knowledge is held, deprecated or superseded. Overlay text is preserved; no automatic merge.

## Migration and scientific gaps

Adapters preserve stable IDs, original revisions/hashes/payloads and source attribution. Canonical wrapper hashes differ from original pedagogical hashes by design; original hashes remain in provenance and learning bindings. A content-level citation becomes pending curriculum synthesis, not a newly verified direct claim.

Missing fields, omitted explicit source links and unresolved lesson-to-knowledge mappings are recorded as review gaps. They must not be filled from title similarity or generic domain assumptions. Imported protocol staging may be a diagnostic problem or transfer-case excerpt rather than a complete protocol; that distinction remains in the raw payload and review gaps.

The grandfathered path preserves unchanged pre-M020 learning behavior. It is not a mechanism for activating new knowledge. Confirmation of a relevant change places exact dependent assets on review hold. A new scientific review/activation workflow and lifting those holds are outside M020.

## Execution and validation policy

Configured OpenCode / DeepSeek Pro was attempted, but it failed first on log-directory permissions and then on `EPERM uv_spawn 'git'`. No delegate implementation was produced. Codex and bounded Codex collaborators continued within the user's development authorization; no model/provider setting was changed.

Only background checks are permitted for this run. Prior localhost browser permission was denied and was not bypassed. Static component rendering and isolated jsdom startup checks do not prove visual appearance. Final report must distinguish automated PASS from visual NOT RUN.
