"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrevoStatus {
  connected: boolean;
  source: string;
  message: string;
  account?: {
    email?: string;
    companyName?: string;
    plan?: string | null;
    credits?: number | null;
  } | null;
}

export function BrevoStatusBanner({ className }: { className?: string }) {
  const [status, setStatus] = useState<BrevoStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brevo/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({
        connected: false,
        source: "error",
        message: "Could not reach Brevo status endpoint",
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
        Checking Brevo connection…
      </div>
    );
  }

  if (!status) return null;

  if (status.connected) {
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
                Connected to Brevo
              </p>
              <Badge variant="success">Live</Badge>
            </div>
            <p className="text-xs text-emerald-700">
              {status.account?.companyName || status.account?.email}
              {status.account?.plan ? ` · ${status.account.plan}` : ""}
              {typeof status.account?.credits === "number"
                ? ` · ${status.account.credits.toLocaleString()} credits`
                : ""}
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
        ) : (
          <CloudOff className="h-5 w-5 text-amber-600" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-amber-900">Demo mode</p>
            <Badge variant="warning">Not connected</Badge>
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
