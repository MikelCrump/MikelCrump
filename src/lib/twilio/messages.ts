import type { Campaign, CampaignStatus } from "@/lib/mock-data";
import { campaigns as mockCampaigns } from "@/lib/mock-data";
import { getTwilioClient, isTwilioConfigured } from "./client";

function mapStatus(status: string): CampaignStatus {
  switch (status) {
    case "queued":
    case "accepted":
    case "sending":
    case "scheduled":
      return "sending";
    case "sent":
    case "delivered":
    case "read":
      return "sent";
    case "failed":
    case "undelivered":
    case "canceled":
      return "paused";
    default:
      return "draft";
  }
}

export async function listSmsCampaigns(): Promise<{
  campaigns: Campaign[];
  source: "twilio" | "demo";
}> {
  if (!isTwilioConfigured()) {
    return {
      campaigns: mockCampaigns.filter((c) => c.channel === "sms"),
      source: "demo",
    };
  }

  const twilio = getTwilioClient();
  const messages = await twilio.messages.list({ limit: 50 });

  const campaigns: Campaign[] = messages
    .filter((m) => m.direction === "outbound-api" || m.direction === "outbound-call")
    .map((m) => ({
      id: m.sid,
      name: (m.body || "SMS").slice(0, 48) + ((m.body?.length ?? 0) > 48 ? "…" : ""),
      channel: "sms" as const,
      templateId: "",
      templateName: "Direct SMS",
      status: mapStatus(m.status),
      audience: m.to || "—",
      recipientCount: 1,
      sentAt: m.dateSent?.toISOString() ?? m.dateCreated?.toISOString(),
      scheduledAt: undefined,
      deliveryRate: m.status === "delivered" ? 100 : m.status === "sent" ? 100 : undefined,
    }));

  return { campaigns, source: "twilio" };
}
