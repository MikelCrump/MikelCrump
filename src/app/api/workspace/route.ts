import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/config";
import {
  ensureSharedWorkspaceAccess,
  fetchWorkspaceData,
  getUserWorkspaceId,
} from "@/lib/supabase/queries";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "local" });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let workspaceId = await getUserWorkspaceId(supabase, user.id);

  if (!workspaceId) {
    const admin = tryCreateAdminClient() ?? supabase;
    workspaceId = await ensureSharedWorkspaceAccess(
      admin,
      user.id,
      user.email ?? "",
      user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User"
    );
  }

  const data = await fetchWorkspaceData(supabase, workspaceId, user.id);

  if (!data) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json({ mode: "remote", ...data });
}
