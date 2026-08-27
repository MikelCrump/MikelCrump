"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Database,
  LayoutGrid,
  Settings,
  Plus,
  ChevronDown,
  LogOut,
  Cloud,
  HardDrive,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/config";
import { tryCreateClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LiveSyncIndicator } from "@/components/layout/live-sync-indicator";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const workspace = useAppStore((s) => s.workspace);
  const bases = useAppStore((s) => s.bases);
  const mode = useAppStore((s) => s.mode);
  const currentUser = useAppStore((s) =>
    s.team.find((m) => m.id === s.currentUserId)
  );

  const isEmbed = pathname.startsWith("/embed");
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isEmbed || isAuth) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    const supabase = tryCreateClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/", label: "Home", icon: LayoutGrid },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[var(--surface)] text-[var(--foreground)]">
      <aside className="flex w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]">
        <div className="flex h-14 items-center gap-2 border-b border-[var(--sidebar-border)] px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <Database className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-[var(--sidebar-foreground)]">
                Tables
              </p>
              {mode === "remote" ? (
                <Badge variant="success" className="px-1.5 py-0 text-[10px]">
                  <Cloud className="mr-0.5 h-2.5 w-2.5" />
                  Cloud
                </Badge>
              ) : mode === "local" ? (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  <HardDrive className="mr-0.5 h-2.5 w-2.5" />
                  Local
                </Badge>
              ) : null}
            </div>
            <p className="truncate text-xs text-[var(--sidebar-muted)]">
              {workspace.name}
            </p>
            <LiveSyncIndicator compact />
          </div>
          <ThemeToggle className="h-8 w-8 shrink-0" />
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <a
            href="https://reawakencommandcenter.com/tools"
            className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Command Center
          </a>

          <div className="mb-4">
            {navItems.map((item) => {
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
                    "mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--sidebar-accent)] text-[var(--primary)]"
                      : "text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mb-2 flex items-center justify-between px-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sidebar-muted)]">
              Bases
            </span>
            <Link
              href="/?create=base"
              className="rounded p-0.5 text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-0.5">
            {bases.map((base) => {
              const active = pathname.includes(`/base/${base.id}`);
              return (
                <Link
                  key={base.id}
                  href={`/base/${base.id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-[var(--sidebar-accent)] font-medium text-[var(--sidebar-foreground)]"
                      : "text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-accent)]"
                  )}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-sm"
                    style={{ backgroundColor: `${base.color}20`, color: base.color }}
                  >
                    {base.icon || base.name.charAt(0)}
                  </span>
                  <span className="truncate">{base.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--sidebar-border)] p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-[var(--sidebar-accent)]">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  style={{ backgroundColor: currentUser?.avatarColor }}
                >
                  {currentUser?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--sidebar-foreground)]">
                  {currentUser?.name}
                </p>
                <p className="truncate text-xs text-[var(--sidebar-muted)]">
                  {currentUser?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-[var(--sidebar-muted)]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              {isSupabaseConfigured() && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden bg-[var(--background)]">
        {children}
      </main>
    </div>
  );
}
