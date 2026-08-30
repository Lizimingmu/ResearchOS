# Current Milestone — M017 Learning Experience Refactor

Execution status: **BACKGROUND IMPLEMENTATION COMPLETE — FOREGROUND USER VALIDATION NOT RUN**.

## Objective

Turn the M016 Learning Kernel into a guided research apprenticeship experience for medical-research beginners. The primary success signal is an independently demonstrated research step, not card completion.

## Implemented scope

- A focused progressive lesson surface: why → intuition → prediction → precise explanation → worked-example fading → misconception contrast → real self-check → guided practice → independent practice → delayed unfamiliar review → far transfer.
- Versioned `PracticeAssetV1` records with stable IDs, revisions, deterministic hashes, role, interaction, rubric, feedback and provenance.
- Genuine response locking for every practice event. Self-check cannot advance without a response and never creates independent competence.
- Distinct prediction/worked/self-check/guided/independent/review/far-transfer assets for the existing three verified units only.
- Three far-transfer modes: unfamiliar-paper evidence chain, AI-analysis error detection and transfer to a user-selected local project.
- Today reduced to Today's Core, Due Review and Research Routine; scheduling internals are hidden from the normal surface.
- Reusable Think Before AI notes, beginner Paper Cards, editable routine targets and completed/partially-completed/skipped routine logs.
- Eight-capability Progress view with separate learning-progress and demonstrated-competence axes.
- Primary navigation reduced to Today, Learn, Practice, Projects, Review, Progress and Library; advanced tools remain available through Practice.
- Five-step goal/context/gap/time/project-relevance onboarding.
- Additive frontend state schema 5→6 migration with no inferred progress or competence.

## Preserved invariants

Learning Mode remains default; Challenge remains optional; units stay 8–12 minutes; no more than two active learning threads; prerequisites, delayed retrieval, provenance/verification, Content Studio, future-schema refusal, atomic persistence, SQLite/WAL recovery and bounded snapshots remain intact.

## Deliberately not done

- No expansion beyond the three existing verified prototype units.
- No AI free-response scorer or fabricated precision.
- No XP, coins, leaderboard, streak punishment or overdue guilt language.
- No automatic AI call, autonomous content promotion or personal project data in built-in content.
- No version bump, packaging, installer mutation or release artifact replacement.

## Validation boundary

Background lint/typecheck/frontend tests, deterministic audits, content/performance checks and production web build are required for this milestone. Rust tests are attempted and reported honestly; no Rust source changed. Foreground application launch, visual interaction, installer, real Vault and user-manual acceptance require a separate permission-gated session and remain **NOT RUN**.

## Next action

Stop after the M017 handoff and wait for the user to perform or authorize a real foreground trial of Today → Guided Lesson → self-check → guided → independent, plus Projects/Think Before AI and Paper Card.
