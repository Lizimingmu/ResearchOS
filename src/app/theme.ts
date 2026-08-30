import type { AppSettings } from "../domain/types";

type Theme = AppSettings["theme"];
type MediaMatcher = (query: string) => { matches: boolean };

export function resolveTheme(theme: Theme, mediaMatcher?: MediaMatcher): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  const matcher = mediaMatcher ?? (
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia.bind(window)
      : undefined
  );
  return matcher?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
