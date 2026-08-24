"use client";

import { Monitor, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TemplatePreviewProps {
  template: Template;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const isEmail = template.channel === "email";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{template.category}</Badge>
        <Badge variant="outline">
          {isEmail ? "Email via Brevo" : "SMS via Twilio"}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Used {template.usageCount.toLocaleString()} times
        </span>
      </div>

      {isEmail && template.subject && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Subject Line</p>
          <p className="font-medium">{template.subject}</p>
        </div>
      )}

      <Tabs defaultValue="desktop">
        <TabsList>
          <TabsTrigger value="desktop" className="gap-2">
            <Monitor className="h-4 w-4" />
            Desktop
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop">
          <PreviewFrame template={template} width="full" />
        </TabsContent>
        <TabsContent value="mobile">
          <div className="flex justify-center py-4">
            <PreviewFrame template={template} width="mobile" />
          </div>
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Raw Content</p>
        <pre className="text-sm whitespace-pre-wrap font-mono text-foreground/80">
          {template.body.replace(/<[^>]*>/g, "").trim() || template.body}
        </pre>
      </div>
    </div>
  );
}

function PreviewFrame({
  template,
  width,
}: {
  template: Template;
  width: "full" | "mobile";
}) {
  const isEmail = template.channel === "email";

  if (!isEmail) {
    return (
      <div
        className={cn(
          "mx-auto rounded-2xl border-4 border-slate-800 bg-slate-900 p-4 shadow-xl",
          width === "mobile" ? "w-[320px]" : "max-w-md"
        )}
      >
        <div className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white w-fit mb-3">
          SMS Message
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-slate-700 p-3 text-sm text-white leading-relaxed">
          {template.body}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-right">Delivered via Twilio</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-white shadow-sm overflow-hidden",
        width === "mobile" ? "w-[375px] mx-auto" : "w-full"
      )}
    >
      <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">Email Preview — Brevo</span>
      </div>
      <div
        className="p-6"
        dangerouslySetInnerHTML={{ __html: template.body }}
      />
    </div>
  );
}
