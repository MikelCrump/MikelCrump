import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { brand } from "@/lib/brand";
import { getBrevoConfig, isBrevoConfigured } from "@/lib/brevo/client";
import { getTwilioConfig, isTwilioConfigured } from "@/lib/twilio/client";

export default function SettingsPage() {
  const brevo = isBrevoConfigured() ? getBrevoConfig() : null;
  const twilio = isTwilioConfigured() ? getTwilioConfig() : null;

  return (
    <>
      <Header
        title="Settings"
        description={`${brand.legalName} communications workspace`}
      />
      <div className="p-8 max-w-3xl space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Organization profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Organization</Label>
              <Input id="workspace-name" defaultValue={brand.legalName} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select defaultValue="america-chicago">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america-chicago">
                    America/Chicago (CST)
                  </SelectItem>
                  <SelectItem value="america-new-york">
                    America/New_York (EST)
                  </SelectItem>
                  <SelectItem value="america-denver">
                    America/Denver (MST)
                  </SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Defaults (Brevo)</CardTitle>
            <CardDescription>Live sender from your connected Brevo account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                defaultValue={brevo?.senderName ?? brand.senderName}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                defaultValue={brevo?.senderEmail ?? brand.senderEmail}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply-to">Reply-To Email</Label>
              <Input id="reply-to" defaultValue={brand.supportEmail} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMS Defaults (Twilio)</CardTitle>
            <CardDescription>Live sender from your connected Twilio account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from-number">From Phone Number</Label>
              <Input
                id="from-number"
                defaultValue={twilio?.phoneNumber ?? "Not connected"}
                readOnly
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Include opt-out message</p>
                <p className="text-xs text-muted-foreground">
                  Marketing SMS include &quot;Reply STOP to opt out&quot;
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Notifications</CardTitle>
            <CardDescription>Campaign activity alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Campaign sent notifications</p>
                <p className="text-xs text-muted-foreground">
                  Email when a scheduled campaign completes
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Command Center contact sync</p>
                <p className="text-xs text-muted-foreground">
                  Daily summary when CRM contacts update
                </p>
              </div>
              <Switch disabled />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button disabled>Save Changes</Button>
        </div>
      </div>
    </>
  );
}
