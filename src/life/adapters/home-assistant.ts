import { lifeEnv } from "@/life/config";

export async function haGetState(entityId: string): Promise<Record<string, unknown> | null> {
  const cfg = lifeEnv();
  if (!cfg.homeAssistantUrl || !cfg.homeAssistantToken) return null;
  const res = await fetch(`${cfg.homeAssistantUrl}/api/states/${entityId}`, {
    headers: { Authorization: `Bearer ${cfg.homeAssistantToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

export async function haCallService(
  domain: string,
  service: string,
  entityId: string,
  data: Record<string, unknown> = {},
): Promise<boolean> {
  const cfg = lifeEnv();
  if (!cfg.homeAssistantUrl || !cfg.homeAssistantToken) return false;
  const res = await fetch(`${cfg.homeAssistantUrl}/api/services/${domain}/${service}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.homeAssistantToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entity_id: entityId, ...data }),
  });
  return res.ok;
}

export async function haListBatteryEntities(): Promise<
  Array<{ entity_id: string; state: string; friendly_name: string }>
> {
  const cfg = lifeEnv();
  if (!cfg.homeAssistantUrl || !cfg.homeAssistantToken) return [];
  const res = await fetch(`${cfg.homeAssistantUrl}/api/states`, {
    headers: { Authorization: `Bearer ${cfg.homeAssistantToken}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const states = (await res.json()) as Array<{
    entity_id: string;
    state: string;
    attributes?: { friendly_name?: string; device_class?: string; unit_of_measurement?: string };
  }>;
  return states
    .filter((s) => {
      const cls = s.attributes?.device_class;
      const unit = s.attributes?.unit_of_measurement;
      return cls === "battery" || unit === "%" || s.entity_id.includes("battery");
    })
    .slice(0, 24)
    .map((s) => ({
      entity_id: s.entity_id,
      state: s.state,
      friendly_name: s.attributes?.friendly_name ?? s.entity_id,
    }));
}
