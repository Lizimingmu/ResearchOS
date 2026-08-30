# M017 Learning Experience Refactor — Handoff

Date: 2026-08-30

Branch: `codex/m016-release`
Status: **background implementation complete; foreground/manual acceptance not run**

## Why the old experience needed replacement

M016 had a sound state kernel but the visible lesson was still an accordion/card surface. Required blocks could be marked read and the UI then wrote a passing self-check without any response. Prototype prompts were not immutable event assets, several roles reused one binding, delayed review could become answer recognition, and far transfer was not auditable. Today exposed scheduler-shaped output, the primary navigation asked beginners to choose among too many workspaces, and Projects/Paper Lab lacked low-friction pre-AI and paper-reading routines.

## New learning loop

One focused lesson now progresses through:

1. Why this matters and local project relevance.
2. An intuitive mental model and medical-research scenario.
3. Low-pressure prediction before expert reveal.
4. Precise Chinese-first explanation with English terminology and mechanism.
5. Worked-example fading.
6. Misconception contrast and the exact point where reasoning diverges.
7. A real, response-locked self-check.
8. A new guided case with tiered hints and recorded hint use.
9. A second new independent case with no hints, confidence and free reasoning.
10. Structured feedback: correct structure, omissions, overreach, reasoning chain and maximal conclusion.
11. A due unfamiliar review asset with different surface features.
12. A third far-transfer asset: unfamiliar paper, AI-analysis critique or the user's selected local project.

Instruction exposure and demonstrated competence remain separate throughout. Self-check only gates guided practice; guided work never creates independent evidence; only successful independent/review/transfer events update the corresponding competence level.

## Practice asset design

`PracticeAssetV1` supports `single_choice`, `multi_select`, `ordering`, `classification`, `claim_boundary`, `short_reasoning`, `evidence_chain`, `error_detection` and `project_transfer`. Each asset has a stable ID, revision, deterministic SHA-256 content hash, role, concept target, difficulty, rubric, standardized feedback and provenance.

The three existing verified units each have seven distinct role assets: prediction, worked, self-check, guided, independent, review and far transfer (21 assets total). Validators reject invalid hashes/provenance, hints on independent/review/transfer, missing role bindings and independent/review or independent/transfer asset reuse. Persisted practice events snapshot the binding/asset identity and locked learner response.

No new curriculum unit was created.

## Product-surface changes

- **Today:** Today's Core, Due Review and Research Routine only; rationale is human-readable and priority/formula/gate terminology is hidden.
- **Learn:** calm single-task `LearningShell`, current step/remaining time/state, previous/next, pause and optional lesson map.
- **Routine:** editable weekly paper/concept/project-reflection and monthly competence-review targets; completed/partially-completed/skipped logs; no streak or game economy.
- **Think Before AI:** six-field reusable note from Today, Projects or learning transfer; saves locally and never calls AI automatically.
- **Paper Lab:** beginner Paper Card alongside the preserved advanced tools.
- **Progress:** eight top-level capabilities, with separate Learning progress and Demonstrated competence displays.
- **Navigation:** Today, Learn, Practice, Projects, Review, Progress and Library are primary; Settings is auxiliary; Method Lab, Problem Atlas, AI Audit, Paper Lab, Assessment, Frontier and Content Studio remain under Practice.
- **Onboarding:** target, research type, foundation gaps, daily time and permission for local project relevance; no forced blind baseline.

## Data model and migration

Frontend state schema advances from 5 to 6 and adds lesson cursors, editable routine settings, routine logs, project reasoning records and Paper Cards. Migration is additive, idempotent and zero-inference: it does not invent lesson progress, routine completion, reasoning, paper notes or competence from legacy data. Earlier collections are preserved and schema 7+ is refused fail-closed.

SQLite `user_version` remains 2. Atomic state writes, WAL, integrity-checked restore and five bounded recovery snapshots are unchanged. Content Studio revisions/hashes, pending lifecycle gates, conflicts/rollback and finite Obsidian workflows remain covered by their compatibility gate.

## Main implementation files

- Domain/state: `src/domain/learningKernel.ts`, `src/domain/types.ts`, `src/state/migrations.ts`, `src/state/store.ts`.
- Learning engine/data: `src/learning/learningKernelEngine.ts`, `src/learning/scheduler.ts`, `src/data/learningUnits.ts`.
- Learning UI: `src/features/learning/LearningView.tsx`, `LearningShell.tsx`, `PracticeActivity.tsx`, `lessonFlow.ts`.
- Daily/project/routine: `src/features/today/TodayView.tsx`, `src/components/ThinkBeforeAi.tsx`, `src/features/projects/ProjectsView.tsx`, `src/features/settings/SettingsView.tsx`.
- Paper/progress/navigation: `src/features/paper-lab/PaperCard.tsx`, `PaperLabView.tsx`, `src/features/skills/SkillMapView.tsx`, `src/features/practice/PracticeHubView.tsx`, `src/app/navigation.ts`, `src/app/App.tsx`.
- QA/docs: `tests-node/suite.mjs`, learning/startup/M015 audit scripts, generated audit artifacts, `.agent/*` milestone/handoff/state reports, and `docs/*` product/learning/UX/architecture/migration documents.

## Background verification

- `npm run lint` — PASS.
- `npm run typecheck` — PASS (also executed by builds).
- `npm test` — PASS, 111/111 frontend/unit/integration tests + localization 11 checks + production startup smoke.
- M017 mechanism tests — PASS: response-less self-check refusal, instruction/guided separation, independent confidence/no-hint rules, role-distinct review/transfer, three transfer modes, prerequisites/two-thread gate, pause/resume, migration/no-loss and public-content privacy.
- `npm run audit:learning-kernel` — PASS 16/16.
- `npm run content:audit` — PASS, 0 errors / 1 pre-existing warning.
- `npm run audit:source-pack` — PASS, 0 errors / 0 warnings.
- `npm run audit:problem-atlas` — PASS, 0 errors / 0 warnings.
- `npm run audit:m015` — PASS 32/32 after making its schema assertion forward-compatible with schema 6.
- `npm run performance:audit` — PASS; initial JavaScript 989,042 bytes, scheduler 0.0058 ms in the final pre-push run.
- Production web build/startup — PASS through `npm test` and standalone startup smoke.
- `git diff --check` — PASS after removing one trailing space; line-ending notices are the repository's Windows checkout behavior.
- Rust offline test — BLOCKED before compilation: local crate index lacks `urlencoding`.
- Rust normal retry — BLOCKED during crates.io index access by Schannel `SEC_E_NO_CREDENTIALS`/timeouts. The retry was stopped after repeated identical transport failures. No Rust source changed.

## Foreground/manual validation still required

No ResearchOS window, browser preview, installer, real Vault or packaged executable was opened. A user trial should verify:

1. Today has one obvious core action and understandable rationale.
2. The full Statistical Unit lesson pacing, prediction and worked-example fading feel natural.
3. Self-check cannot advance without answering and feedback is comprehensible.
4. Guided hints reveal progressively; the independent form is fresh, unlocked and hint-free.
5. Pause/resume and restart return to the intended step.
6. Project transfer selects the intended project and Think Before AI is discoverable.
7. Paper Card, Practice hub and eight-capability Progress layout work at the user's Windows scaling.
8. Keyboard focus, scrolling, dark/light theme and constrained window widths are acceptable.

## Deliberately omitted

- Full curriculum expansion or bulk generated content.
- AI tutor/chat as the main interface.
- AI scoring of free responses or false psychometric precision.
- Gamification, punishment, streaks or overdue guilt.
- Automatic AI calls, autonomous content verification/promotion or automatic publishing.
- Packaging/version bump/release artifact replacement.

## Suggested next milestone

Run a bounded M017 foreground learning trial first. Classify findings into blocking mechanics, comprehension/pacing and polish. Only after that acceptance should the user choose among a small M017 UX correction patch, packaged-app validation, or an M018 curriculum/assessment plan. Do not expand curriculum before the learning loop itself is accepted.

**Stop here and wait for real foreground trial and user acceptance.**
