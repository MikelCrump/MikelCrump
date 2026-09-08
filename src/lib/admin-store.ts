"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createId,
  defaultSiteSettings,
  seedAdminCourses,
  seedAdminEvents,
  seedQuizQuestions,
} from "./admin-seed";
import type {
  AdminCourseDraft,
  AdminEventDraft,
  AdminLessonDraft,
  AdminModuleDraft,
  QuizQuestion,
  SiteSettings,
} from "./admin-types";

interface AdminState {
  hydrated: boolean;
  courses: AdminCourseDraft[];
  events: AdminEventDraft[];
  questions: QuizQuestion[];
  site: SiteSettings;
  setHydrated: (value: boolean) => void;
  resetToSeed: () => void;
  updateSite: (patch: Partial<SiteSettings>) => void;
  upsertCourse: (course: AdminCourseDraft) => void;
  deleteCourse: (courseId: string) => void;
  upsertModule: (courseId: string, mod: AdminModuleDraft) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
  upsertLesson: (
    courseId: string,
    moduleId: string,
    lesson: AdminLessonDraft
  ) => void;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => void;
  upsertQuestion: (question: QuizQuestion) => void;
  deleteQuestion: (questionId: string) => void;
  upsertEvent: (event: AdminEventDraft) => void;
  deleteEvent: (eventId: string) => void;
  addBlankCourse: () => string;
  addBlankModule: (courseId: string) => string;
  addBlankLesson: (courseId: string, moduleId: string) => string;
  addBlankQuestion: (courseId: string, moduleId: string) => string;
}

const seed = () => ({
  courses: seedAdminCourses(),
  events: seedAdminEvents(),
  questions: seedQuizQuestions(),
  site: defaultSiteSettings,
});

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...seed(),
      setHydrated: (value) => set({ hydrated: value }),
      resetToSeed: () => set(seed()),
      updateSite: (patch) =>
        set((s) => ({
          site: { ...s.site, ...patch },
        })),
      upsertCourse: (course) =>
        set((s) => {
          const idx = s.courses.findIndex((c) => c.id === course.id);
          if (idx === -1) return { courses: [...s.courses, course] };
          const courses = [...s.courses];
          courses[idx] = course;
          return { courses };
        }),
      deleteCourse: (courseId) =>
        set((s) => ({
          courses: s.courses.filter((c) => c.id !== courseId),
          questions: s.questions.filter((q) => q.courseId !== courseId),
        })),
      upsertModule: (courseId, mod) =>
        set((s) => ({
          courses: s.courses.map((course) => {
            if (course.id !== courseId) return course;
            const idx = course.modules.findIndex((m) => m.id === mod.id);
            if (idx === -1) {
              return { ...course, modules: [...course.modules, mod] };
            }
            const modules = [...course.modules];
            modules[idx] = mod;
            return { ...course, modules };
          }),
        })),
      deleteModule: (courseId, moduleId) =>
        set((s) => ({
          courses: s.courses.map((course) =>
            course.id !== courseId
              ? course
              : {
                  ...course,
                  modules: course.modules.filter((m) => m.id !== moduleId),
                }
          ),
          questions: s.questions.filter(
            (q) => !(q.courseId === courseId && q.moduleId === moduleId)
          ),
        })),
      upsertLesson: (courseId, moduleId, lesson) =>
        set((s) => ({
          courses: s.courses.map((course) => {
            if (course.id !== courseId) return course;
            return {
              ...course,
              modules: course.modules.map((mod) => {
                if (mod.id !== moduleId) return mod;
                const idx = mod.lessons.findIndex((l) => l.id === lesson.id);
                if (idx === -1) {
                  return { ...mod, lessons: [...mod.lessons, lesson] };
                }
                const lessons = [...mod.lessons];
                lessons[idx] = lesson;
                return { ...mod, lessons };
              }),
            };
          }),
        })),
      deleteLesson: (courseId, moduleId, lessonId) =>
        set((s) => ({
          courses: s.courses.map((course) => {
            if (course.id !== courseId) return course;
            return {
              ...course,
              modules: course.modules.map((mod) =>
                mod.id !== moduleId
                  ? mod
                  : {
                      ...mod,
                      lessons: mod.lessons.filter((l) => l.id !== lessonId),
                    }
              ),
            };
          }),
          questions: s.questions.filter((q) => q.lessonId !== lessonId),
        })),
      upsertQuestion: (question) =>
        set((s) => {
          const idx = s.questions.findIndex((q) => q.id === question.id);
          if (idx === -1) return { questions: [...s.questions, question] };
          const questions = [...s.questions];
          questions[idx] = question;
          return { questions };
        }),
      deleteQuestion: (questionId) =>
        set((s) => ({
          questions: s.questions.filter((q) => q.id !== questionId),
        })),
      upsertEvent: (event) =>
        set((s) => {
          const idx = s.events.findIndex((e) => e.id === event.id);
          if (idx === -1) return { events: [...s.events, event] };
          const events = [...s.events];
          events[idx] = event;
          return { events };
        }),
      deleteEvent: (eventId) =>
        set((s) => ({
          events: s.events.filter((e) => e.id !== eventId),
        })),
      addBlankCourse: () => {
        const id = createId("crs");
        const course: AdminCourseDraft = {
          id,
          slug: `new-course-${id.slice(-4)}`,
          title: "Untitled course",
          subtitle: "Add a short subtitle",
          description: "Describe what learners will gain.",
          cover:
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
          level: "Foundation",
          category: "Program Design",
          durationHours: 4,
          published: false,
          modules: [],
        };
        get().upsertCourse(course);
        return id;
      },
      addBlankModule: (courseId) => {
        const id = createId("mod");
        get().upsertModule(courseId, {
          id,
          title: "New module",
          lessons: [],
        });
        return id;
      },
      addBlankLesson: (courseId, moduleId) => {
        const id = createId("les");
        get().upsertLesson(courseId, moduleId, {
          id,
          title: "New lesson",
          type: "video",
          durationMin: 10,
          summary: "Lesson summary",
          content: "Lesson content goes here.",
          published: false,
        });
        return id;
      },
      addBlankQuestion: (courseId, moduleId) => {
        const id = createId("q");
        const choiceA = createId("c");
        get().upsertQuestion({
          id,
          courseId,
          moduleId,
          prompt: "New question prompt",
          choices: [
            { id: choiceA, text: "Option A" },
            { id: createId("c"), text: "Option B" },
            { id: createId("c"), text: "Option C" },
            { id: createId("c"), text: "Option D" },
          ],
          correctChoiceId: choiceA,
          explanation: "Explain the correct answer.",
          published: false,
        });
        return id;
      },
    }),
    {
      name: "crump360-admin",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
