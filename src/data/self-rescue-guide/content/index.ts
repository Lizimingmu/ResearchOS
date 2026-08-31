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

const inModule = (moduleId: SelfRescueModuleId, records: Omit<AuthoredGuideRecord, "moduleId">[]): AuthoredGuideRecord[] => records.map((record) => ({ ...record, moduleId }));

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
