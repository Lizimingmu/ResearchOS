# ResearchOS learning engine

*Operational contract for the M017 guided research apprenticeship loop.*

## Learning loop

The default path is Learning Mode. One 8–12 minute unit progresses through why, intuition, prediction, precise explanation, worked-example fading, misconception contrast, real self-check, guided practice and independent practice. Review and far transfer appear only when their due gates are satisfied. Challenge Mode is an explicit fast path and never fabricates instruction exposure.

Opening a step or completing instruction is not competence. The engine stores two independent projections:

- learning progress: exposure to required instruction;
- demonstrated competence: guided-only, independent-once, retained or transferred evidence.

At most two unpaused learning threads may be active. Required prerequisite edges can be satisfied by complete instruction exposure or at least one independent demonstration; project relevance can rank eligible work but cannot bypass a gate.

## Practice asset and event contract

`PracticeAssetV1` has a stable ID, revision, deterministic content hash, role, concept target, difficulty, interaction, rubric, standardized feedback and provenance. Supported interactions are single choice, multi-select, ordering, classification, claim boundary, short reasoning, evidence chain, error detection and project transfer.

Every practice transition requires both a versioned asset reference and a locked response. Self-check cannot record a pass from navigation alone and is never competence-eligible. Guided practice may reveal tiered hints and records which were used. Independent, review and far-transfer bindings contain no hints, require confidence and use distinct assets. Free reasoning is required where configured but is not assigned a fabricated AI precision score.

Feedback always distinguishes what was correct, what was missed, overreach, a reference reasoning chain and the maximal acceptable conclusion.

## Review and transfer

An independent pass schedules a distinct unfamiliar review asset. A due review pass records retention and schedules far transfer. Far transfer uses a third asset and may be an unfamiliar-paper evidence chain, an AI-analysis critique, or a transfer bound to a user-selected local project. Only a successful far-transfer event advances competence to `transferred`.

## Today and routines

Today first determines legal state transitions, then selects at most one visible core learning item and one genuinely due review. A lightweight routine action is presented separately. Priority values and gate terminology are internal details.

Routine targets default to two papers, one concept and one project reflection per week, plus one competence review per month. They are editable and logs accept completed, partially completed and skipped. No streak, XP or punitive backlog is computed.

## Validation boundary

Pure transition tests cover response locking, confidence, hint exclusion, instruction/competence separation, prerequisite/two-thread gates, due timing and migration. Deterministic content audit closes unit/binding/asset/source references and rejects role reuse. These tests establish implementation invariants, not validated improvement in research competence.
