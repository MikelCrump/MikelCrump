import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Reawaken Command Center Supabase project (public frontend values). */
export const COMMAND_CENTER_SUPABASE_URL =
  "https://izterlcgwtguotdxyaza.supabase.co";

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    COMMAND_CENTER_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && (getSupabaseServiceRoleKey() || getSupabaseAnonKey()));
}

export function hasSupabaseServiceRole(): boolean {
  return Boolean(getSupabaseServiceRoleKey());
}

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client for Command Center CRM.
 * Prefers the service role key so RLS does not hide CRM rows.
 */
export function getSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  const anonKey = getSupabaseAnonKey();
  const key = serviceKey || anonKey;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY."
    );
  }

  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}

export function resetSupabaseClient() {
  client = null;
}

export function getSupabaseAuthMode(): "service_role" | "anon" | "none" {
  if (getSupabaseServiceRoleKey()) return "service_role";
  if (getSupabaseAnonKey()) return "anon";
  return "none";
}
