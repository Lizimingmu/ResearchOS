import type { CapabilityId } from "../../domain/learningArchitecture";
import type { CurriculumClaimV1, CurriculumContentType, CurriculumManifestItemV1 } from "../../domain/curriculum";
import { canonicalJson, sha256 } from "../../services/contentStudio";
import { evidenceById } from "../evidence";
import { selfRescueGuideHashes, selfRescueGuideSections } from "../self-rescue-guide";
import { stagedConceptLessons, stagedConceptLessonsM0191b } from "./concepts";
import { stagedCaseLabs, studioTemplates } from "./cases";
import { stagedMethodLessons } from "./methods";

const capabilitiesByModule: Record<string, CapabilityId[]> = {
  "scientific-reasoning": ["scientific_question", "result_interpretation"],
  "study-design": ["study_design", "statistical_reasoning"],
  "statistical-reasoning": ["statistical_reasoning", "result_interpretation"],
  "computational-literacy": ["ai_oversight", "result_interpretation"],
  "literature-reading": ["literature_reading", "result_interpretation"],
  "omics-bioinformatics": ["omics_reasoning", "statistical_reasoning", "result_interpretation"],
  "interpretation-judgment": ["result_interpretation", "next_step_design"],
  "research-strategy": ["scientific_question", "next_step_design"],
  "scientific-communication": ["literature_reading", "result_interpretation"],
  "ai-assisted-research": ["ai_oversight", "result_interpretation"],
};

const conceptByGuide = new Map(stagedConceptLessons.map((lesson) => [lesson.guideSectionId, lesson]));
const methodByGuide = new Map(stagedMethodLessons.flatMap((lesson) => lesson.guideSectionIds.map((id) => [id, lesson] as const)));
const caseGuideTitles = new Set(["Research Question", "Evidence vs Claim", "Confounding", "Statistical Unit", "Overfitting", "Negative Results", "Molecular subtype", "Why scRNA may not reproduce bulk proteomics", "Composition vs within-state expression", "Figure evidence jobs", "Alternative Explanation", "Auditing AI analysis plans"]);

const recommendedTypes = (guideId: string, titleCn: string, titleEn: string): CurriculumContentType[] => {
  const result: CurriculumContentType[] = ["guide"];
  if (conceptByGuide.has(guideId)) result.push("concept_lesson");
  if (methodByGuide.has(guideId)) result.push("method_lesson");
  if (caseGuideTitles.has(titleCn) || caseGuideTitles.has(titleEn)) result.push("case_lab");
  if (/paper|Figure|claim|project|AI|next|communication|review/i.test(`${titleCn} ${titleEn}`)) result.push("studio");
  return [...new Set(result)];
};

export const curriculumManifest: CurriculumManifestItemV1[] = selfRescueGuideSections.map((section, index) => {
  const concept = conceptByGuide.get(section.id);
  const method = methodByGuide.get(section.id);
  const types = recommendedTypes(section.id, section.titleCn, section.titleEn);
  const moduleIndex = Number(section.id.match(/m(\d+)/)?.[1] ?? 0);
  return {
    schemaVersion: 1,
    id: `curriculum-${section.id}`,
    guideSectionId: section.id,
    moduleId: section.chapterId,
    titleCn: section.titleCn,
    titleEn: section.titleEn,
    classification: section.classification,
    capabilityIds: capabilitiesByModule[section.chapterId] ?? ["result_interpretation"],
    prerequisiteIds: concept?.prerequisiteIds ?? method?.prerequisiteIds ?? (index > 0 && selfRescueGuideSections[index - 1].chapterId === section.chapterId ? [`curriculum-${selfRescueGuideSections[index - 1].id}`] : []),
    recommendedContentTypes: types,
    estimatedMinutes: method?.estimatedMinutes ?? concept?.estimatedMinutes ?? (types.includes("case_lab") ? 12 : 5),
    threadEligibility: moduleIndex <= 5 ? ["foundation", "project_overlay"] : ["project_overlay", "foundation"],
    projectRelevanceTerms: [section.titleCn, section.titleEn, section.chapterId],
    scientificRisk: [2, 3, 6, 7, 10].includes(moduleIndex) ? "HIGH" : [1, 5, 8, 9].includes(moduleIndex) ? "MEDIUM" : "LOW",
    sourceRequirements: section.evidenceSourceIds,
    implementationStatus: "generated",
    contentOrigin: "ai_generated",
    verificationStatus: "pending",
    lifecycle: "pending_review",
  };
});

const claim = (contentId: string, claimCn: string, sourceIds: string[], suffix: string): CurriculumClaimV1 => ({
  id: `claim-${contentId}-${suffix}`, contentId, claimCn, sourceIds,
  evidenceBoundaryCn: suffix === "case-calibration"
    ? "这是虚构课程场景中的校准规则；场景数值不是外部论文结果，来源仅支持所用方法与解释边界。"
    : suffix === "method-core"
      ? "这是对方法核心逻辑的课程化综合；来源支持方法原理，但不表示原文逐字给出本课程表述。"
      : "这是课程综合主张；来源分别支持其核心证据范围，不表示任一来源逐字提出整段教学规则。",
  supportMode: "curriculum_synthesis",
  supportStatus: "claim_level_review_pending",
  identifierVerified: sourceIds.every((id) => Boolean(evidenceById[id]?.doi || evidenceById[id]?.pmid || evidenceById[id]?.url)),
  metadataVerified: sourceIds.every((id) => evidenceById[id]?.verificationStatus === "verified"),
});

export const curriculumClaims: CurriculumClaimV1[] = [
  ...selfRescueGuideSections.map((section) => claim(section.id, section.summaryCn, section.evidenceSourceIds, "guide-summary")),
  // Pedagogical assessment repairs cannot silently rewrite existing canonical claims.
  ...stagedConceptLessonsM0191b.map((lesson) => claim(lesson.id, lesson.primaryApply.maximumConclusionCn, lesson.sourceIds, "concept-boundary")),
  ...stagedMethodLessons.map((lesson) => claim(lesson.id, lesson.coreLogicCn, lesson.sourceIds, "method-core")),
  ...stagedCaseLabs.map((caseLab) => claim(caseLab.id, caseLab.stages.at(-1)?.calibrationCn ?? caseLab.initialContextCn, caseLab.sourceIds, "case-calibration")),
];

export const curriculumContentHashes = {
  guide: selfRescueGuideHashes,
  manifest: sha256(canonicalJson(curriculumManifest)),
  concepts: Object.fromEntries(stagedConceptLessons.map((item) => [item.id, sha256(canonicalJson(item))])),
  methods: Object.fromEntries(stagedMethodLessons.map((item) => [item.id, sha256(canonicalJson(item))])),
  cases: Object.fromEntries(stagedCaseLabs.map((item) => [item.id, sha256(canonicalJson(item))])),
  studios: Object.fromEntries(studioTemplates.map((item) => [item.id, sha256(canonicalJson(item))])),
  claims: sha256(canonicalJson(curriculumClaims)),
};

export const frozenCurriculumSnapshot = {
  schemaVersion: 1,
  generatedAt: "2026-08-31T00:00:00+08:00",
  status: "pending_review" as const,
  guideSections: selfRescueGuideSections,
  manifest: curriculumManifest,
  conceptLessons: stagedConceptLessons,
  methodLessons: stagedMethodLessons,
  caseLabs: stagedCaseLabs,
  studioTemplates,
  claims: curriculumClaims,
  hashes: curriculumContentHashes,
};
