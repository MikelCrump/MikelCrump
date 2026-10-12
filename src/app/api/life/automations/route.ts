import { NextResponse } from "next/server";
import { z } from "zod";
import { createAutomation, listAutomations } from "@/life/automations-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ automations: listAutomations() });
}

const createSchema = z.object({
  name: z.string().min(1).max(80),
  trigger: z.string().min(1).max(160),
  action: z.string().min(1).max(160),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, detail: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }
  const rule = createAutomation(parsed.data);
  return NextResponse.json({ ok: true, automation: rule });
}
