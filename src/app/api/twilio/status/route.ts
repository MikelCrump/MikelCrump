import { NextResponse } from "next/server";
import { getTwilioConnectionStatus } from "@/lib/twilio";

export async function GET() {
  try {
    const status = await getTwilioConnectionStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        source: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        account: null,
      },
      { status: 500 }
    );
  }
}
