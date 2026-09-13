import { CourseCard } from "@/components/catalog/cards";
import { courses } from "@/lib/data";

export const metadata = {
  title: "Learn",
};

export default function LearnPage() {
  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          Learning management
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Courses with a clear path
        </h1>
        <p className="mt-4 text-ink-soft">
          Self-paced modules designed to extend the energy of your events into lasting skill.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
