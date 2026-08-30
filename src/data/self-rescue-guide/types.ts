import type { ContentClassification } from "../../domain/learningArchitecture";

export type SelfRescueModuleId =
  | "scientific-reasoning"
  | "study-design"
  | "statistical-reasoning"
  | "computational-literacy"
  | "literature-reading"
  | "omics-bioinformatics"
  | "interpretation-judgment"
  | "research-strategy"
  | "scientific-communication"
  | "ai-assisted-research";

export interface GuideTopicSeed {
  titleCn: string;
  titleEn: string;
  focusCn?: string;
  classification?: ContentClassification;
  sourceIds?: string[];
}

export interface GuideModuleSpec {
  id: SelfRescueModuleId;
  order: number;
  titleCn: string;
  titleEn: string;
  purposeCn: string;
  mentalModelCn: string;
  biomedicalFrameCn: string;
  defaultSourceIds: string[];
  topics: GuideTopicSeed[];
}

export function topics(rows: string[]): GuideTopicSeed[] {
  return rows.map((row) => {
    const [titleCn, titleEn, focusCn] = row.split("|").map((item) => item.trim());
    return { titleCn, titleEn: titleEn || titleCn, focusCn: focusCn || undefined };
  });
}
