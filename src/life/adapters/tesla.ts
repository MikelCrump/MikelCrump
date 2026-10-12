import { lifeEnv } from "@/life/config";
import { MOCK_TESLA } from "@/life/mock-data";
import { readJsonFile, writeJsonFile } from "@/life/token-store";
import type { TeslaSnapshot } from "@/life/types";

const DEFAULT_FLEET = "https://fleet-api.prd.na.vn.cloud.tesla.com";
const AUTH_BASE = "https://fleet-auth.prd.vn.cloud.tesla.com";
const TOKEN_FILE = "tesla-tokens.json";

type StoredTokens = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  updated_at: string;
};

type VehicleListItem = {
  id?: number | string;
  vehicle_id?: number | string;
  vin?: string;
  display_name?: string;
  state?: string;
};

let memoryAccess: string | null = null;
let lastError: string | null = null;

function fleetBase() {
  return lifeEnv().teslaFleetBase ?? DEFAULT_FLEET;
}

function vehiclePathId() {
  const cfg = lifeEnv();
  return cfg.teslaVin ?? cfg.teslaVehicleId ?? null;
}

function loadStoredTokens(): StoredTokens | null {
  return readJsonFile<StoredTokens>(TOKEN_FILE);
}

export function saveTeslaTokens(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}) {
  const payload: StoredTokens = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? loadStoredTokens()?.refresh_token,
    expires_at: tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : undefined,
    updated_at: new Date().toISOString(),
  };
  writeJsonFile(TOKEN_FILE, payload);
  memoryAccess = payload.access_token;
}

async function refreshAccessToken(refreshToken: string, clientId: string) {
  const cfg = lifeEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });
  if (cfg.teslaClientSecret) {
    body.set("client_secret", cfg.teslaClientSecret);
  }
  const res = await fetch(`${AUTH_BASE}/oauth2/v3/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tesla refresh ${res.status}: ${text.slice(0, 180)}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  saveTeslaTokens(json);
  return json.access_token;
}

async function resolveAccessToken() {
  const cfg = lifeEnv();
  if (memoryAccess) return memoryAccess;

  const stored = loadStoredTokens();
  if (stored?.access_token) {
    const stillFresh =
      !stored.expires_at || stored.expires_at > Date.now() + 60_000;
    if (stillFresh) {
      memoryAccess = stored.access_token;
      return memoryAccess;
    }
    if (stored.refresh_token && cfg.teslaClientId) {
      return refreshAccessToken(stored.refresh_token, cfg.teslaClientId);
    }
    memoryAccess = stored.access_token;
    return memoryAccess;
  }

  if (cfg.teslaAccessToken) {
    memoryAccess = cfg.teslaAccessToken;
    return memoryAccess;
  }

  const refresh = cfg.teslaRefreshToken ?? stored?.refresh_token;
  if (refresh && cfg.teslaClientId) {
    return refreshAccessToken(refresh, cfg.teslaClientId);
  }
  return null;
}

async function teslaFetch(path: string, init: RequestInit = {}) {
  const token = await resolveAccessToken();
  if (!token) throw new Error("Tesla token missing");
  const res = await fetch(`${fleetBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (res.status === 401) {
    memoryAccess = null;
    const cfg = lifeEnv();
    const stored = loadStoredTokens();
    const refresh = cfg.teslaRefreshToken ?? stored?.refresh_token;
    if (refresh && cfg.teslaClientId) {
      await refreshAccessToken(refresh, cfg.teslaClientId);
      return teslaFetch(path, init);
    }
  }
  return res;
}

export async function listTeslaVehicles() {
  const res = await teslaFetch("/api/1/vehicles");
  if (!res.ok) throw new Error(`Tesla vehicles ${res.status}`);
  const json = (await res.json()) as { response?: VehicleListItem[] };
  return json.response ?? [];
}

async function getVehicleSummary(id: string) {
  const res = await teslaFetch(`/api/1/vehicles/${id}`);
  if (!res.ok) throw new Error(`Tesla vehicle ${res.status}`);
  const json = (await res.json()) as { response?: VehicleListItem };
  return json.response ?? null;
}

async function wakeVehicle(id: string) {
  const res = await teslaFetch(`/api/1/vehicles/${id}/wake_up`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wake failed ${res.status}: ${text.slice(0, 160)}`);
  }
}

async function waitUntilOnline(id: string, attempts = 8) {
  for (let i = 0; i < attempts; i += 1) {
    const summary = await getVehicleSummary(id);
    if (summary?.state === "online") return true;
    if (i === 0 || summary?.state === "asleep" || summary?.state === "offline") {
      await wakeVehicle(id);
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  const finalState = await getVehicleSummary(id);
  return finalState?.state === "online";
}

function mapVehicleData(r: {
  display_name?: string;
  vehicle_config?: { car_type?: string };
  vehicle_state?: { locked?: boolean };
  charge_state?: {
    battery_level?: number;
    battery_range?: number;
    charging_state?: string;
    charge_rate?: number;
  };
  climate_state?: { is_climate_on?: boolean; inside_temp?: number };
  drive_state?: { latitude?: number; longitude?: number };
  state?: string;
}): TeslaSnapshot {
  const charging = (r.charge_state?.charging_state ?? "").toLowerCase() === "charging";
  const insideC = r.climate_state?.inside_temp;
  const lat = r.drive_state?.latitude;
  const lon = r.drive_state?.longitude;
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
    locationLabel:
      lat != null && lon != null
        ? `${lat.toFixed(3)}, ${lon.toFixed(3)}`
        : MOCK_TESLA.locationLabel,
    state:
      r.state === "online" || r.state === "asleep" || r.state === "offline"
        ? r.state
        : "unknown",
    mode: "live",
    lastError: null,
  };
}

export async function getTesla(): Promise<TeslaSnapshot> {
  const cfg = lifeEnv();
  lastError = null;
  const id = vehiclePathId();

  if (cfg.forceMock) {
    return { ...MOCK_TESLA, mode: "mock", lastError: "LIFE_FORCE_MOCK=1" };
  }

  try {
    const token = await resolveAccessToken();
    if (!token) {
      return { ...MOCK_TESLA, mode: "unconfigured", lastError: "No Tesla token" };
    }

    let pathId = id;
    if (!pathId) {
      const vehicles = await listTeslaVehicles();
      pathId = vehicles[0]?.vin ?? String(vehicles[0]?.id ?? "");
      if (!pathId) {
        return {
          ...MOCK_TESLA,
          mode: "unconfigured",
          lastError: "No vehicles on Tesla account",
        };
      }
    }

    const summary = await getVehicleSummary(pathId);
    const state = summary?.state ?? "unknown";

    if (state !== "online") {
      // Cheap read path: don't force wake on every board refresh
      return {
        ...MOCK_TESLA,
        name: summary?.display_name ?? MOCK_TESLA.name,
        state:
          state === "asleep" || state === "offline" || state === "online"
            ? state
            : "unknown",
        mode: "live",
        lastError: null,
      };
    }

    const endpoints = [
      "charge_state",
      "climate_state",
      "vehicle_state",
      "vehicle_config",
      "drive_state",
    ].join(";");
    const res = await teslaFetch(
      `/api/1/vehicles/${pathId}/vehicle_data?endpoints=${encodeURIComponent(endpoints)}`,
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`vehicle_data ${res.status}: ${text.slice(0, 160)}`);
    }
    const json = (await res.json()) as {
      response: Parameters<typeof mapVehicleData>[0] & { state?: string };
    };
    return mapVehicleData({ ...json.response, state: "online" });
  } catch (error) {
    lastError = error instanceof Error ? error.message : "Tesla read failed";
    return { ...MOCK_TESLA, mode: "mock", lastError };
  }
}

async function sendCommand(pathId: string, path: string) {
  const cfg = lifeEnv();
  const bases = [
    cfg.teslaCommandProxyUrl?.replace(/\/$/, ""),
    fleetBase(),
  ].filter(Boolean) as string[];

  let lastFail = "Command failed";
  for (const base of bases) {
    const token = await resolveAccessToken();
    if (!token) throw new Error("Tesla token missing");
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.ok) return;
    const text = await res.text();
    lastFail = `${base.includes("127.0.0.1") || base.includes("localhost") ? "proxy" : "fleet"} ${res.status}: ${text.slice(0, 160)}`;
    // If unsigned command rejected, try next base (proxy)
  }
  throw new Error(lastFail);
}

export async function controlTesla(
  action: string,
): Promise<{ ok: boolean; detail: string }> {
  const cfg = lifeEnv();
  if (cfg.forceMock) {
    return { ok: true, detail: `Mock Tesla action queued: ${action}` };
  }

  try {
    let pathId = vehiclePathId();
    if (!pathId) {
      const vehicles = await listTeslaVehicles();
      pathId = vehicles[0]?.vin ?? String(vehicles[0]?.id ?? "");
    }
    if (!pathId) return { ok: false, detail: "No Tesla vehicle id/VIN configured" };

    const pathByAction: Record<string, string> = {
      wake: `/api/1/vehicles/${pathId}/wake_up`,
      climate_on: `/api/1/vehicles/${pathId}/command/auto_conditioning_start`,
      climate_off: `/api/1/vehicles/${pathId}/command/auto_conditioning_stop`,
      charge_start: `/api/1/vehicles/${pathId}/command/charge_start`,
      charge_stop: `/api/1/vehicles/${pathId}/command/charge_stop`,
      lock: `/api/1/vehicles/${pathId}/command/door_lock`,
      unlock: `/api/1/vehicles/${pathId}/command/door_unlock`,
    };
    const path = pathByAction[action];
    if (!path) return { ok: false, detail: `Unknown Tesla action: ${action}` };

    if (action === "wake") {
      await wakeVehicle(pathId);
      const online = await waitUntilOnline(pathId, 6);
      return {
        ok: true,
        detail: online ? "Tesla is online" : "Wake sent — still coming online",
      };
    }

    const online = await waitUntilOnline(pathId, 8);
    if (!online) {
      return {
        ok: false,
        detail: "Vehicle did not come online after wake — try again in a minute",
      };
    }

    await sendCommand(pathId, path);
    return { ok: true, detail: `Tesla ${action} sent` };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Tesla command failed",
    };
  }
}

export function getTeslaAuthUrl(origin: string) {
  const cfg = lifeEnv();
  if (!cfg.teslaClientId) {
    throw new Error("TESLA_CLIENT_ID required");
  }
  const redirect =
    cfg.teslaRedirectUri ?? `${origin.replace(/\/$/, "")}/api/life/tesla/callback`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: cfg.teslaClientId,
    redirect_uri: redirect,
    scope:
      "openid offline_access user_data vehicle_device_data vehicle_cmds vehicle_charging_cmds vehicle_location",
    state: crypto.randomUUID(),
  });
  return {
    url: `https://auth.tesla.com/oauth2/v3/authorize?${params}`,
    redirect_uri: redirect,
  };
}

export async function exchangeTeslaAuthCode(code: string, origin: string) {
  const cfg = lifeEnv();
  if (!cfg.teslaClientId || !cfg.teslaClientSecret) {
    throw new Error("TESLA_CLIENT_ID and TESLA_CLIENT_SECRET required");
  }
  const redirect =
    cfg.teslaRedirectUri ?? `${origin.replace(/\/$/, "")}/api/life/tesla/callback`;
  const res = await fetch(`${AUTH_BASE}/oauth2/v3/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: cfg.teslaClientId,
      client_secret: cfg.teslaClientSecret,
      code,
      audience: fleetBase(),
      redirect_uri: redirect,
      scope:
        "openid offline_access user_data vehicle_device_data vehicle_cmds vehicle_charging_cmds vehicle_location",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tesla token exchange ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  saveTeslaTokens(json);
  const vehicles = await listTeslaVehicles();
  return {
    vehicles: vehicles.map((v) => ({
      vin: v.vin,
      id: v.id,
      name: v.display_name,
      state: v.state,
    })),
    saved: true,
  };
}

export function getTeslaDiagnostics() {
  const cfg = lifeEnv();
  const stored = loadStoredTokens();
  return {
    configured: Boolean(
      cfg.teslaAccessToken ||
        cfg.teslaRefreshToken ||
        stored?.access_token ||
        stored?.refresh_token,
    ),
    hasClientId: Boolean(cfg.teslaClientId),
    hasClientSecret: Boolean(cfg.teslaClientSecret),
    vehicleId: vehiclePathId(),
    commandProxy: Boolean(cfg.teslaCommandProxyUrl),
    fleetBase: fleetBase(),
    tokenFile: Boolean(stored),
    forceMock: cfg.forceMock,
    lastError,
  };
}
