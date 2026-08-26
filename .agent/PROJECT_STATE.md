# Project State

Last updated: 2026-08-26

- Product version: 0.12.0 release candidate containing the accepted M015 Personal Content Studio.
- State schema / SQLite user version: 4 / 2.
- Approved baseline: commit `e2c10c2` (M016 release implementation); the accepted release candidate is identified by tag `v0.12.0-rc1`.
- Accepted milestones: M013 Problem Atlas, M014-01 Chinese tutorial, M015 Personal Content Studio.
- Accepted checkpoints: M015 tag `m015-accepted`; M016 background release candidate tag `v0.12.0-rc1`.
- Working features: Chinese-first learning workspace, Problem Atlas, first-run tutorial, versioned personal-content overlays, review-pack export, patch/history/rollback, and explicit finite Obsidian publish/review workflow.
- Current deterministic evidence: frontend unit 89/89 PASS; M015 audit 31/31 PASS; OpenCode Rust 27/27 PASS; handoff validator PASS; initial JS 945,116 bytes under the 1.9 MB budget.
- Scientific state: M015 changed no scientific content. Pending demo/source/claim content remains pending; 166 external cards remain `unclassified` and import-ineligible.
- Current candidate artifacts: `release/ResearchOS_0.12.0_x64.exe` and `release/ResearchOS_0.12.0_x64-setup.exe`; both are unsigned and independently hash-verified. Older artifacts remain byte-preserved.
- Current milestone: M016 Learning Kernel specification complete; implementation is ready for OpenCode under task IDs `M016-LK-01…07`.
- Blockers: no specification blocker. Foreground packaged-app smoke remains permission-gated and is not part of Learning Kernel implementation.
- M012 Protocol Lab remains paused until explicitly selected.
