# Current Milestone — M011

## Outcome

Finish the existing Chinese-first localization/i18n work as a stable v0.11.0 candidate without changing core learning semantics or adding unrelated features.

## Scope

- Repair the current localization audit failure and complete Chinese-first UI coverage.
- Preserve standard English scientific terminology and original paper/source text.
- Audit existing in-progress scientific paraphrases; do not add new scientific claims.
- Run deterministic engineering, content, localization, database/Rust, performance and startup gates.
- Package Windows portable/setup artifacts only after Codex review accepts the candidate.

## Out of scope

New product features, schema changes, new curricula, new evidence claims, visual redesign, autonomous research functions, or new network providers.

## Acceptance

1. All TASK_QUEUE M011 items are complete.
2. `node scripts/validate-agent-handoff.mjs` passes.
3. Full QA passes with results recorded in `IMPLEMENTATION_REPORT.md`.
4. All scientific presentation changes are recorded in `SCIENTIFIC_CHANGESET.md`; high-risk items remain pending until Codex accepts them.
5. Codex diff review returns `ACCEPT` before release packaging.
6. Final artifacts have size and SHA256 recorded.
