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
import { createReviewItem, scheduleReview } from "../learning/review";
import { makeId } from "../lib/ids";
import { loadPersistedState, savePersistedState } from "../services/desktop";
import { applySourcePackImport, dryRunSourcePack, type SourcePackDryRun } from "../services/sourcePack";
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
    ...atlas,
  };
};

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
  updateDiagnosticSession: (session: DiagnosticSession) => void;
  recordProblemSearch: (query: string, matched: boolean, matchedCount: number) => void;
  dryRunSourcePack: (doc: SourcePackDocument) => SourcePackDryRun;
  confirmSourcePackImport: (doc: SourcePackDocument) => { applied: boolean; dryRun: SourcePackDryRun };
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
        set({ ...migrated, hydrated: true, persistenceStatus: "idle", view: (migrated.settings.startPage as ViewId) || "today", selectedPaperId: migrated.papers[0]?.id });
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
      set({ ...reset, view: "today", selectedPaperId: reset.papers[0]?.id, selectedProblemId: reset.problemCards[0]?.id ?? "", toast: { id: makeId("toast"), tone: "info", text: "演示数据已重置，AI 凭据未更改。" } });
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
  };
});
