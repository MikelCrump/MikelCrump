"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CloudOff,
  Database,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SupabaseStatus {
  connected: boolean;
  source: string;
  message: string;
  contactCount?: number;
  authMode?: string;
  commandCenterUrl?: string;
  bySource?: { tag: string; count: number }[];
}

export function SupabaseStatusBanner({ className }: { className?: string }) {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/supabase/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({
        connected: false,
        source: "error",
        message: "Could not reach Command Center status endpoint",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground",
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking Command Center CRM…
      </div>
    );
  }

  if (!status) return null;

  if (status.connected) {
    const topSources = (status.bySource ?? [])
      .filter((s) => s.count > 0)
      .slice(0, 4)
      .map((s) => `${s.tag} ${s.count}`)
      .join(" · ");

    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-emerald-900">
                Connected to Command Center CRM
              </p>
              <Badge variant="success">Live</Badge>
            </div>
            <p className="text-xs text-emerald-700">
              {(status.contactCount ?? 0).toLocaleString()} contacts
              {topSources ? ` · ${topSources}` : ""}
              {status.authMode ? ` · ${status.authMode}` : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    );
  }

  const needsKey = status.source === "needs_service_role";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {status.source === "error" ? (
          <AlertCircle className="h-5 w-5 text-amber-600" />
        ) : needsKey ? (
          <Database className="h-5 w-5 text-amber-600" />
        ) : (
          <CloudOff className="h-5 w-5 text-amber-600" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-amber-900">
              {needsKey
                ? "Command Center found — service role needed"
                : "Command Center CRM"}
            </p>
            <Badge variant="warning">
              {needsKey ? "Almost connected" : "Not connected"}
            </Badge>
          </div>
          <p className="text-xs text-amber-800 max-w-xl">{status.message}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={load} className="gap-1">
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    </div>
  );
}
