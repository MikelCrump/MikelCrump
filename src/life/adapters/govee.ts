import { lifeEnv } from "@/life/config";
import { MOCK_GOVEE } from "@/life/mock-data";
import type { GoveeDevice, GoveeSnapshot } from "@/life/types";

const GOVEE_BASE = "https://openapi.api.govee.com/router/api/v1";

type GoveeCapability = {
  type: string;
  instance: string;
  state?: { value?: unknown };
  value?: unknown;
};

type GoveeListItem = {
  device: string;
  sku: string;
  deviceName?: string;
  type?: string;
  capabilities?: GoveeCapability[];
};

let lastLiveDevices: GoveeDevice[] = [];
let lastError: string | null = null;

function headers(apiKey: string) {
  return {
    "Govee-API-Key": apiKey,
    "Content-Type": "application/json",
  };
}

function rgbToHex(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `#${value.toString(16).padStart(6, "0")}`.toUpperCase();
  }
  if (value && typeof value === "object") {
    const obj = value as { r?: number; g?: number; b?: number };
    if (
      typeof obj.r === "number" &&
      typeof obj.g === "number" &&
      typeof obj.b === "number"
    ) {
      const n = (obj.r << 16) + (obj.g << 8) + obj.b;
      return `#${n.toString(16).padStart(6, "0")}`.toUpperCase();
    }
  }
  return null;
}

function hexToRgbInt(hex: string) {
  const clean = hex.replace("#", "");
  return Number.parseInt(clean, 16);
}

function capValue(
  capabilities: GoveeCapability[] | undefined,
  typeIncludes: string,
  instance: string,
) {
  const hit = capabilities?.find(
    (c) => c.type.includes(typeIncludes) && c.instance === instance,
  );
  return hit?.state?.value ?? hit?.value;
}

async function fetchDeviceState(
  apiKey: string,
  sku: string,
  device: string,
): Promise<GoveeCapability[]> {
  const res = await fetch(`${GOVEE_BASE}/device/state`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      requestId: crypto.randomUUID(),
      payload: { sku, device },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Govee state ${res.status}`);
  const json = (await res.json()) as {
    code?: number;
    msg?: string;
    payload?: { capabilities?: GoveeCapability[] };
  };
  if (json.code != null && json.code !== 200 && json.code !== 0) {
    throw new Error(json.msg ?? `Govee state code ${json.code}`);
  }
  return json.payload?.capabilities ?? [];
}

async function mapListedDevice(
  apiKey: string,
  item: GoveeListItem,
  fallback?: GoveeDevice,
): Promise<GoveeDevice> {
  let capabilities = item.capabilities ?? [];
  try {
    capabilities = await fetchDeviceState(apiKey, item.sku, item.device);
  } catch {
    /* keep list-level capabilities / fallback */
  }

  const powerRaw = capValue(capabilities, "on_off", "powerSwitch");
  const brightnessRaw = capValue(capabilities, "range", "brightness");
  const colorRaw =
    capValue(capabilities, "color_setting", "colorRgb") ??
    capValue(capabilities, "color", "color");

  const power =
    powerRaw === 1 ||
    powerRaw === true ||
    powerRaw === "on" ||
    powerRaw === "1";

  return {
    id: item.device,
    name: item.deviceName ?? item.sku,
    model: item.sku,
    room: item.type?.replace("devices.types.", "") ?? "Home",
    power: typeof powerRaw === "undefined" ? (fallback?.power ?? false) : power,
    brightness:
      typeof brightnessRaw === "number"
        ? brightnessRaw
        : (fallback?.brightness ?? 50),
    colorHex: rgbToHex(colorRaw) ?? fallback?.colorHex ?? "#FFFFFF",
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i]!, i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return out;
}

export async function getGovee(): Promise<GoveeSnapshot> {
  const cfg = lifeEnv();
  lastError = null;
  if (cfg.forceMock || !cfg.goveeApiKey) {
    return {
      devices: lastLiveDevices.length ? lastLiveDevices : MOCK_GOVEE.devices,
      mode: cfg.forceMock || cfg.goveeApiKey ? "mock" : "unconfigured",
      lastError: cfg.forceMock ? "LIFE_FORCE_MOCK=1" : null,
    };
  }

  try {
    const res = await fetch(`${GOVEE_BASE}/user/devices`, {
      headers: headers(cfg.goveeApiKey),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Govee list ${res.status}`);
    const json = (await res.json()) as {
      code?: number;
      msg?: string;
      data?: GoveeListItem[];
    };
    if (json.code != null && json.code !== 200 && json.code !== 0) {
      throw new Error(json.msg ?? `Govee list code ${json.code}`);
    }
    const listed = json.data ?? [];
    if (!listed.length) {
      lastLiveDevices = [];
      return { devices: [], mode: "live", lastError: "No Govee devices on account" };
    }

    const devices = await mapWithConcurrency(listed, 3, (item, i) =>
      mapListedDevice(cfg.goveeApiKey!, item, MOCK_GOVEE.devices[i]),
    );
    lastLiveDevices = devices;
    return { devices, mode: "live", lastError: null };
  } catch (error) {
    lastError = error instanceof Error ? error.message : "Govee list failed";
    return {
      devices: lastLiveDevices.length ? lastLiveDevices : MOCK_GOVEE.devices,
      mode: "mock",
      lastError,
    };
  }
}

function resolveDevice(deviceId: string) {
  return (
    lastLiveDevices.find((d) => d.id === deviceId) ??
    MOCK_GOVEE.devices.find((d) => d.id === deviceId)
  );
}

export async function controlGovee(
  deviceId: string,
  action: string,
  value?: string | number | boolean,
): Promise<{ ok: boolean; detail: string }> {
  const cfg = lifeEnv();

  // Optimistic local update for snappy UI
  lastLiveDevices = lastLiveDevices.map((d) => {
    if (d.id !== deviceId) return d;
    if (action === "power") return { ...d, power: Boolean(value) };
    if (action === "brightness" && typeof value === "number") {
      return { ...d, brightness: value, power: value > 0 };
    }
    if (action === "color" && typeof value === "string") {
      return { ...d, colorHex: value, power: true };
    }
    return d;
  });

  if (cfg.forceMock || !cfg.goveeApiKey) {
    return { ok: true, detail: `Mock Govee ${action} on ${deviceId}` };
  }

  // Ensure we have sku/device from a fresh list if cache empty
  if (!lastLiveDevices.length) {
    await getGovee();
  }
  const device = resolveDevice(deviceId);
  if (!device) return { ok: false, detail: "Device not found — refresh board first" };

  let capability: Record<string, unknown>;
  if (action === "brightness") {
    capability = {
      type: "devices.capabilities.range",
      instance: "brightness",
      value: Number(value ?? device.brightness),
    };
  } else if (action === "color" && typeof value === "string") {
    capability = {
      type: "devices.capabilities.color_setting",
      instance: "colorRgb",
      value: hexToRgbInt(value),
    };
  } else if (action === "power") {
    capability = {
      type: "devices.capabilities.on_off",
      instance: "powerSwitch",
      value: value ? 1 : 0,
    };
  } else {
    return { ok: false, detail: `Unknown Govee action: ${action}` };
  }

  try {
    const res = await fetch(`${GOVEE_BASE}/device/control`, {
      method: "POST",
      headers: headers(cfg.goveeApiKey),
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        payload: {
          sku: device.model,
          device: device.id,
          capability,
        },
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      code?: number;
      msg?: string;
    };
    if (!res.ok || (body.code != null && body.code !== 200 && body.code !== 0)) {
      throw new Error(body.msg ?? `Govee control ${res.status}`);
    }
    return { ok: true, detail: `Govee ${action} sent to ${device.name}` };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Govee control failed",
    };
  }
}

export function getGoveeDiagnostics() {
  return {
    cachedDevices: lastLiveDevices.length,
    lastError,
    configured: Boolean(lifeEnv().goveeApiKey),
    forceMock: lifeEnv().forceMock,
  };
}
