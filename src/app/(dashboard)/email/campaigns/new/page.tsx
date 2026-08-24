import { Header } from "@/components/layout/header";
import { ScheduleCampaignForm } from "@/components/campaigns/schedule-form";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { listEmailTemplates } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export default async function NewEmailCampaignPage() {
  const { templates, source } = await listEmailTemplates({ activeOnly: true });

  return (
    <>
      <Header
        title="New Email Campaign"
        description="Compose, schedule, or send an email campaign via Brevo"
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <BrevoStatusBanner />
        <ScheduleCampaignForm
          channel="email"
          templates={templates}
          dataSource={source}
        />
      </div>
    </>
  );
}
