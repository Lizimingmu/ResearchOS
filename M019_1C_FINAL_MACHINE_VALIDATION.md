# M019.1c Final Machine Validation

日期：2026-09-23。结论：**PASS after scoped regression and targeted item repairs**。

- Repository：`Lizimingmu/ResearchOS`
- Branch：`gpt/m019.1c-single-best-validity`
- Baseline：`bc708408b67f08d86b95d9b36ebf20aab1037362`
- 请求验收的原 HEAD：`a78d5ef9f43f7b9c36de64b1f646e50a9c325005`
- **Final validated source commit：`70e88bf540e783961c03230a5f3df547faf65708`**
- 修复提交消息：`fix(m019.1c): validate assessment validity repair`

原 HEAD 未直接通过验收。受验代码固定在上述修复提交；随后仅提交 packet/provenance、审计制品和本报告，未再改变 `src`、`data` 或 `package.json`。最终交付 HEAD 的完整 SHA 随交付消息提供；包含本报告的提交可用 `git log -1 --format=%H -- M019_1C_FINAL_MACHINE_VALIDATION.md` 精确定位。

用户明确授权“允许最小单题修复，并绑定实际新源提交”，因此 strict-blind source commit 已从原要求的 `886a1462128adb83d850c70efd8aeb799bb5bf0c` 改为真实修复源提交 `70e88bf540e783961c03230a5f3df547faf65708`，没有把修改后的内容冒充旧提交快照。

## 1. 实现范围

Baseline → final source 的变更限定在 assessment 逐题 key、21 题定向修复、v2/v3 重建、pedagogical bindings、schema 9→10 migration、审计/测试及其报告。没有新课程、新产品功能、activation 或 M021。

确认：Guide 科学正文、Concept/Method 非 assessment 教学正文、Case、Protocol 均未改写；Learning Kernel 和 M020 knowledge service/domain 架构未修改。Concept/Method builder 的变化仅服务于历史版本重建和教学版本输出。

`curriculumClaims` 的既有概念边界固定读取可重建的 v2 来源，避免 assessment 选项措辞修复间接改写 canonical claim；其最终 payload 与基线仍完全一致。

## 2. 全部机器检查

| 实际执行 | 结果 |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | **211/211 PASS**，0 failed、0 skipped |
| DOM 工作流（包含在 npm test） | **1/1 PASS** |
| 原有 M020.1 regression tests | 全部 PASS |
| `npm run audit:assessment-materialization` | PASS，183/183 |
| `npm run audit:assessment-ambiguity` | PASS，CLEAR 183、AMBIGUOUS 0、AUTHOR_DEPENDENT 0 |
| `npm run audit:single-best-key-validity` | PASS，现行单选 108；manifest 109 entries |
| `npm run audit:generated-lifecycle` | PASS，662 generated records，active/verified 0 |
| `npm run audit:knowledge` | PASS |
| 七项 knowledge audit 单独执行 | schema、dependency、supersession、freshness、learning_binding、update_impact、activation_safety 均 PASS，0 errors |
| `npm run audit:privacy` | **4/4 PASS** |
| `git diff --check` 及 baseline → final diff check | PASS |
| `npm run audit:strict-blind-packet` | PASS，183 items、0 metadata leaks |
| `npm run audit:strict-blind-binding` | PASS，183/183、0 mismatches |
| Agent handoff validation | PASS |

七项分组分别使用 `node scripts/run-knowledge-audit.mjs <group>` 执行。Full suite 同时通过 M018 registry（297 entries / 9 assets）、localization（11 checks）和 production startup smoke。Knowledge audit 的 13 条 Studio 来源缺口提示仍保留；不将其当作科学核验。

## 3. Inventory 与逐题 key

| 指标 | 结果 |
| --- | ---: |
| 总 assessment | **183** |
| 冻结的 external-review flagged logical IDs | **74** |
| 当前 v3 | **74** |
| 当前 v2 | **109** |
| single-best key manifest | **109 entries** |
| 21 个定向修复条目 | **21** |
| 当前实际单选题 | **108** |

109 是 manifest 的条目数，不是现行单选数量：106 题使用四类常规 single-best contract，另外 2 题为只选一项的 integrated judgment，均有一致 manifest；剩余 power apply 条目保留原裁决记录，该题现在是多项 integrated judgment，不读取该单选 key。

验收修复了两道 integrated judgment 的审计漏检：triangulation remediation、evidence-redundancy apply 的现行题答案原本已为 `decision`，但 manifest 仍是旧 `change_mind`。现已同步 manifest 并让构建、审计和测试覆盖所有实际单选题；未为迎合 reviewer 而改变两题现行答案。

全部现行单选均有显式 entry，materialized expected answer 与 entry 一致，expectedOptionIds 恰好一个且指向唯一存在的 option；证据行和片段可解析；v3 有逐题 rationale/adjudication trace。

| Task contract | 实际出现的 semantic expectedActionKey |
| --- | --- |
| classification | `boundary`, `decision` |
| error_localization | `boundary`, `decision`, `key_check` |
| claim_rewrite | `boundary`, `decision` |
| choose_next_evidence | `change_mind`, `key_check` |

四类均至少两种，**当前 taskContract → fixed slot 关系已消失**。旧 fixed-slot 函数仅用于精确重建历史 v2；现行路径缺 manifest 会报错，没有 contract-name 回退答案。

## 4. 21 项具名源题复核

以下检查直接使用具名 staged source、材料、选项、key 和裁决记录，检查 prompt/contract、必要动作、竞争选项和主张强度；没有读取匿名 packet 进行作答。

| # | 题目 | 复核结果与本轮处理 |
| --- | --- | --- |
| 1 | research-question apply | PASS：目标问题、时间对齐、解释边界分开；未强制尚未发生的重定义 contingency。 |
| 2 | population-sample remediation | PASS：题干明确询问 12% 向全市外推的限制；与后续检查/补充证据区分。 |
| 3 | selection-bias apply | PASS after repair：进一步去除边界选项未经材料确立的碰撞结构判断；保留选择机制不确定性。 |
| 4 | effect-size remediation | PASS after repair：完整选项同时给出评价尺度、集群区间层级及点估计界值，消除“尺度”与“实施意义”两种答题焦点的竞争。 |
| 5 | confidence-interval review | PASS：完整判断须同时覆盖区间、采用界值和伤害界值；较短边界选项只完成其中一部分。 |
| 6 | power apply | PASS：规划、事件数核查和结果解释分别对应当前材料，不再选未来 change-mind 条件。 |
| 7 | censoring apply | PASS after repair：删除“不能统一右删失”这一正确分类动作的否定复述，只保留类型编码和延迟进入风险集两项。 |
| 8 | censoring remediation | PASS：方法选择与保留区间端点为互补动作；中点/确诊日替代无材料支持。 |
| 9 | time-origin apply | PASS：对齐动作与 immortal-time 解释边界分离，原重复对齐项已移除。 |
| 10 | batch-effect review | PASS：当前是否建立稳定疾病效应与后续分析建议明确区分。 |
| 11 | pseudobulk apply | PASS：聚合条件、配对设计及独立样本层级对应材料；取消配对不再被列为当前必要动作。 |
| 12 | triangulation remediation | PASS：评价现有互补组合；本轮修复 manifest 与现行题不一致。 |
| 13 | evidence-redundancy apply | PASS：区分三类现有证据的信息角色；本轮修复 manifest 与现行题不一致。 |
| 14 | negative-result apply | PASS：依据区间、重要效应和等效界值判断当前结果；“不显著即无效”不成立。 |
| 15 | negative-result remediation | PASS：区分给定非劣与等效界值，不将二者等同。 |
| 16 | negative-result review | PASS：按给定敏感度差方向和预设界值判断，不把未来优效条件作为当前必要答案。 |
| 17 | differential-analysis remediation | PASS：检查同时覆盖供体映射和矩阵秩，两种根本缺陷均纳入。 |
| 18 | restricted-cubic-spline review | PASS after repair：“确认运输性”收窄为限定范围内预测表现的支持，不由汇总指标宣称普遍运输性。 |
| 19 | roc-auc remediation | PASS：在给定队列和阈值下比较区分、校准、净获益，未把同 AUC 当作同等可用。 |
| 20 | roc-auc review | PASS：完整结论同时覆盖社区迁移表现与阈值可用性，较短边界项不完整。 |
| 21 | cellchat-communication review | PASS：证据核查与有界结论互补，空间/蛋白支持未升级为机制证明。 |

另为这 21 题逐项列出明确 evidence fact indices，修复继承旧 semantic slot 后的证据行错配。例如 ROC-AUC remediation 现覆盖校准和净获益，CI review 覆盖两个界值，differential-analysis remediation 覆盖供体映射与矩阵共线。没有新增或改写 stimulus 科学事实。

判据参考：[FDA non-inferiority guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/non-inferiority-clinical-trials)、[BMJ 关于区间估计的原始方法文章](https://www.bmj.com/content/292/6522/746)、[CellChat 原始论文](https://www.nature.com/articles/s41467-021-21246-9)。这些参考用于核对解释边界，没有据此升级任何 content verification status。

本表是有界的具名源题复核，不是 external strict-blind review；机器 ambiguity PASS 也不等同于已经证明真实学习者无歧义。下一轮盲评仍交独立 reviewer。

## 5. Canonical science 与历史版本

从 `bc70840` 实际 Git 源码另行构建基线，独立比较序列化对象，而非仅让新版 helper 与自身比较：

| 集合 | 数量 | 与 bc70840 byte-equivalent |
| --- | ---: | --- |
| KnowledgeUnit | 406 | PASS |
| EvidenceSource | 85 | PASS |
| EvidenceClaim | 460 | PASS |

没有新 canonical scientific revision。全部历史 v2 可从 legacy builder 重建为基线原对象；109 个当前未升级 v2 同样与原 assessment 完全一致。Concept/Method 去除 assessment 与版本字段后逐对象相等。

Learning bindings：**688 → 808**，原 688 条精确前缀及顺序不变，追加 74 个 assessment 和 46 个 lesson bindings；每条新增绑定均非 legacyActive。Unresolved = 0，dangling = 0。**Scientific activation 新增 0**。

集合指纹、逐项比较结果与检查记录见 `artifacts/m019-1c-independent-validation.json`。原 M020 基线固定指纹测试也继续通过。

## 6. Schema 9 → 10 migration

PASS：learningEvents、reviewLogs、assessmentHistory、learner competence 原样保留，不回算、不回填当前知识绑定。旧 exact id/revision/hash 可解析，新 v3 正确追加，JSON 持久化后重载幂等，输入对象不被修改。

额外以真实基线 service 创建已应用知识修订再重载，验证旧 candidates、unit/source/claim revisions、ledger 和旧 holds 不被重写；新版 pedagogical bindings 继承原知识维护 hold。新增只涉及维护记录，不涉及历史学习记录。

Malformed workspace、篡改 payload、缺失既有 ledger/holds 均 fail closed。迁移在追加新版绑定前先审计旧历史，没有用新增 hold 掩盖旧记录缺失。

## 7. 本轮最小修复清单

1. Flagged ID Set 的字面量类型导致 typecheck TS2345；修复为接受 string 查询的 Set。
2. 将新 pedagogical bindings 从旧序列中间移动到尾部，保持旧前缀。
3. 修复 schema 9 既有维护更新对 v3 的 hold 继承，以及旧 M020 兼容迁移接续。
4. 修复 materialization audit 的 v3 contentVersion 和附加 adjudication 识别；恢复 v3 distractor 原有 why/when/here/consequence 反馈，不删除审计要求；正确选项反馈带入具体选项，避免共享证据行时反馈退化成重复文本。
5. 上述 21 题内的四处措辞/冗余修复、逐题 evidence mapping，以及两条 manifest 的同步；现行答案没有按 contract 名称或 reviewer 偏好机械改写。
6. 固定 canonical claim 来源，保持科学 payload 字节稳定。
7. 更新历史测试的版本预期；旧 M020 fixture 的 hold 筛选从仅 assetId 收紧到 exact revision/hash，避免把新版 lesson hold 混入旧版夹具。保留其全部历史与篡改断言。
8. 删除原报告一处尾随空格；重新生成 deterministic artifacts。

## 8. Strict-blind provenance

Packet：`artifacts/m019-1-strict-blind-assessment-packet.json`。

- Source assessment commit：`70e88bf540e783961c03230a5f3df547faf65708`
- Staged snapshot hash：`6d1992819d5a4478598c03e989427f73d02dae78a8d66e5ce9b88e6a46aa69b1`
- Packet hash：`dc4ad6a03724a1c826d7e7c4e455f1acb4918437e39f54b2bf62489db32e1bde`
- Binding：**183/183 PASS**；mismatches **0**。
- Metadata leaks：**0**；adjacent `m019-1-strict-blind-answer-key.json` 不存在。
- 连续两次生成的完整文件 SHA256 一致：`71438ae040395ef124f6a6eb12241cf82c769aa5a89e5435b3e29564cba700e6`。
- Snapshot hash、packet payload hash 均由当前 staged source 确定性复算并与保存值一致；受验源提交以后 `src`、`data`、`package.json` 无变更。

未执行 blind solve，未查看匿名 packet 后自行评价答案，未调用 external blind reviewer。

## 9. Workspace 与交付

Workspace clean：**是**。提交完成后 `git status --porcelain` 为空；指定分支已推送，HEAD 与同名远端一致。Localization 的运行时间戳噪声已恢复，忽略目录中的构建产物和本地日志未纳入提交。

验收结束，停止；不继续开发或自行盲评。
