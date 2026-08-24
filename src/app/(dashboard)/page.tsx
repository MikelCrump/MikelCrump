import { Header } from "@/components/layout/header";
import { StatsCards, ActiveAutomationsBanner } from "@/components/dashboard/stats-cards";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { QuickActions, ActivityFeed } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of your email and SMS campaigns"
      />
      <div className="space-y-6 p-8 animate-fade-in">
        <StatsCards />
        <ActiveAutomationsBanner />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <QuickActions />
        </div>
        <ActivityFeed />
      </div>
    </>
  );
}
