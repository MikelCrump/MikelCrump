import type { AirtableSource } from "./catalog";

export type FetchMode = "direct" | "edge";

function resolveToken(source: AirtableSource): string | null {
  if (source.tokenEnv) {
    const dedicated = process.env[source.tokenEnv];
    if (dedicated) return dedicated;
  }
  return process.env.AIRTABLE_TOKEN || null;
}

export function canFetchDirect(source: AirtableSource): boolean {
  return Boolean(resolveToken(source));
}

export function canFetchAnyDirect(): boolean {
  return Boolean(process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_PASTORS_TOKEN || process.env.AIRTABLE_VOLUNTEERS_TOKEN);
}

/** Paginate Airtable REST API for one table. */
export async function fetchAirtableRaw(
  source: AirtableSource
): Promise<{ id: string; createdTime?: string; fields: Record<string, unknown> }[]> {
  const token = resolveToken(source);
  if (!token) {
    throw new Error(`No Airtable token for source ${source.key}`);
  }

  const records: { id: string; createdTime?: string; fields: Record<string, unknown> }[] = [];
  let offset: string | undefined;

  do {
    const u = new URL(
      `https://api.airtable.com/v0/${source.airtableBaseId}/${source.airtableTableId}`
    );
    u.searchParams.set("pageSize", "100");
    if (offset) u.searchParams.set("offset", offset);

    const res = await fetch(u, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Airtable ${source.key} HTTP ${res.status}: ${detail.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      records: { id: string; createdTime?: string; fields: Record<string, unknown> }[];
      offset?: string;
    };
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return records;
}

/** Call Command Center edge function with the caller's JWT. */
export async function fetchViaEdge(
  source: AirtableSource,
  accessToken: string
): Promise<Record<string, unknown>[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!baseUrl || !anon) {
    throw new Error("Supabase URL/anon key not configured");
  }

  const u = new URL(`${baseUrl}/functions/v1/${source.edgePath}`);
  if (source.edgeQuery) {
    for (const [k, v] of Object.entries(source.edgeQuery)) {
      u.searchParams.set(k, v);
    }
  }

  const res = await fetch(u, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anon,
      "Content-Type": "application/json",
    },
  });

  const data = (await res.json().catch(() => ({}))) as {
    records?: Record<string, unknown>[];
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    throw new Error(
      data.message || data.error || `Edge ${source.edgePath} failed (${res.status})`
    );
  }

  return data.records || [];
}
