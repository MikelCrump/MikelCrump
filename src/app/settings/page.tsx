"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  Database,
  HardDrive,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Table2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/config";
import { loadRemoteWorkspace } from "@/lib/sync";
import { apiPath } from "@/lib/api-path";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SyncSourceResult = {
  key: string;
  label: string;
  mode: string;
  upserted: number;
  error?: string;
};

export default function SettingsPage() {
  const workspace = useAppStore((s) => s.workspace);
  const mode = useAppStore((s) => s.mode);
  const hydrate = useAppStore((s) => s.hydrate);
  const supabaseConfigured = isSupabaseConfigured();

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    ok: boolean;
    totalUpserted: number;
    sources: SyncSourceResult[];
  } | null>(null);
  const [syncError, setSyncError] = useState("");
  const [directConfigured, setDirectConfigured] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (!supabaseConfigured) return;
    fetch(apiPath("/api/airtable/sync"))
      .then((r) => r.json())
      .then((d) => setDirectConfigured(Boolean(d.directTokenConfigured)))
      .catch(() => setDirectConfigured(false));
  }, [supabaseConfigured]);

  const handleAirtableSync = async () => {
    setSyncing(true);
    setSyncError("");
    setSyncResult(null);
    try {
      const res = await fetch(apiPath("/api/airtable/sync"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok && !data.sources) {
        setSyncError(data.error || `Sync failed (${res.status})`);
        return;
      }
      setSyncResult({
        ok: Boolean(data.ok),
        totalUpserted: data.totalUpserted ?? 0,
        sources: data.sources ?? [],
      });
      const refreshed = await loadRemoteWorkspace();
      if (refreshed && refreshed.mode === "remote") {
        hydrate(refreshed);
      }
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : String(e));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground">
      <header className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Workspace configuration and Airtable import.
        </p>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-8 py-8">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Data mode</h2>
            </div>
            {mode === "remote" ? (
              <Badge variant="success">
                <Cloud className="mr-1 h-3 w-3" />
                Cloud sync active
              </Badge>
            ) : mode === "local" ? (
              <Badge variant="secondary">
                <HardDrive className="mr-1 h-3 w-3" />
                Local storage
              </Badge>
            ) : (
              <Badge variant="outline">Loading...</Badge>
            )}
          </div>

          {supabaseConfigured ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p>
                  Supabase is configured. Authenticated changes sync to
                  PostgreSQL in real time.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p>
                  Access matches Command Center — sign in with your
                  @reawakenusa.org Google account.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Running in local mode — data is stored in your browser. To
                enable cloud sync, add Supabase credentials.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Supabase Dashboard
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Table2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Airtable import</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Pull pastors, events, volunteers, speaker requests, contact form,
            and chapter applications from the same Airtable bases Command Center
            uses. Re-running merges by Airtable record id (safe to repeat).
          </p>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleAirtableSync}
              disabled={syncing || !supabaseConfigured || mode !== "remote"}
            >
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync from Airtable
                </>
              )}
            </Button>
            {directConfigured === true && (
              <Badge variant="success">Direct token configured</Badge>
            )}
            {directConfigured === false && (
              <Badge variant="secondary">Via Command Center edge functions</Badge>
            )}
          </div>
          {syncError && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
              {syncError}
            </p>
          )}
          {syncResult && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium">
                {syncResult.ok ? "Sync complete" : "Sync finished with errors"}{" "}
                — {syncResult.totalUpserted} rows upserted
              </p>
              <ul className="space-y-1 text-muted-foreground">
                {syncResult.sources.map((s) => (
                  <li key={s.key}>
                    {s.label}:{" "}
                    {s.error ? (
                      <span className="text-red-600 dark:text-red-300">
                        {s.error}
                      </span>
                    ) : (
                      <span>
                        {s.upserted} via {s.mode}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Cloud className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Workspace</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Workspace name</Label>
              <Input value={workspace.name} readOnly className="mt-1.5" />
            </div>
            <p className="text-xs text-muted-foreground">
              Staff access is managed in{" "}
              <a
                href="https://reawakencommandcenter.com"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                Command Center
              </a>
              , not a separate Tables team list.
            </p>
          </div>
        </section>

        {!supabaseConfigured && (
          <div className="text-center">
            <Button asChild>
              <Link href="/login">Set up cloud sync</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
