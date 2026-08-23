# ResearchOS v0.9 test report

Tested on Windows on 2026-08-24.

## Automated results

| Layer | Result | Coverage |
|---|---:|---|
| Frontend/content | 12/12 pass | seed counts, source resolution, provenance invariant, scheduler weights, PDF import mapping, provider persistence |
| Learning integration | pass | five-task Today queue, locked response, review creation, persistence, skill score withholding |
| Review behavior | pass | high-confidence wrong → dangerous next-day review; correct → greater stability |
| Rust backend | 5/5 pass | SQLite round trip, entity CRUD, backup/restore, provider URL configuration, AI-generated/verified invariant |
| Production frontend | pass | TypeScript + Rollup production build and source maps |
| Tauri release | pass | Rust release executable and NSIS installer |

## Native and persistence smoke

- Development desktop executable started successfully with a workspace-scoped data directory.
- SQLite database, WAL, and WebView data were created.
- The release executable started, created its database, stopped, restarted against the same database, and remained alive.
- HTTP preview returned 200 for the HTML and JavaScript assets; the compiled bundle contained Today and AI Audit content.
- The NSIS bundle completed successfully for current-user installation.

## Acceptance checklist

| Scenario | Status | Evidence |
|---|---|---|
| Launch app | pass | real Tauri development and release processes started |
| Today task rendering | pass | DOM integration test and compiled-bundle smoke |
| Training flow / add review | pass | immutable-response and review integration test |
| Create project / persist settings | pass | store integration test and SQLite round trip |
| Offline core use | pass | seed workflows build and test without a configured provider |
| Restart persistence | pass | same release SQLite database used across two starts |
| PDF import | component integration pass | path-to-paper mapping, pending provenance, persistence, and Library import control; native chooser not click-tested in final visual pass |
| Provider configuration | integration pass | base URL/model/settings persistence plus Rust URL tests; no external model credential was supplied |
| Backup/export | backend pass | exported SQLite copy was integrity checked and restored into a second database |

## Visual QA limitation

The in-app browser declined access to the local preview under its user-permission/security policy, so an automated
screenshot-based visual pass could not be completed in that tool. The local HTTP endpoint and real Tauri processes were
smoke-tested instead. A human should still inspect scaling, PDF rendering, and native dialogs on the target display before
broad deployment.
