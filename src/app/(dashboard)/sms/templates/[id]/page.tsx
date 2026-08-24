import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send, Copy, Pencil } from "lucide-react";
import { Header } from "@/components/layout/header";
import { TemplatePreview } from "@/components/templates/template-preview";
import { Button } from "@/components/ui/button";
import { smsTemplates } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SmsTemplateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const template = smsTemplates.find((t) => t.id === id);

  if (!template) notFound();

  return (
    <>
      <Header title={template.name} description="SMS template preview" />
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sms/templates" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Template
            </Button>
            <Button size="sm" className="gap-2" asChild>
              <Link href="/sms/campaigns/new">
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
