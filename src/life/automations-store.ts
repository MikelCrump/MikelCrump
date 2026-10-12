import { MOCK_AUTOMATIONS } from "@/life/mock-data";
import type { AutomationRule } from "@/life/types";

let automations: AutomationRule[] = structuredClone(MOCK_AUTOMATIONS);

export function listAutomations() {
  return automations;
}

export function toggleAutomation(id: string, enabled?: boolean) {
  automations = automations.map((a) =>
    a.id === id ? { ...a, enabled: enabled ?? !a.enabled } : a,
  );
  return automations.find((a) => a.id === id) ?? null;
}

export function createAutomation(input: {
  name: string;
  trigger: string;
  action: string;
}) {
  const rule: AutomationRule = {
    id: `auto-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name,
    trigger: input.trigger,
    action: input.action,
    enabled: true,
    lastRun: null,
  };
  automations = [rule, ...automations];
  return rule;
}

export function resetAutomationsForTests() {
  automations = structuredClone(MOCK_AUTOMATIONS);
}
