import { Header } from "@/components/layout/header";
import { EmailTemplateEditor } from "@/components/templates/email-template-editor";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";

export const dynamic = "force-dynamic";

export default function NewEmailTemplatePage() {
  return (
    <>
      <Header
        title="New Email Template"
        description="Create a template in ReachFlow — saved to Brevo automatically"
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <BrevoStatusBanner />
        <EmailTemplateEditor mode="create" />
      </div>
    </>
  );
}
