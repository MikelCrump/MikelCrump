import { Header } from "@/components/layout/header";
import { TemplateCard } from "@/components/templates/template-card";
import { emailTemplates } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmailTemplatesPage() {
  const categories = [...new Set(emailTemplates.map((t) => t.category))];

  return (
    <>
      <Header
        title="Email Templates"
        description="Browse and preview templates synced from Brevo"
        action={{ label: "New Template", href: "/email/templates/new" }}
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
              {emailTemplates.map((template) => (
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
                {emailTemplates
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
      </div>
    </>
  );
}
