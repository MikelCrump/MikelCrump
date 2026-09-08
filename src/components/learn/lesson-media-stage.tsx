"use client";

import { useMemo } from "react";
import { ResolvingMediaPlayer } from "@/components/media/resolving-media-player";
import { useAdminStore } from "@/lib/admin-store";
import type { LessonType } from "@/lib/types";

export function LessonMediaStage({
  courseId,
  moduleId,
  lessonId,
  title,
  type,
  fallbackMediaUrl,
  fallbackPosterUrl,
}: {
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  type: LessonType;
  fallbackMediaUrl?: string;
  fallbackPosterUrl?: string;
}) {
  const courses = useAdminStore((s) => s.courses);

  const adminLesson = useMemo(() => {
    const course = courses.find((c) => c.id === courseId);
    const mod = course?.modules.find((m) => m.id === moduleId);
    return mod?.lessons.find((l) => l.id === lessonId);
  }, [courses, courseId, moduleId, lessonId]);

  const mediaUrl = adminLesson?.mediaUrl || fallbackMediaUrl;
  const posterUrl = adminLesson?.posterUrl || fallbackPosterUrl;
  const lessonType = adminLesson?.type || type;

  const mediaKind =
    lessonType === "reading"
      ? "audio"
      : lessonType === "live"
        ? "live"
        : lessonType === "video"
          ? "video"
          : null;

  if (!mediaUrl || !mediaKind) {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-gradient-to-br from-ink via-ink-soft to-sea p-8 text-cloud">
        <p className="text-xs uppercase tracking-[0.16em] text-star-soft">
          Lesson stage
        </p>
        <p className="mt-3 max-w-xl font-display text-2xl leading-snug">
          {lessonType === "quiz"
            ? "Quiz checkpoint — scenario prompts with instant feedback."
            : "Add a video in Admin → Content modules to play it here."}
        </p>
      </div>
    );
  }

  return (
    <ResolvingMediaPlayer
      src={mediaUrl}
      poster={posterUrl}
      title={adminLesson?.title || title}
      kind={mediaKind}
    />
  );
}
