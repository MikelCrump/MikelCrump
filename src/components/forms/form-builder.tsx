"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Code2,
  Copy,
  Check,
  ExternalLink,
  GripVertical,
  Eye,
  Settings2,
} from "lucide-react";
import type { Form } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormRenderer } from "./form-renderer";

interface FormBuilderProps {
  formId: string;
}

export function FormBuilder({ formId }: FormBuilderProps) {
  const form = useAppStore((s) => s.getForm(formId));
  const table = useAppStore((s) =>
    form ? s.getTable(form.tableId) : undefined
  );
  const updateForm = useAppStore((s) => s.updateForm);
  const submitForm = useAppStore((s) => s.submitForm);

  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!form || !table) return null;

  const embedUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/embed/${form.id}`
      : `/embed/${form.id}`;

  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" style="border:none;border-radius:12px;"></iframe>`;

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleField = (fieldId: string) => {
    const included = form.fieldIds.includes(fieldId);
    updateForm(form.id, {
      fieldIds: included
        ? form.fieldIds.filter((id) => id !== fieldId)
        : [...form.fieldIds, fieldId],
    });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/base/${form.baseId}/table/${form.tableId}`}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900">{form.name}</h1>
              <Badge variant={form.published ? "success" : "secondary"}>
                {form.published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">Form builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEmbed(true)}>
            <Code2 className="h-4 w-4" />
            Embed
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/embed/${form.id}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => updateForm(form.id, { published: !form.published })}
          >
            {form.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4">
          <Tabs defaultValue="fields">
            <TabsList className="w-full">
              <TabsTrigger value="fields" className="flex-1">
                <GripVertical className="mr-1 h-3.5 w-3.5" />
                Fields
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                <Settings2 className="mr-1 h-3.5 w-3.5" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="mt-4 space-y-2">
              <p className="mb-3 text-xs text-slate-500">
                Toggle fields to include in your form
              </p>
              {table.fields.map((field) => {
                const included = form.fieldIds.includes(field.id);
                return (
                  <label
                    key={field.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50"
                  >
                    <Switch
                      checked={included}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {field.name}
                      </p>
                      <p className="text-xs text-slate-400">{field.type}</p>
                    </div>
                    {field.required && (
                      <span className="text-xs text-red-400">Required</span>
                    )}
                  </label>
                );
              })}
            </TabsContent>

            <TabsContent value="settings" className="mt-4 space-y-4">
              <div>
                <Label>Form title</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm(form.id, { name: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    updateForm(form.id, { description: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Submit button text</Label>
                <Input
                  value={form.submitButtonText || ""}
                  onChange={(e) =>
                    updateForm(form.id, { submitButtonText: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Success message</Label>
                <Textarea
                  value={form.successMessage || ""}
                  onChange={(e) =>
                    updateForm(form.id, { successMessage: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Primary color</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={form.settings.primaryColor || "#2563eb"}
                    onChange={(e) =>
                      updateForm(form.id, {
                        settings: {
                          ...form.settings,
                          primaryColor: e.target.value,
                        },
                      })
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                  />
                  <Input
                    value={form.settings.primaryColor || "#2563eb"}
                    onChange={(e) =>
                      updateForm(form.id, {
                        settings: {
                          ...form.settings,
                          primaryColor: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden bg-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
            <Eye className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">Live preview</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white shadow-sm">
              <FormRenderer
                form={form}
                fields={table.fields}
                onSubmit={(values) => submitForm(form.id, values)}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEmbed} onOpenChange={setShowEmbed}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Embed this form</DialogTitle>
            <DialogDescription>
              Copy the code below and paste it into your website, like on
              reawakenusa.org/pastors.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-slate-500">Direct link</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input value={embedUrl} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(embedUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Iframe embed code</Label>
              <div className="relative mt-1">
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                  {iframeCode}
                </pre>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={copyEmbed}
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
