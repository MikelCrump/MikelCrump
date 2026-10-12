import { lifeEnv } from "@/life/config";
import { MOCK_TESLA } from "@/life/mock-data";
import type { TeslaSnapshot } from "@/life/types";

const FLEET_BASE = "https://fleet-api.prd.na.vn.cloud.tesla.com";

export async function getTesla(): Promise<TeslaSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.teslaAccessToken || !cfg.teslaVehicleId) {
    return {
      ...MOCK_TESLA,
      mode: cfg.teslaAccessToken ? "mock" : "unconfigured",
    };
  }

  try {
    const res = await fetch(
      `${FLEET_BASE}/api/1/vehicles/${cfg.teslaVehicleId}/vehicle_data`,
      {
        headers: { Authorization: `Bearer ${cfg.teslaAccessToken}` },
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error(`Tesla ${res.status}`);
    const json = (await res.json()) as {
      response: {
        display_name?: string;
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
      model: MOCK_TESLA.model,
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
  if (cfg.forceMock || !cfg.teslaAccessToken || !cfg.teslaVehicleId) {
    return { ok: true, detail: `Mock Tesla action queued: ${action}` };
  }

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

  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.teslaAccessToken}` },
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
