"use client";

/**
 * Sync a Command Center (localStorage) Supabase session into TableFlow's
 * cookie-based SSR client when both apps share the same origin
 * (e.g. reawakencommandcenter.com/apps/tableflow).
 */
import { createClient as createJsClient } from "@supabase/supabase-js";
import { tryCreateClient } from "./client";
import { isSupabaseConfigured } from "@/lib/config";

export async function syncCommandCenterSession(): Promise<boolean> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const ssr = tryCreateClient();
  if (!ssr) return false;

  const { data: existing } = await ssr.auth.getSession();
  if (existing.session) return true;

  // Same-project localStorage session written by Command Center's createClient()
  const ls = createJsClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: window.localStorage,
    },
  });

  const { data: fromLs } = await ls.auth.getSession();
  if (!fromLs.session?.access_token || !fromLs.session.refresh_token) {
    return false;
  }

  const { error } = await ssr.auth.setSession({
    access_token: fromLs.session.access_token,
    refresh_token: fromLs.session.refresh_token,
  });

  return !error;
}
