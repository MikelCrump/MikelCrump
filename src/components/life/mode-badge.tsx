import type { ConnectionMode } from "@/life/types";

/** Plain status text with a colored dot — no pill. */
export function ModeBadge({ mode }: { mode: ConnectionMode }) {
  const label = mode === "live" ? "Live" : mode === "mock" ? "Preview" : "Not connected";
  const dot =
    mode === "live"
      ? "bg-[var(--life-ok)]"
      : mode === "mock"
        ? "bg-[#a3a6ad]"
        : "bg-[var(--life-warn)]";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--life-muted)]">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
