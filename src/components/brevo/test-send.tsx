"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brand } from "@/lib/brand";

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
      const res = await fetch("/api/brevo/templates/welcome", { method: "POST" });
      const welcome = await res.json();
      const templateId = welcome.template?.id
        ? Number(welcome.template.id)
        : undefined;

      const sendRes = await fetch("/api/brevo/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          templateId && !Number.isNaN(templateId)
            ? {
                to: [{ email, name: name || undefined }],
                templateId,
                params: {
                  FIRSTNAME: name?.split(" ")[0] || "Friend",
                  LASTNAME: name?.split(" ").slice(1).join(" ") || "",
                },
              }
            : {
                to: [{ email, name: name || undefined }],
                subject: `Welcome to ${brand.legalName}!`,
                htmlContent: welcome.template?.body,
              }
        ),
      });
      const data = await sendRes.json();
      if (!sendRes.ok) {
        throw new Error(data.error || "Send failed");
      }
      setStatus("success");
      setMessage(
        data.source === "demo"
          ? data.message
          : `Reawaken welcome email sent. Message ID: ${data.messageId}`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Send failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send welcome email test</CardTitle>
        <CardDescription>
          Sends the live Reawaken welcome template through Brevo to verify your setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="test-email">Recipient email</Label>
            <Input
              id="test-email"
              type="email"
              placeholder={brand.supportEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-name">First name</Label>
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
          Send welcome email
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
