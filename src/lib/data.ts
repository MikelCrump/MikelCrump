import type { Course, Instructor, LearnerProfile, PlatformEvent } from "./types";

export const learner: LearnerProfile = {
  id: "u-mikel",
  name: "Mikel Crump",
  role: "Operations Lead",
  org: "CRUMP360 Cohort",
  avatarInitials: "MC",
};

export const instructors: Instructor[] = [
  {
    id: "ins-aria",
    name: "Aria Okonkwo",
    title: "Director of Learning Design",
    avatar: "AO",
    bio: "Builds cohort programs that stick — from kickoff rituals to lasting habit loops.",
  },
  {
    id: "ins-jonas",
    name: "Jonas Reed",
    title: "Events Architect",
    avatar: "JR",
    bio: "Produces field gatherings that feel intentional, not crowded. Former festival ops.",
  },
  {
    id: "ins-mira",
    name: "Mira Chen",
    title: "Faculty, Leadership Practice",
    avatar: "MC",
    bio: "Coaches operators through ambiguity with crisp frameworks and calm facilitation.",
  },
];

export const events: PlatformEvent[] = [
  {
    id: "evt-summit-27",
    slug: "crump360-summit-2027",
    title: "CRUMP360 Summit 2027",
    subtitle: "Three days to recalibrate how your teams learn and gather.",
    description:
      "A working summit for operators, facilitators, and L&D leads. Mix of keynotes, design studios, and peer clinics. Leave with a 90-day learning calendar and a playbook for hybrid events that people actually attend. Runs Friday–Sunday.",
    cover:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
    format: "hybrid",
    status: "open",
    category: "Summit",
    city: "Denver, CO",
    startsAt: "2027-10-15T09:00:00-06:00",
    endsAt: "2027-10-17T17:00:00-06:00",
    capacity: 320,
    registered: 214,
    price: 890,
    instructorIds: ["ins-jonas", "ins-aria"],
    tags: ["hybrid", "leadership", "ops", "fri-sun"],
    sessions: [
      {
        id: "s1",
        title: "Opening: Finding True North",
        startsAt: "2027-10-15T09:00:00-06:00",
        endsAt: "2027-10-15T10:30:00-06:00",
        location: "Main Hall + Livestream",
      },
      {
        id: "s2",
        title: "Studio: Design a 6-week cohort",
        startsAt: "2027-10-15T13:00:00-06:00",
        endsAt: "2027-10-15T16:00:00-06:00",
        location: "Studio B",
      },
      {
        id: "s3",
        title: "Clinic: Hybrid attendance that holds",
        startsAt: "2027-10-16T10:00:00-06:00",
        endsAt: "2027-10-16T12:00:00-06:00",
        location: "Workshop 3",
      },
      {
        id: "s4",
        title: "Close: 90-day learning calendar",
        startsAt: "2027-10-17T10:00:00-06:00",
        endsAt: "2027-10-17T12:30:00-06:00",
        location: "Main Hall + Livestream",
      },
    ],
  },
  {
    id: "evt-field-lab",
    slug: "field-lab-austin",
    title: "Field Lab: Facilitation Under Pressure",
    subtitle: "A Friday–Sunday intensive for live session leaders.",
    description:
      "Practice holding rooms when energy dips, agendas slip, and stakeholders push. You'll run live scenarios across three days with coaching between rounds — no slides marathon.",
    cover:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1600&q=80",
    format: "in-person",
    status: "almost-full",
    category: "Workshop",
    city: "Austin, TX",
    startsAt: "2027-06-11T08:30:00-05:00",
    endsAt: "2027-06-13T16:00:00-05:00",
    capacity: 40,
    registered: 36,
    price: 420,
    instructorIds: ["ins-mira"],
    tags: ["facilitation", "in-person", "fri-sun"],
    sessions: [
      {
        id: "s1",
        title: "Warm-up & room contracts",
        startsAt: "2027-06-11T08:30:00-05:00",
        endsAt: "2027-06-11T12:00:00-05:00",
        location: "Studio North",
      },
      {
        id: "s2",
        title: "Scenario rounds",
        startsAt: "2027-06-12T09:00:00-05:00",
        endsAt: "2027-06-12T16:00:00-05:00",
        location: "Studio North",
      },
      {
        id: "s3",
        title: "Debrief & transfer plan",
        startsAt: "2027-06-13T09:00:00-05:00",
        endsAt: "2027-06-13T16:00:00-05:00",
        location: "Studio North",
      },
    ],
  },
  {
    id: "evt-office-hours",
    slug: "learning-ops-clinic-weekend",
    title: "Learning Ops Clinic Weekend",
    subtitle: "Bring a stuck program. Leave with next steps.",
    description:
      "Open virtual clinic weekend for CRUMP360 members. Drop in with a syllabus draft, attendance problem, or measurement question. Small groups rotate with faculty Friday through Sunday.",
    cover:
      "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1600&q=80",
    format: "virtual",
    status: "open",
    category: "Clinic",
    city: "Online",
    startsAt: "2027-03-19T12:00:00-04:00",
    endsAt: "2027-03-21T16:00:00-04:00",
    capacity: 80,
    registered: 41,
    price: 0,
    instructorIds: ["ins-aria"],
    tags: ["virtual", "members", "fri-sun"],
    sessions: [
      {
        id: "s1",
        title: "Friday intake clinic",
        startsAt: "2027-03-19T12:00:00-04:00",
        endsAt: "2027-03-19T14:00:00-04:00",
        location: "Zoom",
      },
      {
        id: "s2",
        title: "Saturday working sessions",
        startsAt: "2027-03-20T10:00:00-04:00",
        endsAt: "2027-03-20T15:00:00-04:00",
        location: "Zoom",
      },
      {
        id: "s3",
        title: "Sunday office hours close",
        startsAt: "2027-03-21T12:00:00-04:00",
        endsAt: "2027-03-21T16:00:00-04:00",
        location: "Zoom",
      },
    ],
  },
  {
    id: "evt-retreat",
    slug: "signal-retreat-maine",
    title: "Signal Retreat",
    subtitle: "A Monday–Friday week for curriculum builders.",
    description:
      "Seven learners, one coastal house, deep work blocks and evening critique. Bring one course or event series you need to finish. We protect the calendar Monday through Friday so you can.",
    cover:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
    format: "in-person",
    status: "waitlist",
    category: "Retreat",
    city: "Camden, ME",
    startsAt: "2027-11-08T09:00:00-05:00",
    endsAt: "2027-11-12T16:00:00-05:00",
    capacity: 7,
    registered: 7,
    price: 2400,
    instructorIds: ["ins-mira", "ins-jonas"],
    tags: ["retreat", "deep-work", "mon-fri"],
    sessions: [
      {
        id: "s1",
        title: "Arrival & intent setting",
        startsAt: "2027-11-08T09:00:00-05:00",
        endsAt: "2027-11-08T12:00:00-05:00",
        location: "House lounge",
      },
      {
        id: "s2",
        title: "Midweek critique",
        startsAt: "2027-11-10T15:00:00-05:00",
        endsAt: "2027-11-10T18:00:00-05:00",
        location: "House lounge",
      },
      {
        id: "s3",
        title: "Ship & close",
        startsAt: "2027-11-12T13:00:00-05:00",
        endsAt: "2027-11-12T16:00:00-05:00",
        location: "House lounge",
      },
    ],
  },
];

export const courses: Course[] = [
  {
    id: "crs-compass",
    slug: "learning-compass",
    title: "Learning Compass",
    subtitle: "Map outcomes before you build modules.",
    description:
      "A foundational course for people who own learning programs. You'll translate business goals into measurable outcomes, choose formats that fit the work, and ship a first cohort plan.",
    cover:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    level: "Foundation",
    category: "Program Design",
    durationHours: 6,
    enrolled: 1284,
    rating: 4.9,
    instructorIds: ["ins-aria"],
    outcomes: [
      "Write outcome statements stakeholders can fund",
      "Choose between event, cohort, and self-paced formats",
      "Draft a 6-week learning calendar",
    ],
    modules: [
      {
        id: "m1",
        title: "Orient",
        lessons: [
          {
            id: "l1",
            title: "Why most LMS journeys go quiet",
            type: "video",
            durationMin: 12,
            summary: "The drop-off pattern and how CRUMP360 counters it.",
            content:
              "Completion rates fall when learning feels like a second job. We start by naming the friction: unclear outcomes, event overload, and no path between a workshop and daily work. This lesson sets the frame for the rest of the course.",
          },
          {
            id: "l2",
            title: "Outcome statements that hold up",
            type: "reading",
            durationMin: 18,
            summary: "A short template for stakeholder-aligned outcomes.",
            content:
              "Write outcomes as observable shifts, not activity counts. Example: “Ops leads can run a 45-minute retrospective without a facilitator” beats “Complete Module 3.” Practice with your current program.",
          },
        ],
      },
      {
        id: "m2",
        title: "Design the path",
        lessons: [
          {
            id: "l3",
            title: "Events vs. courses vs. rituals",
            type: "video",
            durationMin: 16,
            summary: "Pick the right vessel for the change you need.",
            content:
              "Events create energy and belonging. Courses build durable skill. Rituals keep practice alive. Most programs need all three — sequenced, not stacked.",
          },
          {
            id: "l4",
            title: "Checkpoint quiz",
            type: "quiz",
            durationMin: 8,
            summary: "Confirm you can choose the right format.",
            content:
              "Scenario-based quiz: given a stakeholder brief, select the primary vessel and justify the mix. Instant feedback included.",
          },
        ],
      },
      {
        id: "m3",
        title: "Ship",
        lessons: [
          {
            id: "l5",
            title: "Your 90-day learning calendar",
            type: "reading",
            durationMin: 22,
            summary: "Build a calendar that respects attention.",
            content:
              "Block launch, practice, review, and rest. Cap concurrent asks. Pair each major event with a course checkpoint so energy converts into skill.",
          },
        ],
      },
    ],
  },
  {
    id: "crs-stagecraft",
    slug: "event-stagecraft",
    title: "Event Stagecraft",
    subtitle: "Run gatherings people remember for the right reasons.",
    description:
      "From room flow to virtual co-hosting, learn the operational craft behind high-signal events. Built for producers and facilitators who own the day-of experience.",
    cover:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80",
    level: "Practitioner",
    category: "Events",
    durationHours: 5,
    enrolled: 862,
    rating: 4.8,
    instructorIds: ["ins-jonas"],
    outcomes: [
      "Produce a run-of-show that survives contact with reality",
      "Design hybrid moments that include remote guests",
      "Close the loop with post-event learning paths",
    ],
    modules: [
      {
        id: "m1",
        title: "Before doors",
        lessons: [
          {
            id: "l1",
            title: "Run-of-show anatomy",
            type: "video",
            durationMin: 14,
            summary: "Build a living schedule, not a wish list.",
            content:
              "Every beat needs an owner, a cue, and a fallback. We walk a sample summit day and annotate the fragile moments.",
          },
          {
            id: "l2",
            title: "Registration that sets tone",
            type: "reading",
            durationMin: 11,
            summary: "Confirmation emails as orientation, not receipts.",
            content:
              "Use confirmations to set norms, share prep work, and reduce day-of questions. Include a single clear join path for hybrid guests.",
          },
        ],
      },
      {
        id: "m2",
        title: "Live ops",
        lessons: [
          {
            id: "l3",
            title: "Holding the room",
            type: "video",
            durationMin: 19,
            summary: "Energy, timing, and graceful recovery.",
            content:
              "When a segment runs long, you need a practiced cut. When energy drops, change modality — not volume. Practice scripts included.",
          },
          {
            id: "l4",
            title: "Live clinic replay",
            type: "live",
            durationMin: 45,
            summary: "Watch a recorded Field Lab debrief.",
            content:
              "Replay of a CRUMP360 Field Lab with instructor annotations. Pause points ask you to predict the facilitator’s next move.",
          },
        ],
      },
    ],
  },
  {
    id: "crs-signal",
    slug: "signal-leadership",
    title: "Signal Leadership",
    subtitle: "Lead learning without adding noise.",
    description:
      "For managers who sponsor programs. Learn how to champion learning, protect attention, and measure progress without drowning teams in dashboards.",
    cover:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
    level: "Leadership",
    category: "Leadership",
    durationHours: 4,
    enrolled: 640,
    rating: 4.7,
    instructorIds: ["ins-mira", "ins-aria"],
    outcomes: [
      "Sponsor a program with a clear success contract",
      "Coach managers to reinforce learning on the job",
      "Read progress signals without vanity metrics",
    ],
    modules: [
      {
        id: "m1",
        title: "Sponsor craft",
        lessons: [
          {
            id: "l1",
            title: "The success contract",
            type: "video",
            durationMin: 13,
            summary: "Align before you announce.",
            content:
              "A one-page contract between sponsor, facilitator, and learners: purpose, time ask, proof of progress, and exit criteria.",
          },
          {
            id: "l2",
            title: "Reading the signal board",
            type: "reading",
            durationMin: 15,
            summary: "Three metrics that matter.",
            content:
              "Activation, practice completion, and applied transfer. Ignore vanity enrollment spikes unless they convert.",
          },
        ],
      },
    ],
  },
];

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug);
}

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug);
}

export function getInstructors(ids: string[]) {
  return instructors.filter((i) => ids.includes(i.id));
}

export function courseLessonCount(course: Course) {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function findLesson(course: Course, lessonId: string) {
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { module: mod, lesson };
  }
  return null;
}
