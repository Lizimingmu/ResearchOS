# M019 Audit Round 1 — Adversarial Software and State Review

## Scope and method

Diff-based review from `55730c2` through the final M019 candidate snapshot. The review traced canonical registry navigation, store-level transition guards, scheduler legality, immutable response/evidence writes, migrations, persistence restart paths, artifact identities, and the new read-only curriculum preview. Evidence was checked against the 178-test suite and deterministic registries rather than inferred from a green build alone.

## Findings and repairs

| Severity | Finding | Repair evidence | Recheck |
|---|---|---|---|
| BLOCKER | Direct Case Lab entry could previously bypass scheduler prerequisites. | UI and store now use canonical prerequisites; `startCaseSession` refuses creation and returns the exact missing abilities. Guide and Practice converge on the same gated surface. | M019-A1 direct/store/Guide tests and Case E2E pass. |
| MAJOR | A due review could reopen Learn after persisted phase drift. | `openLearningContentTask` forces the exact legal review phase and is shared by Today and Review. Early reviews remain illegal. | M019-A2 drift and early-review regressions pass. |
| MAJOR | Cox primary Apply lacked discriminating distractors and failure could replay the same asset. | Primary Apply now has nine plausible choices with five correct; remediation and delayed review use distinct IDs, scenarios and option sets. | M019-A3/A4 and Cox E2E pass. |
| MAJOR | Capability-gated Paper fields were coupled to rendering details and could drift or double count. | Field access is now a pure exported projection of standardized capability evidence; weekly records remain deduplicated. | Paper E2E and capability-gate tests pass. |
| MAJOR | Generated curriculum could be mistaken for active teaching content. | All 374 generated items remain `ai_generated`, `pending`, `pending_review`; preview is read-only and shows the exact required banner. | Curriculum audit reports zero active generated items; preview mutation test passes. |
| MAJOR | Candidate free-text scoring could return a false `complete` from copied or generic strings. | The machine now performs only structural preflight. Even a mechanically eligible response returns `review_required` with a display-only `recommendedNextRoute`; it never returns complete or writes competence. | Adversarial marker/copy payloads and no-competence assertions pass. |
| MINOR | CSS output exceeded the deterministic performance budget by 540 bytes. | The bundle step now applies deterministic CSS whitespace/punctuation minification. | Performance audit passes; initial JS 1,119,622 bytes and scheduler 0.0092 ms. |
| MINOR | Onboarding semantics lacked explicit dialog/progress/pressed-state relationships and the final focus rule could be reset. | Added dialog labelling, progressbar state, `aria-pressed`, decorative-icon hiding, and a final `:focus-visible` rule. | Accessibility audit passes 11/11. |

## State invariants rechecked

- Failed Apply, Guide reading, Learn, Explain, and pending preview create no standardized competence.
- Review legality is due-time and exact-content gated.
- Case reasoning, calibration and learner update are separate append-only records; restart does not overwrite earlier stages.
- Case and Project artifacts are idempotent by canonical source/context identity.
- Paper weekly records and Kernel capability projection do not double count.
- Foundation plus Project Overlay stays within the two-thread scheduler limit.
- Schema migrations are additive and future schemas fail closed.
- Public fixtures remain fictionalized; curriculum audit found no private identifiers or local paths.

## Round result

All clear software/state BLOCKER and MAJOR findings were repaired. The full suite passes 178/178; registry 297/9, localization, startup smoke, curriculum, accessibility and performance audits pass. Foreground browser coverage and current-source desktop packaging are tracked as environment/permission limitations in the readiness report, not silently converted into passes.
