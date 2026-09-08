"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/lib/admin-store";

export function ModuleQuiz({
  courseId,
  moduleId,
  lessonId,
}: {
  courseId: string;
  moduleId: string;
  lessonId?: string;
}) {
  const questions = useAdminStore((s) => s.questions);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const items = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.published &&
          q.courseId === courseId &&
          q.moduleId === moduleId &&
          (!lessonId || !q.lessonId || q.lessonId === lessonId)
      ),
    [questions, courseId, moduleId, lessonId]
  );

  if (items.length === 0) return null;

  const score = items.reduce(
    (sum, q) => sum + (answers[q.id] === q.correctChoiceId ? 1 : 0),
    0
  );

  return (
    <section className="mt-10 space-y-4 rounded-xl border border-line bg-mist/40 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sea">
          Module questions
        </p>
        <h2 className="mt-1 font-display text-2xl text-ink">Check your understanding</h2>
      </div>

      {items.map((q, idx) => {
        const selected = answers[q.id];
        const showResult = submitted;
        return (
          <div key={q.id} className="rounded-xl border border-line bg-cloud p-4">
            <p className="font-medium text-ink">
              {idx + 1}. {q.prompt}
            </p>
            <div className="mt-3 space-y-2">
              {q.choices.map((choice) => {
                const isCorrect = choice.id === q.correctChoiceId;
                const isSelected = selected === choice.id;
                return (
                  <label
                    key={choice.id}
                    className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                      showResult && isCorrect
                        ? "border-sea bg-sea/10"
                        : showResult && isSelected && !isCorrect
                          ? "border-danger/40 bg-red-50"
                          : isSelected
                            ? "border-ink/30 bg-mist"
                            : "border-line hover:bg-mist/50"
                    }`}
                  >
                    <input
                      type="radio"
                      className="mt-1"
                      name={q.id}
                      checked={isSelected}
                      disabled={submitted}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: choice.id }))
                      }
                    />
                    <span>{choice.text}</span>
                  </label>
                );
              })}
            </div>
            {showResult ? (
              <p className="mt-3 text-sm text-ink-soft">{q.explanation}</p>
            ) : null}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        {!submitted ? (
          <Button onClick={() => setSubmitted(true)}>Check answers</Button>
        ) : (
          <>
            <p className="text-sm font-semibold text-ink">
              Score: {score}/{items.length}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
            >
              Try again
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
