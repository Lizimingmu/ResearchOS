# M019 极窄 FINAL3 证据差异复核

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_type: `FINAL3_TWO_ISSUE_DIFF_ONLY`
- baseline_review: `M019_EVIDENCE_REREVIEW_FINAL2.md`
- 输入：当前刷新后的 `artifacts/curriculum-content-snapshot.json`、`artifacts/claim-source-audit.json` 与 `src/data/evidence.ts` 中仅涉及两项问题的记录。
- 排除：没有复核其他 claim、来源或历史问题。

## 结论

| FINAL2 确定问题 | FINAL3 状态 | 当前分类 |
|---|---|---|
| Information Bias claim 来源错配 | `RESOLVED` | `DIRECTLY_SUPPORTED` |
| `src-git-docs` 题名/year/coreEvidence metadata | `RESOLVED` | `PASS` |

- resolved: **2**
- remaining blocker: **0**
- remaining major: **0**
- new problem: **0**

## 1. Information Bias claim

Claim：

> 暴露、结局或协变量的信息获取错误导致误分类或测量误差，方向不一定朝零。

当前只映射到 `src-misclassification-direction`：

- title: `Misconceptions About the Direction of Bias From Nondifferential Misclassification`
- source: *American Journal of Epidemiology*
- year: 2022
- DOI: `10.1093/aje/kwac035`
- PMID: `35231925`
- type: `methods`

[PubMed 原始记录](https://pubmed.ncbi.nlm.nih.gov/35231925/)确认题名、期刊、年份、DOI 与 PMID。其摘要明确讨论流行病学研究中 study variables 的 measurement error / misclassification，并列出七种不能假定 nondifferential misclassification 朝零偏倚的情形。

判定：`RESOLVED / DIRECTLY_SUPPORTED`。该来源直接覆盖 claim 的两个中心部分：信息获取错误形成 measurement error / misclassification，以及偏倚方向不能普遍假定朝零。旧的 selection-bias 错配来源已经移除。

## 2. src-git-docs metadata

当前记录：

- title: `Git - everyday Documentation`
- sourceName: `Git project`
- year: 2014
- sourceType: `official_documentation`
- URL: `https://git-scm.com/docs/everyday`
- coreEvidence: `Official task-oriented examples cover creating repositories, recording changes, inspecting history and differences, and working with branches in everyday Git workflows.`

[Git 官方页面](https://git-scm.com/docs/everyday.html)显示相同页面题名，列出 `diff`、`commit`、`branch`、history/log 等日常工作流，并将该 manual 的最后变化标为 Git 2.0.5、2014-12-17。当前 year `2014` 不再把访问/核验年份误写为出版年份；coreEvidence 也已收窄为页面实际覆盖的任务型示例，没有继续声称该单页逐字定义全部 Git 对象语义。

判定：`RESOLVED / PASS`。FINAL2 指出的 synthetic title、year 2026 和过度 coreEvidence 三项 metadata 问题均已关闭。

相关 claim `claim-guide-v1-m04-t19-guide-summary` 现在可判 evidence-ready：Git 官方页面支持 commit/diff/branch 工作流，`src-good-enough-computing` 补充版本控制与研究计算治理边界。

## deterministic audit 与激活边界

- 当前 claim-source audit：errors `0`，warnings `0`。
- 两条 claim 均为 `identifierVerified: true`、`metadataVerified: true`。
- 两条 claim 仍为 `supportStatus: claim_level_review_pending`。

因此本次只关闭 FINAL2 的两个证据问题；它不自动把任何内容改为 active/verified。两条现为 **evidence-ready candidates**，但当前可激活数量仍为 **0**，须经过独立 claim-level 审批。

## Remaining BLOCKER / MAJOR

- BLOCKER: **无**。
- MAJOR: **无**。
