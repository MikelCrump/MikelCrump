import { beforeEach, describe, expect, it, vi } from "vitest";
import { controlGovee, getGovee } from "@/life/adapters/govee";

describe("govee adapter", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    process.env.LIFE_FORCE_MOCK = "1";
    delete process.env.GOVEE_API_KEY;
  });

  it("returns mock devices when force mock", async () => {
    const snap = await getGovee();
    expect(snap.mode).toBe("mock");
    expect(snap.devices.length).toBeGreaterThan(0);
  });

  it("accepts mock power control", async () => {
    const snap = await getGovee();
    const id = snap.devices[0]!.id;
    const result = await controlGovee(id, "power", false);
    expect(result.ok).toBe(true);
  });
});
