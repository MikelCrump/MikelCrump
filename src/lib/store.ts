"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { buildSeedAttendees, seedEvents } from "./data";
import type {
  ArrivalEvent,
  Attendee,
  CheckInActivity,
  GuestType,
  KioskMode,
} from "./types";
import { generateId } from "./utils";

interface ArrivalState {
  events: ArrivalEvent[];
  attendees: Attendee[];
  activity: CheckInActivity[];
  selectedEventId: string | null;
  lastCheckedInId: string | null;
  setSelectedEvent: (id: string | null) => void;
  updateDeviceName: (eventId: string, name: string) => void;
  setKioskMode: (eventId: string, mode: KioskMode) => void;
  checkIn: (
    attendeeId: string,
    method: CheckInActivity["method"]
  ) => Attendee | null;
  undoCheckIn: (attendeeId: string) => void;
  registerWalkIn: (input: {
    eventId: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    title: string;
    guestType: GuestType;
  }) => Attendee;
  getEventAttendees: (eventId: string) => Attendee[];
  getEventStats: (eventId: string) => {
    registered: number;
    checkedIn: number;
    remaining: number;
    rate: number;
    byGuestType: Record<string, number>;
    recent: CheckInActivity[];
  };
}

export const useArrivalStore = create<ArrivalState>((set, get) => ({
  events: seedEvents,
  attendees: buildSeedAttendees(),
  activity: [],
  selectedEventId: seedEvents[0]?.id ?? null,
  lastCheckedInId: null,

  setSelectedEvent: (id) => set({ selectedEventId: id }),

  updateDeviceName: (eventId, name) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, deviceName: name } : e
      ),
    })),

  setKioskMode: (eventId, mode) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, kioskMode: mode } : e
      ),
    })),

  checkIn: (attendeeId, method) => {
    const current = get().attendees.find((a) => a.id === attendeeId);
    if (!current || current.status === "checked-in") return current ?? null;

    const at = new Date().toISOString();
    const activityEntry: CheckInActivity = {
      id: generateId(),
      attendeeId,
      eventId: current.eventId,
      at,
      method,
    };

    set((state) => ({
      attendees: state.attendees.map((a) =>
        a.id === attendeeId
          ? { ...a, status: "checked-in" as const, checkedInAt: at }
          : a
      ),
      events: state.events.map((e) =>
        e.id === current.eventId
          ? { ...e, checkedIn: e.checkedIn + 1 }
          : e
      ),
      activity: [activityEntry, ...state.activity].slice(0, 80),
      lastCheckedInId: attendeeId,
    }));

    return { ...current, status: "checked-in", checkedInAt: at };
  },

  undoCheckIn: (attendeeId) => {
    const current = get().attendees.find((a) => a.id === attendeeId);
    if (!current || current.status !== "checked-in") return;

    set((state) => ({
      attendees: state.attendees.map((a) =>
        a.id === attendeeId
          ? { ...a, status: "registered" as const, checkedInAt: undefined }
          : a
      ),
      events: state.events.map((e) =>
        e.id === current.eventId
          ? { ...e, checkedIn: Math.max(0, e.checkedIn - 1) }
          : e
      ),
      activity: state.activity.filter((x) => x.attendeeId !== attendeeId),
      lastCheckedInId:
        state.lastCheckedInId === attendeeId ? null : state.lastCheckedInId,
    }));
  },

  registerWalkIn: (input) => {
    const confirmationCode = `NS-W${Math.floor(1000 + Math.random() * 9000)}`;
    const event = get().events.find((e) => e.id === input.eventId);
    const attendee: Attendee = {
      id: generateId(),
      eventId: input.eventId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      company: input.company,
      title: input.title,
      guestType: input.guestType,
      status: "checked-in",
      confirmationCode,
      qrPayload: `northstar://${event?.slug ?? input.eventId}/checkin/${confirmationCode}`,
      checkedInAt: new Date().toISOString(),
      sessionIds: event?.sessions[0] ? [event.sessions[0].id] : [],
      badgeName: `${input.firstName} ${input.lastName.charAt(0)}.`,
    };

    const activityEntry: CheckInActivity = {
      id: generateId(),
      attendeeId: attendee.id,
      eventId: input.eventId,
      at: attendee.checkedInAt!,
      method: "walk-in",
    };

    set((state) => ({
      attendees: [attendee, ...state.attendees],
      events: state.events.map((e) =>
        e.id === input.eventId
          ? {
              ...e,
              registered: e.registered + 1,
              checkedIn: e.checkedIn + 1,
            }
          : e
      ),
      activity: [activityEntry, ...state.activity].slice(0, 80),
      lastCheckedInId: attendee.id,
    }));

    return attendee;
  },

  getEventAttendees: (eventId) =>
    get().attendees.filter((a) => a.eventId === eventId),

  getEventStats: (eventId) => {
    const list = get().attendees.filter((a) => a.eventId === eventId);
    const checkedIn = list.filter((a) => a.status === "checked-in").length;
    const registered = list.length;
    const byGuestType: Record<string, number> = {};
    for (const a of list.filter((x) => x.status === "checked-in")) {
      byGuestType[a.guestType] = (byGuestType[a.guestType] ?? 0) + 1;
    }
    return {
      registered,
      checkedIn,
      remaining: Math.max(0, registered - checkedIn),
      rate: registered ? Math.round((checkedIn / registered) * 100) : 0,
      byGuestType,
      recent: get().activity.filter((a) => a.eventId === eventId).slice(0, 12),
    };
  },
}));

export function useEventAttendees(eventId: string) {
  const attendees = useArrivalStore((s) => s.attendees);
  return useMemo(
    () => attendees.filter((a) => a.eventId === eventId),
    [attendees, eventId]
  );
}

export function useEventStats(eventId: string) {
  const attendees = useArrivalStore((s) => s.attendees);
  const activity = useArrivalStore((s) => s.activity);

  return useMemo(() => {
    const list = attendees.filter((a) => a.eventId === eventId);
    const checkedIn = list.filter((a) => a.status === "checked-in").length;
    const registered = list.length;
    const byGuestType: Record<string, number> = {};
    for (const a of list.filter((x) => x.status === "checked-in")) {
      byGuestType[a.guestType] = (byGuestType[a.guestType] ?? 0) + 1;
    }
    return {
      registered,
      checkedIn,
      remaining: Math.max(0, registered - checkedIn),
      rate: registered ? Math.round((checkedIn / registered) * 100) : 0,
      byGuestType,
      recent: activity.filter((a) => a.eventId === eventId).slice(0, 12),
    };
  }, [attendees, activity, eventId]);
}

export function useArrivalEvent(eventId: string) {
  return useArrivalStore((s) => s.events.find((e) => e.id === eventId));
}
