"use client";

import { Database, Cloud, Shield, Palette } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const workspace = useAppStore((s) => s.workspace);

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">
          Configure your workspace. Backend integration coming soon.
        </p>
      </header>

      <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Workspace</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Workspace name</Label>
              <Input value={workspace.name} readOnly className="mt-1.5" />
            </div>
            <p className="text-xs text-slate-400">
              Workspace settings will sync once Supabase is connected.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Cloud className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Backend</h2>
            <Badge variant="warning">Coming soon</Badge>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Phase 2 will wire in{" "}
              <strong className="text-slate-800">Supabase</strong> for
              real-time database, auth, and row-level security, deployed on{" "}
              <strong className="text-slate-800">Vercel</strong>.
            </p>
            <ul className="list-inside list-disc space-y-1 text-slate-500">
              <li>PostgreSQL database with real-time sync</li>
              <li>Team authentication and permissions</li>
              <li>Public form submissions API</li>
              <li>Webhook notifications on new records</li>
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Data storage</h2>
          </div>
          <p className="text-sm text-slate-600">
            Your data is currently stored in browser localStorage for UI
            prototyping. Export your data as CSV anytime from any table view.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">About TableFlow</h2>
          </div>
          <p className="text-sm text-slate-600">
            TableFlow v0.1 — An open, affordable alternative to Airtable.
            Built for teams who need spreadsheet databases and embeddable forms
            without the enterprise price tag.
          </p>
        </section>
      </div>
    </div>
  );
}
