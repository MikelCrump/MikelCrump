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
          default: "bg-blue-100 text-blue-800",
          secondary: "bg-slate-100 text-slate-700",
          success: "bg-emerald-100 text-emerald-800",
          warning: "bg-amber-100 text-amber-800",
          outline: "border border-slate-200 text-slate-600",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
