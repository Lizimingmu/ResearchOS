# Project State

Last updated: 2026-08-25

- Product version: 0.10.2
- Approved state schema / SQLite user version: 2 / 2
- Candidate M013 state schema: 3 (unapproved)
- Approved baseline: commit `441ece1` (`feat: ship Simplified Chinese interface v0.10.2`; approved product/release baseline)
- Last Codex review checkpoint: commit `738dc99` (`review: gate M013 complete source packs`)
- Review command: `git diff 738dc99..HEAD` plus uncommitted M013 files/reports
- Latest approved build: `release/ResearchOS_0.10.2_x64.exe` and `release/ResearchOS_0.10.2_x64-setup.exe`
- Approved hashes: portable `D93E87E47C48EDA844D6A1D07E51D4A8DC46EE74403042413EC769AB0FE40302`; setup `67F6228F9D4B9325F006FBB6A379B243ADBE9B2AB52C3EA0B17C79C18C5C0834`
- Candidate working state: M013-01…07 implemented; frontend tests 31/31 and declared source/atlas/content/localization/performance/startup/handoff gates pass; Rust unchanged and not rerun
- External pack gate: 8/8 attached legacy packs blocked; archive integrity 41/41 PASS, current validator 0/8 and crashes, production mutation NO; see `M013_SOURCE_PACK_DRY_RUN.*` and `M013_SOURCE_METADATA_AUDIT.*`
- M013-10 contract: ProblemCards use `diagnostic | judgment | audit`, with staging-only `unclassified`; structural validity and type-specific scientific completeness are separate gates, and there is no global three-candidate-cause requirement
- Current gate: `PATCH REQUIRED`; M013-09/10R automated gates pass, but sequential path-node validation and the temporal-validation reference answer/evidence mapping need one micro-patch; see `.agent/REVIEW_RESULT.md`
- Current milestone: OpenCode M013-11R micro-patch, then Codex final demo/scientific release gate; the 166 external cards remain quarantined for a later corpus milestone
- Preserved dependencies: M011 localization remains unapproved; M012 Protocol Lab specification is preserved and implementation remains paused
- Do not import the attached source packs or treat candidate files, reports, schema 3, metadata, claims or generated content as approved until `.agent/REVIEW_RESULT.md` says `ACCEPT`
