"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BrevoTestSend() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const onSend = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/brevo/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: [{ email, name: name || undefined }],
          subject: "ReachFlow test email via Brevo",
          htmlContent: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
  <h1 style="color:#4f46e5">It works!</h1>
  <p>Hi ${name || "there"}, this test email was sent from <strong>ReachFlow</strong> using the Brevo API.</p>
  <p style="color:#64748b;font-size:14px">You can now sync templates and schedule campaigns.</p>
</div>`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Send failed");
      }
      setStatus("success");
      setMessage(
        data.source === "demo"
          ? data.message
          : `Sent successfully. Message ID: ${data.messageId}`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Send failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a test email</CardTitle>
        <CardDescription>
          Verifies your Brevo API key and sender settings with a one-off transactional email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="test-email">Recipient email</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-name">Name (optional)</Label>
            <Input
              id="test-name"
              placeholder="Mikel"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={onSend}
          disabled={!email || status === "loading"}
          className="gap-2"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send test email
        </Button>
        {message && (
          <p
            className={
              status === "error"
                ? "text-sm text-red-600"
                : "text-sm text-emerald-700"
            }
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
