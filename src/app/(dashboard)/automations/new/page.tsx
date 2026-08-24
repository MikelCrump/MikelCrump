import { Header } from "@/components/layout/header";
import { WorkflowBuilder } from "@/components/automations/workflow-builder";

export default function NewAutomationPage() {
  return (
    <>
      <Header
        title="Create Automation"
        description="Build a workflow with triggers, emails, SMS, and delays"
      />
      <div className="p-8 animate-fade-in">
        <WorkflowBuilder />
      </div>
    </>
  );
}
