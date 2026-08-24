import { Header } from "@/components/layout/header";
import { CampaignTable } from "@/components/campaigns/campaign-table";
import { campaigns } from "@/lib/mock-data";

export default function SmsCampaignsPage() {
  const smsCampaigns = campaigns.filter((c) => c.channel === "sms");

  return (
    <>
      <Header
        title="SMS Campaigns"
        description="Schedule and manage SMS campaigns via Twilio"
        action={{ label: "New Campaign", href: "/sms/campaigns/new" }}
      />
      <div className="p-8 animate-fade-in">
        <CampaignTable campaigns={smsCampaigns} channel="sms" />
      </div>
    </>
  );
}
