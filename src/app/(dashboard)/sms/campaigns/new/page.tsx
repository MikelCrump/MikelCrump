import { Header } from "@/components/layout/header";
import { ScheduleCampaignForm } from "@/components/campaigns/schedule-form";
import { smsTemplates } from "@/lib/mock-data";

export default function NewSmsCampaignPage() {
  return (
    <>
      <Header
        title="New SMS Campaign"
        description="Compose, schedule, or send an SMS campaign"
      />
      <div className="p-8 animate-fade-in">
        <ScheduleCampaignForm channel="sms" templates={smsTemplates} />
      </div>
    </>
  );
}
