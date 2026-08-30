# Project State

Last updated: 2026-08-31

- Product version remains 0.12.0; M019 is a source/content candidate patch and does not merge to `main`.
- Branch: `codex/overnight-self-rescue-complete`; diff baseline: `55730c2`.
- Approved baseline: commit `55730c23c0d19ff0c25cde20919d2cae7074e8ca`.
- Frontend state schema / SQLite user version remain 8 / 2. No new learner-state migration or inferred competence was added.
- The approved M018.1 architecture remains canonical: 297 registry entries, 9 verified core assets, exact Today/Review legality, capability-gated Paper fields, append-only Project/Case artifacts and at most two active learning threads.
- M019 generated 374 isolated candidates: 288 Guide sections, 40 Concept Lessons, 21 Method Lessons, 12 Case Labs and 13 Studio Templates. Curriculum Manifest has 288 entries and the claim-source map has 361 records.
- Candidate lifecycle is uniformly `ai_generated + pending + pending_review`; active generated = 0 and verified generated = 0. The exact preview banner is `待科学审核 · 不进入正式 Today · 不计标准化能力`.
- Candidate assessment machine logic is fail-closed. It performs structural preflight only, returns at most `review_required`, exposes a display-only `recommendedNextRoute`, and always keeps `createsCompetence=false`.
- Scientific packet references 78 of 85 evidence sources with no missing source ID and routes 248 high-risk claims: 182 Guide, 54 formal Concept/Method and 12 Case.
- Final automated evidence: tests 178/178; localization 11/11; startup smoke; Learning Kernel 16/16; M018 registry 297/9; M015 32/32; curriculum, scientific packet, content, source-pack, Problem Atlas, accessibility and performance audits PASS.
- Foreground UI/high-DPI/screen-reader evidence is unavailable because the in-app browser's saved permission rejects local preview URLs. The denial was respected and not bypassed.
- Final-source Tauri packaging was attempted offline. The web build passes, but Windows native compilation is BLOCKED because MSVC `link.exe` is not installed; no current-source installer or packaged restart exists.
- Next action: four-prototype targeted learning trial, then selective claim/content approval. Do not perform another architecture refactor or bulk-activate the 374 candidates.
