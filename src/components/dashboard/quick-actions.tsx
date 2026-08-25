import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Zap,
  Users,
  Send,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ActivityItem } from "@/lib/analytics/dashboard";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Schedule Email",
    description: "Create and schedule an email campaign",
    href: "/email/campaigns/new",
    icon: Mail,
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Send SMS",
    description: "Compose and send an SMS blast",
    href: "/sms/campaigns/new",
    icon: MessageSquare,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "New Automation",
    description: "Build a multi-step workflow",
    href: "/automations/new",
    icon: Zap,
    color: "bg-violet-100 text-violet-700",
  },
  {
    title: "Import Contacts",
    description: "View Command Center & Brevo contacts",
    href: "/contacts",
    icon: Users,
    color: "bg-amber-100 text-amber-700",
  },
];

const activityIcons = {
  campaign_sent: Send,
  automation_triggered: Zap,
  sms_scheduled: Calendar,
  contact_added: Users,
};

const activityColors = {
  campaign_sent: "bg-indigo-100 text-indigo-700",
  automation_triggered: "bg-violet-100 text-violet-700",
  sms_scheduled: "bg-emerald-100 text-emerald-700",
  contact_added: "bg-amber-100 text-amber-700",
};

export function QuickActions() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Get started with common tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-all hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm">
              <div className={cn("rounded-lg p-2", action.color)}>
                <action.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium group-hover:text-primary">
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest sends from Brevo and Twilio</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No recent activity yet. Send an email or SMS to see it here.
          </p>
        ) : (
          <div className="space-y-4">
            {activity.map((item) => {
              const Icon = activityIcons[item.type];
              const color = activityColors[item.type];
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={cn("rounded-lg p-2 shrink-0", color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
