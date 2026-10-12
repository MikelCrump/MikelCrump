import { haCallService, haGetState } from "@/life/adapters/home-assistant";
import { lifeEnv } from "@/life/config";
import { MOCK_RIDEO } from "@/life/mock-data";
import type { RideoSnapshot } from "@/life/types";

let mock = { ...MOCK_RIDEO };

export async function getRideo(): Promise<RideoSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.homeAssistantUrl || !cfg.rideoEntityId) {
    return {
      ...mock,
      connection: cfg.homeAssistantUrl && cfg.rideoEntityId ? "mock" : "unconfigured",
    };
  }

  try {
    const state = await haGetState(cfg.rideoEntityId);
    if (!state) throw new Error("missing state");
    const attrs = (state.attributes ?? {}) as Record<string, unknown>;
    const haMode = String(attrs.hvac_mode ?? attrs.mode ?? mock.mode);
    return {
      name: String(attrs.friendly_name ?? mock.name),
      power: state.state !== "off",
      mode: (["cool", "heat", "fan", "dry", "auto"].includes(haMode)
        ? haMode
        : "cool") as RideoSnapshot["mode"],
      targetF: Number(attrs.temperature ?? mock.targetF),
      currentF: Number(attrs.current_temperature ?? mock.currentF),
      fan: (String(attrs.fan_mode ?? "auto").toLowerCase() as RideoSnapshot["fan"]) || "auto",
      connection: "live",
    };
  } catch {
    return { ...mock, connection: "mock" };
  }
}

export async function controlRideo(
  action: string,
  value?: string | number | boolean,
): Promise<{ ok: boolean; detail: string }> {
  const cfg = lifeEnv();

  if (action === "power") {
    mock = { ...mock, power: Boolean(value) };
  } else if (action === "temp" && typeof value === "number") {
    mock = { ...mock, targetF: value, power: true };
  } else if (action === "mode" && typeof value === "string") {
    mock = {
      ...mock,
      mode: value as RideoSnapshot["mode"],
      power: value !== "off",
    };
  }

  if (cfg.forceMock || !cfg.rideoEntityId) {
    return { ok: true, detail: `Mock Rideo ${action}` };
  }

  if (action === "power") {
    const ok = await haCallService(
      "climate",
      value ? "turn_on" : "turn_off",
      cfg.rideoEntityId,
    );
    return { ok, detail: ok ? "Rideo power updated" : "HA climate call failed" };
  }
  if (action === "temp" && typeof value === "number") {
    const ok = await haCallService("climate", "set_temperature", cfg.rideoEntityId, {
      temperature: value,
    });
    return { ok, detail: ok ? `Rideo set to ${value}°F` : "HA set_temperature failed" };
  }
  return { ok: true, detail: `Rideo ${action} acknowledged` };
}
