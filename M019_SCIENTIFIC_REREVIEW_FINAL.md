# M019 Final Scientific Rereview

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_type: `FINAL_DELTA_ONLY`
- scope: 仅复核 `M019_SCIENTIFIC_REREVIEW.md` 中剩余 8 个 MAJOR；未重新扫描其他历史问题
- reviewed_inputs: 当前 `artifacts/curriculum-content-snapshot.json` 中 8 条对应内容与来源映射；当前 `src/data/evidence.ts` 中对应来源元数据
- implementer_self_assessment_used: `false`

## Final counts

| Status | Count |
|---|---:|
| RESOLVED | 8 |
| PARTIALLY_RESOLVED | 0 |
| NOT_RESOLVED | 0 |

| Current severity | Count |
|---|---:|
| BLOCKER | 0 |
| MAJOR | 0 |

## Delta findings

### 1. `src-multiomics` 命名与适用域

- status: `RESOLVED`
- current_evidence:
  - `src/data/evidence.ts` 中旧字符串 `src-multiomics` 当前为 0 次；来源已改为 `id: "src-rnaseq-best-practices"`。
  - 新 ID 对应题名仍为 “A survey of best practices for RNA-seq data analysis”，`coreEvidence` 明确限定于 transcriptomics 的设计、QC、定量、差异分析与解释，ID、题名和证据适用域现在一致。
  - 当前快照对旧 `src-multiomics` 的引用为 0；对新 `src-rnaseq-best-practices` 的引用也为 0，因此没有以改名后的来源继续支撑多组学或其他模态主张。
  - `sourceYears` 已登记 `"src-rnaseq-best-practices": 2016`，不存在旧 ID 的年份残留。
- conclusion: 原误导性 ID 及其再污染入口均已移除；当前 metadata 与 mapping 不再把 RNA-seq 综述伪装成 multi-omics 总证据。

### 2. `staged-concept-interaction`

- status: `RESOLVED`
- current_evidence:
  - 当前措辞定义交互为效应随另一变量改变且依赖链接/尺度；例题明确“分别显著与否不能替代正式交互对比”。
  - 正确决定为“在预先指定的尺度上计算亚组效应及正式 interaction contrast”，核对项禁止以“一个显著、一个不显著”冒充组间差异。
  - `sourceIds` 已收窄为唯一的 `src-interaction`。该来源题名为 “On the distinction between interaction and effect modification”，DOI `10.1097/EDE.0b013e3181ba333c`，PMID `19806059`，`verificationScope: claim`；其 `coreEvidence` 直接覆盖 estimand/尺度依赖和不能比较分层内显著性。
- conclusion: 内容与直接方法来源逐项匹配，原通用 P 值/FDR/STROBE 占位映射已消失。

### 3. `staged-concept-power`

- status: `RESOLVED`
- current_evidence:
  - 当前例题要求设计前使用最小重要效应、SD、alpha、独立样本量和计划检验，结果后用效应与 CI 讨论信息量而不计算 observed power。
  - 正确决定明确包含事前效应假设、alpha、设计、方差/事件率与分析规则；核对项明确禁止用观察效应计算事后功效为结果背书。
  - `sourceIds` 已收窄为 `src-power`。来源 “The Abuse of Power: The Pervasive Fallacy of Power Calculations for Data Analysis”，DOI `10.1198/000313001300339897`，`verificationScope: claim`；`coreEvidence` 直接区分 prospective design 与 completed nonsignificant result 的 observed/post-hoc power 谬误。
- conclusion: 事前设计与事后解释的教学边界及其直接来源均已补齐。

### 4. `staged-concept-selection-bias`

- status: `RESOLVED`
- current_evidence:
  - 当前定义覆盖进入研究、留在随访和进入分析的选择机制，并把 collider 条件化限定为其中一种结构；评估核对项区分抽样覆盖、差异参与、失访和 collider 条件化。
  - `sourceIds` 已收窄为 `src-selection-bias`。来源 “A structural approach to selection bias”，DOI `10.1097/01.ede.0000135174.63482.43`，PMID `15308962`，`verificationScope: claim`；`coreEvidence` 直接覆盖 cohort/case-control 选择机制、informative loss to follow-up 及其与 confounding 的区别。
- conclusion: 定义不再缩窄为 collider，原报告指南/伪重复来源误配已被直接结构性选择偏倚方法来源替代。

### 5. `staged-concept-censoring`

- status: `RESOLVED`
- current_evidence:
  - 当前措辞明确列出右删失、左删失和区间删失，要求方法匹配类型、说明条件独立删失假设，并区分竞争事件和左截断。
  - 评估决定要求识别删失类型并选择匹配方法；核对项明确禁止把删失、左截断与竞争事件混成同一状态。
  - `sourceIds` 为 `src-survival-censoring` 与 `src-km-tutorial`。前者是 “Censoring issues in survival analysis”（DOI `10.1146/annurev.publhealth.18.1.83`，PMID `9143713`），直接覆盖不完整事件时间、删失机制与有效推断假设；后者是 “Methods to Analyse Time-to-Event Data: The Kaplan-Meier Survival Curve”（DOI `10.1155/2021/2290120`，PMID `34594473`），`coreEvidence` 明确覆盖 right/left/interval censoring。两者均为 `verificationScope: claim`。
- conclusion: 原“censoring 等于右删失”的错误与来源缺口均已处理；措辞还明确要求按类型选法，没有把 Kaplan–Meier 泛化为所有删失类型的统一分析方法。

### 6. `guide-v1-m06-t06`（Normalization）

- status: `RESOLVED`
- current_evidence:
  - summary 已从跨模态列举稳定特征、spike-in、组成参考的宽泛表述，收窄为“归一化目标随模态和方法而异；例如单细胞 RNA 计数模型与批次处理各有前提，其他模态必须使用本模态依据，不能直接迁移同一规则”。
  - 当前 `evidenceSourceIds` 仅为 `src-sctransform` 与 `src-batch`。`src-sctransform` 的 DOI `10.1186/s13059-019-1874-1`、PMID `31870423`、`verificationScope: claim` 及 `coreEvidence` 直接覆盖单细胞 UMI 计数的归一化/方差稳定化；`src-batch` 的 DOI `10.1038/nrg2825` 与 `coreEvidence` 直接覆盖高通量实验的批次效应来源、检测和后果。
  - 当前文字没有再声称这两条来源能够给出蛋白组、代谢组或所有组学的统一归一化规则，反而明确要求其他模态另用本模态依据。
- conclusion: 过度概括已通过缩窄措辞和直接来源映射解决；“批次处理”在句中作为另一个具有自身前提的技术步骤出现，未被定义为归一化的同义词。

### 7. `guide-v1-m06-t15`（Molecular subtype）

- status: `RESOLVED`
- current_evidence:
  - 当前 summary 先要求判断离散类别还是连续轴，只将稳定、可冻结分配且可在独立数据复现的离散类别称为 subtype；连续结构明确报告为 program 或 axis。
  - `evidenceSourceIds` 已从不相关的 batch/single-cell 高层来源改为 `src-clustering` 与 `src-nmf`。前者 “Clustering stability: an overview”（DOI `10.1002/wics.8`）直接支持扰动下聚类稳定性检查；后者 “Metagenes and molecular pattern discovery using matrix factorization”（DOI `10.1073/pnas.0308531101`，PMID `15016911`）直接支持 consensus NMF 的表达模式发现与聚类稳定性评估。
  - 正文仍限制为结构描述，并明确没有时间、干预或区分性验证时不得升级为因果机制。
- conclusion: 原把连续结构直接定义为 subtype 的错误已消失；当前来源足以支持“先检查结构与稳定性”的教学边界，且措辞对独立复现与冻结分配采用审慎的验证要求而非声称来源已经证明某一具体 subtype。

### 8. `guide-v1-m01-t14`（Competing Hypotheses）

- status: `RESOLVED`
- current_evidence:
  - 当前主张仍为列出可解释同一观察的多个机制，并优先设计使它们产生不同预测的证据。
  - `evidenceSourceIds` 已收窄为 `src-strong-inference`。来源 “Strong Inference”，DOI `10.1126/science.146.3642.347`，PMID `17739513`，`verificationScope: claim`；其 `coreEvidence` 直接要求多个替代假设和产生区分性结果的实验，而非确认偏好的单一解释。
  - Fine–Gray competing-risk 来源和仅能支持 DAG/报告规范的来源均已移除。
- conclusion: 词面误配与缺少直接科学推理来源两个残余问题均已解决。

## Release-state conclusion

- current BLOCKER: `0`
- current MAJOR: `0`
- pending_review: `可保持，且应保持`

本次仅差异式复审确认上一轮剩余 8 个 MAJOR 均已解决，因此它们不再阻止工作树继续处于 `pending_review`。但本结论不是“全库科学验证通过”或升级为 `verified` 的授权：复审没有重新检查先前已解决条目、原 MINOR、其他课程内容或全部 claim-level 引用；此外，部分沿用的 seed/metadata 来源记录没有统一显式 `verificationScope: claim`。因此当前最稳妥状态是继续保留 `pending_review`，等待全量 claim-level 审批后再考虑升级。
