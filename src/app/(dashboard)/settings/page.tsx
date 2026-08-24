"use client";

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

export default function SettingsPage() {
  return (
    <>
      <Header
        title="Settings"
        description="Configure your workspace and team preferences"
      />
      <div className="p-8 max-w-3xl space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>General workspace settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input id="workspace-name" defaultValue="ReachFlow" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select defaultValue="america-new-york">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america-new-york">
                    America/New_York (EST)
                  </SelectItem>
                  <SelectItem value="america-chicago">
                    America/Chicago (CST)
                  </SelectItem>
                  <SelectItem value="america-los-angeles">
                    America/Los_Angeles (PST)
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
            <CardDescription>Default sender settings for email campaigns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input id="from-name" defaultValue="Your Company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input id="from-email" defaultValue="hello@yourcompany.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply-to">Reply-To Email</Label>
              <Input id="reply-to" defaultValue="support@yourcompany.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMS Defaults (Twilio)</CardTitle>
            <CardDescription>Default settings for SMS campaigns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from-number">From Phone Number</Label>
              <Input id="from-number" defaultValue="+1 (555) 123-4567" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Include opt-out message</p>
                <p className="text-xs text-muted-foreground">
                  Automatically append &quot;Reply STOP to opt out&quot; to marketing SMS
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Notifications</CardTitle>
            <CardDescription>Get notified about campaign activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Campaign sent notifications</p>
                <p className="text-xs text-muted-foreground">
                  Email when a scheduled campaign completes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Automation alerts</p>
                <p className="text-xs text-muted-foreground">
                  Notify when an automation errors or pauses
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">New contact sync</p>
                <p className="text-xs text-muted-foreground">
                  Daily summary of contacts synced from ManyChat
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </>
  );
}
