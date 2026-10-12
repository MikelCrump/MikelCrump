import { fetchRenphoMeasurements } from "@/life/adapters/renpho-client";
import { lifeEnv } from "@/life/config";
import { MOCK_RENPHO } from "@/life/mock-data";
import type { RenphoPoint, RenphoSnapshot } from "@/life/types";

function kgToLbs(kg: number) {
  return Number((kg * 2.2046226218).toFixed(1));
}

function toPoint(m: {
  weight?: number;
  bodyfat?: number;
  muscle?: number;
  timeStamp?: number;
  timestamp?: number;
  createTime?: string;
}): RenphoPoint | null {
  if (m.weight == null || !Number.isFinite(m.weight)) return null;
  const ts =
    m.timeStamp ??
    m.timestamp ??
    (m.createTime ? Date.parse(m.createTime) : Date.now());
  const date = new Date(ts > 1e12 ? ts : ts * 1000).toISOString().slice(0, 10);
  // Muscle from Renpho is often %; convert to lbs estimate when plausible.
  const musclePct = m.muscle;
  const weightLbs = kgToLbs(m.weight);
  const muscleLbs =
    musclePct != null && musclePct > 0 && musclePct <= 100
      ? Number(((weightLbs * musclePct) / 100).toFixed(1))
      : musclePct != null
        ? kgToLbs(musclePct)
        : null;
  return {
    date,
    weightLbs,
    bodyFatPct: m.bodyfat != null ? Number(m.bodyfat.toFixed(1)) : null,
    muscleLbs,
  };
}

export async function getRenpho(): Promise<RenphoSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.renphoEmail || !cfg.renphoPassword) {
    return {
      ...MOCK_RENPHO,
      mode: cfg.renphoEmail ? "mock" : "unconfigured",
    };
  }

  try {
    const raw = await fetchRenphoMeasurements(cfg.renphoEmail, cfg.renphoPassword);
    const points = raw
      .map(toPoint)
      .filter((p): p is RenphoPoint => Boolean(p))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Deduplicate by day (keep last)
    const byDay = new Map<string, RenphoPoint>();
    for (const p of points) byDay.set(p.date, p);
    const history = [...byDay.values()].slice(-30);
    if (!history.length) throw new Error("No Renpho measurements");

    const latest = history[history.length - 1]!;
    const weekAgo = history[Math.max(0, history.length - 8)]!;
    return {
      mode: "live",
      history,
      latest,
      trendLbs7d: Number((latest.weightLbs - weekAgo.weightLbs).toFixed(1)),
    };
  } catch {
    return { ...MOCK_RENPHO, mode: "mock" };
  }
}
