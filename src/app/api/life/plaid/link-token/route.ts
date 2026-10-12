import { NextResponse } from "next/server";
import { createPlaidLinkToken } from "@/life/adapters/plaid";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const token = await createPlaidLinkToken();
    return NextResponse.json({ ok: true, ...token });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        detail: error instanceof Error ? error.message : "Link token failed",
      },
      { status: 400 },
    );
  }
}
