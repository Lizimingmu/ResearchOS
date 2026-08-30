# ResearchOS v0.12.0 product specification — M018.1 source state

ResearchOS is a local-first Guided Research Apprenticeship System. It develops ownership across Phenomenon → Research Question → Hypothesis → Study Design → Analysis → Interpretation → Critique → Next Question. It is educational software, not clinical decision support or a psychometrically validated certification system.

## Four functions

- **LEARN:** searchable Research Guide plus stateful Concept and Method Lessons.
- **PRACTICE:** versioned Apply/remediation/review assets, Case Lab, AI Audit, Problem Atlas and assessment.
- **WORK:** Paper Studio, Project Studio, Think Before AI, Project Review and de-duplicated Transfer Artifacts.
- **REVIEW:** due Concept/Method and compatible Kernel reviews in one Learning Reviews section, plus preserved legacy practice reviews.

Primary navigation remains Today, Guide, Learn, Practice, Projects, Review, Progress and Library. Settings is auxiliary; advanced tools stay under Practice.

## Learning contract

Concept Lessons use persisted Learn → Explain → Apply progress. Learn and Explain record exposure only. Apply is a locked, confidence-bearing, no-hint response to a versioned Practice Asset in the M018 renderer. A passed Apply creates `independent_once`; failure opens explanation and a different remediation scenario; a passed delayed unfamiliar review creates `retained`.

Method Lessons use a reusable explanation/apply/review contract. The Cox prototype performs a structured Methods audit with checklist findings, short reasoning, maximum defensible conclusion and confidence. Its Apply and delayed review are distinct versioned surfaces.

Case Lab locks reasoning before revealing expert calibration, accepts an optional update without overwriting the original response, and then reveals the next evidence stage. Research Guide reading is reference exposure only. Real work creates a Transfer Artifact and never automatically promotes standardized competence.

## Scheduling and progression

Today selects a Foundation Spine item, an optional Project Overlay item, one actually due review and Routine work. Hard prerequisites cannot be bypassed by project relevance, at most two learning threads are active, and `allowProjectRelevance=false` prevents project content from being read for ranking. Rationale comes from each registry entry rather than a universal sentence.

Progress combines compatible Kernel evidence with M018 content exposure and standardized events, then displays Transfer Artifacts separately. Paper Studio fields unlock by their relevant capabilities; unavailable capabilities remain visibly locked.

## Bounded prototypes and data safety

The only prototypes are Statistical Unit, Confounding, the fictionalized oncology/omics Evidence → Claim case and Cox proportional hazards regression. M018.1 adds only the missing Apply, remediation and review variants for those prototypes.

Frontend schema 8 adds `learningContentProgress` as an empty, zero-inference collection. SQLite `user_version=2`, WAL, atomic writes, bounded snapshots, credentials isolation, provenance, Content Studio and explicit Obsidian writes are unchanged. Future schemas fail closed. AI-generated scientific content remains pending until external review.
