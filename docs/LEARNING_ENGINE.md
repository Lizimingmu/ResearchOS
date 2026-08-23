# Learning engine

## Daily scheduler

The default priority score is:

```text
0.35 × weakness + 0.30 × project relevance + 0.20 × frontier value + 0.15 × review due
```

Weights are editable in Settings and persisted. Today produces a bounded five-task queue designed for roughly 30–45
minutes: retrieval, paper evidence reconstruction, method judgment, AI audit, and project transfer. The queue favors a
dangerous misconception when one is due but preserves variety.

## Attempt contract

1. Present the problem without the reference answer.
2. Capture an answer and confidence from 1–4.
3. Lock and persist the original response.
4. Reveal correct points, omissions, severity, rationale, maximal conclusion, and sources.
5. Record transfer into a project where applicable.
6. Create or update a delayed review item.

This contract is shared across methods, judgment cards, reviews, and AI-audit cases. Completion alone is not mastery.

## Review state

Review items retain due date, stability, difficulty, lapse count, last review, and dangerous-misconception status. The
v0.9 algorithm is FSRS-compatible in state shape and behavior, not a claim of parameter equivalence to the full FSRS
reference implementation. Correct answers increase stability; partial or wrong answers increase difficulty and shorten
the interval. Wrong answers at confidence 3–4 are scheduled for the next day and explicitly marked dangerous.

## Skill evidence

The skill map aggregates locked responses, correctness, confidence calibration, delay, and transfer evidence into broad
bands. It withholds a score below two observations, shows low/moderate/substantial evidence rather than false precision,
and down-weights confidently wrong responses. The displayed numeric approximation is rounded to tens.

## Blind assessment

Blind assessment uses an unfamiliar case and eight fixed prompts. It records a locked attempt without awarding an
automatic score. Longitudinal change requires later rubric-based review, preventing mere completion from inflating mastery.
