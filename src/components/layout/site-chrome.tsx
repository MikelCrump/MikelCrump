"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Crump360Mark } from "@/components/brand/crump360-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const marketingLinks = [
  { href: "/events", label: "Events" },
  { href: "/learn", label: "Learn" },
  { href: "/#method", label: "Method" },
];

const appLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/learn", label: "Courses" },
  { href: "/progress", label: "Progress" },
  { href: "/teach", label: "Teach" },
];

export function SiteHeader({ variant = "marketing" }: { variant?: "marketing" | "app" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = variant === "app" ? appLinks : marketingLinks;

  return (
    <header className="relative z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link href="/" className="group flex items-center gap-2.5 text-ink">
          <Crump360Mark className="h-8 w-8" animate />
          <span className="font-display text-2xl tracking-tight">CRUMP360</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.href !== "/#method" &&
              (pathname === link.href || pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-mist text-ink" : "text-ink-soft hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {variant === "marketing" ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Enter platform</Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="secondary" size="sm">
              <Link href="/">Marketing site</Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-cloud md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-cloud px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-ink px-3 py-2.5 text-center text-sm font-semibold text-cloud"
            >
              Enter platform
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <div className="flex items-center gap-2 text-ink">
            <Crump360Mark className="h-6 w-6" />
            <span className="font-display text-xl">CRUMP360</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-ink-soft">
            Events and learning on one path — so gatherings create skill, not just memories.
          </p>
          <a
            href="https://crump360.com"
            className="mt-3 inline-block text-sm font-semibold tracking-wide text-sea hover:underline"
          >
            CRUMP360.com
          </a>
        </div>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-soft/80">
          CRUMP360 · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
