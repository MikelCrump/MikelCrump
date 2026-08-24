import { Header } from "@/components/layout/header";
import { CampaignTable } from "@/components/campaigns/campaign-table";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { Badge } from "@/components/ui/badge";
import { listEmailCampaigns } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export default async function EmailCampaignsPage() {
  const { campaigns, source } = await listEmailCampaigns();

  return (
    <>
      <Header
        title="Email Campaigns"
        description="Schedule and manage email campaigns via Brevo"
        action={{ label: "New Campaign", href: "/email/campaigns/new" }}
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <BrevoStatusBanner />
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {campaigns.length} campaigns
          </p>
          <Badge variant={source === "brevo" ? "success" : "warning"}>
            {source === "brevo" ? "From Brevo" : "Demo data"}
          </Badge>
        </div>
        <CampaignTable campaigns={campaigns} channel="email" />
      </div>
    </>
  );
}
