import type {
  Base,
  Field,
  Form,
  Table,
  TableRecord,
  TeamMember,
  Workspace,
} from "./types";

export const DEMO_WORKSPACE: Workspace = {
  id: "ws-reawaken",
  name: "Reawaken USA",
};

export const DEMO_BASE: Base = {
  id: "base-pastors",
  name: "Pastor Partnerships",
  description: "Church leader sign-ups and campus partnership pipeline",
  color: "#2563eb",
  icon: "⛪",
  createdAt: "2026-01-15T10:00:00.000Z",
};

const pastorFields: Field[] = [
  { id: "f-first-name", name: "First Name", type: "text", required: true },
  { id: "f-last-name", name: "Last Name", type: "text" },
  { id: "f-email", name: "Email", type: "email", required: true },
  { id: "f-phone", name: "Phone", type: "phone" },
  {
    id: "f-church",
    name: "Church / Ministry",
    type: "text",
    required: true,
  },
  {
    id: "f-role",
    name: "Your Role",
    type: "singleSelect",
    options: [
      "Lead / Senior Pastor",
      "Associate Pastor",
      "Youth / College Pastor",
      "Elder / Deacon",
      "Ministry Leader",
      "Other",
    ],
  },
  {
    id: "f-congregation",
    name: "Congregation Size",
    type: "singleSelect",
    options: ["Under 100", "100-250", "250-500", "500-1,000", "1,000+"],
  },
  { id: "f-city", name: "City", type: "text" },
  { id: "f-state", name: "State", type: "text" },
  {
    id: "f-partnership",
    name: "How would you like to partner?",
    type: "multiSelect",
    options: [
      "Host a Campus Chapter",
      "Bring the Tour to Our Church",
      "Speaking / Preaching",
      "Prayer Support",
      "Mentor Students",
      "Financial Partnership",
    ],
  },
  {
    id: "f-notes",
    name: "Anything else?",
    type: "longText",
    description: "Optional",
  },
  {
    id: "f-sms-consent",
    name: "SMS Consent",
    type: "checkbox",
    description: "Agreed to receive recurring text messages",
  },
  { id: "f-status", name: "Status", type: "singleSelect", options: ["New", "Contacted", "In Progress", "Partnered"] },
  { id: "f-submitted", name: "Submitted At", type: "date" },
];

export const DEMO_TABLE: Table = {
  id: "tbl-pastors",
  baseId: DEMO_BASE.id,
  name: "Pastor Sign-ups",
  description: "Responses from the public partnership form",
  fields: pastorFields,
  views: [
    { id: "view-grid", name: "All submissions", type: "grid" },
    { id: "view-form", name: "Public form", type: "form" },
  ],
};

export const DEMO_FORM: Form = {
  id: "form-pastors",
  tableId: DEMO_TABLE.id,
  baseId: DEMO_BASE.id,
  name: "Partner With Us",
  description:
    "Tell us about your church and our team will reach out personally.",
  submitButtonText: "Connect With Our Team",
  successMessage:
    "Thank you! Our team will reach out to you personally within 2 business days.",
  fieldIds: [
    "f-first-name",
    "f-last-name",
    "f-email",
    "f-phone",
    "f-church",
    "f-role",
    "f-congregation",
    "f-city",
    "f-state",
    "f-partnership",
    "f-notes",
    "f-sms-consent",
  ],
  settings: {
    showLogo: true,
    primaryColor: "#2563eb",
    embedEnabled: true,
  },
  published: true,
};

export const DEMO_RECORDS: TableRecord[] = [
  {
    id: "rec-1",
    tableId: DEMO_TABLE.id,
    values: {
      "f-first-name": "James",
      "f-last-name": "Whitfield",
      "f-email": "jwhitfield@gracechurch.org",
      "f-phone": "(512) 555-0142",
      "f-church": "Grace Community Church",
      "f-role": "Lead / Senior Pastor",
      "f-congregation": "500-1,000",
      "f-city": "Austin",
      "f-state": "TX",
      "f-partnership": ["Host a Campus Chapter", "Mentor Students"],
      "f-notes": "We have 12 college-age members ready to launch.",
      "f-sms-consent": true,
      "f-status": "Contacted",
      "f-submitted": "2026-02-18",
    },
    createdAt: "2026-02-18T14:22:00.000Z",
    updatedAt: "2026-02-19T09:10:00.000Z",
  },
  {
    id: "rec-2",
    tableId: DEMO_TABLE.id,
    values: {
      "f-first-name": "Sarah",
      "f-last-name": "Chen",
      "f-email": "sarah.chen@newlife.org",
      "f-phone": "(404) 555-0198",
      "f-church": "New Life Fellowship",
      "f-role": "Youth / College Pastor",
      "f-congregation": "250-500",
      "f-city": "Atlanta",
      "f-state": "GA",
      "f-partnership": ["Bring the Tour to Our Church", "Speaking / Preaching"],
      "f-notes": "",
      "f-sms-consent": true,
      "f-status": "New",
      "f-submitted": "2026-03-01",
    },
    createdAt: "2026-03-01T11:05:00.000Z",
    updatedAt: "2026-03-01T11:05:00.000Z",
  },
  {
    id: "rec-3",
    tableId: DEMO_TABLE.id,
    values: {
      "f-first-name": "Marcus",
      "f-last-name": "Rivera",
      "f-email": "marcus@crosspoint.net",
      "f-phone": "(602) 555-0177",
      "f-church": "CrossPoint Ministries",
      "f-role": "Associate Pastor",
      "f-congregation": "1,000+",
      "f-city": "Phoenix",
      "f-state": "AZ",
      "f-partnership": ["Financial Partnership", "Prayer Support"],
      "f-notes": "Interested in Arizona State University campus.",
      "f-sms-consent": false,
      "f-status": "In Progress",
      "f-submitted": "2026-03-05",
    },
    createdAt: "2026-03-05T16:40:00.000Z",
    updatedAt: "2026-03-08T08:30:00.000Z",
  },
  {
    id: "rec-4",
    tableId: DEMO_TABLE.id,
    values: {
      "f-first-name": "Emily",
      "f-last-name": "Thompson",
      "f-email": "emily.t@harvest.org",
      "f-phone": "(615) 555-0133",
      "f-church": "Harvest Bible Church",
      "f-role": "Ministry Leader",
      "f-congregation": "100-250",
      "f-city": "Nashville",
      "f-state": "TN",
      "f-partnership": ["Host a Campus Chapter"],
      "f-notes": "Vanderbilt is 10 minutes from our church.",
      "f-sms-consent": true,
      "f-status": "Partnered",
      "f-submitted": "2026-01-28",
    },
    createdAt: "2026-01-28T09:15:00.000Z",
    updatedAt: "2026-02-10T14:00:00.000Z",
  },
];

export const DEMO_TEAM: TeamMember[] = [
  {
    id: "tm-1",
    email: "mikel@reawakenusa.org",
    name: "Mikel Crump",
    role: "owner",
    avatarColor: "#2563eb",
    invitedAt: "2025-11-01T00:00:00.000Z",
    status: "active",
  },
  {
    id: "tm-2",
    email: "ops@reawakenusa.org",
    name: "Operations Team",
    role: "admin",
    avatarColor: "#7c3aed",
    invitedAt: "2026-01-10T00:00:00.000Z",
    status: "active",
  },
  {
    id: "tm-3",
    email: "outreach@reawakenusa.org",
    name: "Outreach Lead",
    role: "editor",
    avatarColor: "#059669",
    invitedAt: "2026-02-01T00:00:00.000Z",
    status: "active",
  },
  {
    id: "tm-4",
    email: "volunteer@example.com",
    name: "New Volunteer",
    role: "viewer",
    avatarColor: "#d97706",
    invitedAt: "2026-03-10T00:00:00.000Z",
    status: "pending",
  },
];

export const EXTRA_BASE: Base = {
  id: "base-events",
  name: "Campus Events",
  description: "Tour dates, speaking engagements, and follow-ups",
  color: "#059669",
  icon: "🎤",
  createdAt: "2026-02-01T08:00:00.000Z",
};

export const EXTRA_TABLE: Table = {
  id: "tbl-events",
  baseId: EXTRA_BASE.id,
  name: "Events",
  fields: [
    { id: "f-event-name", name: "Event Name", type: "text", required: true },
    { id: "f-date", name: "Date", type: "date" },
    { id: "f-campus", name: "Campus", type: "text" },
    {
      id: "f-type",
      name: "Type",
      type: "singleSelect",
      options: ["Tour Stop", "Speaking", "Chapter Launch", "Training"],
    },
    {
      id: "f-status",
      name: "Status",
      type: "singleSelect",
      options: ["Planned", "Confirmed", "Completed", "Cancelled"],
    },
    { id: "f-attendees", name: "Expected Attendees", type: "number" },
  ],
  views: [{ id: "view-events-grid", name: "All events", type: "grid" }],
};

export const EXTRA_RECORDS: TableRecord[] = [
  {
    id: "rec-e1",
    tableId: EXTRA_TABLE.id,
    values: {
      "f-event-name": "UT Austin Campus Day",
      "f-date": "2026-04-12",
      "f-campus": "University of Texas at Austin",
      "f-type": "Tour Stop",
      "f-status": "Confirmed",
      "f-attendees": 350,
    },
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "rec-e2",
    tableId: EXTRA_TABLE.id,
    values: {
      "f-event-name": "Grace Church Chapter Launch",
      "f-date": "2026-04-20",
      "f-campus": "Austin Community College",
      "f-type": "Chapter Launch",
      "f-status": "Planned",
      "f-attendees": 80,
    },
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-02-20T00:00:00.000Z",
  },
];
