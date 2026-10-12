import { NextResponse } from "next/server";
import { lifeEnv } from "@/life/config";
import { getIntegrationStatus } from "@/life/status";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    forceMock: lifeEnv().forceMock,
    integrations: getIntegrationStatus(),
  });
}
