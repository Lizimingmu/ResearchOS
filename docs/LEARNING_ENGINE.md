# ResearchOS learning engine

*Operational specification for Today, attempts, misconceptions, review, scoring, and blind assessment in v0.10.1.*

---

## 🎯 Today scheduler

Today ranks eligible tasks with five configurable signals: weakness, project relevance, due review, frontier value, and misconception risk. Selection then enforces a bounded five-task mix: foundation, current weakness, project relevance, due retrieval, and occasional frontier material. It never turns accumulated overdue work into a punitive backlog counter.

Difficulty labels are Foundation, Intermediate, Advanced, and Frontier. Variety rules avoid consecutive advanced-heavy tasks. Project and onboarding context affect relevance without overriding urgent misconceptions.

## 🔒 Attempt contract

1. Present an uncued problem and autosave the learner's draft.
2. Capture confidence before correctness is known.
3. Lock and persist the original response.
4. Reveal source-bounded senior feedback.
5. Record a concrete project transfer where applicable.
6. Schedule delayed review and update evidence exactly once.
7. Optionally request AI critique only after lock; it remains a labeled secondary review.

Opening, drafting, or completing a screen does not equal mastery.

## 🧯 Misconception state machine

A wrong response with high confidence opens an explicit misconception linked to the concept and original response. It receives next-day review priority. Review shows an unfamiliar variant rather than the original wording. Only a correct variant resolution closes it; partial/wrong ratings preserve the open misconception and shorten the next interval.

`recordCalibration` is idempotent, so repeated clicks/renders cannot create duplicate correctness, evidence, review, or misconception records.

## 🗓️ Review state

Reviews store due date, stability, difficulty, lapse count, last-review time, and misconception linkage. Correct retrieval expands stability; partial/wrong retrieval increases difficulty and shortens the interval. The state is FSRS-compatible but the interval heuristic is not presented as the full FSRS reference optimizer.

## 📏 Skill evidence

Scores are withheld below three observations across at least two concepts. Evidence combines correctness, confidence calibration, delayed retrieval, task difficulty, project transfer, and unresolved misconceptions. The UI reports broad bands, reliability, observation count, and last-tested date; rounded values are orientation aids, not validated psychometric traits.

## 🧪 Blind assessment

First-run baseline and later assessment use three unfamiliar cases. The original response is locked, references remain hidden until submission, and six research-judgment domains are scored 0/1/2: framing, design, bias, analysis, interpretation, and transfer. Baseline and later runs can be compared, but assessment completion never creates skill mastery by itself.

## 🧾 Validation boundary

Implementation and state-transition evidence is documented in `LEARNING_ENGINE_VALIDATION.md`. The mechanisms align with retrieval, spacing, interleaving, feedback, transfer, confidence calibration, misconception correction, and blind assessment. That alignment is not proof that ResearchOS improves research competence.
