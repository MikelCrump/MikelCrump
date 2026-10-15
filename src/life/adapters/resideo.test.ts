import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { controlResideo, getResideo, mapClimateState } from "@/life/adapters/resideo";

const THERMOSTAT = "climate.living_room_thermostat_t6_pro_thermostat";

function mockHa(state: Record<string, unknown>) {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === "POST") return new Response("[]", { status: 200 });
    return new Response(JSON.stringify(state), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("mapClimateState", () => {
  it("reads the HVAC mode from the entity state, not an attribute", () => {
    const snap = mapClimateState({
      state: "heat",
      attributes: { friendly_name: "T6 Pro", temperature: 70, current_temperature: 68.5 },
    });
    expect(snap.mode).toBe("heat");
    expect(snap.power).toBe(true);
    expect(snap.targetF).toBe(70);
    expect(snap.currentF).toBe(68.5);
    expect(snap.connection).toBe("live");
  });

  it("maps off to power false", () => {
    const snap = mapClimateState({ state: "off", attributes: {} });
    expect(snap.power).toBe(false);
  });

  it("maps heat_cool and fan_only onto the Life Ops modes", () => {
    expect(mapClimateState({ state: "heat_cool", attributes: {} }).mode).toBe("auto");
    expect(mapClimateState({ state: "fan_only", attributes: {} }).mode).toBe("fan");
  });

  it("falls back to mock connection when the entity is unavailable", () => {
    const snap = mapClimateState({ state: "unavailable", attributes: {} });
    expect(snap.connection).toBe("mock");
    expect(snap.power).toBe(false);
  });

  it("tolerates missing fan modes and non-numeric temperatures", () => {
    const snap = mapClimateState({
      state: "cool",
      attributes: { temperature: null, current_temperature: "n/a" },
    });
    expect(snap.fan).toBe("auto");
    expect(Number.isFinite(snap.targetF)).toBe(true);
    expect(Number.isFinite(snap.currentF)).toBe(true);
  });
});

describe("resideo adapter (live Home Assistant)", () => {
  beforeEach(() => {
    process.env.LIFE_FORCE_MOCK = "0";
    process.env.HOME_ASSISTANT_URL = "http://ha.test:8123";
    process.env.HOME_ASSISTANT_TOKEN = "test-token";
    process.env.RESIDEO_ENTITY_ID = THERMOSTAT;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.HOME_ASSISTANT_URL;
    delete process.env.HOME_ASSISTANT_TOKEN;
    delete process.env.RESIDEO_ENTITY_ID;
    process.env.LIFE_FORCE_MOCK = "1";
  });

  it("returns live state from Home Assistant", async () => {
    mockHa({ state: "cool", attributes: { temperature: 66, current_temperature: 66 } });
    const snap = await getResideo();
    expect(snap.connection).toBe("live");
    expect(snap.mode).toBe("cool");
    expect(snap.targetF).toBe(66);
  });

  it("sends set_hvac_mode for a mode change", async () => {
    const fetchMock = mockHa({ state: "cool", attributes: {} });
    const result = await controlResideo("mode", "heat");
    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://ha.test:8123/api/services/climate/set_hvac_mode");
    expect(JSON.parse(String(init?.body))).toEqual({ entity_id: THERMOSTAT, hvac_mode: "heat" });
  });

  it("rejects an unknown mode without calling Home Assistant", async () => {
    const fetchMock = mockHa({ state: "cool", attributes: {} });
    const result = await controlResideo("mode", "turbo");
    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports failure for unsupported actions instead of claiming success", async () => {
    mockHa({ state: "cool", attributes: {} });
    const result = await controlResideo("explode");
    expect(result.ok).toBe(false);
  });
});

describe("resideo adapter (mock)", () => {
  beforeEach(() => {
    process.env.LIFE_FORCE_MOCK = "1";
    delete process.env.HOME_ASSISTANT_URL;
    delete process.env.RESIDEO_ENTITY_ID;
  });

  it("accepts mock temperature control", async () => {
    const result = await controlResideo("temp", 72);
    expect(result.ok).toBe(true);
    const snap = await getResideo();
    expect(snap.targetF).toBe(72);
  });
});
