import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { RegisterButton } from "@/components/actions/learner-actions";
import { Badge } from "@/components/ui/badge";
import { getEvent, getInstructors } from "@/lib/data";
import { formatEventRange, formatPrice, seatsLeft } from "@/lib/utils";

export async function generateStaticParams() {
  const { events } = await import("@/lib/data");
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const faculty = getInstructors(event.instructorIds);
  const left = seatsLeft(event.capacity, event.registered);

  return (
    <article>
      <div className="relative aspect-[21/9] min-h-[220px] overflow-hidden rounded-2xl border border-line">
        <Image
          src={event.cover}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge tone="ink">{event.format}</Badge>
            <Badge tone="star">{event.category}</Badge>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-3xl text-cloud md:text-5xl">
            {event.title}
          </h1>
          <p className="mt-2 max-w-2xl text-cloud/85">{event.subtitle}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl text-ink">About</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{event.description}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Sessions</h2>
            <ul className="mt-4 space-y-3">
              {event.sessions.map((session) => (
                <li
                  key={session.id}
                  className="border-l-2 border-sea pl-4 py-1"
                >
                  <p className="font-semibold text-ink">{session.title}</p>
                  <p className="text-sm text-ink-soft">
                    {formatEventRange(session.startsAt, session.endsAt)} · {session.location}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Faculty</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {faculty.map((person) => (
                <div key={person.id} className="rounded-xl border border-line bg-cloud p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-sm font-bold text-ink">
                    {person.avatar}
                  </div>
                  <p className="mt-3 font-semibold text-ink">{person.name}</p>
                  <p className="text-xs uppercase tracking-[0.1em] text-sea">{person.title}</p>
                  <p className="mt-2 text-sm text-ink-soft">{person.bio}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-cloud p-6 shadow-[0_16px_40px_-28px_rgba(19,42,62,0.4)] lg:sticky lg:top-6">
          <p className="font-display text-3xl text-ink">{formatPrice(event.price)}</p>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-sea" />
              {formatEventRange(event.startsAt, event.endsAt)}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-sea" />
              {event.city}
            </li>
            <li className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 text-sea" />
              {event.registered}/{event.capacity} registered
              {left > 0 ? ` · ${left} left` : " · full"}
            </li>
          </ul>
          <RegisterButton
            eventId={event.id}
            full={left === 0}
            className="mt-6 w-full"
          />
          <Link
            href="/learn"
            className="mt-4 block text-center text-sm font-medium text-sea hover:underline"
          >
            Pair with a course →
          </Link>
        </aside>
      </div>
    </article>
  );
}
