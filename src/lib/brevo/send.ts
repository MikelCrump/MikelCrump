import { getBrevoClient, getBrevoConfig, isBrevoConfigured } from "./client";

export interface SendTransactionalInput {
  to: { email: string; name?: string }[];
  subject?: string;
  htmlContent?: string;
  templateId?: number;
  params?: Record<string, string | number | boolean>;
  scheduledAt?: string;
}

export async function sendTransactionalEmail(input: SendTransactionalInput) {
  if (!input.to.length) {
    throw new Error("At least one recipient is required");
  }

  if (!input.templateId && !input.htmlContent) {
    throw new Error("Provide either templateId or htmlContent");
  }

  if (!isBrevoConfigured()) {
    return {
      source: "demo" as const,
      messageId: `demo-${Date.now()}`,
      message:
        "Demo mode: email not sent. Add BREVO_API_KEY to send via Brevo.",
    };
  }

  const brevo = getBrevoClient();
  const { senderEmail, senderName } = getBrevoConfig();

  const result = await brevo.transactionalEmails.sendTransacEmail({
    sender: { email: senderEmail, name: senderName },
    to: input.to,
    subject: input.subject,
    htmlContent: input.htmlContent,
    templateId: input.templateId,
    params: input.params,
    scheduledAt: input.scheduledAt,
  });

  return {
    source: "brevo" as const,
    messageId: result.messageId ?? result.messageIds?.[0] ?? "",
    message: "Transactional email sent via Brevo.",
  };
}
