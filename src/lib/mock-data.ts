export type Channel = "email" | "sms";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "paused";

export type AutomationStatus = "active" | "paused" | "draft";

export interface Template {
  id: string;
  name: string;
  channel: Channel;
  subject?: string;
  preview: string;
  body: string;
  category: string;
  updatedAt: string;
  usageCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  templateId: string;
  templateName: string;
  status: CampaignStatus;
  audience: string;
  recipientCount: number;
  scheduledAt?: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
  deliveryRate?: number;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  trigger: string;
  steps: number;
  channel: Channel | "both";
  enrolled: number;
  completed: number;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: "ManyChat" | "CRM" | "Manual" | "Import";
  tags: string[];
  status: "subscribed" | "unsubscribed" | "bounced";
  lastActivity: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: "email" | "sms" | "crm" | "lead-gen";
  connected: boolean;
  logo: string;
}

export const emailTemplates: Template[] = [
  {
    id: "et-1",
    name: "Welcome Series — Day 1",
    channel: "email",
    subject: "Welcome to {{company_name}}, {{first_name}}!",
    preview: "We're thrilled to have you on board. Here's what to expect...",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #4f46e5;">Welcome, {{first_name}}!</h1>
  <p>We're thrilled to have you join {{company_name}}. Over the next few days, we'll share tips to help you get the most out of our platform.</p>
  <a href="#" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">Get Started</a>
  <p style="color: #64748b; font-size: 14px;">Questions? Reply to this email — we're here to help.</p>
</div>`,
    category: "Onboarding",
    updatedAt: "2026-08-20",
    usageCount: 1240,
  },
  {
    id: "et-2",
    name: "Appointment Reminder",
    channel: "email",
    subject: "Reminder: Your appointment on {{appointment_date}}",
    preview: "Hi {{first_name}}, this is a friendly reminder about your upcoming appointment...",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Appointment Reminder</h2>
  <p>Hi {{first_name}},</p>
  <p>This is a reminder that you have an appointment scheduled for <strong>{{appointment_date}}</strong> at <strong>{{appointment_time}}</strong>.</p>
  <p>Location: {{location}}</p>
  <a href="{{confirm_link}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Confirm Attendance</a>
</div>`,
    category: "Transactional",
    updatedAt: "2026-08-18",
    usageCount: 890,
  },
  {
    id: "et-3",
    name: "Monthly Newsletter",
    channel: "email",
    subject: "{{month}} Updates from {{company_name}}",
    preview: "Catch up on the latest news, tips, and exclusive offers this month...",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1>{{month}} Newsletter</h1>
  <p>Hi {{first_name}}, here's what's new this month:</p>
  <ul>
    <li>Feature spotlight: {{feature_name}}</li>
    <li>Customer success story</li>
    <li>Exclusive offer: {{promo_code}}</li>
  </ul>
</div>`,
    category: "Marketing",
    updatedAt: "2026-08-15",
    usageCount: 2100,
  },
  {
    id: "et-4",
    name: "Re-engagement Offer",
    channel: "email",
    subject: "We miss you, {{first_name}} — here's 20% off",
    preview: "It's been a while! Come back and enjoy an exclusive discount...",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>We miss you!</h2>
  <p>Hi {{first_name}}, it's been {{days_inactive}} days since your last visit. Use code <strong>COMEBACK20</strong> for 20% off your next order.</p>
</div>`,
    category: "Marketing",
    updatedAt: "2026-08-10",
    usageCount: 456,
  },
];

export const smsTemplates: Template[] = [
  {
    id: "st-1",
    name: "Appointment Reminder SMS",
    channel: "sms",
    preview: "Hi {{first_name}}, reminder: your appointment is {{appointment_date}} at {{appointment_time}}. Reply C to confirm.",
    body: "Hi {{first_name}}, reminder: your appointment is {{appointment_date}} at {{appointment_time}}. Reply C to confirm or R to reschedule.",
    category: "Transactional",
    updatedAt: "2026-08-19",
    usageCount: 3200,
  },
  {
    id: "st-2",
    name: "Lead Follow-up",
    channel: "sms",
    preview: "Hi {{first_name}}! Thanks for your interest in {{company_name}}. When's a good time to chat?",
    body: "Hi {{first_name}}! Thanks for your interest in {{company_name}}. When's a good time for a quick 10-min call? Reply with a time that works.",
    category: "Sales",
    updatedAt: "2026-08-17",
    usageCount: 1850,
  },
  {
    id: "st-3",
    name: "Order Shipped",
    channel: "sms",
    preview: "Your order #{{order_id}} has shipped! Track it here: {{tracking_url}}",
    body: "Your order #{{order_id}} has shipped! Track it here: {{tracking_url}}",
    category: "Transactional",
    updatedAt: "2026-08-14",
    usageCount: 5400,
  },
  {
    id: "st-4",
    name: "Flash Sale Alert",
    channel: "sms",
    preview: "🔥 {{first_name}}, 24hr flash sale! Use code {{promo_code}} for 30% off. Shop: {{link}}",
    body: "🔥 {{first_name}}, 24hr flash sale! Use code {{promo_code}} for 30% off. Shop now: {{link}} Reply STOP to opt out.",
    category: "Marketing",
    updatedAt: "2026-08-12",
    usageCount: 980,
  },
];

export const campaigns: Campaign[] = [
  {
    id: "c-1",
    name: "August Newsletter",
    channel: "email",
    templateId: "et-3",
    templateName: "Monthly Newsletter",
    status: "scheduled",
    audience: "All Subscribers",
    recipientCount: 8420,
    scheduledAt: "2026-08-25T09:00:00",
  },
  {
    id: "c-2",
    name: "Welcome Batch — Aug 24",
    channel: "email",
    templateId: "et-1",
    templateName: "Welcome Series — Day 1",
    status: "sent",
    audience: "New Signups (Last 7 Days)",
    recipientCount: 156,
    sentAt: "2026-08-24T08:00:00",
    openRate: 68.2,
    clickRate: 24.5,
  },
  {
    id: "c-3",
    name: "Monday Appointment Reminders",
    channel: "sms",
    templateId: "st-1",
    templateName: "Appointment Reminder SMS",
    status: "scheduled",
    audience: "Appointments This Week",
    recipientCount: 89,
    scheduledAt: "2026-08-25T07:30:00",
  },
  {
    id: "c-4",
    name: "ManyChat Lead Follow-ups",
    channel: "sms",
    templateId: "st-2",
    templateName: "Lead Follow-up",
    status: "sending",
    audience: "ManyChat Leads (Uncontacted)",
    recipientCount: 42,
    deliveryRate: 97.6,
  },
  {
    id: "c-5",
    name: "Re-engagement Q3",
    channel: "email",
    templateId: "et-4",
    templateName: "Re-engagement Offer",
    status: "draft",
    audience: "Inactive 30+ Days",
    recipientCount: 1205,
  },
];

export const automations: Automation[] = [
  {
    id: "a-1",
    name: "New Lead Welcome Journey",
    description: "ManyChat lead → welcome email → SMS follow-up after 2 days",
    status: "active",
    trigger: "ManyChat: New subscriber",
    steps: 4,
    channel: "both",
    enrolled: 342,
    completed: 289,
    updatedAt: "2026-08-22",
  },
  {
    id: "a-2",
    name: "Appointment Reminder Flow",
    description: "Email 48hrs before → SMS 24hrs before → SMS 2hrs before",
    status: "active",
    trigger: "CRM: Appointment booked",
    steps: 3,
    channel: "both",
    enrolled: 156,
    completed: 148,
    updatedAt: "2026-08-20",
  },
  {
    id: "a-3",
    name: "Abandoned Cart Recovery",
    description: "SMS after 1hr → email after 24hrs with discount",
    status: "paused",
    trigger: "CRM: Cart abandoned",
    steps: 2,
    channel: "both",
    enrolled: 89,
    completed: 34,
    updatedAt: "2026-08-18",
  },
  {
    id: "a-4",
    name: "Post-Purchase Thank You",
    description: "Thank you SMS immediately → review request email after 7 days",
    status: "draft",
    trigger: "CRM: Order completed",
    steps: 2,
    channel: "both",
    enrolled: 0,
    completed: 0,
    updatedAt: "2026-08-15",
  },
];

export const contacts: Contact[] = [
  {
    id: "ct-1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 234-5678",
    source: "ManyChat",
    tags: ["lead", "interested"],
    status: "subscribed",
    lastActivity: "2026-08-24T14:30:00",
  },
  {
    id: "ct-2",
    name: "Michael Chen",
    email: "mchen@company.io",
    phone: "+1 (555) 345-6789",
    source: "CRM",
    tags: ["customer", "vip"],
    status: "subscribed",
    lastActivity: "2026-08-24T11:15:00",
  },
  {
    id: "ct-3",
    name: "Emily Rodriguez",
    email: "emily.r@gmail.com",
    phone: "+1 (555) 456-7890",
    source: "ManyChat",
    tags: ["lead", "webinar"],
    status: "subscribed",
    lastActivity: "2026-08-23T16:45:00",
  },
  {
    id: "ct-4",
    name: "James Wilson",
    email: "jwilson@outlook.com",
    source: "Import",
    tags: ["prospect"],
    status: "subscribed",
    lastActivity: "2026-08-22T09:00:00",
  },
  {
    id: "ct-5",
    name: "Lisa Park",
    email: "lisa@startup.co",
    phone: "+1 (555) 567-8901",
    source: "CRM",
    tags: ["customer"],
    status: "unsubscribed",
    lastActivity: "2026-08-20T13:20:00",
  },
];

export const integrations: Integration[] = [
  {
    id: "brevo",
    name: "Brevo",
    description: "Send transactional and marketing emails, manage templates and contact lists.",
    category: "email",
    connected: false,
    logo: "B",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Send SMS messages, manage phone numbers, and track delivery status.",
    category: "sms",
    connected: false,
    logo: "T",
  },
  {
    id: "manychat",
    name: "ManyChat",
    description: "Capture leads from chatbots and sync subscribers to your contact lists.",
    category: "lead-gen",
    connected: true,
    logo: "M",
  },
  {
    id: "supabase",
    name: "Command Center CRM",
    description:
      "Reawaken Command Center Supabase CRM — donors, campus contacts, staff, outreach contacts, and more.",
    category: "crm",
    connected: false,
    logo: "S",
  },
  {
    id: "vercel",
    name: "Vercel CRM",
    description: "Connect your custom CRM API deployed on Vercel.",
    category: "crm",
    connected: false,
    logo: "V",
  },
];

export const dashboardStats = {
  emailsSent: 24850,
  emailsSentChange: 12.4,
  smsSent: 8320,
  smsSentChange: 8.7,
  openRate: 42.3,
  openRateChange: 2.1,
  activeAutomations: 2,
  totalContacts: 12480,
  contactsChange: 156,
};

export const performanceData = [
  { date: "Aug 18", emails: 3200, sms: 890 },
  { date: "Aug 19", emails: 4100, sms: 1120 },
  { date: "Aug 20", emails: 3800, sms: 980 },
  { date: "Aug 21", emails: 4500, sms: 1340 },
  { date: "Aug 22", emails: 2900, sms: 760 },
  { date: "Aug 23", emails: 5200, sms: 1580 },
  { date: "Aug 24", emails: 4800, sms: 1650 },
];

export const recentActivity = [
  {
    id: 1,
    type: "campaign_sent" as const,
    title: "Welcome Batch — Aug 24 sent",
    description: "156 emails delivered via Brevo",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "automation_triggered" as const,
    title: "New Lead Welcome Journey triggered",
    description: "Sarah Johnson enrolled from ManyChat",
    time: "3 hours ago",
  },
  {
    id: 3,
    type: "sms_scheduled" as const,
    title: "Monday Appointment Reminders scheduled",
    description: "89 SMS messages queued for Aug 25 at 7:30 AM",
    time: "5 hours ago",
  },
  {
    id: 4,
    type: "contact_added" as const,
    title: "12 new contacts synced",
    description: "Imported from ManyChat subscriber list",
    time: "Yesterday",
  },
];

export const audienceOptions = [
  "All Subscribers",
  "New Signups (Last 7 Days)",
  "ManyChat Leads (Uncontacted)",
  "Appointments This Week",
  "Inactive 30+ Days",
  "VIP Customers",
  "Custom Segment",
];

export const templateVariables = [
  "{{first_name}}",
  "{{last_name}}",
  "{{email}}",
  "{{phone}}",
  "{{company_name}}",
  "{{appointment_date}}",
  "{{appointment_time}}",
  "{{promo_code}}",
  "{{link}}",
];
