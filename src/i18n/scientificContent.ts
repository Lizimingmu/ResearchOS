import type { AuditCase, AuditStep, JudgmentCard } from "../domain/types";
import { methodConcepts } from "../data/methods";
import { bilingualMethodTitle } from "./researchTerms";

const auditTitles: Record<string, string> = {
  "Cell-level DEG plan": "细胞层面差异表达（DEG）方案",
  "Survival model plan": "生存分析模型方案",
  "Model validation plan": "模型验证方案",
  "Cell proportion plan": "细胞比例分析方案",
  "Spatial mechanism plan": "空间机制研究方案",
  "Pathway enrichment plan": "通路富集分析方案",
  "Clustering plan": "无监督聚类方案",
  "Multi-omics integration plan": "多组学整合方案",
  "Biomarker plan": "生物标志物研究方案",
  "Organoid drug plan": "类器官药物实验方案",
  "Causal language plan": "因果措辞审核方案",
  "Figure narrative plan": "论文图表叙事方案",
  "Literature citation plan": "文献引用与核验方案",
  "Data leakage plan": "数据泄漏（Data Leakage）审核方案",
  "External reference plan": "外部验证资料审核方案",
};

const decisionText: Record<AuditStep["expected"], string> = {
  approve: "这一步原则上合理；请说明它保护了哪项研究设计或统计原则。",
  question: "这一步需要核查；请指出其适用前提、数据层级和仍需补充的证据。",
  reject: "这一步存在方法学问题；请指出它会造成的偏倚、泄漏、伪重复或结论越界。",
};

export function bilingualAuditTitle(item: AuditCase): string {
  if (auditTitles[item.title]) return `${auditTitles[item.title]}（${item.title}）`;
  const methodTitle = item.title.replace(/^AI plan:\s*/i, "");
  const method = methodConcepts.find((entry) => entry.title.toLowerCase() === methodTitle.toLowerCase());
  return method ? `AI 分析方案：${bilingualMethodTitle(method.id, method.title)}` : `AI 分析方案审核（${item.title}）`;
}

export function auditDisplay(item: AuditCase) {
  const title = bilingualAuditTitle(item);
  return {
    title,
    task: `请以审稿人级标准审核“${title}”，逐步判断方案是否合理、需要核查或存在问题。`,
    context: "请先识别研究问题、独立单位、数据层级、结局定义和证据边界，再评价分析步骤。原始案例情境保留在“英文原始案例”中。",
    steps: item.steps.map((entry, index) => ({ ...entry, text: `步骤 ${index + 1}：${decisionText[entry.expected]}` })),
    missedRisks: ["独立统计单位与嵌套结构", "偏倚、混杂与信息泄漏", "多重检验与不确定性", "证据层级与结论边界"],
    summary: "高级审核应先判断研究设计是否支持目标推断，再检查分析假设、独立重复和不确定性。软件能够运行，不代表方法合理；模型输出也不能自动提升证据等级。",
    transfer: "这类风险会如何出现在你的真实项目中？请写出一个可执行的核查或修改动作。",
  };
}

export function judgmentDisplay(item: JudgmentCard) {
  return {
    title: `科研判断训练：${item.title}`,
    question: "这个分析最主要的统计推断或研究设计问题是什么？请指出独立单位、潜在偏倚和最大可接受结论。",
    studyLabel: "研究情境（原文）",
    analysisLabel: "分析方案（原文）",
    claimLabel: "研究主张（原文）",
    transfer: "这种推断风险会如何出现在你的真实项目中？",
  };
}
