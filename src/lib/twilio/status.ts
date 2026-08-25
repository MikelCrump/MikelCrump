import { getTwilioClient, getTwilioConfig, isTwilioConfigured } from "./client";

export async function getTwilioConnectionStatus() {
  if (!isTwilioConfigured()) {
    return {
      connected: false,
      source: "demo" as const,
      message:
        "Twilio credentials are not set. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.",
      account: null,
      phoneNumber: getTwilioConfig().phoneNumber || null,
    };
  }

  try {
    const twilio = getTwilioClient();
    const { accountSid, phoneNumber, messagingServiceSid } = getTwilioConfig();
    const account = await twilio.api.accounts(accountSid).fetch();

    const numbers = await twilio.incomingPhoneNumbers.list({ limit: 10 });
    const configuredNumber =
      phoneNumber ||
      numbers.find((n) => n.capabilities?.sms)?.phoneNumber ||
      numbers[0]?.phoneNumber ||
      null;

    return {
      connected: true,
      source: "twilio" as const,
      message: "Connected to Twilio",
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      },
      phoneNumber: configuredNumber,
      messagingServiceSid: messagingServiceSid || null,
      numbers: numbers.map((n) => ({
        sid: n.sid,
        phoneNumber: n.phoneNumber,
        friendlyName: n.friendlyName,
        sms: Boolean(n.capabilities?.sms),
      })),
    };
  } catch (error) {
    return {
      connected: false,
      source: "error" as const,
      message: error instanceof Error ? error.message : "Failed to reach Twilio",
      account: null,
      phoneNumber: getTwilioConfig().phoneNumber || null,
    };
  }
}
