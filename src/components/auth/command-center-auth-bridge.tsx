"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { syncCommandCenterSession } from "@/lib/supabase/auth-bridge";
import { isSupabaseConfigured } from "@/lib/config";

/** Hydrate Tables session from Command Center when mounted under the same origin. */
export function CommandCenterAuthBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    (async () => {
      const synced = await syncCommandCenterSession();
      if (!cancelled) {
        setReady(true);
        if (synced) router.refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted text-sm text-muted-foreground">
        Connecting to Command Center…
      </div>
    );
  }

  return children;
}
