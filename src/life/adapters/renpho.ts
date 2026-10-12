import { lifeEnv } from "@/life/config";
import { MOCK_RENPHO } from "@/life/mock-data";
import type { RenphoSnapshot } from "@/life/types";

export async function getRenpho(): Promise<RenphoSnapshot> {
  const cfg = lifeEnv();
  // Renpho has no stable public API; credentials flag readiness for a future scrape/bridge.
  if (cfg.forceMock || !cfg.renphoEmail || !cfg.renphoPassword) {
    return {
      ...MOCK_RENPHO,
      mode: cfg.renphoEmail ? "mock" : "unconfigured",
    };
  }
  return { ...MOCK_RENPHO, mode: "mock" };
}
