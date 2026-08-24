# Scientific Gates

Last updated: 2026-08-24

## Non-negotiable evidence rules

1. Every scientific training item has provenance, a stable source ID, content origin, verification status, and difficulty.
2. DOI/PMID syntax and metadata resolution are automated gates. Claim support requires a human/Codex reading-level decision and a declared `verificationScope`.
3. AI-generated or materially AI-paraphrased scientific content remains pending until reviewed against reliable evidence.
4. Reference answers state what the design supports, what it does not support, the likely failure mode, and a safer alternative.
5. Uncertainty, missingness, selection, multiplicity, transportability, and the statistical unit are made explicit when relevant.
6. No fabricated citation, identifier, result, effect size, guideline requirement, or quotation is tolerated.

## HIGH risk — Codex item-level review required

- Statistics, causal inference, survival, prediction and calibration.
- scRNA-seq, pseudobulk, differential abundance, trajectory and cell–cell communication inference.
- Pseudoreplication, clustered data, spatial inference and multi-omics claims.
- Evidence–claim boundaries, reference answers, answer rubrics and reporting-guideline statements.

Acceptance questions:

1. Is the estimand/question explicit and compatible with the design?
2. Is the statistical unit correct, with dependence handled?
3. Are leakage, confounding, selection and multiplicity addressed?
4. Does the maximal conclusion stay within the evidence?
5. Does the safer approach repair the actual failure rather than add cosmetic analysis?
6. Do cited sources support this exact teaching claim?

## MEDIUM risk — batch Codex review

Paper patterns, figure exercises, reviewer cases and transfer cases. OpenCode may generate them, but must provide representative samples, duplicate results, evidence links and rubric summaries.

## LOW risk — no scientific review

UI strings, CSS, navigation, settings, backup UI, keyboard shortcuts, ordinary engineering tests and non-semantic formatting.

## Domain-specific boundaries

- Causal: temporal order and identification assumptions precede causal language; adjustment is not automatically identification.
- Survival: time origin, censoring, competing risks, proportional hazards and time-dependent bias must match the estimand.
- Prediction: development, internal validation and external validation are distinct; all data-driven steps occur inside resampling; discrimination alone is insufficient.
- Omics/single-cell: patient/sample, not cell, is usually the independent biological replicate for group inference; integration and clustering do not create replication.
- Spatial/multi-omics: colocalization, latent factors and ligand–receptor scores are hypotheses or associations unless functional evidence supports more.
- Reporting guidance: reporting completeness is not proof of low bias or validity.

## EXPERIMENTAL PROTOCOL HIGH-RISK GATE

Protocol Lab is an experimental-reasoning and design-review system, not an SOP encyclopedia. It must not present universal reagent volumes, incubation times, patient-management instructions, or device-control procedures.

Codex reviews every item that defines experimental/statistical units, biological/technical replication, required controls, quantification, allowed/forbidden claims, troubleshooting answers, design rubrics, or the boundary between scientific principle, example implementation and manufacturer-specific instruction.

An item passes only when:

1. The scientific question and experimental unit are explicit before wells, images, fields or repeated reads are counted.
2. Technical replication improves measurement precision but is never taught as new biological n.
3. Controls are assay-specific, justified by what they diagnose, and not copied as a generic checklist.
4. Troubleshooting permits multiple plausible causes and uses new QC evidence to update priority.
5. Quantification identifies signal range/saturation, normalization, batch handling and the level entering the statistical model.
6. The allowed claim is no stronger than the readout and design; association, abundance or viability alone is not mechanism.
7. Concrete conditions are qualified as examples or source/manufacturer-specific, never universal scientific rules.
8. Claim-level evidence records claim, source type, supporting section, scope, qualification and pending/verified state.

Evidence priority: authoritative guideline/consensus → Nature Protocols → STAR Protocols → original method paper → high-quality methods review → validated manufacturer protocol → institutional SOP. Manufacturer sources support reagent-specific implementation only unless independently justified.

## Gate result

Codex writes only `ACCEPT`, `REJECT`, or `PATCH REQUIRED` in `REVIEW_RESULT.md`, followed by necessary reasons and exact task IDs. Accepted scientific changes may then move from pending to verified with scope and review date recorded.
