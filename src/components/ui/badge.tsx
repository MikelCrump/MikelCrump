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
    sea: "bg-blue/10 text-blue border-blue/20",
    star: "bg-orange/15 text-navy border-orange/35",
    ink: "bg-navy text-cloud border-navy",
    warn: "bg-orange/10 text-navy border-orange/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
