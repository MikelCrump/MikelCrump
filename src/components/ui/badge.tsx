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
          default: "bg-sea/12 text-sea",
          secondary: "bg-mist text-ink-soft",
          success: "bg-emerald-100 text-emerald-800",
          warning: "bg-amber-100 text-amber-900",
          outline: "border border-line text-ink-soft",
          star: "bg-star/25 text-ink",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
