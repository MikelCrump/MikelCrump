import { LifeShell } from "@/components/life/shell";
import { CATEGORY_LABELS, INTEGRATIONS } from "@/life/integrations";
import type { IntegrationMeta } from "@/life/types";

function configuredCount(keys: string[]) {
  if (!keys.length) return "built-in";
  const hit = keys.filter((k) => Boolean(process.env[k]?.trim())).length;
  if (hit === 0) return "needs keys";
  if (hit < keys.length) return `${hit}/${keys.length} keys`;
  return "keys present";
}

export const dynamic = "force-dynamic";

export default function ConnectionsPage() {
  const byCategory = INTEGRATIONS.reduce(
    (acc, item) => {
      acc[item.category] = acc[item.category] ?? [];
      acc[item.category]!.push(item);
      return acc;
    },
    {} as Record<IntegrationMeta["category"], IntegrationMeta[]>,
  );

  return (
    <LifeShell active="connections">
      <header className="life-rise max-w-2xl">
        <h1
          className="text-4xl tracking-tight text-[var(--life-ink)]"
          style={{ fontFamily: "var(--font-life-display), sans-serif" }}
        >
          Connections
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--life-muted)]">
          Wire the APIs you already use. Until keys are set, the board runs on
          realistic preview data so you can still operate and design automations.
          Inspired by Homarr/Homepage widget hubs, PersonalOS finance sync, and
          TeslaMate-style vehicle telemetry.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {(Object.keys(byCategory) as IntegrationMeta["category"][]).map(
          (category) => (
            <section key={category} className="life-rise">
              <h2 className="mb-3 text-xs font-semibold tracking-[0.18em] text-[var(--life-muted)] uppercase">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {byCategory[category]!.map((item) => (
                  <article key={item.id} className="life-panel">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--life-muted)]">
                          {item.description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-black/5 px-2 py-1 text-[10px] font-semibold tracking-wide uppercase">
                        {configuredCount(item.envKeys)}
                      </span>
                    </div>
                    {item.envKeys.length ? (
                      <p className="mt-3 font-mono text-[11px] leading-relaxed text-[var(--life-ink)]/80">
                        {item.envKeys.join(" · ")}
                      </p>
                    ) : (
                      <p className="mt-3 text-[11px] text-[var(--life-muted)]">
                        No external keys required
                      </p>
                    )}
                    <p className="mt-2 text-xs leading-relaxed text-[var(--life-muted)]">
                      {item.docsHint}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ),
        )}
      </div>
    </LifeShell>
  );
}
