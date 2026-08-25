import { Header } from "@/components/layout/header";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { BrevoTestSend } from "@/components/brevo/test-send";
import { TwilioStatusBanner } from "@/components/twilio/status-banner";
import { TwilioTestSend } from "@/components/twilio/test-send";
import { SupabaseStatusBanner } from "@/components/supabase/status-banner";
import { integrations } from "@/lib/mock-data";
import { getBrevoConnectionStatus } from "@/lib/brevo";
import { getTwilioConnectionStatus } from "@/lib/twilio";
import { getSupabaseConnectionStatus } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const [brevoStatus, twilioStatus, supabaseStatus] = await Promise.all([
    getBrevoConnectionStatus(),
    getTwilioConnectionStatus(),
    getSupabaseConnectionStatus(),
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
    if (integration.id === "supabase") {
      return {
        ...integration,
        name: "Command Center CRM",
        connected: supabaseStatus.connected,
        description: supabaseStatus.connected
          ? `Connected to Reawaken Command Center · ${supabaseStatus.contactCount.toLocaleString()} CRM contacts`
          : supabaseStatus.source === "needs_service_role"
            ? supabaseStatus.message
            : "Sync contacts from Reawaken Command Center (Supabase CRM).",
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
          <SupabaseStatusBanner />
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
