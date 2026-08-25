import { format, subDays } from "date-fns";
import {
  getBrevoClient,
  isBrevoConfigured,
} from "@/lib/brevo/client";
import { getBrevoContactCount } from "@/lib/brevo/contacts";
import { listEmailTemplates } from "@/lib/brevo/templates";
import { listEmailCampaigns } from "@/lib/brevo/campaigns";
import {
  getTwilioClient,
  isTwilioConfigured,
} from "@/lib/twilio/client";

export interface DashboardStats {
  emailsSent: number;
  emailsSentLabel: string;
  smsSent: number;
  smsSentLabel: string;
  openRate: number | null;
  openRateLabel: string;
  totalContacts: number;
  contactsLabel: string;
  emailTemplates: number;
  smsConnected: boolean;
  brevoConnected: boolean;
}

export interface PerformancePoint {
  date: string;
  emails: number;
  sms: number;
}

export interface ActivityItem {
  id: string;
  type: "campaign_sent" | "sms_scheduled" | "contact_added" | "automation_triggered";
  title: string;
  description: string;
  time: string;
}

function ymd(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function shortDate(d: string) {
  // d is YYYY-MM-DD
  const date = new Date(`${d}T12:00:00`);
  return format(date, "MMM d");
}

async function getEmailDailyStats(days: number) {
  if (!isBrevoConfigured()) {
    return { daily: [] as { date: string; requests: number; delivered: number; uniqueOpens: number }[], totalRequests: 0, totalDelivered: 0, totalUniqueOpens: 0 };
  }

  const brevo = getBrevoClient();
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  const report = await brevo.transactionalEmails.getSmtpReport({
    startDate: ymd(startDate),
    endDate: ymd(endDate),
    limit: 30,
  });

  const daily = (report.reports ?? []).map((r) => ({
    date: r.date,
    requests: r.requests ?? 0,
    delivered: r.delivered ?? 0,
    uniqueOpens: r.uniqueOpens ?? 0,
  }));

  return {
    daily,
    totalRequests: daily.reduce((s, d) => s + d.requests, 0),
    totalDelivered: daily.reduce((s, d) => s + d.delivered, 0),
    totalUniqueOpens: daily.reduce((s, d) => s + d.uniqueOpens, 0),
  };
}

async function getSmsDailyStats(days: number) {
  if (!isTwilioConfigured()) {
    return { daily: {} as Record<string, number>, total: 0 };
  }

  const twilio = getTwilioClient();
  const since = subDays(new Date(), days - 1);
  since.setHours(0, 0, 0, 0);

  // Pull a reasonable window of recent outbound messages
  const messages = await twilio.messages.list({
    dateSentAfter: since,
    limit: 1000,
  });

  const daily: Record<string, number> = {};
  let total = 0;
  for (const m of messages) {
    if (m.direction !== "outbound-api" && m.direction !== "outbound-call") continue;
    const when = m.dateSent || m.dateCreated;
    if (!when) continue;
    const key = ymd(when);
    daily[key] = (daily[key] || 0) + 1;
    total += 1;
  }

  return { daily, total };
}

export async function getDashboardData() {
  const days = 7;

  const [
    emailStats,
    smsStats,
    contactCount,
    templates,
    campaigns,
  ] = await Promise.all([
    getEmailDailyStats(days).catch(() => ({
      daily: [] as { date: string; requests: number; delivered: number; uniqueOpens: number }[],
      totalRequests: 0,
      totalDelivered: 0,
      totalUniqueOpens: 0,
    })),
    getSmsDailyStats(days).catch(() => ({
      daily: {} as Record<string, number>,
      total: 0,
    })),
    getBrevoContactCount().catch(() => 0),
    listEmailTemplates().catch(() => ({ templates: [], source: "demo" as const })),
    listEmailCampaigns().catch(() => ({ campaigns: [], source: "demo" as const })),
  ]);

  const openRate =
    emailStats.totalDelivered > 0
      ? Math.round(
          (emailStats.totalUniqueOpens / emailStats.totalDelivered) * 1000
        ) / 10
      : null;

  const stats: DashboardStats = {
    emailsSent: emailStats.totalRequests,
    emailsSentLabel: "last 7 days · Brevo",
    smsSent: smsStats.total,
    smsSentLabel: "last 7 days · Twilio",
    openRate,
    openRateLabel:
      openRate === null ? "no deliveries yet" : "last 7 days · Brevo",
    totalContacts: contactCount,
    contactsLabel: isBrevoConfigured() ? "from Brevo" : "not connected",
    emailTemplates: templates.templates.length,
    smsConnected: isTwilioConfigured(),
    brevoConnected: isBrevoConfigured(),
  };

  // Build continuous 7-day series
  const performance: PerformancePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = ymd(d);
    const emailDay = emailStats.daily.find((r) => r.date === key);
    performance.push({
      date: shortDate(key),
      emails: emailDay?.requests ?? 0,
      sms: smsStats.daily[key] ?? 0,
    });
  }

  const activity: ActivityItem[] = [];

  for (const c of campaigns.campaigns.slice(0, 5)) {
    activity.push({
      id: `camp-${c.id}`,
      type: "campaign_sent",
      title: c.name,
      description: `${c.status}${c.recipientCount ? ` · ${c.recipientCount.toLocaleString()} recipients` : ""} via Brevo`,
      time: c.sentAt || c.scheduledAt || "Recently",
    });
  }

  if (isTwilioConfigured()) {
    try {
      const twilio = getTwilioClient();
      const recentSms = await twilio.messages.list({ limit: 5 });
      for (const m of recentSms) {
        if (m.direction !== "outbound-api" && m.direction !== "outbound-call") continue;
        activity.push({
          id: m.sid,
          type: "sms_scheduled",
          title: (m.body || "SMS").slice(0, 48),
          description: `To ${m.to} · ${m.status}`,
          time: (m.dateSent || m.dateCreated)?.toISOString() || "Recently",
        });
      }
    } catch {
      // ignore
    }
  }

  // Sort activity by time desc when ISO dates
  activity.sort((a, b) => {
    const ta = Date.parse(a.time);
    const tb = Date.parse(b.time);
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return tb - ta;
  });

  return {
    stats,
    performance,
    activity: activity.slice(0, 8).map((item) => ({
      ...item,
      time: formatActivityTime(item.time),
    })),
  };
}

function formatActivityTime(value: string) {
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return value;
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return format(new Date(ts), "MMM d");
}
