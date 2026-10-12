import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isAtHome,
  metersBetween,
  runArriveHomeOpenChargePort,
} from "@/life/arrive-home-charge";

describe("arrive-home charge port", () => {
  beforeEach(() => {
    process.env.LIFE_FORCE_MOCK = "1";
    process.env.HOME_LAT = "33.4484";
    process.env.HOME_LON = "-112.0740";
    process.env.HOME_RADIUS_M = "150";
    process.env.LIFE_DATA_DIR = `/tmp/life-ops-test-${Date.now()}`;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("measures geofence distance", () => {
    expect(metersBetween(33.4484, -112.074, 33.4484, -112.074)).toBeLessThan(1);
    const near = isAtHome(33.4485, -112.0741);
    expect(near.ok).toBe(true);
    const far = isAtHome(33.5, -112.2);
    expect(far.ok).toBe(false);
  });

  it("opens charge port after iPhone arrive + parked", async () => {
    const result = await runArriveHomeOpenChargePort({
      event: "arrive_home",
      lat: 33.4484,
      lon: -112.074,
      force: true,
    });
    expect(result.ok).toBe(true);
    expect(result.detail.toLowerCase()).toMatch(/charge port|opened|parked/);
  });

  it("rejects when phone is outside home without arrive event", async () => {
    const result = await runArriveHomeOpenChargePort({
      lat: 34.0,
      lon: -111.0,
      force: true,
    });
    expect(result.ok).toBe(false);
    expect(result.detail.toLowerCase()).toContain("not at home");
  });
});
