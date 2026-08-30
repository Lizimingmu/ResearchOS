import { lazy, Suspense, useEffect, useMemo } from "react";
import { AppShell } from "../components/AppShell";
import { CommandPalette } from "../components/CommandPalette";
import { Toast } from "../components/Toast";
import { Onboarding } from "../components/Onboarding";
import { Tutorial } from "../components/Tutorial";
import { useAppStore } from "../state/store";
import { resolveTheme } from "./theme";

const views = {
  today: lazy(() => import("../features/today/TodayView").then((module) => ({ default: module.TodayView }))),
  guide: lazy(() => import("../features/guide/GuideView").then((module) => ({ default: module.GuideView }))),
  learning: lazy(() => import("../features/learning/LearningView").then((module) => ({ default: module.LearningView }))),
  practice: lazy(() => import("../features/practice/PracticeHubView").then((module) => ({ default: module.PracticeHubView }))),
  "case-lab": lazy(() => import("../features/case-lab/CaseLabView").then((module) => ({ default: module.CaseLabView }))),
  library: lazy(() => import("../features/library/LibraryView").then((module) => ({ default: module.LibraryView }))),
  "paper-lab": lazy(() => import("../features/paper-lab/PaperLabView").then((module) => ({ default: module.PaperLabView }))),
  methods: lazy(() => import("../features/methods/MethodLabView").then((module) => ({ default: module.MethodLabView }))),
  review: lazy(() => import("../features/review/ReviewView").then((module) => ({ default: module.ReviewView }))),
  "ai-audit": lazy(() => import("../features/ai-audit/AuditView").then((module) => ({ default: module.AuditView }))),
  frontier: lazy(() => import("../features/frontier/FrontierView").then((module) => ({ default: module.FrontierView }))),
  projects: lazy(() => import("../features/projects/ProjectsView").then((module) => ({ default: module.ProjectsView }))),
  skills: lazy(() => import("../features/skills/SkillMapView").then((module) => ({ default: module.SkillMapView }))),
  "problem-atlas": lazy(() => import("../features/problem-atlas/ProblemAtlasView").then((module) => ({ default: module.ProblemAtlasView }))),
  "content-studio": lazy(() => import("../features/content-studio/ContentStudioView").then((module) => ({ default: module.ContentStudioView }))),
  assessment: lazy(() => import("../features/assessment/AssessmentView").then((module) => ({ default: module.AssessmentView }))),
  settings: lazy(() => import("../features/settings/SettingsView").then((module) => ({ default: module.SettingsView }))),
};

export function App() {
  const view = useAppStore((state) => state.view);
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const settings = useAppStore((state) => state.settings);
  const setPaletteOpen = useAppStore((state) => state.setPaletteOpen);
  const setView = useAppStore((state) => state.setView);
  const persistNow = useAppStore((state) => state.persistNow);
  const onboarding = useAppStore((state) => state.onboarding);
  const View = useMemo(() => views[view], [view]);

  useEffect(() => {
    (window as Window & { __RESEARCHOS_BOOT__?: { ready: () => void } }).__RESEARCHOS_BOOT__?.ready();
  }, []);

  useEffect(() => { void hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const flush = () => { void persistNow().catch(() => undefined); };
    const handleVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [hydrated, persistNow]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolveTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey && key === "k") || (event.ctrlKey && event.shiftKey && key === "p")) {
        event.preventDefault();
        setPaletteOpen(true);
      } else if (event.ctrlKey && key === ",") {
        event.preventDefault();
        setView("settings");
      } else if (event.ctrlKey && key === "o") {
        event.preventDefault();
        setView("library");
        window.setTimeout(() => window.dispatchEvent(new CustomEvent("researchos:import-pdf")), 0);
      } else if (event.ctrlKey && key === "f") {
        event.preventDefault();
        document.getElementById("workspace-search")?.focus();
      } else if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setPaletteOpen, setView]);

  if (!hydrated) {
    return <div className="boot-screen"><div className="boot-mark">R</div><span>正在打开本地工作区…</span></div>;
  }

  if (!onboarding.completed) return <Onboarding />;

  return (
    <>
      <AppShell><Suspense fallback={<div className="boot-screen"><span>正在加载工作区模块…</span></div>}><View /></Suspense></AppShell>
      <CommandPalette />
      <Toast />
      <Tutorial />
    </>
  );
}
