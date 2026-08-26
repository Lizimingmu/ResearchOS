# ResearchOS Product Constitution

Last updated: 2026-08-26

## 🎯 Product purpose

ResearchOS is a local-first desktop learning and research-reasoning workspace. It helps biomedical researchers practise judgment, connect papers to methods and projects, and detect unsafe analytical claims. It is not a chat wrapper, autonomous scientist, clinical decision system, or substitute for expert review.

## 🧭 Stable principles

1. Human judgment remains the final authority. AI critiques locked work; it does not silently decide, rewrite, or promote generated content to fact.
2. Learning quality outranks feature count. Retrieval, calibration, misconception repair, unfamiliar variants, and transfer to a real project must remain measurable.
3. Chinese-first means natural Chinese explanations plus standard English scientific terms at first use. Paper titles, identifiers, quotations, model names, API fields, and code may remain English.
4. Local-first means core learning and reading remain usable offline. User data is stored locally; secrets stay in the Windows credential store; exports are explicit.
5. Evidence is traceable. Identifier, metadata, and claim verification are distinct states. A resolved DOI/PMID does not prove a scientific claim.
6. Generated scientific content starts as `verification_status = pending`. No agent may self-approve its own scientific claims.
7. Research language must match the design and estimand. Association is not causation; prediction is not explanation; inferred cell communication is not functional signaling.
8. Preserve user work across migrations. Destructive reset, import, or replacement must be explicit and recoverable where practical.
9. Desktop quality matters: no blank screen, bounded startup failure, keyboard accessibility, readable Chinese typography, high-DPI layouts, and light/dark themes.
10. Releases require deterministic QA, a scientific gate when relevant, reproducible artifacts, and SHA256 checksums.
11. ResearchOS is the canonical personal-content store. External knowledge tools such as Obsidian are curated, explicit publishing/review surfaces only: no continuous sync, no automatic event export, no write outside a user-selected dedicated folder, and no silent overwrite of user-authored notes.
12. New knowledge is learned before it is tested by default. Instruction builds intuition before terminology; independent judgment follows guided practice. Experienced users may choose a Challenge fast path, but challenge evidence never falsifies or backfills instructional completion.
13. Learning progress and demonstrated competence are separate facts. Viewing an explanation is not mastery, and absence of an independent attempt is not evidence of zero ability.

## 🤝 Agent operating model

- Codex: product architecture, learning mechanism, scientific rubric, high-risk review, milestone acceptance, release gate.
- OpenCode / DeepSeek V4 Pro: implementation, debugging, tests, build, packaging, performance, migrations, UI and localization.
- DeepSeek V4 Flash: mechanical low-risk transformations, scaffolding, formatting, metadata cleanup and documentation.
- Codex reviews from the approved baseline diff and `.agent` reports. Full-repository scans require an explicit architecture-risk reason.

## 🔒 Change control

The approved review baseline is recorded in `PROJECT_STATE.md`. A milestone may change this constitution only through an explicit product decision. Project history belongs in Git, not in this file.
