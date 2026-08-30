export type Locale = "zh-CN" | "en-US";

export const DEFAULT_LOCALE: Locale = "zh-CN";
export const supportedLocales: Array<{ value: Locale; label: string }> = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en-US", label: "English" },
];

const messages = {
  "zh-CN": {
    "nav.today": "今日学习", "nav.library": "文献库", "nav.paperLab": "论文训练", "nav.methodLab": "方法学训练",
    "nav.problemAtlas": "科研常见问题库",
    "nav.review": "复习", "nav.aiAudit": "AI 审核", "nav.frontier": "前沿地图", "nav.projects": "科研项目",
    "nav.skillMap": "能力图谱", "nav.assessment": "能力评估", "nav.settings": "设置",
    "shell.commandPalette": "命令面板", "shell.search": "搜索工作区", "shell.workspaces": "工作区",
    "shell.localFirst": "本地优先", "shell.humanFirst": "人类判断优先", "shell.evidence": "证据可追溯",
    "settings.language": "界面语言", "settings.languageHelp": "中文负责理解，英文标准术语用于科研语言迁移。",
    "method.why": "为什么重要", "method.core": "核心概念", "method.english": "英文术语", "method.appears": "科研中怎么出现",
    "method.wrong": "常见错误", "method.reviewer": "审稿人为什么会质疑", "method.correct": "正确处理方式",
    "method.use": "什么时候适用", "method.avoid": "什么时候不适用", "method.transfer": "与你的科研如何关联",
    "method.evidence": "证据来源", "method.original": "经核验英文原始说明",
  },
  "en-US": {
    "nav.today": "Today", "nav.library": "Library", "nav.paperLab": "Paper Lab", "nav.methodLab": "Method Lab",
    "nav.problemAtlas": "Problem Atlas",
    "nav.review": "Review", "nav.aiAudit": "AI Audit", "nav.frontier": "Frontier", "nav.projects": "Projects",
    "nav.skillMap": "Skill Map", "nav.assessment": "Assessment", "nav.settings": "Settings",
    "shell.commandPalette": "Command palette", "shell.search": "Search workspace", "shell.workspaces": "Workspaces",
    "shell.localFirst": "Local-first", "shell.humanFirst": "Human first", "shell.evidence": "Evidence traceable",
    "settings.language": "Interface language", "settings.languageHelp": "Chinese supports understanding; standard English terms support research-language transfer.",
    "method.why": "Why it matters", "method.core": "Core concept", "method.english": "English term", "method.appears": "How it appears in research",
    "method.wrong": "Common error", "method.reviewer": "Why reviewers challenge it", "method.correct": "Correct handling",
    "method.use": "When to use", "method.avoid": "When not to use", "method.transfer": "Connection to your research",
    "method.evidence": "Evidence", "method.original": "Verified original English explanation",
  },
} as const;

export type MessageKey = keyof typeof messages["zh-CN"];
export function t(locale: Locale | undefined, key: MessageKey): string {
  return messages[locale ?? DEFAULT_LOCALE]?.[key] ?? messages[DEFAULT_LOCALE][key];
}
