import type { Template } from "@/lib/mock-data";
import { emailTemplates as mockTemplates } from "@/lib/mock-data";
import { getBrevoClient, getBrevoConfig, isBrevoConfigured } from "./client";

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapBrevoTemplate(t: {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  tag?: string;
  modifiedAt: string;
  isActive: boolean;
}): Template {
  const preview = stripHtml(t.htmlContent).slice(0, 160);
  return {
    id: String(t.id),
    name: t.name,
    channel: "email",
    subject: t.subject,
    preview: preview || t.subject,
    body: t.htmlContent,
    category: t.tag || (t.isActive ? "Active" : "Inactive"),
    updatedAt: t.modifiedAt.slice(0, 10),
    usageCount: 0,
  };
}

export async function listEmailTemplates(options?: {
  activeOnly?: boolean;
}): Promise<{ templates: Template[]; source: "brevo" | "demo" }> {
  if (!isBrevoConfigured()) {
    return { templates: mockTemplates, source: "demo" };
  }

  const brevo = getBrevoClient();
  const response = await brevo.transactionalEmails.getSmtpTemplates({
    templateStatus: options?.activeOnly ? true : undefined,
    limit: 50,
    sort: "desc",
  });

  const templates = (response.templates ?? []).map(mapBrevoTemplate);
  return { templates, source: "brevo" };
}

export async function getEmailTemplate(
  id: string
): Promise<{ template: Template; source: "brevo" | "demo" } | null> {
  if (!isBrevoConfigured()) {
    const template = mockTemplates.find((t) => t.id === id);
    return template ? { template, source: "demo" } : null;
  }

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
        "Demo mode: template not saved to Brevo. Add BREVO_API_KEY to sync.",
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
    tag: input.tag,
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
      message:
        "Demo mode: template not updated in Brevo. Add BREVO_API_KEY to sync.",
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
    tag: input.tag,
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
