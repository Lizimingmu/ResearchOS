# OpenCode Handoff — M016 v0.12.0 Background Release

Project: `D:\Agents\ResearchOS`

Use the currently configured DeepSeek V4 Pro. This is a bounded, resumable release task. Read only:

1. `AGENTS.md`
2. `.agent/OPENCODE_HANDOFF.md`
3. `.agent/TESTING_POLICY.md`
4. `.agent/PRODUCT_CONSTITUTION.md`
5. `.agent/SCIENTIFIC_GATES.md`
6. `.agent/PROJECT_STATE.md`
7. `.agent/M016_RELEASE_PLAN.md`
8. `.agent/M016_RUN_STATE.json`

Accepted implementation baseline: tag `m015-accepted`. Branch is `codex/m016-release`. Do not run any Git command; Codex owns checkpoints and review.

## Execute now

Complete M016-01 through M016-04 from `.agent/M016_RELEASE_PLAN.md`. Work segment by segment. At the start and end of each segment update `.agent/M016_RUN_STATE.json`; after each segment append a concise checkpoint to `.agent/IMPLEMENTATION_REPORT.md`. If interrupted, resume the first non-completed segment and do not repeat a completed build/package unnecessarily.

Maximum three implementation attempts per segment. A corrected rerun after a deterministic failure counts as an attempt. Stop early only for a real safety/product ambiguity, unavailable build prerequisite, repeated failure after three attempts, or evidence that fulfilling the task would violate the boundaries below.

## Release requirements

- Target version is `0.12.0`; state schema stays 4 and SQLite `user_version` stays 2.
- Update version declarations consistently and add deterministic consistency coverage if needed.
- Run the prescribed QA serially when commands share build directories.
- Build/package non-interactively, then copy new artifacts without overwriting any earlier release:
  - `release/ResearchOS_0.12.0_x64.exe`
  - `release/ResearchOS_0.12.0_x64-setup.exe`
- Generate exact sizes/SHA256 and truthful v0.12.0 metadata/release notes.
- The build is unsigned. Do not use “signed”, “重新签名” or imply publisher verification.
- Report foreground, installer, real-Vault and user-manual checks as `NOT RUN`.

## Non-negotiable no-disturb boundaries

- Background only. Do not launch ResearchOS, Tauri dev, the portable exe, installer, Obsidian, browser or any visible window.
- Do not control mouse, keyboard, focus, window placement/size, clipboard, DPI, monitors, display settings or user processes.
- Do not inspect, discover, read or write a real Vault or production ResearchOS data directory.
- Use only project-local or OS temporary fixtures; preserve them when they are needed as failure evidence.
- Do not touch/classify/import the 166 quarantined cards.
- Do not generate or promote scientific content.
- Do not weaken gates, overwrite old release files, reset data, clean the repository, run Git or push.

## Final report and stop condition

Update `.agent/IMPLEMENTATION_REPORT.md` with:

- changed files;
- version-declaration locations;
- exact commands and pass/fail counts;
- failures, fixes and attempt counts;
- artifact paths, byte sizes and SHA256;
- confirmation older artifacts were preserved;
- `BACKGROUND AUTOMATED — PASS/FAIL`;
- `HEADLESS/OFF-SCREEN — PASS/FAIL/NOT RUN`;
- `FOREGROUND UI — NOT RUN`;
- `USER-MANUAL — NOT RUN`;
- remaining foreground release checks.

Do not add scientific entries to `.agent/SCIENTIFIC_CHANGESET.md`; M016 is expected to change no scientific content. Set `M016_RUN_STATE.runStatus = awaiting_codex_review`, ensure M016-01…04 are completed, leave M016-05 pending, run the handoff validator and stop for Codex.
