"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TwilioTestSend() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState(
    "ReachFlow test SMS via Twilio — your messaging platform is connected."
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const onSend = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/twilio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setStatus("success");
      setMessage(
        data.source === "demo"
          ? data.message
          : `Sent. SID: ${data.sid} · Status: ${data.status}`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Send failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a test SMS</CardTitle>
        <CardDescription>
          Verifies your Twilio credentials and from-number with a one-off text.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sms-to">Recipient phone (E.164)</Label>
          <Input
            id="sms-to"
            placeholder="+15551234567"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sms-body">Message</Label>
          <Textarea
            id="sms-body"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {body.length} characters · {Math.ceil(body.length / 160) || 1} segment(s)
          </p>
        </div>
        <Button
          onClick={onSend}
          disabled={!to || !body || status === "loading"}
          className="gap-2"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send test SMS
        </Button>
        {message && (
          <p
            className={
              status === "error" ? "text-sm text-red-600" : "text-sm text-emerald-700"
            }
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
