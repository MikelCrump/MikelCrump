"use client";

import React, { useState } from "react";
import {
  Zap,
  Mail,
  MessageSquare,
  Clock,
  GitBranch,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StepType = "trigger" | "email" | "sms" | "delay" | "condition";

interface WorkflowStep {
  id: string;
  type: StepType;
  label: string;
  detail: string;
}

const defaultSteps: WorkflowStep[] = [
  {
    id: "1",
    type: "trigger",
    label: "Trigger",
    detail: "ManyChat: New subscriber",
  },
  {
    id: "2",
    type: "email",
    label: "Send Email",
    detail: "Welcome Series — Day 1",
  },
  {
    id: "3",
    type: "delay",
    label: "Wait",
    detail: "2 days",
  },
  {
    id: "4",
    type: "sms",
    label: "Send SMS",
    detail: "Lead Follow-up",
  },
];

const stepIcons: Record<StepType, React.ComponentType<{ className?: string }>> = {
  trigger: Zap,
  email: Mail,
  sms: MessageSquare,
  delay: Clock,
  condition: GitBranch,
};

const stepColors: Record<StepType, string> = {
  trigger: "bg-violet-100 text-violet-700 border-violet-200",
  email: "bg-indigo-100 text-indigo-700 border-indigo-200",
  sms: "bg-emerald-100 text-emerald-700 border-emerald-200",
  delay: "bg-amber-100 text-amber-700 border-amber-200",
  condition: "bg-blue-100 text-blue-700 border-blue-200",
};

interface WorkflowBuilderProps {
  initialName?: string;
  initialDescription?: string;
}

export function WorkflowBuilder({
  initialName = "",
  initialDescription = "",
}: WorkflowBuilderProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>(defaultSteps);
  const [selectedStep, setSelectedStep] = useState<string | null>("1");

  const addStep = (type: StepType) => {
    const newStep: WorkflowStep = {
      id: String(Date.now()),
      type,
      label:
        type === "email"
          ? "Send Email"
          : type === "sms"
            ? "Send SMS"
            : type === "delay"
              ? "Wait"
              : "Condition",
      detail:
        type === "email"
          ? "Select template..."
          : type === "sms"
            ? "Select template..."
            : type === "delay"
              ? "1 day"
              : "If contact has tag...",
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep.id);
  };

  const removeStep = (id: string) => {
    if (steps.find((s) => s.id === id)?.type === "trigger") return;
    setSteps(steps.filter((s) => s.id !== id));
    if (selectedStep === id) setSelectedStep(null);
  };

  const selected = steps.find((s) => s.id === selectedStep);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Automation Details</CardTitle>
            <CardDescription>Name and describe your workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auto-name">Automation Name</Label>
              <Input
                id="auto-name"
                placeholder="e.g., New Lead Welcome Journey"
                defaultValue={initialName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-desc">Description</Label>
              <Input
                id="auto-desc"
                placeholder="What does this automation do?"
                defaultValue={initialDescription}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
            <CardDescription>
              Drag to reorder · Click a step to configure it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {steps.map((step, index) => {
                const Icon = stepIcons[step.type];
                const isSelected = selectedStep === step.id;
                return (
                  <div key={step.id}>
                    <button
                      onClick={() => setSelectedStep(step.id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                        isSelected
                          ? "border-primary bg-accent/50 shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-muted/30"
                      )}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                      <div
                        className={cn(
                          "rounded-lg p-2 border shrink-0",
                          stepColors[step.type]
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{step.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {step.detail}
                        </p>
                      </div>
                      {step.type !== "trigger" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStep(step.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </button>
                    {index < steps.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="h-6 w-px bg-border" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => addStep("email")}
              >
                <Plus className="h-3.5 w-3.5" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => addStep("sms")}
              >
                <Plus className="h-3.5 w-3.5" />
                SMS
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => addStep("delay")}
              >
                <Plus className="h-3.5 w-3.5" />
                Delay
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => addStep("condition")}
              >
                <Plus className="h-3.5 w-3.5" />
                Condition
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-base">Step Configuration</CardTitle>
            <CardDescription>
              {selected ? `Configure: ${selected.label}` : "Select a step"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-muted-foreground">
                Click a step in the workflow to configure it.
              </p>
            ) : selected.type === "trigger" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Trigger Source</Label>
                  <Select defaultValue="manychat">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manychat">ManyChat: New subscriber</SelectItem>
                      <SelectItem value="crm-appointment">CRM: Appointment booked</SelectItem>
                      <SelectItem value="crm-order">CRM: Order completed</SelectItem>
                      <SelectItem value="crm-cart">CRM: Cart abandoned</SelectItem>
                      <SelectItem value="manual">Manual enrollment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="info">Lead gen via ManyChat</Badge>
              </div>
            ) : selected.type === "email" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Template (Brevo)</Label>
                  <Select defaultValue="et-1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="et-1">Welcome Series — Day 1</SelectItem>
                      <SelectItem value="et-2">Appointment Reminder</SelectItem>
                      <SelectItem value="et-3">Monthly Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : selected.type === "sms" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>SMS Template (Twilio)</Label>
                  <Select defaultValue="st-2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="st-1">Appointment Reminder SMS</SelectItem>
                      <SelectItem value="st-2">Lead Follow-up</SelectItem>
                      <SelectItem value="st-3">Order Shipped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : selected.type === "delay" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Wait Duration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" defaultValue="2" min={1} />
                    <Select defaultValue="days">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select defaultValue="has-tag">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="has-tag">Contact has tag</SelectItem>
                      <SelectItem value="opened-email">Opened previous email</SelectItem>
                      <SelectItem value="clicked-link">Clicked link in email</SelectItem>
                      <SelectItem value="no-response">No response after delay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <Button className="w-full">Save & Activate</Button>
            <Button variant="outline" className="w-full">
              Save as Draft
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
