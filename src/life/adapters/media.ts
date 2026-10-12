import { haCallService, haGetState } from "@/life/adapters/home-assistant";
import { lifeEnv } from "@/life/config";
import { MOCK_MEDIA } from "@/life/mock-data";
import type { MediaSnapshot } from "@/life/types";

let mock = structuredClone(MOCK_MEDIA.devices);

export async function getMedia(): Promise<MediaSnapshot> {
  const cfg = lifeEnv();
  const hasHa = Boolean(cfg.homeAssistantUrl && cfg.homeAssistantToken);
  const hasRoku = Boolean(cfg.rokuHost);

  if (cfg.forceMock || (!hasHa && !hasRoku)) {
    return {
      devices: mock,
      mode: hasHa || hasRoku ? "mock" : "unconfigured",
    };
  }

  const devices = structuredClone(mock);

  if (cfg.appleTvEntityId) {
    try {
      const state = await haGetState(cfg.appleTvEntityId);
      if (state) {
        const attrs = (state.attributes ?? {}) as Record<string, unknown>;
        const idx = devices.findIndex((d) => d.kind === "apple_tv");
        if (idx >= 0) {
          devices[idx] = {
            ...devices[idx]!,
            power: state.state !== "off" && state.state !== "standby",
            app: String(attrs.app_name ?? attrs.source ?? devices[idx]!.app),
            volume: Number(attrs.volume_level ?? 0.28) * 100,
          };
        }
      }
    } catch {
      /* keep mock row */
    }
  }

  if (cfg.rokuHost) {
    try {
      const res = await fetch(`http://${cfg.rokuHost}:8060/query/active-app`, {
        cache: "no-store",
      });
      if (res.ok) {
        const xml = await res.text();
        const app = xml.match(/<app[^>]*>([^<]+)<\/app>/)?.[1] ?? "Home";
        const idx = devices.findIndex((d) => d.kind === "roku");
        if (idx >= 0) {
          devices[idx] = { ...devices[idx]!, power: true, app };
        }
      }
    } catch {
      /* keep mock row */
    }
  }

  return { devices, mode: "live" };
}

export async function controlMedia(
  kind: "apple_tv" | "roku",
  action: string,
  deviceId?: string,
): Promise<{ ok: boolean; detail: string }> {
  const cfg = lifeEnv();
  mock = mock.map((d) => {
    if (deviceId && d.id !== deviceId) return d;
    if (d.kind !== kind) return d;
    if (action === "power") return { ...d, power: !d.power };
    if (action === "home") return { ...d, app: "Home", power: true };
    if (action === "play") return { ...d, power: true };
    return d;
  });

  if (kind === "roku" && cfg.rokuHost && !cfg.forceMock) {
    const key =
      action === "home" ? "Home" : action === "play" ? "Play" : action === "power" ? "Power" : null;
    if (key) {
      try {
        const res = await fetch(`http://${cfg.rokuHost}:8060/keypress/${key}`, {
          method: "POST",
        });
        return { ok: res.ok, detail: res.ok ? `Roku ${key}` : "Roku ECP failed" };
      } catch (error) {
        return {
          ok: false,
          detail: error instanceof Error ? error.message : "Roku failed",
        };
      }
    }
  }

  if (kind === "apple_tv" && cfg.appleTvEntityId && !cfg.forceMock) {
    const service =
      action === "power" ? "toggle" : action === "play" ? "media_play" : "media_stop";
    const ok = await haCallService("media_player", service, cfg.appleTvEntityId);
    return { ok, detail: ok ? `Apple TV ${action}` : "HA media_player failed" };
  }

  return { ok: true, detail: `Mock ${kind} ${action}` };
}
