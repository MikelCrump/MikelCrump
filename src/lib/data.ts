import type { ArrivalEvent, Attendee, CheckInTemplate } from "./types";

export const deviceProfile = {
  name: "Lobby iPad 01",
  operator: "Mikel Crump",
  role: "Operations",
};

export const templates: CheckInTemplate[] = [
  {
    id: "tpl-summit-badge",
    name: "Summit Badge",
    kind: "badge",
    description: "Large name + company with session QR on the reverse.",
    accent: "#1b6b6e",
    fields: ["Full name", "Company", "Guest type", "QR"],
    previewLabel: "Northstar Summit",
  },
  {
    id: "tpl-kiosk-welcome",
    name: "Kiosk Welcome",
    kind: "kiosk",
    description: "Self-serve welcome with search, QR, and walk-in register.",
    accent: "#d4a84b",
    fields: ["Event logo", "Search", "Scan CTA", "Register"],
    previewLabel: "Self check-in",
  },
  {
    id: "tpl-email-qr",
    name: "Confirmation QR",
    kind: "email-qr",
    description: "Email-ready QR pass attendees can scan at the door.",
    accent: "#132a3e",
    fields: ["Confirmation", "QR", "Event date"],
    previewLabel: "Email pass",
  },
  {
    id: "tpl-session-gate",
    name: "Session Gate",
    kind: "session-checkin",
    description: "Room-door check-in for breakouts with capacity meter.",
    accent: "#1f8a7c",
    fields: ["Session title", "Capacity", "QR / search"],
    previewLabel: "Breakout gate",
  },
];

export const seedEvents: ArrivalEvent[] = [
  {
    id: "evt-summit-26",
    slug: "northstar-summit-2026",
    title: "Northstar Summit 2026",
    subtitle: "Three days to recalibrate how teams learn and gather.",
    venue: "Colorado Convention Center",
    city: "Denver, CO",
    startsAt: "2026-10-14T09:00:00-06:00",
    endsAt: "2026-10-16T17:00:00-06:00",
    format: "hybrid",
    status: "live",
    cover:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
    capacity: 320,
    registered: 214,
    checkedIn: 86,
    deviceName: "Lobby iPad 01",
    templateId: "tpl-summit-badge",
    kioskMode: "standard",
    sessions: [
      {
        id: "s1",
        title: "Opening: Finding True North",
        startsAt: "2026-10-14T09:00:00-06:00",
        endsAt: "2026-10-14T10:30:00-06:00",
        location: "Main Hall",
        capacity: 320,
        checkedIn: 72,
      },
      {
        id: "s2",
        title: "Studio: Design a 6-week cohort",
        startsAt: "2026-10-14T13:00:00-06:00",
        endsAt: "2026-10-14T16:00:00-06:00",
        location: "Studio B",
        capacity: 60,
        checkedIn: 18,
      },
      {
        id: "s3",
        title: "Clinic: Hybrid attendance that holds",
        startsAt: "2026-10-15T10:00:00-06:00",
        endsAt: "2026-10-15T12:00:00-06:00",
        location: "Workshop 3",
        capacity: 48,
        checkedIn: 0,
      },
    ],
  },
  {
    id: "evt-field-lab",
    slug: "field-lab-austin",
    title: "Field Lab: Facilitation Under Pressure",
    subtitle: "One-day intensive for live session leaders.",
    venue: "Studio North",
    city: "Austin, TX",
    startsAt: "2026-06-04T08:30:00-05:00",
    endsAt: "2026-06-04T17:00:00-05:00",
    format: "in-person",
    status: "live",
    cover:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1600&q=80",
    capacity: 40,
    registered: 36,
    checkedIn: 12,
    deviceName: "Door Tablet A",
    templateId: "tpl-session-gate",
    kioskMode: "quickscan",
    sessions: [
      {
        id: "fl1",
        title: "Warm-up & room contracts",
        startsAt: "2026-06-04T08:30:00-05:00",
        endsAt: "2026-06-04T09:30:00-05:00",
        location: "Studio North",
        capacity: 40,
        checkedIn: 12,
      },
      {
        id: "fl2",
        title: "Scenario rounds",
        startsAt: "2026-06-04T10:00:00-05:00",
        endsAt: "2026-06-04T15:30:00-05:00",
        location: "Studio North",
        capacity: 40,
        checkedIn: 0,
      },
    ],
  },
  {
    id: "evt-office-hours",
    slug: "monthly-office-hours",
    title: "Office Hours: Learning Ops",
    subtitle: "Bring a stuck program. Leave with next steps.",
    venue: "Zoom",
    city: "Online",
    startsAt: "2026-05-12T12:00:00-04:00",
    endsAt: "2026-05-12T13:00:00-04:00",
    format: "virtual",
    status: "draft",
    cover:
      "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1600&q=80",
    capacity: 80,
    registered: 41,
    checkedIn: 0,
    deviceName: "Remote Host",
    templateId: "tpl-email-qr",
    kioskMode: "hands-free",
    sessions: [
      {
        id: "oh1",
        title: "Live clinic",
        startsAt: "2026-05-12T12:00:00-04:00",
        endsAt: "2026-05-12T13:00:00-04:00",
        location: "Zoom",
        capacity: 80,
        checkedIn: 0,
      },
    ],
  },
  {
    id: "evt-retreat",
    slug: "signal-retreat-maine",
    title: "Signal Retreat",
    subtitle: "A quiet week for curriculum builders.",
    venue: "Coastal House",
    city: "Camden, ME",
    startsAt: "2026-08-17T16:00:00-04:00",
    endsAt: "2026-08-21T11:00:00-04:00",
    format: "in-person",
    status: "draft",
    cover:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
    capacity: 7,
    registered: 7,
    checkedIn: 0,
    deviceName: "Retreat iPad",
    templateId: "tpl-kiosk-welcome",
    kioskMode: "standard",
    sessions: [
      {
        id: "rt1",
        title: "Arrival & intent setting",
        startsAt: "2026-08-17T16:00:00-04:00",
        endsAt: "2026-08-17T19:00:00-04:00",
        location: "House lounge",
        capacity: 7,
        checkedIn: 0,
      },
    ],
  },
];

const firstNames = [
  "Ava",
  "Noah",
  "Mia",
  "Liam",
  "Sofia",
  "Ethan",
  "Isla",
  "Owen",
  "Chloe",
  "Caleb",
  "Nora",
  "Jonas",
  "Aria",
  "Mira",
  "Leo",
  "Harper",
  "Grace",
  "Miles",
  "Elena",
  "Theo",
];

const lastNames = [
  "Nguyen",
  "Patel",
  "Brooks",
  "Kim",
  "Rivera",
  "Okoye",
  "Chen",
  "Walsh",
  "Garcia",
  "Singh",
  "Meyer",
  "Torres",
  "Ali",
  "Reed",
  "Park",
  "Hughes",
  "Diaz",
  "Bennett",
  "Shaw",
  "Cruz",
];

const companies = [
  "Reawaken USA",
  "Northstar Cohort",
  "Fieldline Ops",
  "Bright Harbor",
  "Summit Forge",
  "Learning Lattice",
  "Harbor & Co",
  "Signal Works",
];

const titles = [
  "Ops Lead",
  "Facilitator",
  "L&D Manager",
  "Program Director",
  "Event Producer",
  "Coach",
  "Founder",
  "Coordinator",
];

const guestTypes = ["attendee", "speaker", "staff", "vip", "press"] as const;

function code(n: number) {
  return `NS-${String(1000 + n)}`;
}

export function buildSeedAttendees(): Attendee[] {
  const attendees: Attendee[] = [];
  let n = 0;

  for (const event of seedEvents) {
    const count = Math.min(event.registered, 28);
    for (let i = 0; i < count; i++) {
      n += 1;
      const firstName = firstNames[(n + i) % firstNames.length];
      const lastName = lastNames[(n * 3 + i) % lastNames.length];
      const confirmationCode = code(n);
      const checkedIn = i < Math.floor(event.checkedIn * (count / Math.max(event.registered, 1)));
      attendees.push({
        id: `att-${event.id}-${i}`,
        eventId: event.id,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        company: companies[(n + i) % companies.length],
        title: titles[(n + i * 2) % titles.length],
        guestType: guestTypes[i % guestTypes.length],
        status: checkedIn ? "checked-in" : "registered",
        confirmationCode,
        qrPayload: `northstar://${event.slug}/checkin/${confirmationCode}`,
        checkedInAt: checkedIn
          ? new Date(Date.now() - (count - i) * 90_000).toISOString()
          : undefined,
        sessionIds: event.sessions.slice(0, 1 + (i % event.sessions.length)).map((s) => s.id),
        badgeName: `${firstName} ${lastName.charAt(0)}.`,
      });
    }
  }

  return attendees;
}
