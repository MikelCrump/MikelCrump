import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import {
  fetchWorkspaceData,
  getUserWorkspaceId,
  provisionWorkspace,
} from "@/lib/supabase/queries";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "local" });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let workspaceId = await getUserWorkspaceId(supabase, user.id);

  if (!workspaceId) {
    workspaceId = await provisionWorkspace(
      supabase,
      user.id,
      user.email ?? "",
      user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
      true
    );
  }

  const data = await fetchWorkspaceData(supabase, workspaceId, user.id);

  if (!data) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json({ mode: "remote", ...data });
}
