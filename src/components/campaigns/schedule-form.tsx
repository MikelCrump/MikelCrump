"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, FileText, Send, Save, Loader2 } from "lucide-react";
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
  dataSource?: "brevo" | "twilio" | "demo";
}

export function ScheduleCampaignForm({
  channel,
  templates,
  dataSource = "demo",
}: ScheduleCampaignFormProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? "");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("schedule");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(templates[0]?.subject ?? "");
  const [smsBody, setSmsBody] = useState(templates[0]?.body ?? "");
  const [date, setDate] = useState("2026-08-25");
  const [time, setTime] = useState("09:00");
  const [listIds, setListIds] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [smsTo, setSmsTo] = useState("");
  const [submitting, setSubmitting] = useState<"idle" | "send" | "draft" | "test">("idle");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const template = templates.find((t) => t.id === selectedTemplate);
  const isEmail = channel === "email";

  const scheduledLabel = useMemo(() => {
    if (sendMode === "now") return "Immediately";
    return `${date} at ${time}`;
  }, [sendMode, date, time]);

  const onTemplateChange = (id: string) => {
    setSelectedTemplate(id);
    const next = templates.find((t) => t.id === id);
    if (next?.subject) setSubject(next.subject);
    if (next?.body && channel === "sms") setSmsBody(next.body);
  };

  const buildScheduledAt = () => {
    if (sendMode !== "schedule") return undefined;
    const iso = new Date(`${date}T${time}:00`);
    if (Number.isNaN(iso.getTime())) return undefined;
    return iso.toISOString();
  };

  const parseListIds = () =>
    listIds
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);

  const submitEmailCampaign = async (mode: "send" | "draft") => {
    if (!isEmail) return;
    setSubmitting(mode === "send" ? "send" : "draft");
    setFeedback(null);

    try {
      const numericTemplateId = Number(selectedTemplate);
      const payload: Record<string, unknown> = {
        name: name || template?.name || "Untitled campaign",
        subject: subject || template?.subject || "No subject",
        sendNow: mode === "send" && sendMode === "now",
        scheduledAt:
          mode === "send" && sendMode === "schedule" ? buildScheduledAt() : undefined,
        listIds: parseListIds(),
      };

      if (!Number.isNaN(numericTemplateId) && dataSource === "brevo") {
        payload.templateId = numericTemplateId;
      } else if (template?.body) {
        payload.htmlContent = template.body;
      }

      const res = await fetch("/api/brevo/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Campaign failed");

      setFeedback({ type: "success", text: data.message });
      if (data.source === "brevo") {
        setTimeout(() => router.push("/email/campaigns"), 1200);
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Campaign failed",
      });
    } finally {
      setSubmitting("idle");
    }
  };

  const sendTestEmail = async () => {
    if (!isEmail || !testEmail) return;
    setSubmitting("test");
    setFeedback(null);
    try {
      const numericTemplateId = Number(selectedTemplate);
      const payload: Record<string, unknown> = {
        to: [{ email: testEmail }],
        subject: subject || template?.subject,
        scheduledAt: sendMode === "schedule" ? buildScheduledAt() : undefined,
      };

      if (!Number.isNaN(numericTemplateId) && dataSource === "brevo") {
        payload.templateId = numericTemplateId;
      } else {
        payload.htmlContent = template?.body;
      }

      const res = await fetch("/api/brevo/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test send failed");
      setFeedback({
        type: "success",
        text:
          data.source === "demo"
            ? data.message
            : `Test email sent. Message ID: ${data.messageId}`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Test send failed",
      });
    } finally {
      setSubmitting("idle");
    }
  };

  const submitSms = async () => {
    if (isEmail) return;
    if (!smsTo.trim()) {
      setFeedback({ type: "error", text: "Enter a recipient phone number (E.164)." });
      return;
    }
    setSubmitting("send");
    setFeedback(null);
    try {
      const payload: Record<string, unknown> = {
        to: smsTo,
        body: smsBody || template?.body || "",
      };
      if (sendMode === "schedule") {
        const sendAt = buildScheduledAt();
        if (sendAt) payload.sendAt = sendAt;
      }
      const res = await fetch("/api/twilio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "SMS send failed");
      setFeedback({
        type: "success",
        text:
          data.source === "demo"
            ? data.message
            : `SMS ${data.status}. SID: ${data.sid}`,
      });
      if (data.source === "twilio") {
        setTimeout(() => router.push("/sms/campaigns"), 1200);
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "SMS send failed",
      });
    } finally {
      setSubmitting("idle");
    }
  };

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
              {isEmail && dataSource === "brevo" ? " from Brevo" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  isEmail
                    ? "e.g., August Newsletter"
                    : "e.g., Monday Appointment Reminders"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={onTemplateChange}>
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

            {isEmail && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
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
            <CardDescription>
              {isEmail
                ? "Use a Brevo list ID for marketing campaigns, or send a test to one inbox"
                : "Who should receive this campaign?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEmail ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="list-ids">Brevo List IDs (optional)</Label>
                  <Input
                    id="list-ids"
                    placeholder="e.g., 2, 5"
                    value={listIds}
                    onChange={(e) => setListIds(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required to send/schedule a marketing campaign to a list. Find IDs in Brevo → Contacts → Lists.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-recipient">Test recipient email</Label>
                  <Input
                    id="test-recipient"
                    type="email"
                    placeholder="you@company.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sms-to">Recipient phone (E.164)</Label>
                  <Input
                    id="sms-to"
                    placeholder="+15551234567"
                    value={smsTo}
                    onChange={(e) => setSmsTo(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    For now this sends to one number via Twilio. Bulk audiences come next with contact lists.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {smsBody.length} characters ·{" "}
                    {Math.ceil(smsBody.length / 160) || 1} segment(s)
                  </p>
                </div>
              </>
            )}
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
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Stored as UTC for Brevo scheduling.
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
                  {isEmail
                    ? `Email · ${dataSource === "brevo" ? "Brevo live" : "Demo"}`
                    : `SMS · ${dataSource === "twilio" ? "Twilio live" : "Demo"}`}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{scheduledLabel}</span>
              </div>
            </div>

            {feedback && (
              <p
                className={
                  feedback.type === "error"
                    ? "text-sm text-red-600"
                    : "text-sm text-emerald-700"
                }
              >
                {feedback.text}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {isEmail ? (
                <>
                  <Button
                    className="w-full gap-2"
                    disabled={submitting !== "idle"}
                    onClick={() => submitEmailCampaign("send")}
                  >
                    {submitting === "send" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {sendMode === "now" ? "Send Campaign" : "Schedule Campaign"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={submitting !== "idle" || !testEmail}
                    onClick={sendTestEmail}
                  >
                    {submitting === "test" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send test email
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={submitting !== "idle"}
                    onClick={() => submitEmailCampaign("draft")}
                  >
                    {submitting === "draft" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save as Draft
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full gap-2"
                  disabled={submitting !== "idle" || !smsTo}
                  onClick={submitSms}
                >
                  {submitting === "send" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sendMode === "now" ? "Send SMS" : "Schedule SMS"}
                </Button>
              )}
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
              Brevo templates use contact attributes and {"{{params.*}}"} for transactional sends.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
