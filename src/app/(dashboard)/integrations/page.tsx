import { Header } from "@/components/layout/header";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { integrations } from "@/lib/mock-data";

export default function IntegrationsPage() {
  const connected = integrations.filter((i) => i.connected);
  const available = integrations.filter((i) => !i.connected);

  return (
    <>
      <Header
        title="Integrations"
        description="Connect Brevo, Twilio, ManyChat, and your CRM"
      />
      <div className="p-8 space-y-8 animate-fade-in">
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Connected ({connected.length})
          </h2>
          <div className="space-y-4">
            {connected.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </section>

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
