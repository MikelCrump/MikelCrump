import { Header } from "@/components/layout/header";
import { TemplateCard } from "@/components/templates/template-card";
import { smsTemplates } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SmsTemplatesPage() {
  const categories = [...new Set(smsTemplates.map((t) => t.category))];

  return (
    <>
      <Header
        title="SMS Templates"
        description="Browse and preview SMS templates for Twilio"
        action={{ label: "New Template", href: "/sms/templates/new" }}
      />
      <div className="p-8 space-y-6 animate-fade-in">
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
              {smsTemplates.map((template) => (
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
                {smsTemplates
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
