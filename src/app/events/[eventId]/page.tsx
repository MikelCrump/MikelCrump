"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  QrCode,
  Users,
} from "lucide-react";
import {
  AttendeesTab,
  EventOverviewTab,
  ScanTab,
  StatsTab,
} from "@/components/arrival/event-workspace";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useArrivalStore } from "@/lib/store";

export default function EventWorkspacePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const event = useArrivalStore((s) => s.events.find((e) => e.id === eventId));

  if (!event) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/events"
            className="text-sm font-medium text-sea hover:underline"
          >
            ← All events
          </Link>
          <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
            {event.title}
          </h1>
          <p className="text-sm text-ink-soft">
            Device: {event.deviceName} · Kiosk: {event.kioskMode}
          </p>
        </div>
      </div>

      <Tabs defaultValue="event" className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="event">
            <CalendarDays className="h-4 w-4" /> Event
          </TabsTrigger>
          <TabsTrigger value="scan">
            <QrCode className="h-4 w-4" /> Scan
          </TabsTrigger>
          <TabsTrigger value="attendees">
            <Users className="h-4 w-4" /> Attendees
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4" /> Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event">
          <EventOverviewTab event={event} />
        </TabsContent>
        <TabsContent value="scan">
          <ScanTab event={event} />
        </TabsContent>
        <TabsContent value="attendees">
          <AttendeesTab event={event} />
        </TabsContent>
        <TabsContent value="stats">
          <StatsTab event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
