# ResearchOS v0.12.0 product specification

*Implemented contract for a local-first guided research apprenticeship system for medical-research beginners.*

## Product thesis

ResearchOS helps a learner move from phenomenon to research question, hypothesis, study design, analysis, interpretation, critique and next question. Its primary evidence is how many research-cognition steps the learner can perform independently, not how many cards were opened or read.

The product is educational, not clinical decision support, and makes no claim of validated improvement in competence or patient outcomes.

## First-run and daily experience

Onboarding captures target level, research context, unsystematic foundations, available daily time and whether local project state may affect relevance. It then routes the learner to Learning Mode; Challenge is optional. No forced blind baseline or feature tour is the default.

Today presents at most three categories: one Today's Core lesson, genuinely Due Review and one Research Routine/project action. It explains why the core matters without exposing scheduling formulas. A learner enters a focused guided lesson, predicts before reveal, completes a real self-check, works through tiered guidance and then attempts a new no-hint independent case with confidence and reasoning.

## Primary workspaces

1. **Today** — the bounded daily training plan.
2. **Learn** — progressive guided lessons and optional Challenge path.
3. **Practice** — secondary hub for Method Lab, Problem Atlas, AI Audit, Paper Lab, Assessment, Frontier and Content Studio.
4. **Projects** — real local project context, Think Before AI notes and linked transfer evidence.
5. **Review** — due unfamiliar retrieval and misconception repair.
6. **Progress** — eight research capabilities with separate learning and demonstrated-competence axes.
7. **Library** — local PDFs, metadata, notes and verification state.

Settings is an auxiliary entry and includes editable routine targets, learning controls, provider configuration, data/recovery and system health.

## Learning contract

- Learning Mode default; Challenge optional.
- Units are 8–12 minutes and no more than two unpaused learning threads are active.
- Sequence: why → intuition → prediction → precise explanation → worked-example fading → misconception contrast → real self-check → guided → independent → delayed unfamiliar review → far transfer.
- Instruction exposure never equals demonstrated competence.
- Self-check and guided work cannot create independent evidence.
- Independent/review/transfer use versioned, role-distinct assets; no hints; confidence is required.
- Feedback explains correct structure, omissions, overreach, reasoning chain and maximal conclusion.
- Formal curriculum requires verified content and valid provenance.

M017 intentionally retains only the three verified prototypes: Statistical Unit, Biological vs Technical Replicates and Pseudoreplication.

## Research routines and AI

Think Before AI stores six fields: question, known facts, largest unknown, proposed next step, reason and uncertainty. It never invokes AI automatically and may be saved as a local project reasoning record. Optional post-AI reflection fields are available in the record model.

Routine targets default to two original papers, one concept and one project reflection per week, plus one competence review per month. They are editable and logs accept completed, partially completed or skipped. There is no XP, coin, leaderboard or punitive streak.

Paper Lab retains advanced analysis and adds a beginner Paper Card for research question, importance, study design, figure evidence jobs, main claim, weakest evidence, alternative explanation and transferable lesson.

## Data, safety and provenance

- Frontend state schema 6 migrates additively from 5 without inferring progress, routine completion, reasoning or competence.
- Future schemas are rejected rather than downgraded; existing arrays and records remain preserved.
- SQLite writes remain atomic under WAL with five bounded recovery snapshots and integrity-checked backup restore.
- Content Studio overlays, revisions, hashes, dependency closure, conflicts and finite Obsidian workflows remain intact.
- API credentials remain in Windows Credential Manager and outside state, backups and exports.
- Optional AI output is pending and cannot promote itself to verified content.
- Public built-in content contains no personal project, patient identifier, private chat or local machine path.

## Explicit non-goals

No curriculum expansion, autonomous tutor chat, AI free-response grading, psychometric certification, automatic evidence promotion, cloud sync, clinical advice, gamified economy, punitive streak or autonomous content publishing is part of M017.

## Acceptance status

Background lint, typecheck, frontend tests, deterministic audits, content/performance checks and production web build are release gates. Foreground application, packaged restart, installer, real Vault and user-manual trial remain separate, explicitly reported checks.
