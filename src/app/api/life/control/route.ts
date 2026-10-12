import { NextResponse } from "next/server";
import { z } from "zod";
import { runControl } from "@/life/control";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  target: z.enum(["govee", "tesla", "resideo", "apple_tv", "roku", "automation"]),
  action: z.string().min(1),
  deviceId: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, detail: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }
  const result = await runControl(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
