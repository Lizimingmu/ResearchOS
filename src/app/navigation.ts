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
  { id: "today", label: "今日训练", icon: Activity, key: "1" },
  { id: "library", label: "文献库", icon: Library, key: "2" },
  { id: "paper-lab", label: "论文实验室", icon: FileSearch, key: "3" },
  { id: "methods", label: "方法实验室", icon: Beaker, key: "4" },
  { id: "review", label: "复习", icon: BookOpen, key: "5" },
  { id: "ai-audit", label: "AI 审查", icon: BrainCircuit, key: "6" },
  { id: "frontier", label: "前沿地图", icon: Compass, key: "7" },
  { id: "projects", label: "项目", icon: FolderKanban, key: "8" },
  { id: "skills", label: "能力图谱", icon: FlaskConical, key: "9" },
  { id: "assessment", label: "盲测评估", icon: ClipboardCheck },
  { id: "settings", label: "设置", icon: Settings },
];
