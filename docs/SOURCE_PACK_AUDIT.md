# Source Pack Audit

*M013 source registry, claim mapping, knowledge versioning and transactional import gate.*

**Result: PASSED** — 0 error(s), 0 warning(s).

## Checks

| Status | Check | Detail |
|---|---|---|
| PASS | demo pack schema valid | validated with 0 warning(s) |
| PASS | demo pack hash computed | 5ef6995d64b8deb0 |
| PASS | seed pack idempotent no-op | noop=true; inserts=0; updates=0 |
| PASS | seed pack no conflicts | clean |
| PASS | seed import recorded | 1 import records |
| PASS | sources normalized enums | enums clean |
| PASS | no Tier X sources | Tier X rejected |
| PASS | registry tiers match Codex-reviewed M013 mapping | 9 sources mapped |
| PASS | Altman BMJ source DOI↔PMID mapping | doi=10.1136/bmj.b605; pmid=19477892 |
| PASS | claims never claim_verified | 12 claims pending |
| PASS | cards never verified | 4 cards pending |
| PASS | training cases never verified | 32 cases pending |
| PASS | demo scope limited to four concepts | pa-pseudorep, pa-bio-tech-rep, pa-data-leakage, pa-internal-external |
| PASS | cards have complete mode rubrics | 8 modes per card |
| PASS | paths are well-formed | 4 paths |
| PASS | evidence links intact | 12 evidence items |
| PASS | claims link to registry sources | 12 claims |
| PASS | content hash deterministic | 5ef6995d64b8deb0 |
| PASS | entity hash deterministic | entity hash stable |
| PASS | non-destructive supersession links | TRIPOD 2015 ↔ TRIPOD+AI |
| PASS | superseded source keeps its history | TRIPOD 2015 status=superseded/metadata_verified |
| PASS | CSV parser handles quotes | ["s1","A, \"quoted\" title","2020"] |
| PASS | Markdown frontmatter parser | s1 |
| PASS | Tier X pack rejected | source pa-src-pseudorep: Tier X 被拒绝, source pa-src-pseudorep |
| PASS | AI self-verification rejected | CLAIM_AI_SELF_VERIFY evidenceClaims[0].contentOrigin: AI 生成内容不能进入 claim_verified。; VERIFIED_CLAIM_GATE_MISSING pack.verificationMetadata: pa-claim-pseudorep-def 为 claim_verified，但 pack 缺少正式 gate（reviewer/reviewedAt/verified 状态）。 |
| PASS | validator exception-safe on arbitrary shapes | 0 crashes |
| PASS | legacy snake_case rows return structured rejection | 15 structured failures |
| PASS | structural and completeness gates stay independent | structural=0; completeness=scientific_patch_required |
| PASS | scientifically incomplete pack is import-ineligible | importEligible=false |
| PASS | apply rejects scientifically incomplete packs | threw SourcePackImportError |
| PASS | unclassified card blocks import eligibility | importEligible=false |
| PASS | safe JSON parser returns structured failure | PARSE_INVALID_JSON |
| PASS | safe JSON parser rejects oversize input | PARSE_OVERSIZE |
| PASS | oversized CSV field rejected without truncation | CSV_FIELD_OVERSIZE csv line 2 field 2: 字段长度 2001 超过上限 2000；该行/文件被拒绝，不截断。 |
| PASS | identical-import noop cannot bypass the scientific gate | noop=true; importEligible=false; completeness=scientific_patch_required |
| PASS | apply rejects incomplete identical-import without mutation | threw SourcePackImportError |
| PASS | dry-run reports importEligible for clean demo | importEligible=true |

## Counts

| Entity | Count |
|---|---:|
| packSources | 9 |
| claims | 12 |
| cards | 4 |
| causes | 15 |
| checks | 15 |
| paths | 4 |
| evidence | 12 |
| transferCases | 32 |

## Rules enforced

- Canonical pack schema v1; JSON/CSV/Markdown parsers with size bounds; oversize CSV fields and Markdown bodies are deterministically rejected, never truncated; exception-safe hardened validator with structured failure codes and locations.
- Tier X rejected; D/X cannot back verified claims; AI-generated content cannot self-verify.
- Duplicate DOI/PMID/title and claim hashes rejected; supersession cycles detected.
- Import is transactional and idempotent per pack ID + content hash; the identical-import/noop shortcut never overrides the structural and scientific gates.
- Two independent gates: structural validation vs scientific completeness (scientifically_complete | scientific_patch_required); unclassified cards are never import-eligible; the apply path rejects every import-ineligible document.
- Registry authority tiers match the Codex-reviewed M013 mapping (TRIPOD/TRIPOD+AI/PROBAST S; peer-reviewed methods/benchmarks A; explanatory reviews C).
- All demo transformations remain pending; sources remain metadata_verified via seed mirroring.
