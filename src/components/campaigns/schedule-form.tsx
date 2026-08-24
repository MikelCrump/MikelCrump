"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, FileText, Send, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { audienceOptions, templateVariables } from "@/lib/mock-data";
import type { Template } from "@/lib/mock-data";

interface ScheduleCampaignFormProps {
  channel: "email" | "sms";
  templates: Template[];
}

export function ScheduleCampaignForm({ channel, templates }: ScheduleCampaignFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? "");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("schedule");

  const template = templates.find((t) => t.id === selectedTemplate);
  const isEmail = channel === "email";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Campaign Details
            </CardTitle>
            <CardDescription>
              Give your campaign a name and choose a template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder={
                  isEmail
                    ? "e.g., August Newsletter"
                    : "e.g., Monday Appointment Reminders"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {template && (
                <p className="text-xs text-muted-foreground">{template.preview}</p>
              )}
            </div>

            {isEmail && template?.subject && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input id="subject" defaultValue={template.subject} />
              </div>
            )}

            {!isEmail && template && (
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  defaultValue={template.body}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {template.body.length} characters ·{" "}
                  {Math.ceil(template.body.length / 160)} segment(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Audience
            </CardTitle>
            <CardDescription>Who should receive this campaign?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient List</Label>
              <Select defaultValue={audienceOptions[0]}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Estimated recipients</p>
                <p className="text-xs text-muted-foreground">
                  Based on current contact list and filters
                </p>
              </div>
              <span className="text-2xl font-bold text-primary">8,420</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
            <CardDescription>Send now or pick a date and time</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={sendMode}
              onValueChange={(v) => setSendMode(v as "now" | "schedule")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="now" className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Now
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
              </TabsList>
              <TabsContent value="now" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Your campaign will be sent immediately after you confirm.
                </p>
              </TabsContent>
              <TabsContent value="schedule" className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" defaultValue="2026-08-25" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" defaultValue="09:00" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Timezone: America/New_York (EST)
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Preview & Send</CardTitle>
            <CardDescription>Review before launching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {template && (
              <div
                className={
                  isEmail
                    ? "rounded-lg border bg-white p-4 text-sm max-h-48 overflow-y-auto"
                    : "rounded-2xl bg-slate-800 p-4 text-sm text-white"
                }
              >
                {isEmail ? (
                  <div dangerouslySetInnerHTML={{ __html: template.body }} />
                ) : (
                  template.body
                )}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <Badge variant="outline">
                  {isEmail ? "Email · Brevo" : "SMS · Twilio"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipients</span>
                <span className="font-medium">8,420</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">
                  {sendMode === "now" ? "Immediately" : "Aug 25, 9:00 AM"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button className="w-full gap-2">
                <Send className="h-4 w-4" />
                {sendMode === "now" ? "Send Campaign" : "Schedule Campaign"}
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href={`/${channel}/campaigns`}>Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Personalization Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {templateVariables.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="font-mono text-[10px] cursor-pointer hover:bg-accent"
                >
                  {v}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Click to insert into your message. Values come from your CRM or contact list.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
