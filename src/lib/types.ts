export type EventFormat = "in-person" | "hybrid" | "virtual";
export type EventStatus = "draft" | "live" | "completed" | "archived";
export type AttendeeStatus = "registered" | "checked-in" | "no-show" | "cancelled";
export type GuestType = "attendee" | "speaker" | "staff" | "vip" | "press";
export type TemplateKind = "badge" | "kiosk" | "email-qr" | "session-checkin";
export type KioskMode = "standard" | "quickscan" | "hands-free";

export interface EventSession {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number;
  checkedIn: number;
}

export interface ArrivalEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  venue: string;
  city: string;
  startsAt: string;
  endsAt: string;
  format: EventFormat;
  status: EventStatus;
  cover: string;
  capacity: number;
  registered: number;
  checkedIn: number;
  deviceName: string;
  sessions: EventSession[];
  templateId: string;
  kioskMode: KioskMode;
}

export interface Attendee {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  guestType: GuestType;
  status: AttendeeStatus;
  confirmationCode: string;
  qrPayload: string;
  checkedInAt?: string;
  sessionIds: string[];
  badgeName?: string;
}

export interface CheckInTemplate {
  id: string;
  name: string;
  kind: TemplateKind;
  description: string;
  accent: string;
  fields: string[];
  previewLabel: string;
}

export interface CheckInActivity {
  id: string;
  attendeeId: string;
  eventId: string;
  at: string;
  method: "search" | "qr" | "kiosk" | "walk-in";
}
