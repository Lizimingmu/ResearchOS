# ResearchOS Testing Policy — Do Not Disturb

Last updated: 2026-08-25

This policy is mandatory for Codex, OpenCode, helper scripts, and any delegated agent. The user's computer is an active personal workstation. Testing must not interfere with normal use.

## Default mode: background-only

The following checks may run without additional approval when they remain non-interactive and do not open visible windows:

- source inspection, diff review, type checking, linting, unit/integration tests, deterministic audits;
- Node/npm scripts that remain in the terminal;
- `cargo check`, `cargo test`, and non-interactive production compilation;
- seed generation, database-integrity queries against copies or isolated fixtures, file hashing, and report generation;
- package creation that does not launch the built application or installer.

Background tests must not synthesize global mouse/keyboard input, take focus, resize user windows, or change operating-system settings.

## Foreground UI tests: explicit permission required

Before every foreground UI test session, stop and ask the user for current, specific permission. Permission must identify:

- the application or installer that will be opened;
- the expected duration;
- whether any mouse, keyboard, focus, resize, restart, or screenshot action is needed;
- the isolated data directory that will be used.

Old permission does not carry into another session. Silence is not permission. If the user says stop or begins using the computer, terminate the automation immediately and leave a resumable checkpoint.

## Prohibited testing methods

Do not use any of the following, even as a convenience:

- changing Windows DPI, display scaling, resolution, monitor configuration, theme, accessibility, input, or other system-wide settings;
- forcing a window to the foreground, making it topmost, repeatedly stealing focus, or fighting the user's active window;
- global mouse/keyboard automation that can affect applications outside the isolated ResearchOS test window;
- closing, minimizing, moving, or resizing the user's other windows;
- terminating processes by name when the exact test PID and executable/data context cannot be proven;
- using the user's production ResearchOS data directory, credentials, clipboard, or personal files for tests;
- bypassing a browser, operating-system, or security permission that blocks localhost or UI automation.

## Preferred UI verification order

Use the least disruptive method that can answer the question:

1. pure function and state-transition tests;
2. component rendering, accessibility-tree/DOM assertions, and keyboard-event tests in an isolated test runtime;
3. headless/off-screen browser checks that create no visible window and do not control global input;
4. user-performed manual checklist with screenshots supplied by the user;
5. foreground packaged-app automation only after the explicit permission described above.

If a lower-impact method cannot prove a visual behavior, report it as `NOT VISUALLY VERIFIED`; do not silently substitute a disruptive method and do not claim PASS.

## Packaged-app test isolation

When foreground permission is granted:

- use a unique project-local test data directory such as `.smoke-v0110/<session-id>`;
- never point the test process at production user data;
- record the exact executable, PID, data directory, start time, window sizes, and completed checkpoint;
- keep one application window only and avoid installers unless installer behavior is the stated test;
- on completion or interruption, close only the exact recorded test PID and confirm that it exited;
- do not delete test data unless the exact project-local path is verified and deletion is separately within scope.

## Current M014-02 rule

M014-02 is paused. Background-only work may resume only when the user asks to resume the milestone. Packaged-app visual smoke, installer launch, mouse/keyboard automation, window resizing, and screenshots remain pending and require a new explicit approval immediately before that session.

## Required test reporting

Every implementation report must separate:

- `BACKGROUND AUTOMATED — PASS/FAIL`;
- `HEADLESS/OFF-SCREEN — PASS/FAIL/NOT RUN`;
- `FOREGROUND UI — PASS/FAIL/NOT RUN (permission reference)`;
- `USER-MANUAL — PASS/FAIL/NOT RUN`.

Record commands, fixtures, isolated paths, failures, and remaining checks. Never combine unperformed UI checks into a general “all QA passed” statement.
