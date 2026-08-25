import { NextResponse } from "next/server";
import { getSupabaseConnectionStatus } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getSupabaseConnectionStatus();
  return NextResponse.json(status);
}
