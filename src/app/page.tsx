import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Map, Sparkles } from "lucide-react";
import { Crump360Wordmark } from "@/components/brand/crump360-mark";
import { EventCard, CourseCard } from "@/components/catalog/cards";
import { SiteAnnouncement } from "@/components/layout/site-announcement";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { Button } from "@/components/ui/button";
import { courses, events } from "@/lib/data";

export default function HomePage() {
  const featuredEvents = events.slice(0, 3);
  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="min-h-screen bg-page">
      <SiteAnnouncement />
      <div className="relative overflow-hidden bg-navy text-cloud">
        <Image
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          className="object-cover opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40" />
        <div className="drift absolute -right-20 top-10 h-72 w-72 rounded-full bg-blue/25 blur-3xl" />
        <div className="drift absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-orange/20 blur-3xl" />

        <div className="relative z-10">
          <SiteHeader tone="dark" />
          <section className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-5 pb-20 pt-8 md:px-8 md:pb-28 md:pt-12">
            <div className="reveal max-w-3xl">
              <Crump360Wordmark
                className="h-14 w-auto max-w-full sm:h-16 md:h-20"
                priority
              />
              <h1 className="reveal reveal-delay-1 mt-8 max-w-2xl font-display text-3xl leading-[1.1] text-balance sm:text-4xl md:text-5xl">
                Gatherings that teach. Courses that stick.
              </h1>
              <p className="reveal reveal-delay-2 mt-5 max-w-lg text-base leading-relaxed text-cloud/70 sm:text-lg">
                Events management and learning on one path — so every summit,
                clinic, and cohort points the same direction.
              </p>
              <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" variant="star">
                  <Link href="/dashboard">
                    Enter platform <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-cloud hover:bg-white/15"
                >
                  <Link href="/events">Browse events</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <main className="brand-bg">
        <div className="brand-grid">
          <section id="method" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue">
                The CRUMP360 method
              </p>
              <h2 className="mt-3 font-display text-3xl text-navy md:text-4xl">
                Events create energy. Courses lock it in.
              </h2>
              <p className="mt-4 text-muted">
                Most tools split gatherings from learning. CRUMP360 keeps
                registration, curriculum, and progress on one map.
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
                <div key={item.title} className="border-t-2 border-blue/25 pt-6">
                  <item.icon className="h-6 w-6 text-orange" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-2xl text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue">
                  Upcoming
                </p>
                <h2 className="mt-2 font-display text-3xl text-navy">
                  Events on the horizon
                </h2>
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
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue">
                  Curriculum
                </p>
                <h2 className="mt-2 font-display text-3xl text-navy">
                  Learning that follows through
                </h2>
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
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
