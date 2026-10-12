import { NextResponse } from "next/server";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export async function GET() {
  const overview = await getLifeOverview();
  return NextResponse.json(overview);
}
