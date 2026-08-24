import { NextResponse } from "next/server";
import { getEmailTemplate } from "@/lib/brevo";

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
