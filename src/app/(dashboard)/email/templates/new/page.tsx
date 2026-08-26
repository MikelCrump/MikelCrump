import { Header } from "@/components/layout/header";
import { EmailTemplateEditor } from "@/components/templates/email-template-editor";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { getReawakenWelcomeTemplate } from "@/lib/brevo";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default function NewEmailTemplatePage() {
  const welcome = getReawakenWelcomeTemplate();

  return (
    <>
      <Header
        title="New Email Template"
        description={`Start from the ${brand.legalName} welcome layout — saves to Brevo`}
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <BrevoStatusBanner />
        <EmailTemplateEditor mode="create" template={welcome} />
      </div>
    </>
  );
}
