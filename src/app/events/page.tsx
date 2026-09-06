"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Plus, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useArrivalStore } from "@/lib/store";

export default function EventsPage() {
  const events = useArrivalStore((s) => s.events);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
            Event management
          </p>
          <h1 className="mt-1 font-display text-4xl text-ink">Events</h1>
          <p className="mt-2 max-w-xl text-ink-soft">
            Configure venues, sessions, kiosk modes, and check-in templates before
            doors open.
          </p>
        </div>
        <Button size="lg" variant="star">
          <Plus className="h-4 w-4" /> New event
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => {
          const rate = event.registered
            ? Math.round((event.checkedIn / event.registered) * 100)
            : 0;
          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="grid gap-4 rounded-[1.5rem] border border-line/80 bg-cloud p-4 transition-colors hover:border-sea/40 md:grid-cols-[220px_1fr_auto] md:p-5"
            >
              <div
                className="h-36 rounded-2xl bg-cover bg-center md:h-full md:min-h-[140px]"
                style={{ backgroundImage: `url(${event.cover})` }}
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={event.status === "live" ? "star" : "secondary"}
                  >
                    {event.status}
                  </Badge>
                  <Badge variant="outline">{event.format}</Badge>
                </div>
                <h2 className="mt-2 font-display text-2xl text-ink">
                  {event.title}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">{event.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {event.venue}, {event.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {event.checkedIn}/{event.registered} in · {rate}%
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink">
                  {format(new Date(event.startsAt), "EEE, MMM d · h:mm a")} –{" "}
                  {format(new Date(event.endsAt), "h:mm a")}
                </p>
              </div>
              <div className="flex items-center md:justify-end">
                <span className="rounded-xl bg-mist px-4 py-2 text-sm font-semibold text-sea">
                  Open workspace
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
