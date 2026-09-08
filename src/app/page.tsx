"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  QrCode,
  ShieldCheck,
  Sparkles,
  TabletSmartphone,
} from "lucide-react";
import { Crump360Wordmark } from "@/components/brand/crump360-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useArrivalStore } from "@/lib/store";

export default function HomePage() {
  const events = useArrivalStore((s) => s.events);
  const live = events.filter((e) => e.status === "live");
  const upcoming = events.filter((e) => e.status !== "live");

  return (
    <div className="space-y-10">
      <section className="reveal relative overflow-hidden rounded-2xl bg-navy px-6 py-10 text-cloud md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-blue/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-orange/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <Crump360Wordmark
            tone="light"
            animate
            markClassName="h-14 w-14"
            textClassName="text-4xl md:text-5xl"
          />
          <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
            Arrival — onsite check-in built for iPad
          </h1>
          <p className="mt-4 max-w-xl text-base text-cloud/75 md:text-lg">
            Run registrations, QR check-in, kiosk mode, badge templates, and live
            stats from one tablet workspace — tuned for CRUMP360 events.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="star">
              <Link href={live[0] ? `/events/${live[0].id}` : "/events"}>
                Open live event <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-cloud/85 hover:bg-white/10 hover:text-cloud"
            >
              <Link href="/templates">Browse templates</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="reveal reveal-delay-1 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: QrCode,
            title: "QR & search check-in",
            body: "Scan passes or find guests by name, company, or confirmation.",
          },
          {
            icon: TabletSmartphone,
            title: "Kiosk modes",
            body: "Standard, QuickScan, or hands-free self check-in locked to the device.",
          },
          {
            icon: ShieldCheck,
            title: "Ops-ready tabs",
            body: "Event, Scan, Attendees, and Stats — fast onsite flow for CRUMP360.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-line/80 bg-cloud/90 p-5"
          >
            <item.icon className="h-5 w-5 text-blue" />
            <p className="mt-3 font-display text-xl font-semibold text-navy">
              {item.title}
            </p>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="reveal reveal-delay-2">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">
              Live now
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold text-navy">
              Pick an event
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/events">Manage all</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {live.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group overflow-hidden rounded-2xl border border-line/80 bg-cloud transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div
                className="relative h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${event.cover})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-navy/75 to-transparent" />
                <Badge className="absolute left-4 top-4" variant="star">
                  Live
                </Badge>
              </div>
              <div className="p-5">
                <p className="font-display text-2xl font-semibold text-navy group-hover:text-blue">
                  {event.title}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {event.venue} · {format(new Date(event.startsAt), "MMM d, yyyy")}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-blue">
                    {event.checkedIn}/{event.registered} checked in
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-navy">
                    Open workspace <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="reveal reveal-delay-3">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange" />
            <h2 className="font-display text-2xl font-bold text-navy">Coming up</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center justify-between rounded-xl border border-line/80 bg-cloud px-5 py-4 hover:border-blue/40"
              >
                <div>
                  <p className="font-semibold text-navy">{event.title}</p>
                  <p className="text-sm text-muted">
                    {event.city} · {format(new Date(event.startsAt), "MMM d")}
                  </p>
                </div>
                <Badge variant="secondary">{event.status}</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
