"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCrump360 } from "@/lib/store";
import { cn } from "@/lib/utils";

export function RegisterButton({
  eventId,
  full,
  className,
}: {
  eventId: string;
  full?: boolean;
  className?: string;
}) {
  const registerForEvent = useCrump360((s) => s.registerForEvent);
  const isRegistered = useCrump360((s) => s.isRegistered);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const registered = ready && isRegistered(eventId);

  return (
    <Button
      className={cn(className)}
      variant={registered ? "secondary" : "sea"}
      size="lg"
      disabled={registered || full}
      onClick={() => registerForEvent(eventId)}
    >
      {registered ? "You're registered" : full ? "Join waitlist" : "Register"}
    </Button>
  );
}

export function EnrollButton({
  courseId,
  className,
}: {
  courseId: string;
  className?: string;
}) {
  const enrollInCourse = useCrump360((s) => s.enrollInCourse);
  const isEnrolled = useCrump360((s) => s.isEnrolled);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const enrolled = ready && isEnrolled(courseId);

  return (
    <Button
      className={cn(className)}
      variant={enrolled ? "secondary" : "default"}
      size="lg"
      disabled={enrolled}
      onClick={() => enrollInCourse(courseId)}
    >
      {enrolled ? "Enrolled" : "Enroll free"}
    </Button>
  );
}

export function CompleteLessonButton({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const completeLesson = useCrump360((s) => s.completeLesson);
  const isLessonComplete = useCrump360((s) => s.isLessonComplete);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const done = ready && isLessonComplete(courseId, lessonId);

  return (
    <Button
      variant={done ? "secondary" : "sea"}
      onClick={() => completeLesson(courseId, lessonId)}
      disabled={done}
    >
      {done ? "Completed" : "Mark complete"}
    </Button>
  );
}
