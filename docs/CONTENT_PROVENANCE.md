# Content provenance and evidence policy

## Required metadata

Instructional entities include a stable ID, `contentOrigin`, `verificationStatus`, and one or more source IDs where the
claim depends on external evidence. Sources record tier, type, bibliographic identifiers when available, a bounded core
evidence statement, and `lastVerifiedAt`.

Origins are `verified_seed`, `human_authored`, `ai_generated`, or `imported`. Verification is `verified`, `pending`, or
`rejected`. The central invariant is strict: AI-generated content can be pending or rejected, never self-verified.

## Evidence tiers

- **A** — primary benchmark or empirical research directly supporting a technical claim.
- **B** — reporting guideline, methods paper, or authoritative appraisal framework.
- **C** — exemplary paper used for analysis practice, not elevated into general guidance by itself.
- **D** — local/imported context that may guide a prompt but is not a verified evidence source.

STROBE is treated as reporting guidance, not a study-quality scoring instrument. The 2015 TRIPOD paper remains as a
foundational citation and the current official TRIPOD+AI statement is separately registered because it replaces the old
checklist for contemporary prediction-model reporting.

## Verification completed for v0.9

On 2026-08-24, DOI/PMID pairs used by the seed set were checked against PubMed metadata where indexed, and guideline
URLs were checked against their official sites. This review corrected the pseudoreplication, single-cell pseudobulk,
internal-validation, trajectory-inference, and spatial-transcriptomics records before packaging.

Primary verification endpoints:

- https://pubmed.ncbi.nlm.nih.gov/
- https://www.strobe-statement.org/
- https://www.tripod-statement.org/
- https://www.consort-statement.org/
- https://www.equator-network.org/
- https://www.probast.org/

## AI and imported material

Provider output is displayed as an optional review and retains its AI label. It does not overwrite the locked human
answer or seed senior feedback. Imports and project notes are local context. A future human verification workflow may
promote material only with explicit reviewer identity, date, and supporting source; v0.9 intentionally has no automatic
promotion action.

No copyrighted PDFs or licensed full text are distributed. Example papers contain public metadata only.
