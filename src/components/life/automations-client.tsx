"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AutomationRule } from "@/life/types";

export function AutomationsClient({
  initial,
  locationStatus,
}: {
  initial: AutomationRule[];
  locationStatus?: {
    homeConfigured: boolean;
    homeRadiusM: number;
    webhookSecretConfigured: boolean;
    lastDetail: string | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/life/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, trigger, action }),
    });
    const json = (await res.json()) as { ok?: boolean; detail?: string };
    setMessage(json.ok ? "Automation created" : (json.detail ?? "Failed"));
    setName("");
    setTrigger("");
    setAction("");
    startTransition(() => router.refresh());
  }

  async function toggle(id: string, enabled: boolean) {
    await fetch("/api/life/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "automation",
        action: "toggle",
        deviceId: id,
        value: !enabled,
      }),
    });
    startTransition(() => router.refresh());
  }

  async function run(id: string) {
    const res = await fetch("/api/life/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "automation",
        action: "run",
        deviceId: id,
      }),
    });
    const json = (await res.json()) as { detail?: string };
    setMessage(json.detail ?? "Ran");
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="life-panel life-rise space-y-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          iPhone → open charge port
        </h2>
        <p className="text-sm leading-relaxed text-[var(--life-muted)]">
          When your iPhone arrives at Home, Shortcuts posts your location to Life
          Ops. The server then waits until the Tesla has been parked for at least
          10 seconds and opens the charge port.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--life-ink)]">
          <li>
            On iPhone: <strong>Shortcuts → Automation → + → Arrive → Home</strong>
            (use your Home address / geofence).
          </li>
          <li>
            Add action <strong>Get Current Location</strong>, then{" "}
            <strong>Get Contents of URL</strong>.
          </li>
          <li>
            URL:{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">
              https://mikelcrump.com/api/life/location
            </code>
            {locationStatus?.webhookSecretConfigured
              ? " (add header Authorization: Bearer &lt;secret&gt;)"
              : null}
          </li>
          <li>
            Method <strong>POST</strong>, request body JSON:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-black/5 p-3 text-xs">
{`{
  "event": "arrive_home",
  "lat": Current Location → Latitude,
  "lon": Current Location → Longitude,
  "source": "iphone"
}`}
            </pre>
          </li>
          <li>
            Allow running without asking when prompted. Keep the Life Ops rule{" "}
            <em>Open charge port on arrive home</em> enabled.
          </li>
        </ol>
        <p className="text-xs text-[var(--life-muted)]">
          Home geofence:{" "}
          {locationStatus?.homeConfigured
            ? `configured · ${locationStatus.homeRadiusM}m radius`
            : "set HOME_LAT / HOME_LON (or WEATHER_LAT / WEATHER_LON) in Vercel"}
          {locationStatus?.lastDetail
            ? ` · Last: ${locationStatus.lastDetail}`
            : null}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <form
          onSubmit={onCreate}
          className="life-panel life-rise lg:col-span-2 space-y-3"
        >
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            New automation
          </h2>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--life-muted)]">Name</span>
            <input
              className="life-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Precool before commute"
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--life-muted)]">When</span>
            <input
              className="life-input"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="15 min before suggested leave"
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--life-muted)]">Do</span>
            <input
              className="life-input"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Resideo cool 70° + Tesla climate"
              required
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="life-btn life-btn-on"
          >
            Create
          </button>
          {message ? (
            <p className="text-xs text-[var(--life-muted)]">{message}</p>
          ) : null}
        </form>

        <ul className="lg:col-span-3 space-y-3">
          {initial.map((a) => (
            <li key={a.id} className="life-panel life-rise">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold tracking-tight">{a.name}</p>
                  <p className="mt-1 text-sm text-[var(--life-muted)]">
                    When {a.trigger}
                  </p>
                  <p className="mt-1 text-sm">→ {a.action}</p>
                  <p className="mt-2 text-[11px] text-[var(--life-muted)]">
                    Last run: {a.lastRun ?? "Never"}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(a.id, a.enabled)}
                    className={`life-btn ${a.enabled ? "life-btn-on" : ""}`}
                  >
                    {a.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    type="button"
                    disabled={pending || !a.enabled}
                    onClick={() => run(a.id)}
                    className="life-btn"
                  >
                    Run now
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
