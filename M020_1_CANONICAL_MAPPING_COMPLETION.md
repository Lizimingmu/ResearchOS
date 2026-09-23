# M020.1 — Canonical Mapping Completion

Baseline: `4aca045cb5e4e211e1b1c31cf2d60910fa917ea0`  
Branch: `codex/m020.1-canonical-mapping-completion`

## Goal

Close the M020 migration debt without guessing semantic equivalence from titles.

1. Every built-in learning asset must have at least one exact `KnowledgeUnit id + revision + hash` owner.
2. Previously unresolved Guide / Studio / legacy Method assets become self-canonical immutable snapshots when no explicit lesson owner exists.
3. Future knowledge maintenance acts on the KnowledgeUnit first; a bound legacy learning asset is treated as a pedagogical projection and is placed on REVIEW_REQUIRED hold when its canonical owner changes.

## Mapping policy

- Existing explicit Concept/Method/Kernel/Case mappings are preserved.
- Existing explicit `cox-ph → method-cox-v1` maintenance bridge is preserved as a reviewed special case.
- No title similarity, embeddings, module similarity, or AI semantic guess is used.
- An unmatched Guide becomes a `research_pattern` KnowledgeUnit carrying its own exact historical Guide payload.
- An unmatched Studio template becomes a `research_pattern` KnowledgeUnit carrying its own exact template payload.
- An unmatched legacy MethodConcept becomes a `method` KnowledgeUnit carrying its own exact historical method payload and explicit source IDs.
- These snapshots remain `pending_review / REVIEW_REQUIRED`; mapping completion is not scientific verification.

## Authority inversion

This patch does not delete legacy prose. It changes maintenance authority to:

`KnowledgeUnit → exact version binding → legacy learning projection`

A KnowledgeUnit revision produces impact analysis and a maintenance hold on the bound Guide/Lesson/assessment/Studio. The legacy asset therefore cannot remain independently current after its canonical owner changes.

Physical prose deduplication is intentionally avoided: teaching prose and canonical scientific prose have different jobs. Scientific updates must enter through KnowledgeUnit revisions.

## Audit hardening

After this patch, a `KnowledgeLearningBinding` with zero exact KnowledgeUnit bindings is an audit error rather than an accepted warning.

Regression coverage adds:
- zero unresolved built-in bindings;
- exact owners for representative Guide, Studio and legacy Method assets;
- an update to a formerly unresolved Guide owner must hold that Guide.

## Scientific scope

No Guide, Lesson, assessment answer, Case, Protocol scientific claim or activation status is promoted by this patch.

## Independent execution note

This patch was authored through the GitHub connector. The current execution container cannot resolve github.com, so the repository test suite could not be independently rerun here. The branch must be treated as code-reviewed but machine-unverified until Codex/local CI runs typecheck, full tests and the seven knowledge audits.
