import Link from "next/link";
import type { ReactNode } from "react";
import { OWNER } from "@/life/owner";

const NAV = [
  { href: "/life", label: "Board" },
  { href: "/life/connections", label: "Connections" },
  { href: "/life/automations", label: "Automations" },
];

export function LifeShell({
  children,
  active,
}: {
  children: ReactNode;
  active: "board" | "connections" | "automations";
}) {
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
            {NAV.map((item) => {
              const isActive =
                (active === "board" && item.href === "/life") ||
                (active === "connections" && item.href === "/life/connections") ||
                (active === "automations" && item.href === "/life/automations");
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
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
