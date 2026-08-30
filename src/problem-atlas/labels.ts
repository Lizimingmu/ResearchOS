import type { DiagnosticModeId, FailureLayer, KnowledgeStatus, RegistrySourceType, RegistryVerificationStatus, SupportType } from "../domain/problemAtlas";

export const modeLabel = (mode: DiagnosticModeId): string => ({
  quick: "快速定位",
  differential: "鉴别诊断",
  sequential: "序贯排查",
  "missing-info": "缺失信息",
  "error-localization": "错误定位",
  "claim-boundary": "结论边界",
  reviewer: "审稿诊断",
  "ai-verdict": "AI 解释审核",
}[mode]);

export const modeDescription = (mode: DiagnosticModeId): string => ({
  quick: "选择最可能的故障类别/层级，先形成假设。",
  differential: "把候选原因排序为最可能 / 可能 / 不太可能 / 基本排除，并给出理由。",
  sequential: "逐条揭示证据，每次锁定更新后的排序，再继续。",
  "missing-info": "选择最具区分力的下一步检查，并解释为什么。",
  "error-localization": "沿 样本 → 实验 → 定量 → 统计 → 解释 定位错误层级。",
  "claim-boundary": "选择当前证据能支持的最大结论，并说明更强结论需要什么证据。",
  reviewer: "识别最重要的方法论问题，并给出相称的严重程度。",
  "ai-verdict": "判断 AI 生成的解释属于 合理 / 需要核查 / 错误，随后查看高级审核。",
}[mode]);

export const layerLabel = (layer: FailureLayer): string => ({
  sample: "样本",
  experiment: "实验",
  quantification: "定量",
  statistics: "统计",
  interpretation: "解释",
}[layer]);

export const layerOrder = (): FailureLayer[] => ["sample", "experiment", "quantification", "statistics", "interpretation"];

export const knowledgeLabel = (status: KnowledgeStatus): string => ({
  current: "现行知识",
  superseded: "已被取代",
  deprecated: "已弃用",
  emerging: "新兴知识",
}[status]);

export const registryVerificationLabel = (status: RegistryVerificationStatus): string => ({
  pending: "待核验",
  metadata_verified: "元数据已核验",
  claim_verified: "主张已核验",
  rejected: "已拒绝",
}[status]);

export const supportTypeLabel = (type: SupportType): string => ({
  direct: "直接支持",
  qualified: "限定支持",
  contextual: "情境支持",
  contradicts: "相互矛盾",
  insufficient: "证据不足",
}[type]);

export const tierLabel = (tier: string): string => {
  const labels: Record<string, string> = {
    S: "权威规范/共识",
    A: "同行评议方法学证据",
    B: "专业/技术来源",
    C: "教育性综述",
    D: "仅发现性",
    X: "已拒绝",
  };
  return labels[tier] ?? tier;
};

export const evidenceBadgeLabel = (tier: string): string => {
  const labels: Record<string, string> = {
    S: "✓ 权威规范",
    A: "✓ 方法学证据",
    B: "专业/技术来源",
    C: "教育参考",
    D: "前沿证据",
    X: "已拒绝来源",
  };
  return labels[tier] ?? tier;
};

export const sourceTypeLabel = (type: RegistrySourceType): string => ({
  guideline: "指导方针",
  consensus: "专家共识",
  standard: "标准",
  protocol: "实验方案",
  original_method: "原始方法",
  benchmark: "基准研究",
  methods_review: "方法学综述",
  technical_resource: "技术资源",
  institutional_sop: "机构规程",
  educational: "教育材料",
  discovery: "发现性来源",
}[type]);

export const atlasDomainLabel = (value: string): string => ({
  statistics: "统计学",
  "experimental-design": "实验设计",
  prediction: "预测模型",
  "single-cell": "单细胞",
  bioinformatics: "生物信息",
  spatial: "空间组学",
  "multi-omics": "多组学",
  reviewer: "论文审稿",
  figure: "论文图表",
  "ai-oversight": "AI 科研监督",
  "wet-lab": "湿实验",
}[value] ?? value);

export const severityLabelAtlas = (value: string): string => ({
  minor: "轻微问题（Minor）",
  major: "重大问题（Major）",
  critical: "致命问题（Critical）",
}[value] ?? value);

export const verdictLabel = (value: string): string => ({
  reasonable: "合理",
  "needs-check": "需要核查",
  wrong: "错误",
}[value] ?? value);

export const rankLabel = (index: number): string => {
  if (index === 0) return "最可能";
  if (index === 1) return "可能";
  if (index === 2) return "不太可能";
  return "基本排除";
};
