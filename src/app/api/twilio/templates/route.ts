import { NextResponse } from "next/server";
import { listSmsTemplates } from "@/lib/twilio";

export async function GET() {
  try {
    const result = await listSmsTemplates();
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
