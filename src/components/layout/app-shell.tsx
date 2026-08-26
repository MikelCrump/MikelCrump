"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Database,
  LayoutGrid,
  Settings,
  Users,
  Plus,
  ChevronDown,
  LogOut,
  Cloud,
  HardDrive,
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
    { href: "/settings/team", label: "Team", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Database className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-slate-900">TableFlow</p>
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
            <p className="truncate text-xs text-slate-500">{workspace.name}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
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
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mb-2 flex items-center justify-between px-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bases
            </span>
            <Link
              href="/?create=base"
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
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

        <div className="border-t border-slate-100 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50">
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
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {currentUser?.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {currentUser?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings/team">Manage team</Link>
              </DropdownMenuItem>
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

      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
