"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type UiMode = "wizard" | "canvas";

type ProjectHeaderProps = {
  projectId: string;
  title: string;
  status: string;
};

export function ProjectHeader({ projectId, title, status }: ProjectHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mode: UiMode = pathname.includes("/canvas") ? "canvas" : "wizard";

  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <Link
            href="/"
            className="text-xs font-medium tracking-[0.16em] text-[var(--accent)] uppercase"
          >
            Crump Studio
          </Link>
          <h1
            className="mt-1 text-2xl tracking-tight"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {title}
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Status <span className="font-medium text-[var(--ink)]">{status}</span>
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-white/50 p-1">
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}/wizard`)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              mode === "wizard"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            Linear Wizard
          </button>
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}/canvas`)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              mode === "canvas"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            Visual Canvas
          </button>
        </div>
      </div>
    </header>
  );
}
