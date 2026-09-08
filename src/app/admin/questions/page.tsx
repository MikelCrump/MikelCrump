"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createId } from "@/lib/admin-seed";
import { useAdminStore } from "@/lib/admin-store";
import type { QuizQuestion } from "@/lib/admin-types";

export default function AdminQuestionsPage() {
  const courses = useAdminStore((s) => s.courses);
  const questions = useAdminStore((s) => s.questions);
  const upsertQuestion = useAdminStore((s) => s.upsertQuestion);
  const deleteQuestion = useAdminStore((s) => s.deleteQuestion);
  const addBlankQuestion = useAdminStore((s) => s.addBlankQuestion);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<QuizQuestion | null>(null);
  const [filterCourseId, setFilterCourseId] = useState("all");

  useEffect(() => setReady(true), []);

  const filtered = useMemo(
    () =>
      filterCourseId === "all"
        ? questions
        : questions.filter((q) => q.courseId === filterCourseId),
    [questions, filterCourseId]
  );

  if (!ready) return <p className="text-ink-soft">Loading questions…</p>;

  const courseTitle = (id: string) =>
    courses.find((c) => c.id === id)?.title ?? id;

  const moduleTitle = (courseId: string, moduleId: string) =>
    courses
      .find((c) => c.id === courseId)
      ?.modules.find((m) => m.id === moduleId)?.title ?? moduleId;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
            Assessment
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink">
            Questions & answers
          </h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Create module questions, set correct answers, and publish explanations for
            learners.
          </p>
        </div>
        <Button
          onClick={() => {
            const course = courses[0];
            const mod = course?.modules[0];
            if (!course || !mod) return;
            const id = addBlankQuestion(course.id, mod.id);
            const q = useAdminStore.getState().questions.find((x) => x.id === id);
            if (q) setEditing(q);
          }}
        >
          <Plus className="h-4 w-4" /> New question
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label>Filter by course</Label>
        <select
          className="h-10 rounded-md border border-line bg-cloud px-3 text-sm"
          value={filterCourseId}
          onChange={(e) => setFilterCourseId(e.target.value)}
        >
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-line bg-cloud p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sea">
                  {courseTitle(q.courseId)} · {moduleTitle(q.courseId, q.moduleId)}
                </p>
                <p className="mt-1 font-medium text-ink">{q.prompt}</p>
                <p className="mt-2 text-sm text-ink-soft">
                  Correct:{" "}
                  {q.choices.find((c) => c.id === q.correctChoiceId)?.text ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                    q.published
                      ? "border-sea/25 bg-sea/10 text-sea"
                      : "border-line bg-mist text-ink-soft"
                  }`}
                >
                  {q.published ? "Published" : "Draft"}
                </span>
                <Button size="sm" variant="secondary" onClick={() => setEditing(q)}>
                  Edit
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this question?")) deleteQuestion(q.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="text-ink-soft">No questions yet for this filter.</p>
        ) : null}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-cloud p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Edit question</h2>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Course</Label>
                  <select
                    className="h-10 w-full rounded-md border border-line bg-cloud px-3 text-sm"
                    value={editing.courseId}
                    onChange={(e) => {
                      const course = courses.find((c) => c.id === e.target.value);
                      setEditing({
                        ...editing,
                        courseId: e.target.value,
                        moduleId: course?.modules[0]?.id ?? "",
                      });
                    }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Module</Label>
                  <select
                    className="h-10 w-full rounded-md border border-line bg-cloud px-3 text-sm"
                    value={editing.moduleId}
                    onChange={(e) =>
                      setEditing({ ...editing, moduleId: e.target.value })
                    }
                  >
                    {(
                      courses.find((c) => c.id === editing.courseId)?.modules ?? []
                    ).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Prompt</Label>
                <textarea
                  className="min-h-24 w-full rounded-md border border-line bg-cloud px-3 py-2 text-sm"
                  value={editing.prompt}
                  onChange={(e) =>
                    setEditing({ ...editing, prompt: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Choices</Label>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        choices: [
                          ...editing.choices,
                          { id: createId("c"), text: "New choice" },
                        ],
                      })
                    }
                  >
                    Add choice
                  </Button>
                </div>
                {editing.choices.map((choice) => (
                  <div key={choice.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={editing.correctChoiceId === choice.id}
                      onChange={() =>
                        setEditing({ ...editing, correctChoiceId: choice.id })
                      }
                      aria-label="Mark correct"
                    />
                    <Input
                      value={choice.text}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          choices: editing.choices.map((c) =>
                            c.id === choice.id
                              ? { ...c, text: e.target.value }
                              : c
                          ),
                        })
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          choices: editing.choices.filter(
                            (c) => c.id !== choice.id
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-ink-soft">
                  Select the radio button next to the correct answer.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Explanation</Label>
                <textarea
                  className="min-h-20 w-full rounded-md border border-line bg-cloud px-3 py-2 text-sm"
                  value={editing.explanation}
                  onChange={(e) =>
                    setEditing({ ...editing, explanation: e.target.value })
                  }
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) =>
                    setEditing({ ...editing, published: e.target.checked })
                  }
                />
                Published
              </label>

              <Button
                onClick={() => {
                  upsertQuestion(editing);
                  setEditing(null);
                }}
              >
                Save question
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
