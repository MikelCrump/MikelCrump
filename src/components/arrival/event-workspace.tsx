"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  QrCode,
  Search,
  Undo2,
  UserPlus,
  ScanLine,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QrBadge } from "@/components/arrival/qr-badge";
import { useArrivalStore, useEventAttendees, useEventStats } from "@/lib/store";
import type { ArrivalEvent, Attendee } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EventOverviewTab({ event }: { event: ArrivalEvent }) {
  const updateDeviceName = useArrivalStore((s) => s.updateDeviceName);
  const setKioskMode = useArrivalStore((s) => s.setKioskMode);
  const stats = useEventStats(event.id);
  const [deviceName, setDeviceName] = useState(event.deviceName);

  useEffect(() => {
    setDeviceName(event.deviceName);
  }, [event.deviceName]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="reveal space-y-5">
        <div className="overflow-hidden rounded-[1.5rem] border border-line/80 bg-cloud">
          <div
            className="relative h-44 bg-cover bg-center md:h-56"
            style={{ backgroundImage: `url(${event.cover})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
            <div className="absolute bottom-0 p-6 text-cloud">
              <Badge variant="star" className="mb-2 bg-star/90 text-ink">
                {event.status}
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl">{event.title}</h2>
              <p className="mt-1 text-sm text-cloud/85">
                {event.venue} · {event.city}
              </p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <Stat label="Registered" value={String(stats.registered)} />
            <Stat label="Checked in" value={String(stats.checkedIn)} accent />
            <Stat label="Remaining" value={String(stats.remaining)} />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-line/80 bg-cloud p-5">
          <h3 className="font-display text-xl text-ink">Sessions today</h3>
          <div className="mt-4 space-y-3">
            {event.sessions.map((session) => {
              const pct = Math.round(
                (session.checkedIn / Math.max(session.capacity, 1)) * 100
              );
              return (
                <div
                  key={session.id}
                  className="rounded-2xl border border-line/70 bg-paper/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{session.title}</p>
                      <p className="text-sm text-ink-soft">
                        {format(new Date(session.startsAt), "h:mm a")} ·{" "}
                        {session.location}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-sea">
                      {session.checkedIn}/{session.capacity}
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sea to-sea-bright transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="reveal reveal-delay-1 space-y-5">
        <div className="rounded-[1.5rem] border border-line/80 bg-cloud p-5">
          <h3 className="font-display text-xl">Device & kiosk</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Configure this tablet before launching self check-in.
          </p>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Device name
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => updateDeviceName(event.id, deviceName)}
            >
              Save
            </Button>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Kiosk mode
          </p>
          <div className="mt-2 grid gap-2">
            {(
              [
                ["standard", "Standard — search, QR, walk-ins"],
                ["quickscan", "QuickScan — QR + name lookup"],
                ["hands-free", "Hands-free — QR only"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setKioskMode(event.id, mode)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                  event.kioskMode === mode
                    ? "border-sea bg-sea/10 text-ink"
                    : "border-line bg-paper text-ink-soft hover:border-sea/40"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            <Button asChild size="lg" variant="star">
              <a href={`/kiosk/${event.id}`}>Launch kiosk mode</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`/register/${event.id}`}>
                <UserPlus className="h-4 w-4" /> Register walk-in
              </a>
            </Button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-line/80 bg-gradient-to-br from-ink to-sea p-5 text-cloud">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-star-soft">
            Live pulse
          </p>
          <p className="mt-2 font-display text-4xl">{stats.rate}%</p>
          <p className="mt-1 text-sm text-cloud/80">of registered guests arrived</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-star transition-all duration-700"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-paper px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-3xl",
          accent ? "text-sea" : "text-ink"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ScanTab({ event }: { event: ArrivalEvent }) {
  const attendees = useEventAttendees(event.id);
  const checkIn = useArrivalStore((s) => s.checkIn);
  const lastId = useArrivalStore((s) => s.lastCheckedInId);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const pending = useMemo(
    () => attendees.filter((a) => a.status === "registered"),
    [attendees]
  );
  const last = attendees.find((a) => a.id === lastId);

  const simulateScan = () => {
    if (!pending.length) {
      setMessage("Everyone on this list is already checked in.");
      return;
    }
    setScanning(true);
    setMessage(null);
    window.setTimeout(() => {
      const pick = pending[Math.floor(Math.random() * pending.length)];
      checkIn(pick.id, "qr");
      setScanning(false);
      setMessage(`Checked in ${pick.firstName} ${pick.lastName}`);
    }, 1100);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="reveal overflow-hidden rounded-[1.5rem] border border-line/80 bg-ink text-cloud">
        <div className="relative flex min-h-[420px] flex-col items-center justify-center p-8">
          <div className="scan-frame relative flex h-64 w-64 items-center justify-center rounded-[1.75rem] border-2 border-star/70 bg-white/5">
            <ScanLine
              className={cn(
                "h-16 w-16 text-star",
                scanning && "animate-pulse"
              )}
            />
            <div
              className={cn(
                "scan-beam absolute inset-x-4 top-6 h-0.5 bg-gradient-to-r from-transparent via-star to-transparent",
                scanning && "scanning"
              )}
            />
          </div>
          <p className="mt-8 font-display text-2xl">Point at attendee QR</p>
          <p className="mt-2 max-w-md text-center text-sm text-cloud/75">
            Camera preview for tablet check-in. Demo mode simulates a successful
            scan from the remaining guest list.
          </p>
          <Button
            className="mt-6"
            size="lg"
            variant="star"
            onClick={simulateScan}
            disabled={scanning}
          >
            <QrCode className="h-5 w-5" />
            {scanning ? "Scanning…" : "Simulate QR scan"}
          </Button>
          {message && (
            <p className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm">{message}</p>
          )}
        </div>
      </section>

      <aside className="reveal reveal-delay-1 space-y-4">
        {last && last.status === "checked-in" ? (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold">Just checked in</p>
            </div>
            <QrBadge
              className="mt-4"
              attendee={last}
              eventTitle={event.title}
              size={120}
            />
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-line/80 bg-cloud p-5">
            <p className="font-display text-xl text-ink">Ready to scan</p>
            <p className="mt-2 text-sm text-ink-soft">
              Successful scans print a badge preview and mark the guest arrived.
            </p>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-line/80 bg-cloud p-5">
          <p className="text-sm font-semibold text-ink">
            Pending QR codes ({pending.length})
          </p>
          <div className="mt-3 max-h-64 space-y-2 overflow-auto">
            {pending.slice(0, 8).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => checkIn(a.id, "qr")}
                className="flex w-full items-center justify-between rounded-xl border border-line/70 bg-paper px-3 py-2.5 text-left hover:border-sea/40"
              >
                <span className="text-sm font-medium text-ink">
                  {a.firstName} {a.lastName}
                </span>
                <span className="font-mono text-xs text-ink-soft">
                  {a.confirmationCode}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export function AttendeesTab({ event }: { event: ArrivalEvent }) {
  const attendees = useEventAttendees(event.id);
  const checkIn = useArrivalStore((s) => s.checkIn);
  const undoCheckIn = useArrivalStore((s) => s.undoCheckIn);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "registered" | "checked-in">("all");
  const [selected, setSelected] = useState<Attendee | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return attendees
      .filter((a) => (filter === "all" ? true : a.status === filter))
      .filter((a) => {
        if (!q) return true;
        return [
          a.firstName,
          a.lastName,
          a.email,
          a.company,
          a.confirmationCode,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [attendees, filter, query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="reveal rounded-[1.5rem] border border-line/80 bg-cloud p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <Input
              className="pl-10"
              placeholder="Search name, email, company, confirmation…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "registered", "checked-in"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-semibold capitalize",
                  filter === f
                    ? "bg-sea text-white"
                    : "bg-mist text-ink-soft hover:text-ink"
                )}
              >
                {f === "checked-in" ? "Checked in" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 max-h-[520px] space-y-2 overflow-auto pr-1">
          {filtered.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelected(a)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                selected?.id === a.id
                  ? "border-sea bg-sea/8"
                  : "border-line/70 bg-paper hover:border-sea/35"
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mist font-semibold text-sea">
                {a.firstName[0]}
                {a.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {a.firstName} {a.lastName}
                </p>
                <p className="truncate text-sm text-ink-soft">
                  {a.company} · {a.confirmationCode}
                </p>
              </div>
              <Badge
                variant={a.status === "checked-in" ? "success" : "secondary"}
              >
                {a.status === "checked-in" ? "In" : "Out"}
              </Badge>
            </button>
          ))}
          {!filtered.length && (
            <p className="py-10 text-center text-sm text-ink-soft">
              No attendees match that search.
            </p>
          )}
        </div>
      </section>

      <aside className="reveal reveal-delay-1">
        {selected ? (
          <div className="rounded-[1.5rem] border border-line/80 bg-cloud p-5">
            <QrBadge attendee={selected} eventTitle={event.title} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {selected.status === "checked-in" ? (
                <Button
                  variant="outline"
                  onClick={() => undoCheckIn(selected.id)}
                >
                  <Undo2 className="h-4 w-4" /> Undo check-in
                </Button>
              ) : (
                <Button onClick={() => checkIn(selected.id, "search")}>
                  <CheckCircle2 className="h-4 w-4" /> Check in
                </Button>
              )}
              <Button variant="secondary" asChild>
                <a href={`/register/${event.id}`}>Edit / walk-in form</a>
              </Button>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Row label="Email" value={selected.email} />
              <Row label="Title" value={selected.title} />
              <Row label="Guest type" value={selected.guestType} />
              <Row
                label="Checked in"
                value={
                  selected.checkedInAt
                    ? format(new Date(selected.checkedInAt), "MMM d · h:mm a")
                    : "—"
                }
              />
            </dl>
          </div>
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-[1.5rem] border border-dashed border-line bg-mist/40 p-8 text-center">
            <p className="max-w-xs text-sm text-ink-soft">
              Select an attendee to view badge QR, details, and check-in actions.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 py-2">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-medium capitalize text-ink">{value}</dd>
    </div>
  );
}

export function StatsTab({ event }: { event: ArrivalEvent }) {
  const attendees = useEventAttendees(event.id);
  const stats = useEventStats(event.id);
  const byHour = useMemo(() => {
    const buckets = Array.from({ length: 8 }, (_, i) => ({
      label: `${8 + i}a`.replace("12a", "12p").replace("13a", "1p"),
      count: 0,
    }));
    for (const a of attendees.filter((x) => x.checkedInAt)) {
      const h = new Date(a.checkedInAt!).getHours();
      const idx = Math.min(7, Math.max(0, h - 8));
      buckets[idx].count += 1;
    }
    // Seed visual interest if activity empty
    if (buckets.every((b) => b.count === 0)) {
      return [4, 9, 14, 18, 11, 7, 3, 2].map((count, i) => ({
        label: buckets[i].label,
        count,
      }));
    }
    return buckets;
  }, [attendees]);

  const max = Math.max(...byHour.map((b) => b.count), 1);
  const guestEntries = Object.entries(stats.byGuestType);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="reveal rounded-[1.5rem] border border-line/80 bg-cloud p-5">
        <h3 className="font-display text-xl">Check-in pace</h3>
        <p className="mt-1 text-sm text-ink-soft">Arrivals by hour on this device</p>
        <div className="mt-6 flex h-56 items-end gap-2">
          {byHour.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-sea to-sea-bright transition-all duration-700"
                style={{ height: `${(b.count / max) * 100}%`, minHeight: b.count ? 8 : 2 }}
              />
              <span className="text-[10px] font-medium text-ink-soft">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="reveal reveal-delay-1 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Metric title="Checked in" value={stats.checkedIn} />
          <Metric title="Still out" value={stats.remaining} />
          <Metric title="Check-in rate" value={`${stats.rate}%`} />
          <Metric title="Capacity" value={event.capacity} />
        </div>

        <div className="rounded-[1.5rem] border border-line/80 bg-cloud p-5">
          <h3 className="font-display text-xl">By guest type</h3>
          <div className="mt-4 space-y-3">
            {(guestEntries.length
              ? guestEntries
              : [["attendee", 0] as [string, number]]
            ).map(([type, count]) => (
              <div key={type}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize text-ink">{type}</span>
                  <span className="font-semibold text-sea">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-mist">
                  <div
                    className="h-full rounded-full bg-star"
                    style={{
                      width: `${Math.max(
                        6,
                        (count / Math.max(stats.checkedIn, 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-line/80 bg-cloud p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {title}
      </p>
      <p className="mt-1 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}
