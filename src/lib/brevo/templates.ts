import type { Template } from "@/lib/mock-data";
import { getBrevoClient, getBrevoConfig, isBrevoConfigured } from "./client";
import { mapBrevoTemplate } from "./templates-shared";
import { listReawakenEmailTemplates } from "./welcome";

export async function listEmailTemplates(options?: {
  activeOnly?: boolean;
}): Promise<{ templates: Template[]; source: "brevo" | "demo" }> {
  const result = await listReawakenEmailTemplates();
  if (options?.activeOnly) {
    return {
      ...result,
      templates: result.templates.filter(
        (t) => t.category !== "Inactive"
      ),
    };
  }
  return result;
}

export async function getEmailTemplate(
  id: string
): Promise<{ template: Template; source: "brevo" | "demo" } | null> {
  const { templates, source } = await listReawakenEmailTemplates();
  const local = templates.find((t) => t.id === id);
  if (local) return { template: local, source };

  if (!isBrevoConfigured()) return null;

  const numericId = Number(id);
  if (Number.isNaN(numericId)) return null;

  const brevo = getBrevoClient();
  const response = await brevo.transactionalEmails.getSmtpTemplate({
    templateId: numericId,
  });

  return { template: mapBrevoTemplate(response), source: "brevo" };
}

export interface UpsertEmailTemplateInput {
  name: string;
  subject: string;
  htmlContent: string;
  tag?: string;
  isActive?: boolean;
  replyTo?: string;
}

export async function createEmailTemplate(input: UpsertEmailTemplateInput) {
  if (!isBrevoConfigured()) {
    return {
      source: "demo" as const,
      templateId: `demo-${Date.now()}`,
      message:
        "Connect Brevo to save templates. Use the Reawaken welcome template for new contacts.",
    };
  }

  if (input.htmlContent.trim().length < 10) {
    throw new Error("HTML content must be at least 10 characters");
  }

  const brevo = getBrevoClient();
  const { senderEmail, senderName } = getBrevoConfig();

  const created = await brevo.transactionalEmails.createSmtpTemplate({
    templateName: input.name,
    subject: input.subject,
    htmlContent: input.htmlContent,
    isActive: input.isActive ?? true,
    tag: input.tag ?? "reawaken",
    replyTo: input.replyTo,
    sender: {
      email: senderEmail,
      name: senderName,
    },
  });

  return {
    source: "brevo" as const,
    templateId: String(created.id),
    message: "Template created in Brevo.",
  };
}

export async function updateEmailTemplate(
  id: string,
  input: UpsertEmailTemplateInput
) {
  if (!isBrevoConfigured()) {
    return {
      source: "demo" as const,
      templateId: id,
      message: "Connect Brevo to update templates.",
    };
  }

  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid template ID");
  }

  if (input.htmlContent.trim().length < 10) {
    throw new Error("HTML content must be at least 10 characters");
  }

  const brevo = getBrevoClient();
  const { senderEmail, senderName } = getBrevoConfig();

  await brevo.transactionalEmails.updateSmtpTemplate({
    templateId: numericId,
    templateName: input.name,
    subject: input.subject,
    htmlContent: input.htmlContent,
    isActive: input.isActive ?? true,
    tag: input.tag ?? "reawaken",
    replyTo: input.replyTo,
    sender: {
      email: senderEmail,
      name: senderName,
    },
  });

  return {
    source: "brevo" as const,
    templateId: id,
    message: "Template updated in Brevo.",
  };
}
