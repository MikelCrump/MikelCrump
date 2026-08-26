import { Header } from "@/components/layout/header";
import { ScheduleCampaignForm } from "@/components/campaigns/schedule-form";
import { TwilioStatusBanner } from "@/components/twilio/status-banner";
import { listSmsTemplates, isTwilioConfigured } from "@/lib/twilio";
import { listBrevoLists } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export default async function NewSmsCampaignPage() {
  const [{ templates }, { lists }] = await Promise.all([
    listSmsTemplates(),
    listBrevoLists(),
  ]);

  return (
    <>
      <Header
        title="New SMS Campaign"
        description="Send to one number, a Brevo list, or paste phone numbers"
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <TwilioStatusBanner />
        <ScheduleCampaignForm
          channel="sms"
          templates={templates}
          dataSource={isTwilioConfigured() ? "twilio" : "demo"}
          brevoLists={lists}
        />
      </div>
    </>
  );
}
