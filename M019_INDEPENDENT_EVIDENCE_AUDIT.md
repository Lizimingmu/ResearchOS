# M019 独立证据与引用审计

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- snapshot_commit: `35750c3`
- 审计输入：`artifacts/curriculum-content-snapshot.json`、`src/data/evidence.ts`
- 审计对象：`snapshot.claims` 全部 361 条 claim
- 独立性边界：未读取生成理由、先前评价或其他审查报告；外部核验仅使用出版者页面、官方文档和原始方法论文/官方 PubMed 记录。

## 结论

不应把该冻结快照整体升级为 claim-level verified。361 条 claim 中只有 61 条达到 `DIRECTLY_SUPPORTED`；121 条属于可接受但必须明确标为综合的 `REASONABLE_SYNTHESIS`；其余 179 条需要补证、换源或重写，其中 136 条为 `SOURCE_MISMATCH`。

主要风险不是 DOI 不存在，而是来源与具体教学主张的对象、方法或推断责任不一致。引用存在、标识符可解析或元数据正确，均未被视为 claim 通过的充分条件。

## 分类统计

| 分类 | 数量 | 审计含义 |
|---|---:|---|
| `DIRECTLY_SUPPORTED` | 61 | 原文、原始方法或官方规范直接覆盖主张及其边界 |
| `REASONABLE_SYNTHESIS` | 121 | 主要事实有来源支持，但最终教学表述是跨来源综合 |
| `WEAKLY_SUPPORTED` | 35 | 来源仅邻近相关，未直接建立具体定义、规则或普遍陈述 |
| `UNSUPPORTED` | 0 | 没有空引用 claim；不代表所有有引用 claim 均获支持 |
| `SOURCE_MISMATCH` | 136 | 引用存在，但对象、方法或推断责任与 claim 不符 |
| `NEEDS_CURRENT_SOURCE` | 8 | 涉及当前生成式 AI 行为/实践，现有来源过旧或不直接 |

逐条结果见 `artifacts/curriculum-evidence-audit.json`。

## 判定口径

- `DIRECTLY_SUPPORTED`：来源的 coreEvidence 或原始页面直接支持 claim 的主体、关系、尺度和限制；数值阈值与普遍陈述必须有直接依据。
- `REASONABLE_SYNTHESIS`：多个来源共同支持组成事实，但最终句子是教学性推导；可保留，不能呈现成来源原话或单篇论文结论。
- `WEAKLY_SUPPORTED`：来源属于相邻主题或一般报告原则，不能承担该具体定义、操作规则或普遍化结论。
- `UNSUPPORTED`：没有可识别的支持链。本快照没有空引用 claim，因此该类为 0。
- `SOURCE_MISMATCH`：引用来源主题明确不同，或已有更直接来源却未引用。
- `NEEDS_CURRENT_SOURCE`：主张依赖快速变化的模型能力、风险或使用规范，需要近期官方指南或原始评估。

## 来源存在性与元数据

42 个唯一 source_id 均能在 `evidence.ts` 中解析；42 条均有题名、sourceType 与 DOI。21 条年份直接写在 source object，另 21 条通过 `sourceYears` 映射补齐。记录了 33 个 PMID 和 15 个 URL。

发现一个可操作的元数据缺口：

- `src-milo` 的题名、年份、DOI `10.1038/s41587-021-01033-z` 与类型一致，但漏记 PubMed PMID `34594043`。这影响引用完整性，不改变 Milo 相关 claim 的证据支持判定。官方记录：[PubMed](https://pubmed.ncbi.nlm.nih.gov/34594043/)。

`sourceType` 是项目内部证据角色标签。例如 review 可能被标成 `methods`、statement 可能被标成 `guideline`；它不应被当作出版商的精确 article type。外部抽查亦核对了单细胞 best-practices 综述、ROC AUC 原始论文和外部验证样本量论文的题名、年份、DOI/PMID：[single-cell best practices](https://pubmed.ncbi.nlm.nih.gov/37002403/)、[ROC AUC](https://pubmed.ncbi.nlm.nih.gov/7063747/)、[external-validation sample size](https://pubmed.ncbi.nlm.nih.gov/34915593/)。

## 阻断性问题与修复动作

### 1. 40 条 staged concept boundary 是无证据对象的模板句

`claim-staged-concept-research-question-concept-boundary` 至 `claim-staged-concept-ai-cognitive-outsourcing-concept-boundary` 共 40 条，统一声称“当前最多支持……队列内判断”。但这些 claim 没有对应队列、结果、estimand 或验证数据；对于 Research Question、P value、Batch effect 等抽象概念，“队列内判断”本身也不成立。

动作：逐概念重写。若教学目标只是提醒边界，应改成定义性或规范性语言并引用直接方法来源；若确实要做 case-specific evidence ceiling，必须绑定具体数据、总体、比较、结局与验证状态。

### 2. 12 个 staged case 复用同一句校准主张

`claim-staged-case-topic-to-question-case-calibration` 至 `claim-staged-case-ai-plan-audit-case-calibration` 的文本完全相同，但引用横跨 STROBE、空间组学、NMF、CONSORT、NIST、Cox 等不同主题。来源不能共同证明同一个 case-specific 结论。

动作：每个 case 单独写“观察—最大允许主张—替代解释—下一项区分性证据”，再只引用直接承担该环节的来源。

### 3. 统计学基础大量使用 ASA/FDR/STROBE 通用组合代替直接来源

`guide-v1-m03-t01` 至 `guide-v1-m03-t25` 中，测量尺度、分布、均值/中位数、SD、SE、置信区间、功效、相关、线性/逻辑回归、交互、非线性、样条和模型诊断，多数仅引用 ASA p-value 声明、Benjamini–Hochberg FDR 论文与 STROBE。这三者不直接定义上述概念。

动作：为每个方法族增加原始方法论文或权威统计规范；不允许用一组“统计学相关”来源批量覆盖不同定义。限制性立方样条 claim `claim-staged-method-restricted-cubic-spline-method-core` 也必须新增 spline 直接来源，Cox/TRIPOD 不足。

### 4. “competing” 发生语义错配

`claim-guide-v1-m01-t14-guide-summary` 与 `claim-guide-v1-m08-t06-guide-summary` 用 `src-competing` 支持“竞争解释/竞争假设”。但该来源是 Fine–Gray competing-risk 模型论文，处理的是竞争事件，不是科学推理中的 alternative explanations。

动作：删除这两个位置的 `src-competing`，换成因果推断、判别性实验或假设比较的直接来源。

### 5. 已有直接泄漏来源却未引用

`claim-guide-v1-m03-t27-guide-summary`、`claim-guide-v1-m03-t28-guide-summary` 和 `claim-guide-v1-m06-t17-guide-summary` 涉及 data leakage、交叉验证内预处理/特征选择，却没有引用快照中已经存在的 `src-leakage`。

动作：改引 `src-leakage`，并在 claim 中明确“所有数据驱动步骤必须在训练折内重新拟合”；若涉及嵌套调参，再补 nested-CV 直接来源。

### 6. ORA 与 GSEA 方法错配

`claim-guide-v1-m06-t19-guide-summary` 描述候选列表相对背景集的过度表示检验，却引用 `src-gsea`。GSEA 是排序列表方法，不是该 ORA/超几何检验的直接来源。

动作：添加 ORA/超几何或 Fisher exact enrichment 的直接来源；保留 `src-gsea` 仅用于排序型 GSEA claim。

### 7. 蛋白质组与 ECM–CAF 主张没有专门来源

`claim-guide-v1-m06-t26-guide-summary` 的肽段鉴定/蛋白推断/动态范围，以及 `claim-guide-v1-m06-t30-guide-summary` 的 ECM 丰度与 CAF 机制边界，当前只引用批次、单细胞和 RNA-seq 综述。

动作：分别补蛋白质组学缺失/蛋白推断方法来源与肿瘤微环境/ECM 直接来源；在补证前降为 `WEAKLY_SUPPORTED` 或删除具体机制例子。

### 8. 当前生成式 AI 行为不能只由 NIST 2023 与 FAIR 2016 承担

以下 8 条被判为 `NEEDS_CURRENT_SOURCE`：

- `claim-guide-v1-m10-t01-guide-summary`
- `claim-guide-v1-m10-t02-guide-summary`
- `claim-guide-v1-m10-t03-guide-summary`
- `claim-guide-v1-m10-t07-guide-summary`
- `claim-guide-v1-m10-t09-guide-summary`
- `claim-guide-v1-m10-t10-guide-summary`
- `claim-guide-v1-m10-t19-guide-summary`
- `claim-guide-v1-m10-t20-guide-summary`

其中包括虚构引用、因果动词倾向、适用任务和认知依赖等具体行为。NIST AI RMF 1.0 是高层风险管理框架，FAIR 原则不是生成式 AI 行为证据。

动作：补近期官方生成式 AI 风险/使用指南或原始评估；将经验性认知影响与规范性责任要求分开，不要用同一来源同时承担。

### 9. 综合性 claim 必须显式标注为综合

121 条 `REASONABLE_SYNTHESIS` 可以作为课程解释保留，但 UI/数据层应区分“source-backed direct claim”和“curriculum synthesis”。否则读者会把组合后的教学句误认为某篇论文的直接结论。

动作：增加可见的 `supportMode: synthesis` 或等价字段；只有 `DIRECTLY_SUPPORTED` 可进入直接来源支持状态。

## 审批建议

- 阻断整体 claim-level verification。
- 先修复 136 条 `SOURCE_MISMATCH`、8 条 `NEEDS_CURRENT_SOURCE` 与 `src-milo` PMID 缺口。
- 35 条 `WEAKLY_SUPPORTED` 在补专门来源或收窄措辞前保持 pending。
- 121 条 `REASONABLE_SYNTHESIS` 可保留，但必须显式标为综合。
- 61 条 `DIRECTLY_SUPPORTED` 可进入下一轮内容与措辞审查；本审计不等于对完整正文的事实审批。

