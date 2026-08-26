# Project State

Last updated: 2026-08-26

- Product version: 0.11.0 working release candidate; latest approved distributed build remains 0.10.2.
- State schema / SQLite user version: 4 / 2.
- Approved baseline: commit `0ee5181` (M015 execution handoff baseline); the accepted result is identified by tag `m015-accepted`.
- Accepted milestones: M013 Problem Atlas, M014-01 Chinese tutorial, M015 Personal Content Studio.
- M015 accepted checkpoint: tag `m015-accepted`; final gate in `.agent/REVIEW_RESULT.md`.
- Working features: Chinese-first learning workspace, Problem Atlas, first-run tutorial, versioned personal-content overlays, review-pack export, patch/history/rollback, and explicit finite Obsidian publish/review workflow.
- Current deterministic evidence: frontend unit 88/88 PASS; M015 audit 31/31 PASS; OpenCode Rust 27/27 PASS; handoff validator PASS; initial JS 944,655 bytes under the 1.9 MB budget.
- Scientific state: M015 changed no scientific content. Pending demo/source/claim content remains pending; 166 external cards remain `unclassified` and import-ineligible.
- Latest approved distributed artifacts remain `release/ResearchOS_0.10.2_x64.exe` and `release/ResearchOS_0.10.2_x64-setup.exe`. The existing v0.11.0 artifacts are not newly signed by this M015 gate.
- Blockers: no M015 code blocker. Foreground packaged-app smoke testing and fresh release packaging require a separate explicit user-authorized release milestone.
- M012 Protocol Lab remains paused until explicitly selected.
