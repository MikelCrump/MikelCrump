import { lifeEnv } from "@/life/config";
import { MOCK_TESLA } from "@/life/mock-data";
import {
  actionForControl,
  hasTeslaPrivateKey,
  sendSignedVehicleAction,
} from "@/life/tesla-command/signed";
import {
  loadTeslaTokens,
  saveTeslaTokens,
  type TeslaStoredTokens,
} from "@/life/tesla-tokens";
import type { TeslaSnapshot } from "@/life/types";

const DEFAULT_FLEET = "https://fleet-api.prd.na.vn.cloud.tesla.com";
const AUTH_BASE = "https://fleet-auth.prd.vn.cloud.tesla.com";

type VehicleListItem = {
  id?: number | string;
  vehicle_id?: number | string;
  vin?: string;
  display_name?: string;
  state?: string;
};

let memoryAccess: string | null = null;
let memoryRefresh: string | null = null;
let lastError: string | null = null;
let lastPayload: TeslaStoredTokens | null = null;

function fleetBase() {
  return lifeEnv().teslaFleetBase ?? DEFAULT_FLEET;
}

function vehiclePathId() {
  const cfg = lifeEnv();
  return cfg.teslaVin ?? cfg.teslaVehicleId ?? null;
}

export async function persistTeslaTokens(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}) {
  const payload = await saveTeslaTokens(tokens);
  memoryAccess = payload.access_token;
  memoryRefresh = payload.refresh_token ?? memoryRefresh;
  lastPayload = payload;
  return payload;
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
  await persistTeslaTokens(json);
  return json.access_token;
}

async function resolveAccessToken() {
  const cfg = lifeEnv();
  if (memoryAccess) return memoryAccess;

  const stored = (await loadTeslaTokens()) ?? lastPayload;
  if (stored?.access_token) {
    lastPayload = stored;
    const stillFresh =
      !stored.expires_at || stored.expires_at > Date.now() + 60_000;
    if (stillFresh) {
      memoryAccess = stored.access_token;
      memoryRefresh = stored.refresh_token ?? memoryRefresh;
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

  const refresh = cfg.teslaRefreshToken ?? stored?.refresh_token ?? memoryRefresh;
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
    const stored = await loadTeslaTokens();
    const refresh = cfg.teslaRefreshToken ?? stored?.refresh_token ?? memoryRefresh;
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

async function sendSignedCommand(action: string, vin: string) {
  const cfg = lifeEnv();
  const vehicleAction = actionForControl(action);
  if (!vehicleAction) return false;
  if (!hasTeslaPrivateKey(cfg.teslaPrivateKeyPem)) {
    throw new Error(
      "TESLA_PRIVATE_KEY_PEM missing — cannot sign Vehicle Command Protocol",
    );
  }
  const token = await resolveAccessToken();
  if (!token) throw new Error("Tesla token missing");
  await sendSignedVehicleAction({
    fleetBase: fleetBase(),
    accessToken: token,
    vin,
    privateKeyPem: cfg.teslaPrivateKeyPem!,
    action: vehicleAction,
  });
  return true;
}

async function sendCommand(pathId: string, path: string, action: string) {
  const cfg = lifeEnv();
  const token = await resolveAccessToken();
  if (!token) throw new Error("Tesla token missing");

  // Prefer in-app signed commands (required for modern cars / climate start).
  if (actionForControl(action)) {
    try {
      await sendSignedCommand(action, pathId);
      return;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "signed failed";
      // Fall through to proxy/fleet only if signing infra isn't set up.
      if (!hasTeslaPrivateKey(cfg.teslaPrivateKeyPem)) {
        /* continue */
      } else if (/pair virtual key|key_not_paired|not paired/i.test(detail)) {
        throw new Error(
          `${detail}. Pair the virtual key first: https://tesla.com/_ak/${cfg.teslaPartnerDomain ?? "mikelcrump.com"}`,
        );
      } else {
        // Still try proxy as secondary path
        lastError = detail;
      }
    }
  }

  const bases = [
    cfg.teslaCommandProxyUrl?.replace(/\/$/, ""),
    fleetBase(),
  ].filter(Boolean) as string[];

  let lastFail = lastError ?? "Command failed";
  for (const base of bases) {
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
    if (/Vehicle Command Protocol required/i.test(text)) {
      lastFail = `Needs signed commands. Pair virtual key at https://tesla.com/_ak/${cfg.teslaPartnerDomain ?? "mikelcrump.com"} then retry. (${lastFail})`;
    }
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

    await sendCommand(pathId, path, action);
    return { ok: true, detail: `Tesla ${action} sent` };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Tesla command failed",
    };
  }
}

const FLEET_REGIONS = [
  "https://fleet-api.prd.na.vn.cloud.tesla.com",
  "https://fleet-api.prd.eu.vn.cloud.tesla.com",
];

async function partnerAccessToken(audience: string) {
  const cfg = lifeEnv();
  if (!cfg.teslaClientId || !cfg.teslaClientSecret) {
    throw new Error("TESLA_CLIENT_ID and TESLA_CLIENT_SECRET required");
  }
  const res = await fetch(`${AUTH_BASE}/oauth2/v3/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: cfg.teslaClientId,
      client_secret: cfg.teslaClientSecret,
      audience,
      scope: "openid vehicle_device_data vehicle_cmds vehicle_charging_cmds offline_access",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Partner token ${res.status}: ${text.slice(0, 180)}`);
  }
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

/** Register Fleet API partner account for the app domain (fixes HTTP 412). */
export async function registerTeslaPartner(domains?: string[]) {
  const cfg = lifeEnv();
  const domain = cfg.teslaPartnerDomain ?? "mikelcrump.com";
  const bases = domains?.length ? domains : [fleetBase(), ...FLEET_REGIONS];
  const unique = [...new Set(bases)];
  const results: Array<{ region: string; ok: boolean; detail: string }> = [];

  for (const base of unique) {
    try {
      const token = await partnerAccessToken(base);
      const res = await fetch(`${base}/api/1/partner_accounts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ domain }),
      });
      const text = await res.text();
      results.push({
        region: base,
        ok: res.ok,
        detail: text.slice(0, 240) || `HTTP ${res.status}`,
      });
    } catch (error) {
      results.push({
        region: base,
        ok: false,
        detail: error instanceof Error ? error.message : "register failed",
      });
    }
  }
  return { domain, results };
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
  const payload = await persistTeslaTokens(json);

  // 412 means partner account not registered for the Fleet region yet.
  let registration: Awaited<ReturnType<typeof registerTeslaPartner>> | null = null;
  try {
    registration = await registerTeslaPartner();
  } catch {
    registration = null;
  }

  let vehicles: Array<{
    vin?: string;
    id?: number | string;
    name?: string;
    state?: string;
  }> = [];
  let vehiclesError: string | null = null;
  try {
    const listed = await listTeslaVehicles();
    vehicles = listed.map((v) => ({
      vin: v.vin,
      id: v.id,
      name: v.display_name,
      state: v.state,
    }));
  } catch (error) {
    vehiclesError =
      error instanceof Error ? error.message : "Tesla vehicles list failed";
    // Tokens are already saved — don't fail the whole OAuth callback on 412.
  }

  return {
    vehicles,
    vehiclesError,
    registration,
    saved: true,
    tokens: payload,
  };
}

export async function getTeslaDiagnostics() {
  const cfg = lifeEnv();
  const stored = await loadTeslaTokens();
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
