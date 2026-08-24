# Task Queue

| ID | Priority | Task | Owner | Acceptance criteria | Scientific review required |
|---|---|---|---|---|---|
| M011-01 | P0 | Inventory the existing dirty localization diff without discarding user/Codex work | OpenCode Pro | Report changed files and classify engineering vs scientific presentation changes | Yes, only scientific subset |
| M011-02 | P0 | Repair i18n/localization audit and complete Chinese-first core UI | OpenCode Pro | 21 functional tests plus localization audit pass; no untranslated core control; bilingual method terms retained | No for UI; Yes for scientific paraphrases |
| M011-03 | P0 | Complete scientific changeset for every changed explanation, answer or rubric | OpenCode Pro | Required fields, source IDs/PMID/DOI, risk and pending status present; no unsupported new claim | Yes |
| M011-04 | P1 | Run deterministic QA and fix engineering failures | OpenCode Pro | handoff validator, typecheck, tests, content audit, performance audit, startup smoke and Rust tests pass | No |
| M011-05 | P1 | Codex diff and scientific review | Codex | Review only baseline diff, reports, failures and directly related dependencies; write gate result | Yes |
| M011-06 | P1 | Apply requested review patches and rerun regression | OpenCode Pro | Exact review findings resolved; full QA remains green | As marked in review |
| M011-07 | P1 | Release gate and Windows packaging | Codex then OpenCode Pro | Codex ACCEPT; v0.11.0 versions aligned; portable/setup artifacts and SHA256 recorded | Release sign-off |

## OpenCode task record format

Each execution task must state: `Task ID`, `Objective`, `Allowed files`, `Do not touch`, `Inputs`, `Implementation requirements`, `Commands to run`, `Acceptance criteria`, `Scientific risk`, and `Report destination`. Do not broaden scope without adding a queue item.
