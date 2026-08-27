"use client";

import { useEffect } from "react";

/** Keep light/dark in sync with Command Center (`cc-theme` localStorage). */
export function CommandCenterThemeSync() {
  useEffect(() => {
    const apply = () => {
      const stored = localStorage.getItem("cc-theme");
      const dark =
        stored === "dark" ||
        (stored !== "light" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    window.addEventListener("storage", apply);
    return () => window.removeEventListener("storage", apply);
  }, []);

  return null;
}
