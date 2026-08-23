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
  Settings,
} from "lucide-react";
import type { ViewId } from "../domain/types";

export const navigation: Array<{ id: ViewId; label: string; icon: typeof Activity; key?: string }> = [
  { id: "today", label: "Today", icon: Activity, key: "1" },
  { id: "library", label: "Library", icon: Library, key: "2" },
  { id: "paper-lab", label: "Paper Lab", icon: FileSearch, key: "3" },
  { id: "methods", label: "Method Lab", icon: Beaker, key: "4" },
  { id: "review", label: "Review", icon: BookOpen, key: "5" },
  { id: "ai-audit", label: "AI Audit", icon: BrainCircuit, key: "6" },
  { id: "frontier", label: "Frontier", icon: Compass, key: "7" },
  { id: "projects", label: "Projects", icon: FolderKanban, key: "8" },
  { id: "skills", label: "Skill Map", icon: FlaskConical, key: "9" },
  { id: "assessment", label: "Assessment", icon: ClipboardCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

