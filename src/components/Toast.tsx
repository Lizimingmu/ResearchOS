import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect } from "react";
import { useAppStore } from "../state/store";

export function Toast() {
  const toast = useAppStore((state) => state.toast);
  const clearToast = useAppStore((state) => state.clearToast);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, toast.tone === "error" ? 8000 : 4500);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);
  if (!toast) return null;
  const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" || toast.tone === "warning" ? AlertTriangle : Info;
  return <div className={`toast ${toast.tone}`} role="status"><Icon size={16} /><span>{toast.text}</span><button onClick={clearToast} aria-label="Dismiss"><X size={14} /></button></div>;
}

