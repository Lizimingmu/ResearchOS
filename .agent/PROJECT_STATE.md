# Project State

Last updated: 2026-08-24

- Product version: 0.10.2
- State schema: 2
- SQLite user version: 2
- Approved baseline: commit `441ece1` (`feat: ship Simplified Chinese interface v0.10.2`)
- Review command: `git diff 441ece1..HEAD`
- Working features: Today learning queue, Library/PDF import, Paper Lab, Method Lab, Review, AI Audit, Frontier, Projects, Skill Map, Assessment, settings, SQLite/WAL persistence, backup/export, OpenAI-compatible provider settings.
- Latest approved build: `release/ResearchOS_0.10.2_x64.exe` and `release/ResearchOS_0.10.2_x64-setup.exe`
- Approved artifact hashes: portable `D93E87E47C48EDA844D6A1D07E51D4A8DC46EE74403042413EC769AB0FE40302`; setup `67F6228F9D4B9325F006FBB6A379B243ADBE9B2AB52C3EA0B17C79C18C5C0834`.
- Approved validation: frontend 20/20; Rust 7/7; startup smoke pass; content audit 0 errors/1 warning; performance audit pass.
- In-progress state: uncommitted Chinese-first localization/i18n changes exist after `441ece1`; latest combined `npm test` reached 21/21 functional tests but failed localization audit because two navigation audit keys do not match the dictionary keys.
- Blockers: localization audit failure; uncommitted scientific paraphrases need changeset completion and Codex scientific review; no v0.11 release artifact exists. Codex sandbox invocation of OpenCode is blocked by `EPERM: uv_spawn 'git'`; run the handoff command from a normal user terminal or a host that permits OpenCode child processes.
- Current milestone: M011 Chinese-first localization completion under Codex + OpenCode workflow.
- Do not treat dirty-worktree changes or generated reports as approved until `REVIEW_RESULT.md` says `ACCEPT`.
