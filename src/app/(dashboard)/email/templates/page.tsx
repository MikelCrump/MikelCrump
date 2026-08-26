import { Header } from "@/components/layout/header";
import { TemplateCard } from "@/components/templates/template-card";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listEmailTemplates, ensureReawakenWelcomeTemplate } from "@/lib/brevo";
import { Badge } from "@/components/ui/badge";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  await ensureReawakenWelcomeTemplate().catch(() => null);
  const { templates, source } = await listEmailTemplates();

  return (
    <>
      <Header
        title="Email Templates"
        description={`${brand.legalName} welcome and outreach templates via Brevo`}
        action={{ label: "New Template", href: "/email/templates/new" }}
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <BrevoStatusBanner />
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {templates.length} template{templates.length === 1 ? "" : "s"}
          </h2>
          <Badge variant={source === "brevo" ? "success" : "secondary"}>
            {source === "brevo" ? "Live in Brevo" : "Preview mode"}
          </Badge>
        </div>
        {templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="font-medium">Welcome template syncing…</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect Brevo to publish the Reawaken welcome email.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Reawaken Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    basePath="/email/templates"
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
