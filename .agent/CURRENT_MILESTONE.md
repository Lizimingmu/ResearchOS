# Current Milestone — M018.1 End-to-End Learning Wiring

Execution status: **BACKGROUND IMPLEMENTATION AND DETERMINISTIC GATES COMPLETE — FOREGROUND USER TRIAL NOT RUN**.

## Objective

Complete the already-approved M018 architecture as one runnable learning system without adding curriculum or redesigning navigation. Guide, Concept Lesson, Method Lesson, Case Lab, Today, Review, Progress and Studio now share versioned assets, canonical metadata and persisted learning state.

## Implemented scope

- Confounding and Cox now submit locked, confidence-bearing, no-hint Apply responses directly to versioned Learning Kernel assets. A passed Apply creates `independent_once`; a passed due review creates `retained`.
- Statistical Unit, Confounding and Cox use distinct primary/remediation/review surfaces inside the M018 renderer. The M017 renderer remains an explicit compatibility route, not the default completion path.
- Additive frontend schema 7→8 persists `LearningContentProgressV1` with zero inference. Learn/Explain remain exposure; only scored Apply/review events create standardized evidence.
- A canonical `learningContentRegistry` drives Today scheduling, Learn selection, Guide links and Progress projection. Its deterministic audit checks IDs, prerequisites, mappings, assets, provenance, lifecycle and public-content privacy.
- Today now schedules Foundation, Project Overlay, one actually due review and Routine, while preserving hard prerequisites, project-consent isolation and the two-thread maximum.
- Case Lab now performs Evidence → locked reasoning → expert calibration → optional update → Continue, retains all three timeline layers, supports selected cases and de-duplicates canonical Transfer Artifacts.
- Paper fields unlock by specific capability evidence instead of the highest global competence level.
- M018.1 adds 34 targeted regression checks, including Case Lab overlay routing; the complete frontend suite is 155/155.

## Deliberately bounded

The only prototypes remain Statistical Unit, Confounding, the fictionalized Evidence → Claim case and Cox regression. No P-value, confidence-interval, NMF, GSEA, single-cell or other new lesson was added. Packaging, installer, real Vault, foreground UI and merge to `main` remain outside this milestone.

## Next action

Run a real foreground user trial of Statistical Unit, Confounding, Cox and Case Lab, including restart recovery and a due-review clock scenario. Do not continue architecture refactoring, expand curriculum or package before that trial is accepted.
