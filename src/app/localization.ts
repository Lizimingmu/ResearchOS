import type { DifficultyLevel, VerificationStatus } from "../domain/types";

export const difficultyLabel = (value?: DifficultyLevel) => ({
  foundation: "基础",
  intermediate: "进阶",
  advanced: "高级",
  frontier: "前沿",
}[value ?? "foundation"]);

export const verificationLabel = (value: VerificationStatus) => ({
  verified: "已核验",
  pending: "待核验",
  rejected: "已拒绝",
  not_required: "无需核验",
}[value]);

export const severityLabel = (value?: string) => ({
  minor: "轻微问题（Minor Concern）",
  major: "重大问题（Major Concern）",
  critical: "致命 / 结构性问题（Critical Issue）",
  uncertain: "不确定",
}[value ?? ""] ?? value ?? "—");

export const domainLabel = (value: string) => ({
  clinical: "临床研究",
  statistics: "统计学",
  "single-cell": "单细胞",
  omics: "组学",
  prediction: "预测模型",
  reasoning: "科研推理",
}[value] ?? value);

export const taskTypeLabel = (value: string) => ({
  learning: "学习单元",
  retrieval: "提取练习",
  paper: "论文",
  method: "方法",
  audit: "AI 审核",
  problem: "科研问题",
  transfer: "迁移",
}[value] ?? value);

export const weightLabel = (value: string) => ({
  weakness: "薄弱程度",
  projectRelevance: "项目相关性",
  frontierValue: "前沿价值",
  reviewDue: "复习到期",
  misconception: "错误观念风险",
}[value] ?? value);

export const persistenceLabel = (value: string) => ({ idle: "已保存", saving: "正在保存", error: "保存失败" }[value] ?? value);
