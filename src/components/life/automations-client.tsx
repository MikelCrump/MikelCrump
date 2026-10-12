"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AutomationRule } from "@/life/types";

export function AutomationsClient({ initial }: { initial: AutomationRule[] }) {
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
    <div className="mt-8 grid gap-6 lg:grid-cols-5">
      <form onSubmit={onCreate} className="life-panel life-rise lg:col-span-2 space-y-3">
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
        <button type="submit" disabled={pending} className="life-btn life-btn-on">
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
  );
}
