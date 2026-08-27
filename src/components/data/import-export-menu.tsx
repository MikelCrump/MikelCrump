"use client";

import { useRef, useState, useMemo } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { parseCsv, recordsToCsv, downloadCsv } from "@/lib/csv";
import type { CellValue, Field } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ImportExportMenuProps {
  tableId: string;
}

export function ImportExportMenu({ tableId }: ImportExportMenuProps) {
  const table = useAppStore((s) => s.getTable(tableId));
  const allRecords = useAppStore((s) => s.records);
  const records = useMemo(() => allRecords.filter((r) => r.tableId === tableId), [allRecords, tableId]);
  const importRecords = useAppStore((s) => s.importRecords);

  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<Record<string, CellValue>[]>([]);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!table) return null;

  const handleExport = () => {
    const csv = recordsToCsv(table.fields, records);
    downloadCsv(`${table.name.replace(/\s+/g, "_")}.csv`, csv);
  };

  const mapRowToValues = (
    headers: string[],
    row: string[],
    fields: Field[]
  ): Record<string, CellValue> => {
    const values: Record<string, CellValue> = {};
    headers.forEach((header, i) => {
      const field = fields.find(
        (f) => f.name.toLowerCase() === header.toLowerCase().trim()
      );
      if (!field) return;
      const raw = row[i]?.trim() ?? "";
      if (!raw) return;

      if (field.type === "multiSelect") {
        values[field.id] = raw.split(";").map((s) => s.trim()).filter(Boolean);
      } else if (field.type === "checkbox") {
        values[field.id] = ["true", "yes", "1"].includes(raw.toLowerCase());
      } else if (field.type === "number") {
        values[field.id] = Number(raw);
      } else {
        values[field.id] = raw;
      }
    });
    return values;
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const rows = parseCsv(content);
        if (rows.length < 2) {
          setImportError("CSV must have a header row and at least one data row.");
          return;
        }
        const [headers, ...dataRows] = rows;
        const mapped = dataRows.map((row) =>
          mapRowToValues(headers, row, table.fields)
        );
        setImportPreview(mapped);
        setImportError("");
      } catch {
        setImportError("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    importRecords(tableId, importPreview);
    setShowImport(false);
    setImportPreview([]);
    setImportError("");
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
        <Upload className="h-3.5 w-3.5" />
        Import CSV
      </Button>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file. Column headers should match your field names.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted py-10 transition-colors hover:border-primary/50 hover:bg-[var(--accent-soft)]"
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Click to upload CSV
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Headers: {table.fields.map((f) => f.name).join(", ")}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>

            {importError && (
              <p className="text-sm text-red-500">{importError}</p>
            )}

            {importPreview.length > 0 && (
              <div className="rounded-lg border border-border bg-muted p-3">
                <p className="text-sm font-medium text-foreground">
                  Ready to import {importPreview.length} row
                  {importPreview.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImportPreview([]);
                      setShowImport(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={confirmImport}>
                    Import
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
