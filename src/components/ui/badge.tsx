import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          default: "bg-primary/15 text-primary",
          secondary: "bg-muted text-muted-foreground",
          success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
          warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
          outline: "border border-border text-muted-foreground",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
