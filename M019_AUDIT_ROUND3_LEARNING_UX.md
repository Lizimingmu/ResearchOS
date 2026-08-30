# M019 Audit Round 3 — Beginner Learning Experience Review

## Learner simulation

Perspective: a medical graduate student who has research exposure but little systematic statistics or bioinformatics training. The audit walked the generated Concept, Method, Case and Studio structures in the frozen snapshot and checked onboarding semantics, next-action labels, example specificity, feedback separation, and task load. This is a deterministic structure/content review, not a claim that a real learner found the interface effective.

## Findings and repairs

| Severity | Beginner-facing failure | Repair |
|---|---|---|
| MAJOR | Concept lessons were English-title-first, definition-heavy and reused a generic assessment frame; a learner could answer by label matching rather than judgment. | All 40 concepts now have Chinese-first titles, topic-specific numeric/diagram/table worked examples, 5–7 个选项与 2–4 个正确决定的变式、plausible near misses，以及 separate remediation/review contexts. |
| MAJOR | Method candidates listed dimensions but did not teach a mental model or walk through a worked decision. | All 21 methods now expose a Chinese intuition, concrete worked example and at least three walkthrough steps before Apply. |
| MAJOR | Several Case Labs allowed the learner to restate the same conclusion instead of showing evidence-driven updating. | All 12 cases now preserve `v0 → v1 → v2 → v3` diffs, require a withdrawn judgment and a new discriminating prediction, and use case-specific calibration. |
| MAJOR | The observational-confounding case could encourage adjustment of a treatment-after variable without first fixing the estimand. | Its conflict stage now requires total-versus-direct-effect declaration and explains why post-treatment inflammation is not mechanically adjusted for a total effect. |
| MAJOR | Primary/remediation/review surfaces could test wording memory. | Formal assets use different biomedical contexts and surface features while retaining the same underlying principle; asset IDs cannot be reused. |
| MAJOR | 仅轮换 `case_table` / `evidence_matrix` / `decision_timeline` 标签不能形成不同推理操作。 | 183/183 assessment 现在按 C1–C4、E1–E4、T0–T3 使用各自四行语义 schema；61/61 课的三个角色使用不同格式。 |
| BLOCKER | 开放推理可用复制或通用连接词伪造自动通过。 | 候选界面改为结构预检：每个正确决定须绑定独立材料行，但满足机器条件后也只进入 `review_required` 人工复核，永不自动 complete 或写能力。 |
| MINOR | Onboarding state and selectable controls were less legible to keyboard/assistive tooling. | Added semantic dialog/progress/pressed states and persistent visible focus; automated accessibility smoke passes. |

## Cognitive-load boundary

The expanded advanced Paper and Validation Studio templates contain more scientifically necessary fields. They remain pending preview templates, not mandatory Today work. Activation should be incremental and capability-gated; whether their completion burden feels acceptable requires a real learner trial. The 288 Guide sections are reference content, not a forced linear curriculum.

## What remains subjective

- Whether 742–958 Chinese-character Guide sections feel too long in actual use.
- Whether 5–7 选项的 structured Apply tasks feel discriminating without feeling tedious.
- 其余 57 课/171 个非原型 assessment 是否都有足够真实材料可由第二审查者独立作答；目前只有四个高价值原型完成深度实化。
- 固定中文句法、选项语气和 distractor 是否仍让学习者不读材料即可猜答案。
- Whether staged case updating genuinely changes the learner's reasoning.
- Whether Today workload and Studio forms are manageable.

## Round result

机器可确定的格式语义问题和自动伪通过风险已关闭为安全的 pending 预检；全库 stimulus 充分性与中文 distractor 效度仍是激活门槛。No generated lesson is activated. Real-user learning acceptance、双人开放题评分和逐条内容审批仍是 selective activation 的前置条件。
