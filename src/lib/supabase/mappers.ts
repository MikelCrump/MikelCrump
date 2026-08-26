import type {
  Base,
  Form,
  Table,
  TableRecord,
  TeamMember,
  Workspace,
} from "@/lib/types";

export interface WorkspaceData {
  workspace: Workspace;
  bases: Base[];
  tables: Table[];
  records: TableRecord[];
  forms: Form[];
  team: TeamMember[];
  currentUserId: string;
}

interface DbWorkspace {
  id: string;
  name: string;
  created_at: string;
}

interface DbMember {
  id: string;
  workspace_id: string;
  user_id: string | null;
  email: string;
  name: string;
  role: string;
  avatar_color: string;
  status: string;
  invited_at: string;
}

interface DbBase {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  created_at: string;
}

interface DbTable {
  id: string;
  base_id: string;
  name: string;
  description: string | null;
  fields: unknown;
  views: unknown;
  created_at: string;
  updated_at: string;
}

interface DbRecord {
  id: string;
  table_id: string;
  values: unknown;
  created_at: string;
  updated_at: string;
}

interface DbForm {
  id: string;
  table_id: string;
  base_id: string;
  name: string;
  description: string | null;
  submit_button_text: string | null;
  success_message: string | null;
  field_ids: unknown;
  settings: unknown;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export function mapWorkspace(row: DbWorkspace): Workspace {
  return { id: row.id, name: row.name };
}

export function mapMember(row: DbMember): TeamMember {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as TeamMember["role"],
    avatarColor: row.avatar_color,
    invitedAt: row.invited_at,
    status: row.status as TeamMember["status"],
  };
}

export function mapBase(row: DbBase): Base {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    color: row.color,
    icon: row.icon ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapTable(row: DbTable): Table {
  return {
    id: row.id,
    baseId: row.base_id,
    name: row.name,
    description: row.description ?? undefined,
    fields: row.fields as Table["fields"],
    views: row.views as Table["views"],
  };
}

export function mapRecord(row: DbRecord): TableRecord {
  return {
    id: row.id,
    tableId: row.table_id,
    values: row.values as TableRecord["values"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapForm(row: DbForm): Form {
  return {
    id: row.id,
    tableId: row.table_id,
    baseId: row.base_id,
    name: row.name,
    description: row.description ?? undefined,
    submitButtonText: row.submit_button_text ?? undefined,
    successMessage: row.success_message ?? undefined,
    fieldIds: row.field_ids as string[],
    settings: row.settings as Form["settings"],
    published: row.published,
  };
}

export type {
  DbWorkspace,
  DbMember,
  DbBase,
  DbTable,
  DbRecord,
  DbForm,
};
