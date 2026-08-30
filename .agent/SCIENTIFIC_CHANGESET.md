# Scientific Changeset — M013 Complete Source Packs

Status: ACCEPTED

## M018.1 end-to-end wiring review note

### SC-M018.1-01 — Fresh standardized variants for existing prototypes

- Concept: Statistical Unit and Confounding remediation; Confounding and Cox independent Apply and delayed retrieval.
- Claim: Repeated measurements do not create independent upper-level units; covariate adjustment follows the target estimand and causal structure; Cox hazard-ratio interpretation requires a defined time origin, unit/reference, model stability and proportional-hazards assessment.
- Answer/rubric: ACCEPT — every independent/review response is locked, no-hint and confidence-bearing; rubrics require the relevant structured findings, a reasoning boundary and a maximum defensible conclusion. Primary, remediation and review asset IDs are distinct.
- Evidence source IDs: `src-pseudorep`; `src-dag`; `src-cox`; `src-pmsampsize`.
- PMID/DOI: Existing verified identifiers in `src/data/evidence.ts`; no new external source introduced.
- Risk level: HIGH.
- Verification status: ACCEPTED for the bounded M018 prototypes; no new curriculum or broader scientific claim was added.
- Changed files: `src/data/learningArchitecture.ts`; `src/domain/learningKernel.ts`; `src/features/learning/PracticeActivity.tsx`.

### SC-M018.1-02 — Case calibration wording

- Concept: Evidence-to-claim updating across fictionalized proteomics, scRNA and spatial/pathology evidence.
- Claim: Cohort-level association does not establish cell source or mechanism; discordant evidence changes relative plausibility without eliminating all competing explanations.
- Answer/rubric: ACCEPT — expert calibration is displayed only after original reasoning is locked; an optional learner update is stored separately and does not overwrite the original claim.
- Evidence source IDs: `src-multiomics`; `src-spatial`.
- PMID/DOI: Existing verified identifiers in `src/data/evidence.ts`; no new external source introduced.
- Risk level: HIGH.
- Verification status: ACCEPTED for the existing fictionalized case and its bounded association/mechanism language.
- Changed files: `src/data/learningArchitecture.ts`; `src/features/case-lab/CaseLabView.tsx`; `src/state/store.ts`.

## M018 architecture prototype review note

### SC-M018-01 — Statistical Unit and Confounding Concept Lessons

- Concept: Statistical Unit and Confounding as threshold concepts using distinct mental-model interactions.
- Claim: Patient-group inference must respect patient-level dependence; lower-level measurements improve measurement precision but do not create independent patients. Confounding is a common-cause structure and covariate adjustment must follow the target question and causal structure rather than include every measured variable.
- Answer/rubric: Explain uses a completeness checklist without automatic mastery. Statistical Unit Apply requires the independent level, dependence rationale and measurement-precision distinction. Confounding Apply requires the target question, common cause and adjustment-structure boundary.
- Evidence source IDs: `src-pseudorep`; `src-dag`.
- PMID/DOI: `10.1085/jgp.202012826`; `10.1097/00001648-199901000-00008`.
- Risk level: HIGH.
- Verification status: ACCEPTED for the bounded M018 teaching text; no universal patient-unit or adjust-all claim is made.
- Changed files: `src/data/learningArchitecture.ts`; `src/features/learning/LearningArchitectureView.tsx`.

### SC-M018-02 — Cox Method Lesson and fictionalized Evidence → Claim Case

- Concept: Cox proportional hazards regression; evidence-to-claim updating across proteomics, scRNA and spatial/pathology evidence.
- Claim: Cox models relative hazard under stated time-origin, censoring, specification and proportional-hazards assumptions; HR is not absolute risk. Cross-modal discordance changes the ranking of biological explanations but does not by itself establish a cell source or mechanism.
- Answer/rubric: The Cox audit asks for event-complexity, time origin, HR-unit, PH and validation issues plus a bounded conclusion. Case stages require updated interpretations, competing explanations, uncertainty, maximum claim and next minimal sufficient analysis; no total score is manufactured.
- Evidence source IDs: `src-cox`; `src-pmsampsize`; `src-multiomics`; `src-spatial`.
- PMID/DOI: `10.1002/sim.7992`; other identifiers remain those already verified in `src/data/evidence.ts`.
- Risk level: HIGH.
- Verification status: ACCEPTED for the scoped prototype; the oncology data are fictionalized and no causal/mechanistic conclusion is asserted.
- Changed files: `src/data/learningArchitecture.ts`; `src/features/case-lab/CaseLabView.tsx`; `src/features/learning/LearningArchitectureView.tsx`.

## M017 practice-asset review note

### SC-M017-01 — Role-distinct practice variants for the three verified Learning Units

- Concept: Statistical unit; biological versus technical replicate; pseudoreplication. M017 adds prediction, worked, self-check, guided, independent, delayed-review and far-transfer scenarios without adding a curriculum unit.
- Claim: No new general scientific claim is introduced. Each scenario applies the already accepted boundary that the inferential/independent layer depends on the research question, estimand, sampling/allocation and dependence structure; lower-level repeated measurements do not automatically increase biological n.
- Answer/rubric: Deterministic structured answers identify the relevant independent source or dependence error. Independent/review/transfer additionally require a short rationale; claim/project transfer requires a maximal conclusion boundary. Free text is presence-gated and is not assigned a fabricated AI accuracy score.
- Evidence source IDs: `src-pseudorep`; `src-pseudobulk`.
- PMID/DOI: `10.1085/jgp.202012826`; `10.1038/s41467-021-25960-2`.
- Risk level: HIGH
- Verification status: verified seed variants reviewed against the accepted M016 unit boundaries; no source status was promoted and no external pending content entered curriculum.
- Changed files: `src/data/learningUnits.ts`; `src/domain/learningKernel.ts`; `scripts/learning-kernel-audit.mjs`; `tests-node/suite.mjs`.

## M014-01 engineering status note

M014-01 added **no scientific content**: no new claims, sources, cards, answers or generated scientific text. The Chinese tutorial reuses existing pending demo content only; its preview exercise runs in isolated local state. Existing entries above are unchanged.

## M013-09 demo scientific corrections (this cycle)

All four demo cards/claims/paths/rubrics remain `pending` and `ai_generated`. No new sources were added; only exact REVIEW_RESULT M013-05 corrections were applied.

### SC-DEMO-01 — Temporal validation (internal vs external-in-time)

- Concept: `pa-internal-external` validation card. Random 80/20 splitting is internal validation. A locked model evaluated on genuinely later, non-overlapping, independent patients from the same centre may be reported separately as temporal validation/external-in-time; it does not establish geographic transportability or clinical readiness.
- Claim: Removed every absolute statement that same-centre later-period data "are not external validation" and every remaining "internal-only" contradiction: "same centre" alone is no longer a red flag (red flags are temporal overlap/model not locked, and overclaiming geographic/clinical transportability); "external = new source only," "downgrade all external results to internal," "最多构成" and "仅能声明内部性能" wording replaced across card context/boundary/implications, `pa-val-check-origin`, `pa-val-path` nodes, `pa-val-ev-origin` and `pa-val-case-boundary`. Added pending claim `pa-claim-temporal-validation` (qualifiedly supported by new pending A-level source `pa-src-altman-validation`, BMJ Altman 2009) and linked it from the card, `pa-val-check-origin` and `pa-val-ev-origin`; source and claim remain unverified.
- Answer/rubric: `pa-val-case-boundary` reference answer now reads: report random-split performance as internal; separately report the locked-model later-cohort result as temporal validation; new-centre evaluation and calibration/clinical-utility evidence are needed for geographic transportability or clinical-use claims.
- Evidence source IDs: `pa-src-internal-validation` (A), `pa-src-calibration` (C), `pa-src-probast` (S), `pa-src-tripod-ai` (S), `pa-src-altman-validation` (A, pending, Codex-reviewed M013 addition).
- PMID/DOI: `10.1016/S0895-4356(01)00341-9`; `10.1186/s12916-019-1466-7`; `10.7326/M18-1376`; `10.1136/bmj-2023-078378`; `10.1136/bmj.b605` (PMID 19477892).
- Risk level: HIGH
- Verification status: pending
- Changed files: `src/data/problemAtlas.ts`; `scripts/source-pack-audit.mjs` (allowlist for the Codex-added pending source); regenerated `data/problem_atlas/source_pack.json`.

### SC-DEMO-02 — Leakage parameter-learning qualification

- Concept: `pa-data-leakage` prediction card. Evaluation/external data must not determine preprocessing, imputation, feature-selection or standardization parameters; learn them in development data and apply them locked; prespecified adaptation changes the validation question.
- Claim: Removed "external untouched data can safely use overall statistics" from `pa-claim-leakage-ops` qualification and `pa-leakage-cause-imp` uncertaintyNote; claim text and `pa-data-leakage` bioinformaticsImplication now state the learn-and-lock rule; `pa-leakage-case-ai` statement/rubric updated consistently.
- Answer/rubric: `pa-leakage-case-ai` st2 text and rubric updated; other leakage rubrics unchanged.
- Evidence source IDs: `pa-src-leakage` (C).
- PMID/DOI: `10.1145/2382577.2382579`.
- Risk level: HIGH
- Verification status: pending
- Changed files: `src/data/problemAtlas.ts`; regenerated `data/problem_atlas/source_pack.json`.

### SC-DEMO-03 — Single-cell unit and pseudobulk qualification

- Concept: `pa-pseudorep` single-cell card. Cells may be the observation/analysis level but are not thereby independent experimental units for patient-group inference; donor dependence must be modeled. Pseudobulk is one defensible aggregation option, not the only valid method.
- Claim: `pa-claim-patient-unit` qualification no longer suggests cell-proportion questions make cells the independent statistical unit; `pa-pseudorep-cause-cells` uncertaintyNote distinguishes observation level from experimental unit; `pa-claim-pseudobulk` qualification names pseudobulk as one of several donor-dependence-modeling options.
- Answer/rubric: unchanged (already consistent).
- Evidence source IDs: `pa-src-pseudobulk` (A), `pa-src-pseudorep` (C).
- PMID/DOI: `10.1038/s41467-021-25960-2`; `10.1085/jgp.202012826`.
- Risk level: HIGH
- Verification status: pending
- Changed files: `src/data/problemAtlas.ts`; regenerated `data/problem_atlas/source_pack.json`.

### SC-DEMO-04 — Codex-reviewed authority-tier mapping and sequential rubric fix

- Concept: Registry authority tiers are Codex-reviewed M013 mappings, not inherited seed tiers: TRIPOD 2015 / TRIPOD+AI / PROBAST → S; peer-reviewed method/benchmark sources (`pa-src-internal-validation`, `pa-src-pseudobulk`) → A; explanatory review/education (`pa-src-pseudorep`, `pa-src-leakage`, `pa-src-calibration`) → C. Tier B is not used by the demo registry and its UI label no longer reads 技术参考; guidelines are never labeled as technical references.
- Claim: `pa-pseudorep-case-seq` rubric "患者应排在首位" replaced by the actual candidate explanation ("把细胞当作独立重复" ranks first); ranked entities remain candidate causes, not patients.
- Answer/rubric: sequential rubric corrected; temporal/leakage/single-cell rubrics updated under SC-DEMO-01…03.
- Evidence source IDs: `pa-src-tripod`, `pa-src-tripod-ai`, `pa-src-probast`, `pa-src-internal-validation`, `pa-src-pseudobulk`, `pa-src-pseudorep`, `pa-src-leakage`, `pa-src-calibration`.
- PMID/DOI: `10.7326/M14-0697`; `10.1136/bmj-2023-078378`; `10.7326/M18-1376`; `10.1016/S0895-4356(01)00341-9`; `10.1038/s41467-021-25960-2`; `10.1085/jgp.202012826`; `10.1145/2382577.2382579`; `10.1186/s12916-019-1466-7`.
- Risk level: HIGH
- Verification status: pending
- Changed files: `src/data/problemAtlas.ts`; `src/problem-atlas/labels.ts`; `src/features/problem-atlas/ProblemAtlasView.tsx`; `scripts/source-pack-audit.mjs`; regenerated `data/problem_atlas/source_pack.json`.

## M013-10 engineering status note

M013-10 added **no new scientific claim or content** and **rewrote no scientific text**. The legacy→v3 staging converter retained every candidate content as `pending` (legacy `metadata_verified`/`claim_verified` were demoted to `pending`; nothing was promoted). All 166 ProblemCards remain `unclassified` and import-ineligible pending M013-11 classification. The only text changes applied are the exact metadata corrections already listed below/audited in `M013_SOURCE_METADATA_AUDIT.md`: the DESpace URL correction and the six formal-title corrections (PMID 25482647, 26949479, 26388771; DOI 10.1101/pdb.prot087288, 10.1007/978-1-0716-2903-1_7, 10.1038/s41592-025-02890-1). Claim-level patches above (CLM-QPCR-006, CLM-SP-008, CLM-AI-004, CLM-REV-003 and scope/qualification fills) remain open for M013-11 and were not applied, because no exact patch text is recorded here. See `.agent/M013_V3_STAGING_REPORT.md` for full counts and disclosures.

Input: `ResearchOS_M013_COMPLETE_SourcePacks_20260824.zip` (8 packs, 120 source rows, 138 claims, 166 ProblemCards). Gate result is PATCH REQUIRED. No production import occurred and no item was promoted from `pending`.

## Corpus findings

- Metadata triage: 80/83 unique DOI resolved through Crossref; 5/5 PMID-only records resolved through Europe PMC. Three DOI lookups were rate-limited, not shown invalid. Eight title records and five online/print-year differences require manual normalization; 26 URL-only sources were not exhaustively bulk-resolved.
- Claim completeness: 86/138 claims have empty scope and 88/138 have empty qualification.
- Problem Atlas fitness: BLOCK the 166-card set from import pending reviewed type classification. Cards with 0/1/≥3 candidate causes are 139/27/0, but this count is only a diagnostic-card signal and must not be imposed on judgment/audit cards. All 166 are currently `unclassified`; 111 lack claim boundaries, 79 lack recommended reasoning, two lack a diagnostic path, and only 21 sequential evidence items plus 30 transfer cases exist. Type-specific completeness cannot be approved before classification.

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
- Reviewer note: None of the 166 ProblemCards is accepted as Atlas-ready before type classification; do not infer type or pad causes mechanically.

## Corpus-level disposition

- Evidence sources: retain as candidate metadata after correction/canonicalization; formal metadata verification must be reissued by the gate, not inherited from the producing model.
- Evidence claims: retain as candidate text; none is approved for `claim_verified` until scope, qualification, location and support type are corrected and re-reviewed.
- ProblemCards/paths/rubrics: BLOCK as importable Problem Atlas content. Preserve as `unclassified` staging records for M013-11 classification and type-specific review. Diagnostic cases require genuine competing explanations and evidence updating; judgment/audit cases must not be forced into a differential-diagnosis shape.

## M016 Learning Kernel scientific review — 2026-08-28

### SC-M016-01 — Statistical Unit

- Concept: Observation/measurement unit, experimental unit, statistical/inference unit and nested measurements.
- Claim: Row count is not automatically independent n; the inferential unit must follow the research question, assignment/sampling structure and estimand. Within-unit measurements may improve precision without creating independent upper-level replication.
- Answer/rubric: ACCEPT — independent answers must identify the relevant levels, align n with the target inference, acknowledge within-unit dependence, and state a bounded conclusion. “The unit is always the patient” is explicitly rejected as a universal rule.
- Evidence: `src-pseudorep`, `src-pseudobulk`.
- PMID/DOI: PMID `33464305`, DOI `10.1085/jgp.202012826`; PMID `34584091`, DOI `10.1038/s41467-021-25960-2`.
- Risk level: HIGH.
- Verification status: verified by Codex for the scoped teaching text in `lu-statistical-unit-v1`, revision 1.

### SC-M016-02 — Biological vs Technical Replicate

- Concept: Independent biological sources versus repeated processing/measurement of the same source.
- Claim: Technical replication can diagnose or reduce measurement error but cannot by itself estimate between-biological-unit variation or replace independent biological replication for that target population.
- Answer/rubric: ACCEPT — classification must use biological source, assignment and target inference rather than physical container/file count. Technical repeats are not described as useless.
- Evidence: `src-pseudorep`.
- PMID/DOI: PMID `33464305`, DOI `10.1085/jgp.202012826`.
- Risk level: HIGH.
- Verification status: verified by Codex for the scoped teaching text in `lu-biological-technical-replicate-v1`, revision 1.

### SC-M016-03 — Pseudoreplication

- Concept: Treating dependent/nested observations as independent replicates.
- Claim: Ignoring upper-level dependence can underestimate uncertainty and overstate significance; repair requires an analysis aligned with the real design. Aggregation/pseudobulk or a justified hierarchical model are possible approaches, not universal automatic fixes.
- Answer/rubric: ACCEPT — identify the assignment/sampling layer, preserve lower-level membership, express uncertainty at the target inferential layer, and retain a bounded descriptive role for lower-level measurements. A random effect is not taught as repairing confounding, too few independent units or a wrong estimand automatically.
- Evidence: `src-pseudorep`, `src-pseudobulk`.
- PMID/DOI: PMID `33464305`, DOI `10.1085/jgp.202012826`; PMID `34584091`, DOI `10.1038/s41467-021-25960-2`.
- Risk level: HIGH.
- Verification status: verified by Codex for the scoped teaching text in `lu-pseudoreplication-v1`, revision 1.

### SC-M016-AI — External AI content boundary

- Concept: AI-generated Learning Content Packs and audit patches.
- Claim: Schema validity and identifier presence do not establish scientific truth or evidence–claim support.
- Answer/rubric: ACCEPT — every external AI unit is forcibly normalized to `ai_generated`, `pending_review`, `pending`; it cannot enter the verified curriculum until a separate scientific gate. Audit prompts can propose pending patches only and cannot self-approve.
- Evidence: ResearchOS `PRODUCT_CONSTITUTION.md` and `SCIENTIFIC_GATES.md`; no new external scientific claim.
- PMID/DOI: not applicable.
- Risk level: HIGH process gate.
- Verification status: not_required for the engineering mechanism; generated scientific payloads remain pending.
