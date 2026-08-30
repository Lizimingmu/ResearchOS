# ResearchOS v0.12.0 product specification — M018 source state

ResearchOS is a local-first Guided Research Apprenticeship System. It develops ownership across Phenomenon → Research Question → Hypothesis → Study Design → Analysis → Interpretation → Critique → Next Question. It is educational software, not clinical decision support or a psychometrically validated certification system.

## Four functions

- **LEARN:** searchable Research Guide, Concept Lessons and Method Lessons.
- **PRACTICE:** Apply cases, adaptive remediation, Case Lab, AI Audit, Problem Atlas and assessment.
- **WORK:** Paper Studio, Project Studio, Think Before AI, Project Review and Transfer Artifacts.
- **REVIEW:** delayed unfamiliar learning assets plus preserved legacy practice reviews.

Primary navigation is Today, Guide, Learn, Practice, Projects, Review, Progress and Library. Settings is auxiliary; advanced tools stay under Practice.

## Learning contract

Concept Lessons default to Learn → Explain → Apply. Learn is one coherent surface; Explain requires the learner's own words and a checklist but creates no fabricated score; Apply uses one new case; remediation appears only after failure. A passed versioned standard Apply creates `independent_once`; failed Apply does not.

Method Lessons use a method-specific contract: question, input, logic, output, assumptions, appropriate and inappropriate use, misuse, reviewer checks and paper appearance. Case Lab locks reasoning before revealing each new evidence layer and retains a Decision Timeline rather than one total score.

Research Guide reading is reference exposure only and never competence. Real work creates a Transfer Artifact; it does not automatically mean mastery. Progress separately presents exposure, standardized evidence and transfer artifacts across eight research capabilities.

## Bounded prototypes

1. Statistical Unit — Concept Lesson, Hierarchy Explorer, Apply and delayed review.
2. Confounding — Concept Lesson, lightweight DAG and Apply.
3. Research Question / Evidence → Claim — fictionalized oncology/omics Case Lab.
4. Cox proportional hazards regression — Method Lesson and Methods audit prompt.

No full curriculum expansion is part of M018.

## Data and safety

Frontend schema 7 adds Guide reading, Case sessions, Transfer Artifacts and Project Studio history as empty, zero-inference collections. Existing M015–M017 collections remain available. SQLite `user_version=2`, WAL, atomic writes, bounded snapshots, credentials isolation, provenance, Content Studio and explicit Obsidian writes are unchanged. Future schemas fail closed.

Built-in content is Chinese-first, source-linked and fictionalized/de-identified. AI-generated scientific content remains pending until external review; no automatic AI call or evidence promotion occurs.
