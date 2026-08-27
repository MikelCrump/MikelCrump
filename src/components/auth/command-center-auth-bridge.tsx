"use client";

import { useEffect, useState } from "react";
import {
  isMountedUnderCommandCenter,
  syncCommandCenterSession,
} from "@/lib/supabase/auth-bridge";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/** Hydrate session from Command Center when mounted under the same origin. */
export function CommandCenterAuthBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  const needsBridge =
    isSupabaseConfigured() &&
    (Boolean(process.env.NEXT_PUBLIC_BASE_PATH) ||
      (typeof window !== "undefined" && isMountedUnderCommandCenter()));

  const [ready, setReady] = useState(!needsBridge);

  useEffect(() => {
    if (!needsBridge) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      await syncCommandCenterSession();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [needsBridge]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Connecting to Command Center…
      </div>
    );
  }

  return <>{children}</>;
}
