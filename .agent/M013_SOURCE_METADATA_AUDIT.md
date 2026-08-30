# M013 External Source Metadata Audit

Generated: 2026-08-24T16:21:03.883Z

- Source rows: **120**
- Unique DOI resolved: **80/83**
- PMID-only resolved: **5/5**
- Low title-similarity records requiring manual review: **8**
- URL-only sources not bulk-resolved: **26**

## Provenance

- Crossref REST: `GET /works/{doi}`
- Europe PMC REST: exact PMID query with `SRC:MED`
- Access date: 2026-08-25
- Local comparison: normalized title-token Jaccard threshold 0.55; this is a triage check, not claim verification.

## Unresolved DOI

- 10.1371/journal.pcbi.1010492: HTTP 429
- 10.1038/s41592-024-02362-y: HTTP 429
- 10.1073/pnas.0506580102: HTTP 429

## Low-similarity records

- 10.1093/aje/kwm324: pack title “Immortal time bias in observational studies of drug effects”; returned title “Immortal Time Bias in Pharmacoepidemiology”; similarity 0.40
- 10.1371/journal.pmed.0040296: pack title “The STROBE statement”; returned title “The Strengthening the Reporting of Observational Studies in Epidemiology (STROBE) Statement: Guidelines for Reporting Observational Studies”; similarity 0.25
- 10.1101/pdb.prot087288: pack title “Analyzing Cell Death by Annexin V Staining and Flow Cytometry”; returned title “Quantitation of Apoptosis and Necrosis by Annexin V Binding, Propidium Iodide Uptake, and Flow Cytometry”; similarity 0.33
- 10.1007/978-1-0716-2903-1_7: pack title “Interferences in Immunoassay”; returned title “Interference in ELISA”; similarity 0.20
- 10.1038/s41592-025-02890-1: pack title “A practical guideline for the choice and use of cell migration assays”; returned title “Selecting the optimal cell migration assay: fundamentals and practical guidelines”; similarity 0.29
- 25482647: pack title “Wound healing assay: an overview of literature methods”; returned title “An introduction to the wound healing assay using live-cell microscopy.”; similarity 0.27
- 26949479: pack title “A new drug-combination model to predict synergistic effects based on the zero interaction potency score”; returned title “Searching for Drug Synergy in Complex Dose-Response Landscapes Using an Interaction Potency Model.”; similarity 0.15
- 26388771: pack title “What is synergy?”; returned title “What is synergy? The Saariselkä agreement revisited.”; similarity 0.43

URL reachability and scientific claim support require separate review. A resolved DOI/PMID does not promote any claim.

## Manual primary-source follow-up

- The three Crossref 429 results are rate-limit failures, not invalid identifiers. Primary publication pages confirm DOI `10.1371/journal.pcbi.1010492`, `10.1038/s41592-024-02362-y`, and `10.1073/pnas.0506580102`.
- Official/current pages confirm TRIPOD+AI replaces TRIPOD-2015, CONSORT 2025 and SPIRIT 2025 are the current named statements, and ICMJE was updated January 2026.
- `SRC-DESPACE-2024` uses an invalid PubMed/PMC hybrid URL. Use `https://pmc.ncbi.nlm.nih.gov/articles/PMC10868334/`.
- Five declared-year differences may reflect online-first versus issue year and require a documented policy rather than silent rewriting: `SRC-LUECKEN-INTEGRATION-2022`, `SRC-MILO-2022`, `SRC-LIU-PROT-MISSING-2021`, `SRC-MIGRATION-GUIDE-2026`, and `SRC-ZIP-2016`.
