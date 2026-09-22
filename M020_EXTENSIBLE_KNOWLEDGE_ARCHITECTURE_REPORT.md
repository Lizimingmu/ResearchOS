# M020 — Extensible & Updatable Knowledge Architecture

日期：2026-09-22。基线：`7a41b4926e3a2a408acce7c073b2351c4fc230cc`。分支：`codex/m020-extensible-knowledge-architecture`。

本轮建立可维护的知识层、证据依赖与版本维护流程。未改变 Learning Kernel 的评分和阶段转换规则，未改写现有 288 个 Guide，未修订 M019 题目和答案，未激活科学候选。

## 1. Universal Knowledge Unit 是否真正实现？

已实现运行中的类型契约、校验、持久化、操作服务与中文入口，而非仅文档或独立演示。`src/domain/knowledge.ts` 定义共同科学字段、逐主张证据链接、时间与复核策略、来源和精确版本绑定；`src/services/knowledge.ts` 实现结构审计、不可变修订、候选导入、影响分析、替代与废弃、候选学习投影。

应用状态升级为 schema 9；SQLite user version 保持 2。课程原文和原有 Kernel 契约仍存在，由版本化 learning bindings 接到 canonical knowledge。当前适配是增量过渡；不会把缺少字段的旧课程包装成已通过科学审核的完整知识。

## 2. 支持哪些知识类型？

| 类型 | 专属内容 |
|---|---|
| concept | 定义、反例 |
| method | 算法/统计逻辑、参数、诊断、适用/不适用条件、误用、审稿核查、论文呈现 |
| protocol | 信号、实验与统计单位、重复、对照、流程、关键变量、QC、排错、定量、允许/禁止结论 |
| experimental_technique | 与 protocol 相同的实验推理契约 |
| guideline | 发布机构、版本、生效日期、替代版本、建议范围 |
| research_pattern | 情境、证据逻辑、适用条件 |

共同状态包括 CURRENT、UPDATE_AVAILABLE、REVIEW_REQUIRED、SUPERSEDED、DEPRECATED、EMERGING；复核策略包括 FOUNDATIONAL_STABLE、EVOLVING_PRACTICE、VERSION_SENSITIVE、GUIDELINE_TRIGGERED。基础概念不被机械设置年度复核。

## 3. 新知识如何加入？

在内容工作台选择“添加知识”或“从模板新建知识”。六种类型都有中文表单；普通创建无需手写 schema。输入支持 DOI、PMID、来源 metadata、source pack、Markdown、JSON 和研究笔记。

先选择类型、填写或导入内容、选择目标知识及 NEW/UPDATE/EXTENSION/CONTRADICTION/DEPRECATION/SUPERSESSION，再预览候选、差异和依赖影响。导入先保存 pending 候选；用户确认具体变更后追加知识/证据版本并登记受影响资产的审核暂停。标识符只做本地语法识别，本轮没有联网元数据解析、文献阅读或自动科学核验。

“生成候选学习资产”可创建 Guide、Concept Lesson、Method Lesson、Protocol Lesson、Apply、Remediation、Delayed Review、Case 八类草案。它们绑定精确知识版本，全部 `ai_generated + pending + pending_review + createsCompetence=false`，不加入正式 registry。缺少的题目、答案键、评分规则与教学设计明确列为缺口。

## 4. 旧知识如何更新、替代、废弃和恢复？

每次确认都追加新 revision、candidate、状态 ledger 和必要的 learning hold。旧 revision 的内容与 hash 永久保留；状态变化由 ledger 派生，不回写旧 payload。复制新知识不暂停原课程。废弃仅禁止新使用，不删除学习史；恢复生成一个新的待审版本，旧版本仍保持废弃/被替代状态。

修改基于精确 revision/hash 和工作区基础 hash。过期预览、重复执行、同 revision 覆盖、未声明影响的更新和删除历史都被拒绝。个人 overlay 的精确 base key 命中已变更知识时，登记原 Content Studio 的 `base_update` conflict，保留个人原文，不自动合并。

## 5. 如何确定哪些课程受影响？

依赖按 `EvidenceSource revision/hash → EvidenceClaim revision/hash → KnowledgeUnit revision/hash → learning asset revision/hash` 建图，并纳入显式先修/下游关系。Impact Preview 分别列出知识、课程、评估、案例、Protocol、Guide、Studio 及待审 patch proposals。它不改写学习内容。

更新会给受影响资产加 REVIEW_REQUIRED hold。Today 调度、Review 列表、直接进入学习、练习提交、旧 Review/校准计分和 Case 写入都在 store/服务边界检查。Guide 保留旧正文供追溯并显示更新待审提示。历史能力事实不会被重算或删除。

没有明确映射时不会按标题或主题猜关系。未解析资产会显示迁移审核缺口；它们不是已完成的精确知识图谱。旧正式课程的兼容绑定只保留原行为，不可用来激活新的知识。

## 6. 历史 revision 是否可追溯？

旧事件原有 asset/unit id、revision、hash 保持不变；只对已登记的精确三元组解析历史知识绑定，未知旧 hash 返回 UNRESOLVED，绝不绑到当前最新版。新 Kernel 事件附带 `knowledgeUnitIds`、`knowledgeRevisionBindings` 和解析状态，Kernel engine 本身不变。JSON 学习导出包含事件与 canonical workspace，可还原证据、修订和状态历史。

持久化校验拒绝未来 schema、损坏 hash、遗失迁移基础记录、伪造兼容授权与非法核验状态。新知识 hash 按 JSON 存储语义规范化；旧课程 hash 算法未修改。

## 7. Protocol staging 是否可迁移？

已提供真实既有 WB、qPCR、IHC、flow、PDO 摘录的可点击导入示例，并提供通用 staging adapter。示例保留原稳定 ID、来源/主张、原始 payload、原审核状态和 diagnostic/transfer 依赖；不会把诊断问题或 transfer-case 摘录冒充科学完整的实验课。未知实验字段为空并列出 REVIEW_REQUIRED。

已验证五种示例连续导入，以及原 batch01 和 batch07 的完整 staging 包。共享来源可幂等复用；同一 transfer case 的多知识依赖合并而不丢失。导入仍待审核，无 SOP 激活。

初始迁移包含 79 个知识单元、85 个来源、375 条主张和 688 条学习绑定：现有 42 个 Concept Lesson、22 个 Method Lesson、2 个独立 legacy Kernel 单元，以及 13 个 Case 的研究模式快照。所有新 canonical wrapper 均 pending；原审批信息保留在 provenance 原始快照。Protocol 示例按用户操作导入，不自动增加正式课程。

## 8. AI 是否仍无法自行 verified / active？

是。导入声明不构成审核授权；科学候选强制 pending。来源 metadata 核验与 claim 核验分离。非法状态、伪造 legacyActive、篡改 candidate、直接追加已知 ID 的新 revision、缺少影响暂停记录的变更均被边界校验拒绝。本轮没有 activation 或解除审核暂停入口。

“确认变更并送审”的操作者只登记维护动作，不能冒称 claim reviewer。正式核验字段要求独立审阅者、时间和 claim scope；新记录无法经本轮写入路径获得该状态。

## 9. 当前 architecture debt

- 688 条绑定中有 327 条没有明确知识映射，328 条带迁移审核标记（另 1 条是旧 Cox 入口的保守关联说明）。包括一些 Guide、Studio 和旧 Methods；维护界面和审计保留这些缺口。这不是全库科学图谱完成率的背书。
- 现有内容层引用主要迁为 pending curriculum synthesis；逐主张支持范围仍需正式科学审核。没有用元数据检查替代全文支持判断。
- M020 投影是可编辑、可追溯的候选材料，不是自动生成且已验证的完整课程/题库。答案键、教学效度和正式重新激活需另行授权流程。
- 旧事件缺少或不匹配精确版本证据时只能标为未解析。旧兼容路径保留原有评分行为，既有 M019 学习有效性问题没有在本轮修复。
- 未来发布若改变内置迁移 seed，需要显式版本迁移和冲突策略；当前保护拒绝静默替换用户已保存的基础版本。
- 缺少真实用户视觉、可访问性辅助技术和打包应用交互验收；本轮仅后台测试及隔离 DOM 交互。

## 10. 下一步建议

下一轮若获得授权，应先选少量高价值知识做逐主张来源复核、补齐未解析映射，再设计正式 review decision、教学重新验证及可审计的 activation/解除 hold 流程。不要批量激活迁移 wrapper 或生成的学习候选。本轮完成 commit + push 后停止，不进入 M021。

## 验证记录

工程检查不能证明科学内容正确或学习有效。

- `npm run typecheck`：PASS。
- `npm test`：201/201 回归测试和 1/1 隔离 DOM 交互测试通过；含四场景、迁移、重载、篡改和安全回归。
- 七项知识审计：全部 PASS，0 errors；327 条未解析映射以 warning 明示，保持隔离。
- 原 M018 registry：297 entries / 9 practice assets，PASS；localization 11 checks / 88 bilingual method titles，PASS；生产 bundle 隔离启动与持久化，PASS。
- Privacy：4/4 定向测试通过；本地知识导入不联网、公开样本无工作站路径/凭据、provider 配置不保存 API key。
- `git diff --check`：PASS。
- BACKGROUND AUTOMATED：PASS。
- HEADLESS/OFF-SCREEN：浏览器 NOT RUN；隔离 Node/JSDOM 交互纳入后台测试。
- FOREGROUND UI：NOT RUN。既有 localhost 浏览器权限拒绝未被绕过；未启动应用、安装器或全局输入自动化。
- USER-MANUAL：NOT RUN。

机器审计输出：`artifacts/m020/knowledge-audit.json`。新增回归：`tests-node/m020.mjs`、`tests-node/m020-ui.mjs`。

配置的 OpenCode / DeepSeek Pro 执行先后遇到日志目录权限、`EPERM uv_spawn 'git'`，未产生实现。之后由 Codex 与本任务的分工代理完成；未改动其 provider/model 配置。
