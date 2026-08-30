# M019 内容清单与生命周期盘点

## 冻结快照

- 分支：`codex/overnight-self-rescue-complete`
- 基线：`55730c2`
- 课程审计：`PASS`
- 内容科学数据包：`PASS`
- 生成内容总数：374
- 生命周期：374/374 `pending_review`；active 0；verified 0
- 共同来源：374/374 `ai_generated`
- 前台提示：`待科学审核 · 不进入正式 Today · 不计标准化能力`

## 课程资产

| 类别 | 数量 | 结构 | 当前用途 | 激活状态 |
|---|---:|---|---|---|
| Self-Rescue Guide | 288 | 10 模块；各节 742–958 中文字符，平均 832 | 只读参考候选 | pending_review |
| Concept Lesson | 40 | Why/直觉/精确定义/worked example/Explain + 3 个独立 assessment | 教学候选 | pending_review |
| Method Lesson | 21 | 十维方法契约 + worked walkthrough + 3 个独立 assessment | 方法教学候选 | pending_review |
| Case Lab | 12 | 每案 4–6 个冻结阶段；推理、校准、更新分离 | 分阶段推理候选 | pending_review |
| Studio Template | 13 | Paper、Project、AI audit；只生成 transfer artifact | 迁移模板候选 | pending_review |

Concept 与 Method 共 61 课、183 个 staged assessments。每个 assessment 保持锁答、无提示、候选评分不写能力；当前只有四个高价值原型完成了人工差异复核所要求的深度数据化，不能外推为全库已具标准化测量效度。

## 映射与证据

| 项目 | 数量 | 结果 |
|---|---:|---|
| Curriculum Manifest | 288 | Guide、capability、先修、推荐内容类型和来源要求均有映射 |
| Claim-source records | 361 | 全部保留 `claim_level_review_pending` |
| 仓库 evidence sources | 85 | 内容审计通过 |
| 本课程引用来源 | 78 | missing source ID = 0 |
| 高科学风险 claims | 182 | 仅进入独立审核数据包，不自动批准 |

最终证据差异复核已关闭 Information Bias 错配和 Git metadata 两个确定问题；在前一轮 104 条差异队列中可据此记为 71 条 evidence-ready、33 条仍为部分支持。这个计数是审核优先级，不是激活名单。

## 已冻结的正式学习资产

现有 M018.1 正式架构继续使用 297 个 registry entries、9 个已验证核心资产，并通过精确 Today/Review、能力门禁和最多双线程调度。M019 生成课程没有替换这些正式资产，也没有迁移或推断新的 learner competence。

## 激活边界

本快照允许继续做机器审计、四原型定向 pilot 和逐条人工审批；不允许批量把 Guide、Concept、Method、Case 或 Studio 改为 active/verified。下一步必须是目标学习者试学、盲法内容审查、开放推理双人评分一致性和逐条科学审批。
