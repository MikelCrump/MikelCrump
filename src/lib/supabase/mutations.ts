import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Base,
  CellValue,
  Field,
  Form,
  MemberRole,
  Table,
  TableRecord,
} from "@/lib/types";

export async function upsertBase(supabase: SupabaseClient, base: Base, workspaceId: string) {
  return supabase.from("bases").upsert({
    id: base.id,
    workspace_id: workspaceId,
    name: base.name,
    description: base.description ?? null,
    color: base.color,
    icon: base.icon ?? null,
    created_at: base.createdAt,
  });
}

export async function deleteBaseRemote(supabase: SupabaseClient, id: string) {
  return supabase.from("bases").delete().eq("id", id);
}

export async function upsertTable(supabase: SupabaseClient, table: Table) {
  return supabase.from("tf_tables").upsert({
    id: table.id,
    base_id: table.baseId,
    name: table.name,
    description: table.description ?? null,
    fields: table.fields,
    views: table.views,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteTableRemote(supabase: SupabaseClient, id: string) {
  return supabase.from("tf_tables").delete().eq("id", id);
}

export async function upsertRecord(supabase: SupabaseClient, record: TableRecord) {
  return supabase.from("tf_records").upsert({
    id: record.id,
    table_id: record.tableId,
    values: record.values,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  });
}

export async function deleteRecordRemote(supabase: SupabaseClient, id: string) {
  return supabase.from("tf_records").delete().eq("id", id);
}

export async function upsertRecords(
  supabase: SupabaseClient,
  records: TableRecord[]
) {
  return supabase.from("tf_records").upsert(
    records.map((r) => ({
      id: r.id,
      table_id: r.tableId,
      values: r.values,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    }))
  );
}

export async function upsertForm(supabase: SupabaseClient, form: Form) {
  return supabase.from("tf_forms").upsert({
    id: form.id,
    table_id: form.tableId,
    base_id: form.baseId,
    name: form.name,
    description: form.description ?? null,
    submit_button_text: form.submitButtonText ?? null,
    success_message: form.successMessage ?? null,
    field_ids: form.fieldIds,
    settings: form.settings,
    published: form.published,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteFormRemote(supabase: SupabaseClient, id: string) {
  return supabase.from("tf_forms").delete().eq("id", id);
}

export async function upsertMember(
  supabase: SupabaseClient,
  member: {
    id: string;
    workspaceId: string;
    email: string;
    name: string;
    role: MemberRole;
    avatarColor: string;
    status: "active" | "pending";
    invitedAt: string;
  }
) {
  return supabase.from("workspace_members").upsert({
    id: member.id,
    workspace_id: member.workspaceId,
    user_id: null,
    email: member.email,
    name: member.name,
    role: member.role,
    avatar_color: member.avatarColor,
    status: member.status,
    invited_at: member.invitedAt,
  });
}

export async function updateMemberRoleRemote(
  supabase: SupabaseClient,
  id: string,
  role: MemberRole
) {
  return supabase.from("workspace_members").update({ role }).eq("id", id);
}

export async function deleteMemberRemote(supabase: SupabaseClient, id: string) {
  return supabase.from("workspace_members").delete().eq("id", id);
}

export async function updateTableFields(
  supabase: SupabaseClient,
  tableId: string,
  fields: Field[]
) {
  return supabase
    .from("tf_tables")
    .update({ fields, updated_at: new Date().toISOString() })
    .eq("id", tableId);
}

export async function submitFormRecord(
  supabase: SupabaseClient,
  tableId: string,
  values: Record<string, CellValue>,
  recordId: string
) {
  const now = new Date().toISOString();
  return supabase.from("tf_records").insert({
    id: recordId,
    table_id: tableId,
    values: {
      ...values,
      "f-submitted": now.split("T")[0],
      "f-status": "New",
    },
    created_at: now,
    updated_at: now,
  });
}
