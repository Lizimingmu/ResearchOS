# ResearchOS 中文本地化审计

## 范围与语言策略

本轮采用中文优先（Chinese-first）策略：普通界面、流程说明、错误提示和训练操作使用简体中文；需要用户在论文中掌握的统计、临床、组学与生信术语采用“中文（English, Abbreviation）”；论文标题、Journal、gene/protein symbol、软件包和函数保持正式原文。

## 架构

- `src/i18n/index.ts`：`zh-CN` / `en-US` 消息架构，默认 `zh-CN`。
- `src/i18n/researchTerms.ts`：统一术语字段 `English / Chinese / Abbreviation / Preferred / Definition / Domain`。
- `src/i18n/scientificContent.ts`：Judgment Card 与 AI Audit 的中文优先展示层，保留英文原始案例供核对。
- `scripts/localization-audit.mjs`：检查语言默认值、双语导航、方法标题覆盖、术语完整性、英文按钮 denylist、中文字体、DPI 规则和中文 uppercase 覆盖。

## 页面检查

| 页面 | 中文主界面 | 专业术语策略 | 主要布局风险处理 |
|---|---|---|---|
| 今日学习 | 通过 | 方法与审核标题双语 | 任务列在窄宽度换行 |
| 文献库 | 通过 | 论文、Journal、DOI/PMID 保留原文 | 表格允许横向信息密度 |
| 论文训练 | 通过 | 不修改 PDF 与 Figure 原始标签 | 三栏布局保留最小宽度 |
| 方法学训练 | 通过 | 方法标题持续双语；中文核心定义；英文原始说明可展开 | 双栏卡片在窄屏降为单栏 |
| 复习 / 判断卡 | 通过 | 中文问题；英文原始研究情境明确标注 | 长标题可换行 |
| AI 审核 | 通过 | “合理 / 需要核查 / 存在问题”全局统一 | 步骤理由区可扩展 |
| 前沿地图 | 通过 | 专有名词保留 | 节点文字可换行 |
| 科研项目 | 通过 | 软件与方法缩写保留 | 中文表单标签列加宽 |
| 能力图谱 | 通过 | 七项能力中文优先、英文辅助 | 表格保持最小宽度并滚动 |
| 能力评估 | 通过 | 案例与量规中文；关键术语双语 | 表单纵向滚动 |
| 设置 / 系统状态 | 通过 | Base URL、API Key、Model 等技术字段保留通用形式 | 150% / 200% DPI 专用规则 |

## 排版与 DPI

系统字体栈为 `Segoe UI Variable / Segoe UI / Microsoft YaHei UI / Microsoft YaHei / system-ui`，代码字体为 `Cascadia Code / Consolas / monospace`。中文环境禁用 uppercase 转换并降低字距；为 150% 和 200% DPI 增加侧栏、导航和设置表单适配。

## 自动门禁

运行：

```powershell
npm run localization:audit
```

机器可读结果写入 `artifacts/localization-audit.json`。该门禁同时集成到 `npm test`。

## 边界

自动检查不能替代真实 Windows 会话下的视觉验收。当前受应用控制权限限制，无法把 ResearchOS 窗口交给自动化工具进行截图与逐点击验收；因此 Light/Dark、150%/200% DPI 的结论基于 CSS 规则、组件渲染、生产构建与原生进程烟雾测试，而不冒充人工视觉通过。
