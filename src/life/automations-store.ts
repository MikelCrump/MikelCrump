import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { lifeEnv } from "@/life/config";
import { MOCK_AUTOMATIONS } from "@/life/mock-data";
import type { AutomationRule } from "@/life/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "life-automations.json");

let memory: AutomationRule[] | null = null;
let testMode = false;

function ensureLoaded() {
  if (memory) return memory;
  if (testMode) {
    memory = structuredClone(MOCK_AUTOMATIONS);
    return memory;
  }
  try {
    if (existsSync(DATA_FILE)) {
      const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8")) as AutomationRule[];
      if (Array.isArray(parsed) && parsed.length) {
        memory = parsed;
        return memory;
      }
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
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(memory, null, 2));
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

export async function runAutomation(id: string) {
  const rule = ensureLoaded().find((a) => a.id === id);
  if (!rule) return { ok: false, detail: "Automation not found" };
  if (!rule.enabled) return { ok: false, detail: "Automation disabled" };

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
  return { ok: true, detail };
}

export function resetAutomationsForTests() {
  testMode = true;
  memory = structuredClone(MOCK_AUTOMATIONS);
}
