# ResearchOS UX audit — M017

*Background/source-level audit of the guided learning experience. Foreground visual acceptance is not claimed.*

## Audited workflows

| Workflow | Background result | Remaining manual evidence |
|---|---|---|
| Today → one core lesson | PASS | Visual hierarchy and click path |
| Why → intuition → prediction → explanation | PASS | Readability and pacing |
| Worked example → real self-check | PASS | Fading clarity and feedback comprehension |
| Guided hints → independent no-hint case | PASS | Keyboard/focus behavior and perceived difficulty |
| Due unfamiliar review → far transfer | PASS | Multi-day trial and project-transfer usefulness |
| Think Before AI → saved reasoning record | PASS | Entry-point discoverability |
| Paper Lab → beginner Paper Card | PASS | PDF/Paper Card layout at Windows scaling |
| Pause → resume exact lesson step | PASS | Restart from packaged application |

## Cognitive UX

- The lesson surface presents one current step, remaining time and state; the full map is optional.
- Prediction is low pressure and not competence-eligible.
- Self-check requires a response and cannot be passed by clicking Continue.
- Guided hints are progressively revealed and recorded; independent cases show no hints and require confidence plus reasoning.
- Feedback explains correct structure, omissions, overreach, a reasoning chain and a claim boundary.
- Delayed review and far transfer never mechanically reuse the independent prompt.
- Today shows why the item matters and avoids priority numbers, formulas and backend gate language.
- Routine feedback has completed/partial/skipped states without streak punishment.

## Information architecture

Primary navigation is Today, Learn, Practice, Projects, Review, Progress and Library, with Settings as an auxiliary entry. Method Lab, Problem Atlas, AI Audit, Paper Lab, Assessment, Frontier and Content Studio remain intact under Practice rather than competing as first-level workspaces.

Onboarding asks for target level, research types, foundation gaps, daily time and permission to use local project relevance. It does not force a blind baseline.

## Accessibility and visual status

Buttons, labels and semantic form controls remain source-visible and headless rendering is tested. Final focus order, screen-reader announcements, high contrast, Windows text scaling, native PDF rendering and visual density require a real foreground session.

## Conclusion

No known background-code blocker remains in the intended Today → lesson → practice loop. **FOREGROUND UI, USER-MANUAL, INSTALLER and real-Vault checks remain NOT RUN** and must be accepted separately before packaging.
