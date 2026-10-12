import {
  ARRIVE_HOME_CHARGE_AUTOMATION_ID,
  runArriveHomeOpenChargePort,
} from "@/life/arrive-home-charge";
import { lifeEnv } from "@/life/config";
import { MOCK_AUTOMATIONS } from "@/life/mock-data";
import { readJsonFile, writeJsonFile } from "@/life/token-store";
import type { AutomationRule } from "@/life/types";

const DATA_FILE = "life-automations.json";

let memory: AutomationRule[] | null = null;
let testMode = false;

function ensureSeeded(list: AutomationRule[]) {
  const seed = MOCK_AUTOMATIONS.find(
    (a) => a.id === ARRIVE_HOME_CHARGE_AUTOMATION_ID,
  );
  if (!seed) return list;
  if (list.some((a) => a.id === ARRIVE_HOME_CHARGE_AUTOMATION_ID)) return list;
  return [seed, ...list];
}

function ensureLoaded() {
  if (memory) return memory;
  if (testMode) {
    memory = structuredClone(MOCK_AUTOMATIONS);
    return memory;
  }
  try {
    const parsed = readJsonFile<AutomationRule[]>(DATA_FILE);
    if (Array.isArray(parsed) && parsed.length) {
      memory = ensureSeeded(parsed);
      if (memory.length !== parsed.length) persist();
      return memory;
    }
  } catch {
    /* seed defaults */
  }
  memory = structuredClone(MOCK_AUTOMATIONS);
  persist();
  return memory;
}

function persist() {
  if (!memory || testMode) return;
  try {
    writeJsonFile(DATA_FILE, memory);
  } catch {
    /* Vercel filesystem may be unavailable; keep in-memory copy */
  }
}

export function listAutomations() {
  return ensureLoaded();
}

export function toggleAutomation(id: string, enabled?: boolean) {
  const list = ensureLoaded();
  memory = list.map((a) =>
    a.id === id ? { ...a, enabled: enabled ?? !a.enabled } : a,
  );
  persist();
  return memory.find((a) => a.id === id) ?? null;
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
  memory = [rule, ...ensureLoaded()];
  persist();
  return rule;
}

export function markAutomationRan(id: string) {
  memory = ensureLoaded().map((a) =>
    a.id === id
      ? {
          ...a,
          lastRun: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        }
      : a,
  );
  persist();
}

export async function runAutomation(id: string) {
  const rule = ensureLoaded().find((a) => a.id === id);
  if (!rule) return { ok: false, detail: "Automation not found" };
  if (!rule.enabled) return { ok: false, detail: "Automation disabled" };

  if (id === ARRIVE_HOME_CHARGE_AUTOMATION_ID) {
    const result = await runArriveHomeOpenChargePort({
      assumeHome: true,
      force: true,
    });
    if (result.ok) markAutomationRan(id);
    return result;
  }

  const cfg = lifeEnv();
  let detail = `Ran locally: ${rule.action}`;

  if (cfg.homeAssistantUrl && cfg.homeAssistantToken && cfg.haWebhookId) {
    try {
      const res = await fetch(
        `${cfg.homeAssistantUrl}/api/webhook/${cfg.haWebhookId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfg.homeAssistantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: rule.id,
            name: rule.name,
            trigger: rule.trigger,
            action: rule.action,
          }),
        },
      );
      detail = res.ok
        ? `HA webhook accepted for ${rule.name}`
        : `HA webhook failed (${res.status}); recorded locally`;
    } catch (error) {
      detail =
        error instanceof Error
          ? `HA webhook error: ${error.message}`
          : "HA webhook error";
    }
  }

  markAutomationRan(id);
  return { ok: true, detail };
}

export function resetAutomationsForTests() {
  testMode = true;
  memory = structuredClone(MOCK_AUTOMATIONS);
}
