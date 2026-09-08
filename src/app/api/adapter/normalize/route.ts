import { NextResponse } from "next/server";
import {
  NormalizeInputSchema,
  normalizeAdapterPayload,
} from "@/server/services/adapter-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = NormalizeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const sceneScript = normalizeAdapterPayload(parsed.data);
    return NextResponse.json(sceneScript);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Normalize failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
