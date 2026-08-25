import {
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/analytics/dashboard";
import { cn, formatNumber } from "@/lib/utils";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      title: "Emails Sent",
      value: formatNumber(stats.emailsSent),
      subtitle: stats.emailsSentLabel,
      icon: Mail,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "SMS Sent",
      value: formatNumber(stats.smsSent),
      subtitle: stats.smsSentLabel,
      icon: MessageSquare,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Open Rate",
      value: stats.openRate === null ? "—" : `${stats.openRate}%`,
      subtitle: stats.openRateLabel,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Total Contacts",
      value: formatNumber(stats.totalContacts),
      subtitle: stats.contactsLabel,
      icon: Users,
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((stat) => (
        <Card key={stat.title} className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={cn("rounded-lg p-2", stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ConnectionSummary({ stats }: { stats: DashboardStats }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-indigo-50 to-violet-50">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h3 className="font-semibold">Live data connected</h3>
          <p className="text-sm text-muted-foreground">
            {stats.brevoConnected ? "Brevo" : "Brevo offline"}
            {" · "}
            {stats.smsConnected ? "Twilio" : "Twilio offline"}
            {" · "}
            {stats.emailTemplates} email templates
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
