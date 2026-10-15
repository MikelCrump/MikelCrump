import Link from "next/link";
import type { LifeSection } from "@/life/sections";

export function DetailHeader({ section }: { section: LifeSection }) {
  return (
    <header className="mb-6 max-w-3xl">
      <p className="text-[13px] text-[var(--life-muted)]">
        <Link href="/life" className="hover:text-[var(--life-ink)]">
          Board
        </Link>
        <span className="mx-1.5">/</span>
        {section.label}
      </p>
      <h1 className="mt-1 text-[28px] font-semibold text-[var(--life-ink)]">{section.title}</h1>
      <p className="mt-1 text-[15px] text-[var(--life-muted)]">{section.description}</p>
    </header>
  );
}
