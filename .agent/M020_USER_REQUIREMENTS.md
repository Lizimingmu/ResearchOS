继续开发 `ResearchOS`。

# M020 — Extensible & Updatable Knowledge Architecture

## 产品目标

ResearchOS 不能是一套写死的 2026 年课程。

我要它成为一个长期可维护的科研学习系统，满足：

1. 新知识可以按统一模板加入；
2. 旧知识可以更新、替代、废弃；
3. 所有版本和历史学习记录可追溯；
4. 新 evidence 能定位影响哪些知识、课程、题目、Case、Protocol；
5. AI 可以生成 update candidate，但不能自动把科学内容发布为正式课程；
6. 不同科研领域以后都能复用同一个 Learning Kernel。

核心原则：

> Scientific knowledge is canonical.
> Guide / Lesson / Assessment / Case / Protocol are pedagogical projections.

---

# 1. 不重构已有 Learning Kernel

保留：

* Learning Kernel
* Today / Review
* competence state
* Guide
* Concept / Method Lesson
* Case Lab
* Studio
* Content Studio
* Source ingestion
* provenance / pending_review
* revision/hash
* personal overlay

本轮重点是**统一已有能力**，不要重新发明整套系统。

禁止大规模重写现有课程。

---

# 2. 建立 Universal Knowledge Unit

新增统一 canonical knowledge contract。

建议核心结构：

```ts
KnowledgeUnit {
  id
  revision
  title
  aliases
  domain
  knowledgeType

  scientificQuestion
  whyItMatters
  intuition
  preciseExplanation

  inputs
  outputs
  assumptions
  workflowOrLogic

  boundaries
  misconceptions
  failureModes
  alternativeExplanations

  evidenceLinks
  prerequisiteIds
  downstreamIds

  freshnessClass
  knowledgeStatus
  validFrom
  validUntil?
  lastReviewedAt
  nextReviewAt?
  supersedes[]
  supersededBy[]

  lifecycle
  verificationStatus
  contentOrigin
  hash
}
```

通用骨架约占 70%。

不同 knowledge type 再增加 type-specific fields。

至少支持：

* `concept`
* `method`
* `protocol`
* `guideline`
* `research_pattern`
* `experimental_technique`

---

# 3. Type-specific contracts

## Method

增加：

* algorithm/statistical logic
* parameters
* diagnostics
* appropriateWhen
* inappropriateWhen
* commonMisuse
* reviewerChecks
* paperAppearance

## Protocol / Experimental Technique

增加：

* signalOrigin
* experimentalUnit
* biologicalReplicate
* technicalReplicate
* controls
* workflowLogic
* criticalVariables
* QC checkpoints
* failureModes
* troubleshooting
* quantification
* statisticalUnit
* allowedClaims
* forbiddenClaims

必须兼容现有 WB / qPCR / IHC / flow / PDO staging 内容。

## Guideline

增加：

* issuingOrganization
* version
* effectiveDate
* supersededVersion
* recommendationScope

---

# 4. Freshness / lifecycle

建立正式知识状态：

```text
CURRENT
UPDATE_AVAILABLE
REVIEW_REQUIRED
SUPERSEDED
DEPRECATED
EMERGING
```

另外建立：

```text
FOUNDATIONAL_STABLE
EVOLVING_PRACTICE
VERSION_SENSITIVE
GUIDELINE_TRIGGERED
```

示例：

* CI / statistical unit → FOUNDATIONAL_STABLE
* CellChat / spatial / scRNA best practice → EVOLVING_PRACTICE
* Seurat / Scanpy API → VERSION_SENSITIVE
* AJCC / WHO / NCCN → GUIDELINE_TRIGGERED

不要机械要求所有内容每年 review。

---

# 5. Evidence → Knowledge → Learning Dependency Graph

统一建立 dependency graph：

```text
EvidenceSource
   ↓
EvidenceClaim
   ↓
KnowledgeUnit
   ↓
Guide
Concept / Method Lesson
Protocol Lesson
Assessment
Case Lab
Studio Task
```

任何 source / claim 更新后，系统必须能够计算：

```text
affectedKnowledge
affectedLessons
affectedAssessments
affectedCases
affectedProtocols
```

输出：

`Impact Preview`

不得自动修改下游内容。

---

# 6. 更新机制

支持：

```text
NEW
UPDATE
EXTENSION
CONTRADICTION
DEPRECATION
SUPERSESSION
```

例如新 guideline 导入后：

```text
new evidence
↓
candidate knowledge change
↓
impact analysis
↓
affected learning content → REVIEW_REQUIRED
↓
candidate patches
↓
scientific review
↓
assessment / pedagogy revalidation if needed
↓
activation
```

任何变更禁止 silent overwrite。

旧 revision 永久保留。

历史 learning event 必须能解析当时使用的是哪个 revision。

---

# 7. Generic Knowledge Import

建立通用入口：

`Add Knowledge`

输入可以是：

* DOI / PMID / source metadata
* source pack
* Markdown
* JSON
* user-entered note

流程：

```text
Import
↓
identify type
↓
choose/create KnowledgeUnit
↓
extract candidate claims
↓
classify NEW / UPDATE / CONTRADICTION / etc.
↓
dependency impact
↓
pending_review
↓
scientific review
↓
optional pedagogical generation
```

AI-generated：

```text
contentOrigin = ai_generated
verificationStatus = pending
```

永远不能自行 verified。

---

# 8. Generic templates

Content Studio 中增加：

`New Knowledge From Template`

模板至少：

* Concept
* Method
* Protocol
* Guideline
* Research Pattern

允许：

* create
* duplicate
* revise
* supersede
* deprecate
* restore
* compare revisions

不要要求用户手写 schema。

UI 以中文表单呈现。

---

# 9. Pedagogical Projection

KnowledgeUnit 本身不直接等于课程。

提供：

```text
Generate Candidate Learning Assets
```

可生成候选：

* Guide section
* Concept Lesson
* Method Lesson
* Protocol Lesson
* Apply
* Remediation
* Delayed Review
* Case

但是：

> 生成后全部 pending_review。

不得自动进入 Today / Review / competence scoring。

若 KnowledgeUnit 更新：

* 不自动改课程；
* 只生成 patch proposal + diff + impact。

---

# 10. Update Center

增加一个简洁的：

`Knowledge Maintenance`

至少显示：

### Updates

哪些 knowledge 有新 evidence / source version。

### Review Required

哪些下游内容受影响。

### Superseded

哪些内容已经过时。

### Emerging

哪些内容值得关注但证据不足。

### Conflicts

个人 overlay 与新 base revision 冲突。

不要做复杂 dashboard。

---

# 11. 版本与 provenance

每个正式 knowledge revision 必须保存：

* revision
* hash
* evidence links
* reviewer
* verification scope
* createdAt
* reviewedAt
* supersedes revision
* change reason

课程资产必须记录：

```text
knowledgeUnitIds
knowledgeRevisionBindings
```

这样以后可以回答：

> “这节课是基于哪个版本的知识生成的？”

---

# 12. 迁移已有内容

不要人工全部重写。

先建立 adapter / migration。

至少把现有：

* Concept
* Method
* Protocol staging

映射进入 KnowledgeUnit framework。

要求：

* stable IDs 保留；
* provenance 保留；
* revision/history 不丢；
* pending 状态不提升；
* 现有 lesson 行为不变。

如果字段无法确定：

```text
migrationStatus = REVIEW_REQUIRED
```

禁止猜。

---

# 13. Scientific safety

必须 fail-closed。

以下行为禁止：

* 新论文 → 自动替换正式知识
* AI → 自动 verified
* source metadata verified → claim 自动 verified
* knowledge update → assessment 自动继续 active
* deprecated knowledge → 删除历史记录

如果更新可能改变：

* scientific claim
* answer key
* claim boundary
* method recommendation

必须进入人工 / formal scientific review。

---

# 14. Deterministic audits

增加：

### knowledge-schema-audit

结构、ID、revision、hash、enum。

### knowledge-dependency-audit

断链、cycle、orphan。

### supersession-audit

supersedes / supersededBy 一致。

### freshness-audit

状态和 review policy 合法。

### learning-binding-audit

learning asset 引用的 knowledge revision 存在。

### update-impact-audit

source/claim 改变可以确定性定位下游内容。

### activation-safety-audit

pending / review_required 内容不得进入标准化 competence。

全部 fail-closed。

---

# 15. 验收案例

至少用 4 个真实场景验证架构：

### A. Stable concept

`Confidence Interval`

升级 source 不应无意义重写全部课程。

### B. Evolving method

`Pseudobulk`

增加新 benchmark → impact preview → candidate update。

### C. Protocol

`Western blot`

从现有 staging 导入统一 KnowledgeUnit。

### D. Versioned guideline

模拟 `Guideline v1 → v2`

v1 自动成为 superseded；
v2 pending review；
依赖 v1 的学习内容变成 REVIEW_REQUIRED；
历史学习记录仍引用 v1。

---

# 16. 本轮不要做

* 不引入 OpenMAIC
* 不引入 BioTorch
* 不做 Feynman Tutor
* 不扩充课程数量
* 不重写现有 288 Guide
* 不解决 M019 assessment 内容问题
* 不 activation
* 不自动联网持续爬文献
* 不做复杂 notification system

本轮只搭：

> **可扩展、可更新、可追溯的 Knowledge Architecture**

---

# 17. 输出

生成：

`M020_EXTENSIBLE_KNOWLEDGE_ARCHITECTURE_REPORT.md`

必须回答：

1. Universal Knowledge Unit 是否真正实现？
2. 哪些 knowledge types 已支持？
3. 新知识如何加入？
4. 旧知识如何更新/废弃？
5. 如何判断哪些课程受影响？
6. 历史 revision 是否可追溯？
7. Protocol staging 是否可迁移？
8. AI 是否仍无法自行 verified / active？
9. 当前还有哪些 architecture debt？
10. 下一步建议是什么？

运行：

* typecheck
* full tests
* migration tests
* all new deterministic audits
* privacy
* git diff --check

创建独立 branch：

`codex/m020-extensible-knowledge-architecture`

完成后 commit + push，停止。

不要自行继续 M021。
