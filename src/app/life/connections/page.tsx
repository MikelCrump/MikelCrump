import { LifeShell } from "@/components/life/shell";
import { lifeEnv } from "@/life/config";
import { getIntegrationStatus, type ReadyLevel } from "@/life/status";

const READY_LABEL: Record<ReadyLevel, string> = {
  live_ready: "Keys → live",
  needs_bridge: "Needs HA / LAN",
  manual_json: "Keys + JSON",
  built_in: "Built in",
};

export const dynamic = "force-dynamic";

export default function ConnectionsPage() {
  const forceMock = lifeEnv().forceMock;
  const integrations = getIntegrationStatus();

  return (
    <LifeShell active="connections">
      <header className="life-rise max-w-3xl">
        <h1
          className="text-4xl tracking-tight text-[var(--life-ink)]"
          style={{ fontFamily: "var(--font-life-display), sans-serif" }}
        >
          Connections
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--life-muted)]">
          Each row shows what the backend needs. Most go live with env keys alone;
          home climate/media/batteries use Home Assistant; consumer AI chat quotas
          use a JSON meter until vendors expose APIs.
        </p>
        {forceMock ? (
          <p className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            `LIFE_FORCE_MOCK=1` is on — adapters ignore real keys until you set it
            to `0` or remove it.
          </p>
        ) : null}
      </header>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {integrations.map((item) => (
          <article key={item.id} className="life-panel life-rise">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{item.name}</h2>
                <p className="mt-1 text-sm text-[var(--life-muted)]">{item.note}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-md bg-black/5 px-2 py-1 text-[10px] font-semibold tracking-wide uppercase">
                  {READY_LABEL[item.ready]}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase ${
                    item.configured ? "text-sky-700" : "text-amber-700"
                  }`}
                >
                  {item.configured ? "Configured" : "Missing"}
                </span>
              </div>
            </div>
            <ul className="mt-3 space-y-1 font-mono text-[11px] text-[var(--life-ink)]/80">
              {item.needs.map((need) => (
                <li key={need}>· {need}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </LifeShell>
  );
}
