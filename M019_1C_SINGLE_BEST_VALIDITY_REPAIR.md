# M019.1c Single-Best Assessment Validity Repair

Baseline: `bc708408b67f08d86b95d9b36ebf20aab1037362`
Branch: `gpt/m019.1c-single-best-validity`

## What was repaired

The frozen external strict-blind review found 53 CLEAR disagreements and 21 blind-ambiguous items across 183 assessments. M019.1c repairs only that assessment-validity layer.

- 109 single-best items now use an explicit item-specific key manifest.
- The global `taskContract → semantic answer slot` rule is no longer the current key source.
- Exactly 74 externally flagged items are versioned to v3; unaffected items remain v2.
- The 21 ambiguous items receive minimal prompt / contract / option-focus repairs.
- Existing scientific Guide / Lesson / Case / Protocol prose is not rewritten.

## Version and knowledge safety

The historical M019.1b materializer remains available to reconstruct the exact M020.1 canonical scientific seed. Current v3 assessment revisions append pedagogical learning bindings only.

The canonical KnowledgeUnit/source/claim arrays remain based on the historical v2 curriculum and must remain byte-stable. App state advances from schema 9 to schema 10 so existing M020.1 workspaces can append new pedagogical bindings without rewriting learning events, review logs or assessment history.

## New deterministic gate

`single-best-key-validity-audit` requires:
- 183 assessments;
- 109 item-specific single-best keys;
- exactly 74 v3 externally flagged items;
- exactly 21 targeted ambiguity repairs;
- materialized keys equal the item-specific manifest;
- every single-best task-contract family contains at least two semantic answer slots, preventing regression to a fixed contract-slot mapping.

## External certification boundary

This implementation does **not** claim a new blind-solvability PASS. After Codex machine validation, regenerate and bind a fresh strict-blind packet. A new external reviewer must solve that packet from scratch before reading author keys.
