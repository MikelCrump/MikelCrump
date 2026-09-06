"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { KioskScreen } from "@/components/arrival/kiosk-screen";
import { useArrivalStore } from "@/lib/store";

export default function KioskPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const event = useArrivalStore((s) => s.events.find((e) => e.id === eventId));
  if (!event) notFound();
  return <KioskScreen event={event} />;
}
