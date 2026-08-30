# M019 证据强制第二遍复审

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- prior_snapshot_commit: `35750c3`
- 复审范围：上一轮 136 条 `SOURCE_MISMATCH`、8 条 `NEEDS_CURRENT_SOURCE`、35 条 `WEAKLY_SUPPORTED`，共 179 条 claim；另复核 `src-milo` PMID 缺口。
- 输入边界：仅使用原始问题条目、当前 `artifacts/curriculum-content-snapshot.json` 中对应内容，以及 `src/data/evidence.ts` 中相关来源元数据。
- 排除范围：没有重新审计上一轮已判为 `DIRECTLY_SUPPORTED` 或 `REASONABLE_SYNTHESIS` 的其他条目，也没有读取生成理由或其他审查报告。

## 复审结论

M019 不能关闭。179 条原问题中，34 条已完全解决，45 条仅部分解决，90 条未解决，另有 10 条在修订中引入新问题。即 145/179 条仍未达到“完全解决”。

当前 179 条 claim 的重新分类如下：

| 当前分类 | 数量 |
|---|---:|
| `DIRECTLY_SUPPORTED` | 16 |
| `REASONABLE_SYNTHESIS` | 27 |
| `WEAKLY_SUPPORTED` | 55 |
| `UNSUPPORTED` | 0 |
| `SOURCE_MISMATCH` | 80 |
| `NEEDS_CURRENT_SOURCE` | 1 |

这些统计只针对原问题子集，不能与全量 361 条 claim 的统计直接相加或替换。

## 原问题处理状态

| 原分类 | RESOLVED | PARTIALLY_RESOLVED | NOT_RESOLVED | NEW_PROBLEM | 合计 |
|---|---:|---:|---:|---:|---:|
| `SOURCE_MISMATCH` | 25 | 41 | 63 | 7 | 136 |
| `NEEDS_CURRENT_SOURCE` | 5 | 2 | 1 | 0 | 8 |
| `WEAKLY_SUPPORTED` | 4 | 2 | 26 | 3 | 35 |
| **合计** | **34** | **45** | **90** | **10** | **179** |

逐条判定、当前 claim、前后 source_id 和元数据 verdict 见 `artifacts/curriculum-evidence-rereview.json`。

## 已解决或实质改善的项目

### 直接方法来源补齐

以下新增来源能够承担相应方法主张：

- `src-time-auc`：直接支持时间依赖病例/对照定义与删失校正。对应 guide 和 staged method 的 time-dependent AUC 已升级为 `DIRECTLY_SUPPORTED`。
- `src-rcs`：补上 cubic spline 方法来源。
- `src-leakage`：补上训练/评估隔离与 leakage 直接来源。
- `src-pmsampsize`：补上预测模型样本量不应依赖固定事件阈值的直接来源。
- `src-ora`：修复 ORA 与 ranked-list GSEA 的方法错配。
- `src-harrell-c`：可直接承担 C-index 的排序定义，但该条同时引入了新的错配来源，见下文。

其中 RCS、leakage、样本量和 ORA 的 guide claim 仍保留 ASA/FDR/STROBE 等不承担该具体主张的旧来源，因此判为 `PARTIALLY_RESOLVED`，而不是完全解决。

### staged concept 模板问题

上一轮 40 条 staged concept 的“当前队列内判断”无对象模板已被逐概念重写：

- 18 条 `RESOLVED`
- 22 条 `PARTIALLY_RESOLVED`

当前分类为 9 条 `DIRECTLY_SUPPORTED`、11 条 `REASONABLE_SYNTHESIS`、13 条 `WEAKLY_SUPPORTED`、7 条 `SOURCE_MISMATCH`。

仍未完成引用修复的重点是 SE、置信区间、功效、交互、time origin、cluster stability 与 negative-result；文字已具体化，但原有通用来源仍不能直接承担这些定义。

### staged case 重复句问题

12 个 staged case 已不再复用同一句校准主张，且当前内容绑定到各自 case 的最终证据：

- 7 条 `RESOLVED`
- 5 条 `PARTIALLY_RESOLVED`
- 当前为 9 条 `REASONABLE_SYNTHESIS`、3 条 `WEAKLY_SUPPORTED`

需要继续明确这些数值和事件是课程内场景材料，而不是由外部论文产生的真实队列结果。涉及 `src-tripod-ai` 的两条 case 还受元数据缺口影响。

### 生成式 AI 时效问题

8 条原 `NEEDS_CURRENT_SOURCE` 中：

- 5 条已由 `src-nist-genai-profile` 支持并改写成有人类检查点、来源回查、责任链或可审计辅助的规范性综合；
- 2 条仍只有部分支持：适合的任务清单，以及流畅叙事连接成机制的具体行为；
- 1 条未解决：`claim-guide-v1-m10-t10-guide-summary` 仍声称模型“倾向使用 drives、leads to”，NIST GenAI Profile 并不直接证明这一行为频率，仍需当前原始评估。

## 新问题

### 1. GenAI 风险规范被挂到非 AI 教学主张

以下 9 条新增 `src-nist-genai-profile`，但 claim 讨论的是一般证据判断、主结论选择、Figure 叙事或论文组织，并非生成式 AI 风险：

- `claim-guide-v1-m01-t07-guide-summary`
- `claim-guide-v1-m05-t07-guide-summary`
- `claim-guide-v1-m05-t23-guide-summary`
- `claim-guide-v1-m07-t21-guide-summary`
- `claim-guide-v1-m08-t13-guide-summary`
- `claim-guide-v1-m08-t14-guide-summary`
- `claim-guide-v1-m09-t05-guide-summary`
- `claim-guide-v1-m09-t19-guide-summary`
- `claim-guide-v1-m09-t20-guide-summary`

动作：从这些 claim 删除 `src-nist-genai-profile`。若主张是课程叙事规则，应明确标为 curriculum synthesis；若声称是规范要求，应补直接编辑/报告来源。

### 2. C-index 修订同时引入 MOFA+ 与 DIABLO

`claim-guide-v1-m03-t32-guide-summary` 新增 `src-harrell-c` 是正确修复，但也新增 `src-mofa-plus` 和 `src-diablo`。这两篇多组学集成论文不定义 C-index，`src-asa-pvalue` 也不承担该指标。

动作：保留 `src-harrell-c`，删除 `src-mofa-plus`、`src-diablo` 和不必要的 ASA 引用；如需覆盖删失 convention，再增加直接生存区分度来源。

### 3. 新使用的 src-tripod-ai 元数据不完整

`src-tripod-ai` 目前有 URL，并通过 `sourceYears` 得到 2024 年，但在 `evidence.ts` 中没有 DOI 或 PMID。该来源现在被用于：

- `claim-staged-concept-validation-concept-boundary`
- `claim-staged-case-overfitting-validation-case-calibration`
- `claim-staged-case-ai-plan-audit-case-calibration`

动作：补齐精确题名、DOI、PMID 和出版类型；在补齐前这些条目的 metadata verdict 保持 `PARTIAL`。

## 未解决的主要簇

### 基础统计定义仍由 ASA/FDR/STROBE 批量承担

测量尺度、分布、均值/中位数、SD、SE、置信区间、功效、相关、线性/逻辑回归、交互、time origin 等多数 claim 没有获得针对性来源。新增少量直接来源不能替代逐方法修复。

动作：按方法族补原始方法或权威统计规范；删除与具体方法无关的通用来源。

### 数据工程规则仍只引用 FAIR/STROBE

wide/long、join key、随机种子、确定性/随机过程、Git 语义和数据类型转换仍未由官方技术文档或直接方法来源支持。

动作：补官方技术文档，或明确标为课程工程约定，不再呈现为外部科学结论。

### Figure、论文叙事与研究优先级启发式仍缺直接依据

主图顺序、panel 任务、major/minor、停止规则、成本×信息增益等主张仍主要引用 STROBE/TRIPOD/PRISMA/REMARK。报告指南不直接建立这些教学启发式。

动作：统一标为 `REASONABLE_SYNTHESIS` 的课程判断并说明边界，或添加直接编辑规范/教学研究来源。

### 蛋白质组与 ECM–CAF 仍未补专门来源

`claim-guide-v1-m06-t26-guide-summary` 和 `claim-guide-v1-m06-t30-guide-summary` 只删除了一个旧来源，剩余 batch/single-cell 来源仍不能直接支持蛋白推断与 ECM–CAF 机制边界。

动作：补蛋白质组学和 ECM/肿瘤微环境直接来源。

### 三个 staged method 仍未修复

correlation、linear regression 与 Kaplan–Meier/log-rank 的 staged method claim 仍只引用相邻报告/生存来源，没有对应直接方法来源。

## 元数据复审

- `src-milo`：`RESOLVED`。PMID `34594043` 已写入，并与题名、DOI、年份、类型和 URL 同时存在。
- `src-tripod-ai`：`NEW_PROBLEM`。成为当前问题 claim 的来源后，暴露出 DOI/PMID 缺失。

## 决策

- 不关闭 M019。
- 34 条 `RESOLVED` 可从原问题清单移出。
- 45 条 `PARTIALLY_RESOLVED` 必须保留并完成引用清理或元数据补齐。
- 90 条 `NOT_RESOLVED` 保持阻断。
- 10 条 claim-level `NEW_PROBLEM` 与 1 条 metadata `NEW_PROBLEM` 加入修复清单。

