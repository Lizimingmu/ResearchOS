# ResearchOS v0.9 product specification

## Product thesis

ResearchOS trains research judgment through effortful retrieval, explicit confidence, immutable first attempts,
evidence-bounded feedback, delayed review, and transfer into a real research context. AI is an optional reviewer or
audited object; it is not the primary learning interface and cannot silently promote its own output to verified content.

## Implemented work areas

1. **Today** generates five prioritized tasks spanning retrieval, paper reconstruction, methods, AI audit, and transfer.
2. **Library** supports manual metadata, local PDF selection, tags/status filters, and DOI or PMID verification.
3. **Paper Lab** provides a three-pane PDF/notes/evidence workspace with page restoration, zoom, fit, and text selection.
4. **Method Lab** exposes usable concepts as why/core/example/error/reviewer attack/use/boundary/transfer modules.
5. **Review** schedules retrievals and includes thirty independent-unit, inference, validation, and calibration cases.
6. **AI Audit** requires the learner to approve, question, or reject each analysis step with a reason before feedback.
7. **Frontier** separates verified seed nodes from pending research directions and records familiarity without implying mastery.
8. **Projects** captures disease, design, cohort, omics, outcome, stage, bottleneck, methods, and linked transfer responses.
9. **Skill Map** reports broad evidence bands and withholds scores when observations are insufficient.
10. **Blind Assessment** hides references until an unfamiliar-case response is locked for later rubric review.
11. **Settings** controls theme, scheduler weights, provider configuration, evidence behavior, database health, and backups.

## Cross-cutting behavior

- Activity bar navigation, collapsible sidebar, command palette, light/dark theme, dense desktop layout.
- Shortcuts: `Ctrl+K` / `Ctrl+Shift+P`, `Ctrl+O`, `Ctrl+F`, `Ctrl+,`, `Esc`, palette arrows, and PDF navigation arrows.
- State restoration after restart through SQLite; browser preview falls back to localStorage for non-native UI development.
- Original answers are stored as submitted response snapshots. Feedback is rendered only after submission.
- A high-confidence wrong answer becomes a dangerous misconception and receives next-day review priority.
- Unconfigured providers do not block seed learning, library use, projects, review, or local storage.

## Seed acceptance counts

The build-time content tests enforce at least forty methods with at least thirty usable, exactly eighteen patterns,
exactly thirty judgment cards, exactly fifteen AI audit cases, seven starter days, resolvable source links, and the
generated-content provenance invariant. The exported JSON under `data/` mirrors the typed runtime content.

## Explicit non-goals for v0.9

Zotero sync, licensed full-text acquisition, OCR/GROBID ingestion, semantic RAG, multi-user sync, automatic systematic
review, automated clinical recommendations, and automatic evidence promotion are not included.
