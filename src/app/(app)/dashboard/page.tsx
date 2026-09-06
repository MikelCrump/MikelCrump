"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { CourseCard, EventCard } from "@/components/catalog/cards";
import { Button } from "@/components/ui/button";
import { courses, events, learner, courseLessonCount } from "@/lib/data";
import { useCrump360 } from "@/lib/store";
import { formatEventRange } from "@/lib/utils";

function ProgressBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-line bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
      {children}
    </span>
  );
}

export default function DashboardPage() {
  const registeredEventIds = useCrump360((s) => s.registeredEventIds);
  const enrolledCourseIds = useCrump360((s) => s.enrolledCourseIds);
  const courseProgress = useCrump360((s) => s.courseProgress);
  const completedLessons = useCrump360((s) => s.completedLessons);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const myEvents = events.filter((e) =>
    ready ? registeredEventIds.includes(e.id) : e.id === "evt-office-hours"
  );
  const myCourses = courses.filter((c) =>
    ready ? enrolledCourseIds.includes(c.id) : c.id === "crs-compass"
  );
  const upcoming = events
    .filter((e) => !myEvents.some((m) => m.id === e.id))
    .slice(0, 2);
  const continueCourse = myCourses[0] ?? courses[0];
  const seedCompleted = completedLessons[continueCourse.id] ?? ["l1"];
  const progress = ready
    ? courseProgress(continueCourse.id, courseLessonCount(continueCourse))
    : Math.round((1 / courseLessonCount(continueCourse)) * 100);
  const nextLesson =
    continueCourse.modules
      .flatMap((m) => m.lessons)
      .find((l) => !(ready ? seedCompleted : ["l1"]).includes(l.id)) ??
    continueCourse.modules[0]?.lessons[0];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-ink via-[#1a3a4d] to-sea p-6 text-cloud md:grid-cols-[1.3fr_0.7fr] md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-star-soft">
            Learner home
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Welcome back, {learner.name.split(" ")[0]}
          </h1>
          <p className="mt-3 max-w-xl text-cloud/80">
            {learner.role} · {learner.org}. Your events and courses share one path — pick
            up where you left off.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {nextLesson ? (
              <Button asChild variant="star" size="lg">
                <Link href={`/learn/${continueCourse.slug}/${nextLesson.id}`}>
                  Continue {continueCourse.title} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary" size="lg" className="border-transparent">
              <Link href="/events">Find an event</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-cloud/60">
            Continue learning
          </p>
          <p className="mt-2 font-display text-2xl">{continueCourse.title}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-star transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-cloud/75">{progress}% complete</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Registered events",
            value: ready ? registeredEventIds.length : 1,
            icon: CalendarDays,
          },
          {
            label: "Active courses",
            value: ready ? enrolledCourseIds.length : 1,
            icon: BookOpen,
          },
          {
            label: "Lessons completed",
            value: ready
              ? Object.values(completedLessons).reduce((a, b) => a + b.length, 0)
              : 1,
            icon: ArrowRight,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-line bg-cloud p-5">
            <stat.icon className="h-5 w-5 text-sea" strokeWidth={1.5} />
            <p className="mt-4 font-display text-3xl text-ink">{stat.value}</p>
            <p className="text-sm text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Your events</h2>
          <ProgressBadge>{myEvents.length} registered</ProgressBadge>
        </div>
        {myEvents.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {myEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-line bg-cloud p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sea">
                  {event.city} · {event.format}
                </p>
                <Link
                  href={`/events/${event.slug}`}
                  className="mt-1 block font-display text-xl text-ink hover:text-sea"
                >
                  {event.title}
                </Link>
                <p className="mt-1 text-sm text-ink-soft">
                  {formatEventRange(event.startsAt, event.endsAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">
            No registrations yet — explore upcoming gatherings.
          </p>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Recommended next</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/events">View all</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Your courses</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/learn">Catalog</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(myCourses.length ? myCourses : courses.slice(0, 1)).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
