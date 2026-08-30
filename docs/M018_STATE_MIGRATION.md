# M018 frontend state migration — schema 6 → 7

Schema 7 adds four collections:

- `guideReadSectionIds`
- `caseSessions`
- `transferArtifacts`
- `projectStudioRecords`

Migration appends empty defaults when a collection is absent and preserves a present collection verbatim. It does not infer Guide reading, Case history, transfer, Project Studio work, instruction completion or competence from legacy fields. Reopening schema 7 is idempotent; schema 8+ fails closed before persistence.

The native SQLite schema remains `user_version=2` because canonical state stays in the existing atomic record. WAL, recovery snapshots, backup integrity checks, Content Studio, Obsidian state and provider configuration remain unchanged.
