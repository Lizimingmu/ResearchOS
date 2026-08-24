# Scientific Changeset — M013 Complete Source Packs

Status: READY FOR REVIEW

Input: `ResearchOS_M013_COMPLETE_SourcePacks_20260824.zip` (8 packs, 120 source rows, 138 claims, 166 ProblemCards). Gate result is PATCH REQUIRED. No production import occurred and no item was promoted from `pending`.

## Corpus findings

- Metadata triage: 80/83 unique DOI resolved through Crossref; 5/5 PMID-only records resolved through Europe PMC. Three DOI lookups were rate-limited, not shown invalid. Eight title records and five online/print-year differences require manual normalization; 26 URL-only sources were not exhaustively bulk-resolved.
- Claim completeness: 86/138 claims have empty scope and 88/138 have empty qualification.
- Problem Atlas fitness: REJECT the 166-card set as importable learning content. Cards with 0/1/≥3 candidate causes: 139/27/0; 111 lack claim boundaries, 79 lack recommended reasoning, two lack a diagnostic path, and only 21 sequential evidence items plus 30 transfer cases exist.

### SC-PACK-01 — Experimental design, WB, qPCR and IHC

- Concept: Statistical unit, assay controls, quantitative WB, MIQE 2.0 and clinical-IHC validation boundaries.
- Claim: Core biological-versus-technical replication, context-specific normalization, MIQE 2.0 and clinical-IHC claims are defensible only with the supplied qualifications.
- Answer/rubric: PATCH REQUIRED — keep `CLM-QPCR-006` pending/insufficient or replace its application paper with a dedicated assay-validation source; vendor troubleshooting remains Tier B; CAP scope remains clinical IHC.
- Evidence source IDs: `SRC-MIQE2-2025`, `SRC-CAP-IHC-2024`, `SRC-QPCR-MELT`, vendor WB/IHC sources.
- PMID/DOI: `10.1093/clinchem/hvaf043`; `10.5858/arpa.2023-0483-CP`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch01 JSON requires staging patch; no product scientific file modified.
- Reviewer note: Concept group can be retained after the exact patch; no bulk verification.

### SC-PACK-02 — Statistics, survival and prediction

- Concept: P-values, interaction, cutpoints, missingness, non-PH, competing risks, prediction performance and reporting.
- Claim: The supplied concepts are directionally sound; TRIPOD+AI replaces TRIPOD-2015 for reporting, while compliance is not proof of low bias.
- Answer/rubric: PATCH REQUIRED — add 18 missing qualifications; preserve fixed-model primary evaluation versus separately reported recalibration/updating; same-source random holdout is not external validation.
- Evidence source IDs: `SRC-ASA-PVALUE-2016`, `SRC-TRIPODAI-2024`, `SRC-PROBAST-2019`, prediction/survival method sources.
- PMID/DOI: `10.1136/bmj-2023-078378`; `10.7326/M18-1376`; `10.1161/CIRCULATIONAHA.115.017719`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch02 JSON requires staging patch; no product scientific file modified.
- Reviewer note: Official TRIPOD site confirms replacement status; claims still require item-level scope/support review.

### SC-PACK-03 — Single-cell inference

- Concept: Donor dependence, replicate-aware DE/DA, integration, pseudotime, RNA velocity and CCC.
- Claim: The central boundaries are appropriate, but pseudobulk is one defensible option and transcriptomic CCC remains hypothesis-generating.
- Answer/rubric: PATCH REQUIRED — living Single-cell Best Practices pages may remain Tier A only as versioned authoritative computational best practice; cross-support HIGH-risk claims and fill missing qualifications.
- Evidence source IDs: `SRC-SQUAIRE-2021`, `SRC-ZIMMERMAN-2021`, SC Best Practices snapshots, RNA-velocity and CCC benchmarks.
- PMID/DOI: `10.1038/s41467-021-25960-2`; `10.1038/s41467-022-30755-0`; `10.1371/journal.pcbi.1010492`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch02 JSON requires staging patch; no product scientific file modified.
- Reviewer note: Cells remain observational subsamples for across-donor inference; no universal method promotion.

### SC-PACK-04 — Spatial, proteomics and multi-omics

- Concept: Spatial unit hierarchy, deconvolution/SVG uncertainty, proteomics missingness and non-causal integration.
- Claim: Most boundaries are appropriate, but `CLM-SP-008` overstates DESpace as resolving within-section dependence.
- Answer/rubric: PATCH REQUIRED — narrow/downgrade `CLM-SP-008`, fix `SRC-DESPACE-2024` URL, and add 30 missing scopes plus 21 missing qualifications.
- Evidence source IDs: `SRC-DESPACE-2024`, SVG benchmarks, proteomics-missingness and multi-omics reviews.
- PMID/DOI: `10.1186/s13059-023-03045-1`; `10.1186/s13059-025-03731-2`; `10.1016/j.crmeth.2022.100288`; PMC `PMC10868334`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch03 JSON requires staging patch; no product scientific file modified.
- Reviewer note: Jointly modeling samples is not by itself proof that all within-section dependence is handled.

### SC-PACK-05 — Bulk RNA-seq and pathways

- Concept: Count-model compatibility, batch confounding, multiplicity and enrichment interpretation.
- Claim: The concepts are acceptable only when alternative frameworks remain visible and enrichment is not promoted to activation/mechanism.
- Answer/rubric: PATCH REQUIRED — all 12 claims require scope and eight require qualification; distinguish ORA, rank-based testing and sample-level scoring.
- Evidence source IDs: DESeq2, voom, TMM, batch-effect and pathway-analysis sources in Batch04.
- PMID/DOI: `10.1186/s13059-014-0550-8`; `10.1186/gb-2014-15-2-r29`; `10.1371/journal.pcbi.1002375`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch04 JSON requires staging patch; no product scientific file modified.
- Reviewer note: No single RNA-seq or enrichment package is universal.

### SC-PACK-06 — Subtypes, biomarkers and prognosis

- Concept: Cluster stability, external label validation, prognosis, prediction and treatment-effect modification.
- Claim: Stability is not biological/clinical validity, and prognostic association is not treatment-predictive evidence.
- Answer/rubric: PATCH REQUIRED — all nine claims lack scope and qualification; preserve outcome-informed feature-selection and external-label-validation boundaries.
- Evidence source IDs: Consensus clustering, PROGRESS and REMARK sources in Batch05.
- PMID/DOI: `10.1371/journal.pmed.1001380`; `10.1371/journal.pmed.1001381`; `10.1136/bmj.e5793`; `10.1093/jnci/dji237`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch05 JSON requires staging patch; no product scientific file modified.
- Reviewer note: No treatment-selection claim without interaction/stratified-medicine evidence.

### SC-PACK-07 — Causal inference and reporting guidance

- Concept: DAGs, colliders, propensity scores, target trials, immortal time, E-values and reporting standards.
- Claim: The causal boundaries are appropriate; none of these methods guarantees causal identification, and reporting completeness is not validity.
- Answer/rubric: PATCH REQUIRED — all 12 claims lack scope and ten lack qualification; canonicalize duplicated guideline sources across packs.
- Evidence source IDs: DAG, target-trial, propensity-score, E-value, STROBE, CONSORT, SPIRIT, STARD and ARRIVE sources.
- PMID/DOI: `10.1093/aje/kwv254`; `10.1080/00273171.2011.568786`; `10.7326/M16-2607`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch06/Batch08 JSON requires staging patch; no product scientific file modified.
- Reviewer note: Official SPIRIT–CONSORT site confirms the 2025 named statements.

### SC-PACK-08 — Wet-lab expanded and drug combinations

- Concept: Flow controls, Annexin V operational states, viability proxies, migration/invasion and synergy reference models.
- Claim: The boundaries are suitable only when they do not infer unique death mechanism, pure migration, universal synergy or clinical efficacy.
- Answer/rubric: PATCH REQUIRED — all 14 claims lack scope and 13 lack qualification; correct formal titles for the six flagged PMID/DOI records.
- Evidence source IDs: Flow guideline, Annexin V, assay-guidance, migration and synergy sources in Batch07.
- PMID/DOI: PMID `25482647`, `26949479`, `26388771`; DOI `10.1101/pdb.prot087288`, `10.1007/978-1-0716-2903-1_7`, `10.1038/s41592-025-02890-1`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch07 JSON requires staging patch; no product scientific file modified.
- Reviewer note: Metadata titles must match the source-of-record before claim review.

### SC-PACK-09 — AI, paper integrity, systematic review and reviewer training

- Concept: Human AI accountability, citation support, reporting versus bias, study/report units and reviewer severity.
- Claim: ICMJE supports human responsibility, disclosure, primary-source prohibition and citation checking; reporting guidance does not repair weak design.
- Answer/rubric: PATCH REQUIRED — restrict `CLM-AI-004` to editors/reviewers/publishers handling privileged submissions; give `CLM-REV-003` direct/contextual support; fill missing scopes/qualifications and canonicalize six DOI/PMID collisions.
- Evidence source IDs: ICMJE 2026, PRISMA, PRISMA-S, Cochrane Handbook and duplicated reporting-guideline sources.
- PMID/DOI: `10.1136/bmj.n71`; `10.1186/s13643-020-01542-z`; ICMJE `https://www.icmje.org/recommendations/`.
- Risk level: HIGH
- Verification status: pending
- Changed files: External Batch03/Batch08 JSON requires staging patch; no product scientific file modified.
- Reviewer note: None of the 166 ProblemCards is accepted as Atlas-ready; do not pad causes mechanically.

## Corpus-level disposition

- Evidence sources: retain as candidate metadata after correction/canonicalization; formal metadata verification must be reissued by the gate, not inherited from the producing model.
- Evidence claims: retain as candidate text; none is approved for `claim_verified` until scope, qualification, location and support type are corrected and re-reviewed.
- ProblemCards/paths/rubrics: REJECT as importable Problem Atlas content. Preserve in staging for redesign into genuine multiple-hypothesis, evidence-updating cases.
