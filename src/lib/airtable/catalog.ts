import type { Base, Field, Table } from "@/lib/types";
import { DEMO_BASE, DEMO_TABLE } from "@/lib/seed-data";

export type AirtableSourceKey =
  | "pastors"
  | "events"
  | "volunteers"
  | "speaker_requests"
  | "contact_submissions"
  | "chapter_applications";

export type FieldMap =
  | { kind: "airtable"; airtable: string; fieldId: string }
  | { kind: "edge"; edge: string; fieldId: string }
  | {
      kind: "splitName";
      edge: string;
      firstFieldId: string;
      lastFieldId: string;
    }
  | { kind: "join"; airtable: string[]; fieldId: string; sep?: string }
  | { kind: "list"; airtable: string; fieldId: string }
  | { kind: "bool"; airtable: string; fieldId: string }
  | { kind: "date"; airtable: string; fieldId: string }
  | { kind: "edgeDate"; edge: string; fieldId: string };

export interface AirtableSource {
  key: AirtableSourceKey;
  label: string;
  /** Command Center edge function path (relative to /functions/v1/) */
  edgePath: string;
  edgeQuery?: Record<string, string>;
  baseId: string;
  tableId: string;
  airtableBaseId: string;
  airtableTableId: string;
  /** Prefer a dedicated token env; fall back to AIRTABLE_TOKEN */
  tokenEnv?: string;
  base: Omit<Base, "createdAt"> & { createdAt?: string };
  table: Omit<Table, "baseId"> & { baseId?: string };
  maps: FieldMap[];
}

const pastorFields: Field[] = DEMO_TABLE.fields;

const eventFields: Field[] = [
  { id: "ev-title", name: "Event Name", type: "text", required: true },
  { id: "ev-public", name: "Is Public", type: "checkbox" },
  { id: "ev-date", name: "Event Date", type: "date" },
  { id: "ev-start", name: "Start Time", type: "text" },
  { id: "ev-end", name: "End Time", type: "text" },
  { id: "ev-street", name: "Street Address", type: "text" },
  { id: "ev-location", name: "Location Name", type: "text" },
  { id: "ev-room", name: "Room", type: "text" },
  { id: "ev-loc-type", name: "Location Type", type: "text" },
  { id: "ev-campus", name: "Campus / University", type: "text" },
  {
    id: "ev-status",
    name: "Event Status",
    type: "singleSelect",
    options: ["Draft", "Published", "Cancelled", "Completed"],
  },
  { id: "ev-reg", name: "Registration Link", type: "url" },
  { id: "ev-desc", name: "Event Description", type: "longText" },
  { id: "ev-image", name: "Featured Image URL", type: "url" },
  { id: "ev-contact-name", name: "Contact Name", type: "text" },
  { id: "ev-contact-email", name: "Contact Email", type: "email" },
  { id: "ev-attendance", name: "Expected Attendance", type: "number" },
  { id: "ev-tags", name: "Tags", type: "multiSelect", options: [] },
  { id: "ev-notes", name: "Notes", type: "longText" },
];

const volunteerFields: Field[] = [
  { id: "vol-name", name: "Name", type: "text", required: true },
  { id: "vol-email", name: "Email", type: "email" },
  { id: "vol-phone", name: "Phone", type: "phone" },
  { id: "vol-availability", name: "Availability", type: "text" },
  { id: "vol-skills", name: "Skills", type: "multiSelect", options: [] },
  { id: "vol-interests", name: "Interests", type: "multiSelect", options: [] },
  {
    id: "vol-areas",
    name: "Areas of Support",
    type: "multiSelect",
    options: [],
  },
  {
    id: "vol-comms",
    name: "Communication Preferences",
    type: "multiSelect",
    options: [],
  },
  { id: "vol-status", name: "Status", type: "singleSelect", options: [] },
  {
    id: "vol-dept",
    name: "Department",
    type: "singleSelect",
    options: [
      "Campus",
      "Development",
      "Marketing",
      "General Operations",
      "Technology",
      "Productions",
    ],
  },
  { id: "vol-consent", name: "Consent", type: "checkbox" },
  { id: "vol-notes", name: "Notes", type: "longText" },
  { id: "vol-signup", name: "Signup At", type: "date" },
];

const speakerFields: Field[] = [
  { id: "spk-requester", name: "Requester Name", type: "text", required: true },
  { id: "spk-email", name: "Email", type: "email" },
  { id: "spk-phone", name: "Phone", type: "phone" },
  { id: "spk-chapter", name: "Chapter / Org", type: "text" },
  { id: "spk-speaker", name: "Speaker", type: "text" },
  { id: "spk-event-date", name: "Event Date", type: "date" },
  { id: "spk-event-type", name: "Event Type", type: "text" },
  { id: "spk-location", name: "Event Location / Campus", type: "text" },
  { id: "spk-info", name: "Additional Info", type: "longText" },
  { id: "spk-notes", name: "Notes", type: "longText" },
  {
    id: "spk-status",
    name: "Status",
    type: "singleSelect",
    options: ["Todo", "In Progress", "Done", "Declined"],
  },
  { id: "spk-submitted", name: "Submission Date", type: "date" },
  { id: "spk-viewed-by", name: "Viewed By", type: "text" },
  { id: "spk-viewed-at", name: "Viewed At", type: "date" },
];

const contactFields: Field[] = [
  { id: "ct-name", name: "Name", type: "text", required: true },
  { id: "ct-type", name: "Type", type: "singleSelect", options: ["General", "Media/Press"] },
  { id: "ct-email", name: "Email", type: "email" },
  { id: "ct-phone", name: "Phone", type: "phone" },
  { id: "ct-org", name: "Organization", type: "text" },
  { id: "ct-subject", name: "Subject", type: "text" },
  { id: "ct-deadline", name: "Deadline", type: "date" },
  { id: "ct-message", name: "Message", type: "longText" },
  { id: "ct-submitted", name: "Submitted", type: "date" },
  {
    id: "ct-status",
    name: "Status",
    type: "singleSelect",
    options: ["New", "In Progress", "Closed"],
  },
  { id: "ct-viewed-by", name: "Viewed By", type: "text" },
  { id: "ct-viewed-at", name: "Viewed At", type: "date" },
];

const chapterFields: Field[] = [
  { id: "ch-name", name: "Student Name", type: "text", required: true },
  { id: "ch-email", name: "Email", type: "email" },
  { id: "ch-phone", name: "Phone", type: "phone" },
  { id: "ch-school", name: "School Name", type: "text" },
  { id: "ch-city", name: "City", type: "text" },
  { id: "ch-state", name: "State", type: "text" },
  {
    id: "ch-status",
    name: "Recruitment Status",
    type: "singleSelect",
    options: [],
  },
];

/** All Command Center Airtable sources → Tables bases/tables. */
export const AIRTABLE_SOURCES: AirtableSource[] = [
  {
    key: "pastors",
    label: "Pastor Sign-ups",
    edgePath: "airtable-pastors",
    baseId: DEMO_BASE.id,
    tableId: DEMO_TABLE.id,
    airtableBaseId: "appZNV1eZYtXLL2fl",
    airtableTableId: "tblDW16vmSJFwGFEN",
    tokenEnv: "AIRTABLE_PASTORS_TOKEN",
    base: {
      id: DEMO_BASE.id,
      name: DEMO_BASE.name,
      description: DEMO_BASE.description,
      color: DEMO_BASE.color,
      icon: DEMO_BASE.icon,
    },
    table: {
      id: DEMO_TABLE.id,
      name: DEMO_TABLE.name,
      description: DEMO_TABLE.description,
      fields: pastorFields,
      views: DEMO_TABLE.views,
    },
    maps: [
      { kind: "airtable", airtable: "First Name", fieldId: "f-first-name" },
      { kind: "airtable", airtable: "Last Name", fieldId: "f-last-name" },
      {
        kind: "splitName",
        edge: "name",
        firstFieldId: "f-first-name",
        lastFieldId: "f-last-name",
      },
      { kind: "airtable", airtable: "Email", fieldId: "f-email" },
      { kind: "edge", edge: "email", fieldId: "f-email" },
      { kind: "airtable", airtable: "Phone", fieldId: "f-phone" },
      { kind: "edge", edge: "phone", fieldId: "f-phone" },
      { kind: "airtable", airtable: "Church / Ministry", fieldId: "f-church" },
      { kind: "edge", edge: "church", fieldId: "f-church" },
      { kind: "airtable", airtable: "Role", fieldId: "f-role" },
      { kind: "edge", edge: "role", fieldId: "f-role" },
      { kind: "airtable", airtable: "City", fieldId: "f-city" },
      { kind: "edge", edge: "city", fieldId: "f-city" },
      { kind: "airtable", airtable: "State", fieldId: "f-state" },
      { kind: "edge", edge: "state", fieldId: "f-state" },
      {
        kind: "airtable",
        airtable: "Congregation Size",
        fieldId: "f-congregation",
      },
      { kind: "edge", edge: "congregation_size", fieldId: "f-congregation" },
      { kind: "list", airtable: "Partnership Interest", fieldId: "f-partnership" },
      { kind: "edge", edge: "partnership_interest", fieldId: "f-partnership" },
      { kind: "airtable", airtable: "Message", fieldId: "f-notes" },
      { kind: "edge", edge: "message", fieldId: "f-notes" },
      { kind: "bool", airtable: "Consent", fieldId: "f-sms-consent" },
      { kind: "edge", edge: "consent", fieldId: "f-sms-consent" },
      { kind: "date", airtable: "Submitted", fieldId: "f-submitted" },
      { kind: "edgeDate", edge: "submitted_at", fieldId: "f-submitted" },
    ],
  },
  {
    key: "events",
    label: "Events",
    edgePath: "airtable-events",
    baseId: "base-events",
    tableId: "tbl-events",
    airtableBaseId: "app1kgBEQ6rLPjUIC",
    airtableTableId: "tblxWAOAWppvgm0gP",
    base: {
      id: "base-events",
      name: "Events",
      description: "Campus and tour events from Airtable",
      color: "#059669",
      icon: "📅",
    },
    table: {
      id: "tbl-events",
      name: "Events",
      description: "Synced from Airtable Events",
      fields: eventFields,
      views: [{ id: "view-events-grid", name: "All events", type: "grid" }],
    },
    maps: [
      { kind: "airtable", airtable: "Event Name", fieldId: "ev-title" },
      { kind: "edge", edge: "title", fieldId: "ev-title" },
      { kind: "bool", airtable: "Is Public", fieldId: "ev-public" },
      { kind: "edge", edge: "is_public", fieldId: "ev-public" },
      { kind: "date", airtable: "Event Date", fieldId: "ev-date" },
      { kind: "edgeDate", edge: "event_date", fieldId: "ev-date" },
      { kind: "airtable", airtable: "Start Time", fieldId: "ev-start" },
      { kind: "edge", edge: "start_time", fieldId: "ev-start" },
      { kind: "airtable", airtable: "End Time", fieldId: "ev-end" },
      { kind: "edge", edge: "end_time", fieldId: "ev-end" },
      { kind: "airtable", airtable: "Street Address", fieldId: "ev-street" },
      { kind: "edge", edge: "street_address", fieldId: "ev-street" },
      { kind: "airtable", airtable: "Location Name", fieldId: "ev-location" },
      { kind: "edge", edge: "location_name", fieldId: "ev-location" },
      {
        kind: "airtable",
        airtable: "Specific Location / Room",
        fieldId: "ev-room",
      },
      { kind: "edge", edge: "room", fieldId: "ev-room" },
      { kind: "airtable", airtable: "Location Type", fieldId: "ev-loc-type" },
      { kind: "edge", edge: "location_type", fieldId: "ev-loc-type" },
      { kind: "airtable", airtable: "Campus / University", fieldId: "ev-campus" },
      { kind: "edge", edge: "campus", fieldId: "ev-campus" },
      { kind: "airtable", airtable: "Event Status", fieldId: "ev-status" },
      { kind: "edge", edge: "status", fieldId: "ev-status" },
      {
        kind: "airtable",
        airtable: "Registration Link",
        fieldId: "ev-reg",
      },
      { kind: "edge", edge: "registration_link", fieldId: "ev-reg" },
      {
        kind: "airtable",
        airtable: "Event Description",
        fieldId: "ev-desc",
      },
      { kind: "edge", edge: "description", fieldId: "ev-desc" },
      {
        kind: "airtable",
        airtable: "Featured Image URL",
        fieldId: "ev-image",
      },
      { kind: "edge", edge: "featured_image", fieldId: "ev-image" },
      { kind: "airtable", airtable: "Contact Name", fieldId: "ev-contact-name" },
      { kind: "edge", edge: "contact_name", fieldId: "ev-contact-name" },
      {
        kind: "airtable",
        airtable: "Contact Email",
        fieldId: "ev-contact-email",
      },
      { kind: "edge", edge: "contact_email", fieldId: "ev-contact-email" },
      {
        kind: "airtable",
        airtable: "Expected Attendance",
        fieldId: "ev-attendance",
      },
      { kind: "edge", edge: "expected_attendance", fieldId: "ev-attendance" },
      { kind: "list", airtable: "Tags", fieldId: "ev-tags" },
      { kind: "edge", edge: "tags", fieldId: "ev-tags" },
      { kind: "airtable", airtable: "Notes", fieldId: "ev-notes" },
      { kind: "edge", edge: "notes", fieldId: "ev-notes" },
    ],
  },
  {
    key: "volunteers",
    label: "Volunteers",
    edgePath: "airtable-volunteers",
    baseId: "base-volunteers",
    tableId: "tbl-volunteers",
    airtableBaseId: "appXqtm3LyLrHzFc4",
    airtableTableId: "tblG3ulLN2MZ3eQ6X",
    tokenEnv: "AIRTABLE_VOLUNTEERS_TOKEN",
    base: {
      id: "base-volunteers",
      name: "Volunteers",
      description: "Volunteer sign-ups from Airtable",
      color: "#d97706",
      icon: "🙋",
    },
    table: {
      id: "tbl-volunteers",
      name: "Volunteer Sign-ups",
      description: "Synced from Airtable Volunteer Sign-Up",
      fields: volunteerFields,
      views: [{ id: "view-vol-grid", name: "All volunteers", type: "grid" }],
    },
    maps: [
      { kind: "airtable", airtable: "Name", fieldId: "vol-name" },
      { kind: "edge", edge: "name", fieldId: "vol-name" },
      { kind: "airtable", airtable: "Email", fieldId: "vol-email" },
      { kind: "edge", edge: "email", fieldId: "vol-email" },
      { kind: "airtable", airtable: "Phone", fieldId: "vol-phone" },
      { kind: "edge", edge: "phone", fieldId: "vol-phone" },
      { kind: "airtable", airtable: "Availability", fieldId: "vol-availability" },
      { kind: "edge", edge: "availability", fieldId: "vol-availability" },
      { kind: "list", airtable: "Skills", fieldId: "vol-skills" },
      { kind: "edge", edge: "skills", fieldId: "vol-skills" },
      { kind: "list", airtable: "Interests", fieldId: "vol-interests" },
      { kind: "edge", edge: "interests", fieldId: "vol-interests" },
      { kind: "list", airtable: "Areas of Support", fieldId: "vol-areas" },
      { kind: "edge", edge: "areas_of_support", fieldId: "vol-areas" },
      {
        kind: "list",
        airtable: "Communication Preferences",
        fieldId: "vol-comms",
      },
      { kind: "edge", edge: "communication_preferences", fieldId: "vol-comms" },
      { kind: "airtable", airtable: "Status", fieldId: "vol-status" },
      { kind: "edge", edge: "status", fieldId: "vol-status" },
      { kind: "airtable", airtable: "Department", fieldId: "vol-dept" },
      { kind: "edge", edge: "department", fieldId: "vol-dept" },
      { kind: "bool", airtable: "Consent", fieldId: "vol-consent" },
      { kind: "edge", edge: "consent", fieldId: "vol-consent" },
      { kind: "airtable", airtable: "Notes", fieldId: "vol-notes" },
      { kind: "edge", edge: "notes", fieldId: "vol-notes" },
      { kind: "date", airtable: "Signup Timestamp", fieldId: "vol-signup" },
      { kind: "edgeDate", edge: "signup_at", fieldId: "vol-signup" },
    ],
  },
  {
    key: "speaker_requests",
    label: "Speaker Requests",
    edgePath: "airtable-speaker-requests",
    baseId: "base-speakers",
    tableId: "tbl-speaker-requests",
    airtableBaseId: "app01STPbqmgj6Hfs",
    airtableTableId: "tbltsbbkZhqJZIj0l",
    base: {
      id: "base-speakers",
      name: "Speaker Requests",
      description: "Inbound speaker request forms",
      color: "#7c3aed",
      icon: "🎤",
    },
    table: {
      id: "tbl-speaker-requests",
      name: "Speaker Requests",
      description: "Synced from Airtable Speaker Request Forms",
      fields: speakerFields,
      views: [{ id: "view-spk-grid", name: "All requests", type: "grid" }],
    },
    maps: [
      { kind: "airtable", airtable: "Your Name", fieldId: "spk-requester" },
      { kind: "edge", edge: "requester_name", fieldId: "spk-requester" },
      { kind: "airtable", airtable: "Email", fieldId: "spk-email" },
      { kind: "edge", edge: "email", fieldId: "spk-email" },
      { kind: "airtable", airtable: "Phone", fieldId: "spk-phone" },
      { kind: "edge", edge: "phone", fieldId: "spk-phone" },
      { kind: "airtable", airtable: "Chapter / Org", fieldId: "spk-chapter" },
      { kind: "edge", edge: "chapter_org", fieldId: "spk-chapter" },
      { kind: "airtable", airtable: "Speaker", fieldId: "spk-speaker" },
      { kind: "edge", edge: "speaker", fieldId: "spk-speaker" },
      { kind: "date", airtable: "Event Date", fieldId: "spk-event-date" },
      { kind: "edgeDate", edge: "event_date", fieldId: "spk-event-date" },
      { kind: "airtable", airtable: "Event Type", fieldId: "spk-event-type" },
      { kind: "edge", edge: "event_type", fieldId: "spk-event-type" },
      {
        kind: "airtable",
        airtable: "Event Location / Campus",
        fieldId: "spk-location",
      },
      { kind: "edge", edge: "event_location", fieldId: "spk-location" },
      { kind: "airtable", airtable: "Additional Info", fieldId: "spk-info" },
      { kind: "edge", edge: "additional_info", fieldId: "spk-info" },
      { kind: "airtable", airtable: "Notes", fieldId: "spk-notes" },
      { kind: "edge", edge: "notes", fieldId: "spk-notes" },
      { kind: "airtable", airtable: "Status", fieldId: "spk-status" },
      { kind: "edge", edge: "status", fieldId: "spk-status" },
      { kind: "date", airtable: "Submission Date", fieldId: "spk-submitted" },
      { kind: "edgeDate", edge: "submission_date", fieldId: "spk-submitted" },
      { kind: "airtable", airtable: "Viewed By", fieldId: "spk-viewed-by" },
      { kind: "edge", edge: "viewed_by", fieldId: "spk-viewed-by" },
      { kind: "date", airtable: "Viewed At", fieldId: "spk-viewed-at" },
      { kind: "edgeDate", edge: "viewed_at", fieldId: "spk-viewed-at" },
    ],
  },
  {
    key: "contact_submissions",
    label: "Contact Submissions",
    edgePath: "airtable-forms",
    edgeQuery: { source: "contact_submissions" },
    baseId: "base-inbound",
    tableId: "tbl-contact",
    airtableBaseId: "app1kgBEQ6rLPjUIC",
    airtableTableId: "tblBtfdiVg8SN1opX",
    base: {
      id: "base-inbound",
      name: "Inbound Forms",
      description: "Website contact and chapter applications",
      color: "#0891b2",
      icon: "📥",
    },
    table: {
      id: "tbl-contact",
      name: "Contact Submissions",
      description: "Synced from website /contact form",
      fields: contactFields,
      views: [{ id: "view-ct-grid", name: "All contacts", type: "grid" }],
    },
    maps: [
      { kind: "airtable", airtable: "Name", fieldId: "ct-name" },
      { kind: "edge", edge: "name", fieldId: "ct-name" },
      { kind: "airtable", airtable: "Type", fieldId: "ct-type" },
      { kind: "edge", edge: "type", fieldId: "ct-type" },
      { kind: "airtable", airtable: "Email", fieldId: "ct-email" },
      { kind: "edge", edge: "email", fieldId: "ct-email" },
      { kind: "airtable", airtable: "Phone", fieldId: "ct-phone" },
      { kind: "edge", edge: "phone", fieldId: "ct-phone" },
      { kind: "airtable", airtable: "Organization", fieldId: "ct-org" },
      { kind: "edge", edge: "organization", fieldId: "ct-org" },
      { kind: "airtable", airtable: "Subject", fieldId: "ct-subject" },
      { kind: "edge", edge: "subject", fieldId: "ct-subject" },
      { kind: "date", airtable: "Deadline", fieldId: "ct-deadline" },
      { kind: "edgeDate", edge: "deadline", fieldId: "ct-deadline" },
      { kind: "airtable", airtable: "Message", fieldId: "ct-message" },
      { kind: "edge", edge: "message", fieldId: "ct-message" },
      { kind: "date", airtable: "Submitted", fieldId: "ct-submitted" },
      { kind: "edgeDate", edge: "submitted_at", fieldId: "ct-submitted" },
      { kind: "airtable", airtable: "Status", fieldId: "ct-status" },
      { kind: "edge", edge: "status", fieldId: "ct-status" },
      { kind: "airtable", airtable: "Viewed By", fieldId: "ct-viewed-by" },
      { kind: "edge", edge: "viewed_by", fieldId: "ct-viewed-by" },
      { kind: "date", airtable: "Viewed At", fieldId: "ct-viewed-at" },
      { kind: "edgeDate", edge: "viewed_at", fieldId: "ct-viewed-at" },
    ],
  },
  {
    key: "chapter_applications",
    label: "Chapter Applications",
    edgePath: "airtable-forms",
    edgeQuery: { source: "chapter_applications" },
    baseId: "base-inbound",
    tableId: "tbl-chapters",
    airtableBaseId: "apphnGWTt9ruId8Wl",
    airtableTableId: "tblo9aMhrdCQjk8Cw",
    base: {
      id: "base-inbound",
      name: "Inbound Forms",
      description: "Website contact and chapter applications",
      color: "#0891b2",
      icon: "📥",
    },
    table: {
      id: "tbl-chapters",
      name: "Chapter Applications",
      description: "Synced from website /chapters form",
      fields: chapterFields,
      views: [{ id: "view-ch-grid", name: "All applications", type: "grid" }],
    },
    maps: [
      { kind: "airtable", airtable: "Student Name", fieldId: "ch-name" },
      { kind: "edge", edge: "name", fieldId: "ch-name" },
      { kind: "airtable", airtable: "Email", fieldId: "ch-email" },
      { kind: "edge", edge: "email", fieldId: "ch-email" },
      { kind: "airtable", airtable: "Phone", fieldId: "ch-phone" },
      { kind: "edge", edge: "phone", fieldId: "ch-phone" },
      { kind: "airtable", airtable: "School Name", fieldId: "ch-school" },
      { kind: "edge", edge: "school", fieldId: "ch-school" },
      { kind: "airtable", airtable: "City", fieldId: "ch-city" },
      { kind: "edge", edge: "city", fieldId: "ch-city" },
      { kind: "airtable", airtable: "State", fieldId: "ch-state" },
      { kind: "edge", edge: "state", fieldId: "ch-state" },
      {
        kind: "airtable",
        airtable: "Recruitment Status",
        fieldId: "ch-status",
      },
      { kind: "edge", edge: "recruitment_status", fieldId: "ch-status" },
    ],
  },
];

export function getSource(key: string) {
  return AIRTABLE_SOURCES.find((s) => s.key === key);
}
