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
      <div className="life-atmosphere" aria-hidden />
      <header className="relative z-10 border-b border-[var(--life-line)]/70 bg-[var(--life-surface)]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/life" className="group">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--life-accent)] uppercase">
                Life Ops
              </p>
              <p
                className="text-2xl leading-none tracking-tight text-[var(--life-ink)] transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-3xl"
                style={{ fontFamily: "var(--font-life-display), sans-serif" }}
              >
                {OWNER.name}
              </p>
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const isActive = active === item.id;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--life-ink)] text-white"
                      : "text-[var(--life-muted)] hover:bg-black/5 hover:text-[var(--life-ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="ml-2 rounded-lg px-3 py-2 text-sm text-[var(--life-muted)] hover:text-[var(--life-ink)]"
            >
              Studio
            </Link>
          </nav>
        </div>
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          <div className="flex min-w-max items-center gap-1">
            <span className="mr-1 text-[10px] font-semibold tracking-[0.16em] text-[var(--life-muted)] uppercase">
              Areas
            </span>
            {strip.map((item) => {
              const isActive = active === item.id;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--life-accent)] text-[var(--life-ink)]"
                      : "bg-black/[0.04] text-[var(--life-muted)] hover:bg-black/[0.07] hover:text-[var(--life-ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
