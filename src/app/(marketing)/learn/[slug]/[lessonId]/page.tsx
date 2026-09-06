import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteLessonButton } from "@/components/actions/learner-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findLesson, getCourse } from "@/lib/data";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const found = findLesson(course, lessonId);
  if (!found) notFound();

  const { module, lesson } = found;
  const flat = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
  );
  const index = flat.findIndex((l) => l.id === lessonId);
  const prev = index > 0 ? flat[index - 1] : null;
  const next = index < flat.length - 1 ? flat[index + 1] : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-xl border border-line bg-cloud p-4 lg:sticky lg:top-6">
        <Link
          href={`/learn/${course.slug}`}
          className="text-xs font-semibold uppercase tracking-[0.12em] text-sea hover:underline"
        >
          ← {course.title}
        </Link>
        <nav className="mt-4 space-y-4">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                {mod.title}
              </p>
              <ul className="mt-2 space-y-1">
                {mod.lessons.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/learn/${course.slug}/${item.id}`}
                      className={`block rounded-md px-2 py-1.5 text-sm ${
                        item.id === lessonId
                          ? "bg-mist font-semibold text-ink"
                          : "text-ink-soft hover:bg-mist/70 hover:text-ink"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <article className="rounded-2xl border border-line bg-cloud p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="mist">{module.title}</Badge>
          <Badge tone="sea">{lesson.type}</Badge>
          <span className="text-xs text-ink-soft">{lesson.durationMin} min</span>
        </div>
        <h1 className="mt-4 font-display text-3xl text-ink md:text-4xl">{lesson.title}</h1>
        <p className="mt-2 text-ink-soft">{lesson.summary}</p>

        <div className="mt-8 overflow-hidden rounded-xl border border-line bg-gradient-to-br from-ink via-ink-soft to-sea p-8 text-cloud">
          <p className="text-xs uppercase tracking-[0.16em] text-star-soft">Lesson stage</p>
          <p className="mt-3 max-w-xl font-display text-2xl leading-snug">
            {lesson.type === "video"
              ? "Video lesson ready — imagine a crisp instructor walkthrough here."
              : lesson.type === "quiz"
                ? "Quiz checkpoint — scenario prompts with instant feedback."
                : lesson.type === "live"
                  ? "Live replay — annotated facilitation moments."
                  : "Reading desk — focused prose, no slide dump."}
          </p>
        </div>

        <div className="prose-crump360 mt-8 max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink-soft">
          {lesson.content.split("\n\n").map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <div className="flex gap-2">
            {prev ? (
              <Button asChild variant="secondary">
                <Link href={`/learn/${course.slug}/${prev.id}`}>Previous</Link>
              </Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button asChild variant="ghost">
                <Link href={`/learn/${course.slug}/${next.id}`}>Next lesson</Link>
              </Button>
            ) : null}
          </div>
          <CompleteLessonButton courseId={course.id} lessonId={lesson.id} />
        </div>
      </article>
    </div>
  );
}
