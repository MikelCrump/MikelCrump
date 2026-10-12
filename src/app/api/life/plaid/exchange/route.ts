import { NextResponse } from "next/server";
import { z } from "zod";
import { exchangePlaidPublicToken } from "@/life/adapters/plaid";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  public_token: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, detail: "public_token required" }, { status: 400 });
  }
  try {
    const result = await exchangePlaidPublicToken(parsed.data.public_token);
    return NextResponse.json({
      ok: true,
      access_token: result.access_token,
      item_id: result.item_id,
      detail:
        "Copy access_token into PLAID_ACCESS_TOKEN (or a secrets store) and restart.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        detail: error instanceof Error ? error.message : "Exchange failed",
      },
      { status: 400 },
    );
  }
}
