import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/config";
import {
  ensureSharedWorkspaceAccess,
  getUserWorkspaceId,
  SHARED_WORKSPACE_ID,
} from "@/lib/supabase/queries";
import { AIRTABLE_SOURCES, type AirtableSourceKey } from "@/lib/airtable/catalog";
import { canFetchAnyDirect } from "@/lib/airtable/fetch";
import { syncAirtableSources } from "@/lib/airtable/sync";

export async function GET() {
  return NextResponse.json({
    sources: AIRTABLE_SOURCES.map((s) => ({
      key: s.key,
      label: s.label,
      baseId: s.baseId,
      tableId: s.tableId,
    })),
    directTokenConfigured: canFetchAnyDirect(),
  });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = (user.email || "").toLowerCase();
  if (!email.endsWith("@reawakenusa.org")) {
    return NextResponse.json(
      { error: "Airtable sync is limited to Reawaken USA staff" },
      { status: 403 }
    );
  }

  let body: { sources?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const keys = (body.sources || []).filter((k): k is AirtableSourceKey =>
    AIRTABLE_SOURCES.some((s) => s.key === k)
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const admin = tryCreateAdminClient() ?? supabase;
  let workspaceId = await getUserWorkspaceId(supabase, user.id);
  if (!workspaceId) {
    workspaceId = await ensureSharedWorkspaceAccess(
      admin,
      user.id,
      user.email ?? "",
      user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User"
    );
  }

  // Always merge into the shared org workspace
  workspaceId = SHARED_WORKSPACE_ID;

  const result = await syncAirtableSources(admin, workspaceId, {
    accessToken: session?.access_token ?? null,
    keys: keys.length ? keys : undefined,
  });

  const failed = result.sources.filter((s) => s.error);
  return NextResponse.json(
    {
      ok: failed.length === 0,
      ...result,
    },
    { status: failed.length === result.sources.length ? 502 : 200 }
  );
}
