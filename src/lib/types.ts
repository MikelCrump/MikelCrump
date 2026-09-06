export type EventFormat = "in-person" | "virtual" | "hybrid";
export type EventStatus = "open" | "almost-full" | "waitlist" | "closed";
export type LessonType = "video" | "reading" | "quiz" | "live";

export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
}

export interface EventSession {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
}

export interface PlatformEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  format: EventFormat;
  status: EventStatus;
  category: string;
  city: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registered: number;
  price: number;
  instructorIds: string[];
  sessions: EventSession[];
  tags: string[];
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number;
  summary: string;
  content: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  level: "Foundation" | "Practitioner" | "Leadership";
  category: string;
  durationHours: number;
  enrolled: number;
  rating: number;
  instructorIds: string[];
  modules: Module[];
  outcomes: string[];
}

export interface LearnerProfile {
  id: string;
  name: string;
  role: string;
  org: string;
  avatarInitials: string;
}
