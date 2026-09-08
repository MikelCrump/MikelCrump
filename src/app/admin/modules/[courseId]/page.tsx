"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUploadDropzone } from "@/components/media/media-upload-dropzone";
import { useAdminStore } from "@/lib/admin-store";
import type { AdminCourseDraft, AdminLessonDraft } from "@/lib/admin-types";

export default function AdminCourseEditorPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const courses = useAdminStore((s) => s.courses);
  const upsertCourse = useAdminStore((s) => s.upsertCourse);
  const addBlankModule = useAdminStore((s) => s.addBlankModule);
  const deleteModule = useAdminStore((s) => s.deleteModule);
  const addBlankLesson = useAdminStore((s) => s.addBlankLesson);
  const deleteLesson = useAdminStore((s) => s.deleteLesson);
  const upsertLesson = useAdminStore((s) => s.upsertLesson);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<AdminCourseDraft | null>(null);
  const [activeLesson, setActiveLesson] = useState<{
    moduleId: string;
    lesson: AdminLessonDraft;
  } | null>(null);

  const course = useMemo(
    () => courses.find((c) => c.id === courseId) ?? null,
    [courses, courseId]
  );

  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (course) setDraft(course);
  }, [course]);

  if (!ready) return <p className="text-ink-soft">Loading…</p>;
  if (!draft) {
    return (
      <div>
        <p className="text-ink-soft">Course not found.</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href="/admin/modules">Back</Link>
        </Button>
      </div>
    );
  }

  const saveCourse = () => upsertCourse(draft);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/modules"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-sea hover:underline"
          >
            ← Modules
          </Link>
          <h1 className="mt-2 font-display text-4xl text-ink">{draft.title}</h1>
          <p className="mt-2 text-ink-soft">Edit course details, modules, and lessons.</p>
        </div>
        <Button onClick={saveCourse}>Save course</Button>
      </div>

      <section className="grid gap-4 rounded-xl border border-line bg-cloud p-5 md:grid-cols-2">
        <Field label="Title">
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </Field>
        <Field label="Slug">
          <Input
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
          />
        </Field>
        <Field label="Subtitle">
          <Input
            value={draft.subtitle}
            onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <Input
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          />
        </Field>
        <Field label="Level">
          <select
            className="h-10 w-full rounded-md border border-line bg-cloud px-3 text-sm"
            value={draft.level}
            onChange={(e) =>
              setDraft({
                ...draft,
                level: e.target.value as AdminCourseDraft["level"],
              })
            }
          >
            <option>Foundation</option>
            <option>Practitioner</option>
            <option>Leadership</option>
          </select>
        </Field>
        <Field label="Duration (hours)">
          <Input
            type="number"
            value={draft.durationHours}
            onChange={(e) =>
              setDraft({ ...draft, durationHours: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea
              className="min-h-24 w-full rounded-md border border-line bg-cloud px-3 py-2 text-sm"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink md:col-span-2">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
          />
          Published on the public site
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-ink">Modules & lessons</h2>
          <Button variant="secondary" onClick={() => addBlankModule(draft.id)}>
            <Plus className="h-4 w-4" /> Add module
          </Button>
        </div>

        {draft.modules.map((mod) => (
          <div key={mod.id} className="rounded-xl border border-line bg-cloud p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Input
                className="max-w-md font-display text-lg"
                value={mod.title}
                onChange={(e) => {
                  const modules = draft.modules.map((m) =>
                    m.id === mod.id ? { ...m, title: e.target.value } : m
                  );
                  setDraft({ ...draft, modules });
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => addBlankLesson(draft.id, mod.id)}
                >
                  <Plus className="h-4 w-4" /> Lesson
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this module?")) {
                      deleteModule(draft.id, mod.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-line/70">
              {mod.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium text-ink">{lesson.title}</p>
                    <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">
                      {lesson.type} · {lesson.durationMin} min ·{" "}
                      {lesson.published ? "published" : "draft"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveLesson({ moduleId: mod.id, lesson })}
                    >
                      Edit
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this lesson?")) {
                          deleteLesson(draft.id, mod.id, lesson.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {activeLesson ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-cloud p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl text-ink">Edit lesson</h3>
              <Button variant="ghost" onClick={() => setActiveLesson(null)}>
                Close
              </Button>
            </div>
            <div className="mt-4 grid gap-4">
              <Field label="Title">
                <Input
                  value={activeLesson.lesson.title}
                  onChange={(e) =>
                    setActiveLesson({
                      ...activeLesson,
                      lesson: { ...activeLesson.lesson, title: e.target.value },
                    })
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type">
                  <select
                    className="h-10 w-full rounded-md border border-line bg-cloud px-3 text-sm"
                    value={activeLesson.lesson.type}
                    onChange={(e) =>
                      setActiveLesson({
                        ...activeLesson,
                        lesson: {
                          ...activeLesson.lesson,
                          type: e.target.value as AdminLessonDraft["type"],
                        },
                      })
                    }
                  >
                    <option value="video">video</option>
                    <option value="reading">reading</option>
                    <option value="quiz">quiz</option>
                    <option value="live">live</option>
                  </select>
                </Field>
                <Field label="Duration (min)">
                  <Input
                    type="number"
                    value={activeLesson.lesson.durationMin}
                    onChange={(e) =>
                      setActiveLesson({
                        ...activeLesson,
                        lesson: {
                          ...activeLesson.lesson,
                          durationMin: Number(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </Field>
              </div>
              <Field label="Summary">
                <Input
                  value={activeLesson.lesson.summary}
                  onChange={(e) =>
                    setActiveLesson({
                      ...activeLesson,
                      lesson: { ...activeLesson.lesson, summary: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Content">
                <textarea
                  className="min-h-28 w-full rounded-md border border-line bg-cloud px-3 py-2 text-sm"
                  value={activeLesson.lesson.content}
                  onChange={(e) =>
                    setActiveLesson({
                      ...activeLesson,
                      lesson: { ...activeLesson.lesson, content: e.target.value },
                    })
                  }
                />
              </Field>
              <MediaUploadDropzone
                label="Lesson video / audio"
                value={activeLesson.lesson.mediaUrl}
                onChange={(next) =>
                  setActiveLesson({
                    ...activeLesson,
                    lesson: {
                      ...activeLesson.lesson,
                      mediaUrl: next,
                    },
                  })
                }
              />
              <Field label="Or paste a media URL (optional)">
                <Input
                  placeholder="https://…"
                  value={
                    activeLesson.lesson.mediaUrl?.startsWith("idb:")
                      ? ""
                      : activeLesson.lesson.mediaUrl ?? ""
                  }
                  onChange={(e) =>
                    setActiveLesson({
                      ...activeLesson,
                      lesson: {
                        ...activeLesson.lesson,
                        mediaUrl: e.target.value || undefined,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Poster URL">
                <Input
                  value={activeLesson.lesson.posterUrl ?? ""}
                  onChange={(e) =>
                    setActiveLesson({
                      ...activeLesson,
                      lesson: {
                        ...activeLesson.lesson,
                        posterUrl: e.target.value || undefined,
                      },
                    })
                  }
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={activeLesson.lesson.published}
                  onChange={(e) =>
                    setActiveLesson({
                      ...activeLesson,
                      lesson: {
                        ...activeLesson.lesson,
                        published: e.target.checked,
                      },
                    })
                  }
                />
                Published
              </label>
              <Button
                onClick={() => {
                  upsertLesson(
                    draft.id,
                    activeLesson.moduleId,
                    activeLesson.lesson
                  );
                  // Keep local draft modules in sync
                  setDraft({
                    ...draft,
                    modules: draft.modules.map((m) =>
                      m.id !== activeLesson.moduleId
                        ? m
                        : {
                            ...m,
                            lessons: m.lessons.map((l) =>
                              l.id === activeLesson.lesson.id
                                ? activeLesson.lesson
                                : l
                            ),
                          }
                    ),
                  });
                  setActiveLesson(null);
                }}
              >
                Save lesson
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
