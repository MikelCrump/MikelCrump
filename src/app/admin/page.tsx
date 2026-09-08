"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  HelpCircle,
  Settings2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminOverviewPage() {
  const courses = useAdminStore((s) => s.courses);
  const events = useAdminStore((s) => s.events);
  const questions = useAdminStore((s) => s.questions);
  const site = useAdminStore((s) => s.site);
  const resetToSeed = useAdminStore((s) => s.resetToSeed);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const lessonCount = courses.reduce(
    (sum, c) => sum + c.modules.reduce((mSum, m) => mSum + m.lessons.length, 0),
    0
  );
  const publishedCourses = courses.filter((c) => c.published).length;
  const publishedQuestions = questions.filter((q) => q.published).length;

  if (!ready) {
    return <p className="text-ink-soft">Loading admin…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          Overview
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Manage CRUMP360</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Control content modules, quiz questions and answers, events, and site-wide
          settings from one operator portal.
        </p>
      </div>

      {site.announcement ? (
        <div className="rounded-xl border border-star/40 bg-star/15 px-5 py-4 text-sm text-ink">
          <span className="font-semibold">Announcement: </span>
          {site.announcement}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Courses", value: courses.length, detail: `${publishedCourses} published` },
          { label: "Lessons", value: lessonCount, detail: "Across all modules" },
          {
            label: "Questions",
            value: questions.length,
            detail: `${publishedQuestions} published`,
          },
          {
            label: "Events",
            value: events.length,
            detail: `${events.filter((e) => e.published).length} published`,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-line bg-cloud p-5">
            <p className="font-display text-3xl text-ink">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-ink">{stat.label}</p>
            <p className="text-xs text-ink-soft">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          {
            href: "/admin/modules",
            icon: BookOpen,
            title: "Content modules",
            copy: "Edit courses, modules, lessons, media, and publish state.",
          },
          {
            href: "/admin/questions",
            icon: HelpCircle,
            title: "Questions & answers",
            copy: "Create quiz prompts, choices, correct answers, and explanations.",
          },
          {
            href: "/admin/events",
            icon: CalendarDays,
            title: "Events",
            copy: "Manage event copy, capacity, pricing, and publish state.",
          },
          {
            href: "/admin/site",
            icon: Settings2,
            title: "Site settings",
            copy: "Update brand text, hero copy, announcement, and maintenance mode.",
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-line bg-cloud p-5 transition-colors hover:border-ink/30"
          >
            <card.icon className="h-5 w-5 text-sea" strokeWidth={1.5} />
            <h2 className="mt-4 font-display text-2xl text-ink group-hover:text-sea">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{card.copy}</p>
            <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sea">
              Open <ArrowRight className="h-4 w-4" />
            </p>
          </Link>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-cloud p-5">
        <div className="flex-1">
          <p className="font-semibold text-ink">Reset admin content</p>
          <p className="text-sm text-ink-soft">
            Restore seeded courses, events, questions, and site settings.
          </p>
        </div>
        <Button variant="secondary" onClick={() => resetToSeed()}>
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
