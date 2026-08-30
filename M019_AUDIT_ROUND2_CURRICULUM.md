# M019 Audit Round 2 — Curriculum, Science and Evidence Review

- snapshot_byte_sha256: `c94358e6b35335a0a70c84d81c5e7fb9798467d687c1ac4fc4a84811ae86d4d2`
- claims_sha256: `ebaa525d5855963a975767d98fb433e12dcc46e30d36fe36fcfbb12e3ff0554d`
- source_registry_sha256: `4b2206782876550e22a57c2305a77a15d0dd03f0af75e0230936f36c0bda4c0f`
- binding gate: `PASS (4/4)`

## Review inventory

| Asset | Count | Machine status | Human-review status |
|---|---:|---|---|
| Guide | 288 | complete structure; 742–958 chars | all pending claim/content approval |
| Concept | 40 | complete contract; 120 assessments | all pending; CI assessment prototype may enter controlled pilot |
| Method | 21 | ten dimensions; 63 assessments | all pending; Differential, KM/log-rank and PCA prototypes may enter controlled pilot |
| Case | 12 | staged/locked/update contract complete | all pending; fictional numbers are not source claims |
| Studio | 13 | transfer-only and no competence | all pending usability review |
| Claims | 361 | complete source IDs/boundaries | 361/361 `claim_level_review_pending` |

## Independent findings

### Scientific

The current bound scientific rereview rechecked its eight remaining scoped items: 8/8 resolved, remaining BLOCKER 0, MAJOR 0, new issue 0. `src-multiomics` is now the correctly identified 2017 Genome Biology review, not an RNA-seq paper under a broad ID. High-risk routing is complete at 248 = 182 Guide + 54 formal Concept/Method + 12 Case.

This is routing and scoped-fix evidence, not full-library scientific approval. All 361 claims remain curriculum synthesis pending claim-level review.

### Evidence

The original independent audit found DIRECT 61, SYNTHESIS 121, WEAK 35, UNSUPPORTED 0, SOURCE_MISMATCH 136 and NEEDS_CURRENT 8. After targeted repairs, the 104-item difference cohort is conservatively 71 evidence-ready and 33 partial; remaining source mismatch/blocker 0, inherited partial major 33, active 0. GSVA/ssGSEA now maps only to its two relevant sources.

### Pedagogy

M-01 is resolved: 61 `case_table`, 61 `evidence_matrix`, 61 `decision_timeline`, each with a four-row semantic schema; every lesson uses three distinct representations. B-02 automatic false completion is resolved by fail-closed behavior: no `passed`/`complete` state exists, structurally eligible responses require human review and always keep `createsCompetence=false`.

Two activation gates remain:

- B-01: only four high-value lesson prototypes (12 assessment assets) have deep, independently inspectable materialization; the other 171 assessment assets have not received the same full-library sufficiency proof.
- M-03: Chinese phrasing and distractor authenticity still require de-labelled domain review and target-learner cognitive interviews.

## Round result

**HOLD FOR SELECTIVE HUMAN PILOT.** Deterministic scientific/evidence/source-routing/software defects in scope are repaired, review hashes match, and pending isolation is safe. The curriculum is not approved for bulk activation because full-library stimulus sufficiency, 33 partial evidence claims, Chinese distractor validity and learner measurement evidence remain open.

No candidate enters formal Today, Review or standardized competence from this round.
