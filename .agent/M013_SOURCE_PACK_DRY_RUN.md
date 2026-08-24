# M013 External Source Pack Dry-run

Generated: 2026-08-24T16:27:57.761Z

- Production mutation: **NO**
- Packs checked: **8**
- Validator passed: **0/8**
- Dry-run applicable: **0/8**
- Cross-pack duplicate entity IDs: **0**
- Cross-pack duplicate DOI / PMID / title: **6 / 6 / 4**
- Required source/claim contentOrigin missing: **120 / 138**
- Claims missing scope / qualification: **86 / 88**
- ProblemCards with 0 / 1 / ≥3 candidate causes: **139 / 27 / 0**

## Per-pack result

| Pack | Validator | Dry-run | Errors | Rejected rows |
|---|---|---|---:|---:|
| m013-batch01-foundation-wb-qpcr-ihc-20260824 | FAIL | BLOCKED | 1 | 0 |
| m013-batch02-statistics-clinical-singlecell-20260824 | FAIL | BLOCKED | 1 | 0 |
| m013-batch03-spatial-proteomics-paper-ai-20260824 | FAIL | BLOCKED | 1 | 0 |
| m013-batch04-bulk-rna-pathway-20260824 | FAIL | BLOCKED | 1 | 0 |
| m013-batch05-subtype-biomarker-prognosis-20260824 | FAIL | BLOCKED | 1 | 0 |
| m013-batch06-causal-reporting-20260824 | FAIL | BLOCKED | 1 | 0 |
| m013-batch07-wetlab-expanded-20260824 | FAIL | BLOCKED | 1 | 0 |
| m013-batch08-reviewer-systematic-20260824 | FAIL | BLOCKED | 1 | 0 |

## Blocking schema findings

All eight packs are rejected by the current ResearchOS validator. Instead of returning structured errors, the validator crashes on the older/snake_case ProblemCard shape when `candidateCauseIds` is absent. The external documents also omit required `contentOrigin` fields on sources and claims, may use empty source author lists, and use fields such as `title_cn`, `candidate_causes`, and `verification_status` instead of the current normalized v3 fields (`schemaVersion`, `titleCn`, `candidateCauseIds`, `verificationStatus`, etc.). No insert/update estimate is actionable until the validator is made exception-safe and a deterministic, reviewable conversion is produced.

## Safety decision

No importer apply call was made. No production database was opened or mutated. Scientific claims remain pending.

