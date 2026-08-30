# ResearchOS architecture — M018.1

React workspaces call pure learning/domain functions and the Zustand store; persistence continues through the existing desktop adapter to SQLite WAL. Credentials remain in Windows Credential Manager. M018.1 connects frontend learning contracts and canonical state without changing the native persistence boundary.

## Learning boundaries

- `src/domain/learningKernel.ts`: immutable standardized assets, bindings, events and competence rules.
- `src/domain/learningArchitecture.ts`: Guide, Concept, Method, Case, content progress, registry validation, Transfer and capability projection contracts.
- `src/data/learningArchitecture.ts`: the bounded prototypes, their Kernel adapters/assets and canonical content registry.
- `src/learning/learningArchitectureEngine.ts`: pure M018 progress creation, prerequisite checks and Practice Asset → Kernel transition.
- `src/learning/scheduler.ts`: compatible Kernel scheduling plus Foundation, Project Overlay and due-review selection.
- `src/features/learning`: data-driven Concept/Method renderers; legacy M017 access is explicit compatibility only.
- `src/features/case-lab`: selected case, staged evidence, calibration/update loop and Decision Timeline.
- `src/features/today`, `guide`, `review`, `skills` and `paper-lab`: registry-backed entry, scheduling, evidence projection and capability-specific disclosure.

Practice assets are not the universal container for Guide prose, explanatory writing, Case stages or Studio records. They are the auditable boundary for standardized Apply and retrieval.

## State schema 8

Schema 8 adds `learningContentProgress: Record<string, LearningContentProgressV1>`. Migration from schema 7 inserts `{}` only, is idempotent and does not infer exposure or competence. Selected content and case are navigation state; case sessions and progress remain persisted canonical data. A future schema is refused before persistence. SQLite user version remains 2, preserving atomic writes, WAL, integrity-checked restore and five recovery snapshots.

## Identity and trust boundaries

Architecture assets retain `(id, revision, contentHash)` snapshots and role-distinct bindings. Registry validation rejects unknown content/capability/prerequisite/unit/Guide/Case references, missing provenance and invalid Apply/remediation/review relationships. Capability projection de-duplicates event IDs.

Guide reading and Explain text cannot generate competence. Case history is version-bound and append-only. Transfer Artifact identity is based on `sourceType + sourceId + sorted concept/capability context`; a repeated source updates or returns the canonical record. Generated scientific content cannot self-verify, and public built-ins contain no local path, patient identifier or private project detail.
