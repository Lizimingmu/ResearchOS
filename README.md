# ResearchOS v0.9

ResearchOS is a local-first Windows desktop workspace for deliberate practice in biomedical research judgment,
methods, evidence calibration, paper reconstruction, project transfer, and human oversight of AI analysis plans.
It is an educational research tool, not a clinical decision-support system.

## Delivered scope

- Tauri 2 / React 19 / TypeScript desktop application with a Rust and SQLite backend.
- Eleven IDE-style work areas: Today, Library, Paper Lab, Method Lab, Review, AI Audit, Frontier,
  Projects, Skill Map, Blind Assessment, and Settings.
- Human-first attempt flow: confidence is recorded and the answer is locked before feedback appears.
- Evidence provenance on instructional content, including source IDs, DOI/PMID/URL metadata, origin, and verification state.
- Offline core workflow with optional OpenAI-compatible provider calls and PubMed/Crossref verification.
- Windows Credential Manager storage for API keys; keys are excluded from state exports.
- 7-day starter track, 40+ method concepts, 18 research patterns, 30 judgment cards, and 15 AI-audit cases.
- SQLite backup/import, dark/light themes, keyboard command palette, and an NSIS current-user installer.

## Install

Run `release/ResearchOS_0.9.0_x64-setup.exe`. The installer is currently unsigned, so Windows may display a
publisher warning. User state is stored in the standard ResearchOS application-data directory. Set
`RESEARCHOS_DATA_DIR` only when an explicit alternate data directory is needed for development or testing.

## Develop and verify

Prerequisites are Node.js 20+, Rust stable, Microsoft C++ build tools, WebView2, and NSIS prerequisites used by Tauri.

```powershell
npm install
npm test
npm run seed:export
npm run tauri:dev
npm run tauri:build
```

The frontend build intentionally uses Rollup directly after TypeScript compilation so it remains usable in restricted
Windows environments where Vite's esbuild child process is blocked.

## Documentation

- `docs/PRODUCT_SPEC.md` — implemented product behavior and acceptance mapping
- `docs/ARCHITECTURE.md` — components, storage, commands, and security boundaries
- `docs/LEARNING_ENGINE.md` — scheduler, review model, and skill evidence
- `docs/CONTENT_PROVENANCE.md` — source tiers, labels, and verification policy
- `docs/TEST_REPORT.md` — automated, native, persistence, and packaging evidence
- `docs/FINAL_HANDOFF.md` — artifacts, operation, limitations, and next steps

The controlling project specification is `ResearchOS_v0.9_Codex_Master_Prompt.md`.
