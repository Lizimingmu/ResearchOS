export interface StarterDay {
  day: number;
  theme: string;
  methodIds: string[];
  judgmentIds: string[];
  auditIds: string[];
  paperExercise?: string;
  transfer: string;
}

export const starterTrack: StarterDay[] = [
  { day: 1, theme: "Independent units", methodIds: ["statistical-unit", "biological-replicate", "scrna-deg-pseudobulk"], judgmentIds: ["jc-01"], auditIds: ["audit-01"], transfer: "Map exposure, measurement, and inference units in your current project." },
  { day: 2, theme: "Question → evidence → claim", methodIds: ["causal-language", "double-dipping"], judgmentIds: ["jc-30"], auditIds: ["audit-12"], paperExercise: "Reconstruct a five-figure evidence chain before reading the legends.", transfer: "Rewrite your central claim at the maximum evidence-supported level." },
  { day: 3, theme: "Survival reasoning", methodIds: ["cox-ph", "confidence-interval", "multivariable-adjustment"], judgmentIds: ["jc-02", "jc-17"], auditIds: ["audit-02"], transfer: "Specify time zero, event, censoring, and event count for your survival analysis." },
  { day: 4, theme: "Validation and leakage", methodIds: ["discovery-validation", "internal-validation", "external-validation", "overfitting", "data-leakage"], judgmentIds: ["jc-04", "jc-24"], auditIds: ["audit-03", "audit-14"], transfer: "Draw the locked objects and untouched evaluation data in your workflow." },
  { day: 5, theme: "Subtype papers", methodIds: ["clustering-stability", "pathway-enrichment", "candidate-model-selection"], judgmentIds: ["jc-16"], auditIds: ["audit-07"], paperExercise: "Label the evidence job of each figure in a molecular subtype paper.", transfer: "Define two stability perturbations and one external assignment test." },
  { day: 6, theme: "Single-cell claims", methodIds: ["cluster-annotation", "cell-proportion-testing", "cell-communication-limits", "trajectory-limits"], judgmentIds: ["jc-12", "jc-13", "jc-14", "jc-25"], auditIds: ["audit-04"], transfer: "Choose one single-cell claim and name its patient-level and orthogonal validation." },
  { day: 7, theme: "Blind mini-review", methodIds: [], judgmentIds: ["jc-29", "jc-30"], auditIds: ["audit-11"], paperExercise: "Complete the blind assessment without opening reference material.", transfer: "Create one action for the weakest concept revealed this week." },
];

export const blindAssessmentPrompts = [
  "识别主要科学问题和目标人群。",
  "识别研究设计与独立统计单位（Statistical Unit）。",
  "用 4–6 个步骤重建证据链。",
  "指出最强证据，并解释其证据层级。",
  "识别三项重大问题（Major Concerns）。",
  "给出最大可接受结论。",
  "预测审稿人最可能提出的关键质疑。",
  "审核所提出的 AI 分析方案。",
];
