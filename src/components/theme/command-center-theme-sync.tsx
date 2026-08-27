"use client";

import { useEffect, useState } from "react";
import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  applyResolvedTheme,
  readThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

/** Keep Tables theme in sync with Command Center (`cc-theme`) and local toggles. */
export function CommandCenterThemeSync() {
  useEffect(() => {
    const apply = () => {
      applyResolvedTheme(resolveTheme(readThemePreference()));
    };

    apply();

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY || e.key === null) apply();
    };
    const onLocal = () => apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_CHANGE_EVENT, onLocal);
    media.addEventListener("change", apply);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THEME_CHANGE_EVENT, onLocal);
      media.removeEventListener("change", apply);
    };
  }, []);

  return null;
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const sync = () => {
      const pref = readThemePreference();
      setPreference(pref);
      setResolved(resolveTheme(pref));
    };
    sync();
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { preference, resolved };
}
