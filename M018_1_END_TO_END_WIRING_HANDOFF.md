# M018.1 End-to-End Learning Wiring Handoff

Baseline: `401c0ed8469d791b0e214f0ed6811b08a5f0a4a3`

Branch: `codex/m018.1-end-to-end-wiring`

Scope: wiring only; the M018 product direction and four-prototype curriculum boundary are unchanged.

## Required answers

1. **Confounding competence pipeline — YES.** Its primary Apply, fresh remediation and delayed review are different versioned assets with stable revision/hash and bindings. Locked, confident, no-hint Apply pass creates `independent_once`; a due review pass creates `retained`.
2. **Cox Apply + review — YES.** The reusable Method renderer collects a structured Methods audit, short reasoning, maximum defensible conclusion and confidence. Its Apply and unfamiliar delayed review are distinct assets with structured feedback and standardized events.
3. **Concept/Method progress persistence — YES.** Schema 8 persists `LearningContentProgressV1` phase, Explain completion, Apply start, remediation state/attempt and timestamp. Migration inserts an empty map and infers nothing.
4. **Statistical Unit default path without Legacy — YES.** Learn → Explain → Hierarchy Explorer → versioned Apply/remediation/review completes entirely in the M018 renderer. Legacy remains an explicit compatibility/debug action.
5. **Today schedules M018 content — YES.** The M018 curriculum layer selects registry-backed Confounding, Cox and Case Lab tasks, routes Case Lab to the selected case, and routes due Concept/Method review to the exact renderer.
6. **Foundation / Project Overlay — YES.** Foundation follows prerequisites; one consented project-relevant overlay may coexist. Together they never exceed two active learning threads, and overlay cannot bypass prerequisites.
7. **Progress recognizes Confounding/Cox — YES.** Projection consumes M018 content exposure plus their Kernel events, alongside compatible legacy states/events and separate Transfer Artifacts, with event-ID de-duplication.
8. **Capability registry integrity — PASS.** The deterministic M018 audit checks duplicate/unknown IDs, capabilities, prerequisites, asset relationships, Guide/Case links, provenance, active verification and prohibited public strings, and is part of default learning/content gates.
9. **Biological Replicate ID typo — FIXED.** The canonical mapping target is `lu-biological-technical-replicate-v1`; unknown variants fail registry validation.
10. **Case reveal feedback — WIRED.** Each stage locks reasoning before rendering expert calibration, then requires explicit Continue before the next evidence.
11. **Case update reflection — SAVED.** Optional updates append to the same stage timeline entry while original reasoning and calibration remain separate and unchanged.
12. **Transfer Artifact duplication — PREVENTED.** `sourceType + sourceId + sorted concept/capability context` resolves one canonical artifact. Repeated Case clicks or one Project Studio record update/return that artifact rather than increasing the count.
13. **Fresh remediation — YES.** Statistical Unit and Confounding remediation IDs and scenarios differ from their primary Apply; the failed primary response is not merely cleared and replayed.
14. **Paper disclosure by capability — YES.** Statistical Unit, Confounding, Result Interpretation and advanced critique have separate gates. Validation remains locked with “尚未学习该能力” because no prototype supplies that evidence.
15. **Guide deep links — PRECISE.** Guide actions set the target `selectedLearningContentId` or `selectedCaseId` before opening the destination.
16. **Case selection — YES.** Case Lab resolves `selectedCaseId`; it no longer renders `researchCases[0]` as its content path.
17. **Tests — PASS.** Full suite 155/155, including 34 M018.1 tests; localization 11; startup smoke; Learning Kernel 16/16; M018 registry, content, source-pack, Problem Atlas, M015 and performance audits pass. Rust is BLOCKED before compilation by the missing offline `urlencoding` crate.
18. **Foreground/manual validation still missing.** Windows foreground trial, real pointer/keyboard/focus flow, screen-reader announcements, high-DPI layout, actual restart recovery, delayed-review clock experience, user comprehension, packaged restart, installer and real Vault remain untested.

## Gate record

| Gate | Result |
|---|---|
| lint / typecheck | PASS |
| frontend tests | PASS 155/155 |
| localization / startup smoke | PASS 11/11 / PASS |
| Learning Kernel / M018 registry | PASS 16/16 / PASS |
| content / source-pack / Problem Atlas | PASS: 0 errors, 1 pre-existing warning / 0/0 / 0/0 |
| M015 compatibility | PASS 32/32 |
| production build / performance | PASS; initial JS 1,038,344 bytes; scheduler 0.0040 ms |
| Rust | BLOCKED before compilation: offline cache lacks `urlencoding` |

## Next action

Run a real user foreground trial of Statistical Unit, Confounding, Cox and Case Lab. Stop architecture work here; do not expand curriculum, package or merge to `main` before the trial is accepted.
