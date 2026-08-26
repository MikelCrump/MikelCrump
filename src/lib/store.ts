"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Base,
  CellValue,
  Field,
  FieldType,
  Form,
  MemberRole,
  Table,
  TableRecord,
  TeamMember,
  Workspace,
} from "./types";
import { generateId } from "./utils";
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
} from "./seed-data";

interface AppState {
  workspace: Workspace;
  bases: Base[];
  tables: Table[];
  records: TableRecord[];
  forms: Form[];
  team: TeamMember[];
  currentUserId: string;

  // Base operations
  createBase: (name: string, color?: string) => Base;
  updateBase: (id: string, updates: Partial<Base>) => void;
  deleteBase: (id: string) => void;

  // Table operations
  createTable: (baseId: string, name: string) => Table;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;

  // Field operations
  addField: (tableId: string, name: string, type: FieldType) => Field;
  updateField: (tableId: string, fieldId: string, updates: Partial<Field>) => void;
  deleteField: (tableId: string, fieldId: string) => void;
  reorderFields: (tableId: string, fieldIds: string[]) => void;

  // Record operations
  addRecord: (tableId: string, values?: Record<string, CellValue>) => TableRecord;
  updateRecord: (id: string, values: Record<string, CellValue>) => void;
  deleteRecord: (id: string) => void;
  importRecords: (tableId: string, rows: Record<string, CellValue>[]) => void;

  // Form operations
  createForm: (tableId: string, name: string) => Form;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  submitForm: (formId: string, values: Record<string, CellValue>) => TableRecord;

  // Team operations
  inviteMember: (email: string, name: string, role: MemberRole) => TeamMember;
  updateMemberRole: (id: string, role: MemberRole) => void;
  removeMember: (id: string) => void;

  // Selectors
  getBase: (id: string) => Base | undefined;
  getTable: (id: string) => Table | undefined;
  getTablesForBase: (baseId: string) => Table[];
  getRecordsForTable: (tableId: string) => TableRecord[];
  getFormsForTable: (tableId: string) => Form[];
  getForm: (id: string) => Form | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      workspace: DEMO_WORKSPACE,
      bases: [DEMO_BASE, EXTRA_BASE],
      tables: [DEMO_TABLE, EXTRA_TABLE],
      records: [...DEMO_RECORDS, ...EXTRA_RECORDS],
      forms: [DEMO_FORM],
      team: DEMO_TEAM,
      currentUserId: "tm-1",

      createBase: (name, color = "#6366f1") => {
        const base: Base = {
          id: generateId(),
          name,
          color,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ bases: [...s.bases, base] }));
        return base;
      },

      updateBase: (id, updates) =>
        set((s) => ({
          bases: s.bases.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      deleteBase: (id) =>
        set((s) => ({
          bases: s.bases.filter((b) => b.id !== id),
          tables: s.tables.filter((t) => t.baseId !== id),
          records: s.records.filter(
            (r) => !s.tables.find((t) => t.id === r.tableId && t.baseId === id)
          ),
          forms: s.forms.filter((f) => f.baseId !== id),
        })),

      createTable: (baseId, name) => {
        const table: Table = {
          id: generateId(),
          baseId,
          name,
          fields: [
            { id: generateId(), name: "Name", type: "text" },
            { id: generateId(), name: "Notes", type: "longText" },
          ],
          views: [{ id: generateId(), name: "Grid view", type: "grid" }],
        };
        set((s) => ({ tables: [...s.tables, table] }));
        return table;
      },

      updateTable: (id, updates) =>
        set((s) => ({
          tables: s.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTable: (id) =>
        set((s) => ({
          tables: s.tables.filter((t) => t.id !== id),
          records: s.records.filter((r) => r.tableId !== id),
          forms: s.forms.filter((f) => f.tableId !== id),
        })),

      addField: (tableId, name, type) => {
        const field: Field = {
          id: generateId(),
          name,
          type,
          options:
            type === "singleSelect" || type === "multiSelect"
              ? ["Option 1", "Option 2"]
              : undefined,
        };
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === tableId ? { ...t, fields: [...t.fields, field] } : t
          ),
        }));
        return field;
      },

      updateField: (tableId, fieldId, updates) =>
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  fields: t.fields.map((f) =>
                    f.id === fieldId ? { ...f, ...updates } : f
                  ),
                }
              : t
          ),
        })),

      deleteField: (tableId, fieldId) =>
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === tableId
              ? { ...t, fields: t.fields.filter((f) => f.id !== fieldId) }
              : t
          ),
          records: s.records.map((r) => {
            if (r.tableId !== tableId) return r;
            const { [fieldId]: _, ...rest } = r.values;
            return { ...r, values: rest };
          }),
        })),

      reorderFields: (tableId, fieldIds) =>
        set((s) => ({
          tables: s.tables.map((t) => {
            if (t.id !== tableId) return t;
            const fieldMap = new Map(t.fields.map((f) => [f.id, f]));
            return {
              ...t,
              fields: fieldIds
                .map((id) => fieldMap.get(id))
                .filter(Boolean) as Field[],
            };
          }),
        })),

      addRecord: (tableId, values = {}) => {
        const now = new Date().toISOString();
        const record: TableRecord = {
          id: generateId(),
          tableId,
          values,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ records: [...s.records, record] }));
        return record;
      },

      updateRecord: (id, values) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id
              ? {
                  ...r,
                  values: { ...r.values, ...values },
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      deleteRecord: (id) =>
        set((s) => ({ records: s.records.filter((r) => r.id !== id) })),

      importRecords: (tableId, rows) => {
        const now = new Date().toISOString();
        const newRecords: TableRecord[] = rows.map((values) => ({
          id: generateId(),
          tableId,
          values,
          createdAt: now,
          updatedAt: now,
        }));
        set((s) => ({ records: [...s.records, ...newRecords] }));
      },

      createForm: (tableId, name) => {
        const table = get().getTable(tableId);
        if (!table) throw new Error("Table not found");
        const form: Form = {
          id: generateId(),
          tableId,
          baseId: table.baseId,
          name,
          submitButtonText: "Submit",
          successMessage: "Thank you! Your response has been recorded.",
          fieldIds: table.fields.map((f) => f.id),
          settings: { embedEnabled: true, primaryColor: "#2563eb" },
          published: false,
        };
        set((s) => ({ forms: [...s.forms, form] }));
        return form;
      },

      updateForm: (id, updates) =>
        set((s) => ({
          forms: s.forms.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        })),

      deleteForm: (id) =>
        set((s) => ({ forms: s.forms.filter((f) => f.id !== id) })),

      submitForm: (formId, values) => {
        const form = get().getForm(formId);
        if (!form) throw new Error("Form not found");
        const now = new Date().toISOString();
        const record = get().addRecord(form.tableId, {
          ...values,
          "f-submitted": now.split("T")[0],
          "f-status": "New",
        });
        return record;
      },

      inviteMember: (email, name, role) => {
        const member: TeamMember = {
          id: generateId(),
          email,
          name,
          role,
          avatarColor: `hsl(${Math.floor(Math.random() * 360)}, 60%, 45%)`,
          invitedAt: new Date().toISOString(),
          status: "pending",
        };
        set((s) => ({ team: [...s.team, member] }));
        return member;
      },

      updateMemberRole: (id, role) =>
        set((s) => ({
          team: s.team.map((m) => (m.id === id ? { ...m, role } : m)),
        })),

      removeMember: (id) =>
        set((s) => ({ team: s.team.filter((m) => m.id !== id) })),

      getBase: (id) => get().bases.find((b) => b.id === id),
      getTable: (id) => get().tables.find((t) => t.id === id),
      getTablesForBase: (baseId) =>
        get().tables.filter((t) => t.baseId === baseId),
      getRecordsForTable: (tableId) =>
        get().records.filter((r) => r.tableId === tableId),
      getFormsForTable: (tableId) =>
        get().forms.filter((f) => f.tableId === tableId),
      getForm: (id) => get().forms.find((f) => f.id === id),
    }),
    {
      name: "tableflow-storage",
      version: 1,
    }
  )
);
