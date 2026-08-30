# M017 frontend state migration — schema 5 to 6

Schema 6 is additive. It preserves every schema-5 collection and adds:

- `lessonProgressByUnitId`: empty record when absent;
- `routineSettings`: user-editable defaults when absent;
- `routineLogs`: empty array when absent;
- `reasoningRecords`: empty array when absent;
- `paperCards`: empty record when absent;
- onboarding preference fields when explicitly supplied by the user.

The migration performs no inference from earlier responses, completed blocks, projects or timestamps. In particular it does not synthesize lesson completion, routine completion, Paper Cards, reasoning records or competence evidence.

Reopening schema 6 is idempotent. Unknown future schemas are refused before persistence, preserving the existing fail-closed contract. SQLite `user_version` remains 2 because the canonical application state stays in the existing atomic state record; WAL, integrity checks and five bounded recovery snapshots are unchanged.

Tests cover schema 1–5 upgrade, v5 collection preservation, zero-inference defaults, idempotent reopen and schema-7 refusal.
