import type { Course, LessonType, PlatformEvent } from "./types";

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  courseId: string;
  moduleId: string;
  lessonId?: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
  published: boolean;
}

export interface SiteSettings {
  siteName: string;
  brandUrl: string;
  tagline: string;
  heroHeadline: string;
  heroSupport: string;
  announcement: string;
  supportEmail: string;
  maintenanceMode: boolean;
}

export interface AdminCourseDraft {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  level: Course["level"];
  category: string;
  durationHours: number;
  published: boolean;
  modules: AdminModuleDraft[];
}

export interface AdminModuleDraft {
  id: string;
  title: string;
  lessons: AdminLessonDraft[];
}

export interface AdminLessonDraft {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number;
  summary: string;
  content: string;
  mediaUrl?: string;
  posterUrl?: string;
  published: boolean;
}

export interface AdminEventDraft extends PlatformEvent {
  published: boolean;
}

export type AdminSection =
  | "overview"
  | "modules"
  | "questions"
  | "events"
  | "site";
