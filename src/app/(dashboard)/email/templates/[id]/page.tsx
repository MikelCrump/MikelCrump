import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send, Pencil } from "lucide-react";
import { Header } from "@/components/layout/header";
import { TemplatePreview } from "@/components/templates/template-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEmailTemplate } from "@/lib/brevo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmailTemplateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getEmailTemplate(id);

  if (!result) notFound();

  const { template, source } = result;

  return (
    <>
      <Header title={template.name} description="Email template preview" />
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/email/templates" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Link>
            </Button>
            <Badge variant={source === "brevo" ? "success" : "warning"}>
              {source === "brevo" ? "Brevo" : "Demo"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href={`/email/templates/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit template
              </Link>
            </Button>
            <Button size="sm" className="gap-2" asChild>
              <Link href="/email/campaigns/new">
                <Send className="h-4 w-4" />
                Use in Campaign
              </Link>
            </Button>
          </div>
        </div>
        <TemplatePreview template={template} />
      </div>
    </>
  );
}
