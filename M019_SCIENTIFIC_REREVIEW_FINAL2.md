# M019 Scientific Rereview FINAL2

- snapshot_byte_sha256: `c94358e6b35335a0a70c84d81c5e7fb9798467d687c1ac4fc4a84811ae86d4d2`
- claims_sha256: `ebaa525d5855963a975767d98fb433e12dcc46e30d36fe36fcfbb12e3ff0554d`
- source_registry_sha256: `4b2206782876550e22a57c2305a77a15d0dd03f0af75e0230936f36c0bda4c0f`
- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_type: `FINAL2_CURRENT_SNAPSHOT_BOUNDARY_RECHECK`
- scope: 复核前一版 final 的 8 个科学问题在当前绑定快照中的状态，并核对 high-risk 路由与 pending 隔离；未重新审查全部 361 条 claim 的实质来源充分性

## Scoped counts

| Result | Count |
|---|---:|
| previously remaining scientific items rechecked | 8 |
| RESOLVED | 8 |
| PARTIALLY_RESOLVED | 0 |
| NOT_RESOLVED | 0 |
| remaining BLOCKER | 0 |
| remaining MAJOR | 0 |
| NEW scientific issue | 0 |

这些计数只属于上述 8 项定向复核，不表示全库科学批准，也不覆盖独立 evidence / pedagogy review 的未决项。

## 1. `src-multiomics` 当前状态

**Status: RESOLVED（来源身份问题）；所有使用它的 AI 生成 claim 仍须 claim-level 审批。**

当前 `src/data/evidence.ts` 中的 `src-multiomics` 不再是被错误命名的 RNA-seq best-practice 综述。其记录现在是：

- title: `Multi-omics approaches to disease`
- source: *Genome Biology*
- year: `2017`
- DOI: `10.1186/s13059-017-1215-1`
- PMID: `28476144`
- sourceType: `methods_review`

[PubMed 原始记录](https://pubmed.ncbi.nlm.nih.gov/28476144/)确认题名、期刊、年份、DOI、PMID 和 review 类型；摘要明确说明该文综述多种 omics 技术，并聚焦跨多个 omics layers 的整合。因此，当前 ID、题名与 `coreEvidence` 的“跨分子层整合、保留模态特异测量和解释边界”语义一致。

当前绑定快照中，`src-multiomics` 用于 4 个 guide section 和 6 条 claim：

- `RNA Is Not Protein`：与 `src-proteomics-overview` 配对；支持跨层测量不一一对应及不能把失配自动解释为错误的有限边界。
- 两处 `Triangulation` 与 `staged-concept-triangulation`：与 `src-strong-inference` 配对；multi-omics 只提供跨层证据的具体语境，不单独证明一般性的偏倚三角验证原则。
- `Integrating Evidence without Forcing Agreement`：与 `src-strong-inference` 配对；当前来源支持跨层整合及保留不一致，但不应被解读为验证了一个通用“证据图”算法。
- `staged-concept-rna-protein`：与 `src-proteomics-overview` 配对，并把结论限定为模态时间、测量对象、生成/降解机制与技术覆盖下的有限判断。

因此，本轮关闭的是旧的“把 RNA-seq 综述伪装成 multi-omics 总证据”问题，而不是把上述 6 条 claim 宣布为 evidence-ready。它们当前仍为 `supportMode=curriculum_synthesis`、`supportStatus=claim_level_review_pending`；来源元数据正确不能替代逐条来源—主张审批。

## 2. 其余 7 个原 MAJOR

| Item | Current evidence | Status |
|---|---|---|
| `staged-concept-interaction` | 明确效应尺度、正式 interaction contrast，并禁止比较两个组内 P 值；唯一来源 `src-interaction` | RESOLVED |
| `staged-concept-power` | 区分事前设计功效与事后 observed power；唯一来源 `src-power` | RESOLVED |
| `staged-concept-selection-bias` | 同时覆盖进入、留存、分析选择与 collider 条件化；唯一来源 `src-selection-bias` | RESOLVED |
| `staged-concept-censoring` | 区分右/左/区间删失、左截断与竞争事件，并声明条件独立删失；来源 `src-survival-censoring`、`src-km-tutorial` | RESOLVED |
| `Normalization` | 明确规则依赖模态，当前例示限定于单细胞 RNA 与 batch 前提；来源 `src-sctransform`、`src-batch`，没有外推为所有组学通用算法 | RESOLVED |
| `Molecular Subtype` | 要求稳定、冻结分配和独立复现；连续结构改称 program/axis，且禁止升级为因果机制；来源 `src-clustering`、`src-nmf` | RESOLVED |
| `Competing Hypotheses` | 要求让替代假设产生不同可观察预测，而非分别寻找支持材料；来源 `src-strong-inference` | RESOLVED |

此表只确认上一轮明确列出的科学措辞与方法来源问题在当前 hash 下仍关闭；它不重新判定其他内容，也不把方法论文的存在等同于课程 claim 的自动验证。

## 3. High-risk routing

当前 `scripts/scientific-audit.mjs` 与 `artifacts/curriculum-scientific-audit.json` 报告：

| Routed class | Count |
|---|---:|
| HIGH-risk Guide claim | 182 |
| formal Concept/Method claim linked to a HIGH-risk Guide | 54 |
| Case calibration claim | 12 |
| unique total | 248 |

独立按当前 snapshot 的关联关系重算得到相同结果：182 + 54 + 12 = 248，三组 claim ID 无重叠。原来遗漏 formal claim 的异构 ID 比较已由 `formal contentId -> guideSectionIds` 映射替代；12 个 Case 各有一条 calibration claim。

这只是**路由完整性**结论。248 条进入 packet 不等于 248 条通过科学审查；尤其 Case 的数值是虚构课程场景，当前 `evidenceBoundaryCn` 只允许来源支撑所用方法与解释边界，不能把场景数值写成外部研究发现。

## 4. Pending isolation 与科学边界

当前快照包含 374 个候选内容对象：288 Guide、40 Concept、21 Method、12 Case、13 Studio。逐项核对结果为：

- `contentOrigin=ai_generated`: 374/374
- `verificationStatus=pending`: 374/374
- `lifecycle=pending_review`: 374/374
- observed active AI-generated items: 0
- claim `supportStatus=claim_level_review_pending`: 361/361
- claim `supportMode=curriculum_synthesis`: 361/361

scientific packet 的 `PASS` 只证明 source ID 存在、生命周期隔离、绑定 hash 和 high-risk 路由的机器约束通过。它不证明 361 条教学综合主张科学正确，也不授权把任何内容改成 `verified` / `active`。

机器报告的 1 条 ambiguous-universal wording flag 是“有限分辨率和相关性**不能自动证明**细胞来源或相互作用”；这是安全的否定边界，而不是绝对因果主张，因此本轮不记为新科学问题。

## Activation decision

保持全部内容 `pending_review`。本次定向科学复核的 remaining BLOCKER=0、remaining MAJOR=0、NEW issue=0；但全库激活仍必须同时满足：所有必需 final review 与本报告的三个 hash 完全一致、review-binding gate 为 PASS、逐条 claim-level 审批完成，以及独立 pedagogy/evidence 门槛关闭。不得从本报告的窄范围 `8/8 RESOLVED` 推导“全库科学批准”。
