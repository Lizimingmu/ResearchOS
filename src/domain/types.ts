import type {
  DiagnosticCause,
  DiagnosticCheck,
  DiagnosticEvidence,
  DiagnosticPath,
  DiagnosticSession,
  EvidenceClaim,
  EvidenceSourceReg,
  ProblemCard,
  ProblemSearchLogEntry,
  ProblemTrainingCase,
  SourcePackImportRecord,
} from "./problemAtlas";
import type {
  ContentConflict,
  ContentRevisionRecord,
  ObsidianConnectionSettings,
  ObsidianPublishBatch,
  PersonalContentEntry,
} from "./contentStudio";
import type {
  LearningActivityType,
  LearningEventV1,
  LearnerUnitStateV1,
} from "./learningKernel";
import type { ProjectStudioRecordV1, ResearchCaseSessionV1, TransferArtifactV1 } from "./learningArchitecture";

export type ContentOrigin = "verified_seed" | "verified_external" | "user" | "ai_generated" | "external_source_pack";
export type VerificationStatus = "verified" | "pending" | "rejected" | "not_required";
export type EvidenceTier = "A" | "B" | "C" | "D";
export type Confidence = 1 | 2 | 3 | 4;
export type DifficultyLevel = "foundation" | "intermediate" | "advanced" | "frontier";
export type VerificationScope = "identifier" | "metadata" | "claim" | "not_applicable";

export interface EvidenceSource {
  id: string;
  title: string;
  sourceName: string;
  year?: number;
  tier: EvidenceTier;
  sourceType: "primary_research" | "guideline" | "methods" | "exemplary_paper" | "official_documentation";
  doi?: string;
  pmid?: string;
  url?: string;
  coreEvidence: string;
  verificationStatus: VerificationStatus;
  verificationScope?: VerificationScope;
  lastVerifiedAt?: string;
  contentOrigin: ContentOrigin;
}

export interface MethodConcept {
  id: string;
  title: string;
  domain: "clinical" | "statistics" | "single-cell" | "omics" | "prediction";
  minutes: number;
  whyItMatters: string;
  coreConcept: string;
  minimalExample: string;
  commonWrongPractice: string;
  reviewerAttack: string;
  whenToUse: string;
  whenNotToUse: string;
  transferPrompt: string;
  sourceIds: string[];
  status: "usable" | "draft";
  tags: string[];
  contentOrigin: ContentOrigin;
  verificationStatus: VerificationStatus;
  difficulty?: DifficultyLevel;
  misconceptionTags?: string[];
}

export interface ResearchPattern {
  id: string;
  title: string;
  scientificQuestion: string;
  evidenceChain: string[];
  figureOrder: string[];
  mustHave: string[];
  optionalEnhancements: string[];
  failureModes: string[];
  reviewerAttacks: string[];
  overclaims: string[];
  highLevelAdds: string[];
  sourceIds: string[];
  contentOrigin: ContentOrigin;
  verificationStatus: VerificationStatus;
  difficulty?: DifficultyLevel;
  misconceptionTags?: string[];
}

export interface JudgmentCard {
  id: string;
  title: string;
  domain: string;
  study: string;
  analysis: string;
  claim: string;
  question: string;
  expectedFindings: string[];
  betterApproach: string;
  maximalConclusion: string;
  severity: "minor" | "major" | "critical";
  sourceIds: string[];
  contentOrigin: ContentOrigin;
  verificationStatus: VerificationStatus;
  difficulty?: DifficultyLevel;
  misconceptionTags?: string[];
  variantPrompt?: string;
}

export interface AuditStep {
  id: string;
  text: string;
  expected: "approve" | "question" | "reject";
  issue?: string;
  severity?: "minor" | "major" | "critical";
}

export interface AuditCase {
  id: string;
  title: string;
  domain: string;
  task: string;
  context: string;
  steps: AuditStep[];
  missedRisks: string[];
  seniorSummary: string;
  transferPrompt: string;
  sourceIds: string[];
  contentOrigin: ContentOrigin;
  verificationStatus: VerificationStatus;
  difficulty?: DifficultyLevel;
  misconceptionTags?: string[];
  variantPrompt?: string;
}

export interface Paper {
  id: string;
  title: string;
  pdfPath?: string;
  doi?: string;
  pmid?: string;
  journal?: string;
  year?: number;
  tags: string[];
  researchType: string;
  topic: string;
  readStatus: "unread" | "reading" | "read";
  trainingStatus: "none" | "active" | "completed";
  favorite: boolean;
  notes: string;
  currentPage: number;
  createdAt: string;
  contentOrigin: ContentOrigin;
  verificationStatus: VerificationStatus;
}

export interface Project {
  id: string;
  name: string;
  disease: string;
  studyType: string;
  cohort: string;
  omics: string;
  outcome: string;
  currentStage: string;
  scientificQuestion: string;
  bottleneck: string;
  activeMethods: string;
  targetJournal: string;
  notes: string;
  createdAt: string;
}

export interface UserResponse {
  id: string;
  taskId: string;
  userText: string;
  submittedAt: string;
  confidence: Confidence;
  locked: true;
  correctness?: number;
  feedback?: string;
  transferText?: string;
  projectId?: string;
  aiReview?: AIReviewRecord;
}

export interface StructuredAiReview {
  correct: string[];
  missed: string[];
  severity: "minor" | "major" | "critical" | "uncertain";
  why: string;
  transfer: string;
  uncertainty: string;
}

export interface AIReviewRecord {
  id: string;
  providerId: string;
  model: string;
  createdAt: string;
  verificationStatus: "pending";
  raw: string;
  structured?: StructuredAiReview;
  parseWarning?: string;
}

export interface ReviewItem {
  id: string;
  conceptId: string;
  conceptType: "method" | "judgment" | "audit" | "paper" | "problem";
  prompt: string;
  difficulty: number;
  stability: number;
  retrievability: number;
  due: string;
  lastReview?: string;
  lapses: number;
  lastResponseQuality?: number;
  lastConfidence?: Confidence;
  dangerousMisconception: boolean;
  misconceptionId?: string;
  variantPrompt?: string;
  isVariant?: boolean;
}

export interface ReviewLog {
  id: string;
  reviewItemId: string;
  reviewedAt: string;
  correctness: number;
  confidence: Confidence;
  nextDue: string;
}

export interface SkillEvidence {
  id: string;
  skillId: string;
  taskId: string;
  score: number;
  delayed: boolean;
  blindTransfer: boolean;
  confidence: Confidence;
  createdAt: string;
  responseId?: string;
  conceptId?: string;
  difficulty?: DifficultyLevel;
  misconceptionId?: string;
}

export interface DraftResponse {
  taskId: string;
  userText: string;
  confidence: Confidence;
  transferText: string;
  projectId?: string;
  updatedAt: string;
}

export interface Misconception {
  id: string;
  conceptId: string;
  conceptType: ReviewItem["conceptType"];
  sourceTaskId: string;
  statement: string;
  variantPrompt: string;
  detectedAt: string;
  lastTestedAt?: string;
  resolvedAt?: string;
  confidence: Confidence;
  evidenceCount: number;
  status: "unresolved" | "retesting" | "resolved";
}

export interface OnboardingState {
  completed: boolean;
  interests: string[];
  familiarity: Record<string, "new" | "working" | "experienced">;
  baselineCompleted: boolean;
  completedAt?: string;
  tutorialCompletedAt?: string;
  tutorialSkippedAt?: string;
  learningKernelOnboardingCompletedAt?: string;
  learningKernelOnboardingSkippedAt?: string;
  targetLevel?: "foundation" | "working" | "independent";
  researchTypes?: string[];
  foundationGaps?: string[];
  allowProjectRelevance?: boolean;
}

export interface LessonProgressState {
  unitId: string;
  currentStepId: string;
  completedStepIds: string[];
  updatedAt: string;
}

export interface ResearchRoutineSettings {
  weeklyPapers: number;
  weeklyConcepts: number;
  weeklyProjectReflections: number;
  monthlyCompetenceReviews: number;
}

export interface ResearchRoutineLog {
  id: string;
  routineType: "think_before_ai" | "paper_reading" | "concept_learning" | "project_reflection" | "competence_review";
  status: "completed" | "partially_completed" | "skipped";
  occurredAt: string;
  projectId?: string;
  paperId?: string;
}

export interface ResearchReasoningRecord {
  id: string;
  projectId?: string;
  source: "project" | "today" | "learning_transfer";
  question: string;
  known: string;
  biggestUnknown: string;
  nextStep: string;
  rationale: string;
  uncertainty: string;
  postAiChanged?: string;
  postAiAccepted?: string;
  postAiRejected?: string;
  postAiWhy?: string;
  createdAt: string;
}

export interface PaperCardRecord {
  paperId: string;
  researchQuestion: string;
  whyImportant: string;
  studyDesign: string;
  figureEvidenceJobs: string;
  mainClaim: string;
  weakestEvidence: string;
  alternativeExplanation: string;
  transferableLesson: string;
  statisticalUnit?: string;
  confounding?: string;
  validation?: string;
  majorConcern?: string;
  evidenceConclusionMismatch?: string;
  maximumDefensibleClaim?: string;
  reviewerCritique?: string;
  updatedAt: string;
}

export interface AIProvider {
  id: string;
  name: string;
  template: "openai" | "deepseek" | "ollama" | "custom";
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  hasApiKey: boolean;
}

export interface AppSettings {
  language: "zh-CN" | "en-US";
  theme: "light" | "dark" | "system";
  startPage: string;
  dailyMinutes: number;
  weights: {
    weakness: number;
    projectRelevance: number;
    frontierValue: number;
    reviewDue: number;
    misconception: number;
  };
  pubmedVerification: boolean;
  doiVerification: boolean;
  offlineMode: boolean;
  activeProviderId: string;
}

export interface AppStateData {
  schemaVersion: number;
  papers: Paper[];
  projects: Project[];
  responses: UserResponse[];
  reviewItems: ReviewItem[];
  reviewLogs: ReviewLog[];
  skillEvidence: SkillEvidence[];
  providers: AIProvider[];
  settings: AppSettings;
  completedTaskIds: string[];
  snoozedTaskIds: string[];
  assessmentHistory: AssessmentResult[];
  notesByPaperId: Record<string, string>;
  draftResponses: Record<string, DraftResponse>;
  misconceptions: Misconception[];
  onboarding: OnboardingState;
  problemAtlasSources: EvidenceSourceReg[];
  problemAtlasClaims: EvidenceClaim[];
  problemCards: ProblemCard[];
  diagnosticCauses: DiagnosticCause[];
  diagnosticChecks: DiagnosticCheck[];
  diagnosticPaths: DiagnosticPath[];
  diagnosticEvidence: DiagnosticEvidence[];
  problemTrainingCases: ProblemTrainingCase[];
  diagnosticSessions: DiagnosticSession[];
  sourcePackImports: SourcePackImportRecord[];
  problemSearchLog: ProblemSearchLogEntry[];
  personalContent: PersonalContentEntry[];
  contentRevisionHistory: ContentRevisionRecord[];
  contentConflicts: ContentConflict[];
  learnerUnitStates: LearnerUnitStateV1[];
  learningEvents: LearningEventV1[];
  pausedLearningUnitIds: string[];
  lessonProgressByUnitId: Record<string, LessonProgressState>;
  routineSettings: ResearchRoutineSettings;
  routineLogs: ResearchRoutineLog[];
  reasoningRecords: ResearchReasoningRecord[];
  paperCards: Record<string, PaperCardRecord>;
  guideReadSectionIds: string[];
  caseSessions: ResearchCaseSessionV1[];
  transferArtifacts: TransferArtifactV1[];
  projectStudioRecords: ProjectStudioRecordV1[];
  obsidianConnection?: ObsidianConnectionSettings;
  obsidianPublishBatches: ObsidianPublishBatch[];
}

export interface AssessmentResult {
  id: string;
  createdAt: string;
  answers: Record<string, string>;
  confidence: Confidence;
  score?: number;
  sourceCase: string;
  kind?: "baseline" | "blind";
  rubricVersion?: string;
  domainScores?: Record<string, number>;
}

export type ViewId = "today" | "guide" | "learning" | "practice" | "case-lab" | "library" | "paper-lab" | "methods" | "review" | "ai-audit" | "frontier" | "projects" | "skills" | "problem-atlas" | "content-studio" | "assessment" | "settings";

export interface DailyTask {
  id: string;
  type: "learning" | "retrieval" | "paper" | "method" | "audit" | "problem" | "transfer";
  title: string;
  subtitle: string;
  minutes: number;
  priority: number;
  targetId: string;
  destination: ViewId;
  rationale: string;
  learningActivityType?: LearningActivityType;
  stageAtScheduling?: LearnerUnitStateV1["stage"];
}
