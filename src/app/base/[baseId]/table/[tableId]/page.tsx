"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { SpreadsheetGrid } from "@/components/grid/spreadsheet-grid";
import { ImportExportMenu } from "@/components/data/import-export-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function TablePage({
  params,
}: {
  params: Promise<{ baseId: string; tableId: string }>;
}) {
  const { baseId, tableId } = use(params);
  const base = useAppStore((s) => s.getBase(baseId));
  const table = useAppStore((s) => s.getTable(tableId));
  const allForms = useAppStore((s) => s.forms);
  const forms = useMemo(() => allForms.filter((f) => f.tableId === tableId), [allForms, tableId]);
  const createForm = useAppStore((s) => s.createForm);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFormName, setNewFormName] = useState("");

  if (!base || !table) notFound();

  const handleCreateForm = () => {
    if (!newFormName.trim()) return;
    const form = createForm(tableId, newFormName.trim());
    setNewFormName("");
    setShowCreateForm(false);
    window.location.href = `/base/${baseId}/table/${tableId}/form/${form.id}`;
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-2">
          <Link
            href={`/base/${baseId}`}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            {base.name}
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-sm font-semibold text-slate-900">{table.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <ImportExportMenu tableId={tableId} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-3.5 w-3.5" />
                Forms
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {forms.map((form) => (
                <DropdownMenuItem key={form.id} asChild>
                  <Link
                    href={`/base/${baseId}/table/${tableId}/form/${form.id}`}
                  >
                    {form.name}
                    {form.published && (
                      <span className="ml-auto text-xs text-emerald-600">
                        Live
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-4">
        <button className="flex items-center gap-1.5 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium text-blue-700">
          <LayoutGrid className="h-3.5 w-3.5" />
          Grid view
        </button>
        {forms.map((form) => (
          <Link
            key={form.id}
            href={`/base/${baseId}/table/${tableId}/form/${form.id}`}
            className="flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <FileText className="h-3.5 w-3.5" />
            {form.name}
          </Link>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid tableId={tableId} />
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={newFormName}
              onChange={(e) => setNewFormName(e.target.value)}
              placeholder="Form name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateForm()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateForm}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
