import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Course, PlatformEvent } from "@/lib/types";
import { formatEventRange, formatPrice, seatsLeft } from "@/lib/utils";

export function EventCard({ event }: { event: PlatformEvent }) {
  const left = seatsLeft(event.capacity, event.registered);
  const statusTone =
    event.status === "open"
      ? "sea"
      : event.status === "almost-full"
        ? "warn"
        : event.status === "waitlist"
          ? "star"
          : "mist";

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group lift block overflow-hidden rounded-xl border border-line bg-cloud shadow-[0_1px_0_rgba(19,42,62,0.04)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={event.cover}
          alt=""
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-2">
          <Badge tone="ink">{event.format}</Badge>
          <Badge tone={statusTone}>{event.status.replace("-", " ")}</Badge>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sea">
            {event.category} · {event.city}
          </p>
          <h3 className="mt-1 font-display text-xl leading-snug text-ink group-hover:text-sea">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">{event.subtitle}</p>
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-line/70 pt-3 text-sm">
          <div>
            <p className="font-medium text-ink">{formatEventRange(event.startsAt, event.endsAt)}</p>
            <p className="text-ink-soft">
              {left === 0 ? "Full" : `${left} seats left`} · {formatPrice(event.price)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/learn/${course.slug}`}
      className="group lift block overflow-hidden rounded-xl border border-line bg-cloud"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={course.cover}
          alt=""
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute left-3 top-3">
          <Badge tone="ink">{course.level}</Badge>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sea">
            {course.category} · {course.durationHours}h
          </p>
          <h3 className="mt-1 font-display text-xl leading-snug text-ink group-hover:text-sea">
            {course.title}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">{course.subtitle}</p>
        </div>
        <div className="flex items-center justify-between border-t border-line/70 pt-3 text-sm text-ink-soft">
          <span>{course.enrolled.toLocaleString()} learners</span>
          <span className="font-semibold text-ink">{course.rating.toFixed(1)} ★</span>
        </div>
      </div>
    </Link>
  );
}
