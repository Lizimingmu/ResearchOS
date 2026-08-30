# Project State

Last updated: 2026-08-31

- Product version remains 0.12.0; M018.1 is a source patch and does not package or merge to `main`.
- Branch: `codex/m018.1-end-to-end-wiring`.
- Approved baseline: commit `401c0ed8469d791b0e214f0ed6811b08a5f0a4a3` (accepted M018 source state).
- Frontend state schema / SQLite user version: 8 / 2. Schema 7→8 adds an empty `learningContentProgress` map, is additive, idempotent and zero-inference; native WAL, atomic persistence and recovery snapshots are unchanged.
- Canonical M018 content registry: five Guide entries, two Concept Lessons, one Method Lesson and one Case Lab. The prototype boundary remains Statistical Unit, Confounding, Cox and one fictionalized Evidence → Claim case.
- Confounding and Cox have versioned, bound, distinct Apply/review assets; Statistical Unit and Confounding also have fresh remediation assets. Standardized evidence is produced only by scored, locked Kernel attempts.
- Today has a Foundation Spine and optional Project Overlay, plus one due review and Routine. Hard prerequisites and a maximum of two active learning threads are enforced; project content is not inspected when relevance consent is off.
- Progress consumes old compatible Kernel states/events, persisted M018 content progress and Transfer Artifacts without treating exposure or transfer as mastery.
- Case sessions preserve original reasoning, expert calibration and optional learner updates. Case and Project Studio artifacts are idempotent per canonical source/context.
- M017 compatibility, Content Studio/provenance, local SQLite/WAL/recovery, credentials isolation, explicit Obsidian writes and future-schema refusal remain intact.
- Current automated evidence: lint/typecheck PASS; tests 155/155 plus localization 11 and startup smoke; Learning Kernel 16/16; M018 registry audit PASS; M015 32/32; source-pack, Problem Atlas and content audits PASS; performance PASS.
- Foreground Windows interaction, user-manual trial, packaged restart, installer, real Vault and packaging: **NOT RUN**.
- Next milestone action is a real user foreground trial, not more architecture work.
