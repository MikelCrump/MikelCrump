import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/actions/learner-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  courseLessonCount,
  getCourse,
  getInstructors,
} from "@/lib/data";

export async function generateStaticParams() {
  const { courses } = await import("@/lib/data");
  return courses.map((c) => ({ slug: c.slug }));
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const faculty = getInstructors(course.instructorIds);
  const firstLesson = course.modules[0]?.lessons[0];
  const lessons = courseLessonCount(course);

  return (
    <article>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <Badge tone="sea">{course.level}</Badge>
          <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">{course.title}</h1>
          <p className="mt-3 text-lg text-ink-soft">{course.subtitle}</p>
          <p className="mt-5 leading-relaxed text-ink-soft">{course.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <EnrollButton courseId={course.id} />
            {firstLesson ? (
              <Button asChild variant="secondary" size="lg">
                <Link href={`/learn/${course.slug}/${firstLesson.id}`}>
                  Start learning
                </Link>
              </Button>
            ) : null}
          </div>

          <ul className="mt-8 space-y-2">
            {course.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2 text-sm text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-star" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
          <Image
            src={course.cover}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 40vw"
            priority
          />
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section>
          <h2 className="font-display text-2xl text-ink">
            Curriculum · {lessons} lessons · {course.durationHours}h
          </h2>
          <div className="mt-5 space-y-4">
            {course.modules.map((mod, idx) => (
              <div key={mod.id} className="rounded-xl border border-line bg-cloud p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sea">
                  Module {idx + 1}
                </p>
                <h3 className="mt-1 font-display text-xl text-ink">{mod.title}</h3>
                <ul className="mt-4 divide-y divide-line/70">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/learn/${course.slug}/${lesson.id}`}
                        className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-sea"
                      >
                        <span>
                          <span className="font-medium text-ink">{lesson.title}</span>
                          <span className="mt-0.5 block text-xs uppercase tracking-[0.1em] text-ink-soft">
                            {lesson.type} · {lesson.durationMin} min
                          </span>
                        </span>
                        <span aria-hidden>→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <h2 className="font-display text-2xl text-ink">Instructors</h2>
          <div className="mt-4 space-y-4">
            {faculty.map((person) => (
              <div key={person.id} className="rounded-xl border border-line bg-cloud p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-sm font-bold">
                  {person.avatar}
                </div>
                <p className="mt-3 font-semibold">{person.name}</p>
                <p className="text-xs uppercase tracking-[0.1em] text-sea">{person.title}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </article>
  );
}
