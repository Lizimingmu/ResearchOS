# Current Milestone — M013 Research Problem Atlas

## Decision

M013 is active before M012 implementation. Source-first infrastructure is a prerequisite for safely producing Protocol Lab and other scientific content. M012 specifications remain preserved; its bulk content/engineering tasks are paused, not cancelled.

## Outcome

Create the Research Problem Atlas architecture: structured scientific differential diagnosis, sequential evidence reveal, deterministic problem search, unified Source Registry, claim–evidence mapping, knowledge versioning and transactional source-pack ingestion.

## Scope

- Product/data contracts in `PROBLEM_ATLAS_SPEC.md`.
- Source/claim/import contracts in `SOURCE_INGESTION_SPEC.md`.
- Chinese-first Problem Atlas workspace and eight diagnostic training modes.
- Small pending demo set using existing evidence-backed concepts only.
- Review, misconception, Today, Skill Map, Method/Protocol/Pattern and global-search links.
- Schema migration, source-pack importer, evidence badges and deterministic validators/tests.

## Out of scope

Bulk scientific content generation, automatic web crawling, LLM-selected truth, automatic verified promotion, hundreds of placeholder cards, release/version packaging, or resuming M012 content production before M013 gate acceptance.

## Acceptance sequence

OpenCode M013-01…07 → deterministic QA → Codex diff/scientific review → OpenCode patch → regression → Codex ACCEPT. Only then may M012 resume on the source-first foundation.

## Current patch cycle — M013-10

OpenCode first hardens untrusted-input validation and builds an auditable legacy→v3 staging converter. The schema distinguishes `diagnostic`, `judgment` and `audit`; legacy cards without an explicit reviewed type remain `unclassified`. Structural validity is reported separately from scientific completeness. A staging pack may be structurally valid while `scientific_patch_required` and `importEligible = false`.

M013-10 does not repair scientific content. Codex re-review accepted its staging/conversion result in scope but found two importer-gate defects: oversized CSV fields are still truncated, and the identical-import noop shortcut can bypass scientific completeness.

To close the release quickly, OpenCode performs one bounded final pass covering those two defects plus the already-listed M013-09 engine/UI/demo corrections. The 166 external cards remain `unclassified`, pending and import-ineligible; bulk classification/import is deferred. After the final regression, Codex reviews only the changed demo scientific content and release gates.

After M013 ACCEPT, M014 adds a short Chinese first-run tutorial and packages the release candidate. The tutorial must explain Today, Problem Atlas, evidence-status badges, lock-before-feedback and Review in about five minutes; it must be skippable, restartable from Help, and use only the existing pending demo content.
