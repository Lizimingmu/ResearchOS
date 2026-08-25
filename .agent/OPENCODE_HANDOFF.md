# OpenCode Handoff — M014-02 Release Candidate

Use **DeepSeek V4 Pro**. Read `AGENTS.md`, `.agent/CURRENT_MILESTONE.md`, `.agent/PRODUCT_CONSTITUTION.md`, `.agent/SCIENTIFIC_GATES.md`, `.agent/REVIEW_RESULT.md`, and the M014-01 section of `.agent/IMPLEMENTATION_REPORT.md`.

## Release work

1. Bump all product/release version declarations consistently from `0.10.2` to `0.11.0`.
2. Preserve the accepted M013 architecture and M014-01 tutorial behavior. Do not add features or scientific content.
3. Clean the three accidental line-join formatting changes in `src/state/store.ts` (`emptyAtlasCollections`, `createInitialState`, and `schedulePersist`) without behavioral changes.
4. Make the tutorial Today wording precisely match scheduler behavior: one highest-priority due/high-risk retrieval slot is protected; do not imply that every due item becomes a separate Today card.
5. Run the full frontend suite and all source-pack, Problem Atlas, staging, content, localization, performance, startup, seed, and handoff gates.
6. Run Rust tests/checks and the production Tauri build. Verify schema 3 / SQLite user version 2 migration and restart persistence from a v0.10.2 fixture.
7. In the packaged Windows app, visually smoke-test first launch, tutorial skip/finish/reopen, keyboard/focus restoration, normal and compact window sizes, core navigation, and restart persistence. Record window sizes and results.
8. Verify backup/export and restore/import round trip with representative learning data and no record loss.
9. Produce release deliverables using the existing workflow, SHA256 checksums, and concise Chinese release notes. Record exact paths, sizes, hashes, commands, and failures.

## Hard boundaries

- Do not import, classify, rewrite, or promote the 166 external staging cards.
- Do not promote any pending source, claim, ProblemCard, rubric, or answer.
- Do not resume M012 Protocol Lab.
- Do not change state schema or SQLite user version unless a real compatibility defect requires it; if so, stop and report instead of improvising.
- Do not run Git. Stop after updating `.agent/IMPLEMENTATION_REPORT.md` and the release artifacts for Codex sign-off.

```text
读取 AGENTS.md 与 .agent/OPENCODE_HANDOFF.md，使用 DeepSeek V4 Pro 执行 M014-02：统一升级到 v0.11.0，清理列明的无行为格式问题并校准教程 Today 文案，跑完整前端/Rust/Tauri/迁移/备份回归，在打包后的 Windows 应用中实测教程与普通/紧凑窗口，生成安装包、SHA256 和中文发布说明。不得新增科研内容、不得触碰或导入 166 张外部卡、不得恢复 M012、不得 Git；更新报告后停止等待 Codex 最终签署。
```
