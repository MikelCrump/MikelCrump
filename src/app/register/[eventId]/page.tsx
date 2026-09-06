"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WalkInForm } from "@/components/arrival/walk-in-form";
import { useArrivalStore } from "@/lib/store";

export default function RegisterPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const event = useArrivalStore((s) => s.events.find((e) => e.id === eventId));
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/events/${event.id}`}
          className="text-sm font-medium text-sea hover:underline"
        >
          ← Back to {event.title}
        </Link>
        <h1 className="mt-1 font-display text-4xl text-ink">Walk-in registration</h1>
        <p className="mt-2 text-ink-soft">
          Capture onsite guests, print a QR badge, and check them in immediately.
        </p>
      </div>
      <WalkInForm event={event} />
    </div>
  );
}
