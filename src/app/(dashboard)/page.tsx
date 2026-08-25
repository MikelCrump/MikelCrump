import { Header } from "@/components/layout/header";
import { StatsCards, ConnectionSummary } from "@/components/dashboard/stats-cards";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { QuickActions, ActivityFeed } from "@/components/dashboard/quick-actions";
import { getDashboardData } from "@/lib/analytics/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { stats, performance, activity } = await getDashboardData();

  return (
    <>
      <Header
        title="Dashboard"
        description="Live overview from Brevo and Twilio"
      />
      <div className="space-y-6 p-8 animate-fade-in">
        <StatsCards stats={stats} />
        <ConnectionSummary stats={stats} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceChart data={performance} />
          </div>
          <QuickActions />
        </div>
        <ActivityFeed activity={activity} />
      </div>
    </>
  );
}
