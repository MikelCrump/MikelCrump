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
  { href: "/admin", label: "Admin" },
];

export function SiteHeader({
  variant = "marketing",
  tone = "light",
}: {
  variant?: "marketing" | "app";
  tone?: "light" | "dark";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = variant === "app" ? appLinks : marketingLinks;
  const dark = tone === "dark";

  return (
    <header className="relative z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          href="/"
          className={cn(
            "group flex items-center gap-2.5",
            dark ? "text-cloud" : "text-navy"
          )}
        >
          <Crump360Mark
            tone={dark ? "dark" : "light"}
            className="h-8 w-8 transition duration-300 group-hover:scale-[1.04]"
          />
          <span className="font-display text-xl tracking-tight sm:text-2xl">
            CRUMP<span className="text-blue">360</span>
          </span>
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
                  "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  dark
                    ? active
                      ? "bg-white/15 text-cloud"
                      : "text-cloud/70 hover:bg-white/10 hover:text-cloud"
                    : active
                      ? "bg-navy text-cloud"
                      : "text-ink-soft hover:bg-mist hover:text-navy"
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
              <Button
                asChild
                variant="ghost"
                className={
                  dark
                    ? "text-cloud/80 hover:bg-white/10 hover:text-cloud"
                    : undefined
                }
              >
                <Link href="/dashboard">Sign in</Link>
              </Button>
              <Button asChild variant={dark ? "star" : "default"}>
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
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden",
            dark
              ? "border-white/20 bg-white/10 text-cloud"
              : "border-line bg-cloud text-navy"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div
          className={cn(
            "border-t px-5 py-4 md:hidden",
            dark ? "border-white/10 bg-navy" : "border-line bg-cloud"
          )}
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-semibold",
                  dark
                    ? "text-cloud hover:bg-white/10"
                    : "text-navy hover:bg-mist"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                "mt-2 rounded-md px-3 py-2.5 text-center text-sm font-semibold",
                dark ? "bg-orange text-navy" : "bg-navy text-cloud"
              )}
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
    <footer className="mt-20 border-t border-line bg-navy text-cloud">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Crump360Mark tone="dark" className="h-7 w-7" />
            <span className="font-display text-xl tracking-tight">
              CRUMP<span className="text-blue">360</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-cloud/65">
            Events and learning on one path — so gatherings create skill, not
            just memories.
          </p>
          <a
            href="https://crump360.com"
            className="mt-4 inline-block text-sm font-bold tracking-wide text-orange hover:underline"
          >
            CRUMP360.com
          </a>
        </div>
        <div className="flex flex-wrap gap-5 text-sm font-semibold text-cloud/70">
          <Link href="/events" className="hover:text-orange">
            Events
          </Link>
          <Link href="/learn" className="hover:text-orange">
            Learn
          </Link>
          <Link href="/admin" className="hover:text-orange">
            Admin
          </Link>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-cloud/45">
            © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
