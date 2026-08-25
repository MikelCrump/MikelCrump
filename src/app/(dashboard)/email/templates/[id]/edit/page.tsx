import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EmailTemplateEditor } from "@/components/templates/email-template-editor";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { getEmailTemplate } from "@/lib/brevo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmailTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getEmailTemplate(id);
  if (!result) notFound();

  return (
    <>
      <Header
        title={`Edit: ${result.template.name}`}
        description="Edit in ReachFlow — changes sync to Brevo"
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <BrevoStatusBanner />
        <EmailTemplateEditor mode="edit" template={result.template} />
      </div>
    </>
  );
}
