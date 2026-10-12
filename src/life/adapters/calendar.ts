import { lifeEnv } from "@/life/config";
import { MOCK_CALENDAR } from "@/life/mock-data";
import type { CalendarEvent, ConnectionMode } from "@/life/types";

export async function getCalendar(): Promise<{
  events: CalendarEvent[];
  mode: ConnectionMode;
}> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.googleCalendarAccessToken) {
    return {
      events: MOCK_CALENDAR,
      mode: cfg.googleCalendarAccessToken ? "mock" : "unconfigured",
    };
  }

  try {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.googleCalendarId)}/events`,
    );
    url.searchParams.set("timeMin", now.toISOString());
    url.searchParams.set("timeMax", end.toISOString());
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "12");

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cfg.googleCalendarAccessToken}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Calendar ${res.status}`);
    const json = (await res.json()) as {
      items?: Array<{
        summary?: string;
        location?: string;
        start?: { dateTime?: string; date?: string };
      }>;
    };

    const events: CalendarEvent[] = (json.items ?? []).map((item) => {
      const startIso = item.start?.dateTime ?? item.start?.date;
      const time = startIso
        ? new Date(startIso).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        : "All day";
      return {
        time,
        title: item.summary ?? "Untitled",
        where: item.location ?? "",
      };
    });

    return {
      events: events.length ? events : MOCK_CALENDAR,
      mode: "live",
    };
  } catch {
    return { events: MOCK_CALENDAR, mode: "mock" };
  }
}
