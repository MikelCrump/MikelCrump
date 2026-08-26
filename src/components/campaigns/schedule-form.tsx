"use client";

import { useEffect, useMemo, useState } from "react";
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
import { templateVariables } from "@/lib/mock-data";
import type { Template } from "@/lib/mock-data";
import type { BrevoList } from "@/lib/brevo/lists";

interface ScheduleCampaignFormProps {
  channel: "email" | "sms";
  templates: Template[];
  dataSource?: "brevo" | "twilio" | "demo";
  brevoLists?: BrevoList[];
}

type SmsAudienceMode = "single" | "list" | "paste";

export function ScheduleCampaignForm({
  channel,
  templates,
  dataSource = "demo",
  brevoLists = [],
}: ScheduleCampaignFormProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? "");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("schedule");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(templates[0]?.subject ?? "");
  const [smsBody, setSmsBody] = useState(templates[0]?.body ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [lists, setLists] = useState<BrevoList[]>(brevoLists);
  const [testEmail, setTestEmail] = useState("");
  const [smsTo, setSmsTo] = useState("");
  const [smsAudienceMode, setSmsAudienceMode] = useState<SmsAudienceMode>("single");
  const [smsListId, setSmsListId] = useState<string>("");
  const [smsPasteNumbers, setSmsPasteNumbers] = useState("");
  const [submitting, setSubmitting] = useState<"idle" | "send" | "draft" | "test">("idle");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (channel !== "email" && channel !== "sms") return;
    if (dataSource !== "brevo" && channel === "email") return;
    if (brevoLists.length > 0) return;

    fetch("/api/brevo/lists")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.lists)) setLists(data.lists);
      })
      .catch(() => {});
  }, [channel, dataSource, brevoLists.length]);

  const template = templates.find((t) => t.id === selectedTemplate);
  const isEmail = channel === "email";

  const scheduledLabel = useMemo(() => {
    if (sendMode === "now") return "Immediately";
    return `${date} at ${time}`;
  }, [sendMode, date, time]);

  const smsRecipientPreview = useMemo(() => {
    if (smsAudienceMode === "single") return smsTo ? 1 : 0;
    if (smsAudienceMode === "paste") {
      return smsPasteNumbers
        .split(/[\n,;]+/)
        .map((v) => v.trim())
        .filter(Boolean).length;
    }
    const list = lists.find((l) => String(l.id) === smsListId);
    return list?.totalSubscribers ?? 0;
  }, [smsAudienceMode, smsTo, smsPasteNumbers, smsListId, lists]);

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

  const toggleListId = (id: number) => {
    setSelectedListIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

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
        listIds: selectedListIds,
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

    setSubmitting("send");
    setFeedback(null);

    try {
      const body = smsBody || template?.body || "";
      const sendAt =
        sendMode === "schedule" ? buildScheduledAt() : undefined;

      if (smsAudienceMode === "single") {
        if (!smsTo.trim()) {
          throw new Error("Enter a recipient phone number (E.164).");
        }
        const res = await fetch("/api/twilio/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: smsTo,
            body,
            sendAt,
          }),
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
      } else {
        const payload: Record<string, unknown> = { body, sendAt };
        if (smsAudienceMode === "list") {
          if (!smsListId) throw new Error("Select a Brevo list.");
          payload.listId = Number(smsListId);
        } else {
          const recipients = smsPasteNumbers
            .split(/[\n,;]+/)
            .map((v) => v.trim())
            .filter(Boolean);
          if (!recipients.length) {
            throw new Error("Paste at least one phone number.");
          }
          payload.recipients = recipients;
        }

        const res = await fetch("/api/twilio/bulk-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Bulk SMS failed");
        setFeedback({
          type: "success",
          text: data.message,
        });
      }

      if (dataSource === "twilio") {
        setTimeout(() => router.push("/sms/campaigns"), 1500);
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

  const canSubmitSms =
    smsAudienceMode === "single"
      ? Boolean(smsTo.trim())
      : smsAudienceMode === "list"
        ? Boolean(smsListId)
        : Boolean(smsPasteNumbers.trim());

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
                  <Label>Brevo lists</Label>
                  {lists.length > 0 ? (
                    <div className="space-y-2 rounded-lg border border-border p-3 max-h-48 overflow-y-auto">
                      {lists.map((list) => (
                        <label
                          key={list.id}
                          className="flex items-center gap-3 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            checked={selectedListIds.includes(list.id)}
                            onChange={() => toggleListId(list.id)}
                          />
                          <span className="flex-1">{list.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {list.totalSubscribers.toLocaleString()}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {dataSource === "brevo"
                        ? "No lists found in Brevo yet. Create one under Contacts → Lists."
                        : "Connect Brevo to pick lists from your account."}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Required to send or schedule a marketing campaign. Test sends below go to one inbox.
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
                <Tabs
                  value={smsAudienceMode}
                  onValueChange={(v) => setSmsAudienceMode(v as SmsAudienceMode)}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="single">Single</TabsTrigger>
                    <TabsTrigger value="list">Brevo list</TabsTrigger>
                    <TabsTrigger value="paste">Paste numbers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="single" className="mt-4 space-y-2">
                    <Label htmlFor="sms-to">Recipient phone (E.164)</Label>
                    <Input
                      id="sms-to"
                      placeholder="+15551234567"
                      value={smsTo}
                      onChange={(e) => setSmsTo(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="list" className="mt-4 space-y-2">
                    <Label>Brevo list (SMS attribute required)</Label>
                    <Select value={smsListId} onValueChange={setSmsListId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a list" />
                      </SelectTrigger>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={String(list.id)}>
                            {list.name} ({list.totalSubscribers.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Sends to contacts in the list with a phone in the SMS attribute (max 50 per send).
                    </p>
                  </TabsContent>
                  <TabsContent value="paste" className="mt-4 space-y-2">
                    <Label htmlFor="sms-paste">Phone numbers</Label>
                    <Textarea
                      id="sms-paste"
                      placeholder={"+15551234567\n+15559876543"}
                      value={smsPasteNumbers}
                      onChange={(e) => setSmsPasteNumbers(e.target.value)}
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      One number per line or comma-separated (max 50).
                    </p>
                  </TabsContent>
                </Tabs>
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
                    {smsAudienceMode !== "single" && smsRecipientPreview > 0
                      ? ` · ~${smsRecipientPreview} recipient(s)`
                      : ""}
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
              {!isEmail && smsAudienceMode !== "single" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Audience</span>
                  <span className="font-medium">
                    {smsAudienceMode === "list" ? "Brevo list" : "Pasted numbers"}
                  </span>
                </div>
              )}
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
                  disabled={submitting !== "idle" || !canSubmitSms}
                  onClick={submitSms}
                >
                  {submitting === "send" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sendMode === "now"
                    ? smsAudienceMode === "single"
                      ? "Send SMS"
                      : "Send bulk SMS"
                    : "Schedule SMS"}
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
