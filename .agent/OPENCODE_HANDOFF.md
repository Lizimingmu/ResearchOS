# OpenCode Handoff — M013 Research Problem Atlas

## Execute

M013-01 through M013-07 only. Use `opencode-go/deepseek-v4-pro`. Do not package, release or execute Git commands.

## Required specification

Read `AGENTS.md`, product constitution, scientific gates, project state, current milestone, task queue, `PROBLEM_ATLAS_SPEC.md` and `SOURCE_INGESTION_SPEC.md`. Do not read historical user prompts. Inspect only directly related existing types/store migration, persistence gateway, navigation/App shell, search, AttemptFlow, scheduler/review/scoring, representative content schemas, validators and tests.

## Preserve

Existing dirty M011 localization work and committed M012 specification. M012 implementation is paused. Do not delete Protocol curriculum/specification, reset the worktree, change release artifacts or bump versions.

## Expected modules/files

Adapt names to existing conventions, but keep responsibilities separate:

- domain types for sources, evidence claims, ProblemCards, causes/checks/paths/evidence/cases and diagnostic sessions;
- v2→v3 application-state migration plus persistence tests; SQLite/persistence changes only where required by the existing gateway;
- `src/data/problemAtlas*` small pending demo pack;
- `src/problem-atlas/search.ts` deterministic search and `diagnosticEngine.ts` pure state transitions;
- `src/services/sourcePack*` parsers, normalization, dry run and transactional import;
- `src/features/problem-atlas/ProblemAtlasView.tsx` and focused components;
- navigation/App lazy route, global search, Today scheduler, Review/misconception, Skill Map and related-entity links;
- `scripts/source-pack-audit.mjs` and `scripts/problem-atlas-audit.mjs`;
- focused node/integration tests and package scripts.

Do not turn each entity into one Markdown blob or one huge React component.

## Engineering contract

1. Implement all normalized fields/enums/foreign keys from both specs. Preserve immutable canonical cards and separate mutable DiagnosticSession history.
2. Import JSON, per-entity CSV and Markdown/frontmatter as untrusted data. Provide parse/validate/dry-run before explicit confirmed mutation; rollback on any import failure.
3. Never infer authority tier from branding/journal or promote pending content. Metadata verification and claim verification remain separate.
4. Support current/superseded/deprecated/emerging, non-destructive supersession links and visible categorical badges.
5. Search Chinese/English/abbreviation/alias/keywords/related concepts deterministically. No free-chat fallback or generated answer on no match.
6. Implement eight Human-First modes. Lock every judgment before feedback; sequential troubleshooting records every belief update and revealed evidence.
7. Reuse existing verified evidence identifiers for demo transformations, but mark every new ProblemCard/path/rubric pending. No external scientific search.
8. Integrate wrong + high confidence into delayed far-transfer Review; Today schedules at most one new Problem task and never displaces due review.
9. Link to Method/Protocol/Pattern stable IDs without copying their content.

## Status-transition hard rules

- AI-generated or transformed scientific content cannot enter verified/claim_verified.
- Metadata-verified source does not verify its claims.
- Tier D cannot back verified claims; Tier X is rejected.
- Same identifier with conflicting source IDs is an import conflict.
- Verified content updates require provenance/audit; supersession never deletes historical learning records.
- Importer must be idempotent for identical pack ID/content hash.

## Tests and automated QA

Add tests for v2 migration; CRUD/persistence; JSON/CSV/Markdown parsing; invalid schema/enums/IDs; duplicate DOI/PMID/title; broken foreign keys; version cycles; checksums; dry-run non-mutation; transaction rollback; self-verification rejection; status transitions; deterministic fuzzy ranking; filters; locked feedback; sequential history; misconception/far-transfer; Today bound; global navigation/search/open flow.

Validators must emit JSON artifacts and exit nonzero on errors. Run handoff validator, typecheck, full tests, existing content/localization/performance/startup gates, new atlas/source audits, and Rust tests if Rust changed.

## Reports and stop condition

Replace `.agent/IMPLEMENTATION_REPORT.md` with exact files, commands/results, failures and remaining issues. Append only new scientific content/rubric changes to `.agent/SCIENTIFIC_CHANGESET.md`, including source IDs/PMID/DOI and pending state. Stop for Codex review; do not package.

## Host command

```powershell
opencode run --pure --auto --model "opencode-go/deepseek-v4-pro" --title "ResearchOS M013 Problem Atlas" "Read AGENTS.md and .agent/OPENCODE_HANDOFF.md. Execute only M013-01 through M013-07. Do not invoke Git. Preserve existing work, do not package, run all specified QA, update IMPLEMENTATION_REPORT.md and SCIENTIFIC_CHANGESET.md, then stop for Codex review."
```
