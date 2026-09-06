"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  QrCode,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NorthstarMark } from "@/components/brand/northstar-mark";
import { QrBadge } from "@/components/arrival/qr-badge";
import { useArrivalStore, useEventAttendees } from "@/lib/store";
import type { ArrivalEvent, Attendee } from "@/lib/types";
import { cn } from "@/lib/utils";

export function KioskScreen({ event }: { event: ArrivalEvent }) {
  const attendees = useEventAttendees(event.id);
  const checkIn = useArrivalStore((s) => s.checkIn);
  const [view, setView] = useState<"home" | "search" | "scan" | "success">(
    "home"
  );
  const [query, setQuery] = useState("");
  const [success, setSuccess] = useState<Attendee | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [scanPulse, setScanPulse] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return attendees
      .filter((a) =>
        [a.firstName, a.lastName, a.email, a.confirmationCode, a.company]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 8);
  }, [attendees, query]);

  const complete = (attendee: Attendee, method: "search" | "qr" | "kiosk") => {
    const updated = checkIn(attendee.id, method) ?? attendee;
    setSuccess(updated);
    setView("success");
  };

  const simulateScan = () => {
    const pending = attendees.filter((a) => a.status === "registered");
    if (!pending.length) return;
    setScanPulse(true);
    window.setTimeout(() => {
      const pick = pending[Math.floor(Math.random() * pending.length)];
      setScanPulse(false);
      complete(pick, "qr");
    }, 900);
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink text-cloud">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sea-bright/40 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-star/25 blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <NorthstarMark className="h-10 w-10" animate />
          <div>
            <p className="font-display text-2xl">Northstar</p>
            <p className="text-sm text-cloud/70">{event.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPinOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-cloud/80 hover:bg-white/10"
        >
          <Lock className="h-4 w-4" /> Admin
        </button>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-88px)] max-w-5xl flex-col px-6 pb-10 md:px-10">
        {view === "home" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.18em] text-star-soft">
              Welcome · self check-in
            </p>
            <h1 className="reveal reveal-delay-1 mt-4 max-w-2xl font-display text-4xl leading-tight md:text-6xl">
              Find your name or scan your QR pass
            </h1>
            <p className="reveal reveal-delay-2 mt-4 max-w-lg text-base text-cloud/75 md:text-lg">
              {event.venue} · {event.city}. Mode: {event.kioskMode}.
            </p>
            <div className="reveal reveal-delay-3 mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
              {event.kioskMode !== "hands-free" && (
                <Button
                  size="xl"
                  variant="star"
                  className="h-24 text-xl"
                  onClick={() => setView("search")}
                >
                  <Search className="h-6 w-6" /> Search my name
                </Button>
              )}
              <Button
                size="xl"
                variant="secondary"
                className={cn(
                  "h-24 border-0 bg-white/10 text-xl text-cloud hover:bg-white/15",
                  event.kioskMode === "hands-free" && "sm:col-span-2"
                )}
                onClick={() => setView("scan")}
              >
                <QrCode className="h-6 w-6" /> Scan QR code
              </Button>
            </div>
            {event.kioskMode === "standard" && (
              <Button asChild variant="ghost" className="mt-8 text-cloud/80">
                <Link href={`/register/${event.id}`}>
                  <UserPlus className="h-4 w-4" /> New registration
                </Link>
              </Button>
            )}
          </div>
        )}

        {view === "search" && (
          <div className="mx-auto w-full max-w-2xl flex-1 py-6">
            <button
              type="button"
              onClick={() => setView("home")}
              className="mb-6 text-sm text-cloud/70 hover:text-cloud"
            >
              ← Back
            </button>
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your first or last name"
              className="h-16 border-white/15 bg-white/10 text-xl text-cloud placeholder:text-cloud/45"
            />
            <div className="mt-4 space-y-2">
              {results.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => complete(a, "search")}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left hover:bg-white/10"
                >
                  <div>
                    <p className="text-lg font-semibold">
                      {a.firstName} {a.lastName}
                    </p>
                    <p className="text-sm text-cloud/65">{a.company}</p>
                  </div>
                  <BadgeStatus status={a.status} />
                </button>
              ))}
              {query && !results.length && (
                <p className="py-8 text-center text-cloud/65">
                  No match — try another spelling or ask staff.
                </p>
              )}
            </div>
          </div>
        )}

        {view === "scan" && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setView("home")}
              className="mb-8 self-start text-sm text-cloud/70 hover:text-cloud"
            >
              ← Back
            </button>
            <div className="relative flex h-72 w-72 items-center justify-center rounded-[2rem] border-2 border-star/80 bg-white/5">
              <QrCode className={cn("h-20 w-20 text-star", scanPulse && "animate-pulse")} />
              <div
                className={cn(
                  "scan-beam absolute inset-x-6 top-8 h-0.5 bg-gradient-to-r from-transparent via-star to-transparent",
                  scanPulse && "scanning"
                )}
              />
            </div>
            <p className="mt-8 font-display text-3xl">Hold your pass here</p>
            <Button
              className="mt-8"
              size="lg"
              variant="star"
              onClick={simulateScan}
            >
              Simulate successful scan
            </Button>
          </div>
        )}

        {view === "success" && success && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-300" />
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              You&apos;re checked in
            </h2>
            <p className="mt-2 text-cloud/75">
              Welcome, {success.firstName}. Collect your badge below.
            </p>
            <QrBadge
              className="mt-8 w-full max-w-md text-left text-ink"
              attendee={success}
              eventTitle={event.title}
            />
            <Button
              className="mt-8"
              size="lg"
              variant="star"
              onClick={() => {
                setSuccess(null);
                setQuery("");
                setView("home");
              }}
            >
              Done · next guest
            </Button>
          </div>
        )}
      </main>

      {pinOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-cloud p-6 text-ink">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl">Exit kiosk</p>
              <button type="button" onClick={() => setPinOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-soft">Enter staff PIN (demo: 1234)</p>
            <Input
              className="mt-4"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
            />
            <Button
              className="mt-4 w-full"
              onClick={() => {
                if (pin === "1234") {
                  window.location.href = `/events/${event.id}`;
                }
              }}
            >
              Unlock
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeStatus({ status }: { status: Attendee["status"] }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-semibold",
        status === "checked-in"
          ? "bg-emerald-400/20 text-emerald-200"
          : "bg-white/10 text-cloud/80"
      )}
    >
      {status === "checked-in" ? "Already in" : "Tap to check in"}
    </span>
  );
}
