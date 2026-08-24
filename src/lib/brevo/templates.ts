import type { Template } from "@/lib/mock-data";
import { emailTemplates as mockTemplates } from "@/lib/mock-data";
import { getBrevoClient, isBrevoConfigured } from "./client";

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
