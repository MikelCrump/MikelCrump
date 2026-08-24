import { Header } from "@/components/layout/header";
import { ScheduleCampaignForm } from "@/components/campaigns/schedule-form";
import { emailTemplates } from "@/lib/mock-data";

export default function NewEmailCampaignPage() {
  return (
    <>
      <Header
        title="New Email Campaign"
        description="Compose, schedule, or send an email campaign"
      />
      <div className="p-8 animate-fade-in">
        <ScheduleCampaignForm channel="email" templates={emailTemplates} />
      </div>
    </>
  );
}
