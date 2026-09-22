# Project State

Last updated: 2026-09-22

- Current milestone: M020 Extensible & Updatable Knowledge Architecture, implementation and background acceptance complete.
- Branch: `codex/m020-extensible-knowledge-architecture`.
- Approved baseline: commit `7a41b4926e3a2a408acce7c073b2351c4fc230cc`.
- Product version remains 0.12.0; state schema is now 9; SQLite user version remains 2.
- Canonical knowledge: six typed contracts, append-only revisions/decisions, source → claim → knowledge → exact learning revision/hash graph, pending import/update/projection flows.
- Initial migration: 79 pending knowledge wrappers, 85 sources, 375 pending claims, 688 learning bindings. 327 bindings have no determined knowledge mapping; 328 carry review gaps. Unknown fields are not inferred.
- Existing 297-entry learning registry and 9 core active assets are preserved. No M019 scientific prose, answer key, scoring rule or activation was changed. Existing untouched lessons use exact grandfathered bindings; affected content is held outside Today/Review/submission.
- Protocol staging: five built-in WB/qPCR/IHC/flow/PDO examples and a general adapter; all imports stay pending. Two complete original staging packages were also tested independently.
- Validation: typecheck PASS; full suite 201/201 + isolated DOM interaction 1/1; seven knowledge audits PASS; M018 registry, localization and isolated production startup PASS; privacy 4/4 PASS.
- Browser/foreground/manual visual QA NOT RUN. Existing localhost permission denial was respected; no workaround browser was used.
- The earlier independent learning/science audit was explicitly replaced by the user's M020 request. Its unfinished evidence remains outside this repo; M020 does not claim that prior audit is complete.
- Stop after commit + push. No M021, publication, activation or merge to main.
