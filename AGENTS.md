# ResearchOS Agent Entry

Do not reread historical master prompts by default.

## Required entry order

1. `.agent/PRODUCT_CONSTITUTION.md`
2. `.agent/SCIENTIFIC_GATES.md`
3. `.agent/PROJECT_STATE.md`
4. `.agent/CURRENT_MILESTONE.md`
5. Your assigned row(s) in `.agent/TASK_QUEUE.md`

## Roles

- Codex is Product Architect, Scientific Editor, Senior Reviewer and Release Gatekeeper. It reviews from the approved baseline diff plus `.agent` reports and directly related dependencies.
- OpenCode / DeepSeek V4 Pro is the default implementer. DeepSeek V4 Flash is reserved for mechanical low-risk work.

## Implementation entry

OpenCode must read `.agent/OPENCODE_HANDOFF.md`, preserve unrelated/user changes, update `.agent/IMPLEMENTATION_REPORT.md`, and put only scientific changes in `.agent/SCIENTIFIC_CHANGESET.md`.

OpenCode must not execute any Git command. Project OpenCode configuration disables Git-backed snapshots; outer Codex owns all Git operations.

## Review entry

Codex reads: `git diff <approved-baseline>..HEAD`, implementation report, scientific changeset, failures, and directly related dependencies. Expand scope only when an architecture-level risk is recorded. Write only `ACCEPT`, `REJECT`, or `PATCH REQUIRED` plus necessary reasons to `.agent/REVIEW_RESULT.md`.

Run `node scripts/validate-agent-handoff.mjs` before handoff. Packaging requires Codex `ACCEPT`.
