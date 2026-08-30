# ResearchOS Performance Audit

*Production-build performance gate for startup payload, feature isolation, and scheduler latency.*

---

## 📦 Bundle outcome

The initial JavaScript is 1,111,670 bytes (244,832 bytes gzip), down 62.0% from the audited v0.9 baseline of 2,925,687 bytes. Paper Lab and PDF.js remain lazy feature payloads rather than startup work.

| Status | Metric | Observed | Budget |
|---|---|---:|---:|
| PASS | Initial JavaScript | 1,111,670 bytes | < 1,900,000 bytes |
| PASS | Initial CSS | 75,214 bytes | < 85,000 bytes |
| PASS | Content inventory chunk | 81,995 bytes | < 150,000 bytes |
| PASS | Scheduler mean | 0.0097 ms | < 2 ms |

## 🧩 Lazy boundaries

| Chunk | Bytes | Why isolated |
|---|---:|---|
| Paper Lab | 866,653 | PDF renderer loads only when the user opens Paper Lab. |
| PDF worker | 1,232,303 | Worker remains separate from the UI thread. |
| Content inventory chunk | 81,995 | Versioned content inventory loads through the personal-content route, not onboarding startup. |
| CSS | 75,214 | One theme-aware stylesheet with responsive rules. |

## ⚙️ Runtime checks

- Today scheduling averaged 0.0097 ms over 2,000 deterministic runs.
- Zustand selectors avoid subscribing Today to transient UI state; global search and command-palette content are demand-loaded.
- Source maps are emitted for debugging but are not referenced as startup assets.
- SQLite writes use WAL, a five-second busy timeout, atomic transactions, and five bounded pre-save recovery snapshots.

## ⚠️ Measurement limits

Interactive paint timing and multi-DPI screenshots could not be captured because the in-app browser's saved permission blocks local preview URLs. Static payload budgets, server-rendered component tests, native compilation, and process-level smoke checks remain valid; the visual limitation is recorded in the UX audit rather than marked as a pass.
