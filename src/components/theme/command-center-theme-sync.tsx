"use client";

import { useEffect } from "react";

const STORAGE_KEY = "cc-theme";

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(theme: string) {
  return theme === "system"
    ? getSystemPrefersDark()
      ? "dark"
      : "light"
    : theme;
}

function applyResolvedTheme(resolved: string) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

/** Keep Tables night mode in sync with Command Center (`cc-theme` localStorage). */
export function CommandCenterThemeSync() {
  useEffect(() => {
    const apply = () => {
      const theme = localStorage.getItem(STORAGE_KEY) || "system";
      applyResolvedTheme(resolve(theme));
    };

    apply();

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) apply();
    };
    window.addEventListener("storage", onStorage);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => apply();
    media.addEventListener("change", onMedia);

    // Poll lightly in case CC toggles theme in the same tab via iframe parent
    const interval = window.setInterval(apply, 1500);

    return () => {
      window.removeEventListener("storage", onStorage);
      media.removeEventListener("change", onMedia);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
