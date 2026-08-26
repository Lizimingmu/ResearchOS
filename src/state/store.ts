import { create } from "zustand";
import { examplePapers } from "../data/examplePapers";
import { demoSourcePack } from "../data/problemAtlas";
import type {
  AIProvider,
  AIReviewRecord,
  AppSettings,
  AppStateData,
  AssessmentResult,
  Confidence,
  DifficultyLevel,
  DraftResponse,
  Misconception,
  Paper,
  Project,
  ReviewItem,
  SkillEvidence,
  UserResponse,
  ViewId,
} from "../domain/types";
import type { DiagnosticSession, SourcePackDocument } from "../domain/problemAtlas";
import type { ContentConflict, ContentLifecycle, ContentPatchPack, ContentPatchPreview, ObsidianPublishBatch, PersonalContentEntry, PortableContentRecord } from "../domain/contentStudio";
import { createReviewItem, scheduleReview } from "../learning/review";
import { makeId } from "../lib/ids";
import { listMarkdownFiles, loadPersistedState, readTextFiles, savePersistedState, validateObsidianTarget, writeConfirmedFiles } from "../services/desktop";
import { applySourcePackImport, dryRunSourcePack, type SourcePackDryRun } from "../services/sourcePack";
import { applyPatchTransaction, createDraft, createOverlayFromBuiltin, duplicatePersonalEntry, previewPatch, rollbackRevision, sha256 } from "../services/contentStudio";
import { applyPlannedBatch, fingerprintWrites, planFromPersistedBatch, planPublishBatch, buildReviewRoundTrip, parseReviewFeedback, toReviewPatchCandidates, type ReviewPatchCandidate } from "../services/obsidianPublish";
import { resolveEffectiveContent } from "../services/contentStudio";
import { CURRENT_STATE_SCHEMA, migratePersistedState } from "./migrations";

const providers: AIProvider[] = [
  { id: "openai", name: "OpenAI-compatible", template: "openai", baseUrl: "https://api.openai.com/v1", model: "gpt-5-mini", temperature: 0.2, maxTokens: 1200, hasApiKey: false },
  { id: "deepseek", name: "DeepSeek-compatible", template: "deepseek", baseUrl: "https://api.deepseek.com", model: "deepseek-chat", temperature: 0.2, maxTokens: 1200, hasApiKey: false },
  { id: "ollama", name: "Ollama / local", template: "ollama", baseUrl: "http://localhost:11434/v1", model: "llama3.2", temperature: 0.2, maxTokens: 1200, hasApiKey: false },
  { id: "custom", name: "Custom", template: "custom", baseUrl: "http://localhost:8000/v1", model: "model-name", temperature: 0.2, maxTokens: 1200, hasApiKey: false },
];

const defaultSettings: AppSettings = {
  language: "zh-CN",
  theme: "system",
  startPage: "today",
  dailyMinutes: 40,
  weights: { weakness: 0.30, projectRelevance: 0.25, frontierValue: 0.15, reviewDue: 0.15, misconception: 0.15 },
  pubmedVerification: true,
  doiVerification: true,
  offlineMode: false,
  activeProviderId: "openai",
};

const emptyAtlasCollections = () => ({
  problemAtlasSources: [],
  problemAtlasClaims: [],
  problemCards: [],
  diagnosticCauses: [],
  diagnosticChecks: [],
  diagnosticPaths: [],
  diagnosticEvidence: [],
  problemTrainingCases: [],
  diagnosticSessions: [],
  sourcePackImports: [],
  problemSearchLog: [],
});

const seededAtlasCollections = () => {
  const result = applySourcePackImport(emptyAtlasCollections(), demoSourcePack, { allowUpdates: true });
  return {
    ...result.collections,
    sourcePackImports: [result.importRecord],
    diagnosticSessions: [],
    problemSearchLog: [],
  };
};

export const createInitialState = (): AppStateData => {
  const atlas = seededAtlasCollections();
  return {
    schemaVersion: CURRENT_STATE_SCHEMA,
    papers: examplePapers.map((paper) => ({ ...paper, tags: [...paper.tags] })),
    projects: [],
    responses: [],
    reviewItems: [createReviewItem("review-starter-statistical-unit", "statistical-unit", "method", "请说明单细胞患者组间比较中的统计单位（Statistical Unit）。")],
    reviewLogs: [],
    skillEvidence: [],
    providers: providers.map((provider) => ({ ...provider })),
    settings: { ...defaultSettings, weights: { ...defaultSettings.weights } },
    completedTaskIds: [],
    snoozedTaskIds: [],
    assessmentHistory: [],
    notesByPaperId: {},
    draftResponses: {},
    misconceptions: [],
    onboarding: { completed: false, interests: [], familiarity: {}, baselineCompleted: false },
    personalContent: [],
    contentRevisionHistory: [],
    contentConflicts: [],
    obsidianConnection: undefined,
    obsidianPublishBatches: [],
    ...atlas,
  };
};

export const shouldAutoOpenTutorial = (onboarding: AppStateData["onboarding"]): boolean =>
  onboarding.completed === true && onboarding.tutorialCompletedAt == null && onboarding.tutorialSkippedAt == null;

export interface ToastMessage {
  id: string;
  tone: "info" | "success" | "warning" | "error";
  text: string;
}

interface AppStore extends AppStateData {
  hydrated: boolean;
  persistenceStatus: "idle" | "saving" | "saved" | "error";
  lastSavedAt?: string;
  view: ViewId;
  tutorialOpen: boolean;
  selectedPaperId?: string;
  selectedMethodId: string;
  selectedAuditId: string;
  selectedJudgmentId: string;
  selectedProblemId: string;
  paletteOpen: boolean;
  globalSearch: string;
  toast?: ToastMessage;
  hydrate: () => Promise<void>;
  persistNow: () => Promise<void>;
  setView: (view: ViewId) => void;
  selectPaper: (id: string) => void;
  selectMethod: (id: string) => void;
  selectAudit: (id: string) => void;
  selectJudgment: (id: string) => void;
  selectProblem: (id: string) => void;
  setPaletteOpen: (open: boolean) => void;
  setGlobalSearch: (value: string) => void;
  notify: (text: string, tone?: ToastMessage["tone"]) => void;
  clearToast: () => void;
  addPaper: (paper: Paper) => void;
  updatePaper: (id: string, patch: Partial<Paper>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  submitResponse: (input: Omit<UserResponse, "id" | "submittedAt" | "locked">) => UserResponse;
  saveDraft: (draft: Omit<DraftResponse, "updatedAt">) => void;
  clearDraft: (taskId: string) => void;
  saveTransfer: (responseId: string, transferText: string, projectId?: string) => void;
  saveAiReview: (responseId: string, review: AIReviewRecord) => void;
  ensureReview: (conceptId: string, conceptType: ReviewItem["conceptType"], prompt: string) => void;
  rateReview: (reviewItemId: string, correctness: number, confidence: Confidence) => void;
  addSkillEvidence: (evidence: Omit<SkillEvidence, "id" | "createdAt">) => void;
  recordCalibration: (input: { responseId: string; conceptId: string; conceptType: ReviewItem["conceptType"]; skillId: string; prompt: string; variantPrompt?: string; difficulty?: DifficultyLevel; score: number }) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateWeights: (patch: Partial<AppSettings["weights"]>) => void;
  updateProvider: (id: string, patch: Partial<AIProvider>) => void;
  completeTask: (id: string) => void;
  completeTargetForToday: (targetId: string) => void;
  snoozeTask: (id: string) => void;
  addAssessment: (assessment: AssessmentResult) => void;
  updateAssessment: (id: string, patch: Partial<AssessmentResult>) => void;
  completeOnboarding: (interests: string[], familiarity: AppStateData["onboarding"]["familiarity"]) => void;
  replaceData: (data: unknown) => void;
  resetDemo: () => void;
  openTutorial: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  updateDiagnosticSession: (session: DiagnosticSession) => void;
  recordProblemSearch: (query: string, matched: boolean, matchedCount: number) => void;
  dryRunSourcePack: (doc: SourcePackDocument) => SourcePackDryRun;
  confirmSourcePackImport: (doc: SourcePackDocument) => { applied: boolean; dryRun: SourcePackDryRun };
  createPersonalDraft: (input: Parameters<typeof createDraft>[0]) => PersonalContentEntry;
  updatePersonalDraft: (id: string, patch: { title?: string; payload?: Record<string, unknown>; dependencyKeys?: string[]; risk?: PersonalContentEntry["risk"] }) => void;
  duplicatePersonalDraft: (id: string) => PersonalContentEntry;
  ensurePersonalOverlay: (record: PortableContentRecord, overlayId?: string) => PersonalContentEntry;
  applyOverlayPatch: (patch: ContentPatchPack, builtinRecord?: PortableContentRecord) => PersonalContentEntry;
  setPersonalLifecycle: (id: string, lifecycle: ContentLifecycle, activateForPrivateStudy?: boolean) => void;
  previewPersonalPatch: (patch: ContentPatchPack) => { found: boolean; stale: boolean; preview?: ContentPatchPreview };
  applyContentPatch: (patch: ContentPatchPack) => PersonalContentEntry;
  rollbackContent: (id: string, revision: number, reason: string) => PersonalContentEntry;
  saveObsidianConnection: (vaultRoot: string, dedicatedSubfolder: string) => Promise<void>;
  createPublishBatch: (selectedKeys: string[]) => string;
  previewPublishBatch: (batchId: string) => Promise<void>;
  confirmAndApplyPublishBatch: (batchId: string, secondConfirmed: boolean) => Promise<string[]>;
  cancelPublishBatch: (batchId: string) => void;
  exportReviewRoundTrip: (selectedKeys: string[], batchId?: string) => Promise<string>;
  checkReviewRoundTrip: (batchId: string) => Promise<{ feedback: ReturnType<typeof parseReviewFeedback>; candidates: ReviewPatchCandidate[] }>;
}

function stateData(state: AppStore): AppStateData {
  return {
    schemaVersion: state.schemaVersion,
    papers: state.papers,
    projects: state.projects,
    responses: state.responses,
    reviewItems: state.reviewItems,
    reviewLogs: state.reviewLogs,
    skillEvidence: state.skillEvidence,
    providers: state.providers,
    settings: state.settings,
    completedTaskIds: state.completedTaskIds,
    snoozedTaskIds: state.snoozedTaskIds,
    assessmentHistory: state.assessmentHistory,
    notesByPaperId: state.notesByPaperId,
    draftResponses: state.draftResponses,
    misconceptions: state.misconceptions,
    onboarding: state.onboarding,
    problemAtlasSources: state.problemAtlasSources,
    problemAtlasClaims: state.problemAtlasClaims,
    problemCards: state.problemCards,
    diagnosticCauses: state.diagnosticCauses,
    diagnosticChecks: state.diagnosticChecks,
    diagnosticPaths: state.diagnosticPaths,
    diagnosticEvidence: state.diagnosticEvidence,
    problemTrainingCases: state.problemTrainingCases,
    diagnosticSessions: state.diagnosticSessions,
    sourcePackImports: state.sourcePackImports,
    problemSearchLog: state.problemSearchLog,
    personalContent: state.personalContent,
    contentRevisionHistory: state.contentRevisionHistory,
    contentConflicts: state.contentConflicts,
    obsidianConnection: state.obsidianConnection,
    obsidianPublishBatches: state.obsidianPublishBatches,
  };
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;
const schedulePersist = (get: () => AppStore, report: (status: AppStore["persistenceStatus"], error?: unknown) => void) => {
  if (persistTimer) clearTimeout(persistTimer);
  report("saving");
  persistTimer = setTimeout(() => {
    void savePersistedState(stateData(get()))
      .then(() => report("saved"))
      .catch((error) => report("error", error));
  }, 80);
};

export const useAppStore = create<AppStore>((set, get) => {
  const initial = createInitialState();
  const reportPersistence = (status: AppStore["persistenceStatus"], error?: unknown) => {
    if (status === "error") {
      set({
        persistenceStatus: "error",
        toast: { id: makeId("toast"), tone: "error", text: `更改仍保留在内存中，但无法保存：${String(error)}` },
      });
      return;
    }
    set({ persistenceStatus: status, lastSavedAt: status === "saved" ? new Date().toISOString() : get().lastSavedAt });
  };
  const queuePersist = () => schedulePersist(get, reportPersistence);
  const todayTargetMarker = (targetId: string, now = new Date()) => `target:${now.toISOString().slice(0, 10)}:${targetId}`;
  return {
    ...initial,
    hydrated: false,
    persistenceStatus: "idle",
    view: "today",
    tutorialOpen: false,
    selectedPaperId: initial.papers[0]?.id,
    selectedMethodId: "statistical-unit",
    selectedAuditId: "audit-01",
    selectedJudgmentId: "jc-01",
    selectedProblemId: initial.problemCards[0]?.id ?? "",
    paletteOpen: false,
    globalSearch: "",

    hydrate: async () => {
      try {
        const persisted = await loadPersistedState();
        const migrated = persisted === null ? initial : migratePersistedState(persisted, initial);
        set({ ...migrated, hydrated: true, persistenceStatus: "idle", view: (migrated.settings.startPage as ViewId) || "today", selectedPaperId: migrated.papers[0]?.id, tutorialOpen: shouldAutoOpenTutorial(migrated.onboarding) });
        await savePersistedState(migrated);
        reportPersistence("saved");
      } catch (error) {
        set({ hydrated: true, persistenceStatus: "error", toast: { id: makeId("toast"), tone: "error", text: `本地数据库未被修改，将继续在内存中运行：${String(error)}` } });
      }
    },
    persistNow: async () => {
      reportPersistence("saving");
      try {
        await savePersistedState(stateData(get()));
        reportPersistence("saved");
      } catch (error) {
        reportPersistence("error", error);
        throw error;
      }
    },
    setView: (view) => set({ view }),
    selectPaper: (selectedPaperId) => set({ selectedPaperId, view: "paper-lab" }),
    selectMethod: (selectedMethodId) => set({ selectedMethodId, view: "methods" }),
    selectAudit: (selectedAuditId) => set({ selectedAuditId, view: "ai-audit" }),
    selectJudgment: (selectedJudgmentId) => set({ selectedJudgmentId }),
    selectProblem: (selectedProblemId) => set({ selectedProblemId, view: "problem-atlas" }),
    setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
    setGlobalSearch: (globalSearch) => set({ globalSearch }),
    notify: (text, tone = "info") => set({ toast: { id: makeId("toast"), tone, text } }),
    clearToast: () => set({ toast: undefined }),

    addPaper: (paper) => {
      set((state) => ({ papers: [paper, ...state.papers], selectedPaperId: paper.id }));
      queuePersist();
    },
    updatePaper: (id, patch) => {
      set((state) => ({ papers: state.papers.map((paper) => paper.id === id ? { ...paper, ...patch } : paper) }));
      queuePersist();
    },
    addProject: (project) => {
      set((state) => ({ projects: [project, ...state.projects] }));
      queuePersist();
    },
    updateProject: (id, patch) => {
      set((state) => ({ projects: state.projects.map((project) => project.id === id ? { ...project, ...patch } : project) }));
      queuePersist();
    },
    submitResponse: (input) => {
      const response: UserResponse = { ...input, id: makeId("response"), submittedAt: new Date().toISOString(), locked: true };
      set((state) => ({ responses: [response, ...state.responses] }));
      queuePersist();
      return response;
    },
    saveDraft: (draft) => {
      set((state) => ({ draftResponses: { ...state.draftResponses, [draft.taskId]: { ...draft, updatedAt: new Date().toISOString() } } }));
      queuePersist();
    },
    clearDraft: (taskId) => {
      set((state) => {
        if (!state.draftResponses[taskId]) return state;
        const draftResponses = { ...state.draftResponses };
        delete draftResponses[taskId];
        return { draftResponses };
      });
      queuePersist();
    },
    saveTransfer: (responseId, transferText, projectId) => {
      set((state) => ({ responses: state.responses.map((response) => response.id === responseId ? { ...response, transferText, projectId } : response) }));
      queuePersist();
    },
    saveAiReview: (responseId, aiReview) => {
      set((state) => ({ responses: state.responses.map((response) => response.id === responseId ? { ...response, aiReview } : response) }));
      queuePersist();
    },
    ensureReview: (conceptId, conceptType, prompt) => {
      if (get().reviewItems.some((item) => item.conceptId === conceptId)) return;
      set((state) => ({ reviewItems: [createReviewItem(makeId("review"), conceptId, conceptType, prompt), ...state.reviewItems] }));
      queuePersist();
    },
    rateReview: (reviewItemId, correctness, confidence) => {
      const item = get().reviewItems.find((candidate) => candidate.id === reviewItemId);
      if (!item) return;
      const outcome = scheduleReview(item, correctness, confidence);
      const resolved = Boolean(item.misconceptionId && item.isVariant && correctness >= 0.75);
      const reviewedAt = new Date().toISOString();
      const reviewedItem = {
        ...outcome.item,
        dangerousMisconception: item.misconceptionId ? !resolved : outcome.item.dangerousMisconception,
      };
      set((state) => ({
        reviewItems: state.reviewItems.map((candidate) => candidate.id === reviewItemId ? reviewedItem : candidate),
        reviewLogs: [{ id: makeId("review-log"), reviewItemId, reviewedAt, correctness, confidence, nextDue: outcome.nextDue }, ...state.reviewLogs],
        misconceptions: state.misconceptions.map((misconception) => misconception.id === item.misconceptionId
          ? { ...misconception, status: resolved ? "resolved" : "retesting", lastTestedAt: reviewedAt, resolvedAt: resolved ? reviewedAt : undefined }
          : misconception),
        completedTaskIds: state.completedTaskIds.includes(todayTargetMarker(item.conceptId))
          ? state.completedTaskIds
          : [...state.completedTaskIds, todayTargetMarker(item.conceptId)],
      }));
      queuePersist();
    },
    addSkillEvidence: (evidence) => {
      set((state) => ({ skillEvidence: [{ ...evidence, id: makeId("skill-evidence"), createdAt: new Date().toISOString() }, ...state.skillEvidence] }));
      queuePersist();
    },
    recordCalibration: ({ responseId, conceptId, conceptType, skillId, prompt, variantPrompt, difficulty, score }) => {
      const response = get().responses.find((candidate) => candidate.id === responseId);
      if (!response) return;
      if (response.correctness !== undefined) {
        set({ toast: { id: makeId("toast"), tone: "info", text: "本次作答的校准结果已经锁定。" } });
        return;
      }
      const now = new Date();
      const nowIso = now.toISOString();
      const dangerous = score < 0.5 && response.confidence >= 3;
      const existingMisconception = get().misconceptions.find((item) => item.conceptId === conceptId && item.status !== "resolved");
      const misconceptionId = dangerous ? existingMisconception?.id ?? makeId("misconception") : undefined;
      const unfamiliarVariant = variantPrompt ?? `A different research team faces the same underlying decision: ${prompt} Identify the risk and state the defensible conclusion without reusing the original case wording.`;
      const existingReview = get().reviewItems.find((item) => item.conceptId === conceptId);
      const baseReview = existingReview ?? createReviewItem(makeId("review"), conceptId, conceptType, prompt, now);
      const reviewForScheduling: ReviewItem = dangerous ? {
        ...baseReview,
        prompt: unfamiliarVariant,
        variantPrompt: unfamiliarVariant,
        isVariant: true,
        misconceptionId,
        dangerousMisconception: true,
      } : baseReview;
      const outcome = scheduleReview(reviewForScheduling, score, response.confidence, now);
      const evidence: SkillEvidence = {
        id: makeId("skill-evidence"), skillId, taskId: conceptId, conceptId, responseId, score,
        delayed: false, blindTransfer: false, confidence: response.confidence, difficulty, misconceptionId, createdAt: nowIso,
      };
      const misconception: Misconception | undefined = dangerous ? {
        id: misconceptionId!, conceptId, conceptType, sourceTaskId: response.taskId,
        statement: `检测到关于“${conceptId}”的高信心不安全判断。`,
        variantPrompt: unfamiliarVariant, detectedAt: existingMisconception?.detectedAt ?? nowIso,
        confidence: response.confidence, evidenceCount: (existingMisconception?.evidenceCount ?? 0) + 1,
        status: "unresolved",
      } : undefined;
      set((state) => ({
        responses: state.responses.map((candidate) => candidate.id === responseId ? { ...candidate, correctness: score } : candidate),
        skillEvidence: [evidence, ...state.skillEvidence.filter((item) => item.responseId !== responseId)],
        reviewItems: existingReview
          ? state.reviewItems.map((item) => item.id === existingReview.id ? outcome.item : item)
          : [outcome.item, ...state.reviewItems],
        misconceptions: misconception
          ? [misconception, ...state.misconceptions.filter((item) => item.id !== misconception.id)]
          : state.misconceptions,
        completedTaskIds: state.completedTaskIds.includes(todayTargetMarker(conceptId))
          ? state.completedTaskIds
          : [...state.completedTaskIds, todayTargetMarker(conceptId)],
        toast: {
          id: makeId("toast"),
          tone: dangerous ? "warning" : "success",
          text: dangerous ? "已记录高信心错误，接下来将安排陌生变式。" : "校准已锁定，并已安排复习。",
        },
      }));
      queuePersist();
    },
    updateSettings: (patch) => {
      set((state) => ({ settings: { ...state.settings, ...patch } }));
      queuePersist();
    },
    updateWeights: (patch) => {
      set((state) => ({ settings: { ...state.settings, weights: { ...state.settings.weights, ...patch } } }));
      queuePersist();
    },
    updateProvider: (id, patch) => {
      set((state) => ({ providers: state.providers.map((provider) => provider.id === id ? { ...provider, ...patch } : provider) }));
      queuePersist();
    },
    completeTask: (id) => {
      set((state) => state.completedTaskIds.includes(id) ? state : ({ completedTaskIds: [...state.completedTaskIds, id] }));
      queuePersist();
    },
    completeTargetForToday: (targetId) => {
      const marker = todayTargetMarker(targetId);
      set((state) => state.completedTaskIds.includes(marker) ? state : ({ completedTaskIds: [...state.completedTaskIds, marker] }));
      queuePersist();
    },
    snoozeTask: (id) => {
      set((state) => state.snoozedTaskIds.includes(id) ? state : ({ snoozedTaskIds: [...state.snoozedTaskIds, id] }));
      queuePersist();
    },
    addAssessment: (assessment) => {
      set((state) => ({ assessmentHistory: [assessment, ...state.assessmentHistory] }));
      queuePersist();
    },
    updateAssessment: (id, patch) => {
      set((state) => ({
        assessmentHistory: state.assessmentHistory.map((assessment) => assessment.id === id ? { ...assessment, ...patch } : assessment),
        onboarding: patch.kind === "baseline" && patch.score !== undefined ? { ...state.onboarding, baselineCompleted: true } : state.onboarding,
      }));
      queuePersist();
    },
    completeOnboarding: (interests, familiarity) => {
      set((state) => ({
        onboarding: { ...state.onboarding, completed: true, interests, familiarity, completedAt: new Date().toISOString() },
        tutorialOpen: shouldAutoOpenTutorial({ ...state.onboarding, completed: true, interests, familiarity }),
        view: "assessment",
      }));
      queuePersist();
    },
    replaceData: (data) => {
      try {
        const migrated = migratePersistedState(data, createInitialState());
        set({ ...migrated, selectedPaperId: migrated.papers[0]?.id });
        queuePersist();
      } catch (error) {
        set({ toast: { id: makeId("toast"), tone: "error", text: `备份未应用：${String(error)}` } });
      }
    },
    resetDemo: () => {
      const reset = createInitialState();
      set({ ...reset, view: "today", tutorialOpen: false, selectedPaperId: reset.papers[0]?.id, selectedProblemId: reset.problemCards[0]?.id ?? "", toast: { id: makeId("toast"), tone: "info", text: "演示数据已重置，AI 凭据未更改。" } });
      queuePersist();
    },
    openTutorial: () => {
      set({ tutorialOpen: true });
    },
    skipTutorial: () => {
      const now = new Date().toISOString();
      set((state) => ({
        tutorialOpen: false,
        onboarding: state.onboarding.tutorialCompletedAt == null
          ? { ...state.onboarding, tutorialSkippedAt: now }
          : state.onboarding,
      }));
      queuePersist();
    },
    completeTutorial: () => {
      const now = new Date().toISOString();
      set((state) => ({
        tutorialOpen: false,
        onboarding: { ...state.onboarding, tutorialCompletedAt: now },
      }));
      queuePersist();
    },
    updateDiagnosticSession: (session) => {
      set((state) => ({
        diagnosticSessions: [
          session,
          ...state.diagnosticSessions.filter((entry) => entry.id !== session.id),
        ],
      }));
      queuePersist();
    },
    recordProblemSearch: (query, matched, matchedCount) => {
      const trimmed = query.trim();
      if (trimmed.length < 3) return;
      set((state) => {
        const previous = state.problemSearchLog[0];
        if (previous && previous.query === trimmed) return state;
        return {
          problemSearchLog: [
            { id: makeId("problem-search"), query: trimmed, matched, matchedCount, createdAt: new Date().toISOString() },
            ...state.problemSearchLog,
          ].slice(0, 200),
        };
      });
      queuePersist();
    },
    dryRunSourcePack: (doc) => {
      const state = get();
      const atlas: Parameters<typeof dryRunSourcePack>[1] = {
        problemAtlasSources: state.problemAtlasSources,
        problemAtlasClaims: state.problemAtlasClaims,
        problemCards: state.problemCards,
        diagnosticCauses: state.diagnosticCauses,
        diagnosticChecks: state.diagnosticChecks,
        diagnosticPaths: state.diagnosticPaths,
        diagnosticEvidence: state.diagnosticEvidence,
        problemTrainingCases: state.problemTrainingCases,
        diagnosticSessions: state.diagnosticSessions,
        sourcePackImports: state.sourcePackImports,
        problemSearchLog: state.problemSearchLog,
      };
      return dryRunSourcePack(doc, atlas);
    },
    confirmSourcePackImport: (doc) => {
      const state = get();
      const atlas: Parameters<typeof applySourcePackImport>[0] = {
        problemAtlasSources: state.problemAtlasSources,
        problemAtlasClaims: state.problemAtlasClaims,
        problemCards: state.problemCards,
        diagnosticCauses: state.diagnosticCauses,
        diagnosticChecks: state.diagnosticChecks,
        diagnosticPaths: state.diagnosticPaths,
        diagnosticEvidence: state.diagnosticEvidence,
        problemTrainingCases: state.problemTrainingCases,
        diagnosticSessions: state.diagnosticSessions,
        sourcePackImports: state.sourcePackImports,
        problemSearchLog: state.problemSearchLog,
      };
      const result = applySourcePackImport(atlas, doc, { allowUpdates: false });
      set((current) => ({
        ...result.collections,
        sourcePackImports: [result.importRecord, ...current.sourcePackImports.filter((record) => record.packId !== doc.packId || record.result === "applied")],
      }));
      queuePersist();
      return { applied: result.importRecord.result === "applied", dryRun: result.dryRun };
    },
    createPersonalDraft: (input) => {
      if (get().personalContent.some((entry) => entry.id === input.id && entry.kind === input.kind)) throw new Error("内容 ID 已存在");
      const draft = createDraft(input);
      set((state) => ({ personalContent: [draft, ...state.personalContent] }));
      queuePersist();
      return draft;
    },
    updatePersonalDraft: (id, patch) => {
      const target = get().personalContent.find((entry) => entry.id === id);
      if (!target) throw new Error("内容不存在");
      if (target.lifecycle !== "draft" && target.lifecycle !== "pending_review") throw new Error("只有草稿或待审核内容可以直接编辑");
      const payload = patch.payload ? structuredClone(patch.payload) : target.payload;
      set((state) => ({ personalContent: state.personalContent.map((entry) => entry.id === id ? { ...entry, ...patch, payload, hash: sha256(payload), verificationStatus: "pending", activeForLearning: false, updatedAt: new Date().toISOString() } : entry) }));
      queuePersist();
    },
    duplicatePersonalDraft: (id) => {
      const source = get().personalContent.find((entry) => entry.id === id);
      if (!source) throw new Error("内容不存在");
      const copy = duplicatePersonalEntry(source, `${source.id}-copy-${Date.now().toString(36)}`);
      set((state) => ({ personalContent: [copy, ...state.personalContent] }));
      queuePersist();
      return copy;
    },
    ensurePersonalOverlay: (record, overlayId) => {
      const id = overlayId ?? `overlay-${record.id}`;
      const existing = get().personalContent.find((entry) => entry.id === id);
      if (existing) {
        // Identity guard: never silently reuse an object that does not match
        // the expected built-in snapshot for this overlay.
        const matches = existing.kind === record.kind
          && existing.baseKey === record.key
          && existing.baseRevision === record.revision
          && existing.baseHash === record.hash;
        if (!matches) {
          const conflict: ContentConflict = {
            id: makeId("conflict"),
            contentId: existing.id,
            kind: "stale_patch",
            expectedHash: record.hash,
            actualHash: existing.hash,
            detail: `建立个人修订被拒绝：已存在同 ID 的${existing.kind === record.kind ? "但基线不匹配的" : "不同类型的"}个人对象（r${existing.revision}）；请先人工处理该冲突。`,
            status: "open",
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ contentConflicts: [conflict, ...state.contentConflicts] }));
          queuePersist();
          throw new Error(`个人修订 ID 冲突：同 ID 对象与内置快照不匹配；已记录冲突`);
        }
        return existing;
      }
      const created = createOverlayFromBuiltin(record, id);
      set((state) => ({ personalContent: [created, ...state.personalContent] }));
      queuePersist();
      return created;
    },
    applyOverlayPatch: (patch, builtinRecord) => {
      const existing = get().personalContent.find((candidate) => candidate.id === patch.targetId && candidate.kind === patch.targetKind);
      if (existing) {
        // Identity guard: when the caller declares the built-in source, the
        // existing object must genuinely BE that object's overlay. A same-hash
        // placeholder without the base linkage is a conflict, never a target.
        if (builtinRecord) {
          const isGenuineOverlay = existing.baseKey === builtinRecord.key
            && existing.baseRevision === builtinRecord.revision
            && existing.baseHash === builtinRecord.hash;
          if (!isGenuineOverlay) {
            const conflict: ContentConflict = {
              id: makeId("conflict"),
              contentId: existing.id,
              kind: "stale_patch",
              expectedHash: builtinRecord.hash,
              actualHash: existing.hash,
              detail: `个人修订应用被拒绝：同 ID 对象存在但不是“${builtinRecord.key}”的 overlay（缺少正确的 baseKey/baseRevision/baseHash 关联）；未写入。`,
              status: "open",
              createdAt: new Date().toISOString(),
            };
            set((state) => ({ contentConflicts: [conflict, ...state.contentConflicts] }));
            queuePersist();
            throw new Error("个人修订身份冲突：目标对象不是该内置内容的 overlay；已记录冲突且未写入");
          }
        }
        // Strict optimistic lock: an existing overlay is NEVER rebased. The
        // candidate must match the overlay's exact revision/hash or it fails
        // as stale with an explainable conflict record and zero mutation.
        try {
          return get().applyContentPatch(patch);
        } catch (error) {
          const conflict: ContentConflict = {
            id: makeId("conflict"),
            contentId: existing.id,
            kind: "stale_patch",
            expectedHash: patch.baseHash,
            actualHash: existing.hash,
            detail: `修订候选 ${patch.patchId} 应用失败且未写入（当前 r${existing.revision}，候选基线 r${patch.baseRevision}）：${String(error)}`,
            status: "open",
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ contentConflicts: [conflict, ...state.contentConflicts] }));
          queuePersist();
          throw error;
        }
      }
      if (!builtinRecord || builtinRecord.kind !== patch.targetKind) throw new Error("修订目标不存在");
      // First staging is the ONLY baseline translation, and it must be provable:
      // the candidate has to match the current built-in snapshot exactly.
      if (patch.baseRevision !== builtinRecord.revision || patch.baseHash !== builtinRecord.hash) {
        const conflict: ContentConflict = {
          id: makeId("conflict"),
          contentId: patch.targetId,
          kind: "stale_patch",
          expectedHash: builtinRecord.hash,
          actualHash: patch.baseHash,
          detail: `审核候选 ${patch.patchId} 与当前内置基线 r${builtinRecord.revision} 不一致（候选基线 r${patch.baseRevision}）；未建立 overlay，未写入。`,
          status: "open",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ contentConflicts: [conflict, ...state.contentConflicts] }));
        queuePersist();
        throw new Error("审核候选与当前内置基线不一致（已过期）；已记录冲突且未写入");
      }
      // The freshly staged overlay carries exactly the snapshot's revision/hash,
      // so the candidate applies through the normal optimistic lock untouched.
      get().ensurePersonalOverlay(builtinRecord, patch.targetId);
      return get().applyContentPatch(patch);
    },
    setPersonalLifecycle: (id, lifecycle, activateForPrivateStudy = false) => {
      const target = get().personalContent.find((entry) => entry.id === id);
      if (!target) throw new Error("内容不存在");
      if (lifecycle === "active" && target.verificationStatus !== "verified" && !activateForPrivateStudy) throw new Error("待核验内容需要明确选择私人启用，且状态仍保持待核验");
      const activeForLearning = lifecycle === "active";
      set((state) => ({ personalContent: state.personalContent.map((entry) => entry.id === id ? { ...entry, lifecycle, activeForLearning, verificationStatus: lifecycle === "active" && activateForPrivateStudy ? "pending" : entry.verificationStatus, updatedAt: new Date().toISOString() } : entry) }));
      queuePersist();
    },
    previewPersonalPatch: (patch) => {
      const target = get().personalContent.find((entry) => entry.id === patch.targetId && entry.kind === patch.targetKind);
      if (!target) return { found: false, stale: false };
      const preview = previewPatch(patch, target);
      if (preview.stale) {
        const conflict: ContentConflict = {
          id: makeId("conflict"), contentId: target.id, kind: "stale_patch",
          expectedHash: patch.baseHash, actualHash: target.hash,
          detail: `修订包 ${patch.patchId} 基线已过期：期望 r${patch.baseRevision}/${patch.baseHash.slice(0, 16)}…，实际 r${target.revision}/${target.hash.slice(0, 16)}…`,
          status: "open", createdAt: new Date().toISOString(),
        };
        set((state) => ({ contentConflicts: [conflict, ...state.contentConflicts] }));
        queuePersist();
      }
      return { found: true, stale: preview.stale, preview };
    },
    applyContentPatch: (patch) => {
      const result = applyPatchTransaction(get().personalContent, get().contentRevisionHistory, get().contentConflicts, patch);
      set({ personalContent: result.entries, contentRevisionHistory: result.history, contentConflicts: result.conflicts });
      queuePersist();
      return result.applied;
    },
    rollbackContent: (id, revision, reason) => {
      const result = rollbackRevision(get().personalContent, get().contentRevisionHistory, id, revision, reason);
      set({ personalContent: result.entries, contentRevisionHistory: result.history });
      queuePersist();
      return result.restored;
    },
    saveObsidianConnection: async (vaultRoot, dedicatedSubfolder) => {
      const cleanRoot = vaultRoot.trim();
      const cleanSubfolder = dedicatedSubfolder.trim() || "ResearchOS";
      const report = await validateObsidianTarget(cleanRoot, cleanSubfolder);
      set({ obsidianConnection: { vaultRoot: cleanRoot, dedicatedSubfolder: cleanSubfolder, validatedAt: new Date().toISOString(), validatedResolvedDir: report.resolvedDir } });
      queuePersist();
    },
    createPublishBatch: (selectedKeys) => {
      if (selectedKeys.length === 0) throw new Error("请先选择要发布的内容");
      const batch: ObsidianPublishBatch = { id: `publish-${Date.now().toString(36)}`, status: "draft", items: [], createdAt: new Date().toISOString(), batchType: "publish", selectedKeys: [...new Set(selectedKeys)].sort() };
      set((state) => ({ obsidianPublishBatches: [batch, ...state.obsidianPublishBatches] }));
      return batch.id;
    },
    previewPublishBatch: async (batchId) => {
      const state = get();
      const batch = state.obsidianPublishBatches.find((entry) => entry.id === batchId);
      if (!batch) throw new Error("发布批次不存在");
      const connection = state.obsidianConnection;
      if (!connection) throw new Error("请先以只读方式连接 Obsidian 专用文件夹");
      const selectedKeySet = new Set(batch.selectedKeys ?? []);
      if (selectedKeySet.size === 0) throw new Error("发布批次没有选择任何内容");
      // Loaded lazily: the base inventory pulls the large built-in datasets.
      const { buildBaseContentInventory } = await import("../services/contentInventory");
      const base = buildBaseContentInventory();
      const effective = resolveEffectiveContent(base, state.personalContent);
      const selected = effective.filter((record) => selectedKeySet.has(record.key));
      if (selected.length === 0) throw new Error("所选内容不存在或不在有效内容中");
      const listed = await listMarkdownFiles(connection.vaultRoot, connection.dedicatedSubfolder);
      const reads = listed.length ? await readTextFiles(connection.vaultRoot, connection.dedicatedSubfolder, listed) : [];
      const existingFiles = new Map(reads.map((entry) => [entry.relativePath, entry.contents ?? ""]));
      const appliedHistory = state.obsidianPublishBatches
        .filter((entry) => entry.status === "applied")
        .flatMap((entry) => entry.appliedFingerprints ?? [])
        .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
      const plan = planPublishBatch({ batchId, records: selected, existingFiles, appliedHistory, now: new Date() });
      set((current) => ({
        obsidianPublishBatches: current.obsidianPublishBatches.map((entry) => entry.id === batchId ? {
          ...entry,
          status: plan.conflictCount > 0 ? "conflict" : "previewed",
          items: plan.items,
          confirmationToken: plan.confirmationToken,
          requiresSecondConfirmation: plan.requiresSecondConfirmation,
          previewedAt: plan.createdAt,
        } : entry),
      }));
      queuePersist();
    },
    confirmAndApplyPublishBatch: async (batchId, secondConfirmed) => {
      const state = get();
      const batch = state.obsidianPublishBatches.find((entry) => entry.id === batchId);
      if (!batch || (batch.status !== "previewed" && batch.status !== "confirmed")) throw new Error("批次尚未预览或已被取消/冲突");
      if (!state.obsidianConnection) throw new Error("未连接 Obsidian 专用文件夹");
      const plan = planFromPersistedBatch(batch);
      const writes = applyPlannedBatch(plan, { confirmationToken: batch.confirmationToken ?? "", secondConfirmed });
      const writtenPaths = await writeConfirmedFiles(
        state.obsidianConnection.vaultRoot,
        state.obsidianConnection.dedicatedSubfolder,
        writes.map((write) => ({ relativePath: write.relativePath, contents: write.contents, expectedExisting: write.expectedExisting })),
      );
      set((current) => ({
        obsidianPublishBatches: current.obsidianPublishBatches.map((entry) => entry.id === batchId ? {
          ...entry,
          status: "applied",
          appliedAt: new Date().toISOString(),
          appliedFingerprints: fingerprintWrites(plan),
        } : entry),
      }));
      queuePersist();
      return writtenPaths;
    },
    cancelPublishBatch: (batchId) => {
      set((state) => ({
        obsidianPublishBatches: state.obsidianPublishBatches.map((entry) => entry.id === batchId && entry.status !== "applied" ? { ...entry, status: "cancelled" } : entry),
      }));
      queuePersist();
    },
    exportReviewRoundTrip: async (selectedKeys, batchId) => {
      const state = get();
      const connection = state.obsidianConnection;
      if (!connection) throw new Error("请先以只读方式连接 Obsidian 专用文件夹");
      const uniqueKeys = [...new Set(selectedKeys)].sort();
      if (uniqueKeys.length === 0) throw new Error("请先选择要送去审核的内容");
      const { buildBaseContentInventory } = await import("../services/contentInventory");
      const base = buildBaseContentInventory();
      const effective = resolveEffectiveContent(base, state.personalContent);
      const selected = effective.filter((record) => uniqueKeys.includes(record.key));
      if (selected.length === 0) throw new Error("所选内容不存在或不在有效内容中");
      const id = batchId ?? `review-${Date.now().toString(36)}`;
      const roundTrip = buildReviewRoundTrip(id, selected, new Date());
      await writeConfirmedFiles(
        connection.vaultRoot,
        connection.dedicatedSubfolder,
        [{ relativePath: roundTrip.manifestPath, contents: roundTrip.manifestJson, expectedExisting: null },
         ...roundTrip.files.map((file) => ({ relativePath: file.relativePath, contents: file.contents, expectedExisting: null }))],
      );
      const batch: ObsidianPublishBatch = {
        id, status: "applied", items: [], createdAt: roundTrip.manifest.createdAt, appliedAt: new Date().toISOString(),
        batchType: "review_round_trip", selectedKeys: uniqueKeys, reviewManifest: roundTrip.manifest,
      };
      set((current) => ({ obsidianPublishBatches: [batch, ...current.obsidianPublishBatches] }));
      queuePersist();
      return id;
    },
    checkReviewRoundTrip: async (batchId) => {
      const state = get();
      const connection = state.obsidianConnection;
      if (!connection) throw new Error("请先以只读方式连接 Obsidian 专用文件夹");
      const batch = state.obsidianPublishBatches.find((entry) => entry.id === batchId && entry.batchType === "review_round_trip");
      if (!batch?.reviewManifest) throw new Error("审核批次不存在或没有已导出的清单");
      const manifestEntries = await readTextFiles(connection.vaultRoot, connection.dedicatedSubfolder, [`_Review/${batchId}/manifest.json`]);
      const manifestContents = manifestEntries[0]?.contents;
      if (!manifestContents) throw new Error("审核清单不存在；未读取任何笔记。");
      let exportedManifest;
      try { exportedManifest = JSON.parse(manifestContents); } catch { throw new Error("审核清单不是有效 JSON。"); }
      // Only the exact exported manifest is authoritative for read-back.
      const manifest = batch.reviewManifest;
      if (JSON.stringify(exportedManifest) !== JSON.stringify(manifest)) throw new Error("审核清单与导出记录不一致；拒绝读取任何笔记。");
      const entries = await readTextFiles(connection.vaultRoot, connection.dedicatedSubfolder, manifest.notes.map((note) => note.relativePath));
      const feedback = parseReviewFeedback(entries, manifest);
      const { buildBaseContentInventory } = await import("../services/contentInventory");
      const base = buildBaseContentInventory();
      const effective = resolveEffectiveContent(base, state.personalContent);
      const candidates = toReviewPatchCandidates(feedback, effective, new Date());
      set((current) => ({
        obsidianPublishBatches: current.obsidianPublishBatches.map((entry) => entry.id === batchId ? { ...entry, reviewCheckedAt: new Date().toISOString() } : entry),
      }));
      queuePersist();
      return { feedback, candidates };
    },
  };
});
