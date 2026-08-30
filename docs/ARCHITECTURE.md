# ResearchOS architecture — M018

React workspaces call pure learning/domain functions and the Zustand store; persistence continues through the existing desktop adapter to SQLite WAL. Credentials remain in Windows Credential Manager. M018 changes only the frontend learning architecture and canonical state payload, not the native persistence boundary.

## Learning boundaries

- `src/domain/learningKernel.ts`: compatible standardized practice/event kernel.
- `src/domain/learningArchitecture.ts`: Guide, Concept, Method, Case, Transfer, Project Studio and capability projection contracts.
- `src/data/learningArchitecture.ts`: four bounded source-linked prototypes.
- `src/features/guide`: searchable continuous reference reading.
- `src/features/learning`: adaptive Concept/Method surfaces plus M017 compatibility path.
- `src/features/case-lab`: staged evidence, locked reasoning and Decision Timeline.
- `src/features/paper-lab` / `projects`: integrated work and real-context artifacts.
- `src/features/review` / `skills`: unified review and projected evidence.

Practice assets remain immutable practice infrastructure. They are not the universal container for Guide content, explanation prose, case stages or Studio records.

## State schema 7

New collections are `guideReadSectionIds`, `caseSessions`, `transferArtifacts` and `projectStudioRecords`. Migration is additive, idempotent and zero-inference. A future schema is refused before persistence. SQLite user version remains 2, so atomic writes, WAL, integrity-checked restore and five bounded recovery snapshots are unchanged.

## Trust boundary

Guide reading and explanatory writing cannot generate competence. Case history is locked against overwrite and tied to `(caseId, revision, hash)`. Transfer Artifacts never promote mastery. Generated scientific content cannot self-verify. Public built-ins contain no local path, patient identifier or private project detail.
