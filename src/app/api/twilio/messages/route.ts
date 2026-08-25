import { NextResponse } from "next/server";
import { listSmsCampaigns } from "@/lib/twilio";

export async function GET() {
  try {
    const result = await listSmsCampaigns();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        campaigns: [],
        source: "error",
        error: error instanceof Error ? error.message : "Failed to load messages",
      },
      { status: 500 }
    );
  }
}
