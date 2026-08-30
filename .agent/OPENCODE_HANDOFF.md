# OpenCode Handoff — M016 Learning Kernel

**M016 S1–S5 已由 Codex 按用户要求完成。不要重复执行本文件中的历史任务；当前仅等待用户前台体验验证。**

使用 **DeepSeek V4 Pro**，从 ResearchOS 项目根目录执行本交接。基线是 tag `v0.12.0-rc1`；当前工作树还含 Codex 规格提交。不要运行任何 Git 命令，Codex 负责 checkpoint、review 和 release gate。

## 📖 必读且仅需优先读取

1. `.agent/PRODUCT_CONSTITUTION.md`
2. `.agent/M016_LEARNING_KERNEL_SPEC.md`
3. `.agent/M016_LEARNING_KERNEL_SCHEMA.md`
4. `.agent/M016_LEARNING_KERNEL_STATE_AND_SCHEDULER.md`
5. `.agent/M016_LEARNING_KERNEL_MIGRATION.md`
6. `.agent/M016_LEARNING_KERNEL_PROTOTYPES.md`
7. `.agent/TESTING_POLICY.md`
8. `.agent/M016_LEARNING_KERNEL_RUN_STATE.json`

随后只读取与当前 segment 直接相关的代码。不要重新扫描历史长 prompt 或整个 repository。

## 🧩 分段执行与自动恢复

当前不得自动续跑。未来解除暂停后，每次启动先读取 run state，选择第一个非 completed segment。每段：实现 → 定向测试 → 更新 run state 和 segment 报告 → 继续下一段。中断后从当前 segment 重跑其幂等步骤，禁止猜测已完成。

### S1 — Domain + migration

- `M016-LK-01`：实现 schema 中的 LearningUnit、LearnerUnitState、LearningEvent、PrerequisiteEdge、PracticeAssetBinding 和 Skill Map 双轴投影。
- `M016-LK-02`：前端 state schema 4→5 迁移，严格执行零推断、幂等、future-schema fail-closed 和 backup/restore 合同。
- 门禁：新增纯函数/schema/migration 测试；全量 unit tests。

### S2 — State engine + scheduler

- `M016-LK-03`：实现纯状态转换、Challenge fast path、两线程 gate、先修 DAG validator。
- `M016-LK-04`：用三阶段 kernel 替换默认固定拼盘 Today；保留旧模块手动导航。
- 门禁：状态转换表、十项 scheduler 不变量、确定性排序、旧状态兼容测试。

### S3 — Three prototype units

- `M016-LK-05`：只实现三个 prototype 和明确 prerequisite chain；通过 binding 复用现有资产，不批量改写。
- 所有新增/改写 scientific text、rubric、claim boundary 均保持 pending；不得提升现有 pending 内容。
- pending prototype 只能进入明确标注的 preview/test path，不能进入正式 Today；使用 verified synthetic fixtures 验证 scheduler。Codex 科学审核后再由后续 bounded patch 激活正式路径。
- 门禁：结构、11 教学职能、8–12 分钟、provenance、binding revision/hash、DAG、重复/缺失引用审计。

### S4 — Learning UI + onboarding

- `M016-LK-06`：实现非长文章的“先懂 → 弄明白 → 会判断”单元 UI、Learning/Challenge 入口、分层 hint、锁定独立答题、双轴 Skill Map、5 分钟 n/statistical-unit onboarding。
- 删除旧 onboarding 的强制 baseline blind test 默认路径；保留必要兼容字段，不做破坏迁移。
- 不新增聊天 Tutor、视频、功能导览或新导航模块。
- 门禁：headless component/interaction/accessibility tests。不得启动前台应用。

### S5 — Automated QA and report

- `M016-LK-07`：新增 deterministic `audit:learning-kernel`，覆盖 schema、DAG、状态、科学状态、provenance、untranslated UI、固定拼盘残留和 migration invariants。
- 串行运行现有全部适用门禁、Rust tests（如未改 Rust也要运行一次）、startup smoke、performance 和 handoff validator。
- 更新 `.agent/IMPLEMENTATION_REPORT.md` 和 `.agent/SCIENTIFIC_CHANGESET.md`；run state 改为 `awaiting_codex_review`，然后停止。

## 🚫 范围限制

- 不新增 Problem Cards、AI Audit、Frontier 或其他内容域。
- 不批量重写旧内容；仅 binding 或三个 prototype 必需的最小适配。
- 不启动 ResearchOS、安装器、浏览器或任何会抢焦点的前台自动化。
- 不访问真实 Vault 或生产用户数据，只用项目内 fixture/tempdir。
- 不打包、不发布、不改版本号、不覆盖 release 工件。
- 不运行 Git。
- 不把 AI-generated/pending 科学内容标记 verified/active。

## ✅ 总验收标准

1. 默认首次体验先教“什么是 n/统计单位”，不先强制盲测。
2. 三个单元完整满足 11 段教学合同、8–12 分钟和先修链。
3. Learning/Challenge 两路径都可用；Challenge pass 不伪造 instruction completion。
4. 状态机只允许规格中的转换，学习经历与能力证据分离。
5. Today 先 state gate、再合法活动、最后排名；固定模块拼盘退出默认路径。
6. 同时最多两个 active learning threads；project relevance 不能绕 gate。
7. 现有 PracticeAsset 通过版本化 binding 复用，旧内容和历史证据不被改写。
8. Skill Map 明确显示 learning progress 与 demonstrated competence 两轴。
9. v4→v5 迁移保留全部用户数据且不推断 mastery；v5 重开幂等。
10. 全部新科学文本 pending，changeset 完整；全部自动化门禁通过并如实区分 BACKGROUND、HEADLESS、FOREGROUND、USER-MANUAL。

遇到科学措辞或 rubric 不确定时，不自行扩写：保持 pending，在 IMPLEMENTATION_REPORT 中列为 Codex review item。完成 S5 后停止。
