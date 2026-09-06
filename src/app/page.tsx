import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Map, Sparkles } from "lucide-react";
import { NorthstarMark } from "@/components/brand/northstar-mark";
import { EventCard, CourseCard } from "@/components/catalog/cards";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { Button } from "@/components/ui/button";
import { courses, events } from "@/lib/data";

export default function HomePage() {
  const featuredEvents = events.slice(0, 3);
  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="aurora-bg min-h-screen">
      <div className="constellation">
        <SiteHeader />

        <main>
          <section className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-8 pt-6 md:px-8 md:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-12 lg:pb-14">
            <div className="relative z-10">
              <div className="reveal flex items-center gap-3">
                <NorthstarMark className="h-14 w-14" animate />
                <p className="font-display text-5xl tracking-tight text-ink sm:text-6xl md:text-7xl">
                  Northstar
                </p>
              </div>
              <h1 className="reveal reveal-delay-1 mt-6 max-w-xl font-display text-3xl leading-[1.12] text-ink text-balance sm:text-4xl md:text-[2.75rem]">
                Gatherings that teach. Courses that stick.
              </h1>
              <p className="reveal reveal-delay-2 mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
                One platform for events and learning — so every summit, clinic, and cohort
                points the same direction.
              </p>
              <div className="reveal reveal-delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Enter platform <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/events">Browse events</Link>
                </Button>
              </div>
            </div>

            <div className="reveal reveal-delay-2 relative min-h-[320px] overflow-hidden rounded-[1.25rem] border border-line/70 shadow-[0_24px_60px_-28px_rgba(19,42,62,0.45)] sm:min-h-[420px] lg:min-h-[520px]">
              <Image
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80"
                alt="People gathered in a bright workshop space"
                fill
                priority
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 48vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/35 via-transparent to-sea/20" />
              <div className="drift absolute -right-6 -top-6 h-40 w-40 rounded-full bg-star/25 blur-2xl" />
              <div className="drift absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-sea-bright/25 blur-3xl" />
            </div>
          </section>

          <section id="method" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
                The Northstar method
              </p>
              <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
                Events create energy. Courses lock it in.
              </h2>
              <p className="mt-4 text-ink-soft">
                Most tools split gatherings from learning. Northstar keeps registration,
                curriculum, and progress on one map.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Compass,
                  title: "Orient",
                  copy: "Set outcomes before agendas. Every event and course shares a true-north statement.",
                },
                {
                  icon: Map,
                  title: "Path",
                  copy: "Connect live sessions to modules and practice. Learners always know the next step.",
                },
                {
                  icon: Sparkles,
                  title: "Signal",
                  copy: "Track activation and transfer — not vanity enrollments — so sponsors see real movement.",
                },
              ].map((item) => (
                <div key={item.title} className="border-t border-line pt-6">
                  <item.icon className="h-6 w-6 text-sea" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-2xl text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
                  Upcoming
                </p>
                <h2 className="mt-2 font-display text-3xl text-ink">Events on the horizon</h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/events">
                  All events <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
                  Curriculum
                </p>
                <h2 className="mt-2 font-display text-3xl text-ink">Learning that follows through</h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/learn">
                  All courses <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
