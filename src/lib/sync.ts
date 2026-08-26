import { tryCreateClient } from "@/lib/supabase/client";
import {
  deleteBaseRemote,
  deleteFormRemote,
  deleteMemberRemote,
  deleteRecordRemote,
  deleteTableRemote,
  submitFormRecord,
  updateMemberRoleRemote,
  updateTableFields,
  upsertBase,
  upsertForm,
  upsertMember,
  upsertRecord,
  upsertRecords,
  upsertTable,
} from "@/lib/supabase/mutations";
import type { WorkspaceData } from "@/lib/supabase/mappers";
import type {
  Base,
  CellValue,
  Field,
  Form,
  MemberRole,
  Table,
  TableRecord,
  TeamMember,
} from "@/lib/types";

let workspaceIdCache: string | null = null;

export function setWorkspaceId(id: string) {
  workspaceIdCache = id;
}

function getClient() {
  const client = tryCreateClient();
  if (!client) return null;
  return client;
}

async function wsId(): Promise<string | null> {
  if (workspaceIdCache) return workspaceIdCache;
  const res = await fetch("/api/workspace");
  if (!res.ok) return null;
  const data = await res.json();
  if (data.workspace?.id) {
    workspaceIdCache = data.workspace.id;
    return data.workspace.id;
  }
  return null;
}

export async function loadRemoteWorkspace(): Promise<
  (WorkspaceData & { mode: "remote" }) | { mode: "local" } | null
> {
  try {
    const res = await fetch("/api/workspace");
    if (res.status === 401) return null;
    const data = await res.json();
    if (data.mode === "remote") {
      workspaceIdCache = data.workspace.id;
      return data;
    }
    return { mode: "local" };
  } catch {
    return { mode: "local" };
  }
}

export async function syncBase(base: Base) {
  const supabase = getClient();
  const wId = await wsId();
  if (!supabase || !wId) return;
  await upsertBase(supabase, base, wId);
}

export async function syncDeleteBase(id: string) {
  const supabase = getClient();
  if (!supabase) return;
  await deleteBaseRemote(supabase, id);
}

export async function syncTable(table: Table) {
  const supabase = getClient();
  if (!supabase) return;
  await upsertTable(supabase, table);
}

export async function syncDeleteTable(id: string) {
  const supabase = getClient();
  if (!supabase) return;
  await deleteTableRemote(supabase, id);
}

export async function syncTableFields(tableId: string, fields: Field[]) {
  const supabase = getClient();
  if (!supabase) return;
  await updateTableFields(supabase, tableId, fields);
}

export async function syncRecord(record: TableRecord) {
  const supabase = getClient();
  if (!supabase) return;
  await upsertRecord(supabase, record);
}

export async function syncRecords(records: TableRecord[]) {
  const supabase = getClient();
  if (!supabase) return;
  await upsertRecords(supabase, records);
}

export async function syncDeleteRecord(id: string) {
  const supabase = getClient();
  if (!supabase) return;
  await deleteRecordRemote(supabase, id);
}

export async function syncForm(form: Form) {
  const supabase = getClient();
  if (!supabase) return;
  await upsertForm(supabase, form);
}

export async function syncDeleteForm(id: string) {
  const supabase = getClient();
  if (!supabase) return;
  await deleteFormRemote(supabase, id);
}

export async function syncMember(member: TeamMember, workspaceId: string) {
  const supabase = getClient();
  if (!supabase) return;
  await upsertMember(supabase, {
    id: member.id,
    workspaceId,
    email: member.email,
    name: member.name,
    role: member.role,
    avatarColor: member.avatarColor,
    status: member.status,
    invitedAt: member.invitedAt,
  });
}

export async function syncMemberRole(id: string, role: MemberRole) {
  const supabase = getClient();
  if (!supabase) return;
  await updateMemberRoleRemote(supabase, id, role);
}

export async function syncDeleteMember(id: string) {
  const supabase = getClient();
  if (!supabase) return;
  await deleteMemberRemote(supabase, id);
}

export async function submitFormRemote(
  formId: string,
  values: Record<string, CellValue>
): Promise<{ success: boolean; message?: string; error?: string; recordId?: string }> {
  try {
    const res = await fetch(`/api/forms/${formId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message, recordId: data.recordId };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function submitFormLocal(
  formId: string,
  values: Record<string, CellValue>,
  addRecord: (tableId: string, values: Record<string, CellValue>) => TableRecord,
  getForm: (id: string) => Form | undefined
) {
  const form = getForm(formId);
  if (!form) throw new Error("Form not found");
  return addRecord(form.tableId, {
    ...values,
    "f-submitted": new Date().toISOString().split("T")[0],
    "f-status": "New",
  });
}

export async function submitFormRecordRemote(
  tableId: string,
  values: Record<string, CellValue>,
  recordId: string
) {
  const supabase = getClient();
  if (!supabase) return;
  await submitFormRecord(supabase, tableId, values, recordId);
}
