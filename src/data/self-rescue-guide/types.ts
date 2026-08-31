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

export type GuideTier = "tier1" | "tier2" | "tier3";

export interface AuthoredBiomedicalExample {
  setupCn: string;
  dataCn: string[];
  wrongPathCn: string;
  reasoningStepsCn: string[];
  conclusionCn: string;
}

/**
 * Topic-specific textbook prose. These fields are authored per topic; build-time
 * code may arrange them for rendering but must never synthesize their meaning.
 */
export interface AuthoredGuideContent {
  titleEn: string;
  tier: GuideTier;
  whyItMattersCn: string;
  intuitionCn: string;
  preciseExplanationCn: string[];
  biomedicalExample: AuthoredBiomedicalExample;
  misconceptionCn: string[];
  boundaryCn: string[];
  connectBackCn?: string;
  connectForwardCn?: string;
  evidenceSourceIds?: string[];
}

export interface AuthoredGuideRecord extends AuthoredGuideContent {
  moduleId: SelfRescueModuleId;
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
