# Project State

Last updated: 2026-08-25

- Product version: 0.10.2
- Approved state schema / SQLite user version: 2 / 2
- Candidate M013 state schema: 3 (unapproved)
- Approved baseline: commit `441ece1` (`feat: ship Simplified Chinese interface v0.10.2`)
- Review command: `git diff 441ece1..HEAD` plus uncommitted M013 files/reports
- Latest approved build: `release/ResearchOS_0.10.2_x64.exe` and `release/ResearchOS_0.10.2_x64-setup.exe`
- Approved hashes: portable `D93E87E47C48EDA844D6A1D07E51D4A8DC46EE74403042413EC769AB0FE40302`; setup `67F6228F9D4B9325F006FBB6A379B243ADBE9B2AB52C3EA0B17C79C18C5C0834`
- Candidate working state: M013-01…07 implemented; frontend tests 31/31 and declared source/atlas/content/localization/performance/startup/handoff gates pass; Rust unchanged and not rerun
- Current gate: `PATCH REQUIRED` for source-pack atomicity/validation/import UI, diagnostic transition/Human-First defects, and scientific boundary/authority-label corrections; see `.agent/REVIEW_RESULT.md`
- Current milestone: M013-09 OpenCode patch and regression, then Codex diff/scientific re-review
- Preserved dependencies: M011 localization remains unapproved; M012 Protocol Lab specification is preserved and implementation remains paused
- Do not treat candidate files, reports, schema 3, or generated content as approved until `.agent/REVIEW_RESULT.md` says `ACCEPT`
