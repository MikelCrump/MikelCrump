import type { Template } from "@/lib/mock-data";

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapBrevoTemplate(t: {
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
