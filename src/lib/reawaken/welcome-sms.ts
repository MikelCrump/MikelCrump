import { brand } from "@/lib/brand";

export const REAWAKEN_WELCOME_SMS_NAME = "Reawaken — Welcome SMS";

export const REAWAKEN_WELCOME_SMS_BODY = `Welcome to ${brand.legalName}! We're glad you're here. Visit ${brand.website.replace("https://", "")} or sign in at Command Center. Reply STOP to opt out.`;

export function getReawakenWelcomeSmsTemplate() {
  return {
    id: "reawaken-welcome-sms",
    name: REAWAKEN_WELCOME_SMS_NAME,
    channel: "sms" as const,
    preview: REAWAKEN_WELCOME_SMS_BODY.slice(0, 120),
    body: REAWAKEN_WELCOME_SMS_BODY,
    category: "reawaken",
    updatedAt: new Date().toISOString().slice(0, 10),
    usageCount: 0,
  };
}
