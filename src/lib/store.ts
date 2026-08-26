"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkspaceData } from "@/lib/supabase/mappers";
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
import {
  setWorkspaceId,
  syncBase,
  syncDeleteBase,
  syncDeleteForm,
  syncDeleteMember,
  syncDeleteRecord,
  syncDeleteTable,
  syncForm,
  syncMember,
  syncMemberRole,
  syncRecord,
  syncRecords,
  syncTable,
  syncTableFields,
  submitFormLocal,
  submitFormRemote,
} from "./sync";

export type DataMode = "loading" | "local" | "remote";

interface AppState {
  mode: DataMode;
  workspace: Workspace;
  workspaceId: string | null;
  bases: Base[];
  tables: Table[];
  records: TableRecord[];
  forms: Form[];
  team: TeamMember[];
  currentUserId: string;

  setMode: (mode: DataMode) => void;
  hydrate: (data: WorkspaceData) => void;

  createBase: (name: string, color?: string) => Base;
  updateBase: (id: string, updates: Partial<Base>) => void;
  deleteBase: (id: string) => void;

  createTable: (baseId: string, name: string) => Table;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;

  addField: (tableId: string, name: string, type: FieldType) => Field;
  updateField: (tableId: string, fieldId: string, updates: Partial<Field>) => void;
  deleteField: (tableId: string, fieldId: string) => void;
  reorderFields: (tableId: string, fieldIds: string[]) => void;

  addRecord: (tableId: string, values?: Record<string, CellValue>) => TableRecord;
  updateRecord: (id: string, values: Record<string, CellValue>) => void;
  deleteRecord: (id: string) => void;
  importRecords: (tableId: string, rows: Record<string, CellValue>[]) => void;

  createForm: (tableId: string, name: string) => Form;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  submitForm: (
    formId: string,
    values: Record<string, CellValue>
  ) => Promise<{ success: boolean; message?: string }>;

  inviteMember: (email: string, name: string, role: MemberRole) => TeamMember;
  updateMemberRole: (id: string, role: MemberRole) => void;
  removeMember: (id: string) => void;

  getBase: (id: string) => Base | undefined;
  getTable: (id: string) => Table | undefined;
  getTablesForBase: (baseId: string) => Table[];
  getRecordsForTable: (tableId: string) => TableRecord[];
  getFormsForTable: (tableId: string) => Form[];
  getForm: (id: string) => Form | undefined;
}

const defaultState = {
  mode: "loading" as DataMode,
  workspace: DEMO_WORKSPACE,
  workspaceId: null as string | null,
  bases: [DEMO_BASE, EXTRA_BASE],
  tables: [DEMO_TABLE, EXTRA_TABLE],
  records: [...DEMO_RECORDS, ...EXTRA_RECORDS],
  forms: [DEMO_FORM],
  team: DEMO_TEAM,
  currentUserId: "tm-1",
};

function maybeSync(mode: DataMode, fn: () => Promise<void>) {
  if (mode === "remote") {
    fn().catch(console.error);
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setMode: (mode) => set({ mode }),

      hydrate: (data) => {
        setWorkspaceId(data.workspace.id);
        set({
          mode: "remote",
          workspace: data.workspace,
          workspaceId: data.workspace.id,
          bases: data.bases,
          tables: data.tables,
          records: data.records,
          forms: data.forms,
          team: data.team,
          currentUserId: data.currentUserId,
        });
      },

      createBase: (name, color = "#6366f1") => {
        const base: Base = {
          id: generateId(),
          name,
          color,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ bases: [...s.bases, base] }));
        maybeSync(get().mode, () => syncBase(base));
        return base;
      },

      updateBase: (id, updates) => {
        set((s) => ({
          bases: s.bases.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
        const base = get().getBase(id);
        if (base) maybeSync(get().mode, () => syncBase(base));
      },

      deleteBase: (id) => {
        set((s) => ({
          bases: s.bases.filter((b) => b.id !== id),
          tables: s.tables.filter((t) => t.baseId !== id),
          records: s.records.filter(
            (r) => !s.tables.find((t) => t.id === r.tableId && t.baseId === id)
          ),
          forms: s.forms.filter((f) => f.baseId !== id),
        }));
        maybeSync(get().mode, () => syncDeleteBase(id));
      },

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
        maybeSync(get().mode, () => syncTable(table));
        return table;
      },

      updateTable: (id, updates) => {
        set((s) => ({
          tables: s.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        const table = get().getTable(id);
        if (table) maybeSync(get().mode, () => syncTable(table));
      },

      deleteTable: (id) => {
        set((s) => ({
          tables: s.tables.filter((t) => t.id !== id),
          records: s.records.filter((r) => r.tableId !== id),
          forms: s.forms.filter((f) => f.tableId !== id),
        }));
        maybeSync(get().mode, () => syncDeleteTable(id));
      },

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
        const table = get().getTable(tableId);
        if (table) maybeSync(get().mode, () => syncTableFields(tableId, table.fields));
        return field;
      },

      updateField: (tableId, fieldId, updates) => {
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
        }));
        const table = get().getTable(tableId);
        if (table) maybeSync(get().mode, () => syncTableFields(tableId, table.fields));
      },

      deleteField: (tableId, fieldId) => {
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
        }));
        const table = get().getTable(tableId);
        if (table) maybeSync(get().mode, () => syncTableFields(tableId, table.fields));
      },

      reorderFields: (tableId, fieldIds) => {
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
        }));
        const table = get().getTable(tableId);
        if (table) maybeSync(get().mode, () => syncTableFields(tableId, table.fields));
      },

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
        maybeSync(get().mode, () => syncRecord(record));
        return record;
      },

      updateRecord: (id, values) => {
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
        }));
        const record = get().records.find((r) => r.id === id);
        if (record) maybeSync(get().mode, () => syncRecord(record));
      },

      deleteRecord: (id) => {
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
        maybeSync(get().mode, () => syncDeleteRecord(id));
      },

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
        maybeSync(get().mode, () => syncRecords(newRecords));
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
        maybeSync(get().mode, () => syncForm(form));
        return form;
      },

      updateForm: (id, updates) => {
        set((s) => ({
          forms: s.forms.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }));
        const form = get().getForm(id);
        if (form) maybeSync(get().mode, () => syncForm(form));
      },

      deleteForm: (id) => {
        set((s) => ({ forms: s.forms.filter((f) => f.id !== id) }));
        maybeSync(get().mode, () => syncDeleteForm(id));
      },

      submitForm: async (formId, values) => {
        const form = get().getForm(formId);
        if (!form) return { success: false };

        if (get().mode === "remote") {
          const result = await submitFormRemote(formId, values);
          if (result.success) {
            const now = new Date().toISOString();
            const record: TableRecord = {
              id: result.recordId ?? generateId(),
              tableId: form.tableId,
              values: {
                ...values,
                "f-submitted": now.split("T")[0],
                "f-status": "New",
              },
              createdAt: now,
              updatedAt: now,
            };
            set((s) => ({ records: [...s.records, record] }));
          }
          return {
            success: result.success,
            message: result.message ?? form.successMessage,
          };
        }

        submitFormLocal(formId, values, get().addRecord, get().getForm);
        return { success: true, message: form.successMessage };
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
        const wId = get().workspaceId;
        if (wId) maybeSync(get().mode, () => syncMember(member, wId));
        return member;
      },

      updateMemberRole: (id, role) => {
        set((s) => ({
          team: s.team.map((m) => (m.id === id ? { ...m, role } : m)),
        }));
        maybeSync(get().mode, () => syncMemberRole(id, role));
      },

      removeMember: (id) => {
        set((s) => ({ team: s.team.filter((m) => m.id !== id) }));
        maybeSync(get().mode, () => syncDeleteMember(id));
      },

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
      version: 2,
      partialize: (state) => ({
        mode: state.mode === "remote" ? "remote" : "local",
        workspace: state.workspace,
        workspaceId: state.workspaceId,
        bases: state.bases,
        tables: state.tables,
        records: state.records,
        forms: state.forms,
        team: state.team,
        currentUserId: state.currentUserId,
      }),
    }
  )
);
