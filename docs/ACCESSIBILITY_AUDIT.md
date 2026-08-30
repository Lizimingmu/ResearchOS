# ResearchOS Accessibility Audit

This deterministic gate covers the production onboarding DOM and global keyboard/motion contracts. Foreground keyboard traversal, zoom, multi-DPI and contrast inspection are recorded separately in the UX audit.

| Status | Check | Evidence |
|---|---|---|
| PASS | Document language | The Chinese-first shell declares zh-CN. |
| PASS | Viewport scaling | The viewport does not disable user zoom. |
| PASS | Visible keyboard focus | The final focus-visible rule overrides component reset rules. |
| PASS | Reduced-motion support | Motion-sensitive users receive the reduced-motion override. |
| PASS | Onboarding dialog semantics | The blocking onboarding surface identifies itself as a modal dialog. |
| PASS | Dialog accessible name | The modal heading is referenced by aria-labelledby. |
| PASS | Onboarding progress semantics | The five-step progress indicator exposes its current value. |
| PASS | Single primary heading | The current onboarding step has one h1. |
| PASS | Named buttons | 5 rendered buttons checked; 0 unnamed. |
| PASS | Choice state announced | 3 selectable choices expose aria-pressed. |
| PASS | ARIA references resolve | 0 unresolved aria-labelledby references. |

Overall: **PASS**.
