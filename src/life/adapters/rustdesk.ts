import { lifeEnv } from "@/life/config";
import { MOCK_RUSTDESK } from "@/life/mock-data";
import type { RustDeskSnapshot } from "@/life/types";

export async function getRustDesk(): Promise<RustDeskSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.rustdeskApiUrl) {
    return {
      ...MOCK_RUSTDESK,
      mode: cfg.rustdeskApiUrl ? "mock" : "unconfigured",
    };
  }

  try {
    const res = await fetch(`${cfg.rustdeskApiUrl}/api/peers`, {
      headers: cfg.rustdeskApiToken
        ? { Authorization: `Bearer ${cfg.rustdeskApiToken}` }
        : undefined,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`RustDesk ${res.status}`);
    const json = (await res.json()) as {
      data?: Array<{
        id: string;
        hostname?: string;
        alias?: string;
        online?: boolean;
      }>;
    };
    const hosts = (json.data ?? []).map((h, i) => ({
      id: h.id,
      name: h.alias ?? h.hostname ?? h.id,
      online: Boolean(h.online),
      cpuPct: MOCK_RUSTDESK.hosts[i]?.cpuPct ?? 0,
      memPct: MOCK_RUSTDESK.hosts[i]?.memPct ?? 0,
      diskPct: MOCK_RUSTDESK.hosts[i]?.diskPct ?? 0,
      lastSeen: h.online ? "Just now" : "Unknown",
    }));
    return { hosts: hosts.length ? hosts : MOCK_RUSTDESK.hosts, mode: "live" };
  } catch {
    return { ...MOCK_RUSTDESK, mode: "mock" };
  }
}
