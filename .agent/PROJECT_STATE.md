# Project State

Last updated: 2026-08-30

- Product version: 0.12.0 release candidate; M017 is a post-RC source refactor and does not bump or package the product.
- Branch: `codex/m016-release`.
- Approved baseline: commit `e2c10c2` (M016 release implementation); M017 remains an uncommitted diff-based refactor on top of it.
- Frontend state schema / SQLite user version: 6 / 2. Schema 5→6 is additive and zero-inference; native atomic persistence, WAL and five recovery snapshots are unchanged.
- Accepted milestones/checkpoints: M013, M014-01, M015 (`m015-accepted`), and M016 background candidate (`v0.12.0-rc1`).
- Current milestone: M017 Learning Experience Refactor — background implementation complete, foreground/manual acceptance not run.
- Current experience: Today A/B/C plan; focused guided lessons; genuine response-locked self-check; tiered guided practice; no-hint confidence-bearing independent cases; distinct delayed review and three-mode far transfer; editable routines; Think Before AI; beginner Paper Card; eight-capability two-axis Progress; simplified navigation.
- Learning content: exactly three existing verified prototypes. M017 added versioned practice assets and did not expand the curriculum.
- Scientific/provenance state: formal assets are hashed, source-linked and verified; external AI imports remain forced pending and cannot self-promote. Public built-in privacy audit is present.
- Safety state: Content Studio, overlays/conflicts/history/rollback, bounded Obsidian workflows, future-schema refusal, SQLite recovery and credentials isolation remain in scope of the full gates.
- Foreground, installer, real Vault, packaging and user-manual checks: **NOT RUN**.
- Current deterministic evidence: frontend 111/111 + localization 11 + startup smoke; Learning Kernel 16/16; M015 32/32; source-pack and Problem Atlas 0/0; content 0 errors / 1 pre-existing warning; performance PASS at 989,042 initial JS and 0.0058 ms scheduler; handoff validator PASS.
- Rust status: tests did not reach compilation because offline cache lacks `urlencoding` and the normal retry hit repeated Schannel `SEC_E_NO_CREDENTIALS`/timeouts. No Rust source changed.
- Next action: stop for the user's real foreground trial before deciding whether to modify further or package.
