# M019 最终差异式证据验收（FINAL2）

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_type: `FINAL2_DIFF_ONLY`
- baseline_review: `M019_EVIDENCE_REREVIEW_FINAL.md`
- baseline_snapshot_commit: `35750c3`
- 范围：仅复核上轮 50 条 `SOURCE_MISMATCH / NOT`、54 条 `WEAKLY_SUPPORTED / PARTIAL`，以及其中的 linear regression、Kaplan–Meier/log-rank、restricted cubic spline staged method。
- 排除：没有重扫其余 257 条 claim，也没有复核上轮已经 evidence-ready 的历史条目。

## 验收结论

104 条范围内 claim 的最终处理状态为：

| 状态 | 数量 | 判定 |
|---|---:|---|
| `RESOLVED` | 69 | 证据层面就绪，但仍需 claim-level 审批 |
| `PARTIAL` | 34 | 来源相关但未覆盖整条规则，或存在 metadata 缺口 |
| `NOT` | 1 | 当前仍为实质来源错配 |
| `NEW` | 0 | claim 层无新增问题 |

当前证据分类：

| 分类 | 数量 |
|---|---:|
| `DIRECTLY_SUPPORTED` | 25 |
| `REASONABLE_SYNTHESIS` | 45 |
| `WEAKLY_SUPPORTED` | 33 |
| `SOURCE_MISMATCH` | 1 |
| `UNSUPPORTED` | 0 |
| `NEEDS_CURRENT_SOURCE` | 0 |

逐条 claim、前后 source_ids、分类、处理状态、reason、metadata verdict、严重度和 activation verdict 见 `artifacts/curriculum-evidence-rereview-final2.json`。

## 差异结果

97/104 条 source_ids 发生变化：

| source_ids 状态 | RESOLVED | PARTIAL | NOT | NEW | 合计 |
|---|---:|---:|---:|---:|---:|
| 已变化 | 69 | 27 | 1 | 0 | 97 |
| 未变化 | 0 | 7 | 0 | 0 | 7 |

相对上轮状态：

| 上轮状态 | RESOLVED | PARTIAL | NOT | NEW | 合计 |
|---|---:|---:|---:|---:|---:|
| `NOT` | 37 | 13 | 0 | 0 | 50 |
| `PARTIAL` | 32 | 21 | 1 | 0 | 54 |
| **合计** | **69** | **34** | **1** | **0** | **104** |

`explicitSourceIdsByTitle` 现在优先于 regex fallback，因而 deterministic mapping 不再依赖宽泛关键词碰撞。该机制通过验收，但“精确映射存在”仍不能替代 claim–coreEvidence 对齐。

## staged method 验收

三项相关 staged method 均已关闭：

- `claim-staged-method-linear-regression-method-core`：`src-regression-strategies` + `src-dag`，`RESOLVED / DIRECTLY_SUPPORTED`。
- `claim-staged-method-kaplan-logrank-method-core`：`src-km-tutorial` + `src-logrank` + `src-survival-censoring` + `src-competing`，KM、log-rank、删失和竞争风险边界分别有对应来源，`RESOLVED / DIRECTLY_SUPPORTED`。
- `claim-staged-method-restricted-cubic-spline-method-core`：`src-rcs` + `src-regression-strategies`，移除了不相关 TRIPOD，`RESOLVED / DIRECTLY_SUPPORTED`。

Mantel 原始方法论文的题名、1966 年和 PMID `5910392` 与 [PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/5910392/)一致。Regression Modeling Strategies 的题名、2015 年及 DOI `10.1007/978-3-319-19425-7` 与 [Springer 书目](https://link.springer.com/book/10.1007/978-3-319-19425-7)一致。

## 新增 / 新纳入来源 metadata

13 个本轮新增或新纳入精确映射的来源记录中：

- 12 个 `RESOLVED / PASS`：`src-nist-statistics-handbook`、`src-regression-strategies`、`src-tidy-data`、`src-good-enough-computing`、`src-paper-reading`、`src-better-figures`、`src-paper-structure`、`src-logrank`、`src-proteomics-overview`、`src-proteomics-missing`、`src-ecm-proteomics`、`src-multiomics`。
- 1 个 metadata `NEW / MAJOR`：`src-git-docs`。

NIST 记录的题名、2003 创建时间和 DOI `10.18434/M32189` 与 [NIST/SEMATECH e-Handbook](https://www.itl.nist.gov/div898/handbook/index2.htm)一致。

`src-git-docs` 当前写作 `Git Reference Manual: everyday, commit, branch, and diff`、year `2026`，但 URL 对应页面的官方题名是 [Git - everyday Documentation](https://git-scm.com/docs/everyday.html)，页面列出的最后 manual change 为 2014-12-17。2026 更像访问/核验年份，而不是出版年份。动作：使用官方精确题名并增加 access-date 字段，或把 commit、branch、diff 拆成各自官方页面。该问题使 `claim-guide-v1-m04-t19-guide-summary` 保持 `PARTIAL`，尽管其内容支持已经大幅改善。

生成器对 104/104 条均给出 `identifierVerified: true` 和 `metadataVerified: true`；本独立复核仍发现上述 Git metadata 问题，因此这些 deterministic flags 不能作为 evidence approval。

## 当前 SOURCE_MISMATCH / UNSUPPORTED

### SOURCE_MISMATCH：1

`claim-guide-v1-m02-t23-guide-summary`：

> 暴露、结局或协变量的信息获取错误导致误分类或测量误差，方向不一定朝零。

当前来源为 `src-strobe` + `src-selection-bias`。STROBE 是报告规范；selection-bias 方法论文讨论进入、留存和条件化选择机制，不直接支持暴露/结局/协变量误分类及其偏倚方向。动作：补直接的 misclassification / measurement-error 方法来源，或缩窄主张。

### UNSUPPORTED：0

没有条目完全无来源；问题集中在来源错配或仅部分支持，而不是引用缺失。

## deterministic BLOCKER

1. **B1 — 1 条 claim-level evidence blocker。** `claim-guide-v1-m02-t23-guide-summary` 仍是 `SOURCE_MISMATCH`，不得进入激活审批。
2. **Activation gate — 104/104 仍为 `claim_level_review_pending`。** 这是生命周期阻断，不等同于证据缺陷；即使 69 条 evidence-ready，也不能由本报告自动提升为 active/verified。

## deterministic MAJOR

1. **M1 — 34 条 `PARTIAL`。** 其中 27 条已换成更相关来源，但来源仍没有覆盖完整的规范性、决策性或分类学规则；7 条 source_ids 完全未变。
2. **M2 — `src-git-docs` metadata。** URL 是官方来源，但题名和年份表示不精确；修正前相关 claim 不能判为完全关闭。

34 条 `PARTIAL` 的主要簇：

- 研究价值、停止规则、机会成本、最小充分分析等决策启发式；Strong Inference 支持区分性实验，但不直接提供完整决策规则。
- novelty/importance、major/minor、reviewer response、analysis should/should-not 等论文阅读或评审规则；新增 paper sources 相关，但没有逐条给出这些课程分类。
- staged research question、population/sample、validity、effect size、robustness、evidence redundancy；7 条未发生针对性换源。
- variable encoding、representative features、negative-result action、translation evidence gates、evidence graph 等仍只有部分 coreEvidence 覆盖。

## evidence-ready 与可激活

- **evidence-ready candidate：69。** 来源与主张中心对齐，但全部仍为 `claim_level_review_pending`；完成独立 claim-level 审批后才可能激活。
- **not evidence-ready：35。** 34 条 `PARTIAL` + 1 条 `NOT`，需先修复证据或 metadata。
- **当前可激活：0。** 本验收不授权自动激活、verified 状态提升或进入正式课程。
