import { lifeEnv } from "@/life/config";
import { MOCK_RUSTDESK } from "@/life/mock-data";
import type { RustDeskHost, RustDeskSnapshot } from "@/life/types";

function normalizeHosts(payload: unknown): RustDeskHost[] {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? ((payload as { data: unknown[] }).data ?? [])
      : Array.isArray((payload as { peers?: unknown[] })?.peers)
        ? ((payload as { peers: unknown[] }).peers ?? [])
        : [];

  return rows.map((row, i) => {
    const h = row as Record<string, unknown>;
    const id = String(h.id ?? h.uid ?? h.uuid ?? `host-${i}`);
    const name = String(h.alias ?? h.hostname ?? h.name ?? id);
    const online = Boolean(
      h.online ?? h.is_online ?? (h.status === "online" || h.status === 1),
    );
    return {
      id,
      name,
      online,
      cpuPct: Number(h.cpu ?? h.cpuPct ?? MOCK_RUSTDESK.hosts[i]?.cpuPct ?? 0),
      memPct: Number(h.mem ?? h.memory ?? h.memPct ?? MOCK_RUSTDESK.hosts[i]?.memPct ?? 0),
      diskPct: Number(h.disk ?? h.diskPct ?? MOCK_RUSTDESK.hosts[i]?.diskPct ?? 0),
      lastSeen: online
        ? "Just now"
        : String(h.last_online ?? h.lastSeen ?? "Unknown"),
    };
  });
}

export async function getRustDesk(): Promise<RustDeskSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.rustdeskApiUrl) {
    return {
      ...MOCK_RUSTDESK,
      mode: cfg.rustdeskApiUrl ? "mock" : "unconfigured",
    };
  }

  const headers: HeadersInit = cfg.rustdeskApiToken
    ? {
        Authorization: `Bearer ${cfg.rustdeskApiToken}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };

  const paths = ["/api/peers", "/api/ab", "/api/users", "/peers", "/ab"];

  for (const path of paths) {
    try {
      const res = await fetch(`${cfg.rustdeskApiUrl}${path}`, {
        headers,
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = (await res.json()) as unknown;
      const hosts = normalizeHosts(json);
      if (hosts.length) return { hosts, mode: "live" };
    } catch {
      /* try next path */
    }
  }

  return { ...MOCK_RUSTDESK, mode: "mock" };
}
