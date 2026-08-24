import { Header } from "@/components/layout/header";
import { CampaignTable } from "@/components/campaigns/campaign-table";
import { campaigns } from "@/lib/mock-data";

export default function EmailCampaignsPage() {
  const emailCampaigns = campaigns.filter((c) => c.channel === "email");

  return (
    <>
      <Header
        title="Email Campaigns"
        description="Schedule and manage email campaigns via Brevo"
        action={{ label: "New Campaign", href: "/email/campaigns/new" }}
      />
      <div className="p-8 animate-fade-in">
        <CampaignTable campaigns={emailCampaigns} channel="email" />
      </div>
    </>
  );
}
