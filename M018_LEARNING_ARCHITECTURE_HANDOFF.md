# M018 Learning Architecture Refactor — Handoff

Date: 2026-08-31  
Branch: `codex/m018-learning-architecture`  
Baseline: M017 commit `2a598b1fefa5a8bc84277d489fe3eb0f08f15afb`

## 1. Corrected M017 defects

- Guided failure stays in guided/remediation; only pass enters independent-ready.
- High-confidence conceptual failure records an explicit misconception.
- Capability Progress consumes Learning Kernel events through a de-duplicated projection.
- `transferable` waits for maintenance `dueAt` and is not scheduled daily.
- `allowProjectRelevance=false` makes project relevance exactly zero.
- Weekly Paper Studio counting de-duplicates by `paperId`.
- Onboarding CTA now actually routes to Learn.
- Review presents formal Learning Reviews and Other Practice Reviews coherently.

## 2. Preserved M017 infrastructure

Versioned Practice Assets, response locking, role-distinct independent/review assets, confidence/hint boundaries, prerequisites, two-thread limit, pause/resume, Today, routines, Think Before AI and all legacy practice mechanisms remain. Content Studio, provenance, pending AI imports, SQLite/WAL/recovery, credentials and Obsidian explicit-write constraints are unchanged.

## 3. Replacement for the universal nine-step lesson

Concept learning now defaults to one coherent `Learn → Explain → Apply` surface. Remediation appears only after need. The M017 renderer remains available solely as a compatibility path for existing events and standardized assets.

## 4. Research Guide

`ResearchGuideSectionV1` stores chapter, anchor, classification, summary/body, glossary, advanced notes, links, sources, verification and lifecycle. The Guide is searchable and continuous; marking read only updates `guideReadSectionIds` and creates no competence event.

## 5. Concept Lesson

`ConceptLessonV1` provides why, intuition, precise explanation, worked example, an own-words Explain checklist, an optional concept-specific interaction, one Apply asset and a distinct review asset. Free text is self-compared, not AI-scored.

## 6. Method Lesson

`MethodLessonV1` has a method-specific contract. The Cox prototype covers scientific question, time/event/covariate input, relative-hazard logic, coefficient/HR/CI/P output, PH/time-origin/censoring/specification/event-complexity assumptions, misuse, reviewer checks, paper reporting and a Methods audit.

## 7. Case Lab

`ResearchCaseV1` uses dedicated stages and typed evidence blocks. Each response is locked before the next evidence layer; sessions bind case revision/hash, reject overwrite/out-of-order entry, persist history and render a Decision Timeline rather than a total score.

## 8. Paper Studio

Beginner fields appear first. Intermediate statistical unit/confounding/validation/alternative-explanation fields require independent evidence; advanced concern/mismatch/maximum-claim/reviewer fields require retained evidence. Repeat saves update one Paper Card and count the same `paperId` once per week.

## 9. Project Studio

Project Studio captures phenomenon, evidence, uncertainty, question, competing explanations, gap, next minimal analysis, outcomes, failure mode, validation and maximum claim. Every save appends a history record and creates a separate local Transfer Artifact.

## 10. Transfer Artifact

`TransferArtifactV1` is a versioned record of paper/project/AI-audit/case application with concepts, capabilities, reasoning, claim boundary, next step and linked source events. It means real-context work exists; it does not mean mastery.

## 11. Standardized competence versus transfer

Standardized competence remains derived from scored, versioned Kernel events: unassessed/guided-only/independent-once/retained (legacy transferred remains compatible). Transfer artifacts are a separate count/context axis and never mutate competence.

## 12. Capability projection

An explicit unit-to-capability map projects instruction exposure and competence event IDs into eight capabilities. IDs are de-duplicated; no duplicate SkillEvidence record is created. Transfer is joined only for display.

## 13. Review unification

Learning Reviews read the same due Kernel states that Today uses. Other Practice Reviews retain legacy review items/judgment workflows. The user no longer has to infer that they are competing review systems.

## 14. Today scheduling

Legal Kernel state is evaluated first. Today keeps one current foundation item, one truly due review when present and one lightweight routine. Project Overlay affects priority only with consent and cannot bypass prerequisites or the two-thread limit.

## 15. Project relevance opt-out

Yes. The relevance function returns zero before reading project/onboarding content when `allowProjectRelevance === false`; a semantic test asserts every scheduled task has zero project relevance.

## 16. Paper de-duplication

Yes. New writes are de-duplicated by completed `paperId` within the UTC week, and Today counts unique paper IDs so historical duplicate logs cannot inflate the display.

## 17. Schema and migration

Frontend schema advances 6→7 and adds Guide-read IDs, Case sessions, Transfer Artifacts and Project Studio records. Missing fields become empty collections; existing collections are preserved. Migration is idempotent, zero-inference and future schema 8+ fails closed. SQLite user version remains 2.

## 18. Completed prototypes

- Statistical Unit Concept Lesson + genuine Hierarchy Explorer + standard Apply bridge + distinct delayed review asset.
- Confounding Concept Lesson + lightweight DAG + Apply surface.
- Research Question / Evidence → Claim fictionalized oncology/omics Case Lab.
- Cox proportional hazards Method Lesson.

Content expansion stops here.

## 19. Hierarchy Explorer

It is genuinely non-card interaction: the learner selects patient, sample or cell nodes in a nested visual tree. Selecting cells highlights shared patient grouping and explains measurement precision versus independent patients.

## 20. Tests passed

At handoff preparation: `npm run typecheck` PASS and `npm test` PASS 121/121, plus localization 11 and production startup smoke. Final audit results are appended below before commit.

## 21. Blocked / not run

Foreground Windows interaction, keyboard/screen-reader manual QA, high-DPI visual inspection, packaged restart, installer, real Vault and real-user acceptance are **NOT RUN**. Rust is attempted only if the environment permits and is reported honestly.

## 22. Next milestone

Run a real user trial of Statistical Unit, Confounding, Evidence → Claim Case Lab, Cox Method Lesson, Paper Studio and Project Studio. Classify findings before any curriculum expansion or packaging.

## Final deterministic gate results

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm test` — PASS 121/121; localization 11 and startup smoke PASS.
- `npm run audit:learning-kernel` — PASS 16/16.
- `npm run content:audit` — PASS, 0 errors / 1 pre-existing warning.
- `npm run audit:source-pack` — PASS, 0 errors / 0 warnings.
- `npm run audit:problem-atlas` — PASS, 0 errors / 0 warnings.
- `npm run audit:m015` — PASS 32/32.
- `npm run performance:audit` — PASS; initial JS 1,009,936 bytes; scheduler 0.0065 ms.
- Production build and startup smoke — PASS through `npm test`.
- Migration/persistence semantics — PASS in the 121-test suite.
- Public prototype privacy scan — PASS.
- `git diff --check` — PASS (line-ending notices only).
- Agent handoff validator — PASS.
- Rust offline — BLOCKED before compilation because local cache lacks `urlencoding`.
- Rust online through Clash — BLOCKED during crates.io access by repeated Schannel `SEC_E_NO_CREDENTIALS`; no Rust source changed.
- Foreground UI, installer, packaged restart, real Vault and user-manual trial — **NOT RUN**.
