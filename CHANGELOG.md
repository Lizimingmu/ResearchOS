# ResearchOS changelog

*Versioned product, learning-engine, scientific-content, and release changes.*

---

## 🚀 0.10.0 — 2026-08-24

### Added

- First-run orientation, research-focus setup, familiarity capture, and a blind three-case baseline assessment.
- Explicit draft autosave, misconception records, unfamiliar review variants, rubric-scored assessment runs, and bounded SQLite recovery snapshots.
- Evidence-bounded optional AI critique with task-specific prompts and strict JSON parsing after the learner locks an answer.
- Global cross-workspace search, System Health diagnostics, and JSON/CSV/Markdown learning exports.
- Content and performance release gates plus scientific, UX, learning-engine, and improvement-loop audit reports.
- 41 deep method specifications, 54 additional judgment cards, 25 additional AI-audit cases, seven additional research patterns, and 26 verified evidence sources.

### Changed

- Today now schedules five highest-value tasks using weakness, project relevance, review due state, misconception risk, and difficulty-aware variety.
- Skill evidence requires at least three observations across two concepts and reports reliability and last-tested context.
- Initial JavaScript fell from 2,925,687 to 1,852,793 bytes by lazy-loading Paper Lab, global search, and expanded training content.
- State and database schemas moved from v1 to v2 through non-destructive migrations.

### Fixed

- Calibration is idempotent, so one response cannot create duplicate evidence, reviews, or misconceptions.
- High-confidence wrong answers now create explicit misconceptions and remain unresolved until a correct unfamiliar variant.
- Audit responses now obey the same answer-lock and calibration path as other practice surfaces.
- Assessment completion no longer inflates mastery merely because a case was opened or submitted.
- Persistence failures are visible; pre-save snapshots remain bounded to five.

### Release

- Windows standalone executable and current-user NSIS installer rebuilt as v0.10.0.
- v0.9.0 artifacts remain intact for rollback.

## 📦 0.9.0

- First formal Windows desktop release with the local-first ResearchOS workspace, SQLite persistence, Paper Lab, deliberate-practice flows, provenance-bearing seed content, and optional AI review.
