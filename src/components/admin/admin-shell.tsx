"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  Settings2,
  Shield,
} from "lucide-react";
import { Crump360MarkImage } from "@/components/brand/crump360-mark";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/modules", label: "Content modules", icon: BookOpen },
  { href: "/admin/questions", label: "Questions & answers", icon: HelpCircle },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/site", label: "Site settings", icon: Settings2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-line bg-navy text-cloud">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Crump360MarkImage className="h-8 w-8" />
            <div>
              <p className="font-display text-xl tracking-tight">
                CRUMP<span className="text-blue">360</span>
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange">
                Admin portal
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-cloud/80 sm:inline-flex">
              <Shield className="h-3 w-3 text-orange" /> Operator access
            </span>
            <Link
              href="/"
              className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-cloud hover:bg-white/15"
            >
              View site
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:px-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-line bg-surface p-3 shadow-sm lg:sticky lg:top-6">
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-navy text-cloud"
                      : "text-muted hover:bg-mist hover:text-navy"
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4", active ? "text-orange" : "")}
                    strokeWidth={1.75}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
