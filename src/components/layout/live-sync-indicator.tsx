"use client";

import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimeStatus } from "@/components/providers/app-provider";
import { useAppStore } from "@/lib/store";

export function LiveSyncIndicator({ compact = false }: { compact?: boolean }) {
  const status = useRealtimeStatus();
  const mode = useAppStore((s) => s.mode);

  if (mode !== "remote") return null;

  const label =
    status === "connected"
      ? "Live sync"
      : status === "connecting"
        ? "Connecting..."
        : status === "error"
          ? "Sync offline"
          : "Sync idle";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium",
        status === "connected" && "text-emerald-600",
        status === "connecting" && "text-amber-600",
        status === "error" && "text-red-500",
        status === "idle" && "text-muted-foreground"
      )}
      title={label}
    >
      <span className="relative flex h-2 w-2">
        {status === "connected" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            status === "connected" && "bg-emerald-500",
            status === "connecting" && "bg-amber-500",
            status === "error" && "bg-red-500",
            status === "idle" && "bg-muted-foreground/40"
          )}
        />
      </span>
      {!compact && (
        <>
          <Radio className="h-3 w-3" />
          {label}
        </>
      )}
    </div>
  );
}
