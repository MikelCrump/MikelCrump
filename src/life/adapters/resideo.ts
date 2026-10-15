import { haCallService, haGetState } from "@/life/adapters/home-assistant";
import { lifeEnv } from "@/life/config";
import { MOCK_RESIDEO } from "@/life/mock-data";
import type { ResideoSnapshot } from "@/life/types";

let mock = { ...MOCK_RESIDEO };

const HA_TO_MODE: Record<string, ResideoSnapshot["mode"]> = {
  cool: "cool",
  heat: "heat",
  heat_cool: "auto",
  auto: "auto",
  dry: "dry",
  fan_only: "fan",
};

const MODE_TO_HA: Record<string, string> = {
  cool: "cool",
  heat: "heat",
  auto: "heat_cool",
  dry: "dry",
  fan: "fan_only",
  off: "off",
};

function mapFan(raw: unknown): ResideoSnapshot["fan"] {
  const v = String(raw ?? "auto").toLowerCase();
  if (v === "low" || v === "med" || v === "high") return v;
  if (v === "medium") return "med";
  return "auto";
}

function toNumber(raw: unknown, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Map a Home Assistant `climate.*` state object onto the Life Ops snapshot.
 * In HA the HVAC mode is the entity *state* ("cool", "heat", "off", ...), not an attribute.
 */
export function mapClimateState(
  state: Record<string, unknown>,
  fallback: ResideoSnapshot = mock,
): ResideoSnapshot {
  const attrs = (state.attributes ?? {}) as Record<string, unknown>;
  const haState = String(state.state ?? "off");
  const unavailable = haState === "unavailable" || haState === "unknown";
  return {
    name: String(attrs.friendly_name ?? fallback.name),
    power: !unavailable && haState !== "off",
    mode: HA_TO_MODE[haState] ?? fallback.mode,
    targetF: toNumber(attrs.temperature, fallback.targetF),
    currentF: toNumber(attrs.current_temperature, fallback.currentF),
    fan: mapFan(attrs.fan_mode),
    connection: unavailable ? "mock" : "live",
  };
}

export async function getResideo(): Promise<ResideoSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.homeAssistantUrl || !cfg.resideoEntityId) {
    return {
      ...mock,
      connection: cfg.homeAssistantUrl && cfg.resideoEntityId ? "mock" : "unconfigured",
    };
  }

  try {
    const state = await haGetState(cfg.resideoEntityId);
    if (!state) throw new Error("missing state");
    return mapClimateState(state);
  } catch {
    return { ...mock, connection: "mock" };
  }
}

export async function controlResideo(
  action: string,
  value?: string | number | boolean,
): Promise<{ ok: boolean; detail: string }> {
  const cfg = lifeEnv();
  const live = !cfg.forceMock && Boolean(cfg.homeAssistantUrl && cfg.resideoEntityId);

  if (!live) {
    if (action === "power") {
      mock = { ...mock, power: Boolean(value) };
    } else if (action === "temp" && typeof value === "number") {
      mock = { ...mock, targetF: value, power: true };
    } else if (action === "mode" && typeof value === "string") {
      mock = {
        ...mock,
        mode: value as ResideoSnapshot["mode"],
        power: value !== "off",
      };
    } else if (action === "fan" && typeof value === "string") {
      mock = { ...mock, fan: mapFan(value) };
    }
    return { ok: true, detail: `Mock Resideo ${action}` };
  }

  const entityId = cfg.resideoEntityId as string;

  if (action === "power") {
    const ok = await haCallService("climate", value ? "turn_on" : "turn_off", entityId);
    return { ok, detail: ok ? "Thermostat power updated" : "HA climate call failed" };
  }
  if (action === "temp" && typeof value === "number") {
    const ok = await haCallService("climate", "set_temperature", entityId, {
      temperature: value,
    });
    return { ok, detail: ok ? `Thermostat set to ${value}°F` : "HA set_temperature failed" };
  }
  if (action === "mode" && typeof value === "string") {
    const hvacMode = MODE_TO_HA[value];
    if (!hvacMode) return { ok: false, detail: `Unknown mode "${value}"` };
    const ok = await haCallService("climate", "set_hvac_mode", entityId, {
      hvac_mode: hvacMode,
    });
    return { ok, detail: ok ? `Thermostat mode → ${value}` : "HA set_hvac_mode failed" };
  }
  if (action === "fan" && typeof value === "string") {
    const ok = await haCallService("climate", "set_fan_mode", entityId, { fan_mode: value });
    return { ok, detail: ok ? `Thermostat fan → ${value}` : "HA set_fan_mode failed" };
  }
  return { ok: false, detail: `Unsupported thermostat action "${action}"` };
}
