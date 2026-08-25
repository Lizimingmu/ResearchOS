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
| M013-08 | P1 | Diff-based architecture/scientific review | Codex | Completed: `PATCH REQUIRED`; findings recorded in `REVIEW_RESULT.md` | Yes |
| M013-09 | P0 | Apply requested patches and regression | OpenCode Pro | Every review finding resolved; reproduced failures covered; all gates green; reports updated; stop for re-review | As marked |
| M013-10 | P0 | Harden external-pack validation and produce auditable legacy→v3 staging conversion | OpenCode Pro | 8 original packs safely reject without crash; explicit problemType/unclassified staging; structural and scientific-completeness results separated; converted staging dry-run is conflict-free but import-ineligible while incomplete; no scientific content inferred, invented or promoted; no production import | Yes |
| M013-10R | P0 | Reject oversized CSV fields and remove identical-import completeness bypass | OpenCode Pro | No truncation; structured oversize rejection; incomplete/unclassified identical pack remains import-ineligible and apply-rejected; focused regressions pass | No |
| M013-11 | P0 | Final diff/demo-scientific/release gate; keep external corpus quarantined | Codex | M013-09/10R findings resolved; four pending demo cards reviewed; 166 external cards remain unclassified and unimported | Yes |
| M013-11R | P0 | Close sequential node validation and temporal-validation wording/evidence | OpenCode Pro | Fake/reordered/mismatched nodes rejected; completion requires unique ordered path coverage; random split vs temporal validation wording consistent; temporal claim mapped; focused/full gates pass | Temporal text Yes |
| M013-11R2 | P0 | Correct Altman validation PMID and pin DOI↔PMID pair | OpenCode Flash | PMID is 19477892 in source, generated pack and changeset; deterministic audit asserts DOI/PMID pairing; all gates pass | Metadata sign-off Yes |
| M014-01 | P1 | Add a five-minute Chinese first-run tutorial | OpenCode Pro | Skippable/restartable guided flow for Today, Atlas, evidence status, lock-before-feedback and Review; existing demo only; keyboard/accessibility/test coverage | No (copy gate only) |
| M014-02 | P0 | Release regression, versioning and packaging | OpenCode Pro | All gates pass; tutorial smoke passes; installers/hashes/release notes generated; stop for Codex sign-off | Release sign-off Yes |

Deferred: M012-01…08 remain specified in Git commit `3f638a4` and may resume only after M013 ACCEPT.
