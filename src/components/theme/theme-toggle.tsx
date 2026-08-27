"use client";

import { Moon, Sun } from "lucide-react";
import { toggleLightDark } from "@/lib/theme";
import { useTheme } from "@/components/theme/command-center-theme-sync";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={() => toggleLightDark()}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted",
        className
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
