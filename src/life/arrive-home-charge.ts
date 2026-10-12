import { controlTesla, getTeslaParkState } from "@/life/adapters/tesla";
import { lifeEnv } from "@/life/config";
import { readJsonFile, writeJsonFile } from "@/life/token-store";

export const ARRIVE_HOME_CHARGE_AUTOMATION_ID = "auto-arrive-charge-port";

const STATE_FILE = "arrive-home-charge.json";
const COOLDOWN_MS = 30 * 60 * 1000;
const PARKED_REQUIRED_MS = 10_000;
const MAX_WAIT_MS = 50_000;
const POLL_MS = 2_000;

type ArrivalState = {
  lastOpenedAt?: number;
  lastArrivalAt?: number;
  lastDetail?: string;
};

function loadState(): ArrivalState {
  return readJsonFile<ArrivalState>(STATE_FILE) ?? {};
}

function saveState(state: ArrivalState) {
  try {
    writeJsonFile(STATE_FILE, state);
  } catch {
    /* ignore on read-only fs */
  }
}

export function metersBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

export function isAtHome(lat: number, lon: number) {
  const cfg = lifeEnv();
  const homeLat = Number(cfg.homeLat);
  const homeLon = Number(cfg.homeLon);
  if (!Number.isFinite(homeLat) || !Number.isFinite(homeLon)) {
    return { ok: false as const, detail: "HOME_LAT / HOME_LON (or WEATHER_LAT/LON) not set" };
  }
  const meters = metersBetween(lat, lon, homeLat, homeLon);
  return {
    ok: meters <= cfg.homeRadiusM,
    meters,
    radiusM: cfg.homeRadiusM,
    detail:
      meters <= cfg.homeRadiusM
        ? `Within home geofence (${Math.round(meters)}m)`
        : `Outside home geofence (${Math.round(meters)}m > ${cfg.homeRadiusM}m)`,
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type ArriveHomeInput = {
  /** iOS Shortcuts “Arrive” automation can set this. */
  event?: string;
  lat?: number;
  lon?: number;
  /** Skip iPhone geofence (UI “Run now” / already-trusted arrive). */
  assumeHome?: boolean;
  /** Ignore 30-minute cooldown. */
  force?: boolean;
};

/**
 * iPhone arrived home → wait until Tesla has been parked ≥10s → open charge port.
 */
export async function runArriveHomeOpenChargePort(input: ArriveHomeInput = {}) {
  const cfg = lifeEnv();
  const state = loadState();
  const now = Date.now();

  if (
    !input.force &&
    state.lastOpenedAt &&
    now - state.lastOpenedAt < COOLDOWN_MS
  ) {
    const mins = Math.ceil((COOLDOWN_MS - (now - state.lastOpenedAt)) / 60_000);
    return {
      ok: false,
      detail: `Cooldown active — charge port already opened recently (retry in ~${mins}m)`,
    };
  }

  const event = (input.event ?? "").toLowerCase();
  const trustedArrive =
    event === "arrive_home" || event === "arrive" || input.assumeHome === true;

  let phoneHome = trustedArrive;
  let homeDetail = trustedArrive
    ? "iPhone arrive-home event"
    : "No arrive event";

  if (
    !phoneHome &&
    typeof input.lat === "number" &&
    typeof input.lon === "number" &&
    Number.isFinite(input.lat) &&
    Number.isFinite(input.lon)
  ) {
    const geo = isAtHome(input.lat, input.lon);
    phoneHome = geo.ok;
    homeDetail = geo.detail;
  }

  if (!phoneHome) {
    return {
      ok: false,
      detail: `iPhone not at home — ${homeDetail}. Set HOME_LAT/HOME_LON or send event=arrive_home from Shortcuts.`,
    };
  }

  state.lastArrivalAt = now;
  state.lastDetail = `Arrival noted (${homeDetail}); waiting for parked ≥10s`;
  saveState(state);

  // Mock mode: treat the car as already parked long enough.
  const parkedRequiredMs = cfg.forceMock ? 0 : PARKED_REQUIRED_MS;
  let parkedSince: number | null = cfg.forceMock ? Date.now() - PARKED_REQUIRED_MS : null;
  const deadline = now + (cfg.forceMock ? 5_000 : MAX_WAIT_MS);
  let lastParkDetail = "Waiting for Tesla park state";

  while (Date.now() < deadline) {
    try {
      const park = await getTeslaParkState();
      if (!park.online) {
        parkedSince = null;
        lastParkDetail = "Tesla not online yet";
      } else if (!park.parked) {
        parkedSince = null;
        lastParkDetail = `Tesla not parked (shift=${park.shiftState ?? "—"}, speed=${park.speed ?? "—"})`;
      } else {
        if (parkedSince == null) parkedSince = Date.now();
        const held = Date.now() - parkedSince;
        lastParkDetail = `Parked for ${Math.round(held / 1000)}s`;
        if (held >= parkedRequiredMs) {
          // Optional: Tesla also near home when we have coords.
          if (
            !cfg.forceMock &&
            park.latitude != null &&
            park.longitude != null &&
            cfg.homeLat &&
            cfg.homeLon
          ) {
            const carHome = isAtHome(park.latitude, park.longitude);
            if (!carHome.ok) {
              return {
                ok: false,
                detail: `Phone home, but Tesla is ${carHome.detail}`,
              };
            }
          }

          const opened = await controlTesla("charge_port_door_open");
          if (!opened.ok) {
            state.lastDetail = opened.detail;
            saveState(state);
            return opened;
          }
          state.lastOpenedAt = Date.now();
          state.lastDetail = `Opened charge port after ${Math.max(10, Math.round(held / 1000))}s parked (${homeDetail})`;
          saveState(state);
          return { ok: true, detail: state.lastDetail };
        }
      }
    } catch (error) {
      lastParkDetail =
        error instanceof Error ? error.message : "Tesla park poll failed";
      parkedSince = null;
    }
    await sleep(cfg.forceMock ? 10 : POLL_MS);
  }

  const detail = `Timed out waiting for 10s parked — ${lastParkDetail}`;
  state.lastDetail = detail;
  saveState(state);
  return { ok: false, detail };
}

export function getArriveHomeChargeStatus() {
  const state = loadState();
  const cfg = lifeEnv();
  return {
    automationId: ARRIVE_HOME_CHARGE_AUTOMATION_ID,
    homeConfigured: Boolean(cfg.homeLat && cfg.homeLon),
    homeLat: cfg.homeLat ?? null,
    homeLon: cfg.homeLon ?? null,
    homeRadiusM: cfg.homeRadiusM,
    webhookSecretConfigured: Boolean(cfg.locationWebhookSecret),
    lastOpenedAt: state.lastOpenedAt ?? null,
    lastArrivalAt: state.lastArrivalAt ?? null,
    lastDetail: state.lastDetail ?? null,
  };
}
