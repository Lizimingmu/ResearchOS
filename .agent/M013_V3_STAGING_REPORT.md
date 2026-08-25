# M013 V3 Staging Report — Legacy → v3 Auditable Conversion (M013-10)

Generated: 2026-08-25T07:43:32.238Z

## Result

**PASS** — 0 contract failure(s).

## Safety decision

- Production mutation: **NO**. No apply-import call was made against the legacy corpus; only dry-run staging.
- Verification promotion: **NO**. All staged rows remain `pending`; legacy `metadata_verified` was demoted to `pending`.
- problemType inference: **NO**. All 166 legacy cards are `unclassified` (166 unclassified / 0 classified).
- Global "candidate causes >= 3" rule: **NOT APPLIED**. Diagnostic completeness prefers three useful causes but allows two and never manufactures a third.

## Original legacy packs (untouched)

| Pack | SHA256 | Parse | Structural | Failures |
|---|---|---|---|---|
| m013-batch01-foundation-wb-qpcr-ihc-20260824 | PASS | ok | structured rejection | 454 |
| m013-batch02-statistics-clinical-singlecell-20260824 | PASS | ok | structured rejection | 640 |
| m013-batch03-spatial-proteomics-paper-ai-20260824 | PASS | ok | structured rejection | 628 |
| m013-batch04-bulk-rna-pathway-20260824 | PASS | ok | structured rejection | 400 |
| m013-batch05-subtype-biomarker-prognosis-20260824 | PASS | ok | structured rejection | 387 |
| m013-batch06-causal-reporting-20260824 | PASS | ok | structured rejection | 394 |
| m013-batch07-wetlab-expanded-20260824 | PASS | ok | structured rejection | 463 |
| m013-batch08-reviewer-systematic-20260824 | PASS | ok | structured rejection | 407 |

- Validator crash: **none** (exception-safe hardened validator; every pack returned deterministic structured failures with codes and locations).

## Staging conversion

- Per-pack rows: sources 120 (8 packs), claims 138, cards 166, causes 27, checks 475, paths 164, evidence 21, transfer cases 30.
- Unique canonical sources after dedup: **114** (= 120 − 6 DOI merges; PMID/title merges are subsets of the same pairs).
- Source canonicalization: **6 DOI** merges, **6 PMID** merges, **4 title** merges; collision-free after merge: **true**.
- Foreign-key rewrites (claim.sourceId → canonical source ID): **3**.
- Enum lookup tables: importance critical/high/medium → 5/4/3; frequency very_common/common → 4/3 (disclosed, deterministic).

### Codex-approved metadata patches applied (exact, from metadata audit)

| Row | Field | From | To |
|---|---|---|---|
| SRC-DESPACE-2024 | url | https://pubmed.ncbi.nlm.nih.gov/PMC10868334 | https://pmc.ncbi.nlm.nih.gov/articles/PMC10868334/ |
| SRC-ANNEXIN-2016 | title | Analyzing Cell Death by Annexin V Staining and Flow Cytometry | Quantitation of Apoptosis and Necrosis by Annexin V Binding, Propidium Iodide Uptake, and Flow Cytometry |
| SRC-ELISA-INTERFERENCE-2023 | title | Interferences in Immunoassay | Interference in ELISA |
| SRC-WOUND-2014 | title | Wound healing assay: an overview of literature methods | An introduction to the wound healing assay using live-cell microscopy. |
| SRC-MIGRATION-GUIDE-2026 | title | A practical guideline for the choice and use of cell migration assays | Selecting the optimal cell migration assay: fundamentals and practical guidelines |
| SRC-ZIP-2016 | title | A new drug-combination model to predict synergistic effects based on the zero interaction potency score | Searching for Drug Synergy in Complex Dose-Response Landscapes Using an Interaction Potency Model. |
| SRC-SYNERGY-WHAT-2015 | title | What is synergy? | What is synergy? The Saariselkä agreement revisited. |

- Sources missing provenanceNote: **50** of 120 legacy rows → **48** after canonicalization (2 duplicated rows with missing provenance were absorbed into canonical rows that carry provenance).
- Claim-level scientific patches listed in SCIENTIFIC_CHANGESET.md (CLM-QPCR-006, CLM-SP-008, CLM-AI-004, CLM-REV-003, scope/qualification fills) were **NOT applied**: the changeset specifies group-level dispositions, not exact patch text; composing them would rewrite scientific content. They remain for M013-11 classification and type-specific repair.

## Staging dry-run

| Pack | Structural | Internal collisions | Registry conflicts | Import-eligible |
|---|---|---|---|---|
| m013-batch01-foundation-wb-qpcr-ihc-20260824 | valid | 0 | 0 | false |
| m013-batch02-statistics-clinical-singlecell-20260824 | valid | 0 | 6 | false |
| m013-batch03-spatial-proteomics-paper-ai-20260824 | valid | 0 | 0 | false |
| m013-batch04-bulk-rna-pathway-20260824 | valid | 0 | 0 | false |
| m013-batch05-subtype-biomarker-prognosis-20260824 | valid | 0 | 0 | false |
| m013-batch06-causal-reporting-20260824 | valid | 0 | 0 | false |
| m013-batch07-wetlab-expanded-20260824 | valid | 0 | 0 | false |
| m013-batch08-reviewer-systematic-20260824 | valid | 0 | 2 | false |

Registry conflicts are disclosed only; every staging document is import-ineligible because 166 cards are `unclassified` (scientific_patch_required).

Staging warnings (non-blocking, disclosed): supersession references to sources outside the pack (e.g. legacy `TRIPOD-2015`, `CONSORT-2010`, `SPIRIT-2013`, `MIQE-2009`, `CAP-IHC-2014`) are preserved as unresolved references pending registry-level review — 7 warning(s) total.

## Scientific completeness (second gate)

| Code | Count |
|---|---:|
| CARD_MISSING_KNOWLEDGE_STATUS | 166 |
| CARD_UNCLASSIFIED | 166 |
| CLAIM_MISSING_QUALIFICATION | 88 |
| CLAIM_MISSING_REVIEWER_NOTE | 18 |
| CLAIM_MISSING_SCOPE | 86 |
| SOURCE_MISSING_PROVENANCE | 48 |

- Status per pack: `scientific_patch_required` (8/8). `scientifically_complete` does not mean verified; pending content stays pending.
- Demo pack control: structural errors 0; completeness scientifically_complete; importEligible true.

## Converter policies (audited)

- 仅机械确定性映射：snake_case→camelCase、稳定 ID、显式枚举/别名查找表、来源规范 ID 与外键重写。
- 科学文本逐字保留；除无规范字段可承载的 legacy 字段外，不删除、不改写、不补造。
- 不得推断 problemType：全部 legacy 卡片为 unclassified，永不导入合格。
- 不得推断 scope/qualification/候选原因/结论边界/推荐推理/严重性/可修复性/证据支持/层级/排序/成本。
- 永不提升 pending：metadata_verified/claim_verified 一律降为 pending，verifiedAt/verifiedBy 不继承。
- 不采用全局“候选原因≥3”规则；diagnostic 完整性允许两个有用原因、优先三个。
- 来源去重：同规范化 DOI/PMID/标题去重，规范 ID 取字典序最小 ID；每次合并与冲突均披露。

## Checks

| Status | Check | Detail |
|---|---|---|
| PASS | original archive contains 8 legacy packs | 8 packs |
| PASS | original pack SHA256 verified | all verified |
| PASS | original packs parse | all parsed |
| PASS | validator never throws on originals | no crash |
| PASS | all 8 originals return structured rejection | Batch01_legacy_verified_structure:454, Batch02_legacy_verified_structure:640, Batch03_legacy_verified_structure:628, Batch04_bulk-rna-pathway:400, Batch05_subtype-biomarker-prognosis:387, Batch06_causal-reporting:394, Batch07_wetlab-expanded:463, Batch08_reviewer-systematic:407 |
| PASS | corpus conversion succeeds | ok |
| PASS | 8 staging documents produced | 8 staging docs |
| PASS | 6 DOI collisions canonicalized | ["SRC-TRIPODAI-2024<=SRC-TRIPODAI-2024|SRC-TRIPODAI-2024-B8","SRC-PROBAST-2019<=SRC-PROBAST-2019|SRC-PROBAST-2019-B8","SRC-REMARK-2005<=SRC-REMARK-2005|SRC-REMARK-2005-B8","SRC-STROBE-2007<=SRC-STROBE-2007|SRC-STROBE-2007-B8","SRC-CONSORT-2025<=SRC-CONSORT-2025|SRC-CONSORT-2025-B8","SRC-STARD-2015<=SRC-STARD-2015|SRC-STARD-2015-B8"] |
| PASS | 6 PMID collisions canonicalized | 6 pmid merges |
| PASS | 4 normalized-title duplicates canonicalized | 4 title merges |
| PASS | collision-free after canonicalization | collision-free |
| PASS | merged source registry size = 120 - 6 | unique sources=114 |
| PASS | claims total 138 | claims=138 |
| PASS | cards total 166 | cards=166 |
| PASS | foreign keys rewritten for merged sources | 3 rewrites |
| PASS | DESpace URL corrected | [{"rowId":"SRC-DESPACE-2024","field":"url","from":"https://pubmed.ncbi.nlm.nih.gov/PMC10868334","to":"https://pmc.ncbi.nlm.nih.gov/articles/PMC10868334/","basis":"Codex 元数据审计（M013_SOURCE_METADATA_AUDIT.md）：原 PubMed/PMC 混合 URL 无效，改用官方 PMC 文章页。"}] |
| PASS | 6 formal-title corrections applied | ["SRC-ANNEXIN-2016","SRC-ELISA-INTERFERENCE-2023","SRC-WOUND-2014","SRC-MIGRATION-GUIDE-2026","SRC-ZIP-2016","SRC-SYNERGY-WHAT-2015"] |
| PASS | staging m013-batch01-foundation-wb-qpcr-ihc-20260824 structurally valid | [] |
| PASS | staging m013-batch01-foundation-wb-qpcr-ihc-20260824 internally collision-free | clean |
| PASS | staging m013-batch01-foundation-wb-qpcr-ihc-20260824 import-ineligible | importEligible=false |
| PASS | staging m013-batch01-foundation-wb-qpcr-ihc-20260824 scientifically patch-required | scientific_patch_required |
| PASS | staging m013-batch02-statistics-clinical-singlecell-20260824 structurally valid | [] |
| PASS | staging m013-batch02-statistics-clinical-singlecell-20260824 internally collision-free | clean |
| PASS | staging m013-batch02-statistics-clinical-singlecell-20260824 import-ineligible | importEligible=false |
| PASS | staging m013-batch02-statistics-clinical-singlecell-20260824 scientifically patch-required | scientific_patch_required |
| PASS | staging m013-batch03-spatial-proteomics-paper-ai-20260824 structurally valid | [] |
| PASS | staging m013-batch03-spatial-proteomics-paper-ai-20260824 internally collision-free | clean |
| PASS | staging m013-batch03-spatial-proteomics-paper-ai-20260824 import-ineligible | importEligible=false |
| PASS | staging m013-batch03-spatial-proteomics-paper-ai-20260824 scientifically patch-required | scientific_patch_required |
| PASS | staging m013-batch04-bulk-rna-pathway-20260824 structurally valid | [] |
| PASS | staging m013-batch04-bulk-rna-pathway-20260824 internally collision-free | clean |
| PASS | staging m013-batch04-bulk-rna-pathway-20260824 import-ineligible | importEligible=false |
| PASS | staging m013-batch04-bulk-rna-pathway-20260824 scientifically patch-required | scientific_patch_required |
| PASS | staging m013-batch05-subtype-biomarker-prognosis-20260824 structurally valid | [] |
| PASS | staging m013-batch05-subtype-biomarker-prognosis-20260824 internally collision-free | clean |
| PASS | staging m013-batch05-subtype-biomarker-prognosis-20260824 import-ineligible | importEligible=false |
| PASS | staging m013-batch05-subtype-biomarker-prognosis-20260824 scientifically patch-required | scientific_patch_required |
| PASS | staging m013-batch06-causal-reporting-20260824 structurally valid | [] |
| PASS | staging m013-batch06-causal-reporting-20260824 internally collision-free | clean |
| PASS | staging m013-batch06-causal-reporting-20260824 import-ineligible | importEligible=false |
| PASS | staging m013-batch06-causal-reporting-20260824 scientifically patch-required | scientific_patch_required |
| PASS | staging m013-batch07-wetlab-expanded-20260824 structurally valid | [] |
| PASS | staging m013-batch07-wetlab-expanded-20260824 internally collision-free | clean |
| PASS | staging m013-batch07-wetlab-expanded-20260824 import-ineligible | importEligible=false |
| PASS | staging m013-batch07-wetlab-expanded-20260824 scientifically patch-required | scientific_patch_required |
| PASS | staging m013-batch08-reviewer-systematic-20260824 structurally valid | [] |
| PASS | staging m013-batch08-reviewer-systematic-20260824 internally collision-free | clean |
| PASS | staging m013-batch08-reviewer-systematic-20260824 import-ineligible | importEligible=false |
| PASS | staging m013-batch08-reviewer-systematic-20260824 scientifically patch-required | scientific_patch_required |
| PASS | problemType rows: 166 unclassified, 0 classified | {"diagnostic":0,"judgment":0,"audit":0,"unclassified":166} |
| PASS | claims missing scope = 86 | 86 |
| PASS | claims missing qualification = 88 | 88 |
| PASS | claims missing reviewerNote = 18 | 18 |
| PASS | sources missing provenanceNote before merge = 50 | 50 |
| PASS | sources missing provenanceNote after canonicalization = 48 | 48 |
| PASS | cards missing claim boundary = 111 (staged-missing/empty, type-required) | 111 |
| PASS | cards missing recommended reasoning = 79 (staged-missing/empty, type-required) | 79 |
| PASS | cards unclassified = 166 | 166 |
| PASS | cards missing knowledge status = 166 | 166 |
| PASS | all staged verification statuses remain pending | {"sources":120,"claims":138,"cards":166,"transferCases":30} |
| PASS | demo pack structurally valid | clean |
| PASS | demo pack scientifically complete | scientifically_complete |
| PASS | demo pack import-eligible (two gates separated) | importEligible=true |
