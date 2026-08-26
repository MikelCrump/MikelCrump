import type { Campaign, CampaignStatus } from "@/lib/mock-data";
import { getBrevoClient, getBrevoConfig, isBrevoConfigured } from "./client";

function mapBrevoStatus(status: string): CampaignStatus {
  switch (status) {
    case "draft":
      return "draft";
    case "sent":
      return "sent";
    case "queued":
    case "in_process":
      return "sending";
    case "suspended":
    case "cancelled":
    case "cancelling":
      return "paused";
    default:
      return status === "in_review" ? "scheduled" : "draft";
  }
}

function mapCampaign(c: {
  id: number;
  name: string;
  status: string;
  subject?: string;
  scheduledAt?: string;
  sentDate?: string;
  statistics?: {
    globalStats?: {
      uniqueViews?: number | null;
      viewed?: number | null;
      delivered?: number | null;
      clickers?: number | null;
      uniqueClicks?: number | null;
      sent?: number | null;
    };
  };
}): Campaign {
  const stats = c.statistics?.globalStats;
  const delivered = stats?.delivered ?? stats?.sent ?? 0;
  const opens = stats?.uniqueViews ?? stats?.viewed ?? 0;
  const clicks = stats?.uniqueClicks ?? stats?.clickers ?? 0;

  return {
    id: String(c.id),
    name: c.name,
    channel: "email",
    templateId: "",
    templateName: c.subject ?? "—",
    status:
      c.scheduledAt && c.status === "draft"
        ? "scheduled"
        : mapBrevoStatus(c.status),
    audience: "Brevo list",
    recipientCount: delivered || (stats?.sent ?? 0) || 0,
    scheduledAt: c.scheduledAt,
    sentAt: c.sentDate,
    openRate:
      delivered > 0 ? Math.round((opens / delivered) * 1000) / 10 : undefined,
    clickRate:
      delivered > 0 ? Math.round((clicks / delivered) * 1000) / 10 : undefined,
  };
}

export async function listEmailCampaigns(): Promise<{
  campaigns: Campaign[];
  source: "brevo" | "demo";
}> {
  if (!isBrevoConfigured()) {
    return {
      campaigns: [],
      source: "demo",
    };
  }

  const brevo = getBrevoClient();
  const response = await brevo.emailCampaigns.getEmailCampaigns({
    limit: 50,
    sort: "desc",
  });

  const campaigns = (response.campaigns ?? []).map(mapCampaign);
  return { campaigns, source: "brevo" };
}

export interface CreateCampaignInput {
  name: string;
  subject: string;
  htmlContent?: string;
  templateId?: number;
  scheduledAt?: string;
  listIds?: number[];
  sendNow?: boolean;
}

export async function createAndDispatchCampaign(input: CreateCampaignInput) {
  if (!isBrevoConfigured()) {
    return {
      source: "demo" as const,
      campaignId: `demo-${Date.now()}`,
      status: input.sendNow ? "sent" : input.scheduledAt ? "scheduled" : "draft",
      message:
        "Demo mode: campaign saved locally. Add BREVO_API_KEY to send via Brevo.",
    };
  }

  const brevo = getBrevoClient();
  const { senderEmail, senderName } = getBrevoConfig();

  if (!input.htmlContent && !input.templateId) {
    throw new Error("Provide either htmlContent or templateId");
  }

  const createPayload: Parameters<
    typeof brevo.emailCampaigns.createEmailCampaign
  >[0] = {
    name: input.name,
    subject: input.subject,
    sender: {
      email: senderEmail,
      name: senderName,
    },
  };

  if (input.listIds?.length) {
    createPayload.recipients = { listIds: input.listIds };
  }

  if (input.scheduledAt && !input.sendNow) {
    if (!input.listIds?.length) {
      throw new Error(
        "Brevo requires at least one list ID to schedule a marketing campaign. Add List IDs, or use Send test email."
      );
    }
    createPayload.scheduledAt = input.scheduledAt;
  }

  if (input.templateId) {
    createPayload.templateId = input.templateId;
  } else if (input.htmlContent) {
    createPayload.htmlContent = input.htmlContent;
  }

  const created = await brevo.emailCampaigns.createEmailCampaign(createPayload);

  if (input.sendNow) {
    if (!input.listIds?.length) {
      throw new Error(
        "Brevo requires at least one list ID to send a marketing campaign. Add List IDs, or use Send test email."
      );
    }
    await brevo.emailCampaigns.sendEmailCampaignNow({
      campaignId: created.id,
    });
    return {
      source: "brevo" as const,
      campaignId: String(created.id),
      status: "sending",
      message: "Campaign created and sent via Brevo.",
    };
  }

  return {
    source: "brevo" as const,
    campaignId: String(created.id),
    status: input.scheduledAt ? "scheduled" : "draft",
    message: input.scheduledAt
      ? "Campaign scheduled in Brevo."
      : "Campaign saved as draft in Brevo.",
  };
}
