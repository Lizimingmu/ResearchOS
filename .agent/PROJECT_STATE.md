# Project State

Last updated: 2026-08-25

- Product version: 0.10.2
- Approved state schema / SQLite user version: 3 / 2
- Approved baseline: commit `441ece1` (`feat: ship Simplified Chinese interface v0.10.2`; approved product/release baseline)
- M013 accepted checkpoint: tag `m013-accepted` (created by the Codex ACCEPT gate)
- Next review command: `git diff m013-accepted..HEAD` plus uncommitted M014 files/reports
- Latest approved build: `release/ResearchOS_0.10.2_x64.exe` and `release/ResearchOS_0.10.2_x64-setup.exe`
- Approved hashes: portable `D93E87E47C48EDA844D6A1D07E51D4A8DC46EE74403042413EC769AB0FE40302`; setup `67F6228F9D4B9325F006FBB6A379B243ADBE9B2AB52C3EA0B17C79C18C5C0834`
- Approved working state: M013-01…11R2 accepted; frontend tests 45/45 and source-pack/Problem Atlas/staging/content/localization/performance/startup/seed/handoff gates pass; Rust unchanged and not rerun
- External pack gate: 8/8 attached legacy packs safely return structured rejection without crash; archive integrity 41/41 PASS; converted staging remains import-ineligible; production mutation NO
- M013-10 contract: ProblemCards use `diagnostic | judgment | audit`, with staging-only `unclassified`; structural validity and type-specific scientific completeness are separate gates, and there is no global three-candidate-cause requirement
- Current gate: M013 `ACCEPT`; see `.agent/REVIEW_RESULT.md`
- Current milestone: M014 Chinese first-run tutorial, then release regression and packaging; the 166 external cards remain quarantined for a later corpus milestone
- Preserved dependencies: M011 localization remains unapproved; M012 Protocol Lab specification is preserved and implementation remains paused
- Do not import the attached external source packs or promote pending demo/source/claim content. M013 architecture and schema 3 are accepted; scientific statuses remain item-specific.
