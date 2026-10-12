import { beforeEach, describe, expect, it } from "vitest";
import { resetAutomationsForTests } from "@/life/automations-store";
import { runControl } from "@/life/control";
import { getLifeOverview } from "@/life/overview";

describe("life overview", () => {
  beforeEach(() => {
    process.env.LIFE_FORCE_MOCK = "1";
    resetAutomationsForTests();
  });

  it("returns Mikel's board with all integration slices", async () => {
    const overview = await getLifeOverview();
    expect(overview.owner.name).toBe("Mikel Crump");
    expect(overview.tesla.model).toContain("Model");
    expect(overview.govee.devices.length).toBeGreaterThan(0);
    expect(overview.finance.accounts.length).toBeGreaterThan(0);
    expect(overview.renpho.history.length).toBeGreaterThan(5);
    expect(overview.aiCredits.accounts.length).toBeGreaterThanOrEqual(5);
    expect(overview.commute.suggestions.length).toBeGreaterThan(0);
    expect(overview.automations.length).toBeGreaterThan(0);
  });

  it("toggles govee power in mock mode", async () => {
    const overview = await getLifeOverview();
    const device = overview.govee.devices[0]!;
    const result = await runControl({
      target: "govee",
      action: "power",
      deviceId: device.id,
      value: !device.power,
    });
    expect(result.ok).toBe(true);
  });
});
