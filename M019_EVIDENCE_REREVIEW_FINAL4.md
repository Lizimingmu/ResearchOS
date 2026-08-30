# M019 极窄 FINAL4 证据差异复核

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_type: `FINAL4_GSVA_SSGSEA_DIFF_ONLY`
- baseline_review: `M019_EVIDENCE_REREVIEW_FINAL3.md`
- 范围：仅验证当前稳定快照中 `GSVA and ssGSEA` 的来源映射与 GSEA/CAMERA 串扰是否关闭；继承 FINAL3 已关闭的 Information Bias 与 Git 两项；机械核对前一 104 条差异队列的当前 pending 状态与保守计数。
- 排除：没有重扫其余历史 claim，没有把 deterministic metadata flag 当作 claim-level evidence approval，也没有修改或激活产品内容。

## 稳定输入绑定

- snapshot_byte_sha256: `c94358e6b35335a0a70c84d81c5e7fb9798467d687c1ac4fc4a84811ae86d4d2`
- claims_sha256: `ebaa525d5855963a975767d98fb433e12dcc46e30d36fe36fcfbb12e3ff0554d`
- source_registry_sha256: `4b2206782876550e22a57c2305a77a15d0dd03f0af75e0230936f36c0bda4c0f`

对 `artifacts/curriculum-content-snapshot.json` 重新计算的 byte SHA-256 与上列值一致；当前 `artifacts/curriculum-scientific-audit.json` 的 binding 同时给出相同 claims 与 source-registry hash，deterministic audit 状态为 `PASS`。因此本报告判断绑定于该稳定输入，而不是未固定的生成中间态。

## FINAL4 差异结论

| 检查项 | 当前状态 | 证据分类 |
|---|---|---|
| `GSVA and ssGSEA` 只映射 `src-gsva` / `src-ssgsea` | `RESOLVED` | `REASONABLE_SYNTHESIS` |
| GSEA/CAMERA 来源串扰 | `RESOLVED` | `CLOSED` |
| FINAL3 Information Bias 问题 | `RESOLVED`（继承并核对当前记录） | `DIRECTLY_SUPPORTED` |
| FINAL3 Git metadata 问题 | `RESOLVED`（继承并核对当前记录） | `PASS` |

- FINAL4 新增 evidence blocker: **0**
- FINAL4 新增 major: **0**
- new issue: **0**

## 1. GSVA / ssGSEA 映射

当前 guide `guide-v1-m06-t21`（titleEn: `GSVA and ssGSEA`）的 `evidenceSourceIds` 精确为：

1. `src-gsva`
2. `src-ssgsea`

对应 claim `claim-guide-v1-m06-t21-guide-summary` 的 `sourceIds` 也精确为同一组；其中不存在 `src-gsea` 或 `src-camera`。当前 claim 为：

> 产生样本级相对基因集分数以描述表达模式；分数不是通路活性或因果机制的直接测量。

来源边界如下：

- `src-gsva` 是 2013 年 GSVA 方法论文（DOI `10.1186/1471-2105-14-7`；PMID `23323831`），直接支持 unsupervised、sample-wise gene-set enrichment scores 及其表达数据适用语境。
- `src-ssgsea` 是 2009 年引入 single-sample GSEA 的原始研究（DOI `10.1038/nature08460`；PMID `19847166`），支持 within-sample rank-based enrichment score；当前 coreEvidence 还明确限定其尺度与 normalization 依赖实现，不能默认与 GSVA 互换。

生成映射中，exact-title 条目 `"GSVA and ssGSEA"` 先于 regex fallback 返回且只给出上述两个 source ID；fallback 也分别使用 `\bGSEA\b`、`\bGSVA\b`、`\bssGSEA\b`，CAMERA 另有独立 pattern。结合冻结输出中的 guide/claim source arrays，可确定旧的 GSEA/CAMERA 混入已经关闭。

证据判定为 `RESOLVED / REASONABLE_SYNTHESIS`：两篇来源直接支持样本级基因集分数的中心方法事实；“不是通路活性或因果机制的直接测量”是与这些测量边界相称的谨慎课程综合，而不是声称论文逐字提出整段教学规则。该 claim 的 `supportMode` 仍为 `curriculum_synthesis`，`supportStatus` 仍为 `claim_level_review_pending`，所以它只是 evidence-ready candidate，**没有被激活**。

## 2. FINAL3 两项继承状态

### Information Bias

当前 `claim-guide-v1-m02-t23-guide-summary` 仍只映射 `src-misclassification-direction`。该来源仍保留 PMID `35231925`、DOI `10.1093/aje/kwac035`、2022 年与对应 misclassification coreEvidence；旧 selection-bias 错配没有重新出现。

状态保持 `RESOLVED / DIRECTLY_SUPPORTED`，但 claim 仍为 `claim_level_review_pending`。

### Git

当前 `src-git-docs` 仍为官方题名 `Git - everyday Documentation`、year `2014`、类型 `official_documentation`，coreEvidence 仍收窄到页面实际覆盖的 repository、recording changes、history/diff 与 branch 日常工作流。相关 claim `claim-guide-v1-m04-t19-guide-summary` 仍映射 `src-git-docs` 与 `src-good-enough-computing`。

状态保持 `RESOLVED / PASS`，但 claim 仍为 `claim_level_review_pending`。

## 前一 104 条差异队列：当前保守汇总

本节不重新评价 104 条的全部证据内容，只做继承与当前状态核对。FINAL2 为 69 `RESOLVED`、34 `PARTIAL`、1 `NOT`；FINAL3 关闭 Information Bias 的 1 条 `NOT`，并关闭 Git 所在的 1 条 `PARTIAL`。因此当前保守汇总为：

| 状态 | 数量 | 当前含义 |
|---|---:|---|
| evidence-ready candidate | **71** | FINAL2 的 69 条，加 FINAL3 已关闭的 Information Bias 与 Git 两条 |
| partial / not evidence-ready | **33** | 继承的部分支持项，仍需缩窄主张或补充直接来源 |
| blocker / source mismatch | **0** | FINAL3 已关闭唯一确定的 Information Bias source mismatch |
| active | **0** | 本复核不执行 claim-level 审批或生命周期切换 |

当前快照中该 104/104 条均可找到，且 104/104 的 `supportStatus` 仍为 `claim_level_review_pending`；active 为 0。GSVA/ssGSEA 是本轮单独核验的映射修复，不被重复计入前一 104 条队列的分母或 71/33 计数。

## Remaining BLOCKER / MAJOR / NEW

- remaining blocker: **0**。
- remaining major: **33**，即前一 104 条队列中继承的 33 条 `PARTIAL`；本轮没有对它们扩展重审，不能仅凭映射或 metadata verified 状态升级。
- new issue: **0**。
- FINAL4 极窄新增范围本身：BLOCKER **0**，MAJOR **0**。

## 激活边界

本报告关闭的是证据映射问题，不是 lifecycle gate。GSVA/ssGSEA、Information Bias、Git 以及前一 104 条队列当前都仍为 pending；71 条只是 evidence-ready candidates，33 条仍 partial，**当前可视为 active 的数量为 0**。任何激活仍需独立 claim-level 审批，不得由本报告自动完成。
