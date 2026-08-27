"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { tryCreateClient } from "@/lib/supabase/client";
import {
  mapBase,
  mapForm,
  mapMember,
  mapRecord,
  mapTable,
} from "@/lib/supabase/mappers";
import { useAppStore } from "@/lib/store";

export type RealtimeStatus = "idle" | "connecting" | "connected" | "error";

export function useRealtimeSync() {
  const mode = useAppStore((s) => s.mode);
  const workspaceId = useAppStore((s) => s.workspaceId);
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (mode !== "remote" || !workspaceId) {
      setStatus("idle");
      return;
    }

    const supabase = tryCreateClient();
    if (!supabase) return;

    setStatus("connecting");

    const channel = supabase
      .channel(`workspace:${workspaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bases" },
        (payload) => {
          const wsId = useAppStore.getState().workspaceId;
          if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string; workspace_id?: string };
            if (old.workspace_id === wsId && old.id) {
              useAppStore.getState().removeRemoteBase(old.id);
            }
            return;
          }
          const row = payload.new as {
            id: string;
            workspace_id: string;
            name: string;
            description: string | null;
            color: string;
            icon: string | null;
            created_at: string;
          };
          if (row.workspace_id !== wsId) return;
          useAppStore.getState().upsertRemoteBase(mapBase(row));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tf_tables" },
        (payload) => {
          const baseIds = new Set(useAppStore.getState().bases.map((b) => b.id));
          if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string; base_id?: string };
            if (old.id && old.base_id && baseIds.has(old.base_id)) {
              useAppStore.getState().removeRemoteTable(old.id);
            }
            return;
          }
          const row = payload.new as {
            id: string;
            base_id: string;
            name: string;
            description: string | null;
            fields: unknown;
            views: unknown;
          };
          if (!baseIds.has(row.base_id)) return;
          useAppStore.getState().upsertRemoteTable(mapTable(row as Parameters<typeof mapTable>[0]));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tf_records" },
        (payload) => {
          const tableIds = new Set(useAppStore.getState().tables.map((t) => t.id));
          if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string; table_id?: string };
            if (old.id && old.table_id && tableIds.has(old.table_id)) {
              useAppStore.getState().removeRemoteRecord(old.id);
            }
            return;
          }
          const row = payload.new as {
            id: string;
            table_id: string;
            values: unknown;
            created_at: string;
            updated_at: string;
          };
          if (!tableIds.has(row.table_id)) return;
          useAppStore.getState().upsertRemoteRecord(mapRecord(row as Parameters<typeof mapRecord>[0]));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tf_forms" },
        (payload) => {
          const baseIds = new Set(useAppStore.getState().bases.map((b) => b.id));
          if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string; base_id?: string };
            if (old.id && old.base_id && baseIds.has(old.base_id)) {
              useAppStore.getState().removeRemoteForm(old.id);
            }
            return;
          }
          const row = payload.new as { id: string; base_id: string };
          if (!baseIds.has(row.base_id)) return;
          useAppStore.getState().upsertRemoteForm(mapForm(payload.new as Parameters<typeof mapForm>[0]));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_members" },
        (payload) => {
          const wsId = useAppStore.getState().workspaceId;
          if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string; workspace_id?: string };
            if (old.workspace_id === wsId && old.id) {
              useAppStore.getState().removeRemoteMember(old.id);
            }
            return;
          }
          const row = payload.new as { workspace_id: string };
          if (row.workspace_id !== wsId) return;
          useAppStore.getState().upsertRemoteMember(mapMember(payload.new as Parameters<typeof mapMember>[0]));
        }
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === "SUBSCRIBED") {
          setStatus("connected");
        } else if (subscribeStatus === "CHANNEL_ERROR") {
          setStatus("error");
        } else if (subscribeStatus === "TIMED_OUT") {
          setStatus("error");
        }
      });

    channelRef.current = channel;

    return () => {
      setStatus("idle");
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [mode, workspaceId]);

  return status;
}
