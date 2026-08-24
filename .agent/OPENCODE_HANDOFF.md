# OpenCode Handoff

## Task ID

M011-01 through M011-04

## Objective

Turn the current uncommitted Chinese-first/i18n work into a reviewable v0.11.0 candidate. Do not package yet.

## Model

Use DeepSeek V4 Pro for implementation and debugging. DeepSeek V4 Flash may be used only for mechanical localization scans, report formatting and metadata cleanup.

## Required entry context

Read only:

1. `.agent/PRODUCT_CONSTITUTION.md`
2. `.agent/SCIENTIFIC_GATES.md`
3. `.agent/PROJECT_STATE.md`
4. `.agent/CURRENT_MILESTONE.md`
5. `.agent/TASK_QUEUE.md`
6. Current `git diff 441ece1` and directly imported files needed to compile/fix it

Do not reread historical master prompts or scan the full repository unless an architecture-level blocker is reported.

## Allowed files

Current dirty localization/i18n files, directly related tests/scripts, `.agent/IMPLEMENTATION_REPORT.md`, and `.agent/SCIENTIFIC_CHANGESET.md`. Version/package files are deferred until M011-07.

## Do not touch

Learning scheduler semantics, scoring formulas, state/SQLite schema, evidence verification rules, approved release artifacts, or unrelated features. Do not delete or reset existing dirty changes.

## Known first failure

`scripts/localization-audit.mjs` checks `nav.methods` and `nav.skills`, while the dictionary keys are `nav.methodLab` and `nav.skillMap`. Fix the audit/dictionary contract consistently, then run the entire gate; do not stop after this known error.

## Scientific handling

Any Chinese paraphrase of a method definition, audit rationale, reference answer, assessment rubric or maximal conclusion is scientific content. Record it in `SCIENTIFIC_CHANGESET.md`, preserve the English source text where useful, and leave it pending. Do not invent a citation or promote it to verified.

## Commands

```powershell
node scripts/validate-agent-handoff.mjs
npm run typecheck
npm test
npm run content:audit
npm run performance:audit
cargo test --manifest-path src-tauri/Cargo.toml
```

If Cargo requires the repository's existing proxy workaround, report that fact and the exact command. Do not package until Codex returns `ACCEPT`.

## Deliverable

Update `IMPLEMENTATION_REPORT.md` with changed files, implementation, exact test outcomes, failures and remaining issues. Update `SCIENTIFIC_CHANGESET.md` only with scientific changes. Then stop for Codex review.

## Launch command

Run from a normal PowerShell terminal in `D:\Agents\ResearchOS`:

```powershell
opencode run --pure --model "opencode-go/deepseek-v4-pro" --title "ResearchOS M011 localization candidate" "Read AGENTS.md and .agent/OPENCODE_HANDOFF.md, then execute only M011-01 through M011-04. Preserve all existing dirty work, do not package, update both required reports, run the specified QA, and stop for Codex review."
```

The Codex sandbox attempted this exact delegation on 2026-08-24, but the host denied OpenCode's nested `git` process with `EPERM: uv_spawn 'git'`. This is an execution-host blocker; do not treat it as an implementation failure.
