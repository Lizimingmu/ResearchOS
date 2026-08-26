import {
  Activity,
  Beaker,
  BookOpen,
  BrainCircuit,
  ClipboardCheck,
  Compass,
  FileSearch,
  FlaskConical,
  FolderKanban,
  Library,
  SearchCheck,
  Settings,
  NotebookTabs,
} from "lucide-react";
import type { ViewId } from "../domain/types";
import { DEFAULT_LOCALE, t, type Locale } from "../i18n";

export const getNavigation = (locale: Locale = DEFAULT_LOCALE): Array<{ id: ViewId; label: string; icon: typeof Activity; key?: string }> => [
  { id: "today", label: t(locale, "nav.today"), icon: Activity, key: "1" },
  { id: "library", label: t(locale, "nav.library"), icon: Library, key: "2" },
  { id: "paper-lab", label: t(locale, "nav.paperLab"), icon: FileSearch, key: "3" },
  { id: "methods", label: t(locale, "nav.methodLab"), icon: Beaker, key: "4" },
  { id: "problem-atlas", label: t(locale, "nav.problemAtlas"), icon: SearchCheck, key: "0" },
  { id: "content-studio", label: "内容工作台", icon: NotebookTabs },
  { id: "review", label: t(locale, "nav.review"), icon: BookOpen, key: "5" },
  { id: "ai-audit", label: t(locale, "nav.aiAudit"), icon: BrainCircuit, key: "6" },
  { id: "frontier", label: t(locale, "nav.frontier"), icon: Compass, key: "7" },
  { id: "projects", label: t(locale, "nav.projects"), icon: FolderKanban, key: "8" },
  { id: "skills", label: t(locale, "nav.skillMap"), icon: FlaskConical, key: "9" },
  { id: "assessment", label: t(locale, "nav.assessment"), icon: ClipboardCheck },
  { id: "settings", label: t(locale, "nav.settings"), icon: Settings },
];

export const navigation = getNavigation();
