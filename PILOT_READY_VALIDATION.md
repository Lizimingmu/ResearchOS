# ResearchOS Pilot-Ready Validation Report

**Build Version**: `codex/pilot-ready-v0.1`  
**Date**: 2026-09-24  
**Target Trial Time**: 30–60 minutes  
**Target Environment**: Windows Browser-Local (Offline / Zero-Config)  

---

## 1. 验证目标与交付原则

本版本的目标是将当前 ResearchOS 整理为明天用户可以真实使用 30–60 分钟的安全 Pilot Build，满足以下核心原则：
1. **能启动**：双击 `START_RESEARCHOS_PILOT.bat` 即可拉起浏览器使用，不依赖 MSVC/Tauri 本地编译。
2. **能知道今天学什么**：Today 视图精简为 4 个清晰模块，标明先修关系与「为什么今天学这个」。
3. **能完整学完一节**：完整打通 `Why → Intuition → Predict → Explain (自主表达+自检) → Worked Example → Boundary → Apply (独立判断) → Feedback` 认知闭环。
4. **能做题并获得合理反馈**：题目呈现真实科研场景，提供选项级方法学反馈。
5. **能退出后继续**：持久化保存在浏览器本地，刷新或关闭重启后无缝恢复进度。
6. **能记录使用体验**：每节课后弹窗收集难度与问题标签，支持在专用面板查看并一键导出 `ResearchOS_Pilot_Feedback_YYYYMMDD.json`。
7. **零污染保证**：存在争议的 26 道判定题严格禁止产出能力状态 (`competenceScoringAllowed = false`)，主路径仅选用 100% 盲审一致的高置信主题。
8. **不破坏既有架构**：406 个规范 KnowledgeUnit、808 个 LearningBindings 及全部审计项 100% 保持通过。

---

## 2. 关键组件与实现细节

### 2.1 启动与部署 (`START_RESEARCHOS_PILOT.bat` & `scripts/serve.mjs`)
- Windows Batch 脚本一键启动：
  - 自动检测 Node.js 与 npm 环境。
  - 首次运行自动检测 `node_modules`。
  - 自动执行 `npm run build` 生成生产包。
  - 启动本地轻量 HTTP 服务 (`scripts/serve.mjs`，默认端口 `5173`)。
  - 增加 `EADDRINUSE` 端口占用友好提示与错误处理。
  - 自动拉起系统默认浏览器访问 `http://localhost:5173`。

### 2.2 试用入口与 Today 简化
- **Onboarding 极速通道**：在入门卡片顶部增加「ResearchOS Pilot · 试用模式」横幅，一键「开始试用」，自动配置基础偏好并直通 Today。
- **Today 结构简化**：严格限制为 4 个模块：
  1. `A · Foundation Thread`：推荐今日核心概念（如「统计单位 / Statistical Unit」）。
  2. `C · Due Review`：到期复习提示（无到期时不打扰，强化间隔效应）。
  3. `B · Project Overlay`：科研案例或迁移训练入口。
  4. `D · Research Routine`：科研习惯模块（Think Before AI / 本周论文）。
- **试用免责与边界提示**：标明「当前为个人试学模式。部分课程处于审核阶段，本次记录主要用于评价学习体验，不代表正式能力认证」。

### 2.3 Explain 阶段体验强化
- 在 Concept Lesson 的 Explain 阶段新增自主解释文本框（Textarea）。
- 新增 4 项核心概念自检清单（分类识别、判定标准、混淆与伪重复陷阱、迁移应用）。
- 提交时记录 `explanation_attempted` 标志，作为进入版本化 Apply 的前置要求。
- 明确告知用户：系统不会把自由文本伪装成能力分数，仅记录真实认知表达尝试。

### 2.4 课后反馈系统 (`PilotFeedbackModal` & `PilotFeedbackView`)
- **课后即时反馈**：在完成 Apply 且通过后自动弹出轻量弹窗：
  - 难度三档打分（太简单 / 合适 / 太难）。
  - 问题多选标签（太长、太抽象、看不懂术语、例子不好、题目不清楚、Feedback 没帮助、页面操作不顺、没有明显问题）。
  - 自由文本反馈输入框。
  - 支持提交或跳过，均平滑返回 Today。
- **反馈管理面板 (`pilot-feedback` 视图)**：
  - 顶栏右上角常驻入口，显示已提交反馈数。
  - 统计卡片：Session ID、已提交课节数、难度分布统计。
  - 卡片式展示每条历史反馈明细。
  - 一键导出为 `ResearchOS_Pilot_Feedback_YYYYMMDD.json` 文件。
  - **安全重置 ("开始新的 Pilot Session")**：仅清理本次试用会话的进度与反馈，完全保留系统核心知识库、论文库与历史项目。

### 2.5 题目安全隔离门禁 (`pilotManifest.ts` & `learningKernelEngine.ts`)
- 26 道争议题目（来自 `M019_1C_FRESH_EXTERNAL_BLIND_COMPARISON.json`）全部纳入 `DISAGREEMENT_ASSESSMENT_IDS` 黑名单。
- `isAssessmentCompetenceAllowed(id)` 进行判别：
  - 在 `learningKernelEngine.ts` 中，`applyLearningTransition` 强制检查 `competenceScoringAllowed`。
  - 若为 false，无论答题是否正确，一律禁止向 `independent_once`、`retained`、`transferred` 推进，且禁止产出能力证据事件。
- 从 183 道题中筛选出 8 个全题 100% 盲审一致的基础主题作为 Pilot 推荐池：
  1. `staged-concept-statistical-unit`
  2. `staged-concept-pseudoreplication`
  3. `staged-concept-confounding`
  4. `staged-concept-confidence-interval`
  5. `staged-concept-hazard-ratio`
  6. `staged-concept-alternative-explanation`
  7. `staged-concept-selection-bias`
  8. `staged-concept-internal-external-validity`

---

## 3. 验证与审计结果

### 3.1 测试套件执行结果 (`npm test`)
- **Total Tests**: 218 passed / 0 failed (211 baseline + 7 new pilot tests)
- **Pilot 专项测试 (`tests-node/pilot.mjs`)**:
  - `✔ pilot eligibility: excludes all 26 disagreement assessments`
  - `✔ pilot selected topics: only use eligible assessments`
  - `✔ pilot safety gate: disputed assessment cannot create competence`
  - `✔ pilot feedback: records locally and persists across migration`
  - `✔ pilot reload: resumes lesson progress seamlessly`
  - `✔ pilot reset/new session: resets pilot state without deleting normal user data`
  - `✔ pilot safety: canonical Knowledge payload unchanged (406 units, 808 bindings)`

### 3.2 架构与一致性审计
- **M018 Content Registry Audit**: PASS (297 entries, 9 assets)
- **Localization Audit**: PASS (11 checks; 88/88 bilingual titles)
- **Startup Smoke**: PASS (Production bundle renders and hydrates cleanly)
- **Knowledge Schema Audit**: PASS (0 errors)
- **Knowledge Dependency Audit**: PASS (0 errors)
- **Supersession Audit**: PASS (0 errors)
- **Freshness Audit**: PASS (0 errors)
- **Learning Binding Audit**: PASS (0 errors, 0 unresolved bindings)
- **Update Impact Audit**: PASS (0 errors)
- **Activation Safety Audit**: PASS (0 errors)
- **Privacy Audit (`npm run audit:privacy`)**: PASS (4/4 checks; zero private paths, identifiers, credentials or API keys)
- **Typecheck (`npm run typecheck`)**: PASS (0 errors)

### 3.3 UI 视口验收 (`tests-node/pilot-viewport.mjs`)
- 1280×720 CSS Viewport: PASS (Onboarding banner, Today 4-block layout, Explain phase, PilotFeedbackModal, PilotFeedbackView)
- 1440×900 CSS Viewport: PASS (All components responsive, zero button clipping, zero horizontal overflow)

---

## 4. 结论与明天试用指引

ResearchOS 当前已达到 **Tomorrow Pilot-Ready** 标准。
试用者可通过阅读根目录下的 [PILOT_START_HERE.md](file:///D:/Agents/ResearchOS/PILOT_START_HERE.md) 并双击 [START_RESEARCHOS_PILOT.bat](file:///D:/Agents/ResearchOS/START_RESEARCHOS_PILOT.bat) 立即启动试用。
