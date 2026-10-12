import Link from "next/link";
import type { LifeSection } from "@/life/sections";

export function DetailHeader({ section }: { section: LifeSection }) {
  return (
    <header className="life-rise mb-8 max-w-3xl">
      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--life-muted)] uppercase">
        <Link href="/life" className="hover:text-[var(--life-accent)]">
          Board
        </Link>
        <span className="mx-2 opacity-40">/</span>
        {section.label}
      </p>
      <h1
        className="mt-2 text-4xl tracking-tight text-[var(--life-ink)]"
        style={{ fontFamily: "var(--font-life-display), sans-serif" }}
      >
        {section.title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--life-muted)]">
        {section.description}
      </p>
    </header>
  );
}
