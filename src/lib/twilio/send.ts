import { getTwilioClient, getTwilioConfig, isTwilioConfigured } from "./client";

export interface SendSmsInput {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string[];
  scheduleType?: "fixed";
  sendAt?: Date;
}

function normalizeE164(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/\s+/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return trimmed.startsWith("+") ? trimmed : `+${digits}`;
}

export async function sendSms(input: SendSmsInput) {
  if (!input.to?.trim()) {
    throw new Error("Recipient phone number is required");
  }
  if (!input.body?.trim()) {
    throw new Error("Message body is required");
  }

  if (!isTwilioConfigured()) {
    return {
      source: "demo" as const,
      sid: `demo-${Date.now()}`,
      status: "queued",
      message:
        "Demo mode: SMS not sent. Add Twilio credentials to send via Twilio.",
    };
  }

  const twilio = getTwilioClient();
  const { phoneNumber, messagingServiceSid } = getTwilioConfig();
  const from = input.from || phoneNumber;

  if (!messagingServiceSid && !from) {
    throw new Error(
      "Set TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID to send SMS."
    );
  }

  const payload: Parameters<typeof twilio.messages.create>[0] = {
    to: normalizeE164(input.to),
    body: input.body,
  };

  if (messagingServiceSid) {
    payload.messagingServiceSid = messagingServiceSid;
  } else {
    payload.from = from;
  }

  if (input.mediaUrl?.length) {
    payload.mediaUrl = input.mediaUrl;
  }

  if (input.sendAt) {
    payload.scheduleType = "fixed";
    payload.sendAt = input.sendAt;
    if (!messagingServiceSid) {
      throw new Error(
        "Scheduled SMS requires TWILIO_MESSAGING_SERVICE_SID (Messaging Service)."
      );
    }
  }

  const message = await twilio.messages.create(payload);

  return {
    source: "twilio" as const,
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
    message: "SMS sent via Twilio.",
  };
}
