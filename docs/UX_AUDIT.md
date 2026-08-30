# ResearchOS UX audit

*Desktop workflow audit for effortful practice, navigation, recovery, accessibility, and honest verification limits.*

---

## 🧑‍🔬 Audited workflows

| Workflow | Result | Evidence |
|---|---|---|
| First launch → orientation → focus → blind baseline | PASS (logic/component) | First-run state, three unfamiliar assessment cases, locked responses, rubric persistence |
| Today → retrieval → confidence → feedback → transfer → review | PASS (integration) | Central idempotent calibration action and response/review/misconception tests |
| Create project → project-relevant scheduling → transfer | PASS (integration) | Project state, scheduler relevance, and export coverage |
| Due review → unfamiliar variant → rating | PASS (integration) | Due-only list and misconception-resolution tests |
| AI audit → approve/question/reject → rationale → calibration | PASS (integration) | Shared response lock and explicit unsafe-step handling |
| Restart → migrate/restore existing state | PASS (native/data) | v1→v2 migration tests plus release process restart on the same SQLite database |
| PDF chooser/render/native dialog | PARTIAL | Mapping and component behavior tested; native interaction was not visually click-tested |

## 🧠 Cognitive UX

- Reference feedback, evidence, and optional AI critique remain hidden until the learner answers and records confidence.
- High-confidence wrong answers become named misconceptions, not generic failed tasks.
- Today presents the highest-value five tasks instead of a punitive overdue counter.
- Reviews use an unfamiliar variant, reducing answer-recognition masquerading as retrieval.
- Assessment uses explicit domain rubrics and does not award mastery for completion.
- Labels distinguish an identifier lookup from claim verification and an AI critique from verified knowledge.

## 🧭 Desktop navigation and search

The activity bar and sidebar retain the IDE-like desktop structure. `Ctrl+K`/`Ctrl+Shift+P` opens the command palette, `Ctrl+F` invokes cross-workspace search, `Ctrl+,` opens Settings, and `Esc` closes transient surfaces. Global search covers papers, notes, methods, patterns, projects, judgment cards, and audit cases without loading the entire training corpus at startup.

Empty/due-only states explain the next useful action. Settings contains low-prominence System Health, persistence status, inventory, migration version, backup controls, and three export formats.

## ♿ Responsive and accessibility review

Source-level review confirmed semantic buttons/inputs, visible labels, keyboard routes, minimum window sizing, light/dark variables, reduced decoration, and responsive rules for constrained widths. Production CSS is 52,516 bytes. Final focus order, screen-reader announcements, Windows text scaling, high-contrast behavior, and PDF canvas semantics still require hands-on target-machine inspection.

## 🖼️ Visual QA status

The required in-app browser was used for the local preview attempt. Its saved security permission explicitly blocked navigation to the localhost preview. The browser-control policy prohibited switching to an alternate browser surface or CDP workaround, so no screenshot was fabricated and no visual pass is claimed.

Native release smoke established a responsive process plus SQLite/WAL/WebView creation and restart, but the automated desktop session did not expose a top-level HWND. Consequently, monitor scaling, PDF appearance, and native dialogs remain **human visual acceptance items**, not hidden passes.

## 🐛 UX findings and disposition

| Priority | Finding | Disposition |
|---|---|---|
| P0 | A wrong high-confidence answer could previously remain an implicit review flag | Fixed with explicit misconception state and variant-only resolution |
| P1 | Calibration paths differed between ordinary practice and AI Audit | Fixed through one centralized idempotent action |
| P1 | First use lacked a research context and baseline | Fixed with onboarding and blind baseline |
| P1 | Draft work could be lost before submit | Fixed with per-task draft autosave and restore |
| P1 | Search was route-limited | Fixed with demand-loaded global search |
| P1 | Persistence and schema health were opaque | Fixed in Settings/System Health |
| P2 | Native visual coverage is incomplete in this environment | Open; requires an interactive Windows session |

## ✅ UX conclusion

No known code-level P0 or P1 workflow blocker remains. The interaction model now consistently protects effort, answer locking, calibration, transfer, and recovery. Visual polish is not certified because the mandated capture surface was blocked; a short human acceptance pass remains required before broad deployment.
