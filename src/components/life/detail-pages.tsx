"use client";

import { MonitorPlay } from "lucide-react";
import { ControlToast } from "@/components/life/control-toast";
import { DetailHeader } from "@/components/life/detail-header";
import { ModeBadge } from "@/components/life/mode-badge";
import { Panel } from "@/components/life/panel";
import { useLifeControl } from "@/components/life/use-life-control";
import { money, moneyExact } from "@/life/format";
import { getSection } from "@/life/sections";
import type { LifeOverview } from "@/life/types";

export function DayDetail({ data }: { data: LifeOverview }) {
  const section = getSection("day");
  const low = data.batteries.devices.filter((d) => d.low);

  return (
    <div>
      <DetailHeader section={section} />
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Weather"
          subtitle={data.weather.location}
          mode={data.weather.mode}
          className="lg:col-span-4"
        >
          <p
            className="text-6xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {data.weather.tempF}°
          </p>
          <p className="mt-2 capitalize text-[var(--life-muted)]">
            {data.weather.condition}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Feels like</dt>
              <dd className="font-medium">{data.weather.feelsLikeF}°</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">High / low</dt>
              <dd className="font-medium">
                {data.weather.highF}° / {data.weather.lowF}°
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Wind</dt>
              <dd className="font-medium">{data.weather.windMph} mph</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Humidity</dt>
              <dd className="font-medium">{data.weather.humidity}%</dd>
            </div>
          </dl>
        </Panel>

        <Panel
          title="Commute advisor"
          subtitle={`Typical leave ${data.commute.typicalLeave} · ${data.commute.destination}`}
          mode={data.commute.mode}
          className="lg:col-span-8"
        >
          <div className="grid gap-3 md:grid-cols-3">
            {data.commute.suggestions.map((s, i) => (
              <div
                key={s.leaveBy}
                className={`rounded-xl border px-4 py-4 ${
                  i === 0
                    ? "border-[var(--life-accent)]/40 bg-[var(--life-accent-soft)]"
                    : "border-[var(--life-line)] bg-white/40"
                }`}
              >
                <p className="text-[10px] font-semibold tracking-wide text-[var(--life-muted)] uppercase">
                  Leave by
                </p>
                <p
                  className="mt-1 text-3xl tabular-nums"
                  style={{ fontFamily: "var(--font-life-display), sans-serif" }}
                >
                  {s.leaveBy}
                </p>
                <p className="mt-2 text-sm text-[var(--life-muted)]">
                  Arrive {s.arriveBy} · {s.durationMin} min
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--life-accent)]">
                  {s.confidence} confidence
                </p>
                <p className="mt-3 text-sm leading-snug">{s.reason}</p>
                <p className="mt-2 text-xs text-[var(--life-muted)]">{s.trafficNote}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Calendar" subtitle="Up next today" className="lg:col-span-6">
          <ul className="space-y-4">
            {data.calendar.map((event) => (
              <li
                key={`${event.time}-${event.title}`}
                className="flex items-baseline gap-4 border-b border-[var(--life-line)] pb-3 last:border-0"
              >
                <span className="w-14 text-base font-semibold tabular-nums text-[var(--life-accent)]">
                  {event.time}
                </span>
                <div>
                  <p className="font-medium">{event.title}</p>
                  {event.where ? (
                    <p className="text-sm text-[var(--life-muted)]">{event.where}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Batteries"
          subtitle={low.length ? `${low.length} need attention` : "All healthy"}
          mode={data.batteries.mode}
          className="lg:col-span-6"
        >
          <ul className="space-y-3">
            {data.batteries.devices.map((d) => (
              <li key={d.id} className="flex items-center gap-3 text-sm">
                <div className="w-36">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-[11px] text-[var(--life-muted)]">{d.kind}</p>
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                  <div
                    className={`h-full rounded-full ${
                      d.low ? "bg-amber-500" : "bg-[var(--life-accent)]"
                    }`}
                    style={{ width: `${d.percent}%` }}
                  />
                </div>
                <span className="w-12 text-right tabular-nums font-medium">
                  {d.percent}%
                </span>
                {d.charging ? (
                  <span className="text-[11px] text-[var(--life-accent)]">chg</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

export function TeslaDetail({ data }: { data: LifeOverview }) {
  const section = getSection("tesla");
  const { control, pending, toast } = useLifeControl();
  const t = data.tesla;

  return (
    <div>
      <DetailHeader section={section} />
      <ControlToast message={toast} />
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title={t.name}
          subtitle={`${t.model} · ${t.state}`}
          mode={t.mode}
          className="lg:col-span-5"
        >
          <p
            className="text-6xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {t.batteryPercent}%
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-[var(--life-accent)]"
              style={{ width: `${t.batteryPercent}%` }}
            />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Range</dt>
              <dd className="text-lg font-semibold tabular-nums">{t.rangeMiles} mi</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Cabin</dt>
              <dd className="text-lg font-semibold tabular-nums">{t.insideTempF}°</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Location</dt>
              <dd className="font-medium">{t.locationLabel}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Locked</dt>
              <dd className="font-medium">{t.locked ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Charging</dt>
              <dd className="font-medium">
                {t.charging
                  ? `Yes${t.chargeRateMph != null ? ` · ${t.chargeRateMph} mi/hr` : ""}`
                  : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Climate</dt>
              <dd className="font-medium">{t.climateOn ? "On" : "Off"}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Commands" subtitle="Fleet API / command proxy" className="lg:col-span-7">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["wake", "Wake vehicle", "Bring the car online from sleep"],
                ["climate_on", "Start climate", "Precondition cabin"],
                ["climate_off", "Stop climate", "Turn HVAC off"],
                ["charge_start", "Start charge", "Begin charging if plugged in"],
                ["charge_stop", "Stop charge", "Pause charging"],
                ["lock", "Lock", "Lock doors"],
                ["unlock", "Unlock", "Unlock doors"],
              ] as const
            ).map(([action, label, hint]) => (
              <button
                key={action}
                type="button"
                disabled={pending}
                onClick={() => control({ target: "tesla", action })}
                className="rounded-xl border border-[var(--life-line)] bg-white/50 px-4 py-3 text-left transition hover:border-[var(--life-accent)]/40"
              >
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-[var(--life-muted)]">{hint}</p>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function HomeDetail({ data }: { data: LifeOverview }) {
  const section = getSection("home");
  const { control, pending, toast } = useLifeControl();

  return (
    <div>
      <DetailHeader section={section} />
      <ControlToast message={toast} />
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Govee devices"
          subtitle={`${data.govee.devices.filter((d) => d.power).length} powered on`}
          mode={data.govee.mode}
          className="lg:col-span-7"
        >
          <ul className="space-y-3">
            {data.govee.devices.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--life-line)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full ring-2 ring-white"
                    style={{ background: d.power ? d.colorHex : "#cbd5e1" }}
                  />
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-[var(--life-muted)]">
                      {d.room} · {d.model} · {d.brightness}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
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
                    {d.power ? "Turn off" : "Turn on"}
                  </button>
                  <button
                    type="button"
                    disabled={pending || !d.power}
                    onClick={() =>
                      control({
                        target: "govee",
                        action: "brightness",
                        deviceId: d.id,
                        value: 40,
                      })
                    }
                    className="life-btn"
                  >
                    Dim 40%
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      control({
                        target: "govee",
                        action: "brightness",
                        deviceId: d.id,
                        value: 100,
                      })
                    }
                    className="life-btn"
                  >
                    Full
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Resideo AC"
          subtitle={data.resideo.name}
          mode={data.resideo.connection}
          className="lg:col-span-5"
        >
          <p
            className="text-6xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {data.resideo.targetF}°
          </p>
          <p className="mt-2 text-sm text-[var(--life-muted)]">
            Room {data.resideo.currentF}° · mode {data.resideo.mode} · fan{" "}
            {data.resideo.fan}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
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
            {[68, 70, 72, 74].map((temp) => (
              <button
                key={temp}
                type="button"
                disabled={pending}
                onClick={() =>
                  control({ target: "resideo", action: "temp", value: temp })
                }
                className={`life-btn ${
                  data.resideo.targetF === temp ? "life-btn-on" : ""
                }`}
              >
                {temp}°
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["cool", "heat", "fan", "auto"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                disabled={pending}
                onClick={() =>
                  control({ target: "resideo", action: "mode", value: mode })
                }
                className={`life-btn ${
                  data.resideo.mode === mode ? "life-btn-on" : ""
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function MoneyDetail({ data }: { data: LifeOverview }) {
  const section = getSection("money");
  const f = data.finance;

  return (
    <div>
      <DetailHeader section={section} />
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Net pulse"
          subtitle={`Spend this month ${moneyExact(f.spendThisMonth)}`}
          mode={f.mode}
          className="lg:col-span-4"
        >
          <p
            className="text-5xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {money(f.netWorth)}
          </p>
          <p className="mt-2 text-sm text-[var(--life-muted)]">
            Checking + savings + investments − card balances
          </p>
        </Panel>

        <Panel title="Accounts" className="lg:col-span-8">
          <ul className="divide-y divide-[var(--life-line)]">
            {f.accounts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-[var(--life-muted)]">
                    {a.institution} · {a.type}
                  </p>
                </div>
                <p className="text-lg tabular-nums font-semibold">
                  {moneyExact(a.balance)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent activity" className="lg:col-span-12">
          <ul className="divide-y divide-[var(--life-line)]">
            {f.recent.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
              >
                <div>
                  <p className="font-medium">{t.merchant}</p>
                  <p className="text-xs text-[var(--life-muted)]">
                    {t.category} · {t.when}
                  </p>
                </div>
                <p className="tabular-nums font-semibold">{moneyExact(t.amount)}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

export function HealthDetail({ data }: { data: LifeOverview }) {
  const section = getSection("health");
  const r = data.renpho;
  const weights = r.history.map((p) => p.weightLbs);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);

  return (
    <div>
      <DetailHeader section={section} />
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Latest weigh-in"
          subtitle={r.latest.date}
          mode={r.mode}
          className="lg:col-span-4"
        >
          <p
            className="text-5xl tabular-nums"
            style={{ fontFamily: "var(--font-life-display), sans-serif" }}
          >
            {r.latest.weightLbs}
            <span className="text-xl text-[var(--life-muted)]"> lb</span>
          </p>
          <p className="mt-2 text-sm text-[var(--life-muted)]">
            7-day trend {r.trendLbs7d > 0 ? "+" : ""}
            {r.trendLbs7d} lb
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Body fat</dt>
              <dd className="font-semibold">{r.latest.bodyFatPct}%</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--life-muted)]">Muscle</dt>
              <dd className="font-semibold">{r.latest.muscleLbs} lb</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="14-day trend" className="lg:col-span-8">
          <svg
            viewBox="0 0 280 80"
            className="h-28 w-full text-[var(--life-accent)]"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              points={weights
                .map((w, i) => {
                  const x = (i / (weights.length - 1)) * 280;
                  const y = 68 - ((w - minW) / (maxW - minW || 1)) * 52;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-xs tracking-wide text-[var(--life-muted)] uppercase">
                <tr>
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Weight</th>
                  <th className="py-2 font-semibold">Body fat</th>
                  <th className="py-2 font-semibold">Muscle</th>
                </tr>
              </thead>
              <tbody>
                {[...r.history].reverse().map((p) => (
                  <tr key={p.date} className="border-t border-[var(--life-line)]">
                    <td className="py-2">{p.date}</td>
                    <td className="py-2 tabular-nums">{p.weightLbs} lb</td>
                    <td className="py-2 tabular-nums">{p.bodyFatPct}%</td>
                    <td className="py-2 tabular-nums">{p.muscleLbs} lb</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function AiDetail({ data }: { data: LifeOverview }) {
  const section = getSection("ai");

  return (
    <div>
      <DetailHeader section={section} />
      <div className="mb-4 flex items-center gap-2">
        <ModeBadge mode={data.aiCredits.mode} />
        <p className="text-sm text-[var(--life-muted)]">
          Paste `LIFE_AI_CREDITS_JSON` for live meters — preview accounts below.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data.aiCredits.accounts.map((a) => (
          <article key={a.id} className="life-panel life-rise">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{a.label}</h2>
                <p className="text-sm text-[var(--life-muted)]">
                  {a.provider} · {a.plan}
                </p>
              </div>
              <span className="text-sm tabular-nums font-semibold">
                {a.percentUsed}% used
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full bg-[var(--life-ink)]"
                style={{ width: `${a.percentUsed}%` }}
              />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[var(--life-muted)]">Credits left</dt>
                <dd className="font-medium">
                  {a.creditsRemaining != null
                    ? `${a.creditsRemaining} / ${a.creditsTotal}`
                    : "Allowance meter"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--life-muted)]">Reset</dt>
                <dd className="font-medium">{a.resetsAt ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--life-muted)]">Expires</dt>
                <dd className="font-medium">{a.expiresAt ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--life-muted)]">Note</dt>
                <dd className="font-medium">{a.note}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

export function MediaDetail({ data }: { data: LifeOverview }) {
  const section = getSection("media");
  const { control, pending, toast } = useLifeControl();

  return (
    <div>
      <DetailHeader section={section} />
      <ControlToast message={toast} />
      <div className="grid gap-4 md:grid-cols-2">
        {data.media.devices.map((d) => (
          <article key={d.id} className="life-panel life-rise">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <MonitorPlay className="h-5 w-5 text-[var(--life-accent)]" />
                <div>
                  <h2 className="text-lg font-semibold">{d.name}</h2>
                  <p className="text-sm text-[var(--life-muted)]">
                    {d.kind === "apple_tv" ? "Apple TV" : "Roku"} ·{" "}
                    {d.power ? d.app : "Off"}
                  </p>
                </div>
              </div>
              <ModeBadge mode={data.media.mode} />
            </div>
            <p className="mt-4 text-sm text-[var(--life-muted)]">
              Volume {Math.round(d.volume)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["power", "home", "play"] as const).map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    control({
                      target: d.kind,
                      action,
                      deviceId: d.id,
                    })
                  }
                  className="life-btn"
                >
                  {action}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ServersDetail({ data }: { data: LifeOverview }) {
  const section = getSection("servers");

  return (
    <div>
      <DetailHeader section={section} />
      <div className="mb-4 flex items-center gap-2">
        <ModeBadge mode={data.rustdesk.mode} />
        <p className="text-sm text-[var(--life-muted)]">
          {data.rustdesk.hosts.filter((h) => h.online).length} of{" "}
          {data.rustdesk.hosts.length} online
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.rustdesk.hosts.map((h) => (
          <article key={h.id} className="life-panel life-rise">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{h.name}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  h.online
                    ? "bg-emerald-500/15 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {h.online ? "Online" : "Offline"}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--life-muted)]">
              Last seen {h.lastSeen} · id {h.id}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              {(
                [
                  ["CPU", h.cpuPct],
                  ["Memory", h.memPct],
                  ["Disk", h.diskPct],
                ] as const
              ).map(([label, pct]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs text-[var(--life-muted)]">
                    <span>{label}</span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-[var(--life-accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
