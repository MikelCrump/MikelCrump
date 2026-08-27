"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Search,
} from "lucide-react";
import type { CellValue, Field, FieldType, TableRecord } from "@/lib/types";
import { FIELD_TYPE_LABELS } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LiveSyncIndicator } from "@/components/layout/live-sync-indicator";

interface SpreadsheetGridProps {
  tableId: string;
}

function CellDisplay({ field, value }: { field: Field; value: CellValue }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-300">—</span>;
  }

  switch (field.type) {
    case "checkbox":
      return (
        <Badge variant={value ? "success" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    case "multiSelect":
      return (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(value) ? value : [String(value)]).map((v) => (
            <Badge key={String(v)} variant="outline" className="text-xs">
              {String(v)}
            </Badge>
          ))}
        </div>
      );
    case "singleSelect":
      return <Badge variant="outline">{String(value)}</Badge>;
    case "email":
      return (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(value)}
        </a>
      );
    case "url":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(value)}
        </a>
      );
    case "longText":
      return (
        <span className="line-clamp-2" title={String(value)}>
          {String(value)}
        </span>
      );
    default:
      return <span>{String(value)}</span>;
  }
}

function EditableCell({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: CellValue;
  onChange: (val: CellValue) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300"
      />
    );
  }

  if (field.type === "singleSelect" && field.options) {
    return (
      <select
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="">Select...</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "longText") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[60px] rounded border border-blue-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    );
  }

  return (
    <input
      type={
        field.type === "number"
          ? "number"
          : field.type === "date"
            ? "date"
            : field.type === "email"
              ? "email"
              : "text"
      }
      value={String(value ?? "")}
      onChange={(e) =>
        onChange(
          field.type === "number"
            ? e.target.value
              ? Number(e.target.value)
              : null
            : e.target.value
        )
      }
      className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    />
  );
}

export function SpreadsheetGrid({ tableId }: SpreadsheetGridProps) {
  const table = useAppStore((s) => s.getTable(tableId));
  const allRecords = useAppStore((s) => s.records);
  const records = useMemo(() => allRecords.filter((r) => r.tableId === tableId), [allRecords, tableId]);
  const updateRecord = useAppStore((s) => s.updateRecord);
  const deleteRecord = useAppStore((s) => s.deleteRecord);
  const addRecord = useAppStore((s) => s.addRecord);
  const addField = useAppStore((s) => s.addField);

  const [search, setSearch] = useState("");
  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    fieldId: string;
  } | null>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");

  const filteredRecords = useMemo(() => {
    if (!search.trim() || !table) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      table.fields.some((f) =>
        String(r.values[f.id] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [records, search, table]);

  if (!table) return null;

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    addField(tableId, newFieldName.trim(), newFieldType);
    setNewFieldName("");
    setNewFieldType("text");
    setShowAddField(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8"
          />
        </div>
        <span className="text-sm text-slate-500">
          {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
        </span>
        <LiveSyncIndicator />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddField(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add field
        </Button>
        <Button size="sm" onClick={() => addRecord(tableId)}>
          <Plus className="h-3.5 w-3.5" />
          Add record
        </Button>
      </div>

      <div
        className="flex-1 overflow-auto"
        onClick={() => setEditingCell(null)}
      >
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className="border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-left w-12">
                <span className="text-xs text-slate-400">#</span>
              </th>
              {table.fields.map((field) => (
                <th
                  key={field.id}
                  className="border-b border-r border-slate-200 bg-slate-50 py-2 text-left min-w-[160px]"
                >
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {field.name}
                    </span>
                    {field.required && <span className="text-red-400">*</span>}
                  </div>
                </th>
              ))}
              <th className="border-b border-slate-200 bg-slate-50 w-10" />
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record: TableRecord, index: number) => (
              <tr
                key={record.id}
                className="group border-b border-slate-100 hover:bg-blue-50/30"
              >
                <td className="border-r border-slate-100 px-2 py-1.5">
                  <span className="text-xs text-slate-400">{index + 1}</span>
                </td>
                {table.fields.map((field) => {
                  const isEditing =
                    editingCell?.recordId === record.id &&
                    editingCell?.fieldId === field.id;
                  const value = record.values[field.id] ?? null;

                  return (
                    <td
                      key={field.id}
                      className={cn(
                        "border-r border-slate-100 align-top",
                        isEditing &&
                          "bg-blue-50/50 ring-1 ring-inset ring-blue-200"
                      )}
                    >
                      <div
                        className="min-h-[36px] px-2 py-1.5 cursor-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCell({
                            recordId: record.id,
                            fieldId: field.id,
                          });
                        }}
                      >
                        {isEditing ? (
                          <EditableCell
                            field={field}
                            value={value}
                            onChange={(val) => {
                              updateRecord(record.id, { [field.id]: val });
                            }}
                          />
                        ) : (
                          <CellDisplay field={field} value={value} />
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="align-top py-1.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteRecord(record.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete row
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm">No records yet</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => addRecord(tableId)}
            >
              Add your first record
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showAddField} onOpenChange={setShowAddField}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add field</DialogTitle>
            <DialogDescription>
              Add a new column to this table.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Field name</Label>
              <Input
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Status, Priority, Notes"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Field type</Label>
              <Select
                value={newFieldType}
                onValueChange={(v) => setNewFieldType(v as FieldType)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIELD_TYPE_LABELS).map(([type, label]) => (
                    <SelectItem key={type} value={type}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddField(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddField}>Add field</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
