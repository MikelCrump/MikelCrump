import { NextResponse } from "next/server";
import { z } from "zod";
import { sendTransactionalEmail } from "@/lib/brevo";

const sendSchema = z.object({
  to: z
    .array(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
      })
    )
    .min(1),
  subject: z.string().optional(),
  htmlContent: z.string().optional(),
  templateId: z.number().int().positive().optional(),
  params: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  scheduledAt: z.string().optional(),
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

    if (!parsed.data.templateId && !parsed.data.htmlContent) {
      return NextResponse.json(
        { error: "Provide templateId or htmlContent" },
        { status: 400 }
      );
    }

    const result = await sendTransactionalEmail({
      to: parsed.data.to,
      subject: parsed.data.subject,
      htmlContent: parsed.data.htmlContent,
      templateId: parsed.data.templateId,
      params: parsed.data.params,
      scheduledAt: parsed.data.scheduledAt,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
