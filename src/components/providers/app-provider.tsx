"use client";

import { createContext, useContext, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { loadRemoteWorkspace } from "@/lib/sync";
import { useAppStore } from "@/lib/store";
import { useRealtimeSync, type RealtimeStatus } from "@/hooks/use-realtime-sync";

const RealtimeContext = createContext<RealtimeStatus>("idle");

export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const setMode = useAppStore((s) => s.setMode);
  const mode = useAppStore((s) => s.mode);
  const realtimeStatus = useRealtimeSync();

  useEffect(() => {
    async function init() {
      if (!isSupabaseConfigured()) {
        setMode("local");
        return;
      }

      const result = await loadRemoteWorkspace();

      if (!result) {
        setMode("local");
        return;
      }

      if (result.mode === "remote") {
        hydrate(result);
      } else {
        setMode("local");
      }
    }

    if (mode === "loading") {
      init();
    }
  }, [hydrate, setMode, mode]);

  return (
    <RealtimeContext.Provider value={realtimeStatus}>
      {children}
    </RealtimeContext.Provider>
  );
}
