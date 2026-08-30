import type { AuditCase, AuditStep } from "../domain/types";
import { expandedAuditCases } from "./expandedTraining.js";

const step = (id: string, text: string, expected: AuditStep["expected"], issue?: string, severity?: AuditStep["severity"]): AuditStep => ({ id, text, expected, issue, severity });
const audit = (
  id: string, title: string, domain: string, task: string, context: string, steps: AuditStep[],
  missedRisks: string[], seniorSummary: string, transferPrompt: string, sourceIds: string[],
): AuditCase => ({
  id, title, domain, task, context, steps, missedRisks, seniorSummary, transferPrompt, sourceIds,
  contentOrigin: "verified_seed", verificationStatus: "verified",
  difficulty: steps.some((entry) => entry.severity === "critical") ? "advanced" : "intermediate",
  misconceptionTags: [title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")],
  variantPrompt: `Audit a new plan that makes the same hidden assumption as “${title}”, without copying the original scenario.`,
});

export const auditCases: AuditCase[] = [
  ...expandedAuditCases,
  audit("audit-01", "Cell-level DEG plan", "single-cell", "Compare subtype 2 vs subtype 1 within tumor macrophages.", "Six patients per subtype; cell yield varies ten-fold.", [
    step("a01-1", "Pool all macrophages by subtype.", "reject", "Removes patient-level replication and hides heterogeneity.", "critical"),
    step("a01-2", "Run cell-level Wilcoxon FindMarkers.", "reject", "Pseudoreplication for a patient-level subtype contrast.", "critical"),
    step("a01-3", "Keep genes with raw P<0.05.", "reject", "No multiple-testing control or effect threshold.", "major"),
    step("a01-4", "Run KEGG on significant genes.", "question", "Only interpretable after a valid DEG result and explicit universe/direction.", "major"),
    step("a01-5", "Claim subtype-specific macrophage biology.", "reject", "Confounding and patient consistency are unaddressed.", "critical"),
  ], ["Patient-level confounding", "Unequal cell yield", "Per-patient direction", "FDR and effect-size threshold"], "The plan's central error is using cells as independent replicates. Rebuild the contrast at patient×cell-type level and retain subject covariates.", "Write the aggregation key and design formula for your analogous comparison.", ["src-pseudobulk", "src-pseudorep", "src-multiple-testing"]),
  audit("audit-02", "Survival model plan", "survival", "Test whether a protein predicts overall survival.", "140 patients, 31 deaths, 18 candidate covariates.", [
    step("a02-1", "Dichotomize every continuous variable at its median.", "reject", "Information loss and arbitrary cutpoints.", "major"),
    step("a02-2", "Run univariable Cox models and retain P<0.05 variables.", "reject", "Data-driven screening omits confounder/prognostic rationale and adds instability.", "major"),
    step("a02-3", "Fit the retained variables plus protein in one Cox model.", "question", "31 events may not support the effective complexity; penalization/pre-specification needed.", "critical"),
    step("a02-4", "Check proportional hazards and nonlinear functional form.", "approve"),
    step("a02-5", "Report adjusted HR and confidence interval.", "approve"),
  ], ["Event-limited information", "Missing-data plan", "Assay/cutpoint pre-specification", "Internal optimism"], "The AI selected variables and transformations from the same sparse outcome data. The adjusted HR would likely be unstable.", "Count events and effective parameters in your planned survival model.", ["src-cox", "src-remark", "src-probaST"]),
  audit("audit-03", "Model validation plan", "prediction", "Validate a recurrence model developed at center A.", "Center B has 260 patients and 70 events.", [
    step("a03-1", "Refit all coefficients in center B.", "reject", "This prevents untouched validation of the original model.", "critical"),
    step("a03-2", "Select a new optimal risk threshold in center B.", "reject", "Uses validation outcomes to tune the decision rule.", "major"),
    step("a03-3", "Report C-index only.", "reject", "Absolute-risk calibration and clinical utility are missing.", "major"),
    step("a03-4", "Apply the full locked model and preprocessing first.", "approve"),
    step("a03-5", "Report calibration intercept, slope, plot, and discrimination.", "approve"),
  ], ["Missing predictor handling", "Setting/case-mix differences", "Confidence intervals", "Updating must be separate"], "Untouched application must precede any recalibration or model updating.", "List the exact model objects that must remain locked in your external validation.", ["src-tripod", "src-calibration", "src-probaST"]),
  audit("audit-04", "Cell proportion plan", "single-cell", "Compare regulatory T-cell abundance between responders and nonresponders.", "Five versus five patients with unequal capture depth.", [
    step("a04-1", "Pool all cells within response groups.", "reject", "Destroys patient-level variation.", "critical"),
    step("a04-2", "Apply chi-square test to pooled counts.", "reject", "Cells are not independent and composition is ignored.", "critical"),
    step("a04-3", "Plot each patient's proportion and total captured cells.", "approve"),
    step("a04-4", "Use a sample-aware abundance/compositional model.", "approve"),
    step("a04-5", "Interpret captured fraction as absolute tissue abundance.", "reject", "Dissociation and sampling affect capture proportions.", "major"),
  ], ["QC/dissociation differences", "Tumor purity", "Covariate imbalance", "Cell label uncertainty"], "The inferential unit is patient; pooled-cell significance cannot establish response-group abundance.", "Create a per-patient abundance plot for one cell class in your project.", ["src-pseudobulk", "src-pseudorep"]),
  audit("audit-05", "Spatial mechanism plan", "spatial", "Test whether macrophages drive exhausted T-cell niches.", "Three tumors; spot-based transcriptomics and matched histology.", [
    step("a05-1", "Compute spot-level ligand–receptor scores.", "question", "Useful hypothesis generation, but resolution and mixture must be explicit.", "minor"),
    step("a05-2", "Pool spots and test adjacency as independent observations.", "reject", "Patient/section nesting is ignored.", "critical"),
    step("a05-3", "Adjust for tissue compartment and local density.", "approve"),
    step("a05-4", "Validate proximity with multiplex imaging.", "approve"),
    step("a05-5", "Conclude causal macrophage signaling.", "reject", "Proximity/expression lacks direction and perturbation.", "critical"),
  ], ["Spot mixtures", "Three-patient generalizability", "Serial-section dependence", "Functional perturbation"], "The data can establish spatial association, not a causal interaction. Mechanism needs molecular and functional intervention.", "Name one anatomical confounder and one perturbation for your spatial hypothesis.", ["src-spatial", "src-cellchat", "src-pseudorep"]),
  audit("audit-06", "Pathway enrichment plan", "omics", "Interpret a tumor-vs-normal transcriptomic contrast.", "12 paired samples; 18,000 tested genes.", [
    step("a06-1", "Use paired patient design for gene-level statistics.", "approve"),
    step("a06-2", "Select raw P<0.05 genes.", "reject", "Multiplicity is ignored.", "major"),
    step("a06-3", "Use every known human gene as ORA background.", "reject", "Background should reflect genes eligible/tested in the assay.", "major"),
    step("a06-4", "Run signed ranked enrichment with FDR.", "approve"),
    step("a06-5", "Call enriched pathways activated mechanisms.", "reject", "Expression enrichment is not pathway activity or causality.", "major"),
  ], ["Gene-set version", "Redundant sets", "Leading-edge genes", "Patient-level effect consistency"], "A valid paired gene-level statistic and explicit enrichment universe are prerequisites; interpret pathways as programs, not mechanisms.", "Record the gene universe and ranking statistic for your next enrichment run.", ["src-gsea", "src-multiple-testing"]),
  audit("audit-07", "Clustering plan", "molecular subtype", "Discover proteomic subtypes associated with survival.", "85 tumors, two acquisition batches.", [
    step("a07-1", "Normalize and examine batch–clinical balance.", "approve"),
    step("a07-2", "Try k=2…10 and choose the smallest survival P value.", "reject", "Outcome-guided cluster selection causes double dipping.", "critical"),
    step("a07-3", "Check resampling stability and batch composition.", "approve"),
    step("a07-4", "Describe pathways distinguishing the selected clusters.", "question", "Descriptive only until selection and enrichment are valid.", "minor"),
    step("a07-5", "Call the clusters validated clinical subtypes.", "reject", "No locked classifier or independent cohort.", "critical"),
  ], ["Missing protein mechanism", "Cluster assignment for new samples", "Multiple survival comparisons", "Small cohort"], "Choose and validate structure independently of the same outcome test; external assignment is needed for a subtype claim.", "Choose two perturbations under which your subtype solution should remain stable.", ["src-clustering", "src-batch", "src-leakage"]),
  audit("audit-08", "Multi-omics integration plan", "multi-omics", "Find a cross-omic treatment-response signature.", "Matched RNA, protein, and methylation in 48 patients.", [
    step("a08-1", "Filter features using response labels in all patients.", "reject", "Supervised selection leaks outcomes into evaluation.", "critical"),
    step("a08-2", "Concatenate z-scored modalities.", "question", "A baseline is possible but weights, missingness, and scale assumptions need justification.", "minor"),
    step("a08-3", "Randomly split omic rows rather than patients.", "reject", "Patient identity must define the split.", "critical"),
    step("a08-4", "Nest integration, selection, and tuning inside patient-level CV.", "approve"),
    step("a08-5", "Compare against modality-specific and clinical baselines.", "approve"),
  ], ["Small-sample instability", "Missing modalities", "Batch per modality", "Calibration"], "The full integration procedure—not only the last classifier—must be evaluated within patient-level resampling.", "Draw your integration and model-selection operations inside an outer patient split.", ["src-leakage", "src-multiomics", "src-internal-validation"]),
  audit("audit-09", "Biomarker plan", "biomarker", "Develop an IHC marker for recurrence risk.", "Discovery tissue microarray and a second core from the same patients.", [
    step("a09-1", "Optimize staining cutoff against recurrence.", "question", "Permissible discovery, but must be labeled and locked before validation.", "major"),
    step("a09-2", "Use the second core from the same patients as external validation.", "reject", "This is technical/spatial replication, not independent clinical validation.", "critical"),
    step("a09-3", "Report inter-reader and assay reproducibility.", "approve"),
    step("a09-4", "Adjust for established clinical prognostic factors.", "approve"),
    step("a09-5", "Claim the marker is ready for clinical use.", "reject", "External validity and utility are absent.", "critical"),
  ], ["Cutpoint optimism", "Missing-data selection", "Incremental value", "Clinical-grade assay"], "Analytical replication and independent clinical validation answer different questions and must not be conflated.", "Separate your biomarker evidence into analytical validity, clinical validity, and utility.", ["src-remark", "src-tripod"]),
  audit("audit-10", "Organoid drug plan", "organoid", "Test a targeted drug in patient-derived organoids.", "Two donor lines; eight wells per dose.", [
    step("a10-1", "Treat every well as an independent n.", "reject", "Wells are nested technical observations.", "critical"),
    step("a10-2", "Fit dose-response curves per donor.", "approve"),
    step("a10-3", "Report target engagement and normal-cell selectivity.", "approve"),
    step("a10-4", "Use the concentration with maximal effect without exposure context.", "reject", "Clinical plausibility and dose selection are unaddressed.", "major"),
    step("a10-5", "Claim likely patient efficacy.", "reject", "Two in vitro donors do not establish clinical benefit.", "critical"),
  ], ["Independent donor number", "Assay reproducibility", "Vehicle/positive controls", "PK/PD"], "Evidence supports responses in tested organoids only; donor-level replication, pharmacology, and in vivo/clinical triangulation are missing.", "State your biological replicate and clinically plausible exposure range.", ["src-pseudorep"]),
  audit("audit-11", "Causal language plan", "scientific reasoning", "Draft a narrative from cross-sectional tumor profiling.", "Expression, survival association, and pathway enrichment only.", [
    step("a11-1", "Say the factor is associated with poor survival.", "approve"),
    step("a11-2", "Say the factor drives metastasis.", "reject", "No perturbation, temporality, or causal identification.", "critical"),
    step("a11-3", "Say enriched programs are compatible with EMT biology.", "approve"),
    step("a11-4", "Say pathway analysis proves EMT activation.", "reject", "Enrichment is annotation-level expression evidence.", "major"),
    step("a11-5", "Propose perturbation and rescue as next experiments.", "approve"),
  ], ["Confounding", "Cell-composition effects", "Independent cohort", "Protein localization"], "Calibrate verbs to evidence: association and program compatibility are supported; mechanistic driving is not.", "Audit the causal verbs in one current figure title.", ["src-strobe", "src-gsea"]),
  audit("audit-12", "Figure narrative plan", "storytelling", "Organize a paper on a candidate immune target.", "Data include cohort association, scRNA localization, spatial proximity, cell-line knockdown, and mouse response.", [
    step("a12-1", "Open with cohort/question and discovery.", "approve"),
    step("a12-2", "Place localization before claiming a cell-specific mechanism.", "approve"),
    step("a12-3", "Present spatial proximity as functional validation.", "reject", "Spatial association does not validate function.", "major"),
    step("a12-4", "Use perturbation then in vivo response to climb the evidence ladder.", "approve"),
    step("a12-5", "End with clinical efficacy as established.", "reject", "Mouse efficacy is not clinical efficacy.", "critical"),
  ], ["Rescue", "Target engagement", "Independent human validation", "Therapeutic window"], "The narrative should make each figure perform one evidence task and keep the terminal claim at preclinical support.", "Label the evidence job of each figure in your draft with one verb phrase.", ["src-spatial", "src-pseudorep"]),
  audit("audit-13", "Literature citation plan", "evidence", "Support a method choice using an AI-generated reading list.", "The AI supplies 12 DOI/PMID pairs without quotations or metadata checks.", [
    step("a13-1", "Save all citations as verified because identifiers look plausible.", "reject", "Plausible identifiers can be fabricated or mismatched.", "critical"),
    step("a13-2", "Resolve identifiers through PubMed/Crossref.", "approve"),
    step("a13-3", "Check that each source supports the exact claim.", "approve"),
    step("a13-4", "Keep unresolved items pending while offline.", "approve"),
    step("a13-5", "Let AI-generated explanation overwrite user notes.", "reject", "Original user work and generated content must remain separate.", "critical"),
  ], ["Retractions/corrections", "Guideline version", "Primary vs secondary source", "Verification timestamp"], "Metadata resolution is necessary but not sufficient: claim-level support must also be inspected, and generated content remains distinct.", "Choose one citation in your project and record identifier, source type, supported claim, and verification date.", ["src-strobe"]),
  audit("audit-14", "Data leakage plan", "machine learning", "Build a histology–omics survival model.", "Three slides and multiple tiles per patient; 130 patients.", [
    step("a14-1", "Normalize all slides before splitting.", "question", "Fixed normalization may be acceptable; learned normalization must be trained within folds.", "major"),
    step("a14-2", "Randomly split image tiles into folds.", "reject", "Tiles from one patient leak identity across folds.", "critical"),
    step("a14-3", "Select genes using all survival outcomes.", "reject", "Outcome-aware feature leakage.", "critical"),
    step("a14-4", "Group outer folds by patient and nest selection/tuning.", "approve"),
    step("a14-5", "Evaluate calibration in addition to discrimination.", "approve"),
  ], ["Center/slide batch", "Event count", "Multiple candidate models", "Missing modality handling"], "Split by the highest independent unit before every learned operation; tiles and slides cannot cross patient folds.", "Identify the highest grouping unit for every modality in your prediction pipeline.", ["src-leakage", "src-tripod", "src-probaST"]),
  audit("audit-15", "External reference plan", "validation", "Validate an AI-generated risk score in a public cohort.", "The formula omits preprocessing details and uses unavailable variables.", [
    step("a15-1", "Impute unavailable predictors as zero.", "reject", "Changes the model without justification and can create systematic error.", "critical"),
    step("a15-2", "Infer preprocessing from the validation data.", "reject", "The original model is not reproducible/locked.", "critical"),
    step("a15-3", "Request the full formula, coding, baseline risk, and preprocessing.", "approve"),
    step("a15-4", "Document target-cohort differences and missingness.", "approve"),
    step("a15-5", "If unrecoverable, label validation infeasible rather than fabricate implementation.", "approve"),
  ], ["Outcome definition compatibility", "Time horizon", "Unit conversion", "Licensing/access"], "A model that cannot be fully implemented cannot be externally validated. Transparency is a methodological prerequisite, not an administrative detail.", "List every artifact another center needs to reproduce your model predictions.", ["src-tripod", "src-probaST"]),
];
