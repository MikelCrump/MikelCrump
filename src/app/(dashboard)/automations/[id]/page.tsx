import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { WorkflowBuilder } from "@/components/automations/workflow-builder";
import { Button } from "@/components/ui/button";
import { automations } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AutomationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const automation = automations.find((a) => a.id === id);

  if (!automation) notFound();

  return (
    <>
      <Header title={automation.name} description="Edit automation workflow" />
      <div className="p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/automations" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Automations
          </Link>
        </Button>
        <WorkflowBuilder
          initialName={automation.name}
          initialDescription={automation.description}
        />
      </div>
    </>
  );
}
