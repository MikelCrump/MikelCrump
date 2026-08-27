"use client";

import { Cloud, Database, HardDrive, CheckCircle2, ExternalLink } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsPage() {
  const workspace = useAppStore((s) => s.workspace);
  const mode = useAppStore((s) => s.mode);
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">
          Workspace configuration and backend connection.
        </p>
      </header>

      <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Data mode</h2>
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
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p>Supabase is configured. Authenticated changes sync to PostgreSQL in real time.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p>Instant sync via Supabase Realtime — grid updates live when forms are submitted or cells edited.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p>Public forms submit via secure API routes (rate limited, 5/min per IP).</p>
              </div>
              {mode === "local" && (
                <p className="rounded-lg bg-amber-50 p-3 text-amber-800">
                  You&apos;re viewing cached local data. Sign in to sync with the cloud.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-sm text-slate-600">
              <p>
                Running in local mode — data is stored in your browser. To enable cloud
                sync, create a Supabase project and add your credentials.
              </p>
              <ol className="list-inside list-decimal space-y-2 text-slate-500">
                <li>Create a project at supabase.com</li>
                <li>Run <code className="rounded bg-slate-100 px-1">supabase/migrations/001_initial_schema.sql</code> in the SQL editor</li>
                <li>Copy <code className="rounded bg-slate-100 px-1">.env.example</code> to <code className="rounded bg-slate-100 px-1">.env.local</code></li>
                <li>Deploy to Vercel with the same env vars</li>
              </ol>
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

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Cloud className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Workspace</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Workspace name</Label>
              <Input value={workspace.name} readOnly className="mt-1.5" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Environment variables</h2>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=`}
          </pre>
          <p className="mt-3 text-xs text-slate-400">
            Set these in Vercel Project Settings → Environment Variables.
          </p>
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
