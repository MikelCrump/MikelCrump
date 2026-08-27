"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  Zap,
  Users,
  Plug,
  Settings,
  ChevronDown,
  Send,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navigation: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Email",
    href: "/email/campaigns",
    icon: Mail,
    children: [
      { title: "Campaigns", href: "/email/campaigns", icon: Send },
      { title: "Templates", href: "/email/templates", icon: FileText },
    ],
  },
  {
    title: "SMS",
    href: "/sms/campaigns",
    icon: MessageSquare,
    children: [
      { title: "Campaigns", href: "/sms/campaigns", icon: Send },
      { title: "Templates", href: "/sms/templates", icon: FileText },
    ],
  },
  { title: "Automations", href: "/automations", icon: Zap },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Integrations", href: "/integrations", icon: Plug },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    Email: true,
    SMS: true,
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <Image
          src={brand.logoWhitePath}
          alt={brand.legalName}
          width={36}
          height={36}
          className="rounded-md"
        />
        <div>
          <h1 className="text-base font-bold text-sidebar-foreground">{brand.name}</h1>
          <p className="text-[11px] text-sidebar-foreground/60">{brand.tagline}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            item.children?.some((c) => pathname.startsWith(c.href));
          const isExpanded = expanded[item.title] ?? false;

          if (item.children) {
            return (
              <div key={item.title}>
                <button
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [item.title]: !prev[item.title],
                    }))
                  }
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === child.href ||
                            (child.href !== "/" &&
                              pathname.startsWith(child.href))
                            ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                        )}
                      >
                        <child.icon className="h-3.5 w-3.5" />
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        {process.env.NEXT_PUBLIC_BASE_PATH === "/apps/communications" && (
          <a
            href="/tools"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            ← Back to Command Center Tools
          </a>
        )}
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs font-medium text-sidebar-foreground">
            {brand.legalName}
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/60 leading-relaxed">
            Email & SMS for your team, chapters, and outreach.
          </p>
        </div>
      </div>
    </aside>
  );
}
