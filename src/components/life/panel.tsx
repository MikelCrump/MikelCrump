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
}: {
  title: string;
  subtitle?: string;
  mode?: ConnectionMode;
  children: ReactNode;
  action?: ReactNode;
  href?: string;
  className?: string;
  /** @deprecated entrance animations were removed; kept for call-site compatibility. */
  delay?: number;
}) {
  return (
    <section className={`life-panel ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-[15px] font-semibold text-[var(--life-ink)]">
              {href ? (
                <Link href={href} className="hover:underline">
                  {title}
                </Link>
              ) : (
                title
              )}
            </h2>
            {mode ? <ModeBadge mode={mode} /> : null}
          </div>
          {subtitle ? (
            <p className="mt-0.5 text-[13px] text-[var(--life-muted)]">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {action}
          {href ? (
            <Link
              href={href}
              className="text-[13px] text-[var(--life-muted)] hover:text-[var(--life-ink)]"
            >
              View
            </Link>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
