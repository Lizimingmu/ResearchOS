# M019 最终差异式证据复审

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_type: `FINAL_DIFF_ONLY`
- baseline_review: `M019_EVIDENCE_REREVIEW.md`
- baseline_snapshot_commit: `35750c3`
- 范围：只复核上轮 `PARTIALLY_RESOLVED`、`NOT_RESOLVED`、`NEW_PROBLEM` 的 145 条 claim，以及这些条目涉及的当前来源映射、`evidenceBoundaryCn` 和新增 verified metadata。
- 排除：没有重新扫描上轮已关闭条目，也没有重做全量 361 条历史审计。

## 最终结论

本轮差异关闭了 41 条证据问题，54 条仅部分关闭，50 条未关闭，未发现新的 scoped claim 问题。也就是说，145 条复核对象中仍有 104 条不能进入激活审批。

更重要的是，145/145 条当前仍是 `supportStatus: claim_level_review_pending`。因此：

- **当前可激活内容：0 条。**
- **证据层面已就绪、但仍需 claim-level 审批的候选：41 条。**
- **仍需证据修复的 pending_review 候选：104 条。**

`evidenceBoundaryCn` 已覆盖 145/145 条，且均标为 `curriculum_synthesis`。这解决了“把课程表述伪装成来源逐字结论”的呈现风险，但不能把不相关来源变成支持证据。只有来源 core evidence 与主张主体已经对齐的条目，边界声明才参与关闭问题。

## 逐类统计

| 最终处理状态 | 数量 | 激活含义 |
|---|---:|---|
| `RESOLVED` | 41 | 证据就绪，但仍是 `claim_level_review_pending` |
| `PARTIAL` | 54 | 仅可保留为待修复候选，不可激活 |
| `NOT` | 50 | 证据阻断，不可激活 |
| `NEW` | 0 | 本次差异范围内无新 claim 问题 |

| 最终证据分类 | 数量 |
|---|---:|
| `DIRECTLY_SUPPORTED` | 14 |
| `REASONABLE_SYNTHESIS` | 28 |
| `WEAKLY_SUPPORTED` | 53 |
| `UNSUPPORTED` | 0 |
| `SOURCE_MISMATCH` | 50 |
| `NEEDS_CURRENT_SOURCE` | 0 |

逐条的前一状态、当前分类、source_id 前后变化、边界 verdict、metadata verdict、严重度和 activation verdict 均在 `artifacts/curriculum-evidence-rereview-final.json`。

## 状态迁移

| 上轮状态 | RESOLVED | PARTIAL | NOT | NEW | 合计 |
|---|---:|---:|---:|---:|---:|
| `PARTIALLY_RESOLVED` | 29 | 16 | 0 | 0 | 45 |
| `NOT_RESOLVED` | 11 | 29 | 50 | 0 | 90 |
| `NEW_PROBLEM` | 1 | 9 | 0 | 0 | 10 |
| **合计** | **41** | **54** | **50** | **0** | **145** |

## source regex / mapping 复核

57 条 claim 的 source_ids 在本轮发生变化，其中 36 条关闭、17 条部分关闭、4 条仍未关闭。

已确认关闭的映射机制：

- AI 规则从宽泛的 `/AI/` 收紧为带词边界的 AI 或明确中文词项，移除了上轮 9 条非 AI 教学主张误挂的 `src-nist-genai-profile` / `src-nist-ai-rmf`。这 9 条的新增 GenAI 错配已经消失；但它们剩余的报告规范或课程叙事来源仍仅部分支持，所以整体状态是 `PARTIAL`，不是自动 `RESOLVED`。
- 命中特定规则后不再附加 module default sources，关闭了 C-index、RCS、leakage、ORA、样本量等条目中由默认来源造成的污染。
- 新增的 strong inference、selection bias、standard error、confidence interval、interaction、time origin、C-index 等定向来源，能够承担相应方法核心或合理综合。

仍未关闭的映射机制：

- `claim-guide-v1-m03-t38-guide-summary` 与 `claim-staged-method-kaplan-logrank-method-core`：KM 和 censoring 来源不直接定义 log-rank 的观察/期望事件比较；需补直接 log-rank 方法来源。
- `claim-guide-v1-m04-t19-guide-summary`：`src-fair` 不定义 commit、branch、diff 的 Git 语义；需 Git 官方文档或权威版本控制来源。
- `claim-guide-v1-m05-t04-guide-summary`：`src-prisma-2020` 不支持证据/总体/测量/机制/决策缺口分类。
- `claim-guide-v1-m06-t58-guide-summary`：batch/scIB 来源不支持一般性的证据图规则。
- `claim-guide-v1-m03-t16-guide-summary`：`src-power` 支持前瞻性功效与反对 post-hoc power，但不支持完整的 estimand、信息量、变异、事件率、模型复杂度和失访样本量规则。
- 通用 `paper/literature -> PRISMA` 与 `Git -> FAIR` 仍过宽；应改为更窄 regex 或显式 topic `sourceIds`。

## evidenceBoundaryCn 判定

边界声明有三种不同结果：

1. 对 5 个 staged case，专门声明“场景及数值为虚构课程材料，来源只支持方法与解释边界”，实质关闭了此前的真实队列结果归因风险；这 5 条为 `RESOLVED`。
2. 对已经换成直接方法来源的条目，边界声明正确限制了课程转述范围，因此可判 `DIRECTLY_SUPPORTED` 或 `REASONABLE_SYNTHESIS`。
3. 对仍挂着 STROBE/DAG/FAIR/PRISMA 等泛化或不相关来源的条目，通用边界只能降低误读风险，不能关闭来源错配；这些条目保持 `PARTIAL` 或 `NOT`。

## verified metadata

- `src-tripod-ai` 的上轮元数据问题已关闭：精确题名、2024 年、`guideline`、DOI `10.1136/bmj-2023-078378`、PMID `38626948` 均已提供。
- 本轮涉及的新增 strong inference、selection bias、SE、CI、power、correlation/regression、interaction、KM 与 censoring 来源均有 verified 题名、年份、类型、稳定标识和 core evidence。
- `src-power` 有 DOI 和出版者 URL；没有 PMID 不构成缺陷。
- 当前 145 条的 `identifierVerified` 与 `metadataVerified` 均为真。该结果只证明元数据完整，不证明 claim-source 直接支持。

## BLOCKER

1. **50 条 `NOT` claim 仍为 `SOURCE_MISMATCH`。** 其中 46 条 source_ids 未发生针对性修复；另 4 条虽已换源，仍分别缺 log-rank、Git、缺口分类与 evidence-graph 的直接支持。动作：换成直接来源、缩窄主张，或删除无法支持的子句。
2. **145 条全部仍是 `claim_level_review_pending`。** 即使 41 条证据已就绪，也不能由本报告自动变为 active/verified。动作：只能在独立 claim-level 审批后改变状态。

## MAJOR

1. **54 条 `PARTIAL` 仍只有部分支持。** 其中 37 条 source_ids 未变，只新增了边界声明；17 条虽换成更相关来源，但来源 core evidence 仍未覆盖整条规则。动作：补直接来源或拆成“有来源的事实 + 明确课程规则”。
2. **映射规则仍有语义过宽点。** Git、paper/literature、log-rank、sample-size reasoning 不能继续只靠当前正则自动挂源。动作：对高风险主题优先使用显式 `sourceIds`，并在审核中检查 core evidence，而不只检查 ID 存在。

## 激活判定

- `RESOLVED` 41 条：标记为 **evidence-ready candidate**；完成 claim-level 审批前仍不可激活。
- `PARTIAL` 54 条：标记为 **pending_review candidate / evidence repair required**；不可激活。
- `NOT` 50 条：标记为 **activation blocker**；不可激活。
- 本终审不授权任何自动激活、verified 状态提升或进入正式课程。
