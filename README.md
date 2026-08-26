# ResearchOS v0.11.0

*A local-first Windows desktop system for deliberate practice in medical-research methods, scientific judgment, paper reading, project transfer, and human oversight of AI.*

---

## 🧭 What changed in v0.11.0

- Added the Research Problem Atlas (科研常见问题库): structured diagnostic learning (快速定位 / 鉴别诊断 / 序贯排查 / 缺失信息 / 错误定位 / 结论边界 / 审稿诊断 / AI 解释审核) with deterministic search, source registry, evidence-claim mapping, knowledge versioning, and transactional source-pack import with dry-run gating.
- Added a Chinese-first five-minute first-run tutorial covering Today, the Problem Atlas, pending-evidence status, lock-before-feedback, and review/transfer. It is skippable, restartable from Settings, keyboard-navigable, and runs its practice steps in an isolated preview state that never writes learning records.
- Two independent import gates (structural validation vs scientific completeness), exception-safe validators, and an auditable legacy→v3 staging converter keep the external 166-card corpus quarantined as `unclassified` and import-ineligible.
- All M013 demo ProblemCards, claims, paths and rubrics remain `pending`; source tiers follow the Codex-reviewed S/A/C mapping, and pending claims display proposed support (拟直接支持 · 待核验).

Earlier v0.10.2 improvements remain: Simplified Chinese interface, complete answer → confidence → locked feedback → transfer → delayed variant-review loop, high-confidence misconceptions, 49 evidence sources, 88 methods (84 usable), 25 research patterns, 84 judgment cards, 40 AI-audit cases, versioned state/SQLite migrations, atomic persistence, five recovery snapshots, and JSON/CSV/Markdown exports.

ResearchOS is an educational research tool, not clinical decision support. Its mechanisms align with established learning principles, but the product has not been shown in a trial to improve research competence or patient outcomes.

## 📦 Install

Verify `release/ResearchOS_0.11.0_x64-setup.exe` against `release/SHA256SUMS.txt`, then run the current-user installer. It is unsigned, so Windows may show an unknown-publisher/SmartScreen warning. The standalone `release/ResearchOS_0.11.0_x64.exe` is also provided.

Earlier artifacts remain in `release/` for rollback and audit. v0.10.0 must not be distributed because its browser bundle could open as a blank window. Exact v0.11.0 sizes, schema versions, and digests are in `release/BUILD_METADATA_v0.11.0.json`; the Chinese release notes are in `release/RELEASE_NOTES_v0.11.0.md`.

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
