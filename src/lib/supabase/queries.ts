import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceData } from "@/lib/supabase/mappers";
import {
  mapBase,
  mapForm,
  mapMember,
  mapRecord,
  mapTable,
  mapWorkspace,
} from "@/lib/supabase/mappers";
import { generateId } from "@/lib/utils";
import {
  DEMO_BASE,
  DEMO_FORM,
  DEMO_RECORDS,
  DEMO_TABLE,
  DEMO_TEAM,
  DEMO_WORKSPACE,
  EXTRA_BASE,
  EXTRA_RECORDS,
  EXTRA_TABLE,
} from "@/lib/seed-data";

export async function fetchWorkspaceData(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string
): Promise<WorkspaceData | null> {
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (!workspace) return null;

  const { data: members } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspaceId);

  const { data: bases } = await supabase
    .from("bases")
    .select("*")
    .eq("workspace_id", workspaceId);

  const baseIds = (bases ?? []).map((b) => b.id);

  const { data: tables } = baseIds.length
    ? await supabase.from("tf_tables").select("*").in("base_id", baseIds)
    : { data: [] };

  const tableIds = (tables ?? []).map((t) => t.id);

  const { data: records } = tableIds.length
    ? await supabase.from("tf_records").select("*").in("table_id", tableIds)
    : { data: [] };

  const { data: forms } = baseIds.length
    ? await supabase.from("tf_forms").select("*").in("base_id", baseIds)
    : { data: [] };

  const currentMember = members?.find((m) => m.user_id === userId);

  return {
    workspace: mapWorkspace(workspace),
    bases: (bases ?? []).map(mapBase),
    tables: (tables ?? []).map(mapTable),
    records: (records ?? []).map(mapRecord),
    forms: (forms ?? []).map(mapForm),
    team: (members ?? []).map(mapMember),
    currentUserId: currentMember?.id ?? members?.[0]?.id ?? "",
  };
}

export async function getUserWorkspaceId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .single();

  return data?.workspace_id ?? null;
}

export async function provisionWorkspace(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  name: string,
  seedDemo = true
): Promise<string> {
  const workspaceId = generateId();
  const memberId = generateId();

  await supabase.from("workspaces").insert({
    id: workspaceId,
    name: `${name.split(" ")[0]}'s Workspace`,
  });

  await supabase.from("workspace_members").insert({
    id: memberId,
    workspace_id: workspaceId,
    user_id: userId,
    email,
    name,
    role: "owner",
    avatar_color: "#2563eb",
    status: "active",
  });

  if (seedDemo) {
    await seedDemoData(supabase, workspaceId);
  }

  return workspaceId;
}

export async function seedDemoData(
  supabase: SupabaseClient,
  workspaceId: string
) {
  await supabase.from("bases").upsert([
    {
      id: DEMO_BASE.id,
      workspace_id: workspaceId,
      name: DEMO_BASE.name,
      description: DEMO_BASE.description ?? null,
      color: DEMO_BASE.color,
      icon: DEMO_BASE.icon ?? null,
      created_at: DEMO_BASE.createdAt,
    },
    {
      id: EXTRA_BASE.id,
      workspace_id: workspaceId,
      name: EXTRA_BASE.name,
      description: EXTRA_BASE.description ?? null,
      color: EXTRA_BASE.color,
      icon: EXTRA_BASE.icon ?? null,
      created_at: EXTRA_BASE.createdAt,
    },
  ]);

  await supabase.from("tf_tables").upsert([
    {
      id: DEMO_TABLE.id,
      base_id: DEMO_TABLE.baseId,
      name: DEMO_TABLE.name,
      description: DEMO_TABLE.description ?? null,
      fields: DEMO_TABLE.fields,
      views: DEMO_TABLE.views,
    },
    {
      id: EXTRA_TABLE.id,
      base_id: EXTRA_TABLE.baseId,
      name: EXTRA_TABLE.name,
      description: EXTRA_TABLE.description ?? null,
      fields: EXTRA_TABLE.fields,
      views: EXTRA_TABLE.views,
    },
  ]);

  await supabase.from("tf_records").upsert([
    ...DEMO_RECORDS.map((r) => ({
      id: r.id,
      table_id: r.tableId,
      values: r.values,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    })),
    ...EXTRA_RECORDS.map((r) => ({
      id: r.id,
      table_id: r.tableId,
      values: r.values,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    })),
  ]);

  await supabase.from("tf_forms").upsert({
    id: DEMO_FORM.id,
    table_id: DEMO_FORM.tableId,
    base_id: DEMO_FORM.baseId,
    name: DEMO_FORM.name,
    description: DEMO_FORM.description ?? null,
    submit_button_text: DEMO_FORM.submitButtonText ?? null,
    success_message: DEMO_FORM.successMessage ?? null,
    field_ids: DEMO_FORM.fieldIds,
    settings: DEMO_FORM.settings,
    published: DEMO_FORM.published,
  });

  const extraTeam = DEMO_TEAM.filter((m) => m.role !== "owner");
  if (extraTeam.length > 0) {
    await supabase.from("workspace_members").upsert(
      extraTeam.map((m) => ({
        id: m.id,
        workspace_id: workspaceId,
        user_id: null,
        email: m.email,
        name: m.name,
        role: m.role,
        avatar_color: m.avatarColor,
        status: m.status,
        invited_at: m.invitedAt,
      })),
      { onConflict: "id" }
    );
  }
}

export async function fetchPublishedForm(
  supabase: SupabaseClient,
  formId: string
) {
  const { data: form } = await supabase
    .from("tf_forms")
    .select("*")
    .eq("id", formId)
    .eq("published", true)
    .single();

  if (!form) return null;

  const { data: table } = await supabase
    .from("tf_tables")
    .select("*")
    .eq("id", form.table_id)
    .single();

  if (!table) return null;

  return {
    form: mapForm(form),
    table: mapTable(table),
  };
}
