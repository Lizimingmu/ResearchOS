# Implementation Handoff — M018 Learning Architecture Refactor

Use a diff-based review from M017 commit `2a598b1fefa5a8bc84277d489fe3eb0f08f15afb`. Do not rescan unrelated history.

## Read first

1. `.agent/PRODUCT_CONSTITUTION.md`
2. `.agent/SCIENTIFIC_GATES.md`
3. `.agent/PROJECT_STATE.md`
4. `.agent/CURRENT_MILESTONE.md`
5. `M018_LEARNING_ARCHITECTURE_HANDOFF.md`

## Implementation boundaries

- Distinct content contracts live in `src/domain/learningArchitecture.ts`; do not collapse them into a mega-schema or `PracticeAssetV1`.
- Guide reading and Concept Learn/Explain are exposure only. Standardized competence comes from defensibly scored Kernel events.
- Transfer Artifacts and Project Studio records are real-context evidence, not mastery.
- Case answers are locked in sequence and retained as a Decision Timeline.
- Schema 7 collections are additive and empty on migration; never infer them from old fields.
- Preserve Content Studio, scientific provenance, SQLite/WAL/recovery, credentials, future-schema refusal and Obsidian explicit-write constraints.

## Next permitted work

Repair a concrete gate failure or perform the user-authorized foreground trial. Do not bulk-generate curriculum, package, merge to `main`, or promote generated scientific content automatically.
