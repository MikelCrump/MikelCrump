import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "outline" | "star";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        {
          default: "bg-blue/12 text-blue",
          secondary: "bg-mist text-muted",
          success: "bg-emerald-100 text-emerald-800",
          warning: "bg-orange/15 text-orange",
          outline: "border border-line text-muted",
          star: "bg-orange text-navy",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
