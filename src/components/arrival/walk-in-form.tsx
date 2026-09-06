"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useArrivalStore } from "@/lib/store";
import type { ArrivalEvent, GuestType } from "@/lib/types";
import { QrBadge } from "@/components/arrival/qr-badge";

const guestTypes: GuestType[] = [
  "attendee",
  "speaker",
  "staff",
  "vip",
  "press",
];

export function WalkInForm({ event }: { event: ArrivalEvent }) {
  const registerWalkIn = useArrivalStore((s) => s.registerWalkIn);
  const router = useRouter();
  const [doneId, setDoneId] = useState<string | null>(null);
  const attendees = useArrivalStore((s) => s.attendees);
  const created = attendees.find((a) => a.id === doneId);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    title: "",
    guestType: "attendee" as GuestType,
  });

  if (created) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <p className="font-semibold">Registered & checked in</p>
          <p className="mt-1 text-sm">Badge preview is ready to print.</p>
        </div>
        <QrBadge className="mt-5" attendee={created} eventTitle={event.title} />
        <div className="mt-5 flex gap-3">
          <Button onClick={() => setDoneId(null)}>Register another</Button>
          <Button variant="outline" onClick={() => router.push(`/events/${event.id}`)}>
            Back to event
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="mx-auto max-w-2xl space-y-5 rounded-[1.5rem] border border-line/80 bg-cloud p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const attendee = registerWalkIn({ eventId: event.id, ...form });
        setDoneId(attendee.id);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <Input
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </Field>
        <Field label="Last name">
          <Input
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Company">
          <Input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </Field>
        <Field label="Title">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>
        <Field label="Guest type">
          <select
            className="flex h-12 w-full rounded-xl border border-line bg-cloud px-4 text-base text-ink"
            value={form.guestType}
            onChange={(e) =>
              setForm({ ...form, guestType: e.target.value as GuestType })
            }
          >
            {guestTypes.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Register & check in
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </Label>
      {children}
    </div>
  );
}
