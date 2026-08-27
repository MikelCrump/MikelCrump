"use client";

/**
 * Sync a Command Center (localStorage) Supabase session into ReachFlow when
 * both apps share the same origin (reawakencommandcenter.com/apps/communications).
 * ReachFlow does not gate on auth today — this keeps future CRM calls aligned
 * with the signed-in Command Center user.
 */
import { createClient as createJsClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

export async function syncCommandCenterSession(): Promise<boolean> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return false;

  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) return false;

  try {
    const ls = createJsClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: window.localStorage,
      },
    });

    const { data } = await ls.auth.getSession();
    return Boolean(data.session?.access_token);
  } catch {
    return false;
  }
}

export function isMountedUnderCommandCenter(): boolean {
  if (typeof window === "undefined") return false;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    window.location.pathname.startsWith("/apps/communications") ||
    base === "/apps/communications" ||
    window.location.hostname.includes("reawakencommandcenter")
  );
}
