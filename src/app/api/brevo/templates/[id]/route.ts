import { NextResponse } from "next/server";
import { z } from "zod";
import { getEmailTemplate, updateEmailTemplate } from "@/lib/brevo";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getEmailTemplate(id);
    if (!result) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load template",
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

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await updateEmailTemplate(id, {
      ...parsed.data,
      replyTo: parsed.data.replyTo || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update template",
      },
      { status: 500 }
    );
  }
}
