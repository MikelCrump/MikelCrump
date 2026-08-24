import { Header } from "@/components/layout/header";
import { AutomationCard } from "@/components/automations/automation-card";
import { automations } from "@/lib/mock-data";

export default function AutomationsPage() {
  return (
    <>
      <Header
        title="Automations"
        description="Multi-step workflows that connect email, SMS, and your CRM"
        action={{ label: "New Automation", href: "/automations/new" }}
      />
      <div className="p-8 space-y-4 animate-fade-in">
        {automations.map((automation) => (
          <AutomationCard key={automation.id} automation={automation} />
        ))}
      </div>
    </>
  );
}
