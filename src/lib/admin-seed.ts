import { courses, events } from "./data";
import type {
  AdminCourseDraft,
  AdminEventDraft,
  QuizQuestion,
  SiteSettings,
} from "./admin-types";

export const defaultSiteSettings: SiteSettings = {
  siteName: "CRUMP360",
  brandUrl: "https://crump360.com",
  tagline: "Gatherings that teach. Courses that stick.",
  heroHeadline: "Gatherings that teach. Courses that stick.",
  heroSupport:
    "One platform for events and learning — so every summit, clinic, and cohort points the same direction.",
  announcement: "CRUMP360 Summit 2027 registration is open.",
  supportEmail: "ops@crump360.com",
  maintenanceMode: false,
};

export function seedAdminCourses(): AdminCourseDraft[] {
  return courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    cover: course.cover,
    level: course.level,
    category: course.category,
    durationHours: course.durationHours,
    published: true,
    modules: course.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      lessons: mod.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        durationMin: lesson.durationMin,
        summary: lesson.summary,
        content: lesson.content,
        mediaUrl: lesson.mediaUrl,
        posterUrl: lesson.posterUrl,
        published: true,
      })),
    })),
  }));
}

export function seedAdminEvents(): AdminEventDraft[] {
  return events.map((event) => ({
    ...event,
    published: true,
  }));
}

export function seedQuizQuestions(): QuizQuestion[] {
  return [
    {
      id: "q-compass-1",
      courseId: "crs-compass",
      moduleId: "m2",
      lessonId: "l4",
      prompt:
        "A stakeholder wants measurable skill change in 6 weeks. What should be the primary vessel?",
      choices: [
        { id: "a", text: "A one-day summit with no follow-up" },
        { id: "b", text: "A cohort course with practice checkpoints" },
        { id: "c", text: "An announcement email series only" },
        { id: "d", text: "A vanity enrollment campaign" },
      ],
      correctChoiceId: "b",
      explanation:
        "Cohort courses create durable skill when paired with practice. Events create energy; they rarely create lasting capability alone.",
      published: true,
    },
    {
      id: "q-compass-2",
      courseId: "crs-compass",
      moduleId: "m1",
      lessonId: "l2",
      prompt: "Which outcome statement is strongest?",
      choices: [
        { id: "a", text: "Complete Module 3 by Friday" },
        {
          id: "b",
          text: "Ops leads can run a 45-minute retrospective without a facilitator",
        },
        { id: "c", text: "Increase learning engagement" },
        { id: "d", text: "Host more webinars this quarter" },
      ],
      correctChoiceId: "b",
      explanation:
        "Strong outcomes are observable shifts in capability, not activity counts.",
      published: true,
    },
    {
      id: "q-stage-1",
      courseId: "crs-stagecraft",
      moduleId: "m2",
      lessonId: "l3",
      prompt: "A segment runs 12 minutes long. What should you do first?",
      choices: [
        { id: "a", text: "Speak louder to regain energy" },
        { id: "b", text: "Execute a practiced cut and protect the next critical beat" },
        { id: "c", text: "Cancel the remaining agenda" },
        { id: "d", text: "Ignore timing and hope it works out" },
      ],
      correctChoiceId: "b",
      explanation:
        "Live ops depends on rehearsed recovery. Cut gracefully and protect the beats that matter.",
      published: true,
    },
    {
      id: "q-signal-1",
      courseId: "crs-signal",
      moduleId: "m1",
      lessonId: "l2",
      prompt: "Which metric best signals learning transfer?",
      choices: [
        { id: "a", text: "Total enrollments this month" },
        { id: "b", text: "Page views on the course catalog" },
        {
          id: "c",
          text: "Managers confirming applied practice on the job",
        },
        { id: "d", text: "Number of slides in the deck" },
      ],
      correctChoiceId: "c",
      explanation:
        "Transfer is proven in work behavior, not vanity enrollment spikes.",
      published: true,
    },
  ];
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
