import { useEffect, useMemo } from "react";
import { AppShell } from "../components/AppShell";
import { CommandPalette } from "../components/CommandPalette";
import { Toast } from "../components/Toast";
import { TodayView } from "../features/today/TodayView";
import { LibraryView } from "../features/library/LibraryView";
import { PaperLabView } from "../features/paper-lab/PaperLabView";
import { MethodLabView } from "../features/methods/MethodLabView";
import { ReviewView } from "../features/review/ReviewView";
import { AuditView } from "../features/ai-audit/AuditView";
import { FrontierView } from "../features/frontier/FrontierView";
import { ProjectsView } from "../features/projects/ProjectsView";
import { SkillMapView } from "../features/skills/SkillMapView";
import { AssessmentView } from "../features/assessment/AssessmentView";
import { SettingsView } from "../features/settings/SettingsView";
import { useAppStore } from "../state/store";

const views = {
  today: TodayView,
  library: LibraryView,
  "paper-lab": PaperLabView,
  methods: MethodLabView,
  review: ReviewView,
  "ai-audit": AuditView,
  frontier: FrontierView,
  projects: ProjectsView,
  skills: SkillMapView,
  assessment: AssessmentView,
  settings: SettingsView,
};

export function App() {
  const view = useAppStore((state) => state.view);
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const settings = useAppStore((state) => state.settings);
  const setPaletteOpen = useAppStore((state) => state.setPaletteOpen);
  const setView = useAppStore((state) => state.setView);
  const View = useMemo(() => views[view], [view]);

  useEffect(() => { void hydrate(); }, [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    const resolved = settings.theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : settings.theme;
    root.dataset.theme = resolved;
  }, [settings.theme]);

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
    return <div className="boot-screen"><div className="boot-mark">R</div><span>Opening local workspace…</span></div>;
  }

  return (
    <>
      <AppShell><View /></AppShell>
      <CommandPalette />
      <Toast />
    </>
  );
}
