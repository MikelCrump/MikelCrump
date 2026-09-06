"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { courseLessonCount, courses, events } from "@/lib/data";
import { useCrump360 } from "@/lib/store";
import { formatEventRange } from "@/lib/utils";

export default function ProgressPage() {
  const registeredEventIds = useCrump360((s) => s.registeredEventIds);
  const enrolledCourseIds = useCrump360((s) => s.enrolledCourseIds);
  const completedLessons = useCrump360((s) => s.completedLessons);
  const courseProgress = useCrump360((s) => s.courseProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const enrolled = courses.filter((c) =>
    ready ? enrolledCourseIds.includes(c.id) : c.id === "crs-compass"
  );
  const registered = events.filter((e) =>
    ready ? registeredEventIds.includes(e.id) : e.id === "evt-office-hours"
  );

  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          Progress
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Your signal board</h1>
        <p className="mt-3 text-ink-soft">
          Activation across events and courses — the metrics that matter, not vanity
          counts.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Course progress</h2>
        {enrolled.map((course) => {
          const total = courseLessonCount(course);
          const done = ready
            ? completedLessons[course.id]?.length ?? 0
            : course.id === "crs-compass"
              ? 1
              : 0;
          const pct = ready ? courseProgress(course.id, total) : Math.round((done / total) * 100);
          return (
            <div key={course.id} className="rounded-xl border border-line bg-cloud p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/learn/${course.slug}`}
                    className="font-display text-xl text-ink hover:text-sea"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-1 text-sm text-ink-soft">
                    {done} of {total} lessons · {course.level}
                  </p>
                </div>
                <p className="font-display text-2xl text-sea">{pct}%</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full rounded-full bg-sea-bright transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Event attendance path</h2>
        {registered.map((event) => (
          <div
            key={event.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cloud p-5"
          >
            <div>
              <Link
                href={`/events/${event.slug}`}
                className="font-display text-xl text-ink hover:text-sea"
              >
                {event.title}
              </Link>
              <p className="text-sm text-ink-soft">
                {formatEventRange(event.startsAt, event.endsAt)} · {event.city}
              </p>
            </div>
            <span className="rounded-sm border border-sea/25 bg-sea/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sea">
              Registered
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
