import type { CellValue, TableRecord } from "@/lib/types";
import type { AirtableSource, FieldMap } from "./catalog";

function asSelectName(raw: unknown): unknown {
  if (Array.isArray(raw)) {
    return raw.map((v) =>
      v && typeof v === "object" && "name" in v
        ? String((v as { name: string }).name)
        : v
    );
  }
  if (raw && typeof raw === "object" && "name" in raw) {
    return (raw as { name: string }).name;
  }
  return raw;
}

function toDateString(raw: unknown): string {
  if (raw == null || raw === "") return "";
  const s = String(raw);
  // Airtable dates are often YYYY-MM-DD; timestamps → date portion
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toISOString().slice(0, 10);
}

function toCell(raw: unknown): CellValue {
  if (raw == null) return null;
  if (typeof raw === "boolean" || typeof raw === "number") return raw;
  if (Array.isArray(raw)) return raw.map(String);
  return String(raw);
}

/** Map a raw Airtable API record (`fields` blob) into Tables cell values. */
export function mapAirtableFields(
  source: AirtableSource,
  fields: Record<string, unknown>
): Record<string, CellValue> {
  const values: Record<string, CellValue> = {};
  for (const map of source.maps) {
    applyMap(values, map, "airtable", fields);
  }
  return values;
}

/** Map an edge-function shaped record into Tables cell values. */
export function mapEdgeRecord(
  source: AirtableSource,
  row: Record<string, unknown>
): Record<string, CellValue> {
  const values: Record<string, CellValue> = {};
  for (const map of source.maps) {
    applyMap(values, map, "edge", row);
  }
  return values;
}

function applyMap(
  values: Record<string, CellValue>,
  map: FieldMap,
  mode: "airtable" | "edge",
  data: Record<string, unknown>
) {
  if (mode === "airtable") {
    if (map.kind === "airtable") {
      const raw = asSelectName(data[map.airtable]);
      if (raw !== undefined && raw !== null && raw !== "") {
        values[map.fieldId] = toCell(raw);
      }
    } else if (map.kind === "list") {
      const raw = asSelectName(data[map.airtable]);
      values[map.fieldId] = Array.isArray(raw)
        ? raw.map(String)
        : raw
          ? [String(raw)]
          : [];
    } else if (map.kind === "bool") {
      values[map.fieldId] = Boolean(data[map.airtable]);
    } else if (map.kind === "date") {
      const raw = data[map.airtable];
      if (raw) values[map.fieldId] = toDateString(raw);
    } else if (map.kind === "join") {
      const parts = map.airtable
        .map((k) => data[k])
        .filter((v) => v != null && v !== "")
        .map(String);
      if (parts.length) values[map.fieldId] = parts.join(map.sep ?? " ");
    }
    return;
  }

  // edge mode
  if (map.kind === "edge") {
    const raw = data[map.edge];
    if (raw !== undefined && raw !== null && raw !== "") {
      values[map.fieldId] = toCell(asSelectName(raw));
    }
  } else if (map.kind === "splitName") {
    const name = String(data[map.edge] ?? "").trim();
    if (!name) return;
    const [first, ...rest] = name.split(/\s+/);
    values[map.firstFieldId] = first;
    values[map.lastFieldId] = rest.join(" ");
  } else if (map.kind === "edgeDate") {
    const raw = data[map.edge];
    if (raw) values[map.fieldId] = toDateString(raw);
  }
}

export function toTableRecord(
  tableId: string,
  airtableId: string,
  values: Record<string, CellValue>,
  createdAt?: string
): TableRecord {
  const now = new Date().toISOString();
  const created = createdAt || now;
  return {
    id: airtableId,
    tableId,
    values,
    createdAt: created,
    updatedAt: now,
  };
}
