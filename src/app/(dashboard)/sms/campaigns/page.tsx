import { Header } from "@/components/layout/header";
import { CampaignTable } from "@/components/campaigns/campaign-table";
import { TwilioStatusBanner } from "@/components/twilio/status-banner";
import { Badge } from "@/components/ui/badge";
import { listSmsCampaigns } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export default async function SmsCampaignsPage() {
  const { campaigns, source } = await listSmsCampaigns();

  return (
    <>
      <Header
        title="SMS Campaigns"
        description="Schedule and manage SMS campaigns via Twilio"
        action={{ label: "New Campaign", href: "/sms/campaigns/new" }}
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <TwilioStatusBanner />
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {campaigns.length} messages
          </p>
          <Badge variant={source === "twilio" ? "success" : "warning"}>
            {source === "twilio" ? "From Twilio" : "Demo data"}
          </Badge>
        </div>
        <CampaignTable campaigns={campaigns} channel="sms" />
      </div>
    </>
  );
}
