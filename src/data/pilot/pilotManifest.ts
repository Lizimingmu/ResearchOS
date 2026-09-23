/**
 * ResearchOS Pilot Safety Manifest
 * 
 * Strict Pilot Safety Eligibility Layer for Tomorrow's User Pilot Trial.
 * Governs topic eligibility, assessment competence safety gates, and session state.
 * 
 * Safety invariants:
 * 1. None of the 26 author/external-reviewer disagreement assessments may generate
 *    standardized competence evidence or advance user competence levels.
 * 2. Main pilot path strictly excludes topics containing disputed assessments.
 * 3. Does not alter canonical KnowledgeUnit schemas, lifecycles, or verification statuses.
 */

export interface PilotTopicEligibility {
  lessonId: string;
  titleCn: string;
  assessmentIds: string[];
  assetIds: string[];
  eligible: boolean;
  reason: string;
  competenceScoringAllowed: boolean;
}

export interface PilotFeedbackRecord {
  id: string;
  lessonId: string;
  timestamp: string;
  durationSeconds?: number;
  difficulty: "too_easy" | "just_right" | "too_hard";
  issueTags: string[];
  freeText: string;
  lessonCompleted: boolean;
  aiHelpRequested?: boolean;
}

export const PILOT_FEEDBACK_ISSUE_TAGS = [
  "太长",
  "太抽象",
  "看不懂术语",
  "例子不好",
  "题目不清楚",
  "Feedback 没帮助",
  "页面操作不顺",
  "没有明显问题",
] as const;

/**
 * 26 Assessments with author / external blind reviewer disagreement
 * from M019_1C_FRESH_EXTERNAL_BLIND_COMPARISON.json.
 */
export const DISAGREEMENT_ANONYMOUS_IDS: readonly string[] = [
  "A009", "A014", "A015", "A021", "A041", "A048", "A050", "A057",
  "A077", "A078", "A079", "A080", "A084", "A085", "A086", "A087",
  "A102", "A105", "A113", "A125", "A138", "A144", "A159", "A171",
  "A177", "A180"
] as const;

export const DISAGREEMENT_ASSET_IDS: readonly string[] = [
  "staged-concept-evidence-claim-review-v3",
  "staged-concept-exploratory-confirmatory-remediation-v2",
  "staged-concept-exploratory-confirmatory-review-v3",
  "staged-concept-biological-technical-replicate-review-v3",
  "staged-concept-standard-error-remediation-v2",
  "staged-concept-p-value-review-v3",
  "staged-concept-multiple-testing-fdr-remediation-v2",
  "staged-concept-interaction-review-v2",
  "staged-concept-composition-state-remediation-v3",
  "staged-concept-composition-state-review-v3",
  "staged-concept-batch-effect-apply-v2",
  "staged-concept-batch-effect-remediation-v2",
  "staged-concept-bulk-mixture-review-v3",
  "staged-concept-rna-protein-apply-v2",
  "staged-concept-rna-protein-remediation-v2",
  "staged-concept-rna-protein-review-v2",
  "staged-concept-claim-boundary-review-v3",
  "staged-concept-robustness-review-v3",
  "staged-concept-evidence-redundancy-remediation-v3",
  "staged-method-correlation-remediation-v2",
  "staged-method-kaplan-logrank-review-v3",
  "staged-method-bootstrap-review-v3",
  "staged-method-nmf-review-v3",
  "staged-method-wgcna-review-v3",
  "staged-method-differential-abundance-review-v3",
  "staged-method-trajectory-pseudotime-review-v3"
] as const;

const disagreementAnonymousSet = new Set(DISAGREEMENT_ANONYMOUS_IDS);
const disagreementAssetSet = new Set(DISAGREEMENT_ASSET_IDS);

/**
 * Returns false if the given assessment ID or asset ID is among the 26 disputed items.
 * Disputed assessments are strictly prohibited from generating standardized competence evidence.
 */
export function isAssessmentCompetenceAllowed(assessmentOrAssetId: string | undefined): boolean {
  if (!assessmentOrAssetId) return false;
  if (disagreementAnonymousSet.has(assessmentOrAssetId)) return false;
  if (disagreementAssetSet.has(assessmentOrAssetId)) return false;
  return true;
}

/**
 * 8 Safe Foundation Topics selected for Tomorrow's User Pilot Trial.
 * Guaranteed 100% blind agreement on all assessments, no ambiguities, full bindings.
 */
export const PILOT_SELECTED_TOPICS: readonly PilotTopicEligibility[] = [
  {
    lessonId: "staged-concept-statistical-unit",
    titleCn: "统计单位",
    assessmentIds: ["A016", "A017", "A018"],
    assetIds: [
      "staged-concept-statistical-unit-apply-v2",
      "staged-concept-statistical-unit-remediation-v2",
      "staged-concept-statistical-unit-review-v2"
    ],
    eligible: true,
    reason: "100% blind agreement, zero ambiguities, valid bindings",
    competenceScoringAllowed: true
  },
  {
    lessonId: "staged-concept-pseudoreplication",
    titleCn: "伪重复",
    assessmentIds: ["A022", "A023", "A024"],
    assetIds: [
      "staged-concept-pseudoreplication-apply-v2",
      "staged-concept-pseudoreplication-remediation-v2",
      "staged-concept-pseudoreplication-review-v2"
    ],
    eligible: true,
    reason: "100% blind agreement, zero ambiguities, valid bindings",
    competenceScoringAllowed: true
  },
  {
    lessonId: "staged-concept-confounding",
    titleCn: "混杂",
    assessmentIds: ["A028", "A029", "A030"],
    assetIds: [
      "staged-concept-confounding-apply-v2",
      "staged-concept-confounding-remediation-v2",
      "staged-concept-confounding-review-v2"
    ],
    eligible: true,
    reason: "100% blind agreement, zero ambiguities, valid bindings",
    competenceScoringAllowed: true
  },
  {
    lessonId: "staged-concept-confidence-interval",
    titleCn: "置信区间",
    assessmentIds: ["A043", "A044", "A045"],
    assetIds: [
      "staged-concept-confidence-interval-apply-v2",
      "staged-concept-confidence-interval-remediation-v2",
      "staged-concept-confidence-interval-review-v2"
    ],
    eligible: true,
    reason: "100% blind agreement, zero ambiguities, valid bindings",
    competenceScoringAllowed: true
  },
  {
    lessonId: "staged-concept-hazard-ratio",
    titleCn: "风险率比",
    assessmentIds: ["A070", "A071", "A072"],
    assetIds: [
      "staged-concept-hazard-ratio-apply-v2",
      "staged-concept-hazard-ratio-remediation-v2",
      "staged-concept-hazard-ratio-review-v2"
    ],
    eligible: true,
    reason: "100% blind agreement, zero ambiguities, valid bindings",
    competenceScoringAllowed: true
  },
  {
    lessonId: "staged-concept-alternative-explanation",
    titleCn: "替代解释",
    assessmentIds: ["A097", "A098", "A099"],
    assetIds: [
      "staged-concept-alternative-explanation-apply-v2",
      "staged-concept-alternative-explanation-remediation-v2",
      "staged-concept-alternative-explanation-review-v2"
    ],
    eligible: true,
    reason: "100% blind agreement, zero ambiguities, valid bindings",
    competenceScoringAllowed: true
  },
  {
    lessonId: "staged-concept-selection-bias",
    titleCn: "选择偏倚",
    assessmentIds: ["A031", "A032", "A033"],
    assetIds: [
      "staged-concept-selection-bias-apply-v2",
      "staged-concept-selection-bias-remediation-v2",
      "staged-concept-selection-bias-review-v2"
    ],
    eligible: true,
    reason: "100% blind agreement, zero ambiguities, valid bindings",
    competenceScoringAllowed: true
  },
  {
    lessonId: "staged-concept-internal-external-validity",
    titleCn: "内部效度与外部效度",
    assessmentIds: ["A034", "A035", "A036"],
    assetIds: [
      "staged-concept-internal-external-validity-apply-v2",
      "staged-concept-internal-external-validity-remediation-v2",
      "staged-concept-internal-external-validity-review-v2"
    ],
    eligible: true,
    reason: "100% blind agreement, zero ambiguities, valid bindings",
    competenceScoringAllowed: true
  }
] as const;

const selectedLessonIdSet = new Set(PILOT_SELECTED_TOPICS.map((t) => t.lessonId));

/**
 * Checks whether a given lesson ID is included in the approved pilot topics.
 * Also returns true for canonical verified M018 lessons (statistical-unit, confounding).
 */
export function isLessonPilotEligible(lessonId: string): boolean {
  if (selectedLessonIdSet.has(lessonId)) return true;
  if (lessonId === "concept-statistical-unit-v1" || lessonId === "concept-confounding-v1") return true;
  return false;
}
