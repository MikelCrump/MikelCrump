import Image from "next/image";
import { BrandMark } from "@/components/site/brand-mark";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

const services = [
  {
    title: "LMS & E-Learning Engineering",
    summary:
      "Platform architecture, curriculum tooling, and learning operations for organizations that need courses to stick — not just launch.",
    points: [
      "Learning management system design & delivery",
      "Instructional systems and content pipelines",
      "Cohort, assessment, and progress tracking",
    ],
  },
  {
    title: "IT Infrastructure & Operations",
    summary:
      "Microsoft 365, Entra ID, Intune, identity, and endpoint security — administered end-to-end with service-desk discipline.",
    points: [
      "Entra ID, SSO, MFA & conditional access",
      "Intune endpoint compliance & patching",
      "Hybrid Google Workspace + Microsoft tenants",
      "Asset lifecycle, IAM & privileged access",
    ],
  },
  {
    title: "Event Technology",
    summary:
      "Cvent-fluent event tech that keeps registration, agendas, and attendee journeys reliable from invite to onsite.",
    points: [
      "Cvent configuration & integrations",
      "Registration, badging & session logistics",
      "Hybrid / virtual production support",
    ],
  },
  {
    title: "Event Management",
    summary:
      "Program planning and day-of execution so gatherings create outcomes — skill, alignment, and follow-through.",
    points: [
      "End-to-end event program management",
      "Vendor, venue & stakeholder coordination",
      "Onsite operations & experience design",
    ],
  },
];

const credentials = [
  "PMI",
  "CompTIA A+",
  "Microsoft 365",
  "Entra ID / Azure AD",
  "Microsoft Intune",
  "Scrum",
  "ITIL-aligned ops",
  "Cvent",
  "IAM / SSO",
  "Google Workspace",
];

const ventures = [
  {
    name: "CRUMP360",
    href: "https://crump360.com",
    blurb:
      "Events management and LMS on one path — registration, curriculum, and progress mapped together.",
    external: true,
  },
];

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-page">
      <div className="relative overflow-hidden bg-navy text-cloud">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=80"
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
              <div className="flex items-center gap-3">
                <BrandMark className="h-11 w-11 shrink-0 text-cloud sm:h-14 sm:w-14" />
                <span className="font-display text-[1.65rem] font-bold leading-none tracking-tight text-cloud sm:text-5xl md:text-6xl">
                  Crump <span className="text-blue">Solutions</span> Group
                </span>
              </div>
              <h1 className="reveal reveal-delay-1 mt-8 max-w-2xl font-display text-2xl leading-[1.15] text-balance sm:text-3xl md:text-4xl">
                Learning systems. Infrastructure. Events that deliver.
              </h1>
              <p className="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-relaxed text-cloud/70 sm:text-lg">
                One professional group spanning LMS engineering, IT operations,
                event technology, and event management — so your platforms,
                people, and programs stay aligned.
              </p>
              <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#services"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-orange px-6 text-base font-semibold text-navy transition hover:bg-star-soft"
                >
                  Explore services
                  <ArrowIcon />
                </a>
                <a
                  href="https://crump360.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center rounded-md border border-white/20 bg-white/10 px-6 text-base font-semibold text-cloud transition hover:bg-white/15"
                >
                  See CRUMP360
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <main className="brand-bg">
        <div className="brand-grid">
          <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <p className="max-w-3xl font-display text-2xl leading-snug text-navy md:text-3xl">
              More than{" "}
              <span className="text-blue">40 years of combined experience</span>{" "}
              in LMS & e-learning engineering, IT management, and event
              administration & management.
            </p>
            <p className="mt-5 max-w-2xl text-muted">
              We combine deep specialists into one accountable practice — so
              learning products, Microsoft infrastructure, and live events do
              not fragment across vendors.
            </p>
          </section>

          <section id="services" className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-blue uppercase">
                What we deliver
              </p>
              <h2 className="mt-3 font-display text-3xl text-navy md:text-4xl">
                Four practices. One standard of care.
              </h2>
              <p className="mt-4 text-muted">
                Every engagement is staffed by practitioners who own the work —
                from identity and endpoints to curriculum platforms and
                day-of-show execution.
              </p>
            </div>

            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {services.map((service) => (
                <article
                  key={service.title}
                  className="border-t-2 border-blue/25 pt-6"
                >
                  <h3 className="font-display text-2xl text-navy">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {service.summary}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-ink-soft">
                    {service.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section
            id="approach"
            className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24"
          >
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-blue uppercase">
                How we work
              </p>
              <h2 className="mt-3 font-display text-3xl text-navy md:text-4xl">
                Practitioners first. Platforms that last.
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Diagnose",
                  body: "Map identity, learning, and event workflows before tools. We start with outcomes and risk — not feature lists.",
                },
                {
                  step: "02",
                  title: "Build & harden",
                  body: "Stand up LMS paths, Microsoft tenants, Intune baselines, and Cvent programs with clear owners and runbooks.",
                },
                {
                  step: "03",
                  title: "Operate",
                  body: "Service-desk rigor, project cadence, and onsite discipline so systems and events stay reliable after go-live.",
                },
              ].map((item) => (
                <div key={item.step} className="border-t border-line pt-6">
                  <p className="text-xs font-bold tracking-[0.14em] text-orange uppercase">
                    {item.step}
                  </p>
                  <h3 className="mt-3 font-display text-2xl text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="trust"
            className="border-y border-line bg-navy text-cloud"
          >
            <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
              <div className="max-w-2xl">
                <p className="text-xs font-bold tracking-[0.16em] text-orange uppercase">
                  Credentials & trust
                </p>
                <h2 className="mt-3 font-display text-3xl md:text-4xl">
                  Certified expertise you can verify.
                </h2>
                <p className="mt-4 text-cloud/70">
                  Our team brings credentials and operating depth across project
                  management, infrastructure, and learning technology —
                  including PMI, CompTIA, Microsoft, and Scrum.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {credentials.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-cloud/90"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <dl className="mt-12 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-bold tracking-[0.14em] text-orange uppercase">
                    Combined experience
                  </dt>
                  <dd className="mt-2 font-display text-4xl">40+ yrs</dd>
                  <p className="mt-2 text-sm text-cloud/60">
                    LMS, IT management & events
                  </p>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-[0.14em] text-orange uppercase">
                    Coverage
                  </dt>
                  <dd className="mt-2 font-display text-4xl">4 practices</dd>
                  <p className="mt-2 text-sm text-cloud/60">
                    Learning · IT · Event tech · Management
                  </p>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-[0.14em] text-orange uppercase">
                    Operating model
                  </dt>
                  <dd className="mt-2 font-display text-4xl">One group</dd>
                  <p className="mt-2 text-sm text-cloud/60">
                    Parent company for CRUMP360 & ventures
                  </p>
                </div>
              </dl>
            </div>
          </section>

          <section
            id="team"
            className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24"
          >
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-blue uppercase">
                Leadership bench
              </p>
              <h2 className="mt-3 font-display text-3xl text-navy md:text-4xl">
                Specialists who still do the work.
              </h2>
              <p className="mt-4 text-muted">
                A tightly coordinated team of LMS software engineering, IT
                infrastructure, event technology, and event management
                professionals — built to cover the full stack of modern learning
                and gathering operations.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  role: "LMS & E-Learning Engineering",
                  focus:
                    "Software engineering for learning platforms, curriculum systems, and learner experience.",
                },
                {
                  role: "IT Infrastructure Engineering",
                  focus:
                    "Microsoft 365, Entra, Intune, identity, endpoints, and hybrid workspace administration.",
                },
                {
                  role: "Event Technology",
                  focus:
                    "Cvent and event-tech stack design so registration and onsite systems stay synchronized.",
                },
                {
                  role: "Event Management",
                  focus:
                    "Program planning, stakeholder management, and day-of execution for high-stakes gatherings.",
                },
              ].map((person) => (
                <div key={person.role} className="border-t-2 border-orange/40 pt-5">
                  <h3 className="font-display text-xl leading-snug text-navy">
                    {person.role}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {person.focus}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="ventures"
            className="mx-auto max-w-6xl px-5 py-8 pb-24 md:px-8"
          >
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-blue uppercase">
                Ventures
              </p>
              <h2 className="mt-3 font-display text-3xl text-navy md:text-4xl">
                Products under the group
              </h2>
              <p className="mt-4 text-muted">
                Crump Solutions Group owns and stewards platforms that extend
                our service practices into durable products.
              </p>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-1 md:max-w-xl">
              {ventures.map((venture) => (
                <a
                  key={venture.name}
                  href={venture.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block border-t-2 border-blue/25 pt-6 transition"
                >
                  <p className="text-xs font-bold tracking-[0.14em] text-blue uppercase">
                    Portfolio
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-navy group-hover:text-blue">
                    {venture.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {venture.blurb}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange">
                    Visit site
                    <ArrowIcon />
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
