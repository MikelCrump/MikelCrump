import { cn } from "@/lib/utils";

export function Widget({
  title,
  subtitle,
  action,
  children,
  className,
  delayClass = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delayClass?: string;
}) {
  return (
    <section
      className={cn(
        "widget-panel animate-steward-rise p-5",
        delayClass,
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-[var(--ink)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[var(--ink-soft)]/65">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PreviewBadge({ label = "Preview data" }: { label?: string }) {
  return (
    <span className="rounded-md border border-[var(--line)] bg-white/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--ink-soft)]/70">
      {label}
    </span>
  );
}

export function ConnectHint({ href = "/connections" }: { href?: string }) {
  return (
    <a
      href={href}
      className="text-xs font-medium text-[var(--accent)] transition hover:text-[var(--accent-deep)]"
    >
      Connect →
    </a>
  );
}
