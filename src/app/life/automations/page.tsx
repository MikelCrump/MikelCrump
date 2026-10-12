import { AutomationsClient } from "@/components/life/automations-client";
import { LifeShell } from "@/components/life/shell";
import { listAutomations } from "@/life/automations-store";

export const dynamic = "force-dynamic";

export default function AutomationsPage() {
  const automations = listAutomations();
  return (
    <LifeShell active="automations">
      <header className="life-rise max-w-2xl">
        <h1
          className="text-4xl tracking-tight text-[var(--life-ink)]"
          style={{ fontFamily: "var(--font-life-display), sans-serif" }}
        >
          Automations
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--life-muted)]">
          Lightweight rules for lights, climate, Tesla preconditioning, and
          battery nudges. These run in-app today; connect Home Assistant later to
          execute them on the LAN.
        </p>
      </header>
      <AutomationsClient initial={automations} />
    </LifeShell>
  );
}
