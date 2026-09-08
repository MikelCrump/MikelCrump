import Link from "next/link";
import { redirect } from "next/navigation";
import { env, hasDatabaseUrl } from "@/env";
import { createProjectAction } from "@/app/actions";

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const params = await searchParams;

  if (!hasDatabaseUrl()) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10">
        <p className="text-sm font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
          Internal production
        </p>
        <h1
          className="text-5xl tracking-tight"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Crump Studio
        </h1>
        <p className="max-w-xl text-[var(--ink-muted)]">
          App is deployed. Connect Postgres to unlock projects, wizard, and
          canvas.
        </p>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-sm">
          <p className="font-medium">Required env</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[var(--ink-muted)]">
            <li>
              Claim this deployment (or link the GitHub repo in Vercel).
            </li>
            <li>
              Set <code className="rounded bg-black/5 px-1">DATABASE_URL</code>{" "}
              to a Neon / Vercel Postgres connection string.
            </li>
            <li>
              Run <code className="rounded bg-black/5 px-1">pnpm db:migrate:deploy</code>{" "}
              and <code className="rounded bg-black/5 px-1">pnpm db:seed</code>.
            </li>
          </ol>
          <p className="mt-4 text-[var(--ink-muted)]">
            Video provider: <strong className="text-[var(--ink)]">{env.VIDEO_PROVIDER}</strong>
            {" · "}
            Audio: <strong className="text-[var(--ink)]">{env.AUDIO_PROVIDER}</strong>
          </p>
        </div>
      </main>
    );
  }

  if (params.created) {
    redirect(`/projects/${params.created}/wizard`);
  }

  const { prisma } = await import("@/lib/db");

  let projects: Awaited<
    ReturnType<typeof prisma.videoProject.findMany>
  > = [];
  let characters = 0;
  let modules = 0;
  let dbError: string | null = null;

  try {
    const loaded = await Promise.all([
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
    projects = loaded[0];
    characters = loaded[1];
    modules = loaded[2];
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Database unreachable";
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10">
      <header className="flex flex-col gap-6 border-b border-[var(--line)] pb-8">
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
            out.
          </p>
        </div>

        {dbError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
            Database error: {dbError}
          </p>
        ) : null}

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
          <h2
            className="mb-4 text-2xl"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Projects
          </h2>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center text-[var(--ink-muted)]">
              No projects yet. Create one to begin.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] backdrop-blur">
              {projects.map((project) => {
                const row = project as typeof project & {
                  owner: { name: string | null; email: string };
                  course: {
                    title: string;
                    module: { code: string };
                  } | null;
                  _count: { clips: number };
                };
                return (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        href={`/projects/${row.id}/wizard`}
                        className="font-medium hover:text-[var(--accent)]"
                      >
                        {row.title}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--ink-muted)]">
                        {row.course
                          ? `${row.course.module.code} · ${row.course.title}`
                          : "No course linked"}
                        {" · "}
                        {row.owner.name ?? row.owner.email}
                        {" · "}
                        {row._count.clips} clips
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusTone(row.status)}`}
                      >
                        {row.status}
                      </span>
                      <Link
                        href={`/projects/${row.id}/wizard`}
                        className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm"
                      >
                        Wizard
                      </Link>
                      <Link
                        href={`/projects/${row.id}/canvas`}
                        className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm"
                      >
                        Canvas
                      </Link>
                    </div>
                  </li>
                );
              })}
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
            Creates a DRAFT VideoProject and opens the Linear Wizard.
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
