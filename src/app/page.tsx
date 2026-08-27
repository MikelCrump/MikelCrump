"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Database,
  Table2,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const BASE_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#be185d",
];

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageFallback() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-slate-200 bg-white px-8 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const workspace = useAppStore((s) => s.workspace);
  const bases = useAppStore((s) => s.bases);
  const tables = useAppStore((s) => s.tables);
  const records = useAppStore((s) => s.records);
  const forms = useAppStore((s) => s.forms);
  const createBase = useAppStore((s) => s.createBase);

  const [showCreate, setShowCreate] = useState(false);
  const [newBaseName, setNewBaseName] = useState("");
  const [selectedColor, setSelectedColor] = useState(BASE_COLORS[0]);

  useEffect(() => {
    if (searchParams.get("create") === "base") {
      setShowCreate(true);
    }
  }, [searchParams]);

  const handleCreateBase = () => {
    if (!newBaseName.trim()) return;
    const base = createBase(newBaseName.trim(), selectedColor);
    setNewBaseName("");
    setShowCreate(false);
    window.location.href = `/base/${base.id}`;
  };

  const stats = [
    { label: "Bases", value: bases.length, icon: Database },
    { label: "Tables", value: tables.length, icon: Table2 },
    { label: "Records", value: records.length, icon: FileText },
    { label: "Forms", value: forms.length, icon: FileText },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-8 py-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                {workspace.name}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, Mikel
              </h1>
              <p className="mt-2 max-w-xl text-slate-500">
                Manage your data, build embeddable forms, and collaborate with
                your team — all in one place.
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              New base
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {stat.label}
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your bases</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bases.map((base) => {
            const baseTables = tables.filter((t) => t.baseId === base.id);
            const baseRecords = records.filter((r) =>
              baseTables.some((t) => t.id === r.tableId)
            );
            const baseForms = forms.filter((f) => f.baseId === base.id);

            return (
              <Link
                key={base.id}
                href={`/base/${base.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{
                      backgroundColor: `${base.color}15`,
                      color: base.color,
                    }}
                  >
                    {base.icon || base.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">
                      {base.name}
                    </h3>
                    {base.description && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                        {base.description}
                      </p>
                    )}
                    <div className="mt-3 flex gap-3 text-xs text-slate-400">
                      <span>{baseTables.length} tables</span>
                      <span>{baseRecords.length} records</span>
                      <span>{baseForms.length} forms</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </div>
              </Link>
            );
          })}

          <button
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600"
          >
            <Plus className="mb-2 h-6 w-6" />
            <span className="text-sm font-medium">Create new base</span>
          </button>
        </div>

        <div className="mt-10 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-600 p-2.5 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Embed forms on your website
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Build forms like your Pastor Partnership page and embed them
                anywhere with a simple iframe snippet. Check out the demo form
                in Pastor Partnerships.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/base/base-pastors/table/tbl-pastors/form/form-pastors">
                  Open form builder
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new base</DialogTitle>
            <DialogDescription>
              A base is a collection of related tables — like a project or
              department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Base name
              </label>
              <Input
                value={newBaseName}
                onChange={(e) => setNewBaseName(e.target.value)}
                placeholder="e.g. Volunteer Sign-ups"
                className="mt-1.5"
                onKeyDown={(e) => e.key === "Enter" && handleCreateBase()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Color
              </label>
              <div className="mt-2 flex gap-2">
                {BASE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline:
                        selectedColor === color
                          ? `2px solid ${color}`
                          : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBase}>Create base</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
