"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/config";
import { tryCreateClient } from "@/lib/supabase/client";
import { hasPreviewSession } from "@/lib/preview-session";
import { isAllowedEmail } from "@/lib/auth-allowlist";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (pathname.startsWith("/login") || pathname.startsWith("/auth")) {
        if (!cancelled) setReady(true);
        return;
      }

      if (!isSupabaseConfigured()) {
        if (!hasPreviewSession()) {
          router.replace("/login");
          return;
        }
        if (!cancelled) setReady(true);
        return;
      }

      const supabase = tryCreateClient();
      if (!supabase) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user || !isAllowedEmail(data.user.email)) {
        if (data.user) await supabase.auth.signOut();
        router.replace("/login?error=forbidden");
        return;
      }

      if (!cancelled) setReady(true);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center steward-atmosphere">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return <>{children}</>;
}
