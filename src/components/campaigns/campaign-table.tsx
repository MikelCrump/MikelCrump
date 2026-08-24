import Link from "next/link";
import { format } from "date-fns";
import { Mail, MessageSquare, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign, CampaignStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  CampaignStatus,
  { label: string; variant: "success" | "warning" | "info" | "secondary" | "destructive" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "info" },
  sending: { label: "Sending", variant: "warning" },
  sent: { label: "Sent", variant: "success" },
  paused: { label: "Paused", variant: "destructive" },
};

interface CampaignTableProps {
  campaigns: Campaign[];
  channel: "email" | "sms";
}

export function CampaignTable({ campaigns, channel }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">No campaigns yet</p>
        <Button className="mt-4" asChild>
          <Link href={`/${channel}/campaigns/new`}>Create your first campaign</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Campaign</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Template</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Audience</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Recipients</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Schedule</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Performance</th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const status = statusConfig[campaign.status];
              return (
                <tr
                  key={campaign.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {campaign.channel === "email" ? (
                        <Mail className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                      )}
                      <span className="font-medium">{campaign.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{campaign.templateName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{campaign.audience}</td>
                  <td className="px-6 py-4">{campaign.recipientCount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {campaign.scheduledAt
                      ? format(new Date(campaign.scheduledAt), "MMM d, h:mm a")
                      : campaign.sentAt
                        ? format(new Date(campaign.sentAt), "MMM d, h:mm a")
                        : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {campaign.openRate !== undefined ? (
                      <span className="text-emerald-600 font-medium">{campaign.openRate}% open</span>
                    ) : campaign.deliveryRate !== undefined ? (
                      <span className="text-emerald-600 font-medium">{campaign.deliveryRate}% delivered</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 px-6 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <Button className="mt-6" asChild>
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
