import { NextResponse } from "next/server";
import { listBrevoLists } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await listBrevoLists();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        lists: [],
        source: "error",
        error: error instanceof Error ? error.message : "Failed to load lists",
      },
      { status: 500 }
    );
  }
}
