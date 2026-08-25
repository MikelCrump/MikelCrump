import { Header } from "@/components/layout/header";
import { TemplateCard } from "@/components/templates/template-card";
import { TwilioStatusBanner } from "@/components/twilio/status-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { listSmsTemplates } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export default async function SmsTemplatesPage() {
  const { templates, source } = await listSmsTemplates();
  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <>
      <Header
        title="SMS Templates"
        description="Browse and preview SMS templates for Twilio"
        action={{ label: "New Campaign", href: "/sms/campaigns/new" }}
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <TwilioStatusBanner />
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {templates.length} templates
          </h2>
          <Badge variant={source === "twilio" ? "success" : "warning"}>
            {source === "twilio" ? "From Twilio Content" : "In-app templates"}
          </Badge>
        </div>
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
                  basePath="/sms/templates"
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
                      basePath="/sms/templates"
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
