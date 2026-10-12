import { NextResponse } from "next/server";
import {
  getTesla,
  getTeslaDiagnostics,
  listTeslaVehicles,
} from "@/life/adapters/tesla";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics = getTeslaDiagnostics();
  let vehicles: unknown[] = [];
  let vehiclesError: string | null = null;
  if (diagnostics.configured && !diagnostics.forceMock) {
    try {
      vehicles = await listTeslaVehicles();
    } catch (error) {
      vehiclesError = error instanceof Error ? error.message : "list failed";
    }
  }
  const snapshot = await getTesla();
  return NextResponse.json({
    ok: snapshot.mode === "live",
    diagnostics,
    vehicles,
    vehiclesError,
    snapshot,
  });
}
