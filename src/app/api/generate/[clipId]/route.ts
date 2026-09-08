import { NextResponse } from "next/server";
import { pollClip } from "@/server/services/generate-service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ clipId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { clipId } = await context.params;
  try {
    const clip = await pollClip(clipId);
    return NextResponse.json(clip);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Poll failed";
    const status = message.includes("not found") ? 404 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
