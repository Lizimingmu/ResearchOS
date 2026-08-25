# Review Result

PATCH REQUIRED

## M013-11R Codex re-review — 2026-08-25

Sequential path-node/evidence integrity and the temporal-validation claim/rubric now pass engineering and scientific review. Independent rerun passed 45/45 tests, source-pack audit, Problem Atlas audit, the 63-check staging gate and handoff validation.

One deterministic metadata correction remains:

- `pa-src-altman-validation` has the correct title, authors, year and DOI (`10.1136/bmj.b605`), but the recorded PMID `19401593` is wrong. The PubMed record for this exact BMJ article is **PMID `19477892`**. Correct it in `src/data/problemAtlas.ts`, regenerate `data/problem_atlas/source_pack.json`, correct SC-DEMO-01, and add a deterministic DOI→PMID pair assertion so this mismatch cannot pass the source-pack audit again. Keep source/claim status pending.

No other product or scientific change is requested. After this metadata-only patch and green gates, M013 is eligible for ACCEPT.

## M013 final-gate re-review — 2026-08-25

The M013-10R importer fixes, strict AI verdicts, unique error-localization ranks, baseline-first UI, pending-support labels, source-tier display and quarantine of all 166 external cards pass review. Independent rerun passed 44/44 tests, source-pack audit, Problem Atlas audit, the 63-check staging gate and handoff validation.

Two focused corrections remain before M013 ACCEPT:

1. **Sequential engine does not validate path-node identity/order.** After a valid baseline, `lockSessionStep` accepts a reveal for a nonexistent node and then accepts a ranking whose `nodeId` differs from the revealed node. A reproduced direct probe accepted `not-a-real-node` followed by `different-node`. Validate against the actual `DiagnosticPath`: reveal only the next unrevealed node, require its allowed evidence, require the following ranking to reference that same node, prevent repeated nodes, and grade completion by unique valid path-node coverage rather than ranking count. Add direct fake/reordered/mismatched-node regressions.
2. **Temporal-validation reference answer remains internally contradictory and under-linked.** The card correctly says locked-model evaluation in later independent same-centre patients can be temporal/external-in-time validation, but still marks “same centre” itself as a red flag, says external means only a “new source,” instructs that the external-validation conclusion be downgraded to internal results, and gives the reference answer “仅能声明内部性能.” Rewrite consistently: report the random split as internal and the later locked-model cohort separately as temporal validation; do not claim geographic transportability or clinical readiness. Add a pending EvidenceClaim that directly/qualifiedly maps the temporal-validation statement to a suitable existing registry source, or add a Codex-reviewed methods source; do not leave the new high-risk boundary supported only by the internal-validation claim.

This is a micro-patch only. Do not reopen the external corpus, add tutorial code, package, or broaden scope.

## M013-10 Codex re-review — 2026-08-25

The legacy staging converter, type separation, metadata demotion, collision disclosure and 8/8 structured legacy-pack rejection are accepted in scope. Independent rerun passed 39/39 tests, the 63-check staging gate, source-pack audit and handoff validation. No staged pack is approved for production import.

Two importer-gate defects remain:

1. **Oversized CSV fields are still silently truncated.** `parseCsvLine` returns `cell.slice(0, MAX_FIELD_LENGTH)`. This changes untrusted input instead of rejecting it and directly contradicts the existing M013-02 gate. Return a deterministic field/row rejection and add a regression asserting the original 2,001-character value is never accepted or truncated.
2. **The identical-import shortcut bypasses scientific completeness.** `dryRunSourcePack` returns `noop: true, importEligible: true` whenever a matching import record exists, even if the current document is `scientific_patch_required` or contains `unclassified` cards. A reproduced probe returned `{ completeness: "scientific_patch_required", importEligible: true, noop: true, applyReturned: true }`. A noop may remain idempotent, but it must not override the current structural/scientific gates; apply must reject an incomplete/unclassified document.

M013 as a whole is not accepted because the M013-09 engine/UI/scientific corrections listed below are still explicitly open. For rapid release, the 166 external legacy cards may remain quarantined and unclassified; they do not need to be bulk-classified or imported in this release.

M013 implementation is substantial and all declared automated suites pass, but the candidate fails engineering and scientific gates below.

## M013-02 — Source-pack transaction and validation

1. **Malformed DOI/PMID validation is ineffective.** `checkField(...)` is called for DOI/PMID but its returned errors are discarded. A source with `doi: "not-a-doi"` passes validation.
2. **Registry collision can create a dangling claim.** A new source that conflicts with an existing DOI/PMID is skipped, while a new claim referencing that skipped source is still imported. A conflict must make the whole confirmed pack non-applicable; no partial write or “applied” record.
3. Treat any dry-run conflict/rejected row as a blocking import result unless a future explicit, reviewed conflict-resolution plan produces a newly validated document. Revalidate the merged candidate state before returning collections.
4. Silently truncating oversized CSV fields is not acceptable; reject the row/file with a deterministic error.
5. Add regression tests for malformed identifiers, cross-pack DOI/PMID conflict with dependent claims, all-or-none rollback, merged-state foreign keys and oversize-field rejection.
6. Expose a minimal explicit UI import flow: choose JSON/CSV/Markdown pack → dry-run report → user confirmation only when zero errors/conflicts/rejected rows → transactional apply. The store wrapper must not silently force updates.

## M013-04 — Diagnostic engine and Human-First behavior

1. `lockSessionStep` must reject a step whose `input.mode` differs from the session mode and validate allowed step kind/order for that mode.
2. `gradeAiVerdict` currently marks a single correct answer out of three as 100% complete. Require exactly all expected statement IDs, reject unknown IDs, and score missing answers as incomplete.
3. Error-localization UI must require ranks 1–5 to be unique; duplicate ranks currently pass “complete.”
4. Sequential troubleshooting must lock a baseline cause ranking **before** the first evidence reveal, then lock an updated ranking after each reveal. Preserve and display the evidence-before/evidence-after change; “think about it privately” does not satisfy Human First or calibration.
5. Add direct engine tests for cross-mode submission, partial/extra AI verdicts, duplicate layer ranks, illegal sequence transitions and baseline→post-evidence history.

## M013-05 — Scientific corrections

1. **Temporal validation:** remove every absolute statement that same-centre later-period data “are not external validation.” Same-centre later patients can constitute temporal validation/external-in-time when the model is locked and data are genuinely subsequent and independent; it is weaker evidence for geographic transportability. Random split remains internal. Rewrite the card, path, claims, boundary and reviewer rubric accordingly, or remove the temporal example.
2. **Leakage qualification:** remove “external untouched data can safely use overall statistics.” Evaluation data must not determine preprocessing/feature-selection/imputation parameters; learn transformations in training/development data and apply them locked. Any external-data adaptation must be prespecified and changes the validation question.
3. **Single-cell qualification:** do not suggest that cell-proportion questions make cells the independent statistical unit for patient-group inference. Distinguish observation/analysis level from independent experimental/statistical unit and model donor-level dependence.
4. **Authority tiers:** the old seed `tier` semantics cannot be copied into the new S/A/B/C/D/X registry and then shown as a new authority classification. At minimum classify the two TRIPOD sources and PROBAST as S, peer-reviewed methods/benchmark sources as A where appropriate, and use C for explanatory review/education. Do not label guidelines “技术参考.” Record these as Codex-reviewed M013 mappings in the changeset.
5. For pending EvidenceClaims, display support mapping as proposed/pending (for example “拟直接支持 · 待核验”), not an unqualified “直接支持.”
6. Fix the pseudoreplication sequential rubric text “患者应排在首位”; the ranked entities are candidate causes, not patients.
7. Keep all transformed cards/claims/rubrics pending after these corrections.

The temporal-validation correction is supported by methodological literature describing same-centre later-period evaluation as temporal validation or external-in-time, intermediate/limited for transportability. Random split is not external validation.

## M013-07 — Gate coverage

Extend both deterministic audits so the reproduced failures above cause nonzero exit. Rerun full frontend, source-pack, Problem Atlas, content, localization, performance and startup gates. Update both reports, then stop for a second Codex review. Do not package or execute Git.

## M013-10 — External complete source packs

The archive `ResearchOS_M013_COMPLETE_SourcePacks_20260824.zip` is also **PATCH REQUIRED** and must not be imported.

1. SHA256 verification passed for all 41 files, but the current ResearchOS validator/dry-run crashes on all 8 legacy packs (`TypeError: row.candidateCauseIds is not iterable`) instead of returning structured rejection. Harden untrusted-input validation before any conversion or import.
2. The packs use legacy/snake_case ProblemCard fields and omit required `contentOrigin` on all 120 sources and 138 claims. They also contain 6 cross-pack DOI conflicts, 6 PMID conflicts and 4 duplicate normalized titles under different source IDs.
3. Scientific completeness fails: 86/138 claims have no scope and 88/138 have no qualification; 50 sources have no provenance note. No claim may move to `claim_verified`.
4. Do **not** apply a global `candidate causes >= 3` rule. The 166 legacy cards have no reviewed `problemType`; their 139/27/0 distribution for zero/one/three-or-more causes shows that they cannot all be treated as diagnostic cards, but zero causes is not itself a defect for `judgment` or `audit`. Stage them as `unclassified` and import-ineligible until M013-11 classifies them. Then apply type-specific completeness: diagnostic cards need a real differential (prefer three useful explanations, allow two), while judgment/audit cards use their own required fields. The 111 missing claim boundaries and 79 missing recommended reasoning remain independent completeness gaps where those fields are type-required.
5. Apply the exact group-level scientific patches in `SCIENTIFIC_CHANGESET.md`, including `CLM-QPCR-006`, `CLM-SP-008`, `CLM-AI-004`, `CLM-REV-003`, DESpace URL correction and formal-title normalization. Preserve all scientific content as pending.
6. Run only staging conversion and dry-run. Do not call the apply importer or mutate a production database. Complete M013-09 and M013-10 regression, then stop for Codex re-review.
