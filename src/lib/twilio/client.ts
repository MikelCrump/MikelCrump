import twilio from "twilio";

export function isTwilioConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const apiKey = process.env.TWILIO_API_KEY?.trim();
  const apiSecret = process.env.TWILIO_API_SECRET?.trim();
  return Boolean(sid && (token || (apiKey && apiSecret)));
}

export function getTwilioConfig() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim() ?? "",
    apiKey: process.env.TWILIO_API_KEY?.trim() ?? "",
    apiSecret: process.env.TWILIO_API_SECRET?.trim() ?? "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER?.trim() ?? "",
    messagingServiceSid:
      process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() ?? "",
  };
}

let client: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (!isTwilioConfigured()) {
    throw new Error(
      "Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN (or API key + secret)."
    );
  }

  if (!client) {
    const { accountSid, authToken, apiKey, apiSecret } = getTwilioConfig();
    if (apiKey && apiSecret) {
      client = twilio(apiKey, apiSecret, { accountSid });
    } else {
      client = twilio(accountSid, authToken);
    }
  }

  return client;
}

export function resetTwilioClient() {
  client = null;
}
