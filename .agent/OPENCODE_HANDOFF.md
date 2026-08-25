# OpenCode Handoff — M014-01 Five-minute Chinese Tutorial

Use **DeepSeek V4 Pro**. Read `AGENTS.md`, `.agent/CURRENT_MILESTONE.md`, `.agent/PRODUCT_CONSTITUTION.md` and `.agent/SCIENTIFIC_GATES.md`.

## Build

Implement an optional, Chinese-first first-run tutorial that teaches the ResearchOS loop in about five minutes:

1. **Today** — explain the bounded daily queue and due-review priority.
2. **Problem Atlas** — demonstrate finding one existing pending demo problem.
3. **Evidence status** — explain `待核验`, proposed support and why a badge is not proof.
4. **Human First** — let the learner preview locking a judgment before feedback.
5. **Review** — show how errors/high confidence lead to later review and transfer.

Requirements:

- First-run prompt is optional and never traps the user. Provide Skip, Back, Next and Finish.
- Add “重新打开新手教程” in Help or Settings.
- Reuse existing pending demo content. Add no scientific claims, sources, cards or generated answers.
- Run tutorial exercises in isolated preview state. They must not write responses, reviews, misconceptions, calibration, scheduler history, imports or source-pack records.
- Persist skipped/completed state using the existing onboarding/settings state where practical; do not bump schema solely for tutorial UI.
- Chinese UI text first; retain English only for useful research terminology.
- Support keyboard navigation, visible focus, focus restoration, Escape/close behavior, reduced motion and ordinary desktop resizing.
- Avoid a chat-like tutorial and avoid large blocking modals where a compact guided panel/spotlight is sufficient.

## Tests and reports

Add deterministic tests for first-run visibility, skip persistence, completion persistence, restart, keyboard flow and zero learning-state mutation. Run the existing 45-test suite plus all source-pack/Problem Atlas/staging/content/localization/performance/startup/seed/handoff gates.

Update `.agent/IMPLEMENTATION_REPORT.md`. Scientific changeset should state “no scientific content changed” only if its format requires a cycle note; do not rewrite existing scientific entries.

Do not run Git, package, bump versions, touch the external 166 cards, resume M012 or implement M014-02. Stop for Codex tutorial review.

```text
读取 AGENTS.md 与 .agent/OPENCODE_HANDOFF.md，使用 DeepSeek V4 Pro 执行 M014-01：实现约五分钟的中文首次教程，依次介绍 Today、问题图谱、待核验证据状态、先锁定再反馈、Review。教程必须可跳过/重开、键盘可用、持久化完成状态，并在隔离预览状态运行，绝不污染真实学习记录。使用现有 pending demo，不新增科研内容。跑全套 QA、更新报告后停止；不要 Git、不要打包。
```
