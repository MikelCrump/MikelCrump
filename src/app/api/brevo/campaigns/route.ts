import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAndDispatchCampaign,
  listEmailCampaigns,
} from "@/lib/brevo";

export async function GET() {
  try {
    const result = await listEmailCampaigns();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        campaigns: [],
        source: "error",
        error: error instanceof Error ? error.message : "Failed to load campaigns",
      },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  htmlContent: z.string().optional(),
  templateId: z.number().int().positive().optional(),
  scheduledAt: z.string().optional(),
  listIds: z.array(z.number().int().positive()).optional(),
  sendNow: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!parsed.data.htmlContent && !parsed.data.templateId) {
      return NextResponse.json(
        { error: "Provide htmlContent or templateId" },
        { status: 400 }
      );
    }

    const result = await createAndDispatchCampaign(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create campaign",
      },
      { status: 500 }
    );
  }
}
