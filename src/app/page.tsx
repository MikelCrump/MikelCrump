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
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="mx-auto max-w-5xl px-8 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
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
  const currentUser = useAppStore((s) =>
    s.team.find((m) => m.id === s.currentUserId)
  );

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

  const firstName =
    currentUser?.name?.split(" ")[0] ||
    currentUser?.email?.split("@")[0] ||
    "there";

  const stats = [
    { label: "Bases", value: bases.length, icon: Database },
    { label: "Tables", value: tables.length, icon: Table2 },
    { label: "Records", value: records.length, icon: FileText },
    { label: "Forms", value: forms.length, icon: FileText },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{workspace.name}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Bases, grids, and embeddable forms for the Reawaken team.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            New base
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-4 text-sm text-muted-foreground">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 opacity-70" />
                <span className="font-medium text-foreground">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            );
          })}
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your bases
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-[var(--accent-soft)]"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{
                    backgroundColor: `${base.color}22`,
                    color: base.color,
                  }}
                >
                  {base.icon || base.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary">
                      {base.name}
                    </h3>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-primary" />
                  </div>
                  {base.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {base.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {baseTables.length} tables · {baseRecords.length} records ·{" "}
                    {baseForms.length} forms
                  </p>
                </div>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex min-h-[7.5rem] flex-col items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-[var(--accent-soft)] hover:text-primary"
          >
            <Plus className="mb-2 h-5 w-5" />
            <span className="text-sm font-medium">Create new base</span>
          </button>
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
              <label className="text-sm font-medium text-foreground">
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
              <label className="text-sm font-medium text-foreground">
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
