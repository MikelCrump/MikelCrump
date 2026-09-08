"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminModulesPage() {
  const courses = useAdminStore((s) => s.courses);
  const addBlankCourse = useAdminStore((s) => s.addBlankCourse);
  const deleteCourse = useAdminStore((s) => s.deleteCourse);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  if (!ready) return <p className="text-ink-soft">Loading modules…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
            Content
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink">Modules</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Manage courses, modules, and lessons that power the CRUMP360 LMS.
          </p>
        </div>
        <Button
          onClick={() => {
            const id = addBlankCourse();
            window.location.href = `/admin/modules/${id}`;
          }}
        >
          <Plus className="h-4 w-4" /> New course
        </Button>
      </div>

      <div className="space-y-3">
        {courses.map((course) => {
          const lessons = course.modules.reduce(
            (sum, m) => sum + m.lessons.length,
            0
          );
          return (
            <div
              key={course.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-cloud p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl text-ink">{course.title}</h2>
                  <span
                    className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                      course.published
                        ? "border-sea/25 bg-sea/10 text-sea"
                        : "border-line bg-mist text-ink-soft"
                    }`}
                  >
                    {course.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {course.level} · {course.modules.length} modules · {lessons} lessons
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/admin/modules/${course.id}`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete course"
                  onClick={() => {
                    if (confirm(`Delete “${course.title}”?`)) deleteCourse(course.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
