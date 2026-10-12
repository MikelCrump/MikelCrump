import Link from "next/link";
import type { ReactNode } from "react";
import { ModeBadge } from "@/components/life/mode-badge";
import type { ConnectionMode } from "@/life/types";

export function Panel({
  title,
  subtitle,
  mode,
  children,
  action,
  href,
  className = "",
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  mode?: ConnectionMode;
  children: ReactNode;
  action?: ReactNode;
  href?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={`life-panel life-rise ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {href ? (
              <Link
                href={href}
                className="text-sm font-semibold tracking-wide text-[var(--life-ink)] uppercase hover:text-[var(--life-accent)]"
              >
                {title}
              </Link>
            ) : (
              <h2 className="text-sm font-semibold tracking-wide text-[var(--life-ink)] uppercase">
                {title}
              </h2>
            )}
            {mode ? <ModeBadge mode={mode} /> : null}
          </div>
          {subtitle ? (
            <p className="mt-1 text-xs text-[var(--life-muted)]">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {href ? (
            <Link
              href={href}
              className="text-[11px] font-semibold text-[var(--life-accent)] hover:underline"
            >
              Open →
            </Link>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
