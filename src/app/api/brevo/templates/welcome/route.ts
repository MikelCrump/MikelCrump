import { NextResponse } from "next/server";
import { ensureReawakenWelcomeTemplate } from "@/lib/brevo/welcome";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await ensureReawakenWelcomeTemplate();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync welcome template",
      },
      { status: 500 }
    );
  }
}
