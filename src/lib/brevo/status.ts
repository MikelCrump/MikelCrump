import { getBrevoClient, getBrevoConfig, isBrevoConfigured } from "./client";

export async function getBrevoConnectionStatus() {
  if (!isBrevoConfigured()) {
    return {
      connected: false,
      source: "demo" as const,
      message:
        "BREVO_API_KEY is not set. Add it to connect your Brevo account.",
      account: null,
      sender: {
        email: getBrevoConfig().senderEmail,
        name: getBrevoConfig().senderName,
      },
    };
  }

  try {
    const brevo = getBrevoClient();
    const account = await brevo.account.getAccount();

    return {
      connected: true,
      source: "brevo" as const,
      message: "Connected to Brevo",
      account: {
        email: account.email,
        companyName: account.companyName,
        plan: account.plan?.[0]?.type ?? null,
        credits: account.plan?.[0]?.credits ?? null,
      },
      sender: {
        email: getBrevoConfig().senderEmail,
        name: getBrevoConfig().senderName,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach Brevo API";
    return {
      connected: false,
      source: "error" as const,
      message,
      account: null,
      sender: {
        email: getBrevoConfig().senderEmail,
        name: getBrevoConfig().senderName,
      },
    };
  }
}
