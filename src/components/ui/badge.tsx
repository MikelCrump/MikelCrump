import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "mist",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "mist" | "sea" | "star" | "ink" | "warn";
}) {
  const tones = {
    mist: "bg-mist text-ink-soft border-line",
    sea: "bg-sea/10 text-sea border-sea/20",
    star: "bg-star/20 text-ink border-star/40",
    ink: "bg-ink text-cloud border-ink",
    warn: "bg-amber-50 text-amber-900 border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
