import { Header } from "@/components/layout/header";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { BrevoTestSend } from "@/components/brevo/test-send";
import { integrations } from "@/lib/mock-data";
import { getBrevoConnectionStatus } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const brevoStatus = await getBrevoConnectionStatus();

  const withLiveStatus = integrations.map((integration) => {
    if (integration.id === "brevo") {
      return {
        ...integration,
        connected: brevoStatus.connected,
        description: brevoStatus.connected
          ? `Connected as ${brevoStatus.account?.email ?? "Brevo account"}. Templates, campaigns, and sends use the live API.`
          : integration.description,
      };
    }
    return integration;
  });

  const connected = withLiveStatus.filter((i) => i.connected);
  const available = withLiveStatus.filter((i) => !i.connected);

  return (
    <>
      <Header
        title="Integrations"
        description="Connect Brevo, Twilio, ManyChat, and your CRM"
      />
      <div className="p-8 space-y-8 animate-fade-in">
        <BrevoStatusBanner />

        <section>
          <h2 className="text-lg font-semibold mb-4">
            Connected ({connected.length})
          </h2>
          <div className="space-y-4">
            {connected.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
            {connected.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No integrations connected yet. Add your Brevo API key to get started.
              </p>
            )}
          </div>
        </section>

        <BrevoTestSend />

        <section>
          <h2 className="text-lg font-semibold mb-4">
            Available ({available.length})
          </h2>
          <div className="space-y-4">
            {available.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
