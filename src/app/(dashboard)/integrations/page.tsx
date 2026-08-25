import { Header } from "@/components/layout/header";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { BrevoTestSend } from "@/components/brevo/test-send";
import { TwilioStatusBanner } from "@/components/twilio/status-banner";
import { TwilioTestSend } from "@/components/twilio/test-send";
import { integrations } from "@/lib/mock-data";
import { getBrevoConnectionStatus } from "@/lib/brevo";
import { getTwilioConnectionStatus } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const [brevoStatus, twilioStatus] = await Promise.all([
    getBrevoConnectionStatus(),
    getTwilioConnectionStatus(),
  ]);

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
    if (integration.id === "twilio") {
      return {
        ...integration,
        connected: twilioStatus.connected,
        description: twilioStatus.connected
          ? `Connected as ${twilioStatus.account?.friendlyName ?? "Twilio"}${
              twilioStatus.phoneNumber
                ? ` · From ${twilioStatus.phoneNumber}`
                : ""
            }.`
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
        <div className="space-y-3">
          <BrevoStatusBanner />
          <TwilioStatusBanner />
        </div>

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
                No integrations connected yet.
              </p>
            )}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <BrevoTestSend />
          <TwilioTestSend />
        </div>

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
