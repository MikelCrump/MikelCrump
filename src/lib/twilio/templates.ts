import type { Template } from "@/lib/mock-data";
import { smsTemplates as mockTemplates } from "@/lib/mock-data";
import { getTwilioClient, isTwilioConfigured } from "./client";

function mapContentTemplate(item: {
  sid: string;
  friendlyName?: string | null;
  language?: string | null;
  types?: Record<string, { body?: string }> | null;
  dateUpdated?: Date | null;
}): Template | null {
  const textType =
    item.types?.["twilio/text"] ||
    item.types?.["twilio/quick-reply"] ||
    Object.values(item.types || {})[0];
  const body = textType?.body;
  if (!body) return null;

  return {
    id: item.sid,
    name: item.friendlyName || item.sid,
    channel: "sms",
    preview: body.slice(0, 160),
    body,
    category: item.language || "Content",
    updatedAt: (item.dateUpdated || new Date()).toISOString().slice(0, 10),
    usageCount: 0,
  };
}

export async function listSmsTemplates(): Promise<{
  templates: Template[];
  source: "twilio" | "demo";
}> {
  if (!isTwilioConfigured()) {
    return { templates: mockTemplates, source: "demo" };
  }

  try {
    const twilio = getTwilioClient();
    // Content API templates (optional). Fall back to in-app demo templates if none.
    const contents = await twilio.content.v1.contents.list({ limit: 50 });
    const templates = contents
      .map((c) =>
        mapContentTemplate({
          sid: c.sid,
          friendlyName: c.friendlyName,
          language: c.language,
          types: c.types as Record<string, { body?: string }> | null,
          dateUpdated: c.dateUpdated,
        })
      )
      .filter((t): t is Template => Boolean(t));

    if (templates.length === 0) {
      return { templates: mockTemplates, source: "demo" };
    }

    return { templates, source: "twilio" };
  } catch {
    // Content API may be unavailable on some accounts — keep usable templates.
    return { templates: mockTemplates, source: "demo" };
  }
}

export async function getSmsTemplate(
  id: string
): Promise<{ template: Template; source: "twilio" | "demo" } | null> {
  const { templates, source } = await listSmsTemplates();
  const template = templates.find((t) => t.id === id);
  return template ? { template, source } : null;
}
