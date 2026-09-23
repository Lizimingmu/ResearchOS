# ResearchOS Pilot Topic Selection & Safety Audit

**Date**: 2026-09-24  
**Target Build**: `codex/pilot-ready-v0.1`  
**Baseline**: `5eb326263f689711fe6972280cb506f9218e2834`  
**Audit Standard**: Fresh External Strict-Blind Review Revealed Comparison (`M019_1C_FRESH_EXTERNAL_BLIND_COMPARISON.json`)

---

## 1. Executive Summary

- **Total Curriculum Lessons Evaluated**: 61 (40 Concept Lessons, 21 Method Lessons)
- **Total Assessments Evaluated**: 183
- **External Blind Review Status**:
  - Reviewer Clear: 183 / 183 (0 Ambiguous)
  - Author vs. Reviewer Agree: 157 (85.79%)
  - Author vs. Reviewer Disagree: 26 (14.21%)
- **Zero Pollution Invariant**:
  - None of the 26 disagreement assessments may generate standardized competence evidence (`competenceScoringAllowed = false`).
  - The main Pilot path excludes any lesson containing even a single disagreement assessment.
- **Pilot Selection Goal**: 6–8 foundational topics.
- **Selected Topics**: Exactly **8 Safe Foundation Topics** with 100% blind agreement across all associated assessments.

---

## 2. Selection Methodology

Topics were evaluated against 8 strict eligibility criteria:
1. Lesson exists in the curriculum manifest.
2. Lesson prerequisites are valid and satisfiable.
3. KnowledgeUnit bindings are resolved and non-cyclic.
4. Zero unresolved KnowledgeUnit bindings.
5. All 3 lesson assessments (primaryApply, remediation, delayedReview) have **100% author/external-reviewer agreement** (0 disagreements).
6. Zero blind ambiguous flags (all marked CLEAR).
7. Zero maintenance holds or scientific freeze blocks.
8. Assessment materialization and scoring rules are verified and deterministic.

---

## 3. Preferred Candidates Evaluation

| Candidate Topic | Lesson ID | Assessment IDs | Blind Status | Decision | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Statistical Unit** | `staged-concept-statistical-unit` | A016, A017, A018 | 3/3 AGREE | **SELECTED** | Passes all 8 criteria; core foundation |
| **Biological vs Technical Replicates** | `staged-concept-biological-technical-replicate` | A019, A020, A021 | 2 AGREE, 1 DISAGREE | **EXCLUDED** | Disputed assessment A021 (`...review-v3`) |
| **Pseudoreplication** | `staged-concept-pseudoreplication` | A022, A023, A024 | 3/3 AGREE | **SELECTED** | Passes all 8 criteria |
| **Confounding** | `staged-concept-confounding` | A028, A029, A030 | 3/3 AGREE | **SELECTED** | Passes all 8 criteria; essential for study design |
| **Confidence Interval** | `staged-concept-confidence-interval` | A043, A044, A045 | 3/3 AGREE | **SELECTED** | Passes all 8 criteria |
| **Hazard Ratio** | `staged-concept-hazard-ratio` | A070, A071, A072 | 3/3 AGREE | **SELECTED** | Passes all 8 criteria |
| **Evidence vs Claim** | `staged-concept-evidence-claim` | A007, A008, A009 | 2 AGREE, 1 DISAGREE | **EXCLUDED** | Disputed assessment A009 (`...review-v3`) |
| **Alternative Explanation** | `staged-concept-alternative-explanation` | A097, A098, A099 | 3/3 AGREE | **SELECTED** | Passes all 8 criteria |

### Fallback Foundation Topics Added (to achieve 8 safe topics)

| Additional Foundation Topic | Lesson ID | Assessment IDs | Blind Status | Decision | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Selection Bias** | `staged-concept-selection-bias` | A031, A032, A033 | 3/3 AGREE | **SELECTED** | Core study design foundation; 100% agreement |
| **Internal & External Validity** | `staged-concept-internal-external-validity` | A034, A035, A036 | 3/3 AGREE | **SELECTED** | Core study design foundation; 100% agreement |

---

## 4. Final Selected Pilot Curriculum (8 Topics)

1. **统计单位 (Statistical Unit)** (`staged-concept-statistical-unit` / `concept-statistical-unit-v1`)
   - Assessments: A016 (Apply), A017 (Remediation), A018 (Review)
   - Competence Eligibility: **ALLOWED** (`competenceScoringAllowed = true`)
2. **伪重复 (Pseudoreplication)** (`staged-concept-pseudoreplication`)
   - Assessments: A022 (Apply), A023 (Remediation), A024 (Review)
   - Competence Eligibility: **ALLOWED** (`competenceScoringAllowed = true`)
3. **混杂 (Confounding)** (`staged-concept-confounding` / `concept-confounding-v1`)
   - Assessments: A028 (Apply), A029 (Remediation), A030 (Review)
   - Competence Eligibility: **ALLOWED** (`competenceScoringAllowed = true`)
4. **选择偏倚 (Selection Bias)** (`staged-concept-selection-bias`)
   - Assessments: A031 (Apply), A032 (Remediation), A033 (Review)
   - Competence Eligibility: **ALLOWED** (`competenceScoringAllowed = true`)
5. **内部效度与外部效度 (Internal & External Validity)** (`staged-concept-internal-external-validity`)
   - Assessments: A034 (Apply), A035 (Remediation), A036 (Review)
   - Competence Eligibility: **ALLOWED** (`competenceScoringAllowed = true`)
6. **置信区间 (Confidence Interval)** (`staged-concept-confidence-interval`)
   - Assessments: A043 (Apply), A044 (Remediation), A045 (Review)
   - Competence Eligibility: **ALLOWED** (`competenceScoringAllowed = true`)
7. **风险率比 (Hazard Ratio)** (`staged-concept-hazard-ratio`)
   - Assessments: A070 (Apply), A071 (Remediation), A072 (Review)
   - Competence Eligibility: **ALLOWED** (`competenceScoringAllowed = true`)
8. **替代解释 (Alternative Explanation)** (`staged-concept-alternative-explanation`)
   - Assessments: A097 (Apply), A098 (Remediation), A099 (Review)
   - Competence Eligibility: **ALLOWED** (`competenceScoringAllowed = true`)

---

## 5. Excluded Lessons & Blocked Disagreement Items (26 Items)

The following 26 assessments had author / external-reviewer disagreement in `M019_1C_FRESH_EXTERNAL_BLIND_COMPARISON.json`. Every one of them is enforced with `competenceScoringAllowed = false`:

1. `A009`: `staged-concept-evidence-claim-review-v3` (Lesson: Evidence vs Claim)
2. `A014`: `staged-concept-exploratory-confirmatory-remediation-v2` (Lesson: Exploratory vs Confirmatory)
3. `A015`: `staged-concept-exploratory-confirmatory-review-v3` (Lesson: Exploratory vs Confirmatory)
4. `A021`: `staged-concept-biological-technical-replicate-review-v3` (Lesson: Biological vs Technical Replicates)
5. `A041`: `staged-concept-standard-error-remediation-v2` (Lesson: Standard Error)
6. `A048`: `staged-concept-p-value-review-v3` (Lesson: P value)
7. `A050`: `staged-concept-multiple-testing-fdr-remediation-v2` (Lesson: FDR)
8. `A057`: `staged-concept-interaction-review-v2` (Lesson: Interaction)
9. `A077`: `staged-concept-composition-state-remediation-v3` (Lesson: Composition vs Within-State)
10. `A078`: `staged-concept-composition-state-review-v3` (Lesson: Composition vs Within-State)
11. `A079`: `staged-concept-batch-effect-apply-v2` (Lesson: Batch Effect)
12. `A080`: `staged-concept-batch-effect-remediation-v2` (Lesson: Batch Effect)
13. `A084`: `staged-concept-bulk-mixture-review-v3` (Lesson: Bulk Tissue is a Mixture)
14. `A085`: `staged-concept-rna-protein-apply-v2` (Lesson: RNA ≠ Protein)
15. `A086`: `staged-concept-rna-protein-remediation-v2` (Lesson: RNA ≠ Protein)
16. `A087`: `staged-concept-rna-protein-review-v2` (Lesson: RNA ≠ Protein)
17. `A102`: `staged-concept-claim-boundary-review-v3` (Lesson: Claim Boundary)
18. `A105`: `staged-concept-robustness-review-v3` (Lesson: Robustness)
19. `A113`: `staged-concept-evidence-redundancy-remediation-v3` (Lesson: Corroboration vs Redundancy)
20. `A125`: `staged-method-correlation-remediation-v2` (Method Lesson: Correlation)
21. `A138`: `staged-method-kaplan-logrank-review-v3` (Method Lesson: Kaplan-Meier)
22. `A144`: `staged-method-bootstrap-review-v3` (Method Lesson: Bootstrap)
23. `A159`: `staged-method-nmf-review-v3` (Method Lesson: NMF)
24. `A171`: `staged-method-wgcna-review-v3` (Method Lesson: WGCNA)
25. `A177`: `staged-method-differential-abundance-review-v3` (Method Lesson: Differential Abundance)
26. `A180`: `staged-method-trajectory-pseudotime-review-v3` (Method Lesson: Trajectory & Pseudotime)

---

## 6. Safety Assertions

- Disagreement assessments producing competence: **0**
- Canonical KnowledgeUnit schema/lifecycle modifications: **0**
- Author-key changes: **0**
- External reviewer files modified: **0**
