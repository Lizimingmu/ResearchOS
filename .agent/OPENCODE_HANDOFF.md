# Implementation Handoff — M018.1 End-to-End Learning Wiring

Use a diff-based review from M018 commit `401c0ed8469d791b0e214f0ed6811b08a5f0a4a3`. Do not rescan unrelated history.

## Read first

1. `.agent/PRODUCT_CONSTITUTION.md`
2. `.agent/SCIENTIFIC_GATES.md`
3. `.agent/PROJECT_STATE.md`
4. `.agent/CURRENT_MILESTONE.md`
5. `M018_1_END_TO_END_WIRING_HANDOFF.md`

## Implementation boundaries

- Distinct Guide, Concept, Method and Case contracts remain in `src/domain/learningArchitecture.ts`; `PracticeAssetV1` is used only for standardized practice.
- `learningContentRegistry` is the canonical metadata source for Today, Learn, Guide links and Progress. Add content there only after providing valid capability/prerequisite mappings, provenance and distinct bound assets where required.
- Learn/Explain and Guide reading are exposure. Only locked, versioned, scored Apply/review events are standardized competence. Transfer Artifacts remain separate real-context evidence.
- `learningContentProgress` migration is empty and zero-inference. Do not reconstruct progress or competence from old prose, Guide history or artifacts.
- Case reasoning, calibration and updates are separate append-only facts. Artifact identity is canonicalized by source and capability/concept context.
- Preserve Content Studio scientific review, local SQLite/WAL/recovery, credentials, future-schema refusal and explicit Obsidian-write constraints.

## Next permitted work

Perform the user-authorized foreground trial and record observed defects. Do not bulk-generate curriculum, redesign the architecture, package, access a real Vault, merge to `main`, or promote generated scientific content automatically.
