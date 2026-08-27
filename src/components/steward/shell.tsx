"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Link2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/config";
import { tryCreateClient } from "@/lib/supabase/client";
import { clearPreviewSession } from "@/lib/preview-session";
import { ALLOWED_EMAIL, OWNER_DISPLAY_NAME } from "@/lib/auth-allowlist";

const NAV = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/connections", label: "Connections", icon: Link2 },
  { href: "/security", label: "Security", icon: ShieldCheck },
];

export function StewardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuth =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  if (isAuth) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    clearPreviewSession();
    const supabase = tryCreateClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="steward-atmosphere steward-grain relative flex min-h-screen">
      <div className="relative z-10 flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen w-[15.5rem] shrink-0 flex-col border-r border-[var(--line)] bg-white/50 px-4 py-6 backdrop-blur-xl md:flex">
          <div className="mb-10 px-2">
            <p className="font-display text-2xl tracking-tight text-[var(--ink)]">
              Steward
            </p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]/70">
              Private life OS · {OWNER_DISPLAY_NAME}
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                    active
                      ? "bg-[var(--accent)] text-white shadow-[0_10px_24px_-16px_rgba(15,67,57,0.8)]"
                      : "text-[var(--ink-soft)] hover:bg-white/70 hover:text-[var(--ink)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      active ? "scale-105" : "group-hover:translate-x-0.5"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 rounded-2xl border border-[var(--line)] bg-white/60 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-deep)]">
                MC
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--ink)]">
                  {OWNER_DISPLAY_NAME}
                </p>
                <p className="truncate text-[11px] text-[var(--ink-soft)]/70">
                  {ALLOWED_EMAIL}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--ok)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Locked to your account
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2 text-xs font-medium text-[var(--ink-soft)] transition hover:bg-white hover:text-[var(--ink)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-white/55 px-4 py-3 backdrop-blur-xl md:hidden">
            <div>
              <p className="font-display text-xl text-[var(--ink)]">Steward</p>
              <p className="text-[11px] text-[var(--ink-soft)]/70">
                Private · {OWNER_DISPLAY_NAME}
              </p>
            </div>
            <Link
              href="/security"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-white/80 px-2.5 py-1.5 text-xs font-medium text-[var(--accent-deep)]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure
            </Link>
          </header>

          <main className="relative z-10 flex-1 overflow-y-auto">{children}</main>

          <nav className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-[var(--line)] bg-white/80 px-1 py-2 backdrop-blur-xl md:hidden">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium",
                    active
                      ? "text-[var(--accent)]"
                      : "text-[var(--ink-soft)]/70"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pointer-events-none absolute right-8 top-8 hidden opacity-40 lg:block">
        <CalendarDays className="h-24 w-24 text-[var(--accent)] animate-steward-pulse" />
      </div>
    </div>
  );
}
