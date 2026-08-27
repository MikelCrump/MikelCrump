export const THEME_STORAGE_KEY = "cc-theme";
export const THEME_CHANGE_EVENT = "tables-theme-change";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") {
    return getSystemPrefersDark() ? "dark" : "light";
  }
  return preference;
}

export function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

export function applyResolvedTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function setThemePreference(preference: ThemePreference) {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyResolvedTheme(resolveTheme(preference));
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, { detail: { preference } })
  );
}

/** Toggle between light and dark (explicit — not system). */
export function toggleLightDark() {
  const current = resolveTheme(readThemePreference());
  setThemePreference(current === "dark" ? "light" : "dark");
}
