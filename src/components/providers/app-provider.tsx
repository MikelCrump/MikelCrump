"use client";

import { useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { loadRemoteWorkspace } from "@/lib/sync";
import { useAppStore } from "@/lib/store";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const setMode = useAppStore((s) => s.setMode);

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

    init();
  }, [hydrate, setMode]);

  return <>{children}</>;
}
