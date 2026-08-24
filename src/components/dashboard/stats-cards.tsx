"use client";

import {
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats } from "@/lib/mock-data";
import { cn, formatNumber } from "@/lib/utils";

const stats = [
  {
    title: "Emails Sent",
    value: formatNumber(dashboardStats.emailsSent),
    change: dashboardStats.emailsSentChange,
    icon: Mail,
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    title: "SMS Sent",
    value: formatNumber(dashboardStats.smsSent),
    change: dashboardStats.smsSentChange,
    icon: MessageSquare,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Open Rate",
    value: `${dashboardStats.openRate}%`,
    change: dashboardStats.openRateChange,
    icon: TrendingUp,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "Total Contacts",
    value: formatNumber(dashboardStats.totalContacts),
    change: dashboardStats.contactsChange,
    icon: Users,
    color: "text-violet-600 bg-violet-50",
    changeLabel: "new this week",
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
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
            <div className="mt-1 flex items-center gap-1 text-xs">
              {stat.changeLabel ? (
                <span className="text-muted-foreground">
                  <span className="font-medium text-emerald-600">
                    +{stat.change}
                  </span>{" "}
                  {stat.changeLabel}
                </span>
              ) : (
                <>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      stat.change >= 0 ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {stat.change >= 0 ? "+" : ""}
                    {stat.change}%
                  </span>
                  <span className="text-muted-foreground">vs last week</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ActiveAutomationsBanner() {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-indigo-50 to-violet-50">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary p-3 text-primary-foreground">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">
              {dashboardStats.activeAutomations} automations running
            </h3>
            <p className="text-sm text-muted-foreground">
              Your workflows are actively engaging leads from ManyChat and your CRM.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
