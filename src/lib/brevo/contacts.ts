import type { Contact } from "@/lib/mock-data";
import { getBrevoClient, isBrevoConfigured } from "./client";

export async function getBrevoContactCount(): Promise<number> {
  if (!isBrevoConfigured()) return 0;
  const brevo = getBrevoClient();
  const response = await brevo.contacts.getContacts({ limit: 1, offset: 0 });
  return response.count ?? 0;
}

export async function listBrevoContacts(options?: {
  limit?: number;
}): Promise<{ contacts: Contact[]; total: number; source: "brevo" | "demo" }> {
  if (!isBrevoConfigured()) {
    return { contacts: [], total: 0, source: "demo" };
  }

  const brevo = getBrevoClient();
  const limit = options?.limit ?? 50;
  const response = await brevo.contacts.getContacts({
    limit,
    offset: 0,
    sort: "desc",
  });

  const contacts: Contact[] = (response.contacts ?? []).map((c, index) => {
    const attrs = (c.attributes ?? {}) as Record<string, unknown>;
    const first =
      (attrs.FIRSTNAME as string | undefined) ||
      (attrs.FIRST_NAME as string | undefined) ||
      "";
    const last =
      (attrs.LASTNAME as string | undefined) ||
      (attrs.LAST_NAME as string | undefined) ||
      "";
    const name =
      [first, last].filter(Boolean).join(" ") ||
      c.email ||
      `Contact ${c.id ?? index + 1}`;
    const phone =
      (attrs.SMS as string | undefined) ||
      (attrs.WHATSAPP as string | undefined) ||
      undefined;

    return {
      id: String(c.id ?? c.email ?? index),
      name,
      email: c.email || "",
      phone,
      source: "CRM" as const,
      tags: (c.listIds ?? []).map((id) => `list:${id}`),
      status: c.emailBlacklisted || c.smsBlacklisted ? "unsubscribed" : "subscribed",
      lastActivity: c.modifiedAt || new Date().toISOString(),
    };
  });

  return {
    contacts,
    total: response.count ?? contacts.length,
    source: "brevo",
  };
}

export async function listBrevoContactsWithPhone(options?: {
  listId?: number;
  limit?: number;
}): Promise<{
  contacts: Contact[];
  total: number;
  source: "brevo" | "demo";
}> {
  if (!isBrevoConfigured()) {
    return { contacts: [], total: 0, source: "demo" };
  }

  const brevo = getBrevoClient();
  const limit = Math.min(options?.limit ?? 100, 500);
  const request: Parameters<typeof brevo.contacts.getContacts>[0] = {
    limit,
    offset: 0,
    sort: "desc",
  };

  if (options?.listId) {
    request.listIds = [options.listId];
  }

  const response = await brevo.contacts.getContacts(request);

  const contacts: Contact[] = (response.contacts ?? [])
    .map((c, index) => {
      const attrs = (c.attributes ?? {}) as Record<string, unknown>;
      const first =
        (attrs.FIRSTNAME as string | undefined) ||
        (attrs.FIRST_NAME as string | undefined) ||
        "";
      const last =
        (attrs.LASTNAME as string | undefined) ||
        (attrs.LAST_NAME as string | undefined) ||
        "";
      const name =
        [first, last].filter(Boolean).join(" ") ||
        c.email ||
        `Contact ${c.id ?? index + 1}`;
      const phone =
        (attrs.SMS as string | undefined) ||
        (attrs.WHATSAPP as string | undefined) ||
        undefined;

      return {
        id: String(c.id ?? c.email ?? index),
        name,
        email: c.email || "",
        phone,
        source: "CRM" as const,
        tags: (c.listIds ?? []).map((id) => `list:${id}`),
        status:
          c.emailBlacklisted || c.smsBlacklisted
            ? ("unsubscribed" as const)
            : ("subscribed" as const),
        lastActivity: c.modifiedAt || new Date().toISOString(),
      };
    })
    .filter((c) => Boolean(c.phone) && c.status === "subscribed");

  return {
    contacts,
    total: contacts.length,
    source: "brevo",
  };
}
