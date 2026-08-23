# ResearchOS v0.9 — Codex 一次性交付主控文件

> **用途**：将本文件直接交给 Codex 作为最高优先级执行说明。  
> **目标**：一次性完成一个可长期使用、非“AI 聊天框套壳”、具有真实科研训练价值的 Windows 桌面软件 v0.9。  
> **项目代号**：ResearchOS  
> **产品定位**：Medical Research Training & AI Oversight Workspace  
> **主要用户**：医学科研人员，重点面向肿瘤学、临床研究、生物信息学、单细胞/空间组学/蛋白组/多组学等场景。  
> **核心要求**：今晚完成约 90% 的可用产品，而不是原型、Demo、网页草稿或 PRD。

---

# 0. 最高优先级执行原则

你是本项目的**产品负责人、资深桌面应用工程师、科研软件架构师、测试工程师和交付负责人**。

收到本文件后：

1. **不要只输出方案。**
2. **不要等待用户逐项确认。**
3. 先检查当前目录、已有文件和开发环境。
4. 如果已有旧版原型或 `index.html`，只把它当视觉/需求参考，**不要继续在单 HTML 页面上堆功能**。
5. 直接建立或重构为正式桌面应用工程。
6. 逐项实现。
7. 每完成一个核心模块就实际运行并检查。
8. 修复阻塞性问题。
9. 最后执行完整测试、构建和 Windows 打包。
10. 生成交付报告与后续清单。

除非遇到真正无法自动解决的外部依赖（例如缺少系统级编译环境且无法安装），否则**不得停下来询问用户“是否继续”**。

---

# 1. 产品真正要解决的问题

本软件不是通用 AI Tutor。

目标用户的核心问题是：

- 论文阅读量不足；
- 对所在领域的前沿研究版图缺乏系统认识；
- 对不同类型医学论文的常见研究范式缺乏 pattern recognition；
- 方法学、统计、生信知识零散；
- 能完成真实科研，但科研判断力尚未形成稳定闭环；
- 长期依赖 AI 后，容易出现：
  - AI 给出的分析计划看起来合理但无法判断是否严谨；
  - 不知道哪些结果能支持哪些结论；
  - 不知道哪些问题属于统计硬错误；
  - 不知道论文为什么要这样组织 Figure；
  - 不知道某种分析是标准流程、可选增强还是方法学风险；
  - 不知道如何管理 AI agent 的分析、代码和科研叙事。

因此，本软件的最终目标不是“让用户会更多知识点”，而是训练：

1. **Literature Landscape**
2. **Paper Pattern Recognition**
3. **Scientific Reasoning**
4. **Methods & Statistics**
5. **Omics Literacy**
6. **Scientific Storytelling**
7. **AI Oversight**

核心闭环：

> **看懂 → 自己判断 → 获得反馈 → 延迟复习 → 陌生案例迁移 → 应用于真实科研 → 学会监督 AI**

---

# 2. 产品硬性原则

以下原则属于不可违背的产品约束。

## 2.1 Human First → AI Second

**AI 不得先给答案。**

任何训练任务默认顺序：

1. 给真实材料或案例；
2. 用户先做判断；
3. 提交；
4. 锁定原始答案；
5. 再显示：
   - 标准解析；
   - AI senior review；
   - 用户遗漏；
   - 证据来源；
   - 可迁移知识点；
6. 将错误/薄弱点加入后续复习。

不得出现：

- 打开论文立即 AI Summary；
- “你好，我今天来教你科研”；
- 用户还没思考就展示答案；
- 用聊天替代学习流程。

---

## 2.2 Evidence-Locked Learning

**AI 不是知识来源。AI 只能是解释者、反馈者、挑战生成器和检索助手。**

每个正式知识点至少绑定：

- 标题；
- 类型；
- 来源名称；
- DOI / PMID / 官方 guideline URL 中至少一个；
- 来源类型；
- 核心证据说明；
- 验证状态；
- 最后验证时间。

知识来源分级：

### Tier A — Primary Research
真实 PubMed / DOI 可核验论文。

### Tier B — Authoritative Methods
例如：
- Nature Methods
- Genome Biology
- Bioinformatics
- Statistics in Medicine
- CONSORT
- STROBE
- TRIPOD
- REMARK
- PRISMA
- SAMPL
- 经典方法论文

### Tier C — Exemplary Papers
用于学习高水平论文结构：
- Nature
- Cell
- Science
- Cancer Cell
- Nature Medicine
- Nature Cancer
- JCO
- JAMA Oncology
- Lancet Oncology
- 等

### Tier D — User Projects
用户自己的真实科研项目、分析问题、Figure、论文和 AI 任务。

---

## 2.3 No Fake Learning

软件不得用以下指标代表“学会”：

- 看完页面；
- 点击完成；
- AI 对话次数；
- 阅读时长；
- 做过一次选择题。

Mastery 至少需要结合：

- 首次主动回答；
- 延迟 retrieval；
- 陌生案例迁移；
- 相似但不完全相同情境判断；
- 后续错误率；
- confidence calibration。

---

## 2.4 No Website Feeling

这是一个 **Windows Desktop App**，即使底层使用 WebView，也绝不能给人“打开一个网站”的感觉。

禁止：

- 浏览器式导航；
- SaaS 卡片墙；
- 大面积营销渐变；
- AI mascot；
- 首页大聊天框；
- “Hi, welcome back”；
- 浮夸圆角；
- 大量 emoji；
- 每个页面都是卡片拼接；
- 典型 ChatGPT clone 布局。

应借鉴的交互哲学：

- VS Code
- Zotero
- Obsidian
- Linear
- Things
- IDE / Research Workspace

核心体验：

- Activity Bar；
- 可调整宽度 sidebar；
- 主工作区；
- contextual inspector；
- command palette；
- keyboard-first；
- persistent workspace；
- 本地优先；
- PDF 是一等公民；
- AI 是上下文工具，不是产品主体。

---

# 3. 技术栈

优先采用：

- **Tauri 2**
- **React**
- **TypeScript**
- **Vite**
- **SQLite**
- **Rust/Tauri backend**
- **Zustand** 或等价轻量状态管理
- **PDF.js** 作为 PDF 阅读与定位基础
- 可使用 Radix primitives / shadcn 的底层组件，但必须重做样式，不能保留 SaaS 模板感
- 图表使用轻量库，确保桌面风格
- Markdown 渲染仅作为内容呈现，不作为整个软件框架

推荐工程结构：

```text
ResearchOS/
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ features/
│  │  ├─ today/
│  │  ├─ papers/
│  │  ├─ paper-lab/
│  │  ├─ methods/
│  │  ├─ review/
│  │  ├─ ai-audit/
│  │  ├─ frontier/
│  │  ├─ projects/
│  │  ├─ skills/
│  │  ├─ assessment/
│  │  └─ settings/
│  ├─ db/
│  ├─ services/
│  ├─ providers/
│  ├─ hooks/
│  ├─ lib/
│  └─ styles/
├─ src-tauri/
├─ data/
│  ├─ seed/
│  ├─ methods/
│  ├─ patterns/
│  ├─ audit_cases/
│  └─ judgment_cards/
├─ docs/
├─ scripts/
└─ tests/
```

---

# 4. Local-first 架构

用户数据默认保存在本机。

需要持久化：

- 学习记录；
- Paper library；
- PDF 路径；
- 笔记；
- 用户原始答案；
- AI feedback；
- Skill mastery；
- Review schedule；
- AI provider settings；
- Project Context；
- Learning queue；
- 收藏；
- blind assessments；
- 错题与薄弱点；
- Evidence metadata。

禁止：

- 必须登录才能使用；
- 必须联网才能打开；
- API 未配置就整个软件不可用。

必须实现：

> **无 AI API 时，核心训练仍然可用。**

---

# 5. AI Provider 设计

需要支持至少：

## OpenAI-compatible API

配置项：

- Provider Name
- Base URL
- API Key
- Model
- Temperature
- Max tokens

预置模板：

- OpenAI-compatible
- DeepSeek-compatible
- Ollama/local
- Custom

API key：

- 不得写入源码；
- 不得写入 git；
- 使用安全本地配置；
- UI 中默认遮挡。

AI 的使用范围：

- 解释用户错误；
- critique；
- 根据真实 evidence 生成新案例；
- comparison；
- transfer exercise；
- analysis plan audit；
- 论文结构解析辅助；
- context-aware Q&A。

AI 不得：

- 伪造 PMID；
- 伪造 DOI；
- 将未经证实的生成内容自动写入“Verified Knowledge”。

---

# 6. 主导航

左侧 Activity Bar 至少包括：

```text
Today
Library
Paper Lab
Method Lab
Review
AI Audit
Frontier
Projects
Skill Map
Assessment
Settings
```

图标应简洁、专业、单色。

---

# 7. Today — 每日训练驾驶舱

Today 不是 Dashboard。

它是**当天唯一推荐学习入口**。

建议布局：

```text
ResearchOS                                  Aug 24

TODAY

01  RETRIEVAL
    Statistical unit in single-cell studies
    ~5 min

────────────────────────────────────────────

02  PAPER
    Reconstruct the evidence chain
    ~15 min

────────────────────────────────────────────

03  METHOD
    External validation
    ~8 min

────────────────────────────────────────────

04  AI AUDIT
    Find flaws in an analysis plan
    ~10 min

────────────────────────────────────────────

05  TRANSFER
    Apply one principle to your project
    ~5 min

                         START SESSION →
```

默认总量：

**30–45 分钟。**

每个任务可以：

- Start
- Skip today
- Snooze
- Replace

但不能轻易“一键全部完成”。

---

# 8. Daily Learning Scheduler

推荐优先级：

```text
Priority =
0.35 × Weakness
+ 0.30 × ProjectRelevance
+ 0.20 × FrontierValue
+ 0.15 × ReviewDue
```

允许后续调整权重。

至少考虑：

- 当前 mastery；
- 最近错误；
- 当前科研项目相关性；
- 是否到期复习；
- 最近是否重复出现；
- 是否为核心基础方法；
- 是否属于前沿高价值内容。

不得纯靠 LLM 随机生成每天课程。

---

# 9. Paper Library

支持：

- 拖入 PDF；
- 文件选择器导入；
- metadata 手工编辑；
- DOI；
- PMID；
- Journal；
- Year；
- Tags；
- Research Type；
- Topic；
- Read status；
- Training status；
- Favorite；
- Notes。

至少提供：

- 列表视图；
- 检索；
- 排序；
- tag filter；
- journal filter；
- year filter；
- research-type filter。

后续预留 Zotero integration，但 v0.9 不要求完整实现。

---

# 10. Paper Lab

这是核心模块之一。

必须是三栏或可调整 pane 布局：

```text
┌──────────────┬────────────────────────────┬────────────────────┐
│ PAPER        │ PDF / FIGURE               │ TRAINING           │
│ LIBRARY      │                            │                    │
│              │                            │ User judgment      │
│ collections  │                            │                    │
│ tags         │                            │ Submit             │
│ filters      │                            │                    │
│              │                            │ Senior review      │
└──────────────┴────────────────────────────┴────────────────────┘
```

支持以下训练模式。

---

## 10.1 Figure Prediction

流程：

1. 给 Abstract / Figure 1；
2. 问：
   - 核心 scientific question 是什么？
   - Figure 1 完成了什么证据任务？
   - 下一步最需要解决什么？
3. 用户提交；
4. 再显示下一 Figure；
5. 比较预测与真实论文结构。

训练目标：

> 形成 evidence-chain prediction 能力。

---

## 10.2 Paper Skeleton

让用户不看完整正文先重建：

```text
Figure 1 → ?
Figure 2 → ?
Figure 3 → ?
Figure 4 → ?
Figure 5 → ?
```

用户需要填写每个 Figure 在论文中的“功能”，而不是描述图形。

例如：

```text
F1 cohort + discovery
F2 phenotype
F3 cellular origin
F4 spatial validation
F5 functional validation
```

---

## 10.3 Evidence Ladder

给一个 claim。

要求判断证据等级：

```text
Expression
↓
Association
↓
Independent association
↓
Spatial colocalization
↓
Perturbation
↓
Functional phenotype
↓
Rescue
↓
In vivo
↓
Clinical validation
```

然后问：

> 作者目前最多可以声称什么？

必须训练 claim–evidence calibration。

---

## 10.4 Reviewer Attack

用户作为 Reviewer 2：

- 找 3 个 major concern；
- 找 2 个 minor concern；
- 判断：
  - Accept
  - Minor
  - Major
  - Reject

提交后才显示 Senior Review。

Senior Review 需要区分：

- 真正致命问题；
- 可补分析修复；
- 需要额外实验；
- 只是写作问题；
- 用户误判的问题；
- 用户遗漏的问题。

---

## 10.5 Figure Reconstruction

展示 Figure 或 panel。

先隐藏 legend。

问：

- 这张图最可能在证明什么？
- exposure / outcome 是什么？
- statistical unit 是什么？
- 横纵轴/颜色编码意味着什么？
- 哪个 conclusion 是允许的？
- 哪个 conclusion 过度？

然后再显示 legend / source。

---

## 10.6 Compare Papers

支持并列两篇论文。

比较：

- research question；
- novelty；
- cohort；
- design；
- sample size；
- omics depth；
- validation；
- causality；
- mechanism；
- generalizability；
- figure architecture；
- translational value；
- expected journal tier。

---

## 10.7 Why Is This Paper Good?

提供评分框架：

```text
Scientific question
Dataset
Methodological rigor
Biological novelty
Validation
Causal evidence
Narrative
Clinical relevance
```

重点问题：

- 哪个 Figure 真正提升了文章层级？
- 删除哪张 Figure 后 story 会断？
- 如果只有前 3 张 Figure，大概是什么层级？
- 哪一项是“技术漂亮但科学增量有限”？

---

# 11. Research Pattern Library

建立“论文范式库”。

v0.9 至少内置以下 pattern：

1. Retrospective clinical cohort
2. Prospective cohort
3. Prognostic factor study
4. Prediction model
5. Staging system development
6. Biomarker discovery + validation
7. Molecular subtype study
8. Bulk transcriptomics study
9. Proteomics subtype study
10. scRNA-seq atlas
11. scRNA-seq disease mechanism
12. Spatial transcriptomics study
13. Multi-omics integration
14. Functional validation study
15. Drug response / organoid study
16. Translational therapeutic study
17. Diagnostic model
18. External validation study

每个 pattern 至少包含：

- 常见 scientific question；
- 典型 evidence chain；
- 常见 Figure 顺序；
- 必须证据；
- 可选增强；
- 常见失败模式；
- 常见 reviewer attack；
- 常见过度 claim；
- 高水平文章通常增加什么。

---

# 12. Method Lab

不能做成百科全书。

每个 Method Bite 控制在：

**5–12 分钟。**

固定结构：

```text
Why it matters
Core concept
Minimal example
Common wrong practice
How reviewers attack it
When to use
When not to use
Transfer to real research
Sources
```

v0.9 至少内置 20 个高价值 Method Bites：

## Clinical / Statistics

1. Statistical unit
2. Biological replicate
3. Pseudoreplication
4. Confounding
5. Selection bias
6. Missing data
7. Multiple testing
8. Effect size vs P value
9. Confidence interval interpretation
10. Cox proportional hazards
11. Multivariable adjustment
12. Overfitting
13. Internal validation
14. External validation
15. C-index
16. Calibration
17. Decision curve
18. Interaction vs subgroup
19. Competing risks
20. Time-dependent bias

## Omics / Bioinformatics

至少额外加入：

21. scRNA cell-level DEG vs pseudobulk
22. Batch effect
23. Patient-level replication
24. Cluster annotation
25. Marker circularity
26. Double dipping
27. Pathway enrichment
28. GSEA vs ORA
29. Cell proportion testing
30. Differential abundance
31. Trajectory inference limits
32. Cell-cell communication limitations
33. Spatial colocalization ≠ mechanism
34. Multi-omics integration
35. Discovery vs validation
36. Data leakage
37. Feature selection leakage
38. Cross-validation misuse
39. Unsupervised clustering stability
40. Multiple candidate model selection

至少完成其中 **30 个**到可用状态；其余可作为 seed 草稿，但要标记状态，不能冒充 fully verified。

---

# 13. Research Judgment Cards

这不是普通 flashcard。

示例：

```text
Study:
3 patients/group
12,000 cells

Analysis:
Cell-level Wilcoxon DEG

Claim:
Gene X differs significantly, P < 0.001

Question:
What is the main inference problem?
```

回答后评价：

- 是否识别 statistical unit；
- 是否识别 pseudoreplication；
- 是否理解 P 值为何会虚假变小；
- 需要什么更合适方法；
- 允许什么结论。

v0.9 至少内置：

**30 张 Judgment Cards**

覆盖：

- survival；
- Cox；
- validation；
- single-cell；
- pathway；
- omics；
- prediction；
- clustering；
- biomarker；
- multi-omics；
- AI-generated analysis plan。

---

# 14. Spaced Repetition

不要自己重新发明调度算法。

优先接入成熟 FSRS TypeScript 实现；如果依赖集成阻塞，则 v0.9 实现兼容接口，并明确 TODO。

每个 review item 记录：

- difficulty；
- stability；
- retrievability；
- due；
- last review；
- lapses；
- response quality；
- confidence。

用户反馈不使用传统 Again/Hard/Good/Easy 作为唯一输入。

还应记录：

- Correctness
- Confidence

例如：

```text
Correct + high confidence
Correct + low confidence
Wrong + high confidence
Wrong + low confidence
```

尤其：

> **Wrong + high confidence**

应显著提高未来训练优先级。

---

# 15. AI Audit Lab

这是核心模块。

目的：

> 训练用户审核 AI，而不是向 AI 要答案。

提供真实科研任务。

例如：

```text
Task:
Compare subtype 2 vs subtype 1 in scRNA-seq.

AI plan:
1. Pool all cells
2. FindMarkers
3. Use P < 0.05
4. Run KEGG
5. Claim subtype-specific biology
```

用户逐条标：

- Approve
- Question
- Reject

并写原因。

提交后显示：

```text
Senior Audit

Correctly identified:
✓ pseudoreplication

Missed:
! patient-level confounding
! effect-size threshold
! multiple testing

Severity:
Major methodological issue
```

v0.9 至少内置：

**15 个 AI Audit Cases**

覆盖：

- survival analysis；
- Cox；
- model validation；
- scRNA DEG；
- cell proportions；
- spatial analysis；
- pathway enrichment；
- clustering；
- multi-omics；
- biomarker；
- organoid；
- causal language；
- figure narrative；
- literature citation；
- data leakage。

---

# 16. Project Context

用户可以建立真实科研项目。

字段：

- Project name
- Disease
- Study type
- Cohort
- Omics
- Outcome
- Current stage
- Main scientific question
- Current bottleneck
- Active methods
- Target journal
- Notes

系统使用 Project Context 做：

- 每日任务相关性；
- Method recommendation；
- Transfer exercise；
- AI Audit scenarios；
- Paper recommendation；
- skill weighting。

任何生成内容必须显式标：

> generated from project context

不能自动混入 Verified Knowledge。

---

# 17. Transfer

每次正式训练结束至少有一个问题：

> 这个原则如何影响你的真实项目？

允许：

- 绑定 Project；
- 写 1–3 句；
- 创建 Action；
- 创建“待验证问题”。

Transfer 不是可有可无。

它是 mastery 的一部分。

---

# 18. Skill Map

不要做游戏化技能树。

展示 7 个顶层能力：

```text
Literature Landscape
Paper Pattern Recognition
Scientific Reasoning
Methods & Statistics
Omics Literacy
Scientific Storytelling
AI Oversight
```

下钻为 subskills。

评分来源至少结合：

- 最近正确率；
- delayed retrieval；
- blind transfer；
- confidence calibration；
- difficulty；
- 样本量；
- 最近更新时间。

任何 skill score 必须显示：

- score；
- confidence / evidence amount；
- trend；
- recent weak concepts。

避免制造虚假的“78.3 分非常精确”。

---

# 19. Blind Assessment

每 30 天或用户主动触发。

给陌生论文/案例。

要求：

1. Identify scientific question
2. Identify design
3. Reconstruct evidence chain
4. Identify strongest evidence
5. Identify major weaknesses
6. Define maximal acceptable conclusion
7. Predict reviewer criticism
8. Audit proposed AI analysis

结果与上一次比较。

这才是真正的 longitudinal outcome。

---

# 20. Frontier 模块

v0.9 可以先完成基础框架，不必做完整自动文献雷达。

必须支持：

- Topic；
- subtopic；
- key questions；
- representative papers；
- emerging methods；
- unresolved questions；
- user familiarity。

视图建议：

```text
MTC
├─ RET biology
├─ resistance
├─ tumor microenvironment
├─ single-cell
├─ spatial
├─ prognostic stratification
└─ targeted therapy
```

每个节点可挂：

- Paper；
- Method；
- Note；
- Question；
- Project。

禁止纯 AI 生成后直接当成事实。

生成的 Frontier 内容必须显示：

> Unverified / Verified

---

# 21. Evidence Engine

v0.9 至少实现：

## PMID 验证

通过 PubMed E-utilities 或官方服务核验：

- PMID；
- title；
- journal；
- year；
- DOI（若有）；
- authors。

## DOI 验证

可调用 Crossref / PubMed metadata 等公开服务。

如果联网失败：

- 不阻塞；
- 标记 `verification_pending`。

禁止：

- AI 生成一个 PMID 后直接保存为 verified。

---

# 22. PDF

v0.9 要实现：

- 打开 PDF；
- page navigation；
- zoom；
- fit width；
- text selection；
- 保存当前页；
- 页面恢复；
- notes；
- training prompt 与 PDF 同屏。

如果 PDF parsing 很复杂：

> 优先保证阅读、定位、训练流程稳定。

不要为了 OCR、复杂全文解析拖垮交付。

PDF 全文智能解析应设计抽象接口，后续可接：

- GROBID
- PaperQA
- 其他 scientific RAG

---

# 23. Command Palette

快捷键：

```text
Ctrl+K
```

或：

```text
Ctrl+Shift+P
```

至少支持：

- Open paper
- Start today
- Add project
- Search methods
- Explain selected concept
- Challenge my interpretation
- Audit current analysis
- Create transfer exercise
- Find evidence
- Go to review

自由 AI 对话放在这里或 contextual panel。

不能放首页。

---

# 24. Keyboard-first

至少实现：

- Ctrl+K / Ctrl+Shift+P
- Ctrl+O 导入论文
- Ctrl+F 当前页面搜索
- Ctrl+, 设置
- Esc 关闭 overlay
- Arrow navigation
- Enter 提交/打开
- 适当支持 Tab navigation

---

# 25. UI 视觉规范

风格：

- Professional
- Dense but readable
- Research workstation
- Desktop-first
- Low distraction
- High information hierarchy

默认：

- 支持 Light / Dark；
- 深色模式不能纯黑；
- 文字清晰；
- 11–14 px 的辅助信息；
- 主要正文 14–16 px；
- 标题 18–24 px；
- Activity bar 窄；
- Sidebar 约 220–300 px；
- Inspector 约 300–400 px，可拖拽调整。

避免：

- 超大按钮；
- 营销风 hero；
- 夸张阴影；
- 高饱和渐变；
- 过量动画。

动画只用于：

- pane transition；
- progress；
- feedback；
- focus。

---

# 26. 数据模型

至少需要以下核心实体。

```text
Paper
PaperSource
PaperFigure
PaperNote

Project

MethodConcept
EvidenceSource
ResearchPattern

TrainingSession
TrainingTask
UserResponse
Feedback

JudgmentCard
AuditCase

ReviewItem
ReviewLog

Skill
SkillEvidence
SkillSnapshot

Assessment
AssessmentResult

AIProvider
AppSetting
```

---

## 26.1 UserResponse 必须保留原始答案

不能用户提交后被 AI feedback 覆盖。

至少保存：

```text
id
task_id
user_text
submitted_at
confidence
locked
```

---

## 26.2 Verified content 与 Generated content 分离

所有内容加：

```text
content_origin:
- verified_seed
- verified_external
- user
- ai_generated
```

以及：

```text
verification_status:
- verified
- pending
- rejected
- not_required
```

AI-generated 内容默认：

```text
verification_status = pending
```

---

# 27. Starter Content

这是今晚“能真正用”的关键。

不能只做空壳。

必须内置至少：

- 18 个 Research Patterns；
- 30 个 Method Bites；
- 30 个 Judgment Cards；
- 15 个 AI Audit Cases；
- 1 个 7-day starter learning track；
- 1 个 Blind Assessment 模板；
- 若干内置示例 papers metadata（只放公开 metadata，不打包有版权全文）。

内容优先围绕：

- Oncology
- Clinical research
- Survival analysis
- Prognostic models
- Single-cell
- Spatial omics
- Proteomics
- Multi-omics
- Biomarker studies
- Translational research

---

# 28. Starter Track — First 7 Days

## Day 1
- Statistical unit
- Biological replicate
- scRNA pseudoreplication
- AI Audit: cell-level DEG

## Day 2
- Research question vs analysis question
- Paper skeleton
- Evidence chain
- Claim boundary

## Day 3
- Cox model
- HR / CI / P-value relationship
- Multivariable adjustment
- AI Audit: survival model

## Day 4
- Discovery vs validation
- Internal vs external validation
- Overfitting
- Data leakage

## Day 5
- Molecular subtype paper pattern
- Clustering stability
- Pathway enrichment
- Figure narrative

## Day 6
- scRNA study pattern
- Annotation
- Cell proportion
- Cell-cell communication limitations

## Day 7
- Blind mini-review
- Review weak points
- Transfer to Project Context

---

# 29. Learning Session 交互

每个 session 保持：

```text
PREPARE
↓
ATTEMPT
↓
LOCK ANSWER
↓
FEEDBACK
↓
EVIDENCE
↓
TRANSFER
↓
REVIEW SCHEDULE
```

用户必须明显感觉自己是在“做训练”，不是“刷网页”。

---

# 30. Feedback 规范

禁止：

- “Great job!”
- “Amazing!”
- 过度鼓励；
- 空洞正反馈。

推荐：

```text
Correct:
You identified the statistical unit problem.

Missed:
You did not address patient-level confounding.

Severity:
Major.

Why:
Cell-level significance does not recover between-patient replication.

Transfer:
When reviewing subtype DEG, check whether inference is patient-level.
```

语气：

- clinical；
- precise；
- restrained；
- reviewer-like。

---

# 31. Settings

至少有：

## General
- Theme
- Start page
- Data location
- Daily target

## AI
- Provider
- Base URL
- API key
- Model
- Temperature
- Test connection

## Learning
- Daily duration
- Weakness weight
- Project relevance weight
- Frontier weight
- Review weight

## Evidence
- PubMed verification
- DOI verification
- offline mode

## Data
- Export backup
- Import backup
- reset demo data

---

# 32. Backup

v0.9 必须可以：

- Export backup；
- Import backup。

至少导出：

- SQLite DB；
- settings；
- custom seed content；
- notes；
- learning history；
- projects。

PDF 原文件可以只保存路径，不必全部复制。

---

# 33. 错误处理

必须处理：

- PDF 不存在；
- API key 错误；
- AI timeout；
- AI 返回空；
- PubMed offline；
- SQLite error；
- metadata 不完整；
- external URL failure。

所有错误：

- 不应导致白屏；
- 给明确、克制的信息；
- 提供 retry / continue offline。

---

# 34. 性能

目标：

- 冷启动合理；
- 页面切换无明显卡顿；
- PDF 打开可接受；
- 训练记录即时保存；
- AI 请求异步；
- 不阻塞 UI。

禁止一次启动就加载全部 PDF 或全部重型数据。

---

# 35. 测试要求

至少完成：

## Unit Tests

覆盖：

- scheduler；
- scoring；
- review；
- content verification state；
- DB CRUD；
- provider config。

## Component / Integration

覆盖：

- Today task generation；
- submit response → lock → feedback；
- review reschedule；
- paper import；
- settings save；
- project create；
- backup/export。

## Smoke Test

必须实际验证：

1. 启动；
2. Today；
3. 做一条训练；
4. 提交答案；
5. 查看 feedback；
6. 加入 review；
7. 导入 PDF；
8. 创建 project；
9. 配置 AI provider；
10. 没有 API 时继续正常学习；
11. 重启后数据仍存在。

---

# 36. Windows 打包

最终必须尝试：

- development run；
- production build；
- Tauri Windows bundle；
- 生成 `.exe` / installer。

如果 NSIS / MSI 均可：

优先提供用户最方便安装的格式。

最终报告写清：

- installer path；
- portable / exe path；
- version；
- build result；
- remaining blockers。

---

# 37. v0.9 允许暂缓的内容

以下可以有架构入口，但不是今晚阻塞项：

- Zotero 双向同步；
- GROBID Docker 全量解析；
- PaperQA2 深度 RAG；
- 自动下载全文；
- 全自动 frontier radar；
- citation graph；
- cloud sync；
- multi-user；
- mobile；
- collaboration；
- full agent orchestration；
- OCR；
- 文献管理器替代 Zotero；
- 完整 IDE；
- 自动跑生信 pipeline。

不要为了这些拖慢核心交付。

---

# 38. 明确禁止做的产品方向

任何时候发现自己在做下面内容，请立即纠偏：

## 禁止 1：ChatGPT Clone

错误：

```text
Ask ResearchOS anything...
```

占据主页。

---

## 禁止 2：Course Platform

错误：

```text
Course 1
Course 2
Progress 80%
```

本软件不是慕课平台。

---

## 禁止 3：Quiz App

不能主体变成：

> 选 A/B/C/D。

选择题只能偶尔辅助。

主体应是：

- reconstruction；
- critique；
- prediction；
- transfer；
- audit。

---

## 禁止 4：Knowledge Base

不能只做：

> 一堆 markdown 知识卡片。

核心是 deliberate practice。

---

## 禁止 5：漂亮空壳

如果 UI 很好看但：

- 没有 starter content；
- 没有 learning scheduler；
- 没有 review；
- 没有真实 evidence；
- 没有 AI Audit；

则视为未完成。

---

# 39. 完成定义 — Definition of Done

v0.9 只有满足以下内容才算“90% 完成”。

## Core App

- [ ] Tauri desktop app 可运行
- [ ] Windows 构建成功
- [ ] 本地 SQLite 工作
- [ ] 重启持久化
- [ ] Light/Dark
- [ ] Desktop-first navigation
- [ ] Command palette

## Learning

- [ ] Today
- [ ] Daily scheduler
- [ ] Paper Lab
- [ ] Method Lab
- [ ] Review
- [ ] AI Audit
- [ ] Project Context
- [ ] Skill Map
- [ ] Blind Assessment 基础流程
- [ ] Transfer

## Evidence

- [ ] 来源字段完整
- [ ] verified/generated 分离
- [ ] PubMed metadata verification 基础功能
- [ ] 网络失败不阻塞

## Content

- [ ] ≥18 Research Patterns
- [ ] ≥30 usable Method Bites
- [ ] ≥30 Judgment Cards
- [ ] ≥15 AI Audit cases
- [ ] 7-day starter track

## AI

- [ ] OpenAI-compatible provider
- [ ] 自定义 Base URL
- [ ] Model configurable
- [ ] API key 不进源码
- [ ] Test connection
- [ ] Offline fallback

## Reliability

- [ ] 无明显白屏
- [ ] 核心错误有 fallback
- [ ] Smoke test 完成
- [ ] build 完成
- [ ] installer / exe 产出

---

# 40. 最终自检

交付前，请逐条问自己：

1. 点开软件，会不会第一眼像网站？
2. 点开软件，会不会第一眼像 ChatGPT clone？
3. 如果完全不配置 AI，今天能不能完成一次真实学习？
4. 用户有没有被迫先思考再看答案？
5. 每条正式知识是否有 evidence provenance？
6. 用户做错以后，系统会不会在未来重新训练？
7. 用户“高置信度答错”是否被视为危险信号？
8. 学到的内容是否会要求迁移到真实科研？
9. 软件有没有真实 starter content，而不是空页面？
10. 数据重启后是否还在？
11. 是否可以直接导入 PDF？
12. 是否已经生成 Windows 可安装版本？

任一核心问题答案为“否”，优先修复后再交付。

---

# 41. 最终交付物

必须生成：

```text
README.md
docs/PRODUCT_SPEC.md
docs/ARCHITECTURE.md
docs/LEARNING_ENGINE.md
docs/CONTENT_PROVENANCE.md
docs/TEST_REPORT.md
docs/FINAL_HANDOFF.md
```

以及：

- 源码；
- lockfile；
- 数据库 schema；
- seed content；
- 测试；
- build；
- installer/exe。

---

# 42. FINAL_HANDOFF.md 格式

最终只写事实，不写宣传性语言。

```text
# ResearchOS v0.9 Final Handoff

## Build
Version:
Commit:
Build status:
Installer:
Executable:

## Implemented
- ...

## Starter Content
Research patterns:
Method bites:
Judgment cards:
AI audit cases:

## Tests
Unit:
Integration:
Smoke:

## Known Limitations
- ...

## Deferred v1.0
- ...

## How to Run
1.
2.
3.

## Data Location
...

## Backup
...

## AI Configuration
...
```

---

# 43. 执行顺序

不要花大量时间先写文档。

按照下面优先级执行：

### Phase 1 — Audit & Scaffold
- 检查目录
- 检查工具链
- 建正式 Tauri 工程
- DB schema
- app shell

### Phase 2 — Core Interaction
- Today
- Paper Library
- Paper Lab
- Method Lab
- Review
- AI Audit

### Phase 3 — Learning Engine
- scheduler
- skill evidence
- FSRS
- transfer
- assessment

### Phase 4 — Evidence
- metadata
- verification
- provenance

### Phase 5 — Starter Content
- patterns
- methods
- judgment cards
- audit cases
- starter week

### Phase 6 — Desktop Polish
- panes
- command palette
- keyboard shortcuts
- settings
- error states
- dark/light

### Phase 7 — Test
- unit
- integration
- smoke
- persistence

### Phase 8 — Package
- production build
- Windows bundle
- installer

### Phase 9 — Handoff
- 文档
- final report
- remaining limitations

---

# 44. 决策规则

当实现过程中需要自行权衡时，优先级固定为：

```text
Learning effectiveness
>
Scientific reliability
>
Data integrity
>
Core usability
>
Desktop UX
>
Performance
>
Visual polish
>
Optional features
```

如果时间不足：

> **宁可砍掉 Frontier 的高级功能，也不能砍 Review。**

> **宁可少一些动画，也不能少 Evidence provenance。**

> **宁可少一个页面，也不能让 AI 先给答案。**

> **宁可不做自动全文 RAG，也必须保证用户能导入 PDF、做训练、复习和迁移。**

---

# 45. 最后一条

本项目不是为了证明 AI 能“教人科研”。

而是为了建立一个系统，使研究者在持续使用 AI 的情况下仍然不断强化自己的：

- scientific judgment；
- pattern recognition；
- methodological rigor；
- evidence calibration；
- reviewer thinking；
- AI oversight。

最终成功标准不是：

> 用户和 AI 聊了多久。

而是：

> **面对陌生医学论文和陌生分析计划时，用户越来越能独立识别研究问题、证据链、方法学风险、结论边界和 AI 的错误。**

请从现在开始直接执行，不要仅返回开发建议。
