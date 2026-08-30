# M016 — Three Prototype Content Contracts

本文件定义 learning objectives、教学顺序、科学边界、rubric 和可复用资产。OpenCode 可以将合同实现为结构化中文内容，但不得扩写出新的科学主张；新增或改写的科学正文一律 `pending`，等待 Codex 审核。

## 🔗 原型链总览

| Order | Unit ID | 中文标题 | 目标时长 | 先修 |
|---:|---|---|---:|---|
| 1 | `lu-statistical-unit-v1` | 什么才算 n：统计单位 | 10 min | 无 |
| 2 | `lu-biological-technical-replicate-v1` | 生物学重复与技术重复 | 10 min | Statistical Unit |
| 3 | `lu-pseudoreplication-v1` | 伪重复：很多行不等于很多 n | 11 min | Biological vs Technical Replicate |

共同 provenance：

- `src-pseudorep` — *Pseudoreplication in physiology: More means less*, DOI `10.1085/jgp.202012826`, PMID `33464305`，当前种子为 claim-verified。
- `src-pseudobulk` — *Confronting false discoveries in single-cell differential expression*, DOI `10.1038/s41467-021-25960-2`, PMID `34584091`，当前种子为 claim-verified。

不得把“来源已核验”自动传播为“新教学措辞已核验”；每个新增 EvidenceClaim 仍需单独 gate。

## 📊 Prototype 1 — Statistical Unit

### Learning objectives

完成后用户应能：

1. 区分 observation/measurement unit、experimental unit 和 statistical/inference unit。
2. 在嵌套数据中指出样本量数字为何不等于独立信息量。
3. 根据研究问题和 estimand 说明本例的 `n` 应在哪一层报告。
4. 写出 Reviewer 会要求补充的设计和分析信息。

### Progressive-disclosure content contract

| 教学职能 | 必须表达的内容 |
|---|---|
| 为什么重要 | 情境：3 位患者各测数千细胞。软件可看到数千行，但患者组间结论是否真有数千个独立机会？ |
| 一句话直觉 | `n` 不是“表里有多少行”，而是研究设计给了多少个能独立变化、支持目标推断的单位。 |
| 精确定义 | Observation/measurement unit 是被测量的单位；experimental unit 是被独立分配干预的最小单位；statistical/inference unit 是不确定性和目标推断所对应的独立层级。三者可以相同，也可以不同。 |
| 机制/结构 | 用 患者 → 样本 → 细胞/视野 的嵌套图说明同一患者内测量共享生物背景，不能无条件视为互相独立。 |
| Worked Example | 3 位患者/组，每人 2,000 个细胞。专家先问 estimand，再画层级，再确认组别在哪层变化，最后得出：若目标是患者组间差异，独立信息主要来自患者层；细胞提高患者内测量精度但不把患者 n 变成 12,000。 |
| Common Misconception | “细胞越多，n 越大、P 越可靠”看似合理，因为测量更稳定；错误在于把患者内精度与患者间独立重复混为一谈。 |
| Guided Practice | 4 只小鼠/组，每只取 10 个视野。Hint 1：处理分配给谁？Hint 2：哪些观测共享同一只小鼠？Hint 3：目标结论关于小鼠还是视野？ |
| Independent Practice | 锁定题：5 名患者各有 3 张切片、每张 20 个 ROI。要求填写 observation unit、experimental/statistical unit、组间推断的 n、confidence 和一句边界。 |
| Claim Boundary | 不得机械宣称“统计单位永远是患者”。若问题、随机化和 estimand 在其他层级，单位可不同；依赖结构仍需设计一致的模型处理。 |
| Reviewer View | 要求作者明确独立采样/分配单位、嵌套/重复测量结构、每层样本数、模型如何处理单位内相关，以及结论指向哪一总体。 |
| Delayed + Far Transfer | Delayed：病理视野变式。Far transfer：用户真实项目中写出 exposure unit、measurement unit、inference unit。 |

### Rubric

独立通过必须同时满足：识别三层单位；`n` 与目标推断一致；指出单位内相关；结论不越界。只答“n=患者数”但不给研究问题/设计理由，不得满分。

### Reuse bindings

- worked：现有 `method_concept/statistical-unit`，只取其已核验核心概念作为素材，不直接复用旧“先判断”交互。
- independent/review：`judgment_card/jc-01` 可在完成基础讲解后使用。
- far_transfer：`judgment_card/jc-15` 或用户 Project case；第一阶段只绑定，不改写卡片。

## 🧫 Prototype 2 — Biological vs Technical Replicate

### Learning objectives

完成后用户应能：

1. 按独立生物来源与测量重复区分 biological replicate、technical replicate 和 repeated/nested measurement。
2. 解释技术重复改善什么、不能支持什么。
3. 在 organoid、qPCR、动物、患者和测序场景中避免只凭文件数或孔数分类。
4. 报告每一层级的样本数和分析处理方式。

### Progressive-disclosure content contract

| 教学职能 | 必须表达的内容 |
|---|---|
| 为什么重要 | 一个患者来源类器官铺 18 个孔，药物差异非常显著；能否推广到患者肿瘤？ |
| 一句话直觉 | 重复测同一个生物来源，能让“这次测得准不准”更清楚，却不会创造新的“生物个体世界”。 |
| 精确定义 | Biological replicate 是设计下独立采样或独立生成、用于估计生物变异的单位；technical replicate 是同一生物材料或单位的重复处理/测量，用于评估或降低测量误差。Repeated/nested measurements 必须保留其上层归属。 |
| 机制/结构 | 画 donor → organoid line → well → technical read 的层级；指出不同层的变化来源和可支持的推断不同。 |
| Worked Example | 3 个独立 donor-derived lines，每个 3 个孔。专家分别报告 donor n=3、每 donor 的技术/嵌套孔数，并选择聚合或层级模型；不能写 n=9 donors。 |
| Common Misconception | “孔是分别培养的，所以都是生物重复”看似合理，因为孔可产生差异；但它们仍共享 donor/line，独立性取决于生物来源、分配和目标推断，而不只是物理容器。 |
| Guided Practice | 给出 qPCR：4 位患者，每人 3 个孔。分层 hints 依次问生物来源、重复测量目的、组别在哪一层变化。 |
| Independent Practice | 锁定题：1 个 organoid line、18 孔/条件；要求分类重复、给出可支持的最大结论和下一步设计。 |
| Claim Boundary | biological/technical 是设计与 estimand 相关的角色，不是文件类型标签；独立培养批次、克隆、动物、患者是否构成生物重复需结合采样和分配判断。 |
| Reviewer View | 方法与图注明确每层 n；说明随机化/独立生成、技术重复如何汇总或建模，以及推广对象是否超过独立生物来源。 |
| Delayed + Far Transfer | Delayed：qPCR 孔变式。Far transfer：切片视野、测序 lane 或空间 spot 的层级分类。 |

### Rubric

独立通过要求：正确识别独立生物来源；明确技术重复的精度作用；拒绝用技术重复替代生物 n；给出与目标总体相称的结论。仅背诵定义、无法在层级图中分类，不得通过。

### Reuse bindings

- worked：`method_concept/biological-replicate`。
- independent：`judgment_card/jc-19`。
- review/far_transfer：现有 Problem Card `pa-bio-tech-rep` 的合适 training case；不得整张卡在所有角色重复使用。

## 🧬 Prototype 3 — Pseudoreplication

### Learning objectives

完成后用户应能：

1. 识别 nominal observations 多于独立单位的伪重复风险。
2. 解释忽略聚类为何会低估不确定性并制造过度信心。
3. 在单细胞、空间、成像、类器官和重复测量中提出设计一致的修复方向。
4. 区分“观察很多”与“独立重复很多”，并限定可报告的结论。

### Progressive-disclosure content contract

| 教学职能 | 必须表达的内容 |
|---|---|
| 为什么重要 | 2 只小鼠/组，每只 20 个视野；把 40 个视野当 40 只小鼠可能得到极小 P 值，但设计并没有提供 40 个独立动物。 |
| 一句话直觉 | 伪重复是“数据表看起来人多，实际上很多行来自同一家人”。 |
| 精确定义 | Pseudoreplication 是把非独立的子样本、重复测量或嵌套观测当作独立复制来分析或报告，使名义样本量超过设计提供的独立单位。 |
| 机制/结构 | 同一上层单位内观测相关；若模型假定独立，标准误/自由度通常过于乐观，错误发现和结论强度可能被夸大。避免绝对声称每个方法必然同幅度偏差。 |
| Worked Example | 3 对 3 患者、每人几千细胞。专家识别患者层组别、检查批次、比较 cell-level 与 patient-aware 分析，并把“伪批量”说明为可辩护方案之一，而非唯一方案。 |
| Common Misconception | “只要校正批次或细胞数够多就没问题”看似合理，因为算法处理了部分异质性；但 batch correction 不会自动创造独立患者，也不能修复完全混杂。 |
| Guided Practice | 单细胞场景，hints 依次要求画嵌套层级、找组别变化层、判断 cell-level 检验假定、列出可辩护替代方案。 |
| Independent Practice | 锁定陌生成像题：5 名患者、每人多张切片和 ROI；识别伪重复、预测偏差方向、提出分析/报告修订、confidence。 |
| Claim Boundary | 修复依赖 estimand 和设计：单位级聚合/pseudobulk、hierarchical/mixed models、GEE/cluster-robust approaches 或设计层增加独立样本均可能适用；不得把任一方法写成通用唯一答案。 |
| Reviewer View | 明确独立单位、组内相关、批次与组别重叠、每层 n、敏感性分析，并把机制/临床泛化限制在设计支持范围内。 |
| Delayed + Far Transfer | Delayed：病理 ROI 变式。Far transfer：空间 spot、类器官孔或用户项目中的嵌套表。 |

### Rubric

独立通过要求：找出依赖来源；指出名义 n 与独立 n 的区别；解释不确定性为何失真；提出至少一种与设计匹配的修复并限定结论。只说“用 pseudobulk”但未说明单位/estimand，不得通过。

### Reuse bindings

- worked：`method_concept/pseudoreplication`。
- guided：Problem Card `pa-pseudorep` 的 quick 或 missing-info case，经 binding 提供 hints。
- independent：`judgment_card/jc-01` 或 `pa-pseudorep-case-boundary`，只能选择一个作为首次独立题。
- review：另一未见变式。
- far_transfer：`judgment_card/jc-15`、`jc-25` 或 Project case，仅在 `transferable` 合法。

## 👋 Five-minute onboarding prototype

Onboarding 复用 `lu-statistical-unit-v1` 的真实 blocks/events/state，不建一套假的 tutorial 状态。

### Flow

1. **真实问题（30 秒）**：展示“3 位患者，每人 2,000 个细胞；这里的 n 是 6,000 吗？”不要求先考试。
2. **一句话直觉（45 秒）**：解释独立机会与数据行的区别，允许查看嵌套小图。
3. **弄明白（90 秒）**：用三张简短卡区分 measurement、experimental、statistical unit。
4. **Worked Example（60 秒）**：逐步演示专家提问：研究结论关于谁？组别/干预给谁？哪些观测共享来源？
5. **Guided check（60 秒）**：4 只小鼠 × 10 视野，分层 hint 可用。
6. **可选 independent（45 秒）**：用户可立即锁定一道短题，或选择“稍后继续”；未做不记零能力。
7. **收束（15 秒）**：显示两轴：“已完成基础讲解 / 独立能力尚未评估或已有一次证据”，进入 Today。

主按钮：“开始学习”。次级按钮：“我已熟悉，直接挑战”。取消旧的强制 baseline blind test，不讲侧栏、按钮或功能清单。

### Onboarding acceptance

- 正常路径先讲后练，5 分钟内完成核心 mental model。
- 跳过不写学习事件；完成产生真实 instruction block events。
- Challenge pass 只更新 competence，不写 instruction completion。
- 退出/重开精确恢复到 block，不重复写 event。
- 键盘、focus restore、reduced motion、1080×700 保持现有质量标准，但前台验证须另行获用户许可。

## 🔬 Scientific changeset requirement

OpenCode 只把本文件中的合同结构化，不自行补充新论断。`SCIENTIFIC_CHANGESET.md` 对每个新增/改写 claim 记录：Concept、Claim、Answer/rubric、Evidence、PMID/DOI、Risk、verification status。三个 unit 的统计推断、答案和 reviewer boundary 均为 HIGH；Codex gate 前全部 pending。
