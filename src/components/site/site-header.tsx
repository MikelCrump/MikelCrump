"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/site/brand-mark";

const nav = [
  { href: "/#services", label: "Services" },
  { href: "/#approach", label: "Approach" },
  { href: "/#trust", label: "Credentials" },
  { href: "/#ventures", label: "Ventures" },
];

type SiteHeaderProps = {
  tone?: "dark" | "light";
};

export function SiteHeader({ tone = "dark" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const isDark = tone === "dark";

  return (
    <header className="relative z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          href="/"
          className={`group flex items-center gap-2.5 ${isDark ? "text-cloud" : "text-navy"}`}
        >
          <BrandMark
            className={`h-8 w-8 transition duration-300 group-hover:scale-[1.04] ${isDark ? "text-cloud" : "text-navy"}`}
          />
          <span className="font-display text-lg tracking-tight sm:text-xl">
            Crump <span className="text-blue">Solutions</span> Group
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                isDark
                  ? "text-cloud/70 hover:bg-white/10 hover:text-cloud"
                  : "text-ink-soft hover:bg-mist hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="https://crump360.com"
            target="_blank"
            rel="noreferrer"
            className={`inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold transition-colors ${
              isDark
                ? "text-cloud/80 hover:bg-white/10 hover:text-cloud"
                : "text-ink-soft hover:bg-mist hover:text-navy"
            }`}
          >
            CRUMP360
          </a>
          <a
            href="mailto:MikelCrump611@gmail.com"
            className="inline-flex h-10 items-center rounded-md bg-orange px-4 text-sm font-semibold text-navy transition hover:bg-star-soft"
          >
            Talk with us
          </a>
        </div>

        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-md border lg:hidden ${
            isDark
              ? "border-white/20 bg-white/10 text-cloud"
              : "border-line bg-surface text-navy"
          }`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div
          className={`border-t lg:hidden ${
            isDark ? "border-white/10 bg-navy/95 text-cloud" : "border-line bg-surface text-navy"
          }`}
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="mailto:MikelCrump611@gmail.com"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-orange px-4 py-3 text-sm font-semibold text-navy"
              onClick={() => setOpen(false)}
            >
              Talk with us
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
