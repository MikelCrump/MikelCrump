"use client";

import Link from "next/link";
import {
  BatteryCharging,
  BookOpen,
  Car,
  Footprints,
  Landmark,
  Newspaper,
  Scale,
  Utensils,
} from "lucide-react";
import { Widget, PreviewBadge, ConnectHint } from "@/components/steward/widget";
import {
  greetingForHour,
  MOCK_DASHBOARD,
  verseOfTheDay,
} from "@/lib/life-mock";
import { useTasksStore } from "@/lib/tasks-store";
import { cn } from "@/lib/utils";

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function DashboardHome() {
  const data = MOCK_DASHBOARD;
  const verse = verseOfTheDay();
  const tasks = useTasksStore((s) => s.tasks);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const openTasks = tasks.filter((t) => !t.done);
  const stepPct = Math.min(
    100,
    Math.round((data.health.steps / data.health.stepGoal) * 100)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <header className="animate-steward-rise mb-8 max-w-2xl">
        <p className="text-sm font-medium text-[var(--accent)]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="font-display mt-2 text-4xl leading-tight tracking-tight text-[var(--ink)] md:text-5xl">
          {greetingForHour()}, {data.owner.name}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]/80">
          Your private board for money, body, calendar, car, and the day ahead.
          Connections stay locked behind Google + passkey / 2FA.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        <Widget
          title="Verse of the day"
          subtitle={verse.reference}
          className="lg:col-span-5"
          delayClass="delay-1"
          action={
            <BookOpen className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          }
        >
          <p className="font-display text-xl leading-snug text-[var(--ink)] md:text-2xl">
            “{verse.text}”
          </p>
        </Widget>

        <Widget
          title="Up next"
          subtitle="Calendar · preview"
          className="lg:col-span-7"
          delayClass="delay-2"
          action={<ConnectHint />}
        >
          <div className="space-y-3">
            {data.calendar.slice(0, 3).map((event) => (
              <div
                key={`${event.time}-${event.title}`}
                className="flex items-baseline gap-4 border-b border-[var(--line)] pb-3 last:border-0 last:pb-0"
              >
                <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-[var(--accent)]">
                  {event.time}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {event.title}
                  </p>
                  {event.where ? (
                    <p className="text-xs text-[var(--ink-soft)]/60">
                      {event.where}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget
          title="Capital One"
          subtitle="Balances · preview"
          className="lg:col-span-4"
          delayClass="delay-3"
          action={
            <div className="flex items-center gap-2">
              <PreviewBadge />
              <Landmark className="h-4 w-4 text-[var(--accent)]" />
            </div>
          }
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--ink-soft)]/60">Checking</p>
              <p className="font-display text-3xl text-[var(--ink)]">
                {money(data.bank.checking)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-[var(--ink-soft)]/60">Savings</p>
                <p className="font-medium">{money(data.bank.savings)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ink-soft)]/60">Credit avail.</p>
                <p className="font-medium">{money(data.bank.creditAvailable)}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--ink-soft)]/65">
              Last: {data.bank.lastTxn.merchant}{" "}
              <span className="tabular-nums">
                {data.bank.lastTxn.amount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
            </p>
            <ConnectHint />
          </div>
        </Widget>

        <Widget
          title="Apple Health"
          subtitle="Steps today · preview"
          className="lg:col-span-4"
          delayClass="delay-3"
          action={<Footprints className="h-4 w-4 text-[var(--accent)]" />}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-4xl tabular-nums text-[var(--ink)]">
                {data.health.steps.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]/65">
                of {data.health.stepGoal.toLocaleString()} · {stepPct}%
              </p>
            </div>
            <div className="h-16 w-16">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="rgba(15,45,36,0.1)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${stepPct} 100`}
                  className="transition-all duration-700"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-[var(--ink-soft)]/70">
            <span>{data.health.activeMinutes} active min</span>
            <span>{data.health.restingHr} bpm rest</span>
          </div>
          <div className="mt-3">
            <ConnectHint />
          </div>
        </Widget>

        <Widget
          title="Tesla"
          subtitle={`${data.tesla.model} · preview`}
          className="lg:col-span-4"
          delayClass="delay-3"
          action={
            data.tesla.charging ? (
              <BatteryCharging className="h-4 w-4 text-[var(--ok)]" />
            ) : (
              <Car className="h-4 w-4 text-[var(--accent)]" />
            )
          }
        >
          <p className="font-display text-4xl tabular-nums text-[var(--ink)]">
            {data.tesla.batteryPercent}%
          </p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]/75">
            ~{data.tesla.rangeMiles} mi · {data.tesla.location}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--mist-deep)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
              style={{ width: `${data.tesla.batteryPercent}%` }}
            />
          </div>
          <div className="mt-3">
            <ConnectHint />
          </div>
        </Widget>

        <Widget
          title="Tasks"
          subtitle={`${openTasks.length} open`}
          className="lg:col-span-5"
          delayClass="delay-4"
          action={
            <Link
              href="/tasks"
              className="text-xs font-medium text-[var(--accent)]"
            >
              Open board →
            </Link>
          }
        >
          <ul className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition hover:bg-white/50"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      task.done
                        ? "border-[var(--accent)] bg-[var(--accent)]"
                        : "border-[var(--line)] bg-white"
                    )}
                  >
                    {task.done ? (
                      <span className="block h-1.5 w-1.5 rounded-sm bg-white" />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      task.done
                        ? "text-[var(--ink-soft)]/50 line-through"
                        : "text-[var(--ink)]"
                    )}
                  >
                    {task.title}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]/50">
                    {task.tag}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Widget>

        <Widget
          title="MyFitnessPal"
          subtitle="Nutrition · preview"
          className="lg:col-span-3"
          delayClass="delay-5"
          action={<Utensils className="h-4 w-4 text-[var(--accent)]" />}
        >
          <p className="font-display text-3xl tabular-nums">
            {data.fitnessPal.calories}
            <span className="text-base text-[var(--ink-soft)]/55">
              /{data.fitnessPal.calorieGoal}
            </span>
          </p>
          <p className="mt-2 text-xs text-[var(--ink-soft)]/65">
            P {data.fitnessPal.protein}g · C {data.fitnessPal.carbs}g · F{" "}
            {data.fitnessPal.fat}g
          </p>
          <div className="mt-3">
            <ConnectHint />
          </div>
        </Widget>

        <Widget
          title="Renpho"
          subtitle={data.renpho.measuredAt}
          className="lg:col-span-4"
          delayClass="delay-5"
          action={<Scale className="h-4 w-4 text-[var(--accent)]" />}
        >
          <p className="font-display text-3xl tabular-nums">
            {data.renpho.weightLbs}{" "}
            <span className="text-base font-sans text-[var(--ink-soft)]/60">
              lb
            </span>
          </p>
          <p className="mt-2 text-sm text-[var(--ok)]">
            {data.renpho.deltaLbs} lb · body fat {data.renpho.bodyFat}%
          </p>
          <div className="mt-3">
            <ConnectHint />
          </div>
        </Widget>

        <Widget
          title="News"
          subtitle="Your stations · preview"
          className="lg:col-span-12"
          delayClass="delay-6"
          action={<Newspaper className="h-4 w-4 text-[var(--accent)]" />}
        >
          <div className="grid gap-3 md:grid-cols-3">
            {data.news.map((item) => (
              <article
                key={item.headline}
                className="rounded-xl border border-[var(--line)] bg-white/50 p-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  {item.source}
                </p>
                <p className="mt-2 text-sm font-medium leading-snug text-[var(--ink)]">
                  {item.headline}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-3">
            <ConnectHint />
          </div>
        </Widget>
      </div>
    </div>
  );
}
