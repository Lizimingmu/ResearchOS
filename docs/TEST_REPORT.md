# ResearchOS v0.10 test report

*Final Windows release evidence for code, learning invariants, content, performance, persistence, packaging, and honest coverage limits.*

---

## ✅ Automated gates

| Gate | Result | Coverage |
|---|---:|---|
| Lint | PASS | TypeScript project/static correctness gate |
| Typecheck + production build | PASS | React/TypeScript compilation, Rollup chunks, source maps |
| Frontend/integration | 19/19 PASS | content/provenance, scheduler, migrations, AI parsing, exports, review, scoring, Today, response lock, misconceptions, drafts, persistence, server render, PDF/provider paths |
| Rust backend | 7/7 PASS | state round trip, entity CRUD, backup/restore, URL validation, provenance invariant, bounded snapshots, transactional v1→v2 migration |
| Content validation | 18/18 PASS | counts, uniqueness, source links, DOI/PMID, difficulty/tags/variants, fields, self-verification invariant |
| Performance | PASS | initial JS/CSS/content budgets and 2,000-run scheduler benchmark |
| Tauri/NSIS | PASS | release executable and current-user installer |

## 🧠 Learning and integration scenarios

- Answer remains draft until submission; correctness, feedback, evidence, and optional AI critique are gated behind the locked original.
- Calibration is idempotent and produces no duplicate evidence/review/misconception records.
- Wrong + high-confidence creates an explicit misconception and next-day priority.
- Misconception remains open on wrong/partial ratings and resolves only after a correct unfamiliar variant.
- Today schedules five varied project/onboarding-aware tasks without punitive overdue totals.
- Skill evidence is withheld below three observations across two concepts.
- Assessment completion does not add mastery; baseline/rubric state persists.
- JSON/CSV/Markdown exports include the required learning domains.
- v1 state migration preserves user arrays/settings; future schemas are refused.
- AI review parsing rejects invalid JSON/schema and prompt text delimits the learner's untrusted response.

## 💾 Native and persistence smoke

The rebuilt standalone v0.10 release was run with a fresh isolated data directory. The process remained responsive and created WebView data plus SQLite, WAL, and shared-memory files. `PRAGMA integrity_check` returned `ok`, `user_version` was 2, and migration rows 1 and 2 were present. The process was stopped and restarted against the same database; it remained responsive and integrity again returned `ok`.

The same manual-window/data-directory path was retained because a diagnostic Tauri default-window experiment attempted to use sandbox-blocked AppData and failed with Windows `os error 5`. The release path explicitly scopes WebView data below the selected ResearchOS data root and passed the observable smoke checks.

## 📦 Build artifacts

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| `ResearchOS_0.10.0_x64.exe` | 15,644,672 | `73E240C5CEE3FBF1FB9B4CCC4F82F21E65D581DCB2B8CB91545BF3F2F2D56179` |
| `ResearchOS_0.10.0_x64-setup.exe` | 5,396,964 | `513DC2C16D099924307F5D28CD87A3D073F17D1679D354E85A8D67DFEA186EB2` |

Hashes were recomputed after the final native-window implementation was restored and the release/NSIS bundle was rebuilt.

## 🖼️ E2E and visual limitation

The in-app browser's saved permission blocked the localhost preview. Its security rules prohibited switching to another browser surface or CDP workaround. Therefore screenshot-based E2E, DPI/layout review, PDF appearance, and native-dialog clicks are **not** marked as passed. Component/server-render, HTTP/build, native process, and database tests remain valid but do not substitute for visual acceptance.

The automated desktop session also did not expose a top-level HWND even while the native process was responsive and WebView data existed. A human should perform first-launch appearance, keyboard focus, monitor scaling, PDF rendering, file chooser, backup chooser, and installed-shortcut checks in an interactive Windows user session.

## ⚠️ External checks not performed

- No live AI-provider request was made because no external credential was supplied.
- The unsigned NSIS installer was built but not installed into the user's normal profile; the standalone release executable was the artifact used for first-launch/restart smoke.
- No longitudinal educational-effectiveness or psychometric study exists.

## 🧾 Test conclusion

All executable release gates available in the current environment pass. There is no known code-level P0 blocker. The visual/local-browser permission constraint, live-provider behavior, unsigned installer reputation, and human interactive acceptance remain explicit rather than being reported as successes.
