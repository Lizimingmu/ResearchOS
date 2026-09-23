import type { AppStateData, ReviewItem, SkillEvidence } from "../domain/types";
import { auditKnowledgeWorkspace, completeM020KnowledgeMappings } from "../services/knowledge";
import { createM020KnowledgeBaseline } from "../data/knowledge";
import { canonicalJson } from "../services/contentStudio";

export const CURRENT_STATE_SCHEMA = 9;

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
  const knowledgeWorkspace = raw.knowledgeWorkspace === undefined ? undefined
    : completeM020KnowledgeMappings(raw.knowledgeWorkspace, createM020KnowledgeBaseline(), defaults.knowledgeWorkspace);
  // A malformed canonical history is never silently replaced by today's seed.
  if (raw.knowledgeWorkspace !== undefined) {
    const audit = auditKnowledgeWorkspace(knowledgeWorkspace);
    if (!audit.ok) throw new Error(`知识版本历史无效，数据库未被修改：${audit.errors.join("；")}`);
    const workspace = knowledgeWorkspace as AppStateData["knowledgeWorkspace"];
    const seed = defaults.knowledgeWorkspace;
    for (const collection of ["units", "sources", "claims", "learningBindings"] as const) {
      if (seed[collection].some((known, index) => canonicalJson(known) !== canonicalJson(workspace[collection][index]))) {
        throw new Error(`知识历史缺少或改写了已迁移的 ${collection} 基础记录，数据库未被修改。`);
      }
    }
    const unauthorizedLegacy = workspace.learningBindings.some((binding) => binding.legacyActive && !seed.learningBindings.some((known) => known.legacyActive && canonicalJson(known) === canonicalJson(binding)));
    const unauthorizedKnowledge = workspace.units.some((unit) => (unit.lifecycle === "active" || unit.verificationStatus === "verified") && !seed.units.some((known) => canonicalJson(known) === canonicalJson(unit)));
    const unauthorizedClaim = workspace.claims.some((claim) => claim.verificationStatus === "verified" && !seed.claims.some((known) => canonicalJson(known) === canonicalJson(claim)));
    if (unauthorizedLegacy || unauthorizedKnowledge || unauthorizedClaim) throw new Error("知识记录包含未经授权的激活或兼容绑定，数据库未被修改。M020 不支持导入新的正式核验状态。");
  }
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
    knowledgeWorkspace: raw.knowledgeWorkspace === undefined
      ? structuredClone(defaults.knowledgeWorkspace)
      : structuredClone(knowledgeWorkspace) as AppStateData["knowledgeWorkspace"],
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
    // M017 schema 6 is additive and zero-inference. Old completions and skill
    // evidence must never fabricate lesson cursor, routine, reasoning or paper-card state.
    lessonProgressByUnitId: recordOr(raw.lessonProgressByUnitId, defaults.lessonProgressByUnitId),
    routineSettings: isRecord(raw.routineSettings) ? { ...defaults.routineSettings, ...raw.routineSettings } as AppStateData["routineSettings"] : defaults.routineSettings,
    routineLogs: arrayOr(raw.routineLogs, defaults.routineLogs),
    reasoningRecords: arrayOr(raw.reasoningRecords, defaults.reasoningRecords),
    paperCards: recordOr(raw.paperCards, defaults.paperCards),
    // M018 schema 7 adds distinct Guide, Case, Transfer and Project Studio
    // collections. They are empty by default: no legacy field deterministically
    // proves reading, case reasoning, transfer, or studio history.
    guideReadSectionIds: arrayOr(raw.guideReadSectionIds, defaults.guideReadSectionIds),
    // M018.1 schema 8 adds a zero-inference cursor for the distinct M018
    // content surfaces. Old completions never imply a phase or competence.
    learningContentProgress: recordOr(raw.learningContentProgress, defaults.learningContentProgress),
    caseSessions: arrayOr(raw.caseSessions, defaults.caseSessions),
    transferArtifacts: arrayOr(raw.transferArtifacts, defaults.transferArtifacts),
    projectStudioRecords: arrayOr(raw.projectStudioRecords, defaults.projectStudioRecords),
    obsidianConnection: isRecord(raw.obsidianConnection)
      ? raw.obsidianConnection as unknown as AppStateData["obsidianConnection"]
      : defaults.obsidianConnection,
    obsidianPublishBatches: arrayOr(raw.obsidianPublishBatches, defaults.obsidianPublishBatches),
  };
}
