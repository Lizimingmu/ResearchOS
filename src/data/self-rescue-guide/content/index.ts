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

export const authoredGuideContent: AuthoredGuideRecord[] = [
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

export const guideContentByModuleAndTitle = new Map(authoredGuideContent.map((content) => [`${content.moduleId}::${content.titleEn}`, content]));
