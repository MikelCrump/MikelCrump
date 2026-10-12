import { NextResponse } from "next/server";
import { registerTeslaPartner } from "@/life/adapters/tesla";

export const dynamic = "force-dynamic";

/** One-time Fleet API partner registration (fixes Tesla HTTP 412). */
export async function POST() {
  try {
    const result = await registerTeslaPartner();
    const ok = result.results.some((r) => r.ok);
    return NextResponse.json({ ok, ...result }, { status: ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        detail: error instanceof Error ? error.message : "Register failed",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST();
}
