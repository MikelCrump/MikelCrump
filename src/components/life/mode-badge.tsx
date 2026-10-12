import type { ConnectionMode } from "@/life/types";

export function ModeBadge({ mode }: { mode: ConnectionMode }) {
  const label =
    mode === "live" ? "Live" : mode === "mock" ? "Preview" : "Connect";
  const tone =
    mode === "live"
      ? "bg-sky-400/20 text-sky-800 ring-sky-500/25"
      : mode === "mock"
        ? "bg-sky-500/12 text-sky-900 ring-sky-600/15"
        : "bg-amber-500/15 text-amber-900 ring-amber-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ring-inset ${tone}`}
    >
      {label}
    </span>
  );
}
