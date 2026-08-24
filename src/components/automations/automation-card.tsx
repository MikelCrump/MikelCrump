import Link from "next/link";
import { Zap, Mail, MessageSquare, Play, Pause, MoreHorizontal, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Automation, AutomationStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  AutomationStatus,
  { label: string; variant: "success" | "warning" | "secondary" }
> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  draft: { label: "Draft", variant: "secondary" },
};

interface AutomationCardProps {
  automation: Automation;
}

export function AutomationCard({ automation }: AutomationCardProps) {
  const status = statusConfig[automation.status];
  const completionRate =
    automation.enrolled > 0
      ? Math.round((automation.completed / automation.enrolled) * 100)
      : 0;

  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-700 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/automations/${automation.id}`}
                  className="font-semibold hover:text-primary transition-colors"
                >
                  {automation.name}
                </Link>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {automation.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  Trigger: <strong className="text-foreground">{automation.trigger}</strong>
                </span>
                <span>{automation.steps} steps</span>
                <span className="flex items-center gap-1">
                  {automation.channel === "both" ? (
                    <>
                      <Mail className="h-3 w-3" />
                      <MessageSquare className="h-3 w-3" />
                      Email + SMS
                    </>
                  ) : automation.channel === "email" ? (
                    <>
                      <Mail className="h-3 w-3" /> Email
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-3 w-3" /> SMS
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {automation.status === "active" ? (
              <Button variant="outline" size="sm" className="gap-1">
                <Pause className="h-3.5 w-3.5" />
                Pause
              </Button>
            ) : automation.status === "paused" ? (
              <Button variant="outline" size="sm" className="gap-1">
                <Play className="h-3.5 w-3.5" />
                Resume
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-6 border-t border-border pt-4">
          <div>
            <p className="text-2xl font-bold">{automation.enrolled}</p>
            <p className="text-xs text-muted-foreground">Enrolled</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{automation.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Completion rate</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/automations/${automation.id}`} className="gap-1">
              Edit
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
