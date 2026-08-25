import type { Contact } from "@/lib/mock-data";
import {
  getSupabaseAuthMode,
  getSupabaseClient,
  hasSupabaseServiceRole,
  isSupabaseConfigured,
} from "./client";

/** Command Center CRM + outreach tables that hold people we can message. */
export const CRM_CONTACT_SOURCES = [
  {
    table: "outreach_contacts",
    tag: "Outreach",
    nameKeys: ["full_name", "first_name", "last_name", "name"],
    emailKeys: ["email_normalized", "email"],
    phoneKeys: ["phone", "mobile", "phone_e164"],
  },
  {
    table: "crm_campus_contacts",
    tag: "Campus",
    nameKeys: ["contact_name", "name", "campus_name"],
    emailKeys: ["email"],
    phoneKeys: ["phone"],
  },
  {
    table: "crm_chapter_members",
    tag: "Chapter",
    nameKeys: ["name"],
    emailKeys: ["email"],
    phoneKeys: ["phone"],
  },
  {
    table: "crm_contributors",
    tag: "VIP",
    nameKeys: ["name"],
    emailKeys: ["email"],
    phoneKeys: ["phone"],
  },
  {
    table: "crm_donors",
    tag: "Donor",
    nameKeys: ["name"],
    emailKeys: ["email", "contact"],
    phoneKeys: ["phone"],
  },
  {
    table: "crm_influencers",
    tag: "Influencer",
    nameKeys: ["name"],
    emailKeys: ["email", "contact"],
    phoneKeys: ["phone"],
  },
  {
    table: "crm_organizations",
    tag: "Org",
    nameKeys: ["contact", "name"],
    emailKeys: ["email"],
    phoneKeys: ["phone"],
  },
  {
    table: "crm_staff",
    tag: "Staff",
    nameKeys: ["name"],
    emailKeys: ["contact", "email"],
    phoneKeys: ["phone"],
  },
] as const;

export type CrmSourceCount = {
  table: string;
  tag: string;
  count: number;
  error?: string;
};

function pickString(row: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  // first_name + last_name fallback
  const first = row.first_name;
  const last = row.last_name;
  if (typeof first === "string" || typeof last === "string") {
    return [first, last]
      .filter((v): v is string => typeof v === "string" && Boolean(v.trim()))
      .join(" ")
      .trim();
  }
  return "";
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function mapRowToContact(
  row: Record<string, unknown>,
  source: (typeof CRM_CONTACT_SOURCES)[number],
  index: number
): Contact | null {
  const email = pickString(row, source.emailKeys);
  const phone = pickString(row, source.phoneKeys) || undefined;
  const name =
    pickString(row, source.nameKeys) ||
    (email ? email.split("@")[0] : "") ||
    phone ||
    "";

  if (!email && !phone && !name) return null;

  const id =
    (typeof row.id === "string" && row.id) ||
    (typeof row.id === "number" && String(row.id)) ||
    `${source.table}-${index}`;

  const statusRaw = typeof row.status === "string" ? row.status.toLowerCase() : "";
  const status: Contact["status"] =
    statusRaw.includes("unsub") || statusRaw === "opted_out"
      ? "unsubscribed"
      : statusRaw.includes("bounce")
        ? "bounced"
        : "subscribed";

  const lastActivity =
    (typeof row.updated_at === "string" && row.updated_at) ||
    (typeof row.created_at === "string" && row.created_at) ||
    (typeof row.last_contact_date === "string" && row.last_contact_date) ||
    new Date().toISOString();

  return {
    id: `cc-${id}`,
    name: name || "Unknown",
    email: email || "",
    phone,
    source: "CRM",
    tags: [source.tag],
    status,
    lastActivity,
  };
}

async function countTable(table: string): Promise<{ count: number; error?: string }> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    return { count: 0, error: error.message };
  }
  return { count: count ?? 0 };
}

export async function getCrmSourceCounts(): Promise<CrmSourceCount[]> {
  if (!isSupabaseConfigured()) return [];

  const results = await Promise.all(
    CRM_CONTACT_SOURCES.map(async (source) => {
      const { count, error } = await countTable(source.table);
      return {
        table: source.table,
        tag: source.tag,
        count,
        error,
      };
    })
  );

  return results;
}

export async function getSupabaseContactCount(): Promise<number> {
  const counts = await getCrmSourceCounts();
  return counts.reduce((sum, row) => sum + row.count, 0);
}

export async function listSupabaseContacts(options?: {
  limit?: number;
}): Promise<{
  contacts: Contact[];
  total: number;
  source: "supabase" | "demo";
  authMode: "service_role" | "anon" | "none";
  bySource: CrmSourceCount[];
  needsServiceRole: boolean;
}> {
  const authMode = getSupabaseAuthMode();

  if (!isSupabaseConfigured()) {
    return {
      contacts: [],
      total: 0,
      source: "demo",
      authMode,
      bySource: [],
      needsServiceRole: true,
    };
  }

  const limit = options?.limit ?? 100;
  const perTable = Math.max(10, Math.ceil(limit / CRM_CONTACT_SOURCES.length));
  const supabase = getSupabaseClient();
  const bySource: CrmSourceCount[] = [];
  const mapped: Contact[] = [];

  for (const source of CRM_CONTACT_SOURCES) {
    const { data, error, count } = await supabase
      .from(source.table)
      .select("*", { count: "exact" })
      .limit(perTable);

    if (error) {
      bySource.push({
        table: source.table,
        tag: source.tag,
        count: 0,
        error: error.message,
      });
      continue;
    }

    bySource.push({
      table: source.table,
      tag: source.tag,
      count: count ?? data?.length ?? 0,
    });

    for (let i = 0; i < (data?.length ?? 0); i++) {
      const contact = mapRowToContact(
        data![i] as Record<string, unknown>,
        source,
        i
      );
      if (contact) mapped.push(contact);
    }
  }

  // Deduplicate by email (keep first / richest tags)
  const byEmail = new Map<string, Contact>();
  const noEmail: Contact[] = [];

  for (const contact of mapped) {
    if (!contact.email) {
      noEmail.push(contact);
      continue;
    }
    const key = normalizeEmail(contact.email);
    const existing = byEmail.get(key);
    if (!existing) {
      byEmail.set(key, contact);
      continue;
    }
    const tags = Array.from(new Set([...existing.tags, ...contact.tags]));
    byEmail.set(key, {
      ...existing,
      phone: existing.phone || contact.phone,
      tags,
    });
  }

  const contacts = [...byEmail.values(), ...noEmail]
    .sort(
      (a, b) =>
        Date.parse(b.lastActivity) - Date.parse(a.lastActivity) ||
        a.name.localeCompare(b.name)
    )
    .slice(0, limit);

  const total = bySource.reduce((sum, row) => sum + row.count, 0);
  const readable = total > 0 || bySource.some((s) => !s.error);
  const needsServiceRole =
    !hasSupabaseServiceRole() && total === 0 && readable;

  return {
    contacts,
    total,
    source: "supabase",
    authMode,
    bySource,
    needsServiceRole,
  };
}
