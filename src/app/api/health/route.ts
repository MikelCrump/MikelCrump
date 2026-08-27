import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";

export async function GET() {
  const checks = {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    supabase: isSupabaseConfigured(),
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  };

  return NextResponse.json(checks, {
    headers: { "Cache-Control": "no-store" },
  });
}
