import { listBrevoContactsWithPhone } from "@/lib/brevo/contacts";
import { isTwilioConfigured } from "./client";
import { sendSms } from "./send";

export interface BulkSmsInput {
  body: string;
  recipients?: string[];
  listId?: number;
  sendAt?: Date;
  maxRecipients?: number;
}

export interface BulkSmsResult {
  source: "twilio" | "demo";
  sent: number;
  failed: number;
  skipped: number;
  results: {
    to: string;
    status: "sent" | "failed" | "skipped";
    sid?: string;
    error?: string;
  }[];
  message: string;
}

const DEFAULT_MAX = 50;

export async function sendBulkSms(input: BulkSmsInput): Promise<BulkSmsResult> {
  const maxRecipients = Math.min(input.maxRecipients ?? DEFAULT_MAX, 100);
  let phones: string[] = [];

  if (input.recipients?.length) {
    phones = input.recipients;
  } else if (input.listId) {
    const { contacts, source } = await listBrevoContactsWithPhone({
      listId: input.listId,
      limit: maxRecipients,
    });
    if (source === "demo") {
      return {
        source: "demo",
        sent: 0,
        failed: 0,
        skipped: 0,
        results: [],
        message:
          "Demo mode: connect Brevo to load list contacts for bulk SMS.",
      };
    }
    phones = contacts
      .map((c) => c.phone)
      .filter((p): p is string => Boolean(p));
  }

  const unique = [...new Set(phones.map((p) => p.trim()).filter(Boolean))];
  const batch = unique.slice(0, maxRecipients);
  const skipped = unique.length - batch.length;

  if (batch.length === 0) {
    throw new Error(
      "No SMS-capable recipients found. Add phone numbers (SMS attribute) in Brevo."
    );
  }

  const results: BulkSmsResult["results"] = [];
  let sent = 0;
  let failed = 0;

  for (const to of batch) {
    try {
      const result = await sendSms({
        to,
        body: input.body,
        sendAt: input.sendAt,
        scheduleType: input.sendAt ? "fixed" : undefined,
      });
      if (result.source === "demo") {
        results.push({ to, status: "sent", sid: result.sid });
        sent++;
      } else {
        results.push({ to, status: "sent", sid: result.sid });
        sent++;
      }
    } catch (error) {
      failed++;
      results.push({
        to,
        status: "failed",
        error: error instanceof Error ? error.message : "Send failed",
      });
    }
  }

  const source: BulkSmsResult["source"] = isTwilioConfigured() ? "twilio" : "demo";

  return {
    source,
    sent,
    failed,
    skipped,
    results,
    message:
      source === "demo"
        ? `Demo mode: would send to ${batch.length} recipient(s).`
        : `Sent ${sent} SMS${failed ? `, ${failed} failed` : ""}${skipped ? `, ${skipped} skipped (cap ${maxRecipients})` : ""}.`,
  };
}
