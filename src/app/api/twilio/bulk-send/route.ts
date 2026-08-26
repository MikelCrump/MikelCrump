import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBulkSms } from "@/lib/twilio/bulk-send";

const bulkSchema = z.object({
  body: z.string().min(1).max(1600),
  recipients: z.array(z.string().min(7)).optional(),
  listId: z.number().int().positive().optional(),
  sendAt: z.string().datetime().optional(),
  maxRecipients: z.number().int().positive().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!parsed.data.recipients?.length && !parsed.data.listId) {
      return NextResponse.json(
        { error: "Provide recipients or a Brevo listId" },
        { status: 400 }
      );
    }

    const result = await sendBulkSms({
      body: parsed.data.body,
      recipients: parsed.data.recipients,
      listId: parsed.data.listId,
      sendAt: parsed.data.sendAt ? new Date(parsed.data.sendAt) : undefined,
      maxRecipients: parsed.data.maxRecipients,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Bulk SMS failed",
      },
      { status: 500 }
    );
  }
}
