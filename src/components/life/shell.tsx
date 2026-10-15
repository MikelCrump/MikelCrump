import Link from "next/link";
import type { ReactNode } from "react";
import { OWNER } from "@/life/owner";
import { LIFE_SECTIONS, type LifeSectionId } from "@/life/sections";

const PRIMARY_NAV = [
  { href: "/life", label: "Board", id: "board" as const },
  { href: "/life/connections", label: "Connections", id: "connections" as const },
  { href: "/life/automations", label: "Automations", id: "automations" as const },
];

export function LifeShell({
  children,
  active,
}: {
  children: ReactNode;
  active: LifeSectionId;
}) {
  const strip = LIFE_SECTIONS.filter((s) => s.inStrip);

  return (
    <div className="life-root min-h-full">
      <header className="border-b border-[var(--life-line)] bg-[var(--life-surface)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 pt-4 sm:px-6 lg:px-8">
          <Link href="/life" className="flex items-baseline gap-2">
            <span className="text-[17px] font-semibold tracking-tight text-[var(--life-ink)]">
              {OWNER.name}
            </span>
            <span className="text-sm text-[var(--life-muted)]">Life Ops</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-5 text-sm">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active === item.id
                    ? "font-medium text-[var(--life-ink)]"
                    : "text-[var(--life-muted)] hover:text-[var(--life-ink)]"
                }
              >
                {item.label}
              </Link>
            ))}
            <Link href="/" className="text-[var(--life-muted)] hover:text-[var(--life-ink)]">
              Studio
            </Link>
          </nav>
        </div>
        <nav
          aria-label="Areas"
          className="mx-auto mt-3 max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex min-w-max gap-6">
            {strip.map((item) => {
              const isActive = active === item.id;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
                    isActive
                      ? "border-[var(--life-ink)] font-medium text-[var(--life-ink)]"
                      : "border-transparent text-[var(--life-muted)] hover:text-[var(--life-ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
