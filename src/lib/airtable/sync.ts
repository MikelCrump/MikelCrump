import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AIRTABLE_SOURCES,
  getSource,
  type AirtableSource,
  type AirtableSourceKey,
} from "./catalog";
import { canFetchDirect, fetchAirtableRaw, fetchViaEdge } from "./fetch";
import { mapAirtableFields, mapEdgeRecord, toTableRecord } from "./map";
import type { TableRecord } from "@/lib/types";

export interface SyncSourceResult {
  key: AirtableSourceKey;
  label: string;
  mode: "direct" | "edge";
  upserted: number;
  error?: string;
}

export interface SyncResult {
  workspaceId: string;
  sources: SyncSourceResult[];
  totalUpserted: number;
}

async function ensureSchema(
  supabase: SupabaseClient,
  workspaceId: string,
  source: AirtableSource
) {
  const createdAt = new Date().toISOString();
  await supabase.from("bases").upsert({
    id: source.base.id,
    workspace_id: workspaceId,
    name: source.base.name,
    description: source.base.description ?? null,
    color: source.base.color,
    icon: source.base.icon ?? null,
    created_at: source.base.createdAt ?? createdAt,
  });

  await supabase.from("tf_tables").upsert({
    id: source.table.id,
    base_id: source.baseId,
    name: source.table.name,
    description: source.table.description ?? null,
    fields: source.table.fields,
    views: source.table.views,
    updated_at: createdAt,
  });
}

async function upsertBatch(supabase: SupabaseClient, records: TableRecord[]) {
  if (!records.length) return 0;
  const chunkSize = 100;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabase.from("tf_records").upsert(
      chunk.map((r) => ({
        id: r.id,
        table_id: r.tableId,
        values: r.values,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      }))
    );
    if (error) throw new Error(error.message);
  }
  return records.length;
}

/** Remove seeded demo pastor rows once real Airtable pastors are imported. */
async function clearDemoPastorsIfNeeded(
  supabase: SupabaseClient,
  source: AirtableSource,
  importedIds: string[]
) {
  if (source.key !== "pastors" || !importedIds.length) return;
  const demoIds = ["rec-1", "rec-2", "rec-3", "rec-4"];
  await supabase.from("tf_records").delete().in("id", demoIds);
}

async function syncOne(
  supabase: SupabaseClient,
  workspaceId: string,
  source: AirtableSource,
  accessToken: string | null
): Promise<SyncSourceResult> {
  const base: SyncSourceResult = {
    key: source.key,
    label: source.label,
    mode: "edge",
    upserted: 0,
  };

  try {
    await ensureSchema(supabase, workspaceId, source);

    let records: TableRecord[] = [];

    if (canFetchDirect(source)) {
      base.mode = "direct";
      const raw = await fetchAirtableRaw(source);
      records = raw.map((rec) =>
        toTableRecord(
          source.tableId,
          rec.id,
          mapAirtableFields(source, rec.fields || {}),
          rec.createdTime
        )
      );
    } else if (accessToken) {
      base.mode = "edge";
      const rows = await fetchViaEdge(source, accessToken);
      records = rows
        .filter((row) => typeof row.id === "string" && row.id)
        .map((row) =>
          toTableRecord(
            source.tableId,
            String(row.id),
            mapEdgeRecord(source, row),
            typeof row.created_at === "string"
              ? row.created_at
              : typeof row.submitted_at === "string"
                ? row.submitted_at
                : undefined
          )
        );
    } else {
      throw new Error(
        "No AIRTABLE_TOKEN and no user session — cannot fetch this source"
      );
    }

    base.upserted = await upsertBatch(supabase, records);
    await clearDemoPastorsIfNeeded(
      supabase,
      source,
      records.map((r) => r.id)
    );
    return base;
  } catch (e) {
    base.error = e instanceof Error ? e.message : String(e);
    return base;
  }
}

export async function syncAirtableSources(
  supabase: SupabaseClient,
  workspaceId: string,
  options: {
    accessToken?: string | null;
    keys?: AirtableSourceKey[];
  } = {}
): Promise<SyncResult> {
  const sources = options.keys?.length
    ? (options.keys.map(getSource).filter(Boolean) as AirtableSource[])
    : AIRTABLE_SOURCES;

  const results: SyncSourceResult[] = [];
  for (const source of sources) {
    results.push(
      await syncOne(supabase, workspaceId, source, options.accessToken ?? null)
    );
  }

  return {
    workspaceId,
    sources: results,
    totalUpserted: results.reduce((n, r) => n + r.upserted, 0),
  };
}
