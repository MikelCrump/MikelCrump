import { NextResponse } from "next/server";
import { getTeslaAuthUrl } from "@/life/adapters/tesla";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const auth = getTeslaAuthUrl(origin);
    return NextResponse.json({ ok: true, ...auth });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        detail: error instanceof Error ? error.message : "Auth URL failed",
      },
      { status: 400 },
    );
  }
}
