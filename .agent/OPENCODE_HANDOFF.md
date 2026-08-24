# OpenCode Handoff — M012 Experimental Protocol Lab

## Task IDs

M012-01 through M012-06. Do not package.

## Objective

Implement the Experimental Protocol Lab specified in `CURRENT_MILESTONE.md` and `PROTOCOL_CURRICULUM.md` as a reasoning/troubleshooting/design-training system, not an SOP encyclopedia.

## Model and hard execution rule

Use `opencode-go/deepseek-v4-pro`. **Do not invoke Git in any form.** No status, diff, log, add, commit, checkout, restore or reset. Read files, modify, test and report only. OpenCode filesystem snapshots are disabled because they rely on Git.

## Read first

`AGENTS.md`, `.agent/PRODUCT_CONSTITUTION.md`, `.agent/SCIENTIFIC_GATES.md`, `.agent/PROJECT_STATE.md`, `.agent/CURRENT_MILESTONE.md`, `.agent/PROTOCOL_CURRICULUM.md`, and assigned rows in `.agent/TASK_QUEUE.md`.

Then inspect only direct dependencies: domain types/state migration, navigation/App shell, scheduler/review/scoring integration, existing Human-First attempt components, representative data schemas, validators and tests. Do not scan historical prompts or unrelated areas.

## Preserve

The worktree already contains uncommitted M011 localization/i18n work. Preserve it and build compatibly on top. Do not reset files or change version/package/release artifacts.

## Implementation requirements

1. Structured entities: ProtocolConcept, ProtocolStage, ProtocolControl, ProtocolCriticalVariable, ProtocolQCCheckpoint, ProtocolFailureMode, ProtocolTrainingCase and ProtocolEvidence; no monolithic Markdown content field.
2. Chinese-first navigation, list/search/filter/detail and all eight training modes.
3. Human-first locked answers, feedback gating, confidence/misconception capture, Review integration and project transfer.
4. Today tasks appear occasionally with bounded share; add Skill Map domain “实验设计与实验方法” and AI Wet-lab Audit integration.
5. Meet starter counts without filler. Priority exemplars must be usable.
6. Every generated scientific seed remains pending. Claim evidence includes claim, source/source type, supporting section, scope, qualification and status.
7. Add `scripts/protocol-content-audit.mjs` for schema, duplicates, IDs/references, counts, evidence and forbidden self-verification.
8. Add focused data, learning, scientific-state and UI integration tests. Preserve existing tests.

## Forbidden design

No universal volumes/times, clinical patient instructions, device control, automatic experiment execution, unqualified manufacturer parameters, or claims that wells/images/fields equal biological replication.

## QA

Run handoff validation, typecheck, complete frontend tests, content/localization/protocol audits, performance/startup checks and Rust tests if affected. Fix ordinary failures. If an old M011 failure blocks the suite, fix only the narrow engineering contract and report it.

## Reports

Replace `.agent/IMPLEMENTATION_REPORT.md` with exact files, features, commands/results, failures and remaining issues. Append M012 entries to `.agent/SCIENTIFIC_CHANGESET.md` using required fields, risk and pending state. Never self-verify scientific content. Then stop for Codex review.
