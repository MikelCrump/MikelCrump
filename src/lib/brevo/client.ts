import { BrevoClient } from "@getbrevo/brevo";

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

export function getBrevoConfig() {
  return {
    apiKey: process.env.BREVO_API_KEY?.trim() ?? "",
    senderEmail:
      process.env.BREVO_SENDER_EMAIL?.trim() || "hello@yourcompany.com",
    senderName: process.env.BREVO_SENDER_NAME?.trim() || "ReachFlow",
  };
}

let client: BrevoClient | null = null;

export function getBrevoClient(): BrevoClient {
  const { apiKey } = getBrevoConfig();
  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY is not set. Add it in your environment secrets to connect Brevo."
    );
  }
  if (!client) {
    client = new BrevoClient({
      apiKey,
      timeoutInSeconds: 30,
      maxRetries: 2,
    });
  }
  return client;
}

export function resetBrevoClient() {
  client = null;
}
