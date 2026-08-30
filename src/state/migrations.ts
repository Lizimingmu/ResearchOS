import type { AppStateData, ReviewItem, SkillEvidence } from "../domain/types";

export const CURRENT_STATE_SCHEMA = 5;

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null && !Array.isArray(value);

function arrayOr<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? value as T[] : fallback;
}

function recordOr<T>(value: unknown, fallback: Record<string, T>): Record<string, T> {
  return isRecord(value) ? value as Record<string, T> : fallback;
}

/**
 * Migrates persisted user state without discarding unknown/newer user data.
 * A future schema is rejected so hydration cannot silently overwrite it.
 */
export function migratePersistedState(raw: unknown, defaults: AppStateData): AppStateData {
  if (!isRecord(raw)) return defaults;
  const sourceVersion = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 1;
  if (sourceVersion > CURRENT_STATE_SCHEMA) {
    throw new Error(`此工作区使用状态架构 v${sourceVersion}；当前版本支持 v${CURRENT_STATE_SCHEMA}。数据库未被修改。`);
  }

  const settings = isRecord(raw.settings) ? raw.settings : {};
  const weights = isRecord(settings.weights) ? settings.weights : {};
  const migratedReviewItems = arrayOr<ReviewItem>(raw.reviewItems, defaults.reviewItems).map((item) => ({
    ...item,
    dangerousMisconception: Boolean(item.dangerousMisconception),
    isVariant: Boolean(item.isVariant),
  }));
  const migratedSkillEvidence = arrayOr<SkillEvidence>(raw.skillEvidence, defaults.skillEvidence).map((item) => ({
    ...item,
    conceptId: item.conceptId ?? item.taskId,
  }));
  const migratedSessions = arrayOr(raw.diagnosticSessions, defaults.diagnosticSessions).map((session) => ({
    ...session,
    steps: Array.isArray(session.steps) ? session.steps : [],
  }));
  const migratedOnboarding = isRecord(raw.onboarding)
    ? {
        ...defaults.onboarding,
        ...raw.onboarding,
        learningKernelOnboardingCompletedAt: typeof raw.onboarding.learningKernelOnboardingCompletedAt === "string"
          ? raw.onboarding.learningKernelOnboardingCompletedAt
          : undefined,
        learningKernelOnboardingSkippedAt: typeof raw.onboarding.learningKernelOnboardingSkippedAt === "string"
          ? raw.onboarding.learningKernelOnboardingSkippedAt
          : undefined,
      } as AppStateData["onboarding"]
    : defaults.onboarding;

  return {
    ...defaults,
    schemaVersion: CURRENT_STATE_SCHEMA,
    papers: arrayOr(raw.papers, defaults.papers),
    projects: arrayOr(raw.projects, defaults.projects),
    responses: arrayOr(raw.responses, defaults.responses),
    reviewItems: migratedReviewItems,
    reviewLogs: arrayOr(raw.reviewLogs, defaults.reviewLogs),
    skillEvidence: migratedSkillEvidence,
    providers: arrayOr(raw.providers, defaults.providers),
    settings: {
      ...defaults.settings,
      ...settings,
      weights: {
        ...defaults.settings.weights,
        ...weights,
      },
    } as AppStateData["settings"],
    completedTaskIds: arrayOr(raw.completedTaskIds, defaults.completedTaskIds),
    snoozedTaskIds: arrayOr(raw.snoozedTaskIds, defaults.snoozedTaskIds),
    assessmentHistory: arrayOr(raw.assessmentHistory, defaults.assessmentHistory),
    notesByPaperId: recordOr(raw.notesByPaperId, defaults.notesByPaperId),
    draftResponses: recordOr(raw.draftResponses, defaults.draftResponses),
    misconceptions: arrayOr(raw.misconceptions, defaults.misconceptions),
    onboarding: migratedOnboarding,
    problemAtlasSources: arrayOr(raw.problemAtlasSources, defaults.problemAtlasSources),
    problemAtlasClaims: arrayOr(raw.problemAtlasClaims, defaults.problemAtlasClaims),
    problemCards: arrayOr(raw.problemCards, defaults.problemCards),
    diagnosticCauses: arrayOr(raw.diagnosticCauses, defaults.diagnosticCauses),
    diagnosticChecks: arrayOr(raw.diagnosticChecks, defaults.diagnosticChecks),
    diagnosticPaths: arrayOr(raw.diagnosticPaths, defaults.diagnosticPaths),
    diagnosticEvidence: arrayOr(raw.diagnosticEvidence, defaults.diagnosticEvidence),
    problemTrainingCases: arrayOr(raw.problemTrainingCases, defaults.problemTrainingCases),
    diagnosticSessions: migratedSessions,
    sourcePackImports: arrayOr(raw.sourcePackImports, defaults.sourcePackImports),
    problemSearchLog: arrayOr(raw.problemSearchLog, defaults.problemSearchLog),
    personalContent: arrayOr(raw.personalContent, defaults.personalContent),
    contentRevisionHistory: arrayOr(raw.contentRevisionHistory, defaults.contentRevisionHistory),
    contentConflicts: arrayOr(raw.contentConflicts, defaults.contentConflicts),
    // M016 Learning Kernel (schema 5): empty-by-default collections. Migration
    // must NEVER infer instruction exposure or competence from legacy fields
    // (completedTaskIds, tutorials, old skillEvidence, …) — see
    // .agent/M016_LEARNING_KERNEL_MIGRATION.md.
    learnerUnitStates: arrayOr(raw.learnerUnitStates, defaults.learnerUnitStates),
    learningEvents: arrayOr(raw.learningEvents, defaults.learningEvents),
    pausedLearningUnitIds: arrayOr(raw.pausedLearningUnitIds, defaults.pausedLearningUnitIds),
    obsidianConnection: isRecord(raw.obsidianConnection)
      ? raw.obsidianConnection as unknown as AppStateData["obsidianConnection"]
      : defaults.obsidianConnection,
    obsidianPublishBatches: arrayOr(raw.obsidianPublishBatches, defaults.obsidianPublishBatches),
  };
}
