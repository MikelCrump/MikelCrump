import { NextResponse } from "next/server";
import { getGovee, getGoveeDiagnostics } from "@/life/adapters/govee";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getGovee();
  return NextResponse.json({
    ok: snapshot.mode === "live",
    diagnostics: getGoveeDiagnostics(),
    snapshot,
  });
}
