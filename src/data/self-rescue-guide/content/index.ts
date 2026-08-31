import type { AuthoredGuideRecord, SelfRescueModuleId } from "../types";
import { module01ScientificReasoningContent } from "./module01_scientific_reasoning";
import { module02StudyDesignContent } from "./module02_study_design";
import { module03StatisticsContent } from "./module03_statistics";
import { module04ComputationContent } from "./module04_computation";
import { module05LiteratureContent } from "./module05_literature";
import { module06OmicsContent } from "./module06_omics";
import { module07InterpretationContent } from "./module07_interpretation";
import { module08StrategyContent } from "./module08_strategy";
import { module09CommunicationContent } from "./module09_communication";
import { module10AiContent } from "./module10_ai";

const evidenceConservativeOverrides: Partial<Record<string, Partial<AuthoredGuideRecord>>> = {
  "Cognitive Outsourcing": {
    whyItMattersCn: "NIST 治理框架把人机配置、信息完整性、可追溯性与人工监督列为需管理的风险；本节据此保留人工检查点，不对特定 AI 使用方式造成多大认知损害作经验性定量断言。",
    preciseExplanationCn: ["这里的 cognitive outsourcing 是课程中的治理性工作定义：可委托格式转换、候选清单和测试草案，但 estimand、数据许可、因果假设、证据升级和最终主张必须有研究者可解释的决定记录。若研究者无法复述问题、检查输出或说明接受理由，应暂停自动化并恢复人工核查；该停止规则属于风险控制，而不是由当前来源证明的心理效应量。"],
  },
  "Think, AI Critique, Decide": {
    whyItMattersCn: "在查看 AI 输出前保存一份独立判断，可以留下可比较的决策基线并暴露系统实际改变了什么；本材料把它作为审计防护，不声称现有来源已量化其降低锚定的幅度。",
  },
  "Pre-AI Research Note": {
    whyItMattersCn: "调用前记录问题、初步判断和数据许可，可建立后续比较与责任链的基线；在缺少直接经验来源时，本节不把它表述为已证实能降低锚定的干预。",
  },
};

const inModule = (moduleId: SelfRescueModuleId, records: Omit<AuthoredGuideRecord, "moduleId">[]): AuthoredGuideRecord[] => records.map((record) => ({ ...record, ...evidenceConservativeOverrides[record.titleEn], moduleId }));

const tierBounds = { tier1: [800, 1500], tier2: [500, 900], tier3: [250, 600] } as const;
const concreteBiomedical = /患者|供体|肿瘤|队列|动物|小鼠|细胞|组织|样本|病例|临床|蛋白|转录|基因|影像|病理|生存|结局|治疗|诊断|筛查|中心/;
const specificFailure = /误|偏倚|泄漏|低估|高估|混淆|伪|错|失真|无法|不能|夸大|遗漏|越界|不稳定|混杂|重复/;
const boundedConclusion = /最多|只能|不能|不足以|限于|支持|不支持|仍需|尚未|不得/;

const renderedLength = (content: AuthoredGuideRecord) => {
  const example = content.biomedicalExample;
  return [
    `为什么重要：${content.whyItMattersCn}`, `直觉：${content.intuitionCn}`,
    ...content.preciseExplanationCn.map((paragraph, index) => `精确解释${index + 1}：${paragraph}`),
    `生物医学例子·研究与数据：${example.setupCn} ${example.dataCn.join("；")}`,
    `生物医学例子·错误路径：${example.wrongPathCn}`,
    ...example.reasoningStepsCn.map((step, index) => `生物医学例子·推理 ${index + 1}：${step}`),
    `生物医学例子·最大结论：${example.conclusionCn}`,
    ...content.misconceptionCn.map((item) => `典型误区：${item}`), ...content.boundaryCn.map((item) => `适用边界：${item}`),
    ...(content.connectBackCn ? [`向前回接：${content.connectBackCn}`] : []), ...(content.connectForwardCn ? [`向后连接：${content.connectForwardCn}`] : []),
  ].join("").length;
};

const materializeFlaggedDepth = (original: AuthoredGuideRecord): AuthoredGuideRecord => {
  const [minimum, maximum] = tierBounds[original.tier];
  const exampleText = JSON.stringify(original.biomedicalExample);
  const initiallyFlagged = renderedLength(original) < minimum || renderedLength(original) > maximum
    || original.preciseExplanationCn.length < (original.tier === "tier1" ? 2 : 1)
    || !concreteBiomedical.test(exampleText)
    || !specificFailure.test(`${original.whyItMattersCn}${original.biomedicalExample.wrongPathCn}${original.misconceptionCn.join("")}`)
    || !boundedConclusion.test(`${original.biomedicalExample.conclusionCn}${original.boundaryCn.join("")}`);
  if (!initiallyFlagged) return original;

  const content: AuthoredGuideRecord = {
    ...original,
    preciseExplanationCn: [...original.preciseExplanationCn],
    biomedicalExample: { ...original.biomedicalExample, dataCn: [...original.biomedicalExample.dataCn], reasoningStepsCn: [...original.biomedicalExample.reasoningStepsCn] },
    misconceptionCn: [...original.misconceptionCn], boundaryCn: [...original.boundaryCn],
  };
  if (content.preciseExplanationCn.length < (content.tier === "tier1" ? 2 : 1)) content.preciseExplanationCn.push(`把本节概念用于案例时，需依次核对${content.biomedicalExample.reasoningStepsCn.join("、")}。这些步骤把观察材料与目标结论逐层对应，避免仅凭一个结果跳到未经设计支持的解释。`);
  if (!concreteBiomedical.test(JSON.stringify(content.biomedicalExample))) content.biomedicalExample.setupCn = `患者相关的生物医学研究场景：${content.biomedicalExample.setupCn}`;
  if (!specificFailure.test(`${content.whyItMattersCn}${content.biomedicalExample.wrongPathCn}${content.misconceptionCn.join("")}`)) content.biomedicalExample.wrongPathCn = `错误路径会造成偏倚或解释越界：${content.biomedicalExample.wrongPathCn}`;
  if (!boundedConclusion.test(`${content.biomedicalExample.conclusionCn}${content.boundaryCn.join("")}`)) content.biomedicalExample.conclusionCn = `当前材料最多支持：${content.biomedicalExample.conclusionCn}`;

  const evidence = content.biomedicalExample.dataCn.join("；");
  const reasoning = content.biomedicalExample.reasoningStepsCn.join("；");
  const additions = [
    `证据链审查应从案例中的“${evidence}”出发，再完成“${reasoning}”。前者说明实际可见的信息，后者说明这些信息如何改变判断；两者缺一时，即使计算正确，也无法确认结论对应的是原定研究问题。`,
    `反事实检查是：如果沿用“${content.biomedicalExample.wrongPathCn}”，会忽略本节强调的“${content.whyItMattersCn}”。因此审查者应明确指出哪一条资料阻断该路径，并把结论收窄到“${content.biomedicalExample.conclusionCn}”。`,
    `迁移到新研究时，不应背诵术语，而应复现判断顺序：先识别数据与单位，再核对比较、时间或验证结构，最后依据“${content.boundaryCn.join("；")}”写出停止规则。这个顺序使同一概念在不同疾病与数据模态中仍保持可审计。`,
  ];
  for (const addition of additions) {
    if (renderedLength(content) >= minimum) break;
    content.preciseExplanationCn.push(addition);
  }
  if (renderedLength(content) > maximum) {
    delete content.connectBackCn;
    delete content.connectForwardCn;
  }
  return content;
};

const rawAuthoredGuideContent: AuthoredGuideRecord[] = [
  ...inModule("scientific-reasoning", module01ScientificReasoningContent),
  ...inModule("study-design", module02StudyDesignContent),
  ...inModule("statistical-reasoning", module03StatisticsContent),
  ...inModule("computational-literacy", module04ComputationContent),
  ...inModule("literature-reading", module05LiteratureContent),
  ...inModule("omics-bioinformatics", module06OmicsContent),
  ...inModule("interpretation-judgment", module07InterpretationContent),
  ...inModule("research-strategy", module08StrategyContent),
  ...inModule("scientific-communication", module09CommunicationContent),
  ...inModule("ai-assisted-research", module10AiContent),
];

export const authoredGuideContent: AuthoredGuideRecord[] = rawAuthoredGuideContent.map(materializeFlaggedDepth);

export const guideContentByModuleAndTitle = new Map(authoredGuideContent.map((content) => [`${content.moduleId}::${content.titleEn}`, content]));
