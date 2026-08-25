import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AutomationsPage() {
  return (
    <>
      <Header
        title="Automations"
        description="Multi-step workflows that connect email, SMS, and your CRM"
        action={{ label: "New Automation", href: "/automations/new" }}
      />
      <div className="p-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 px-6 text-center">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700 mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">No automations yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Sample automation data has been removed. Create a real workflow when
            you&apos;re ready — it will show up here.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/automations/new">Create automation</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
