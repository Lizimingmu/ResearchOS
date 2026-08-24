# ResearchOS v0.10.1 product specification

*Implemented product contract for a medical-research deliberate-practice, scientific-judgment, and AI-oversight desktop system.*

---

## 🎯 Product thesis

ResearchOS trains research judgment through effortful retrieval, pre-feedback confidence, immutable first attempts, source-bounded feedback, delayed variant review, and transfer into a real project. AI is an optional reviewer or an object to audit; it is not the primary interface and cannot promote its own output to verified knowledge.

The product is local-first and educational. It does not provide clinical recommendations and does not claim validated improvement in scientific competence.

## 🧭 First-run and daily experience

First launch explains the effort-first contract, captures research focus/familiarity, and runs a blind three-case baseline. Subsequent launches open a bounded Today queue of five high-value tasks chosen from foundation, current weakness, project relevance, due retrieval, misconception correction, and occasional frontier material.

Drafts autosave. A learner must answer and record confidence before feedback, sources, transfer prompts, or optional AI critique appear. Wrong high-confidence answers open explicit misconceptions and return as unfamiliar variants. The interface does not display punitive overdue totals, XP, coins, or streak penalties.

## 🧰 Implemented workspaces

1. **Today** — project/onboarding-aware five-task queue with variety and completion state.
2. **Library** — local PDFs, metadata, notes, tags, status filters, and DOI/PMID identifier checks.
3. **Paper Lab** — lazy three-pane PDF, evidence reconstruction, note, and training workspace.
4. **Method Lab** — source-linked why/core/example/error/reviewer/use/boundary/transfer modules with four difficulty levels.
5. **Review** — due-only delayed retrieval, unfamiliar variants, one rating, and correct-only misconception resolution.
6. **AI Audit** — approve/question/reject each analysis step with reasons before calibrated feedback.
7. **Frontier** — cautious, source-linked emerging topics separated from mastery.
8. **Projects** — disease, design, cohort, omics, outcome, stage, bottleneck, methods, and persisted transfer notes.
9. **Skill Map** — evidence bands, reliability, observation count, and last tested; insufficient evidence is withheld.
10. **Blind Assessment** — three unfamiliar cases and locked rubric-scored baseline/longitudinal runs.
11. **Settings / System Health** — theme, scheduler weights, optional provider, database health, content inventory, schema, backup, and learning export.
12. **Global Search / Command Palette** — demand-loaded navigation and search across papers, notes, methods, patterns, projects, cards, and audits.

## 🔒 Safety and data contract

- Original responses are locked before correctness/feedback and remain auditable.
- Calibration side effects are centralized and idempotent.
- Frontend and SQLite v1 data migrate to v2 without destructive rewrite; future schema is refused.
- SQLite writes are atomic and retain five bounded recovery snapshots.
- API keys stay in Windows Credential Manager and are excluded from state/backups/exports.
- AI output requires evidence context, exact parsing, explicit labeling, and cannot become verified content.
- Core use remains offline; provider/evidence lookups are optional actions.

## 📚 Content contract

Release minimums are enforced automatically. v0.10.1 ships 49 evidence sources, 88 method concepts (84 usable), 25 research patterns, 84 judgment cards, and 40 AI-audit cases. Every scheduled training item has difficulty and misconception metadata plus an unfamiliar review variant where required. Source foreign keys, IDs/titles, DOI/PMID uniqueness, verification scope, and AI self-verification are release gates.

## 📤 Export and recovery

JSON, CSV, and Markdown exports include learning history, weak concepts, notes, project transfers, assessment, and skill evidence. SQLite backup preserves canonical application state but intentionally excludes external PDF files and Credential Manager secrets.

## 🚫 Explicit non-goals

No Zotero sync, licensed full-text acquisition, OCR/GROBID, semantic RAG, multi-user sync, autonomous systematic review, automatic evidence promotion, clinical decision support, or psychometrically validated competency certification is included in v0.10.1.

## ✅ Release acceptance

Acceptance requires lint/typecheck, 20 frontend/integration checks, a production-bundle startup smoke without Node/WebView compatibility globals, seven Rust tests, content/performance gates, production/Tauri/NSIS builds, version/hash alignment, release first launch, schema-v2 database creation, integrity check, and same-database restart. Interactive Windows visual acceptance remains separately disclosed when automation cannot observe it.
