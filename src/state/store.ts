import { create } from "zustand";
import { examplePapers } from "../data/examplePapers";
import type {
  AIProvider,
  AppSettings,
  AppStateData,
  AssessmentResult,
  Confidence,
  Paper,
  Project,
  ReviewItem,
  SkillEvidence,
  UserResponse,
  ViewId,
} from "../domain/types";
import { createReviewItem, scheduleReview } from "../learning/review";
import { makeId } from "../lib/ids";
import { loadPersistedState, savePersistedState } from "../services/desktop";

const providers: AIProvider[] = [
  { id: "openai", name: "OpenAI-compatible", template: "openai", baseUrl: "https://api.openai.com/v1", model: "gpt-5-mini", temperature: 0.2, maxTokens: 1200, hasApiKey: false },
  { id: "deepseek", name: "DeepSeek-compatible", template: "deepseek", baseUrl: "https://api.deepseek.com", model: "deepseek-chat", temperature: 0.2, maxTokens: 1200, hasApiKey: false },
  { id: "ollama", name: "Ollama / local", template: "ollama", baseUrl: "http://localhost:11434/v1", model: "llama3.2", temperature: 0.2, maxTokens: 1200, hasApiKey: false },
  { id: "custom", name: "Custom", template: "custom", baseUrl: "http://localhost:8000/v1", model: "model-name", temperature: 0.2, maxTokens: 1200, hasApiKey: false },
];

const defaultSettings: AppSettings = {
  theme: "system",
  startPage: "today",
  dailyMinutes: 40,
  weights: { weakness: 0.35, projectRelevance: 0.30, frontierValue: 0.20, reviewDue: 0.15 },
  pubmedVerification: true,
  doiVerification: true,
  offlineMode: false,
  activeProviderId: "openai",
};

export const createInitialState = (): AppStateData => ({
  schemaVersion: 1,
  papers: examplePapers.map((paper) => ({ ...paper, tags: [...paper.tags] })),
  projects: [],
  responses: [],
  reviewItems: [createReviewItem("review-starter-statistical-unit", "statistical-unit", "method", "Explain the independent statistical unit in a single-cell patient contrast.")],
  reviewLogs: [],
  skillEvidence: [],
  providers: providers.map((provider) => ({ ...provider })),
  settings: { ...defaultSettings, weights: { ...defaultSettings.weights } },
  completedTaskIds: [],
  snoozedTaskIds: [],
  assessmentHistory: [],
  notesByPaperId: {},
});

export interface ToastMessage {
  id: string;
  tone: "info" | "success" | "warning" | "error";
  text: string;
}

interface AppStore extends AppStateData {
  hydrated: boolean;
  view: ViewId;
  selectedPaperId?: string;
  selectedMethodId: string;
  selectedAuditId: string;
  selectedJudgmentId: string;
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
  setPaletteOpen: (open: boolean) => void;
  setGlobalSearch: (value: string) => void;
  notify: (text: string, tone?: ToastMessage["tone"]) => void;
  clearToast: () => void;
  addPaper: (paper: Paper) => void;
  updatePaper: (id: string, patch: Partial<Paper>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  submitResponse: (input: Omit<UserResponse, "id" | "submittedAt" | "locked">) => UserResponse;
  saveTransfer: (responseId: string, transferText: string, projectId?: string) => void;
  ensureReview: (conceptId: string, conceptType: ReviewItem["conceptType"], prompt: string) => void;
  rateReview: (reviewItemId: string, correctness: number, confidence: Confidence) => void;
  addSkillEvidence: (evidence: Omit<SkillEvidence, "id" | "createdAt">) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateWeights: (patch: Partial<AppSettings["weights"]>) => void;
  updateProvider: (id: string, patch: Partial<AIProvider>) => void;
  completeTask: (id: string) => void;
  snoozeTask: (id: string) => void;
  addAssessment: (assessment: AssessmentResult) => void;
  replaceData: (data: AppStateData) => void;
  resetDemo: () => void;
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
  };
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;
const schedulePersist = (get: () => AppStore) => {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void savePersistedState(stateData(get())).catch((error) => {
      console.error("ResearchOS persistence failed", error);
    });
  }, 80);
};

export const useAppStore = create<AppStore>((set, get) => {
  const initial = createInitialState();
  return {
    ...initial,
    hydrated: false,
    view: "today",
    selectedPaperId: initial.papers[0]?.id,
    selectedMethodId: "statistical-unit",
    selectedAuditId: "audit-01",
    selectedJudgmentId: "jc-01",
    paletteOpen: false,
    globalSearch: "",

    hydrate: async () => {
      try {
        const persisted = await loadPersistedState();
        if (persisted?.schemaVersion === 1) {
          set({ ...persisted, hydrated: true, view: (persisted.settings.startPage as ViewId) || "today", selectedPaperId: persisted.papers[0]?.id });
        } else {
          set({ hydrated: true });
          await savePersistedState(stateData(get()));
        }
      } catch (error) {
        set({ hydrated: true, toast: { id: makeId("toast"), tone: "error", text: `Local database unavailable. Continuing with in-memory seed data: ${String(error)}` } });
      }
    },
    persistNow: () => savePersistedState(stateData(get())),
    setView: (view) => set({ view }),
    selectPaper: (selectedPaperId) => set({ selectedPaperId, view: "paper-lab" }),
    selectMethod: (selectedMethodId) => set({ selectedMethodId, view: "methods" }),
    selectAudit: (selectedAuditId) => set({ selectedAuditId, view: "ai-audit" }),
    selectJudgment: (selectedJudgmentId) => set({ selectedJudgmentId }),
    setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
    setGlobalSearch: (globalSearch) => set({ globalSearch }),
    notify: (text, tone = "info") => set({ toast: { id: makeId("toast"), tone, text } }),
    clearToast: () => set({ toast: undefined }),

    addPaper: (paper) => {
      set((state) => ({ papers: [paper, ...state.papers], selectedPaperId: paper.id }));
      schedulePersist(get);
    },
    updatePaper: (id, patch) => {
      set((state) => ({ papers: state.papers.map((paper) => paper.id === id ? { ...paper, ...patch } : paper) }));
      schedulePersist(get);
    },
    addProject: (project) => {
      set((state) => ({ projects: [project, ...state.projects] }));
      schedulePersist(get);
    },
    updateProject: (id, patch) => {
      set((state) => ({ projects: state.projects.map((project) => project.id === id ? { ...project, ...patch } : project) }));
      schedulePersist(get);
    },
    submitResponse: (input) => {
      const response: UserResponse = { ...input, id: makeId("response"), submittedAt: new Date().toISOString(), locked: true };
      set((state) => ({ responses: [response, ...state.responses] }));
      schedulePersist(get);
      return response;
    },
    saveTransfer: (responseId, transferText, projectId) => {
      set((state) => ({ responses: state.responses.map((response) => response.id === responseId ? { ...response, transferText, projectId } : response) }));
      schedulePersist(get);
    },
    ensureReview: (conceptId, conceptType, prompt) => {
      if (get().reviewItems.some((item) => item.conceptId === conceptId)) return;
      set((state) => ({ reviewItems: [createReviewItem(makeId("review"), conceptId, conceptType, prompt), ...state.reviewItems] }));
      schedulePersist(get);
    },
    rateReview: (reviewItemId, correctness, confidence) => {
      const item = get().reviewItems.find((candidate) => candidate.id === reviewItemId);
      if (!item) return;
      const outcome = scheduleReview(item, correctness, confidence);
      set((state) => ({
        reviewItems: state.reviewItems.map((candidate) => candidate.id === reviewItemId ? outcome.item : candidate),
        reviewLogs: [{ id: makeId("review-log"), reviewItemId, reviewedAt: new Date().toISOString(), correctness, confidence, nextDue: outcome.nextDue }, ...state.reviewLogs],
      }));
      schedulePersist(get);
    },
    addSkillEvidence: (evidence) => {
      set((state) => ({ skillEvidence: [{ ...evidence, id: makeId("skill-evidence"), createdAt: new Date().toISOString() }, ...state.skillEvidence] }));
      schedulePersist(get);
    },
    updateSettings: (patch) => {
      set((state) => ({ settings: { ...state.settings, ...patch } }));
      schedulePersist(get);
    },
    updateWeights: (patch) => {
      set((state) => ({ settings: { ...state.settings, weights: { ...state.settings.weights, ...patch } } }));
      schedulePersist(get);
    },
    updateProvider: (id, patch) => {
      set((state) => ({ providers: state.providers.map((provider) => provider.id === id ? { ...provider, ...patch } : provider) }));
      schedulePersist(get);
    },
    completeTask: (id) => {
      set((state) => state.completedTaskIds.includes(id) ? state : ({ completedTaskIds: [...state.completedTaskIds, id] }));
      schedulePersist(get);
    },
    snoozeTask: (id) => {
      set((state) => state.snoozedTaskIds.includes(id) ? state : ({ snoozedTaskIds: [...state.snoozedTaskIds, id] }));
      schedulePersist(get);
    },
    addAssessment: (assessment) => {
      set((state) => ({ assessmentHistory: [assessment, ...state.assessmentHistory] }));
      schedulePersist(get);
    },
    replaceData: (data) => {
      set({ ...data, selectedPaperId: data.papers[0]?.id });
      schedulePersist(get);
    },
    resetDemo: () => {
      const reset = createInitialState();
      set({ ...reset, view: "today", selectedPaperId: reset.papers[0]?.id, toast: { id: makeId("toast"), tone: "info", text: "Demo data reset. AI credentials were not changed." } });
      schedulePersist(get);
    },
  };
});

