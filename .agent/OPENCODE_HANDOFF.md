# Implementation Handoff — M017 Learning Experience Refactor

M017 background implementation is complete. Do not repeat repository history or expand the curriculum. Use a diff-based review from the current worktree.

## Read first

1. `.agent/PRODUCT_CONSTITUTION.md`
2. `.agent/SCIENTIFIC_GATES.md`
3. `.agent/PROJECT_STATE.md`
4. `.agent/CURRENT_MILESTONE.md`
5. `M017_LEARNING_EXPERIENCE_HANDOFF.md`

Then inspect only files directly implicated by the diff or a reported failure.

## Current implementation

- `PracticeAssetV1` is the auditable prompt/rubric/feedback/provenance unit.
- Every practice event must carry an asset snapshot and a locked response.
- Self-check only gates guided practice; guided work never becomes independent evidence.
- Independent/review/far-transfer are no-hint, confidence-bearing, role-distinct assets.
- Learning is a progressive single-task surface; Today is A/B/C; advanced tools live under Practice.
- Frontend state schema is 6; migration from 5 is additive and zero-inference.

## Do not do

- Do not create more curriculum, promote pending content, rewrite built-in scientific claims, or insert user/project data into source.
- Do not launch foreground UI, installer, real Vault or packaging without fresh user permission.
- Do not weaken Content Studio, provenance, SQLite recovery, future-schema refusal or deterministic hashes.

## Next permitted work

Only background gate repair or a user-directed diff review. Once green, stop for foreground/manual acceptance. Packaging is a later decision.
