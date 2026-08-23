export type ContentOrigin = "verified_seed" | "verified_external" | "user" | "ai_generated";
export type VerificationStatus = "verified" | "pending" | "rejected" | "not_required";
export type EvidenceTier = "A" | "B" | "C" | "D";
export type Confidence = 1 | 2 | 3 | 4;

export interface EvidenceSource {
  id: string;
  title: string;
  sourceName: string;
  tier: EvidenceTier;
  sourceType: "primary_research" | "guideline" | "methods" | "exemplary_paper" | "official_documentation";
  doi?: string;
  pmid?: string;
  url?: string;
  coreEvidence: string;
  verificationStatus: VerificationStatus;
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
}

export interface ReviewItem {
  id: string;
  conceptId: string;
  conceptType: "method" | "judgment" | "audit" | "paper";
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
  theme: "light" | "dark" | "system";
  startPage: string;
  dailyMinutes: number;
  weights: {
    weakness: number;
    projectRelevance: number;
    frontierValue: number;
    reviewDue: number;
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
}

export interface AssessmentResult {
  id: string;
  createdAt: string;
  answers: Record<string, string>;
  confidence: Confidence;
  score?: number;
  sourceCase: string;
}

export type ViewId = "today" | "library" | "paper-lab" | "methods" | "review" | "ai-audit" | "frontier" | "projects" | "skills" | "assessment" | "settings";

export interface DailyTask {
  id: string;
  type: "retrieval" | "paper" | "method" | "audit" | "transfer";
  title: string;
  subtitle: string;
  minutes: number;
  priority: number;
  targetId: string;
  destination: ViewId;
  rationale: string;
}

