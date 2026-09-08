import { NextResponse } from "next/server";
import {
  AudioProjectSchema,
  synthesizeProjectAudio,
} from "@/server/services/audio-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AudioProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const result = await synthesizeProjectAudio(parsed.data.projectId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Synthesize failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
