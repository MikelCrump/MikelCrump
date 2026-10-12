import { beforeEach, describe, expect, it } from "vitest";
import { controlTesla, getTesla } from "@/life/adapters/tesla";

describe("tesla adapter", () => {
  beforeEach(() => {
    process.env.LIFE_FORCE_MOCK = "1";
    delete process.env.TESLA_ACCESS_TOKEN;
    delete process.env.TESLA_REFRESH_TOKEN;
    delete process.env.TESLA_VEHICLE_ID;
    delete process.env.TESLA_VIN;
  });

  it("returns mock snapshot under force mock", async () => {
    const snap = await getTesla();
    expect(snap.mode).toBe("mock");
    expect(snap.batteryPercent).toBeGreaterThan(0);
  });

  it("queues mock commands", async () => {
    const result = await controlTesla("wake");
    expect(result.ok).toBe(true);
    expect(result.detail.toLowerCase()).toContain("mock");
  });
});
