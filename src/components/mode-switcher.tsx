"use client";

import { useState } from "react";

export type UiMode = "wizard" | "canvas";

type ModeSwitcherProps = {
  projectId?: string;
  initialMode?: UiMode;
};

export function ModeSwitcher({
  projectId,
  initialMode = "wizard",
}: ModeSwitcherProps) {
  const [mode, setMode] = useState<UiMode>(initialMode);

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1 backdrop-blur">
      <button
        type="button"
        onClick={() => setMode("wizard")}
        className={`rounded-lg px-3 py-1.5 text-sm transition ${
          mode === "wizard"
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
        }`}
        aria-pressed={mode === "wizard"}
      >
        Linear Wizard
      </button>
      <button
        type="button"
        onClick={() => setMode("canvas")}
        className={`rounded-lg px-3 py-1.5 text-sm transition ${
          mode === "canvas"
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
        }`}
        aria-pressed={mode === "canvas"}
      >
        Visual Canvas
      </button>
      <span className="hidden px-2 text-xs text-[var(--ink-muted)] sm:inline">
        {projectId
          ? `Routes land in Phase 4/6 · /projects/${projectId}/${mode}`
          : "Mode switcher placeholder · shared VideoProject"}
      </span>
    </div>
  );
}
