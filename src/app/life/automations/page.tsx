import { AutomationsClient } from "@/components/life/automations-client";
import { LifeShell } from "@/components/life/shell";
import { getArriveHomeChargeStatus } from "@/life/arrive-home-charge";
import { listAutomations } from "@/life/automations-store";

export const dynamic = "force-dynamic";

export default function AutomationsPage() {
  const automations = listAutomations();
  const locationStatus = getArriveHomeChargeStatus();
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
          Rules for lights, climate, and Tesla. Arrive-home charge port uses your
          iPhone location via Shortcuts, then confirms the car has been parked
          for 10 seconds before opening the port.
        </p>
      </header>
      <AutomationsClient
        initial={automations}
        locationStatus={{
          homeConfigured: locationStatus.homeConfigured,
          homeRadiusM: locationStatus.homeRadiusM,
          webhookSecretConfigured: locationStatus.webhookSecretConfigured,
          lastDetail: locationStatus.lastDetail,
        }}
      />
    </LifeShell>
  );
}
