import { haListBatteryEntities } from "@/life/adapters/home-assistant";
import { lifeEnv } from "@/life/config";
import { MOCK_BATTERIES } from "@/life/mock-data";
import type { BatteriesSnapshot } from "@/life/types";

export async function getBatteries(): Promise<BatteriesSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.homeAssistantUrl || !cfg.homeAssistantToken) {
    return {
      ...MOCK_BATTERIES,
      mode: cfg.homeAssistantUrl ? "mock" : "unconfigured",
    };
  }

  try {
    const entities = await haListBatteryEntities();
    if (!entities.length) return { ...MOCK_BATTERIES, mode: "mock" };
    return {
      mode: "live",
      devices: entities.map((e) => {
        const percent = Number.parseFloat(e.state);
        const safe = Number.isFinite(percent) ? percent : 0;
        return {
          id: e.entity_id,
          name: e.friendly_name,
          kind: "sensor",
          percent: safe,
          charging: false,
          low: safe < 20,
        };
      }),
    };
  } catch {
    return { ...MOCK_BATTERIES, mode: "mock" };
  }
}
