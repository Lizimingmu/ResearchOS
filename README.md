# ResearchOS v0.12.0

*A local-first Windows desktop system for deliberate practice in medical-research methods, scientific judgment, paper reading, project transfer, and human oversight of AI.*

Release status: **v0.12.0 release candidate (`v0.12.0-rc1`)**. Background gates passed; packaged-app foreground, installer and user-manual checks remain NOT RUN.

---

## 🧭 What changed in v0.12.0

- Added the Personal Content Studio (内容工作台): 内容库 / 草稿 / 待审核 / 发布箱 / 版本历史 / 冲突 views for maintaining your own additions with stable IDs, revisions, SHA-256 hashing and dependency closure.
- Built-in content is revisable through versioned overlays: duplicate or template a draft, edit with deterministic validation (evidence gaps, dependency impact), import patch packs with dry-run field diffs, stale-base conflicts, all-or-nothing atomic apply, version comparison and rollback. Built-in baselines stay read-only, and application upgrades surface conflicts instead of overwriting.
- Explicit curated Obsidian publishing: read-only connection validation for one dedicated subfolder, exact create/update/conflict/unchanged preview before confirmation, default 20-note limit with second confirmation, managed note blocks that preserve your own writing byte-for-byte, idempotent republish (unchanged revisions write nothing), rename tracking by stable ID, and optional finite `_Review/<batch-id>` feedback round trips that stay pending. Connecting, previewing or cancelling never writes files; no watcher or automatic sync exists.
- Draft/pending/archived/deprecated/superseded items never enter Today, Review, search or publishing. Local activation keeps the 待核验 status — using material privately is separate from scientific verification.
- Review-pack export bundles selected content plus its dependency closure as exactly five deterministic files for Codex/OpenScience review without repository-wide scanning.

All v0.11.0 improvements remain: the Research Problem Atlas (科研常见问题库) with eight diagnostic modes, the Chinese-first five-minute tutorial, two independent import gates keeping the external 166-card corpus quarantined as `unclassified`, pending demo content displayed as 拟直接支持 · 待核验, Simplified Chinese interface, 49 evidence sources, 88 methods (84 usable), 25 research patterns, 84 judgment cards, 40 AI-audit cases, versioned state migrations (now schema 4), atomic persistence with five recovery snapshots, and JSON/CSV/Markdown exports.

ResearchOS is an educational research tool, not clinical decision support. Its mechanisms align with established learning principles, but the product has not been shown in a trial to improve research competence or patient outcomes.

## 📦 Install

Verify `release/ResearchOS_0.12.0_x64-setup.exe` against `release/SHA256SUMS.txt`, then run the current-user installer. It is unsigned, so Windows may show an unknown-publisher/SmartScreen warning. The standalone `release/ResearchOS_0.12.0_x64.exe` is also provided.

`release/` only keeps the current v0.12.0 candidate artifacts. Earlier binaries were removed to keep the working copy compact; their history remains traceable through Git and `CHANGELOG.md`. Exact v0.12.0 sizes, schema versions, and digests are in `release/BUILD_METADATA_v0.12.0.json`; the Chinese release notes are in `release/RELEASE_NOTES_v0.12.0.md`.

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

Current product and milestone control lives in `.agent/PRODUCT_CONSTITUTION.md`, `.agent/CURRENT_MILESTONE.md`, and `.agent/OPENCODE_HANDOFF.md`. Historical decisions remain available through Git and `CHANGELOG.md`.
