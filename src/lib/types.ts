export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "singleSelect"
  | "multiSelect"
  | "checkbox"
  | "date"
  | "longText"
  | "url";

export type ViewType = "grid" | "form" | "kanban";

export type MemberRole = "owner" | "admin" | "editor" | "commenter" | "viewer";

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  description?: string;
}

export type CellValue = string | string[] | boolean | number | null;

export interface TableRecord {
  id: string;
  tableId: string;
  values: Record<string, CellValue>;
  createdAt: string;
  updatedAt: string;
}

export interface View {
  id: string;
  name: string;
  type: ViewType;
}

export interface Table {
  id: string;
  baseId: string;
  name: string;
  description?: string;
  fields: Field[];
  views: View[];
}

export interface FormSettings {
  showLogo?: boolean;
  primaryColor?: string;
  embedEnabled?: boolean;
  redirectUrl?: string;
}

export interface Form {
  id: string;
  tableId: string;
  baseId: string;
  name: string;
  description?: string;
  submitButtonText?: string;
  successMessage?: string;
  fieldIds: string[];
  settings: FormSettings;
  published: boolean;
}

export interface Base {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: MemberRole;
  avatarColor: string;
  invitedAt: string;
  status: "active" | "pending";
}

export interface Workspace {
  id: string;
  name: string;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Single line text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  singleSelect: "Single select",
  multiSelect: "Multiple select",
  checkbox: "Checkbox",
  date: "Date",
  longText: "Long text",
  url: "URL",
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  commenter: "Commenter",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  owner: "Full access including billing and deletion",
  admin: "Can manage bases, tables, and team members",
  editor: "Can edit records and create forms",
  commenter: "Can view and comment on records",
  viewer: "Read-only access to bases and records",
};
