# ResearchOS v0.10.1

*A local-first Windows desktop system for deliberate practice in medical-research methods, scientific judgment, paper reading, project transfer, and human oversight of AI.*

---

## 🧭 What changed in v0.10.1

- A complete answer → confidence → locked feedback → transfer → delayed variant-review loop.
- Explicit high-confidence misconceptions that cannot clear until a correct unfamiliar variant.
- First-run research orientation and a blind three-case baseline assessment.
- A five-task Today queue balancing foundations, current weaknesses, project relevance, due reviews, and occasional frontier work.
- 49 evidence sources, 88 methods (84 usable), 25 research patterns, 84 judgment cards, and 40 AI-audit cases.
- Versioned state/SQLite migrations, atomic persistence, five recovery snapshots, health diagnostics, and JSON/CSV/Markdown exports.
- Production-safe React bundling, startup recovery UI, and demand-loaded search/content/PDF workspaces; initial JavaScript is 77.3% smaller than the audited v0.9 baseline.

ResearchOS is an educational research tool, not clinical decision support. Its mechanisms align with established learning principles, but the product has not been shown in a trial to improve research competence or patient outcomes.

## 📦 Install

Verify `release/ResearchOS_0.10.1_x64-setup.exe` against `release/SHA256SUMS.txt`, then run the current-user installer. It is unsigned, so Windows may show an unknown-publisher/SmartScreen warning. The standalone `release/ResearchOS_0.10.1_x64.exe` is also provided.

v0.9 artifacts remain in `release/` for rollback and were not overwritten. v0.10.0 is retained for audit but is superseded because its browser bundle referenced a Node-only `process` global and could open as a blank window. Exact v0.10.1 sizes, schema versions, toolchain, and digests are in `release/BUILD_METADATA_v0.10.1.json`.

## 🛠️ Develop and verify

Prerequisites: Node.js 20+, Rust stable, Microsoft C++ build tools, WebView2, and Tauri/NSIS Windows build prerequisites.

```powershell
npm install
npm run lint
npm run typecheck
npm test
npm run content:audit
npm run performance:audit
cargo test --manifest-path src-tauri/Cargo.toml
npm run tauri:build
```

The frontend uses TypeScript plus Rollup after compilation so production builds remain usable where Vite's esbuild child process is restricted.

## 💾 Data, privacy, and recovery

Core practice is offline. SQLite stores application state under the Tauri-resolved application-data directory; `RESEARCHOS_DATA_DIR` is an explicit development/test override. Schema v1 migrates transactionally to v2, and each save keeps at most five pre-save recovery snapshots.

Provider use is optional and occurs only after a human answer is locked. API keys use Windows Credential Manager and are excluded from state, backups, and exports. Imported backups are opened read-only, integrity checked, and required to contain ResearchOS state before restoration. External PDFs and credentials are not copied into backups.

## 📚 Documentation

- `docs/PRODUCT_SPEC.md` — implemented behavior and non-goals
- `docs/ARCHITECTURE.md` — runtime, boundaries, persistence, and performance
- `docs/LEARNING_ENGINE.md` — scheduler and state model
- `docs/LEARNING_ENGINE_VALIDATION.md` — mechanism-by-mechanism validation and limits
- `docs/CONTENT_PROVENANCE.md` — source/verification policy
- `docs/CONTENT_AUDIT.md` and `docs/SCIENTIFIC_REVIEW.md` — automated and human scientific review
- `docs/UX_AUDIT.md` and `docs/PERFORMANCE_AUDIT.md` — experience/performance evidence
- `docs/IMPROVEMENT_LOG.md` — autonomous audit loops
- `docs/TEST_REPORT.md` — final release gates
- `docs/FINAL_HANDOFF.md` — artifacts, risks, and future work

The controlling specifications are `ResearchOS_v0.9_Codex_Master_Prompt.md` and the v0.10 autonomous-depth directive supplied for this release.
