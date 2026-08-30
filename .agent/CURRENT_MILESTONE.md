# Current Milestone — M018 Learning Architecture Refactor

Execution status: **BACKGROUND IMPLEMENTATION AND DETERMINISTIC GATES COMPLETE — FOREGROUND USER TRIAL NOT RUN**.

## Objective

Turn ResearchOS from one universal lesson/question mechanism into a guided research apprenticeship organized by knowledge and competence type: Guide, Concept Lesson, Method Lesson, Case Lab, Studio, standardized review, and real-world Transfer Artifacts.

## Implemented scope

- Dedicated Research Guide with chapters, anchors, search, glossary, provenance, lifecycle and links. Reading never creates competence.
- Default Concept Lesson flow: Learn → Explain → Apply, with remediation only after need; no automatic free-text mastery scoring.
- Method-specific Cox proportional hazards lesson covering question, inputs, logic, outputs, assumptions, appropriate/inappropriate use, misuse, reviewer checks and paper appearance.
- `ResearchCaseV1`, locked stage reasoning, progressive evidence reveal, restart-safe history and Decision Timeline.
- Fictionalized oncology/omics Evidence → Claim prototype with discordant proteomics, scRNA and spatial/pathology evidence.
- Genuine non-card Statistical Unit Hierarchy Explorer and a lightweight Confounding DAG surface.
- Paper Studio progressive disclosure and weekly `paperId` de-duplication.
- Project Studio append-only reasoning records that create separate Transfer Artifacts.
- Capability Evidence Projection for eight capabilities: exposure, standardized evidence and transfer artifacts remain separate.
- Unified Review presentation for Learning Reviews versus Other Practice Reviews.
- P0 corrections: guided failure stays in remediation/guided; high-confidence conceptual failure records misconception; project relevance opt-out is honored; successful transfer waits until maintenance due.
- Additive frontend state schema 6→7 for Guide reading, Case sessions, Transfer Artifacts and Project Studio history.

## Deliberately bounded

Only four architecture prototypes exist: Statistical Unit, Confounding, Research Question / Evidence → Claim Case Lab and Cox regression. The full curriculum was not generated. M017 assets, legacy review mechanisms, Content Studio, SQLite/WAL, recovery, credentials and Obsidian boundaries remain intact.

## Next action

After deterministic gates and push, run a real user trial of the six required surfaces. Do not expand curriculum or package until that trial is accepted.
