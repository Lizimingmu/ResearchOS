# ResearchOS 全局进度与系统状态审计报告

**报告版本**：v1.0（全系统只读审计版）  
**审计日期**：2026-09-23  
**执行角色**：方法学与系统状态审计员  
**目标代码库**：`D:\Agents\ResearchOS`  
**基线分支 / 当前 HEAD**：`gpt/m019.1c-single-best-validity` (HEAD commit: `5eb326263f689711fe6972280cb506f9218e2834`)  
**验证源码提交**：`70e88bf540e783961c03230a5f3df547faf65708`

---

## 1. Executive Summary

ResearchOS 目前正处于**工程架构完备、课程语料生成就绪，向严密科学评测与真实学习者验证跨越的关键转折期**。

### 核心阶段定性
- **底层与功能架构高度成熟**：基于 Tauri v2 + SQLite WAL 的本地优先离线 Windows 桌面平台、经历 10 次增量演进的确定性状态迁移体系（Schema 10）、支持“带教科研学徒”模式的学习内核（Learning Kernel Engine）以及包含 406 个单元、具备影响分析与维护 Hold 的通用动态知识架构（M020/M020.1）均已完成工程闭环，且全部后台自动化测试（211/211 PASS）与类型检查（TS 0 errors）均通过。
- **课程语料规模化生成，但处于 100% 科学冻结待审状态**：M019/M019.1 系列已生成覆盖科研设计全流程的 288 篇自救指南、61 门正规课程（183 道阶段化试题）、12 个分阶段案例与 13 个工作台模板。依照项目宪法与质量红线，这 374 项生成资产全部保持为 `pending_review` 状态（active=0, verified=0），严禁自动化批量激活。
- **评测与独立盲评流程遭遇治理中断**：M019.1c 完成了 183 题逐题 key manifest 与消除固定槽位偏离的工程修复；在随后的首次外部严格盲评中，独立评审员作答并冻结了 183 题（121 CLEAR, 62 AMBIGUOUS）。但冻结之后发生了未经明确授权的读取作者答案与解盲操作，造成当前会话环境的盲态污染；同时原始 Hash 规则存在文本描述不完整缺陷。因此，盲评认证尚未形成权威公认的外部闭环。
- **原生打包与前台体验仍待打通**：受宿主环境缺少 MSVC Linker 的限制，原生 Windows 安装包无法直接编译；自 v0.10 以来，前台真实图形渲染、无障碍与系统缩放一直处于未运行状态。

---

## 2. Current System State

### 2.1 Git 状态与版本基线
- **当前活跃分支**：`gpt/m019.1c-single-best-validity`
- **最新提交（Handoff & Packet 绑定）**：`5eb326263f689711fe6972280cb506f9218e2834` (`chore(m019.1c): bind validated packet and record final acceptance`)
- **受验源码提交**：`70e88bf540e783961c03230a5f3df547faf65708` (`fix(m019.1c): validate assessment validity repair`)
- **前序对比基线**：`bc708408b67f08d86b95d9b36ebf20aab1037362`（M020.1 canonical mapping completion）
- **发布版本标称**：`v0.12.0`（曾生成 `v0.12.0-rc1` 早期安装包，后序 M017–M020 重大重构均在开发分支后台完成，尚未打包进最新安装包）

### 2.2 数据模型与存储状态
- **持久化状态架构**：`CURRENT_STATE_SCHEMA = 10`（在 M019.1c 中完成向 schema 10 的增量迁移；SQLite `user_version = 2`）
- **知识库架构（M020/M020.1）**：
  - `KnowledgeUnit`：**406** 项（79 个核心契约单元 + 327 个自规范化 Guide/Method 快照）
  - `EvidenceSource`：**85** 项
  - `EvidenceClaim`：**460** 项
  - `KnowledgeLearningBinding`：**808** 项（M020.1 基线 688 项 + M019.1c 追加 74 个 assessment 与 46 个 lesson 教学绑定；0 dangling, 0 unresolved）
  - `Maintenance Holds`：支持在来源/主张/知识更新时向对应课程追加 `REVIEW_REQUIRED` 拦截。

### 2.3 资产与激活生命周期盘点
- **正式激活核心资产**：**9** 个已验证学习资产（M018.1 基线），**297** 个 registry entries；
- **M019 生成课程资产**：共 **374** 项（288 篇 Guide、40 个 Concept、21 个 Method、12 个 Case、13 个 Studio 模板），**100% 保持为 `ai_generated + pending + pending_review`**；
- **标准化能力影响**：生成资产均带有 `createsCompetence=false`，严禁在未获人类同行审批前向用户核发标准化科研能力等级。

---

## 3. Module-by-Module Progress

根据仓库真实目录结构与代码实现，将系统解构为以下 10 个核心模块：

### 3.1 核心系统基座与持久化存储 (Desktop Infrastructure & Persistence)
1. **目标是什么**：构建本地优先、离线可用的 Windows 桌面运行环境，基于 Tauri v2 + SQLite WAL 提供原子化存储、崩溃安全保障、状态多版本平滑迁移与 Windows Credential Manager 凭据安全隔离。
2. **已经完成什么**：实现了 Tauri 2 运行时配置、SQLite WAL 存储适配、Rust 安全路径网关（防止目录穿越与非法修改）、增量且零推断的 Schema 1→10 迁移逻辑、5 个循环恢复快照以及备份还原校验。
3. **当前证据是什么**：
   - `src-tauri/Cargo.toml`, `src-tauri/src/lib.rs` (83KB 健壮实现)；
   - `src/state/migrations.ts`（支持到 CURRENT_STATE_SCHEMA = 10）；
   - `tests-node/suite.mjs` 中的迁移回归测试、恢复快照测试与状态持久化断言。
4. **还缺什么**：宿主环境缺少 MSVC `link.exe`，导致生产环境打包中断；前台运行时的真实系统崩溃恢复与多开锁冲突未在桌面端人工实测。
5. **当前状态**：**Substantially complete**。

---

### 3.2 学习内核与练习调度引擎 (Learning Kernel & Practice Engine)
1. **目标是什么**：终结“初学者未学先考”的问题，实现带教学徒式的 `Learn → Explain → Apply` 核心闭环，配合锁定答案（Response Locking）、工作例题渐退、高信心错误观念追踪、到期陌生复习与远迁移能力投影。
2. **已经完成什么**：重构了 Learning Kernel 状态机；支持 Apply / Remediation / Review 三态分离；实现最高双学习线程的调度器（Foundation + Project Overlay）；建立从 unassessed 到 retained 的四级能力推定；杜绝无答题记录下的伪通过。
3. **当前证据是什么**：
   - `src/learning/learningKernelEngine.ts`, `src/learning/scheduler.ts`；
   - `src/domain/learningKernel.ts`, `src/domain/learningArchitecture.ts`；
   - `M018_1_END_TO_END_WIRING_HANDOFF.md` 记录的 18 项架构缺陷全部修复，测试套件通过。
4. **还缺什么**：学习者在真实多天跨度下的到期复习注意力留存与艾宾浩斯曲线真实体验反馈。
5. **当前状态**：**Completed**。

---

### 3.3 动态可扩展知识架构 (Universal Knowledge Architecture M020/M020.1)
1. **目标是什么**：确立“知识为纲，课程为投影”的架构，支持 6 类知识契约（Concept, Method, Protocol, Experimental Technique, Guideline, Research Pattern），通过证据引用链实现更新影响分析与自动维护挂起（Hold），让知识演进不破坏历史学习事实。
2. **已经完成什么**：设计并落地了全套知识契约、不可变修订机制、状态账本（ledger）；完成了 406 个 KnowledgeUnit、85 个来源与 460 条主张的迁移；实现了 808 条学习绑定的精确映射（0 unresolved, 0 dangling）；构建了 7 组确定性 knowledge audit 脚本。
3. **当前证据是什么**：
   - `src/domain/knowledge.ts`, `src/services/knowledge.ts`；
   - `src/data/knowledge.ts`, `M020_EXTENSIBLE_KNOWLEDGE_ARCHITECTURE_REPORT.md`, `M020_1_FINAL_VALIDATION.md`；
   - `npm run audit:knowledge`（7 项独立审计全 PASS）。
4. **还缺什么**：目前 406 个单元中有 327 个为无直接 lesson 对应的 self-canonical 迁移快照，需后续专业教研完善正文；自动文献抓取和监控尚未连通。
5. **当前状态**：**Completed**。

---

### 3.4 课程体系语料资产 (Curriculum Materialization & Assets)
1. **目标是什么**：为医学与生物统计学习者提供全套体系化的科研方法学教材与案例，覆盖自救指南、概念精讲、方法规约、分阶段案例研讨与项目迁移。
2. **已经完成什么**：实化了 288 篇 Self-Rescue Guide（10 大模块）、40 门 Concept Lessons、21 门 Method Lessons（共 61 课）、12 个 Case Labs（4–6 阶段决策时间线）与 13 个 Studio 模板，总计 374 项资产；全部通过字数、深度与去冗余审计。
3. **当前证据是什么**：
   - `src/data/curriculum/`, `src/data/self-rescue-guide/`；
   - `M019_CONTENT_INVENTORY.md`, `M019_1B_FINAL_CONTENT_PATCH_REPORT.md`；
   - `artifacts/curriculum-content-snapshot.json`（3.3MB 完整数据包）。
4. **还缺什么**：全部 374 项资产均处于 `pending_review`，未获人类同行专家审批；33 条 claim 仍为部分支持；尚未进行初学者真实试学。
5. **当前状态**：**Substantially complete**（工程实化完成，科学审批未开始）。

---

### 3.5 阶段化测评与题目效度工程 (Assessment Bank & Validity Engineering)
1. **目标是什么**：构建 183 道与 61 门课程深度绑定的阶段化题目，支持 7 类 task contracts，消除根据 contract 名称即可推断固定选项槽位的缺陷，保证单选唯一性与测量区分度。
2. **已经完成什么**：在 M019.1c 中建立了 109 题单选题显式 key manifest；对外部提示的 74 题升级为 v3；对 21 题进行了定向题面修复；通过了逐题材料实化与单选效度审计；生成了 183 项 strict-blind 匿名试题包（0 答案泄露）。
3. **当前证据是什么**：
   - `src/data/curriculum/assessment-validity-adjudication.ts`, `materialize-assessment.ts`；
   - `M019_1C_SINGLE_BEST_VALIDITY_REPAIR.md`, `M019_1C_FINAL_MACHINE_VALIDATION.md`；
   - `artifacts/m019-1-strict-blind-assessment-packet.json` (SHA256: `71438ae0...`)。
4. **还缺什么**：排序题（A069, A074, A075）在试题包中缺乏显式的顺序打分协议；题目是否具有真实的区分度尚未获得临床/统计真实学习者的大样本测试验证。
5. **当前状态**：**Substantially complete**。

---

### 3.6 独立外部盲评与流程治理 (External Strict-Blind Review & Governance)
1. **目标是什么**：在严格隔绝任何项目文件、源码、历史报告和作者答案的前提下，由独立评估员只读匿名试题包进行解题，评估题目的客观可解性与清晰度；冻结后方可在明确授权下进行解盲。
2. **已经完成什么**：独立评估员作答完成并成功冻结 183 题至 `reviews/M019_1C_FRESH_EXTERNAL_BLIND_FROZEN.json`（121 CLEAR, 62 AMBIGUOUS）；全面回溯了 Step 0–132 日志；对冻结后的越权解盲进行了深入复盘，纠偏报告已修订至 v3。
3. **当前证据是什么**：
   - `reviews/M019_1C_FRESH_EXTERNAL_BLIND_FROZEN.json` (SHA-256 payload 匹配 `711f6a87...`)；
   - `M019_1C_BLIND_REVIEW_PROCESS_CORRECTION.md`（v3 终版报告）；
   - `artifacts/m019-1c-fresh-blind-reveal-results.json`。
4. **还缺什么**：当前会话因解盲已接触答案，失去独立盲评资格；62 道 AMBIGUOUS 与 5 道 CLEAR 分歧题目未获教研仲裁；原始 Hash 规则描述不完整；尚未在隔离新会话中重新完成权威合规的盲评闭环。
5. **当前状态**：**Blocked**。

---

### 3.7 个人内容工作台与 Obsidian 生态 (Personal Content Studio & Obsidian)
1. **目标是什么**：为研究者提供个人专属的内容演进空间，支持基于版本化覆盖（overlays）维护私有卡片，并显式受控地单向同步到 Obsidian，支持有限双向批注往返，严防破坏本地知识库。
2. **已经完成什么**：实现了草稿/审核/发布/历史/冲突管理；配置了 Rust 原生路径网关（防止目录穿越、symlink 越界与 .obsidian 污染）；提供 20 篇以内的确认预览；支持 `_Review/<batch-id>` 批注往返生成 pending 草稿。
3. **当前证据是什么**：
   - `src/features/content-studio/`, `src/services/obsidianPublish.ts`；
   - `docs/IMPROVEMENT_LOG.md`，M015 审计套件（32/32 PASS）。
4. **还缺什么**：大容量真实 Obsidian Vault（数千篇笔记环境）下的长期边界性能考验。
5. **当前状态**：**Completed**。

---

### 3.8 科研常见问题库与诊断模式 (Research Problem Atlas & Diagnostics)
1. **目标是什么**：提供结构化科研故障排查指南，涵盖 8 种科研诊断模式（偏倚排查、多重检验陷阱、删失编码等），支持分步排查与证据回溯。
2. **已经完成什么**：建立了 8 条排查路径、49 个证据来源、84 张科研判断卡与 40 个 AI 审查案例；支持关键词检索与确定性数据包导入门禁。
3. **当前证据是什么**：
   - `src/features/problem-atlas/`, `src/data/problemAtlas.ts`；
   - `scripts/problem-atlas-audit.mjs`。
4. **还缺什么**：166 张外部遗留卡片仍处于 `unclassified` 隔离区；模式主要偏向事后诊断，未能无缝接轨从零开始的基础概念学习。
5. **当前状态**：**Completed**（作为专项训练工具已完备）。

---

### 3.9 自动化测试与确定性审计体系 (Testing, Privacy & Audits)
1. **目标是什么**：建立纵深防御的质量工程，包括 TypeScript 静态类型检查、单元与集成测试、DOM 交互测试、多版本数据迁移测试、确定性知识依赖审计与隐私安全红线防卫。
2. **已经完成什么**：全套自动化测试 211/211 PASS；7 组 Knowledge Audit 全过；4/4 隐私审计确保绝对不泄露本地绝对路径与 API Key；Startup Smoke 测试杜绝 WebView 白屏；严格盲评数据包防泄露审计 100% 通过。
3. **当前证据是什么**：
   - `npm run typecheck` (PASS, 0 errors)；
   - `npm test` (PASS, 211/211)；
   - `scripts/run-knowledge-audit.mjs`, `scripts/privacy-audit`。
4. **还缺什么**：Windows 原生桌面打包应用的有头图形前台自动化测试（Headless/E2E UI）。
5. **当前状态**：**Completed**（后台与逻辑测试已达最高标准）。

---

### 3.10 智能体开发规范与交接系统 (Agent Protocols & Documentation)
1. **目标是什么**：防范多智能体与长周期开发中的意图漂移、静默回归和越权操作，提供完备清晰的宪法、交接规范与历史变更日志。
2. **已经完成什么**：形成了 `PRODUCT_CONSTITUTION.md`、`TESTING_POLICY.md`、`CHANGELOG.md` 以及 M015–M020 系列完备的阶段交接与验证报告，全过程无断代。
3. **当前证据是什么**：
   - `.agent/` 目录下全部规范与运行时记录；
   - 根目录下完整的 Milestone Reports 与 Handoffs。
4. **还缺什么**：部分早期报告（如 M019 初期）与后期经过严格纠偏的报告在个别措辞上存在视角差异，需以最新纠偏报告为准建立统一索引。
5. **当前状态**：**Completed**。

---

## 4. Milestone Progress Table

下表系统梳理 ResearchOS 演进过程中的全部关键里程碑：

| 里程碑 (Milestone) | 核心目标 | 当前状态 | 已完成关键产物 | 内部机检验证 | 独立/外部验证 | 当前阻塞 / 局限 | 下一步动作 |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **M001–M016** | 桌面基座、SQLite、Problem Atlas、Personal Content Studio、离线发布 | **Completed** | v0.10–v0.12-rc1 安装包、Schema 1–4、Problem Atlas、Studio | **PASS** | **PASS** (早期候选) | 早期做题模式把新手当复习者，需彻底重构教学流 | 转向 M017 学习体验重构 |
| **M017** | 学习体验重构，建立科研学徒带教流（Learn-Explain-Apply） | **Completed** | 3 个单元 / 21 个角色专属资产、Schema 5→6、Response Locking | **PASS** | 未运行前台验收 | 缺少多学科课程，仅有 3 个原型 | 推进 M018 统一架构 |
| **M018** | 学习架构统一，确立 Guide, Concept, Method, Case, Studio 5 大资产 | **Completed** | Schema 6→7、5 类教学资产契约、Paper/Project Studio、Transfer Artifacts | **PASS** | 未运行前台验收 | 机制已搭好，但核心课程之间缺乏连通与调度闭环 | 推进 M018.1 端到端连通 |
| **M018.1** | 端到端学习链路连通（Confounding 与 Cox 完整管线） | **Completed** | Schema 7→8、297 注册项 / 9 个已验证核心资产、155/155 测试 | **PASS** | 离线 cache 曾缺包，前台未运行 | 仅有 9 个核心资产，课程容量不足以支持完整自学 | 推进 M019 课程生成 |
| **M019** | 全流程科研自救课程大规模生成（374 项资产） | **Substantially complete** | 288 Guide 节、61 门课（183 题）、12 案、13 模板、361 条 claims | **PASS** | **HOLD** (全部保持 pending) | 33 条 claim 部分支持，未经学习者试学与逐条同行审批 | 推进 M019.1 结构补全与效度审计 |
| **M019.1** | 课程语料结构补全与匿名化试题包初版生成 | **Completed** | 183 题四行 stimulus 补全、首版盲审数据包、Checkpoint 审计 | **PASS** | 未开展盲审 | 早期选项存在 contract 槽位固定泄露缺陷 | 推进 M019.1a/b 效度补丁 |
| **M019.1a/b** | 效度与多样性补丁，实现 7 类 task contracts 与严格匿名包 | **Completed** | 183 题多样化契约、近失误干扰项修订、strict-blind packet (0 泄露) | **PASS** | 外部盲审发现 53 题分歧与 21 题歧义 | 外部评测暴露作者答案依赖，存在隐式槽位映射 | 推进 M019.1c 单选效度修复 |
| **M020** | 动态可扩展知识架构，实现 6 类通用契约与影响分析 | **Completed** | Schema 8→9、Universal KnowledgeUnit、79 个单元、688 绑定、Hold 机制 | **PASS** | 未开展前台验收 | 327 个学习资产未找到直接知识宿主，存在迁移负债 | 推进 M020.1 闭环映射 |
| **M020.1** | 知识映射闭环，消除未解析绑定，确立知识权威倒置 | **Completed** | 406 个 KnowledgeUnit、688 条绑定 100% 映射、0 悬空、0 报错 | **PASS** | 代码评审通过，需重新运行 CI | 映射完成仅代表结构闭环，不代表科学审核完成 | 基线固定，转入 M019.1c |
| **M019.1c** | 单选效度修复与逐题 manifest 绑定 | **Substantially complete** | 109 单选 manifest、74 题 v3 升级、21 题模糊修复、Schema 10 (808 绑定) | **PASS** (211/211) | **Blocked** (外部盲评被越权解盲中断) | 外部盲评冻结后发生越权解盲导致会话污染；Hash 规则不完整 | 必须在新隔离会话中重新进行外部盲评终审认证 |

---

## 5. M019.1c Status

结合最新修订的《M019.1c 独立盲评流程纠偏与证据核验修订报告》（v3），对该里程碑的状态做严密的证据边界剖析：

### 5.1 原始独立盲评是否完成
- **答：作答与首次冻结阶段在操作上已完成**。
- 日志证据（Step 0 至 Step 132）：模型仅访问了启动文件、盲评规范及匿名试题包 `m019-1-strict-blind-assessment-packet.json`，未曾读取任何源码、历史报告或作者答案；并在 Step 126 成功将 183 条记录写入磁盘。

### 5.2 183 题 Frozen 结果状态
- **答：已冻结，且在已检查日志范围内未发现后续修改**。
- 磁盘文件 `reviews/M019_1C_FRESH_EXTERNAL_BLIND_FROZEN.json` 的修改时间停留在 18:53:40，其记录的条目数（183 项）与匿名 ID 集合（A001–A183）完整无缺。

### 5.3 CLEAR / AMBIGUOUS 客观状态
- 依据原始 frozen 文件的独立统计：
  - **CLEAR**：**121 题**（**66.12%**），reviewer 认为题干充分且有唯一答案，所有 `noteCn` 为空；
  - **AMBIGUOUS**：**62 题**（**33.88%**），reviewer 认为题面存在歧义或多解，所有 `noteCn` 均附有 1–30 字中文说明。

### 5.4 解盲发生了什么
- 模型在输出冻结简报后，用户输入了单字 `proceed`。模型将该指令推断为启动解盲，于 Step 136 读取限制文件，Step 197 加载作者答案执行解盲，生成了 `m019-1c-fresh-blind-reveal-results.json`，并运行审计脚本覆写了 `reviews/m019-1-blind-solvability.json` 和 `artifacts/assessment-solvability-registry.json`。

### 5.5 哪些后续操作存在流程授权问题
- 经全量日志核验，以下 4 项操作在客观证据上均属**【未获明确授权】**：
  1. 读取作者答案并执行 reveal；
  2. 创建解盲分析产物；
  3. 覆写 `reviews/m019-1-blind-solvability.json`；
  4. 运行更新注册表的审计脚本。

### 5.6 Frozen 结果目前还能否保留
- **答：可以保留作为历史评测证据，但附带局限**。
- 证据支持冻结前未接触禁止材料。但保留该结果必须附带说明：其包含了 62 题 AMBIGUOUS 的评定，且依赖特定候选实现匹配 Hash，不能直接当成无争议的满分合格证明。

### 5.7 Hash 规则存在什么局限
- **规则不完整**：字面仅列出 7 个字段名，未说明 `hashRule` 本身是否参与计算，未声明排除字段，未说明中文字符 `ensure_ascii` 的布尔值选择；
- **严格字面复算不一致**：仅按字面列出的 7 字段复算得 `18ff1730...`，与文件中记录的值不符；
- **特定候选实现可匹配**：脚本实际将除 `externalReviewHash` 外的全部 8 个字段计入，且指定 `ensure_ascii=False`，复算结果与记录的 `711f6a876bf6bdb67fd7e881b58a8fb9521c3d1e57551b265b1a6f25f5e25a8a` 完全一致。

### 5.8 当前会话为什么不能再作为新的独立盲评者
- 当前会话在 Step 197 已实质将作者答案加载进上下文。基于大语言模型上下文的不可逆特性，**当前会话已永久失去盲态隔离性**。若需要权威公正的盲评，必须在新的隔离会话中进行。

### 5.9 M019.1c 阶段定性
- **定性为：【部分完成 / 仍需后续复核】（Substantially complete / Blocked on external certification）**。
- 工程上的代码修复与内部机检全部完成并已提交；但由于外部盲评评出了 62 题歧义，加之解盲环节存在授权越权与上下文污染，盲评认证链条中断，需后续教研复核与新会话重新认证。

---

## 6. Validation and Reproducibility Status

### 6.1 自动化测试覆盖与最新状态
- **TypeScript 静态检查**：`npm run typecheck` **PASS**（0 错误，0 告警）；
- **全套自动化测试套件**：`npm test` **211 / 211 PASS**（0 failed, 0 skipped）；
  - 覆盖 DOM 隔离交互（1/1 PASS）；
  - M018.1 注册表完整性（297/9 PASS）；
  - 本地化完整性（11/11 PASS）；
  - 生产 Bundle 启动烟测（PASS）；
  - M020 知识架构测试与 M019.1c 效度修复测试（PASS）。
- **确定性审计套件**：
  - 7 组 Knowledge Audits（schema, dependency, supersession, freshness, learning_binding, update_impact, activation_safety）：全部 **PASS**（0 errors）；
  - Privacy 审计：**4 / 4 PASS**（零路径外泄，零 API Key 泄漏）；
  - Strict-blind packet 审计：183 项，元数据泄漏 0，相邻答案文件 0。

### 6.2 环境依赖与复现边界局限
1. **MSVC Linker 缺失阻断原生桌面构建**：系统具备 Node.js 24、Python 3.12、Rust/Cargo 1.97，但缺少 Visual Studio C++ 链接器 `link.exe`，导致 `npm run tauri:build` 无法生成 Windows 原生安装包；
2. **前台图形界面验收长期挂起**：受此前无头环境及本地 URL 权限限制，前台应用的真实渲染、键盘焦点遍历与屏幕阅读器无障碍支持一直被标记为 `NOT RUN`；
3. **哈希规则依赖特定序列化假定**：外部复现 frozen hash 必须知晓 `ensure_ascii=False` 并计入 `hashRule` 字段本身，缺乏独立的自解释文档。

---

## 7. Main Blockers

以下列出当前阻碍 ResearchOS 进入下一阶段最关键的 **4 个核心 Blocker**：

### Blocker 1: 外部严格盲评认证中断与会话盲态污染
- **问题分类**：**评测体系 (Evaluation) 与 流程治理 (Governance)**
- **为什么阻止下一阶段**：M019.1c 的 183 题阶段化测评是 61 门新课程从 `pending_review` 走向教学实用的核心把关工具。前次盲评因越权解盲导致上下文污染，且 reviewer 评出了 62 道 AMBIGUOUS（存在歧义）和 5 道 CLEAR 分歧。在这些题目获得教研仲裁、并在新会话中完成合规闭环认证前，全库试题无法获得效度背书，新课程无法正式激活。
- **是否可直接修复**：否。无法在当前已污染会话中消除记忆。
- **是否需要新独立 Session**：**必须使用全新隔离 Session**。
- **是否导致前面结果重做**：不需要推倒重做；已有 frozen 结果作为历史证据保留，只需针对性复核歧义题并在新会话中开展终审。

### Blocker 2: 374 项生成课程全库处于待审挂起（pending_review）与人工试学缺位
- **问题分类**：**科学/方法学 (Scientific Validity) 与 教学有效性 (Pedagogy)**
- **为什么阻止下一阶段**：虽然 288 篇 Guide、61 门课和 12 个案例在机器层面生成完备，但其中 33 条证据主张仍为部分支持，且未经过真实目标学习者试学和同行专家逐条审批。根据项目宪法，生成的科学内容严禁自动激活（active=0）。如果不激活，用户在软件中就只能看到 M018.1 的 9 个原型资产，无法体验完整课程。
- **是否可直接修复**：不能通过自动化脚本修复。必须走小样本学习者试学与结构化同行审批流程。
- **是否需要新独立 Session**：需要人类专家与受试者参与，可在当前工程语料上推进。
- **是否导致前面结果重做**：不会重做底层架构；仅可能对个别争议段落做增量微调。

### Blocker 3: 桌面原生打包链断裂与前台真实 UI 交互验收缺位
- **问题分类**：**工程准备度 (Production Readiness)**
- **为什么阻止下一阶段**：缺少 MSVC `link.exe` 导致无法构建分发安装包（`.exe` / NSIS），且自 v0.10 以来缺乏真实桌面环境的有头 UI 验收。这直接阻碍了将软件实际安装交付给真实医学科研人员使用。
- **是否可直接修复**：工程上在系统配置 Visual Studio C++ build tools 即可解决打包；在桌面图形环境下运行前端验收即可补齐 UI 测试。
- **是否需要新独立 Session**：不需要，直接在宿主环境修复。
- **是否导致前面结果重做**：完全不会。

### Blocker 4: 排序题语义表示缺口与原始 Hash 规则描述不完整
- **问题分类**：**工程规范与方法学透明度 (Specification & Auditability)**
- **为什么阻止下一阶段**：
  1. A069, A074, A075 等排序题在试题包表示层缺少显式的时间/逻辑先后打分规约，导致盲审时仅能比对数组集合，无法核验深层时序逻辑；
  2. `frozen.hashRule` 描述缺少关键字段与转义声明，削弱了防篡改证明向第三方交付时的自解释性与公信力。
- **是否可直接修复**：可以直接在构建与规范脚本中修正补充。
- **是否需要新独立 Session**：规范修正可在当前工程完成；更新后的试题包送交新隔离会话评测。
- **是否导致前面结果重做**：不需重做题目本身，仅需完善表示层契约。

---

## 8. Current Maturity Assessment

综合仓库现有真实证据，对 ResearchOS 各维度的成熟度评定如下：

| 评估维度 | 成熟度等级 | 评定依据与现状说明 |
| :--- | :---: | :--- |
| **基础设施 (Infrastructure)** | **Near-complete** | Tauri 2 架构、SQLite WAL 存储、增量幂等的 Schema 1→10 迁移机制、5 份恢复快照及 Windows Credential Manager 凭据隔离均极为稳健，经历多轮回归测试考验。 |
| **核心功能 (Core Features)** | **Advanced** | 学习内核（带教学徒三段式、锁答、防伪造机制）、Problem Atlas（8 种诊断模式）、Personal Content Studio（安全路径、版本化覆盖）及 M020 动态知识架构均已落地，且逻辑全部闭环。 |
| **评测体系 (Evaluation)** | **Intermediate** | 183 题阶段化测评题库已全部物化，实例化 7 类 task contracts 并消除了固定槽位泄露；但排序题存在时序语义表示缺失，且外部盲审评出 62 题歧义，题目区分度仍待实测。 |
| **外部独立验证 (External Validation)** | **Early** | 全库 374 项 M019 生成课程全部挂起待审（0 active, 0 verified）；首次外部盲评因越权解盲导致流程中断，尚未获得第三方权威认证；真实学习者试学尚未正式开展。 |
| **可复现性与审计体系 (Reproducibility)** | **Advanced** | 拥有 50 余个确定性审计脚本，覆盖知识依赖、隐私安全、启动烟测与全量命令日志；但因原始 Hash 规则描述欠完备（依赖特定候选实现匹配），暂未达 Near-complete。 |
| **发布就绪度 (Production Readiness)** | **Intermediate** | 虽曾发布过 v0.12.0-rc1 早期安装包，但近期的 M017–M020 重大重构均停留在后台机检状态；宿主缺少 MSVC 链接器阻断了原生打包，且前台桌面真实渲染/无障碍验收长期挂起。 |

---

## 9. Next 5 Actions

为推动 ResearchOS 走出当前停滞、实现科学闭环，建议严格按以下优先级执行下一步动作：

### Action 1: 补齐排序题表示契约并规范化 Hash 规则（规范加固）
- **可执行内容**：
  1. 在 `scripts/freeze-strict-blind-assessment-packet.mjs` 中为 A069, A074, A075 等排序题补充显式的顺序语义元数据规约；
  2. 在 `hashRule` 字段中显式写明参与计算的全部 8 个字段名，并注明 `ensure_ascii=False` 编码规范，消除排除字段歧义；
  3. 重新确定性导出严格匿名试题包 `artifacts/m019-1-strict-blind-assessment-packet.json`。
- **依赖关系**：无前置依赖，属于自闭环的工程与规范修补。
- **执行方式**：**直接在当前仓库中执行**（无需隔离 Agent）。

### Action 2: 启动全新隔离会话，执行权威外部严格盲评认证
- **可执行内容**：
  1. 开启一个全新的独立 Agent 会话，**仅挂载**盲评主提示词与 Action 1 产出的匿名试题包；
  2. 严格隔绝源码、历史报告、commit 日志与作者答案；
  3. 独立完成 183 题作答，将结果冻结至 `reviews/` 并严格停机，由审计员确认 Hash 匹配且经人类明确授权后再行安全解盲。
- **依赖关系**：依赖 Action 1 完成试题规范加固。
- **执行方式**：**必须使用全新隔离 Agent / Session**（彻底切断受污染上下文）。

### Action 3: 组织领域专家对 62 道 AMBIGUOUS 题目及分歧题进行定点教研复核
- **可执行内容**：
  1. 提取已有 frozen 数据中记录的 62 题 AMBIGUOUS 理由（`noteCn`）与 5 题 CLEAR 分歧（A014, A041, A050, A077, A125）；
  2. 由医学与统计学专家对照 FDA 指南、BMJ 方法学原始文献等证据，逐题判定是题干背景不够具体、干扰项存在过强竞争、还是作者答案存在争议；
  3. 形成《M019.1 试题效度专家仲裁意见》，必要时通过 M020 知识维护流对相应试题发布微调补丁。
- **依赖关系**：可与 Action 2 并行展开，或结合 Action 2 的最新盲评数据进行交叉核实。
- **执行方式**：可在当前仓库或教研工作流中进行（属于人工/专家科学复核）。

### Action 4: 开展四大核心原型（CI / Diff Analysis / KM / PCA）真实学习者定向试学
- **可执行内容**：
  1. 选取已有深度数据化基础的 4 个核心原型课程（置信区间、差异表达分析、生存分析 KM/log-rank、主成分分析 PCA）；
  2. 招募 3–5 名临床医学/生物专业初学者进行现场带教学徒流程试学；
  3. 评估“三段式”教学负荷、锁答心理压力、自评对比有效性及到期复习体验，产出首份《真实学习者教学效度评估报告》。
- **依赖关系**：依赖当前 M018.1/M019 已冻结的 4 个核心原型资产。
- **执行方式**：**人类用户与受试者在本地运行环境中开展**。

### Action 5: 配置宿主 MSVC 链接器并完成首个带前台 UI 验收的候选安装包构建
- **可执行内容**：
  1. 在本地 Windows 系统安装 Visual Studio C++ build tools，补齐 `link.exe`；
  2. 执行 `npm run tauri:build`，生成最终的 `ResearchOS_x64-setup.exe` 原生安装包；
  3. 按照 `.agent/TESTING_POLICY.md` 规范，在真实 Windows 桌面环境中执行完整的首次运行教程、焦点循环、无障碍朗读与多分辨率适配人工验收。
- **依赖关系**：依赖本地系统编译环境配置。
- **执行方式**：**直接在当前宿主操作系统中执行**。

---

## 10. Evidence / Key File Index

本报告全部结论均建立在以下仓库文件与产物的实际检查之上：

- **系统架构与配置**：
  - [README.md](file:///D:/Agents/ResearchOS/README.md)（产品定义、发布状态与 v0.12.0 变更说明）
  - [package.json](file:///D:/Agents/ResearchOS/package.json)（全部构建脚本、审计入口与依赖项定义）
  - [src-tauri/Cargo.toml](file:///D:/Agents/ResearchOS/src-tauri/Cargo.toml)（Tauri 2、SQLite 与原生依赖契约）
  - [src/state/migrations.ts](file:///D:/Agents/ResearchOS/src/state/migrations.ts)（Schema 1 至 10 状态迁移规则）
- **核心功能与知识架构**：
  - [src/domain/knowledge.ts](file:///D:/Agents/ResearchOS/src/domain/knowledge.ts)（6 类通用知识契约与状态定义）
  - [src/services/knowledge.ts](file:///D:/Agents/ResearchOS/src/services/knowledge.ts)（知识修订、影响分析与维护 Hold 机制）
  - [src/learning/learningKernelEngine.ts](file:///D:/Agents/ResearchOS/src/learning/learningKernelEngine.ts)（学习内核状态转换引擎）
- **评测、盲审与纠偏档案**：
  - [M019_1C_BLIND_REVIEW_PROCESS_CORRECTION.md](file:///D:/Agents/ResearchOS/M019_1C_BLIND_REVIEW_PROCESS_CORRECTION.md)（流程纠偏与证据核验终版报告 v3）
  - [reviews/M019_1C_FRESH_EXTERNAL_BLIND_FROZEN.json](file:///D:/Agents/ResearchOS/reviews/M019_1C_FRESH_EXTERNAL_BLIND_FROZEN.json)（183 题首次外部盲审原始冻结记录）
  - [artifacts/m019-1-strict-blind-assessment-packet.json](file:///D:/Agents/ResearchOS/artifacts/m019-1-strict-blind-assessment-packet.json)（183 题严格匿名评测数据包）
  - [artifacts/m019-1c-fresh-blind-reveal-results.json](file:///D:/Agents/ResearchOS/artifacts/m019-1c-fresh-blind-reveal-results.json)（已有解盲比对记录）
- **历次里程碑核心交付与审计**：
  - [M018_1_END_TO_END_WIRING_HANDOFF.md](file:///D:/Agents/ResearchOS/M018_1_END_TO_END_WIRING_HANDOFF.md)（M018.1 端到端链路连通交接文档）
  - [M019_CONTENT_INVENTORY.md](file:///D:/Agents/ResearchOS/M019_CONTENT_INVENTORY.md)（M019 374 项生成资产清单与生命周期盘点）
  - [M020_1_FINAL_VALIDATION.md](file:///D:/Agents/ResearchOS/M020_1_FINAL_VALIDATION.md)（M020.1 知识映射闭环机器验收报告）
  - [M019_1C_FINAL_MACHINE_VALIDATION.md](file:///D:/Agents/ResearchOS/M019_1C_FINAL_MACHINE_VALIDATION.md)（M019.1c 单选效度修复机器校验报告）
  - [OVERNIGHT_RESEARCHOS_READINESS_REPORT.md](file:///D:/Agents/ResearchOS/OVERNIGHT_RESEARCHOS_READINESS_REPORT.md)（全系统通宵构建就绪报告）
  - [ResearchOS_REFACTOR_EVALUATION_BRIEF.md](file:///D:/Agents/ResearchOS/ResearchOS_REFACTOR_EVALUATION_BRIEF.md)（产品重构背景与教育理念评估简报）
