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
  const tables = useMemo(() => allTables.filter((t) => t.baseId === baseId), [allTables, baseId]);
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
    <div className="flex-1 overflow-y-auto">
      <header
        className="border-b border-slate-200 bg-white px-8 py-6"
        style={{ borderTopColor: base.color, borderTopWidth: 3 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: `${base.color}15`, color: base.color }}
            >
              {base.icon || base.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{base.name}</h1>
              {base.description && (
                <p className="mt-0.5 text-slate-500">{base.description}</p>
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
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
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
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <Table2 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{table.name}</p>
                  <p className="text-sm text-slate-400">
                    {table.fields.length} fields · {tableRecords.length} records
                    {tableForms.length > 0 &&
                      ` · ${tableForms.length} form${tableForms.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
              </Link>
            );
          })}

          {tables.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <Table2 className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No tables yet</p>
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
            <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Forms
            </h2>
            <div className="space-y-2">
              {forms
                .filter((f) => f.baseId === baseId)
                .map((form) => (
                  <Link
                    key={form.id}
                    href={`/base/${baseId}/table/${form.tableId}/form/${form.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-all hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{form.name}</p>
                      <p className="text-sm text-slate-400">
                        {form.published ? "Published" : "Draft"} · Embed ready
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
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
