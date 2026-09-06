"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutTemplate,
  Compass,
} from "lucide-react";
import { NorthstarMark } from "@/components/brand/northstar-mark";
import { deviceProfile } from "@/lib/data";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Arrive", icon: Compass },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
];

export function TabletChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/kiosk");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="aurora-bg min-h-dvh">
      <div className="constellation min-h-dvh">
        <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 md:px-8">
            <Link href="/" className="flex items-center gap-3">
              <NorthstarMark className="h-9 w-9" animate />
              <div>
                <p className="font-display text-xl leading-none tracking-tight text-ink">
                  Northstar Arrival
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Onsite check-in · tablet ops
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 rounded-2xl bg-mist/80 p-1 sm:flex">
              {nav.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-cloud text-ink shadow-sm"
                        : "text-ink-soft hover:text-ink"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{deviceProfile.name}</p>
              <p className="text-xs text-ink-soft">
                {deviceProfile.operator} · {deviceProfile.role}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-5 py-6 md:px-8 md:py-8">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-paper/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-around py-2">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold",
                    active ? "text-sea" : "text-ink-soft"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="h-20 sm:hidden" />
      </div>
    </div>
  );
}
