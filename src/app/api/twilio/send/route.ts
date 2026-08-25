import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSms } from "@/lib/twilio";

const sendSchema = z.object({
  to: z.string().min(7),
  body: z.string().min(1).max(1600),
  from: z.string().optional(),
  mediaUrl: z.array(z.string().url()).optional(),
  sendAt: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await sendSms({
      to: parsed.data.to,
      body: parsed.data.body,
      from: parsed.data.from,
      mediaUrl: parsed.data.mediaUrl,
      sendAt: parsed.data.sendAt ? new Date(parsed.data.sendAt) : undefined,
      scheduleType: parsed.data.sendAt ? "fixed" : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send SMS",
      },
      { status: 500 }
    );
  }
}
