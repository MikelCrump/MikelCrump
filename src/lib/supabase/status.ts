import {
  getSupabaseAuthMode,
  getSupabaseUrl,
  hasSupabaseServiceRole,
  isSupabaseConfigured,
} from "./client";
import { getCrmSourceCounts, getSupabaseContactCount } from "./contacts";

export async function getSupabaseConnectionStatus() {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      source: "demo" as const,
      message:
        "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect Reawaken Command Center.",
      projectUrl: getSupabaseUrl(),
      authMode: getSupabaseAuthMode(),
      contactCount: 0,
      bySource: [] as Awaited<ReturnType<typeof getCrmSourceCounts>>,
      commandCenterUrl: "https://reawakencommandcenter.com",
    };
  }

  try {
    const [bySource, contactCount] = await Promise.all([
      getCrmSourceCounts(),
      getSupabaseContactCount(),
    ]);

    const hardErrors = bySource.filter((s) => s.error);
    const authMode = getSupabaseAuthMode();

    // Anon key can reach PostgREST but RLS returns empty rows.
    if (authMode === "anon" && contactCount === 0) {
      return {
        connected: false,
        source: "needs_service_role" as const,
        message:
          "Reached Command Center Supabase, but the anon key is blocked by RLS. Add SUPABASE_SERVICE_ROLE_KEY (Project Settings → API) so ReachFlow can read CRM contacts.",
        projectUrl: getSupabaseUrl(),
        authMode,
        contactCount: 0,
        bySource,
        commandCenterUrl: "https://reawakencommandcenter.com",
      };
    }

    if (hardErrors.length === bySource.length) {
      return {
        connected: false,
        source: "error" as const,
        message: hardErrors[0]?.error || "Failed to query Command Center CRM tables",
        projectUrl: getSupabaseUrl(),
        authMode,
        contactCount: 0,
        bySource,
        commandCenterUrl: "https://reawakencommandcenter.com",
      };
    }

    return {
      connected: true,
      source: "supabase" as const,
      message: "Connected to Reawaken Command Center (Supabase CRM)",
      projectUrl: getSupabaseUrl(),
      authMode,
      contactCount,
      bySource,
      commandCenterUrl: "https://reawakencommandcenter.com",
      hasServiceRole: hasSupabaseServiceRole(),
    };
  } catch (error) {
    return {
      connected: false,
      source: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to reach Command Center Supabase",
      projectUrl: getSupabaseUrl(),
      authMode: getSupabaseAuthMode(),
      contactCount: 0,
      bySource: [] as Awaited<ReturnType<typeof getCrmSourceCounts>>,
      commandCenterUrl: "https://reawakencommandcenter.com",
    };
  }
}
