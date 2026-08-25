import { Header } from "@/components/layout/header";
import { ScheduleCampaignForm } from "@/components/campaigns/schedule-form";
import { TwilioStatusBanner } from "@/components/twilio/status-banner";
import { listSmsTemplates, isTwilioConfigured } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export default async function NewSmsCampaignPage() {
  const { templates } = await listSmsTemplates();

  return (
    <>
      <Header
        title="New SMS Campaign"
        description="Compose, schedule, or send an SMS via Twilio"
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <TwilioStatusBanner />
        <ScheduleCampaignForm
          channel="sms"
          templates={templates}
          dataSource={isTwilioConfigured() ? "twilio" : "demo"}
        />
      </div>
    </>
  );
}
