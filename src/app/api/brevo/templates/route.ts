import { NextResponse } from "next/server";
import { listEmailTemplates } from "@/lib/brevo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const result = await listEmailTemplates({ activeOnly });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        templates: [],
        source: "error",
        error: error instanceof Error ? error.message : "Failed to load templates",
      },
      { status: 500 }
    );
  }
}
