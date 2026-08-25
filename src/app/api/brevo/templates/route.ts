import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmailTemplate, listEmailTemplates } from "@/lib/brevo";

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

const upsertSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  htmlContent: z.string().min(10),
  tag: z.string().optional(),
  isActive: z.boolean().optional(),
  replyTo: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createEmailTemplate({
      ...parsed.data,
      replyTo: parsed.data.replyTo || undefined,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create template",
      },
      { status: 500 }
    );
  }
}
