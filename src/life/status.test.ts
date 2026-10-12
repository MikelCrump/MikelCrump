import { describe, expect, it } from "vitest";
import { getIntegrationStatus } from "@/life/status";

describe("integration status", () => {
  it("lists backends and marks which are key-driven", () => {
    const status = getIntegrationStatus();
    const byId = Object.fromEntries(status.map((s) => [s.id, s]));
    expect(byId.govee?.ready).toBe("live_ready");
    expect(byId.renpho?.ready).toBe("live_ready");
    expect(byId.calendar?.ready).toBe("live_ready");
    expect(byId.resideo?.ready).toBe("needs_bridge");
    expect(byId.ai_credits?.ready).toBe("manual_json");
    expect(byId.automations?.ready).toBe("built_in");
  });
});
