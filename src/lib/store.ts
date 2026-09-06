"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Crump360State {
  registeredEventIds: string[];
  enrolledCourseIds: string[];
  completedLessons: Record<string, string[]>;
  registerForEvent: (eventId: string) => void;
  enrollInCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  isRegistered: (eventId: string) => boolean;
  isEnrolled: (courseId: string) => boolean;
  isLessonComplete: (courseId: string, lessonId: string) => boolean;
  courseProgress: (courseId: string, totalLessons: number) => number;
}

export const useCrump360 = create<Crump360State>()(
  persist(
    (set, get) => ({
      registeredEventIds: ["evt-office-hours"],
      enrolledCourseIds: ["crs-compass"],
      completedLessons: {
        "crs-compass": ["l1"],
      },
      registerForEvent: (eventId) =>
        set((s) =>
          s.registeredEventIds.includes(eventId)
            ? s
            : { registeredEventIds: [...s.registeredEventIds, eventId] }
        ),
      enrollInCourse: (courseId) =>
        set((s) =>
          s.enrolledCourseIds.includes(courseId)
            ? s
            : { enrolledCourseIds: [...s.enrolledCourseIds, courseId] }
        ),
      completeLesson: (courseId, lessonId) =>
        set((s) => {
          const current = s.completedLessons[courseId] ?? [];
          if (current.includes(lessonId)) return s;
          return {
            completedLessons: {
              ...s.completedLessons,
              [courseId]: [...current, lessonId],
            },
            enrolledCourseIds: s.enrolledCourseIds.includes(courseId)
              ? s.enrolledCourseIds
              : [...s.enrolledCourseIds, courseId],
          };
        }),
      isRegistered: (eventId) => get().registeredEventIds.includes(eventId),
      isEnrolled: (courseId) => get().enrolledCourseIds.includes(courseId),
      isLessonComplete: (courseId, lessonId) =>
        (get().completedLessons[courseId] ?? []).includes(lessonId),
      courseProgress: (courseId, totalLessons) => {
        if (totalLessons === 0) return 0;
        const done = get().completedLessons[courseId]?.length ?? 0;
        return Math.round((done / totalLessons) * 100);
      },
    }),
    { name: "crump360-learner" }
  )
);

/** @deprecated Use useCrump360 */
export const useNorthstar = useCrump360;
