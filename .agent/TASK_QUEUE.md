# Task Queue

| ID | Priority | Task | Owner | Acceptance criteria | Scientific review required |
|---|---|---|---|---|---|
| M013-01 | P0 | Implement Source Registry, EvidenceClaim and knowledge-version models with v3 migration | OpenCode Pro | Old state preserved; normalized entities/statuses; no automatic claim verification | Architecture/transition rules Yes |
| M013-02 | P0 | Implement source-pack parser, dry-run validator and transactional importer | OpenCode Pro | JSON canonical; CSV/Markdown supported; conflicts/checksum/rollback/audit record tested | No |
| M013-03 | P0 | Implement ProblemCard/diagnostic entities and deterministic search | OpenCode Pro | Alias/abbreviation/Chinese-English/fuzzy/related matching; filters and stable ranking | Data contract Yes; search No |
| M013-04 | P0 | Implement Chinese-first Problem Atlas and eight diagnostic modes | OpenCode Pro | Human-first locks, sequential evidence history, cause ranking, missing-info choice and claim boundary work | Rubrics/reference answers Yes |
| M013-05 | P0 | Add small pending demo pack from existing evidence-backed concepts | OpenCode Pro | Only pseudoreplication/unit, replication, leakage and validation demos; all transformations pending | Yes |
| M013-06 | P0 | Integrate Today, Review/misconception, Skill Map, global search and Method/Protocol/Pattern links | OpenCode Pro | Bounded Today share; far-transfer review; no duplicate teaching content | Learning behavior Yes |
| M013-07 | P0 | Add deterministic audits and engineering tests; write reports | OpenCode Pro | Import/state/search/training/status/UI tests and all existing gates pass; reports complete | Changeset Yes |
| M013-08 | P1 | Diff-based architecture/scientific review | Codex | Review approved-baseline diff, reports, failures and direct dependencies only | Yes |
| M013-09 | P1 | Apply requested patches and regression | OpenCode Pro | Findings resolved and all gates green | As marked |

Deferred: M012-01…08 remain specified in Git commit `3f638a4` and may resume only after M013 ACCEPT.
