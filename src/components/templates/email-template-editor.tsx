"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save, Eye, Code2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { templateVariables } from "@/lib/mock-data";
import type { Template } from "@/lib/mock-data";
import { buildReawakenWelcomeEmailHtml } from "@/lib/reawaken/welcome-email";
import { REAWAKEN_WELCOME_TEMPLATE_NAME } from "@/lib/reawaken/welcome-email";
import { brand } from "@/lib/brand";

const starterHtml = buildReawakenWelcomeEmailHtml();

interface EmailTemplateEditorProps {
  mode: "create" | "edit";
  template?: Template;
}

export function EmailTemplateEditor({ mode, template }: EmailTemplateEditorProps) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [name, setName] = useState(template?.name ?? REAWAKEN_WELCOME_TEMPLATE_NAME);
  const [subject, setSubject] = useState(
    template?.subject ?? `Welcome to ${brand.legalName}!`
  );
  const [tag, setTag] = useState(
    template?.category && !["Active", "Inactive"].includes(template.category)
      ? template.category
      : ""
  );
  const [htmlContent, setHtmlContent] = useState(template?.body ?? starterHtml);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const canSave = useMemo(
    () => name.trim() && subject.trim() && htmlContent.trim().length >= 10,
    [name, subject, htmlContent]
  );

  const insertVariable = (variable: string) => {
    const el = bodyRef.current;
    if (!el) {
      setHtmlContent((prev) => prev + variable);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = htmlContent.slice(0, start) + variable + htmlContent.slice(end);
    setHtmlContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + variable.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const wrapPlainText = () => {
    const plain = htmlContent.replace(/<[^>]+>/g, "").trim();
    if (!plain) return;
    const paragraphs = plain
      .split(/\n+/)
      .map((p) => `<p>${p}</p>`)
      .join("\n  ");
    setHtmlContent(`<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
  ${paragraphs}
</div>`);
  };

  const onSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        name: name.trim(),
        subject: subject.trim(),
        htmlContent,
        tag: tag.trim() || undefined,
        isActive,
      };

      const res = await fetch(
        mode === "edit" && template
          ? `/api/brevo/templates/${template.id}`
          : "/api/brevo/templates",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setFeedback({ type: "success", text: data.message });
      const nextId = data.templateId || template?.id;
      if (nextId) {
        setTimeout(() => router.push(`/email/templates/${nextId}`), 800);
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={template ? `/email/templates/${template.id}` : "/email/templates"}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
            <Label htmlFor="active">Active in Brevo</Label>
          </div>
          <Button onClick={onSave} disabled={!canSave || saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "edit" ? "Save changes" : "Create template"}
          </Button>
        </div>
      </div>

      {feedback && (
        <p
          className={
            feedback.type === "error" ? "text-sm text-red-600" : "text-sm text-emerald-700"
          }
        >
          {feedback.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template details</CardTitle>
              <CardDescription>
                Changes save to Brevo — synced with {brand.legalName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tpl-name">Template name</Label>
                <Input
                  id="tpl-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Welcome Series — Day 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-subject">Subject line</Label>
                <Input
                  id="tpl-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Welcome aboard, {{params.first_name}}"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-tag">Category / tag (optional)</Label>
                <Input
                  id="tpl-tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g., Onboarding"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email body</CardTitle>
              <CardDescription>
                Edit HTML here. Use variables for personalization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {templateVariables.map((v) => (
                  <Badge
                    key={v}
                    variant="secondary"
                    className="font-mono text-[10px] cursor-pointer hover:bg-accent"
                    onClick={() => insertVariable(v)}
                  >
                    {v}
                  </Badge>
                ))}
              </div>
              <Textarea
                ref={bodyRef}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={18}
                className="font-mono text-xs leading-relaxed"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={wrapPlainText}>
                  Format plain text as email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHtmlContent(starterHtml)}
                >
                  Reset to starter layout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-24 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live preview
            </CardTitle>
            <CardDescription>How the email will look to recipients</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  Subject
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4">
                <div className="rounded-lg border border-border overflow-hidden bg-white shadow-sm">
                  <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 truncate">
                      {subject || "Subject line"}
                    </span>
                  </div>
                  <div
                    className="p-6 min-h-[320px]"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="code" className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span> {name || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Subject:</span>{" "}
                  {subject || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Tag:</span> {tag || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {isActive ? "Active" : "Inactive"}
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
