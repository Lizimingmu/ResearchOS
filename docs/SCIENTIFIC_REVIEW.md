# ResearchOS scientific review

*Claim-level review of the v0.10.1 training inventory; this is a content reliability assessment, not an educational-effectiveness trial.*

---

## 🔬 What content was reviewed?

The review covered 49 evidence sources and every source-linked training entity: 88 method concepts, 25 research patterns, 84 judgment cards, and 40 AI-audit cases. It focused on statistical units, bias and causal inference, prediction-model validation, diagnostic and survival research, missing data, bulk and single-cell omics, spatial/multimodal analysis, radiomics, digital pathology, CRISPR/perturbation studies, liquid biopsy, and responsible AI-assisted research.

All 286 distributed source/content records are marked `verified`; 84 of 88 method concepts are enabled for practice. Four scientifically sourced method drafts—model updating, batch-correction sensitivity, spatial resolution/deconvolution, and reporting-versus-rigor—remain excluded from scheduling until their instructional examples are expanded.

## 📚 What sources were used?

The evidence set combines primary benchmark/empirical studies (tier A) with methods papers and authoritative reporting frameworks (tier B). Examples include single-cell best-practice and integration benchmarks,[^luecken][^scib] sample-aware differential abundance,[^milo] ambient-RNA correction,[^soupx] proteomics missing-data analysis,[^proteomics] and PRISMA/TRIPOD reporting guidance.[^prisma][^tripod]

No copyrighted article full text is bundled. Publisher pages, PubMed records, official reporting-guideline sites, and source abstracts were used to delimit claims.

## ✅ How were claims verified?

1. DOI and PMID syntax, uniqueness, and pairing were checked by the content release gate.
2. Bibliographic metadata was resolved against PubMed or official publisher/guideline pages.
3. Claim-level summaries were constrained to what the reported design and abstract support; identifier resolution alone is separately represented by `verificationScope` and cannot verify a scientific claim.
4. Every training source foreign key was resolved; duplicate IDs/titles and missing scientific fields are release-blocking.
5. AI-generated content cannot declare itself verified. Optional model output stays labeled as critique and cannot edit seed evidence.

The review corrected several initially recalled identifiers before release, including the scIB benchmark, proteomics missing-value paper, and SPARK spatial-method record. This is precisely why the release gate treats human recall as a lead, never as provenance.

## 🧭 What content remains pending?

- Four verified method drafts are intentionally not usable, as listed above.
- Live frontier surveillance is not automated; literature after the recorded verification date requires a new human review.
- No provider-generated lesson has a promotion path to verified content.
- The inventory does not yet provide deep modules for wet-lab assay validation, health economics, adaptive trials, meta-analysis heterogeneity, or qualitative/mixed-methods research.

`verificationStatus=pending` records in the shipped seed inventory: **0**. This does not mean the field is settled; it means uncertain material was either framed as a limitation, excluded, or retained as a non-usable draft.

## ⚠️ What methodological areas remain weak?

The most important gaps are advanced longitudinal/causal estimands, informative censoring, missing-not-at-random sensitivity analysis, diagnostic test verification bias, inter-rater measurement models, federated/privacy-preserving analysis, wet-lab reproducibility, and formal evidence synthesis. Omics coverage is broad but still teaches audit-level judgment rather than executable pipelines.

The content is deliberately stronger on identifying invalid inference than on prescribing a single preferred estimator. Method choice still depends on design, estimand, data-generating process, and domain expertise.

## 🧯 What controversial topics were intentionally framed cautiously?

- Trajectory, RNA velocity, cell-cell communication, spatial colocalization, and RNA-derived CNV are treated as model-based hypotheses—not direct observations of lineage, signaling, mechanism, or genotype.
- Batch integration is evaluated for both mixing and biological conservation; aggressive mixing is not treated as success by itself.
- Causal machine learning, target-trial emulation, and DAGs require explicit assumptions and do not manufacture identification from observational data.
- Foundation models and AI-assisted research are treated as tools requiring external validation, leakage control, evidence citation, and human accountability—not autonomous scientific authorities.
- Radiomics, liquid biopsy, and digital-pathology performance are separated from calibration, clinical utility, transportability, and prospective validation.
- Reporting checklists improve transparency but are not numerical study-quality or risk-of-bias scores.

## 🧾 Review conclusion

The v0.10.1 inventory passes its automated provenance and structure gate with no blocking scientific-content defect found. The conclusion is bounded: the content has auditable sources and cautious claims; it has not been shown by a trial to improve research competence or downstream scientific outcomes.

[^luecken]: [Current best practices in single-cell RNA-seq analysis (PubMed)](https://pubmed.ncbi.nlm.nih.gov/31217225/)
[^scib]: [Benchmarking atlas-level data integration in single-cell genomics (PubMed)](https://pubmed.ncbi.nlm.nih.gov/34949812/)
[^milo]: [Differential abundance testing on single-cell data using k-nearest neighbor graphs (Nature Biotechnology)](https://www.nature.com/articles/s41587-021-01033-z)
[^soupx]: [SoupX removes ambient RNA contamination from droplet-based single-cell RNA sequencing data (PubMed)](https://pubmed.ncbi.nlm.nih.gov/33367645/)
[^proteomics]: [Evaluation of missing value imputation methods for label-free quantitative proteomics (PubMed)](https://pubmed.ncbi.nlm.nih.gov/26906401/)
[^prisma]: [PRISMA 2020 statement (PubMed)](https://pubmed.ncbi.nlm.nih.gov/33782057/)
[^tripod]: [TRIPOD+AI scope](https://www.tripod-statement.org/scope/)
