# Current Milestone — M016 Learning Kernel

Execution status: **S1 RESCUED AND COMPLETE — PAUSED FOR PRODUCT DISCUSSION**.

## 🎯 Objective

Correct the product's “test first, learn later” bias by introducing a state-driven Learning Kernel on top of the accepted `v0.12.0-rc1` baseline.

## 📌 Frozen product decisions

- Learning Unit duration: 8–12 minutes.
- Curriculum: medical-research general skeleton plus project-relevance ranking.
- Learning Mode is default; Challenge Mode is an optional fast path.
- Maximum two active learning threads.
- Chinese pedagogy: intuition first, then definition/English term, mechanism, boundary and reviewer nuance.

## 🧩 Phase-one scope

- LearningUnit/LearnerUnitState/Event/Prerequisite/PracticeAsset contracts.
- State-gated Today scheduler and two-axis Skill Map.
- Statistical Unit → Biological vs Technical Replicate → Pseudoreplication prototypes.
- Five-minute onboarding that actually teaches n/statistical unit.
- Backward-compatible frontend state schema 4→5 migration.

## 🚫 Out of scope

- New Problem Cards, AI Audit, Frontier or unrelated features.
- Bulk rewrite of existing content.
- Packaging, version bump, release artifact changes or Git by OpenCode.
- Foreground automation, real Vault access or production user data.
- Scientific verification/status promotion by the implementing agent.

## ▶️ Execution

S1 domain/schema and schema 4→5 migration were recovered from an interrupted OpenCode worktree, repaired, validated and checkpointed by Codex. S2–S5 remain pending and must not start until the user and Codex agree the next product modification direction and issue a fresh handoff.
