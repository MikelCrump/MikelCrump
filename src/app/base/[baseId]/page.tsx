"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Table2, FileText, ChevronRight } from "lucide-react";
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

export default function BasePage({
  params,
}: {
  params: Promise<{ baseId: string }>;
}) {
  const { baseId } = use(params);
  const base = useAppStore((s) => s.getBase(baseId));
  const allTables = useAppStore((s) => s.tables);
  const tables = useMemo(
    () => allTables.filter((t) => t.baseId === baseId),
    [allTables, baseId]
  );
  const records = useAppStore((s) => s.records);
  const forms = useAppStore((s) => s.forms);
  const createTable = useAppStore((s) => s.createTable);

  const [showCreate, setShowCreate] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  if (!base) notFound();

  const handleCreateTable = () => {
    if (!newTableName.trim()) return;
    const table = createTable(baseId, newTableName.trim());
    setNewTableName("");
    setShowCreate(false);
    window.location.href = `/base/${baseId}/table/${table.id}`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground">
      <header
        className="border-b border-border px-8 py-6"
        style={{ borderTopColor: base.color, borderTopWidth: 3 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
              style={{
                backgroundColor: `${base.color}22`,
                color: base.color,
              }}
            >
              {base.icon || base.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{base.name}</h1>
              {base.description && (
                <p className="mt-0.5 text-muted-foreground">
                  {base.description}
                </p>
              )}
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            New table
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-8 py-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tables
        </h2>
        <div className="space-y-2">
          {tables.map((table) => {
            const tableRecords = records.filter((r) => r.tableId === table.id);
            const tableForms = forms.filter((f) => f.tableId === table.id);

            return (
              <Link
                key={table.id}
                href={`/base/${baseId}/table/${table.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40 hover:bg-[var(--accent-soft)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-primary">
                  <Table2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{table.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {table.fields.length} fields · {tableRecords.length} records
                    {tableForms.length > 0 &&
                      ` · ${tableForms.length} form${tableForms.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </Link>
            );
          })}

          {tables.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <Table2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No tables yet</p>
              <Button
                variant="link"
                className="mt-1"
                onClick={() => setShowCreate(true)}
              >
                Create your first table
              </Button>
            </div>
          )}
        </div>

        {forms.filter((f) => f.baseId === baseId).length > 0 && (
          <>
            <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Forms
            </h2>
            <div className="space-y-2">
              {forms
                .filter((f) => f.baseId === baseId)
                .map((form) => (
                  <Link
                    key={form.id}
                    href={`/base/${baseId}/table/${form.tableId}/form/${form.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40 hover:bg-[var(--accent-soft)]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{form.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {form.published ? "Published" : "Draft"} · Embed ready
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create table</DialogTitle>
            <DialogDescription>
              Tables hold your structured data with customizable fields.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Table name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateTable()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTable}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
