# Problem Atlas Audit

*M013 deterministic search, diagnostic engine, eight training modes and state-transition gate.*

**Result: PASSED** — 0 error(s), 0 warning(s).

## Checks

| Status | Check | Detail |
|---|---|---|
| PASS | demo atlas seeds through the import pipeline | 4 cards / 9 sources |
| PASS | seed import records the demo pack | problem-atlas-demo-v1 |
| PASS | cards are Chinese-first with valid cross-links | 4 cards checked |
| PASS | search: Chinese exact alias | pa-pseudorep@2.6, pa-bio-tech-rep@0.6 |
| PASS | search: English title match | pa-pseudorep@2.6 |
| PASS | search: abbreviation/alias expansion | pa-pseudorep, pa-data-leakage, pa-bio-tech-rep |
| PASS | search: keyword match | pa-data-leakage |
| PASS | search: deterministic fuzzy fallback | pa-pseudorep@0.682 |
| PASS | search: deterministic ordering | stable across repeated calls |
| PASS | search: no match returns empty | 0 hits |
| PASS | search: unmatched query offers suggestions | PROBAST |
| PASS | search: filters apply | 2 filtered hits |
| PASS | eight modes covered per card | 32 training cases |
| PASS | engine: correct quick diagnosis scores 1 | score=1 |
| PASS | engine: judgments lock once | 该判断已经锁定，不能重复提交。 |
| PASS | engine: sequential baseline ranking locked first | baseline locked |
| PASS | engine: sequential history preserves baseline and every update | 7 steps |
| PASS | engine: sequential completes with ranking score | score=1 |
| PASS | engine: inverted ranking scores lower | correct=1; inverted=0.8 |
| PASS | engine: strict path baseline accepted | ok |
| PASS | engine: fake path node rejected | 未知路径节点（not-a-real-node）：只能按顺序揭示路径中的真实节点。 |
| PASS | engine: out-of-order path node rejected | 只能揭示下一条尚未揭示的路径节点（pa-pseudorep-n1），不能乱序或重复。 |
| PASS | engine: fabricated evidence rejected | 证据 fabricated-evidence 不属于节点 pa-pseudorep-n1 的可用证据，禁止编造。 |
| PASS | engine: first path node reveal accepted | ok |
| PASS | engine: mismatched reveal/ranking node rejected | 排序节点（pa-pseudorep-n2）与刚揭示的节点（pa-pseudorep-n1）不一致。 |
| PASS | engine: matching ranking accepted | ok |
| PASS | engine: repeated path node rejected | 节点 pa-pseudorep-n1 的证据已经揭示，不能重复。 |
| PASS | engine: completion requires every path node ranked | completed=false |
| PASS | engine: cross-mode submission rejected | 该步骤的 mode（differential）与会话 mode（quick）不一致，拒绝提交。 |
| PASS | engine: illegal step kind for mode rejected | mode quick 不允许 kind boundary。 |
| PASS | engine: reveal before baseline rejected | 序贯排查必须先锁定基线原因排序，再揭示证据。 |
| PASS | engine: consecutive reveals rejected | 每步只能揭示一条尚未揭示的路径节点证据。 |
| PASS | engine: partial AI verdicts score incomplete | completed=false; score=0 |
| PASS | engine: unknown AI verdict IDs rejected | completed=false; score=0 |
| PASS | engine: duplicate layer ranks rejected | 错误定位必须为五个层级各分配一个唯一排名（1–5）。 |
| PASS | engine: incomplete layer rank list rejected | 错误定位必须为五个层级各分配一个唯一排名（1–5）。 |
| PASS | engine: missing-info expected checks score full | score=1 |
| PASS | demo pack imports cleanly into empty registry | inserts=103; conflicts=0 |
| PASS | demo pack applies transactionally | 4 cards |
| PASS | re-import is idempotent | noop=true |
| PASS | broken pack rolls back without mutation | threw; state unchanged |

## Counts

| Entity | Count |
|---|---:|
| cards | 4 |
| trainingCases | 32 |
| paths | 4 |
| causes | 15 |

## Rules enforced

- Search: Chinese/English/abbreviation/alias/keyword matching with deterministic fuzzy fallback; no LLM fallback on no match.
- Engine: step mode must match the session; allowed step kinds and legal orders per mode; sequential locks a baseline cause ranking before the first reveal and an updated ranking after every reveal (evidence-before/evidence-after history preserved); AI-verdict grading requires exactly every expected statement ID and rejects unknown IDs; error-localization requires five unique ranks; judgments lock once.
- All demo ProblemCards, paths and rubrics remain pending; registry sources stay metadata_verified.
- Import is transactional with rollback on any invalid row; idempotent per pack ID + hash.
