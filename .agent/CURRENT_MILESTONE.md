# Current Milestone — M014 Chinese Tutorial and Release Candidate

## Decision

M013 is ACCEPTED. M014 adds a concise Chinese-first onboarding tutorial before final release regression and packaging. M012 Protocol Lab and the 166-card external corpus remain deferred.

## Outcome

A new user can understand ResearchOS's core learning loop in about five minutes without changing real learning history: Today → Problem Atlas → evidence/status boundary → lock-before-feedback → Review.

## Tutorial scope

- Optional first-run launch; visible Skip, Back, Next and Finish controls.
- Restart from Help/Settings at any time.
- Chinese primary copy with restrained English research-term bridges.
- Use existing pending demo content and explicitly explain `待核验`; do not introduce new scientific claims.
- Tutorial interactions run in preview/sandbox state and must not create responses, reviews, misconceptions, scheduler events, source imports or calibration records.
- Keyboard navigation, focus management, responsive desktop layout and reduced-motion behavior.
- Persist skipped/completed state using the existing onboarding/settings mechanism where possible; no schema bump solely for tutorial UI.

## Acceptance

First-run, skip, completion persistence, restart, keyboard flow and zero-learning-state-mutation tests pass. All existing 45 tests and deterministic gates remain green. No Git, packaging or version bump during M014-01.

After Codex accepts M014-01, OpenCode performs M014-02 release regression, versioning, packaging, SHA256 and release notes, then stops for final sign-off.
