import { Header } from "@/components/layout/header";
import { TemplateCard } from "@/components/templates/template-card";
import { BrevoStatusBanner } from "@/components/brevo/status-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listEmailTemplates } from "@/lib/brevo";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const { templates, source } = await listEmailTemplates();
  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <>
      <Header
        title="Email Templates"
        description="Browse and preview templates synced from Brevo"
        action={{ label: "New Template", href: "/email/templates/new" }}
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <BrevoStatusBanner />
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {templates.length} templates
          </h2>
          <Badge variant={source === "brevo" ? "success" : "warning"}>
            {source === "brevo" ? "Synced from Brevo" : "Demo data"}
          </Badge>
        </div>
        {templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="font-medium">No templates found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a transactional template in Brevo, then refresh this page.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
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
            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-6">
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {templates
                    .filter((t) => t.category === cat)
                    .map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        basePath="/email/templates"
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </>
  );
}
