import { getBrevoClient, getBrevoConfig, isBrevoConfigured } from "./client";
import {
  REAWAKEN_WELCOME_SUBJECT,
  REAWAKEN_WELCOME_TEMPLATE_NAME,
  REAWAKEN_WELCOME_TEMPLATE_TAG,
  buildReawakenWelcomeEmailHtml,
  getReawakenWelcomeTemplate,
} from "@/lib/reawaken/welcome-email";
import type { Template } from "@/lib/mock-data";
import { mapBrevoTemplate } from "./templates-shared";

export { getReawakenWelcomeTemplate };

function isReawakenTemplate(name: string, tag?: string) {
  const lower = name.toLowerCase();
  return (
    lower.includes("reawaken") ||
    tag?.toLowerCase() === REAWAKEN_WELCOME_TEMPLATE_TAG
  );
}

/** Find or create the canonical Reawaken welcome template in Brevo. */
export async function ensureReawakenWelcomeTemplate(): Promise<{
  template: Template;
  source: "brevo" | "demo";
  created: boolean;
  message: string;
}> {
  const local = getReawakenWelcomeTemplate();

  if (!isBrevoConfigured()) {
    return {
      template: local,
      source: "demo",
      created: false,
      message: "Brevo not connected — showing local Reawaken welcome template.",
    };
  }

  const brevo = getBrevoClient();
  const { senderEmail, senderName } = getBrevoConfig();
  const htmlContent = buildReawakenWelcomeEmailHtml();

  const listed = await brevo.transactionalEmails.getSmtpTemplates({
    limit: 50,
    sort: "desc",
  });

  const existing = (listed.templates ?? []).find(
    (t) =>
      t.name === REAWAKEN_WELCOME_TEMPLATE_NAME ||
      isReawakenTemplate(t.name, t.tag)
  );

  if (existing?.id) {
    await brevo.transactionalEmails.updateSmtpTemplate({
      templateId: existing.id,
      templateName: REAWAKEN_WELCOME_TEMPLATE_NAME,
      subject: REAWAKEN_WELCOME_SUBJECT,
      htmlContent,
      isActive: true,
      tag: REAWAKEN_WELCOME_TEMPLATE_TAG,
      sender: { email: senderEmail, name: senderName },
    });

    const refreshed = await brevo.transactionalEmails.getSmtpTemplate({
      templateId: existing.id,
    });

    return {
      template: mapBrevoTemplate(refreshed),
      source: "brevo",
      created: false,
      message: "Reawaken welcome template updated in Brevo.",
    };
  }

  const created = await brevo.transactionalEmails.createSmtpTemplate({
    templateName: REAWAKEN_WELCOME_TEMPLATE_NAME,
    subject: REAWAKEN_WELCOME_SUBJECT,
    htmlContent,
    isActive: true,
    tag: REAWAKEN_WELCOME_TEMPLATE_TAG,
    sender: { email: senderEmail, name: senderName },
  });

  const fresh = await brevo.transactionalEmails.getSmtpTemplate({
    templateId: created.id,
  });

  return {
    template: mapBrevoTemplate(fresh),
    source: "brevo",
    created: true,
    message: "Reawaken welcome template created in Brevo.",
  };
}

export async function listReawakenEmailTemplates(): Promise<{
  templates: Template[];
  source: "brevo" | "demo";
}> {
  if (!isBrevoConfigured()) {
    return { templates: [getReawakenWelcomeTemplate()], source: "demo" };
  }

  const brevo = getBrevoClient();
  const response = await brevo.transactionalEmails.getSmtpTemplates({
    limit: 50,
    sort: "desc",
  });

  let templates = (response.templates ?? [])
    .filter((t) => isReawakenTemplate(t.name, t.tag))
    .map(mapBrevoTemplate);

  if (templates.length === 0) {
    const ensured = await ensureReawakenWelcomeTemplate();
    templates = [ensured.template];
  }

  return { templates, source: "brevo" };
}
