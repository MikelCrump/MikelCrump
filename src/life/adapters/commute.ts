import { lifeEnv } from "@/life/config";
import { MOCK_COMMUTE } from "@/life/mock-data";
import type { CommuteSnapshot } from "@/life/types";

/** Simple trend model: weekday-aware leave windows until Maps ETA is wired. */
export async function getCommute(): Promise<CommuteSnapshot> {
  const cfg = lifeEnv();
  const destination = cfg.commuteDestination;
  const base = {
    ...MOCK_COMMUTE,
    destination,
    mode: (cfg.googleMapsApiKey ? "mock" : "unconfigured") as CommuteSnapshot["mode"],
  };

  if (cfg.forceMock || !cfg.googleMapsApiKey || !cfg.commuteOrigin) {
    return base;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", cfg.commuteOrigin);
    url.searchParams.set("destinations", destination);
    url.searchParams.set("departure_time", "now");
    url.searchParams.set("key", cfg.googleMapsApiKey);
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Maps ${res.status}`);
    const json = (await res.json()) as {
      rows?: Array<{
        elements?: Array<{
          duration_in_traffic?: { value: number; text: string };
          duration?: { value: number; text: string };
        }>;
      }>;
    };
    const el = json.rows?.[0]?.elements?.[0];
    const seconds = el?.duration_in_traffic?.value ?? el?.duration?.value;
    if (!seconds) throw new Error("no duration");
    const durationMin = Math.round(seconds / 60);
    const leave = new Date(Date.now() + 5 * 60_000);
    const arrive = new Date(leave.getTime() + seconds * 1000);
    const fmt = (d: Date) =>
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    return {
      destination,
      typicalLeave: MOCK_COMMUTE.typicalLeave,
      mode: "live",
      suggestions: [
        {
          leaveBy: fmt(leave),
          arriveBy: fmt(arrive),
          durationMin,
          confidence: "high",
          reason: "Live traffic from Google Distance Matrix + your usual buffer",
          trafficNote: el?.duration_in_traffic?.text ?? el?.duration?.text ?? `${durationMin} min`,
        },
        ...MOCK_COMMUTE.suggestions.slice(1),
      ],
    };
  } catch {
    return { ...base, mode: "mock" };
  }
}
