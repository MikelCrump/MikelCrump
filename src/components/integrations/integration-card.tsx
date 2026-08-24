"use client";

import { Check, ExternalLink, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Integration } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const categoryLabels: Record<Integration["category"], string> = {
  email: "Email Provider",
  sms: "SMS Provider",
  crm: "CRM",
  "lead-gen": "Lead Generation",
};

const logoColors: Record<string, string> = {
  B: "bg-orange-500",
  T: "bg-red-500",
  M: "bg-blue-500",
  S: "bg-emerald-500",
  V: "bg-slate-800",
};

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  return (
    <Card
      className={cn(
        "transition-all",
        integration.connected && "border-emerald-200 bg-emerald-50/30"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white",
                logoColors[integration.logo] ?? "bg-primary"
              )}
            >
              {integration.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{integration.name}</h3>
                {integration.connected && (
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {categoryLabels[integration.category]}
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {integration.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {integration.connected ? (
              <>
                <Switch defaultChecked />
                <Button variant="outline" size="sm" className="gap-1">
                  <Settings className="h-3.5 w-3.5" />
                  Configure
                </Button>
              </>
            ) : (
              <Button size="sm" className="gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
