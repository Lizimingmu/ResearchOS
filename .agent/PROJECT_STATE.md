# Project State

Last updated: 2026-08-27

- Product version: 0.12.0 release candidate containing the accepted M015 Personal Content Studio.
- Development state schema / SQLite user version: 5 / 2. The accepted `v0.12.0-rc1` artifact remains schema 4 / SQLite 2.
- Approved baseline: commit `e2c10c2` (M016 release implementation); the accepted release candidate is identified by tag `v0.12.0-rc1`.
- Accepted milestones: M013 Problem Atlas, M014-01 Chinese tutorial, M015 Personal Content Studio.
- Accepted checkpoints: M015 tag `m015-accepted`; M016 background release candidate tag `v0.12.0-rc1`.
- Working features: Chinese-first learning workspace, Problem Atlas, first-run tutorial, versioned personal-content overlays, review-pack export, patch/history/rollback, and explicit finite Obsidian publish/review workflow.
- Current deterministic evidence: frontend 96/96 PASS plus localization/startup; source-pack and Problem Atlas 0/0; staging 63/63; content 0 errors/1 existing warning; M015 compatibility audit 32/32; handoff validator PASS; initial JS 946,430 bytes under the 1.9 MB budget. Rust was not re-run because the local cache lacks `urlencoding` and the network retry failed at Windows Schannel credential acquisition; the accepted RC's prior Rust evidence remains 27/27.
- Scientific state: M015 changed no scientific content. Pending demo/source/claim content remains pending; 166 external cards remain `unclassified` and import-ineligible.
- Current candidate artifacts: `release/ResearchOS_0.12.0_x64.exe` and `release/ResearchOS_0.12.0_x64-setup.exe`; both are unsigned and independently hash-verified. Historical binaries v0.9.0–v0.11.0 and reproducible build/smoke output were removed from the working copy on 2026-08-27; history remains in Git/CHANGELOG.
- Current milestone: M016-LK S1 domain/schema and state migration rescued and complete; S2–S5 paused for product discussion.
- Blockers: no frontend S1 blocker. Rust re-verification is externally blocked by missing local crate cache plus Schannel network credentials. Foreground packaged-app smoke remains permission-gated and was not run.
- M012 Protocol Lab remains paused until explicitly selected.
