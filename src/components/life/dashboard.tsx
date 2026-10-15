"use client";

import {
  Battery,
  Car,
  CloudSun,
  Cpu,
  Landmark,
  Lightbulb,
  MonitorPlay,
  Route,
  Scale,
  Snowflake,
  Sparkles,
  Tv,
} from "lucide-react";
import { ControlToast } from "@/components/life/control-toast";
import { Panel } from "@/components/life/panel";
import { useLifeControl } from "@/components/life/use-life-control";
import { money, moneyExact } from "@/life/format";
import { greetingForHour } from "@/life/mock-data";
import type { LifeOverview } from "@/life/types";

export function LifeDashboard({ data }: { data: LifeOverview }) {
  const { control, pending, toast } = useLifeControl();
  const lowBatteries = data.batteries.devices.filter((d) => d.low);
  const weights = data.renpho.history.map((p) => p.weightLbs);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const aiPreview = data.aiCredits.accounts.slice(0, 4);

  return (
    <div className="space-y-6">
      <header className="life-rise max-w-3xl">
        <p className="text-sm font-medium text-[var(--life-accent)]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1
          className="mt-2 text-4xl tracking-tight text-[var(--life-ink)] sm:text-5xl"
          style={{ fontFamily: "var(--font-life-display), sans-serif" }}
        >
          {greetingForHour()}, {data.owner.name.split(" ")[0]}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--life-muted)]">
          Widget home for the day — tap any card title or Open to dig into Tesla,
          home, money, health, AI credits, media, and servers.
        </p>
      </header>

      <ControlToast message={toast} />

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Weather"
          subtitle={data.weather.location}
          mode={data.weather.mode}
          href="/life/day"
          className="lg:col-span-4"
          delay={40}
          action={<CloudSun className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="text-5xl tabular-nums tracking-tight"
                style={{ fontFamily: "var(--font-life-display), sans-serif" }}
              >
                {data.weather.tempF}°
              </p>
              <p className="mt-1 capitalize text-[var(--life-muted)]">
                {data.weather.condition}
              </p>
            </div>
            <div className="text-right text-xs text-[var(--life-muted)]">
              <p>Feels {data.weather.feelsLikeF}°</p>
              <p>
                H {data.weather.highF}° · L {data.weather.lowF}°
              </p>
              <p>
                Wind {data.weather.windMph} mph · {data.weather.humidity}% hum
              </p>
            </div>
          </div>
        </Panel>

        <Panel
          title="Head to work"
          subtitle={`Typical leave ${data.commute.typicalLeave}`}
          mode={data.commute.mode}
          href="/life/day"
          className="lg:col-span-8"
          delay={80}
          action={<Route className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <div className="grid gap-3 md:grid-cols-3">
            {data.commute.suggestions.map((s, i) => (
              <div
                key={s.leaveBy}
                className={`rounded-lg border px-3 py-3 ${
                  i === 0
                    ? "border-[var(--life-accent)]/40 bg-[var(--life-accent-soft)]"
                    : "border-[var(--life-line)] bg-[var(--life-surface)]"
                }`}
              >
                <p className="text-xs font-semibold text-[var(--life-muted)]">
                  Leave by
                </p>
                <p
                  className="mt-1 text-2xl tabular-nums"
                  style={{ fontFamily: "var(--font-life-display), sans-serif" }}
                >
                  {s.leaveBy}
                </p>
                <p className="mt-1 text-xs text-[var(--life-muted)]">
                  Arrive {s.arriveBy} · {s.durationMin} min · {s.confidence}
                </p>
                <p className="mt-2 text-xs leading-snug text-[var(--life-ink)]">
                  {s.reason}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Tesla"
          subtitle={
            data.tesla.lastError
              ? data.tesla.lastError
              : `${data.tesla.model} · ${data.tesla.state}`
          }
          mode={data.tesla.mode}
          href="/life/tesla"
          className="lg:col-span-4"
          delay={120}
          action={<Car className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <p
            className="text-4xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {data.tesla.batteryPercent}%
          </p>
          <p className="mt-1 text-sm text-[var(--life-muted)]">
            {data.tesla.rangeMiles} mi · {data.tesla.locationLabel} · cabin{" "}
            {data.tesla.insideTempF}°
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-[var(--life-accent)] transition-all duration-700"
              style={{ width: `${data.tesla.batteryPercent}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["wake", "Wake"],
                ["climate_on", "Climate"],
                ["charge_start", "Charge"],
                ["lock", "Lock"],
              ] as const
            ).map(([action, label]) => (
              <button
                key={action}
                type="button"
                disabled={pending}
                onClick={() => control({ target: "tesla", action })}
                className="life-btn"
              >
                {label}
              </button>
            ))}
          </div>
        </Panel>

        <Panel
          title="Govee"
          subtitle={
            data.govee.lastError
              ? data.govee.lastError
              : `${data.govee.devices.filter((d) => d.power).length} on`
          }
          mode={data.govee.mode}
          href="/life/home"
          className="lg:col-span-5"
          delay={160}
          action={<Lightbulb className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <ul className="space-y-2">
            {data.govee.devices.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--life-line)]/80 bg-[var(--life-surface)] px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full ring-2 ring-white"
                    style={{ background: d.power ? d.colorHex : "#cbd5e1" }}
                  />
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-[11px] text-[var(--life-muted)]">
                      {d.room} · {d.brightness}%
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    control({
                      target: "govee",
                      action: "power",
                      deviceId: d.id,
                      value: !d.power,
                    })
                  }
                  className="life-btn"
                >
                  {d.power ? "Off" : "On"}
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Resideo AC"
          subtitle={data.resideo.name}
          mode={data.resideo.connection}
          href="/life/home"
          className="lg:col-span-3"
          delay={200}
          action={<Snowflake className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <p
            className="text-4xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {data.resideo.targetF}°
          </p>
          <p className="mt-1 text-sm text-[var(--life-muted)]">
            Now {data.resideo.currentF}° · {data.resideo.mode} · fan{" "}
            {data.resideo.fan}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                control({
                  target: "resideo",
                  action: "power",
                  value: !data.resideo.power,
                })
              }
              className="life-btn"
            >
              {data.resideo.power ? "Turn off" : "Turn on"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                control({
                  target: "resideo",
                  action: "temp",
                  value: data.resideo.targetF - 1,
                })
              }
              className="life-btn"
            >
              −1°
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                control({
                  target: "resideo",
                  action: "temp",
                  value: data.resideo.targetF + 1,
                })
              }
              className="life-btn"
            >
              +1°
            </button>
          </div>
        </Panel>

        <Panel
          title="Plaid · money"
          subtitle={`Spend this month ${moneyExact(data.finance.spendThisMonth)}`}
          mode={data.finance.mode}
          href="/life/money"
          className="lg:col-span-4"
          delay={240}
          action={<Landmark className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <p className="text-xs text-[var(--life-muted)]">Net pulse</p>
          <p
            className="text-3xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {money(data.finance.netWorth)}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {data.finance.accounts.slice(0, 3).map((a) => (
              <li key={a.id} className="flex justify-between gap-3">
                <span className="text-[var(--life-muted)]">{a.name}</span>
                <span className="tabular-nums font-medium">
                  {moneyExact(a.balance)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Renpho"
          subtitle={`7d ${data.renpho.trendLbs7d > 0 ? "+" : ""}${data.renpho.trendLbs7d} lb`}
          mode={data.renpho.mode}
          href="/life/health"
          className="lg:col-span-4"
          delay={280}
          action={<Scale className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <p
            className="text-4xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {data.renpho.latest.weightLbs}
            <span className="text-lg text-[var(--life-muted)]"> lb</span>
          </p>
          <p className="mt-1 text-xs text-[var(--life-muted)]">
            Body fat {data.renpho.latest.bodyFatPct}% · muscle{" "}
            {data.renpho.latest.muscleLbs} lb
          </p>
          <svg
            viewBox="0 0 140 36"
            className="mt-4 h-12 w-full text-[var(--life-accent)]"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points={weights
                .map((w, i) => {
                  const x = (i / (weights.length - 1)) * 140;
                  const y = 30 - ((w - minW) / (maxW - minW || 1)) * 24;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
        </Panel>

        <Panel
          title="Up next"
          subtitle="Calendar"
          href="/life/day"
          className="lg:col-span-4"
          delay={320}
        >
          <ul className="space-y-3">
            {data.calendar.map((event) => (
              <li
                key={`${event.time}-${event.title}`}
                className="flex items-baseline gap-3 border-b border-[var(--life-line)] pb-2 last:border-0"
              >
                <span className="w-12 text-sm font-semibold tabular-nums text-[var(--life-accent)]">
                  {event.time}
                </span>
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.where ? (
                    <p className="text-xs text-[var(--life-muted)]">{event.where}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="AI credits"
          subtitle={`${data.aiCredits.accounts.length} accounts · Claude / Grok / Cursor`}
          mode={data.aiCredits.mode}
          href="/life/ai"
          className="lg:col-span-7"
          delay={360}
          action={<Sparkles className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {aiPreview.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-[var(--life-line)] bg-[var(--life-surface)] px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-[11px] text-[var(--life-muted)]">
                      {a.plan}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums font-semibold">
                    {a.percentUsed}% used
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-[var(--life-ink)]"
                    style={{ width: `${a.percentUsed}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Batteries"
          subtitle={
            lowBatteries.length
              ? `${lowBatteries.length} low`
              : "All healthy"
          }
          mode={data.batteries.mode}
          href="/life/day"
          className="lg:col-span-5"
          delay={400}
          action={<Battery className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <ul className="space-y-2">
            {data.batteries.devices.map((d) => (
              <li key={d.id} className="flex items-center gap-3 text-sm">
                <span className="w-28 truncate text-[var(--life-muted)]">
                  {d.name}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
                  <div
                    className={`h-full rounded-full ${
                      d.low ? "bg-amber-500" : "bg-[var(--life-accent)]"
                    }`}
                    style={{ width: `${d.percent}%` }}
                  />
                </div>
                <span className="w-10 text-right tabular-nums">{d.percent}%</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Media"
          subtitle="Apple TV · Roku"
          mode={data.media.mode}
          href="/life/media"
          className="lg:col-span-5"
          delay={440}
          action={<Tv className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <ul className="space-y-3">
            {data.media.devices.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--life-line)] px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <MonitorPlay className="h-4 w-4 text-[var(--life-accent)]" />
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-[11px] text-[var(--life-muted)]">
                      {d.power ? d.app : "Off"} · vol {Math.round(d.volume)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      control({
                        target: d.kind,
                        action: "power",
                        deviceId: d.id,
                      })
                    }
                    className="life-btn"
                  >
                    Power
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      control({
                        target: d.kind,
                        action: "home",
                        deviceId: d.id,
                      })
                    }
                    className="life-btn"
                  >
                    Home
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="RustDesk servers"
          subtitle={`${data.rustdesk.hosts.filter((h) => h.online).length} online`}
          mode={data.rustdesk.mode}
          href="/life/servers"
          className="lg:col-span-7"
          delay={480}
          action={<Cpu className="h-4 w-4 text-[var(--life-accent)]" />}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {data.rustdesk.hosts.map((h) => (
              <div
                key={h.id}
                className="rounded-lg border border-[var(--life-line)] bg-[var(--life-surface)] px-3 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{h.name}</p>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      h.online ? "bg-[var(--life-ok)]" : "bg-slate-300"
                    }`}
                  />
                </div>
                <p className="mt-1 text-[11px] text-[var(--life-muted)]">
                  {h.online ? "Online" : "Offline"} · {h.lastSeen}
                </p>
                <p className="mt-2 text-[11px] tabular-nums text-[var(--life-muted)]">
                  CPU {h.cpuPct}% · RAM {h.memPct}% · Disk {h.diskPct}%
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Automations"
          subtitle="Toggle simple rules"
          href="/life/automations"
          className="lg:col-span-12"
          delay={520}
        >
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {data.automations.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-[var(--life-line)] bg-[var(--life-surface)] px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{a.name}</p>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      control({
                        target: "automation",
                        action: "toggle",
                        deviceId: a.id,
                        value: !a.enabled,
                      })
                    }
                    className={`life-btn ${a.enabled ? "life-btn-on" : ""}`}
                  >
                    {a.enabled ? "On" : "Off"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--life-muted)]">
                  When {a.trigger}
                </p>
                <p className="mt-1 text-xs text-[var(--life-ink)]">→ {a.action}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
