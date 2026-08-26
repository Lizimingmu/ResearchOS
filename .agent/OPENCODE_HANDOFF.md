# OpenCode Handoff — M014-02 Release Candidate

## Codex gate

`PATCH REQUIRED` — M014-02R validation-only closeout. Do not resume until the user explicitly asks. Do not rebuild or change product code unless the minimal check finds a defect.

Use **DeepSeek V4 Pro**. Read `AGENTS.md`, `.agent/CURRENT_MILESTONE.md`, `.agent/TESTING_POLICY.md`, `.agent/PRODUCT_CONSTITUTION.md`, `.agent/SCIENTIFIC_GATES.md`, `.agent/REVIEW_RESULT.md`, and the M014-01 section of `.agent/IMPLEMENTATION_REPORT.md`.

## Execution status

**PAUSED BY USER. Do not resume any command, build, application launch, UI automation, packaging, or test until the user explicitly asks to resume M014-02.**

When resumed, default to background-only checks under `.agent/TESTING_POLICY.md`. A request to resume M014-02 does not itself authorize foreground UI automation. Ask again immediately before any packaged-app/installer window, mouse/keyboard automation, focus change, resize, restart, or screenshot session.

### Only remaining release blocker

After receiving explicit current foreground permission, use the rebuilt portable v0.11.0 artifact and isolated test data to:

1. open 科研常见问题库;
2. enter one ProblemCard and one diagnostic mode;
3. open 复习;
4. confirm no React #185 crash, blank screen, or navigation failure;
5. close the exact test PID, reopen once, and confirm completed tutorial state remains persisted.

Do not change DPI/display settings, force focus, or control global input outside the isolated ResearchOS window. If permission is not granted, leave these checks `NOT RUN`.

Independently of foreground permission, correct `release/RELEASE_NOTES_v0.11.0.md`: “重新签名哈希” → “重新计算哈希”. Update `.agent/IMPLEMENTATION_REPORT.md` with the exact result and stop for Codex sign-off. In-app backup/restore UI may remain explicitly `NOT RUN`; do not expand the session.

## Release work

1. Bump all product/release version declarations consistently from `0.10.2` to `0.11.0`.
2. Preserve the accepted M013 architecture and M014-01 tutorial behavior. Do not add features or scientific content.
3. Clean the three accidental line-join formatting changes in `src/state/store.ts` (`emptyAtlasCollections`, `createInitialState`, and `schedulePersist`) without behavioral changes.
4. Make the tutorial Today wording precisely match scheduler behavior: one highest-priority due/high-risk retrieval slot is protected; do not imply that every due item becomes a separate Today card.
5. Run the full frontend suite and all source-pack, Problem Atlas, staging, content, localization, performance, startup, seed, and handoff gates.
6. Run Rust tests/checks and the production Tauri build. Verify schema 3 / SQLite user version 2 migration and restart persistence from a v0.10.2 fixture.
7. Treat packaged Windows visual smoke as a separate foreground session. Do not start it without specific current user permission. Prefer a user-manual checklist or headless/off-screen proof. If permission is not granted, report `FOREGROUND UI — NOT RUN` and preserve the exact checkpoint.
8. Verify backup/export and restore/import round trip with representative learning data and no record loss.
9. Produce release deliverables using the existing workflow, SHA256 checksums, and concise Chinese release notes. Record exact paths, sizes, hashes, commands, and failures.

## Hard boundaries

- Do not import, classify, rewrite, or promote the 166 external staging cards.
- Do not promote any pending source, claim, ProblemCard, rubric, or answer.
- Do not resume M012 Protocol Lab.
- Do not change state schema or SQLite user version unless a real compatibility defect requires it; if so, stop and report instead of improvising.
- Do not run Git. Stop after updating `.agent/IMPLEMENTATION_REPORT.md` and the release artifacts for Codex sign-off.
- Follow `.agent/TESTING_POLICY.md` without exception. Never change DPI/display settings, force foreground focus, control global input, or interfere with the user's active applications.

```text
仅在用户明确要求恢复后：读取 AGENTS.md、.agent/OPENCODE_HANDOFF.md 与 .agent/TESTING_POLICY.md，使用 DeepSeek V4 Pro 继续 M014-02。默认只运行不打开窗口、不控制鼠标键盘、不抢占焦点的后台测试。任何桌面应用/安装器启动、前台 UI 自动化、窗口缩放、重启或截图都必须在动作前再次取得用户明确同意；禁止修改 DPI、分辨率或系统设置。无法无干扰验证的 UI 项标记为 NOT RUN，不得伪报通过。不得新增科研内容、触碰 166 张外部卡、恢复 M012 或执行 Git。
```
