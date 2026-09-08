import { prisma } from "@/lib/db";
import { env } from "@/env";
import { createProjectAction } from "@/app/actions";
import { ModeSwitcher } from "@/components/mode-switcher";

export const dynamic = "force-dynamic";

function statusTone(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-[var(--accent-soft)] text-[var(--accent)]";
    case "FAILED":
      return "bg-red-100 text-[var(--danger)]";
    default:
      return "bg-black/5 text-[var(--ink-muted)]";
  }
}

export default async function HomePage() {
  const [projects, characters, modules] = await Promise.all([
    prisma.videoProject.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        owner: true,
        course: { include: { module: true } },
        _count: { select: { clips: true } },
      },
    }),
    prisma.characterProfile.count(),
    prisma.lmsModule.count(),
  ]);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10">
      <header className="flex flex-col gap-6 border-b border-[var(--line)] pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
              Internal production
            </p>
            <h1
              className="mt-2 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Crump Studio
            </h1>
            <p className="mt-3 max-w-xl text-[var(--ink-muted)]">
              Script in. Consistent-face lecturer clips and a joined audio track
              out. Phase 1 scaffold — providers and adapters arrive next.
            </p>
          </div>
          <ModeSwitcher />
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 backdrop-blur">
            <dt className="text-xs tracking-wide text-[var(--ink-muted)] uppercase">
              Projects
            </dt>
            <dd className="mt-1 text-2xl font-semibold">{projects.length}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 backdrop-blur">
            <dt className="text-xs tracking-wide text-[var(--ink-muted)] uppercase">
              Characters
            </dt>
            <dd className="mt-1 text-2xl font-semibold">{characters}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 backdrop-blur">
            <dt className="text-xs tracking-wide text-[var(--ink-muted)] uppercase">
              LMS modules
            </dt>
            <dd className="mt-1 text-2xl font-semibold">{modules}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 backdrop-blur">
            <dt className="text-xs tracking-wide text-[var(--ink-muted)] uppercase">
              Video provider
            </dt>
            <dd className="mt-1 text-2xl font-semibold capitalize">
              {env.VIDEO_PROVIDER}
            </dd>
          </div>
        </dl>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Projects
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center text-[var(--ink-muted)]">
              No projects yet. Create one to begin, or run{" "}
              <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">
                pnpm db:seed
              </code>
              .
            </div>
          ) : (
            <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] backdrop-blur">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">
                      {project.course
                        ? `${project.course.module.code} · ${project.course.title}`
                        : "No course linked"}
                      {" · "}
                      {project.owner.name ?? project.owner.email}
                      {" · "}
                      {project._count.clips} clips
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusTone(project.status)}`}
                    >
                      {project.status}
                    </span>
                    <ModeSwitcher projectId={project.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 backdrop-blur">
          <h2
            className="text-xl"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            New Project
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Creates a DRAFT VideoProject owned by the seeded team member.
            Wizard and canvas routes arrive in later phases.
          </p>
          <form action={createProjectAction} className="mt-5 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Title</span>
              <input
                name="title"
                required
                placeholder="e.g. Feedback That Lands — Scene pack"
                className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
            >
              Create project
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
