import { lifeEnv } from "@/life/config";
import { MOCK_TESLA } from "@/life/mock-data";
import type { TeslaSnapshot } from "@/life/types";

const FLEET_BASE = "https://fleet-api.prd.na.vn.cloud.tesla.com";
const AUTH_BASE = "https://fleet-auth.prd.vn.cloud.tesla.com";

let cachedAccessToken: string | null = null;

async function resolveAccessToken() {
  const cfg = lifeEnv();
  if (cachedAccessToken) return cachedAccessToken;
  if (cfg.teslaAccessToken) {
    cachedAccessToken = cfg.teslaAccessToken;
    return cachedAccessToken;
  }
  if (cfg.teslaRefreshToken && cfg.teslaClientId) {
    const res = await fetch(`${AUTH_BASE}/oauth2/v3/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: cfg.teslaClientId,
        refresh_token: cfg.teslaRefreshToken,
      }),
    });
    if (!res.ok) throw new Error(`Tesla refresh ${res.status}`);
    const json = (await res.json()) as { access_token: string };
    cachedAccessToken = json.access_token;
    return cachedAccessToken;
  }
  return null;
}

export async function getTesla(): Promise<TeslaSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.teslaVehicleId) {
    return {
      ...MOCK_TESLA,
      mode:
        cfg.teslaAccessToken || cfg.teslaRefreshToken ? "mock" : "unconfigured",
    };
  }

  try {
    const token = await resolveAccessToken();
    if (!token) {
      return { ...MOCK_TESLA, mode: "unconfigured" };
    }

    const res = await fetch(
      `${FLEET_BASE}/api/1/vehicles/${cfg.teslaVehicleId}/vehicle_data`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      if (res.status === 401) cachedAccessToken = null;
      throw new Error(`Tesla ${res.status}`);
    }
    const json = (await res.json()) as {
      response: {
        display_name?: string;
        vehicle_config?: { car_type?: string };
        vehicle_state?: { locked?: boolean };
        charge_state?: {
          battery_level?: number;
          battery_range?: number;
          charging_state?: string;
          charge_rate?: number;
        };
        climate_state?: {
          is_climate_on?: boolean;
          inside_temp?: number;
        };
        state?: string;
      };
    };
    const r = json.response;
    const charging = (r.charge_state?.charging_state ?? "").toLowerCase() === "charging";
    const insideC = r.climate_state?.inside_temp;
    return {
      name: r.display_name ?? MOCK_TESLA.name,
      model: r.vehicle_config?.car_type
        ? r.vehicle_config.car_type.replace(/_/g, " ")
        : MOCK_TESLA.model,
      batteryPercent: r.charge_state?.battery_level ?? MOCK_TESLA.batteryPercent,
      rangeMiles: Math.round(r.charge_state?.battery_range ?? MOCK_TESLA.rangeMiles),
      charging,
      chargeRateMph: charging ? (r.charge_state?.charge_rate ?? null) : null,
      climateOn: Boolean(r.climate_state?.is_climate_on),
      insideTempF:
        insideC == null ? MOCK_TESLA.insideTempF : Math.round((insideC * 9) / 5 + 32),
      locked: Boolean(r.vehicle_state?.locked),
      locationLabel: MOCK_TESLA.locationLabel,
      state:
        r.state === "online" || r.state === "asleep" || r.state === "offline"
          ? r.state
          : "unknown",
      mode: "live",
    };
  } catch {
    return { ...MOCK_TESLA, mode: "mock" };
  }
}

export async function controlTesla(action: string): Promise<{ ok: boolean; detail: string }> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.teslaVehicleId) {
    return { ok: true, detail: `Mock Tesla action queued: ${action}` };
  }

  try {
    const token = await resolveAccessToken();
    if (!token) return { ok: false, detail: "Tesla token missing" };

    const base = cfg.teslaCommandProxyUrl ?? FLEET_BASE;
    const pathByAction: Record<string, string> = {
      wake: `/api/1/vehicles/${cfg.teslaVehicleId}/wake_up`,
      climate_on: `/api/1/vehicles/${cfg.teslaVehicleId}/command/auto_conditioning_start`,
      climate_off: `/api/1/vehicles/${cfg.teslaVehicleId}/command/auto_conditioning_stop`,
      charge_start: `/api/1/vehicles/${cfg.teslaVehicleId}/command/charge_start`,
      charge_stop: `/api/1/vehicles/${cfg.teslaVehicleId}/command/charge_stop`,
      lock: `/api/1/vehicles/${cfg.teslaVehicleId}/command/door_lock`,
      unlock: `/api/1/vehicles/${cfg.teslaVehicleId}/command/door_unlock`,
    };
    const path = pathByAction[action];
    if (!path) return { ok: false, detail: `Unknown Tesla action: ${action}` };

    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Tesla command ${res.status}`);
    return { ok: true, detail: `Tesla ${action} sent` };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Tesla command failed",
    };
  }
}
