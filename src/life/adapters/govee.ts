import { lifeEnv } from "@/life/config";
import { MOCK_GOVEE } from "@/life/mock-data";
import type { GoveeDevice, GoveeSnapshot } from "@/life/types";

const GOVEE_BASE = "https://openapi.api.govee.com/router/api/v1";

let mockDevices = structuredClone(MOCK_GOVEE.devices);

export async function getGovee(): Promise<GoveeSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.goveeApiKey) {
    return { devices: mockDevices, mode: cfg.goveeApiKey ? "mock" : "unconfigured" };
  }

  try {
    const res = await fetch(`${GOVEE_BASE}/user/devices`, {
      headers: { "Govee-API-Key": cfg.goveeApiKey },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Govee ${res.status}`);
    const json = (await res.json()) as {
      data?: Array<{
        device: string;
        sku: string;
        deviceName?: string;
        type?: string;
      }>;
    };
    const devices: GoveeDevice[] = (json.data ?? []).map((d, i) => ({
      id: d.device,
      name: d.deviceName ?? d.sku,
      model: d.sku,
      room: d.type?.replace("devices.types.", "") ?? "Home",
      power: mockDevices[i]?.power ?? false,
      brightness: mockDevices[i]?.brightness ?? 50,
      colorHex: mockDevices[i]?.colorHex ?? "#FFFFFF",
    }));
    return { devices: devices.length ? devices : mockDevices, mode: "live" };
  } catch {
    return { devices: mockDevices, mode: "mock" };
  }
}

export async function controlGovee(
  deviceId: string,
  action: string,
  value?: string | number | boolean,
): Promise<{ ok: boolean; detail: string }> {
  const cfg = lifeEnv();
  mockDevices = mockDevices.map((d) => {
    if (d.id !== deviceId) return d;
    if (action === "power") return { ...d, power: Boolean(value) };
    if (action === "brightness" && typeof value === "number") {
      return { ...d, brightness: value, power: value > 0 };
    }
    return d;
  });

  if (cfg.forceMock || !cfg.goveeApiKey) {
    return { ok: true, detail: `Mock Govee ${action} on ${deviceId}` };
  }

  const device = mockDevices.find((d) => d.id === deviceId);
  if (!device) return { ok: false, detail: "Device not found" };

  const capability =
    action === "brightness"
      ? {
          type: "devices.capabilities.range",
          instance: "brightness",
          value: Number(value ?? device.brightness),
        }
      : {
          type: "devices.capabilities.on_off",
          instance: "powerSwitch",
          value: value ? 1 : 0,
        };

  try {
    const res = await fetch(`${GOVEE_BASE}/device/control`, {
      method: "POST",
      headers: {
        "Govee-API-Key": cfg.goveeApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        payload: {
          sku: device.model,
          device: device.id,
          capability,
        },
      }),
    });
    if (!res.ok) throw new Error(`Govee control ${res.status}`);
    return { ok: true, detail: `Govee ${action} sent` };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Govee control failed",
    };
  }
}
