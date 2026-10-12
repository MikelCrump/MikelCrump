import { lifeEnv } from "@/life/config";
import { MOCK_AI_CREDITS } from "@/life/mock-data";
import type { AiCreditAccount, AiCreditsSnapshot } from "@/life/types";

function monthBounds() {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  return { start, end };
}

async function fetchClaudeAdminUsage(
  adminKey: string,
  id: string,
  label: string,
): Promise<AiCreditAccount | null> {
  const { start, end } = monthBounds();
  try {
    const res = await fetch("https://api.anthropic.com/v1/organizations/cost_report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": adminKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "admin-api-2024-01-01",
      },
      body: JSON.stringify({
        starting_at: start.toISOString(),
        ending_at: end.toISOString(),
        group_by: ["description"],
        bucket_width: "1d",
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Claude admin ${res.status}`);
    const json = (await res.json()) as {
      data?: Array<{
        results?: Array<{ amount?: string | number }>;
      }>;
    };
    const cents = (json.data ?? []).reduce((sum, bucket) => {
      for (const row of bucket.results ?? []) {
        sum += Number(row.amount ?? 0);
      }
      return sum;
    }, 0);
    // Treat $100 as a soft monthly budget meter when no hard limit is known.
    const budget = 100;
    const usedDollars = cents / 100;
    const percentUsed = Math.min(100, Math.round((usedDollars / budget) * 100));
    return {
      id,
      label,
      provider: "claude",
      plan: "API Admin",
      creditsRemaining: Number(Math.max(0, budget - usedDollars).toFixed(2)),
      creditsTotal: budget,
      percentUsed,
      resetsAt: "1st of month",
      expiresAt: null,
      note: `Live Anthropic cost report · $${usedDollars.toFixed(2)} this month`,
    };
  } catch {
    return null;
  }
}

async function fetchCursorUsage(apiKey: string): Promise<AiCreditAccount | null> {
  try {
    const auth = Buffer.from(`${apiKey}:`).toString("base64");
    const res = await fetch("https://api.cursor.com/organizations/pooled-usage", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Cursor ${res.status}`);
    const json = (await res.json()) as {
      totalUsedCents?: number;
      totalLimitCents?: number;
      usedCents?: number;
      limitCents?: number;
      teams?: Array<{ usedCents?: number; limitCents?: number }>;
    };
    const used =
      json.totalUsedCents ??
      json.usedCents ??
      json.teams?.reduce((s, t) => s + (t.usedCents ?? 0), 0) ??
      0;
    const limit =
      json.totalLimitCents ??
      json.limitCents ??
      json.teams?.reduce((s, t) => s + (t.limitCents ?? 0), 0) ??
      0;
    const percentUsed =
      limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    return {
      id: "cursor-1",
      label: "Cursor",
      provider: "cursor",
      plan: "Org Admin",
      creditsRemaining: limit ? Number(((limit - used) / 100).toFixed(2)) : null,
      creditsTotal: limit ? Number((limit / 100).toFixed(2)) : null,
      percentUsed,
      resetsAt: "Billing cycle",
      expiresAt: null,
      note: "Live Cursor organization pooled usage",
    };
  } catch {
    return null;
  }
}

async function fetchXaiUsage(apiKey: string): Promise<AiCreditAccount | null> {
  // xAI does not publish a stable consumer usage API; probe API key validity
  // and fall back to configured JSON for meters.
  try {
    const res = await fetch("https://api.x.ai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`xAI ${res.status}`);
    return {
      id: "grok-x",
      label: "Grok (xAI)",
      provider: "grok",
      plan: "API key valid",
      creditsRemaining: null,
      creditsTotal: null,
      percentUsed: 0,
      resetsAt: null,
      expiresAt: null,
      note: "Key verified · set LIFE_AI_CREDITS_JSON for spend meters",
    };
  } catch {
    return null;
  }
}

function parseJsonOverrides(raw?: string): AiCreditAccount[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as
      | AiCreditsSnapshot
      | { accounts: AiCreditAccount[] }
      | AiCreditAccount[];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.accounts)) {
      return parsed.accounts;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export async function getAiCredits(): Promise<AiCreditsSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock) {
    return { ...MOCK_AI_CREDITS, mode: "mock" };
  }

  const base = structuredClone(MOCK_AI_CREDITS.accounts);
  const byId = new Map(base.map((a) => [a.id, a]));
  let liveHits = 0;

  const [claude1, claude2, cursor, xai] = await Promise.all([
    cfg.claudeAdminKey1
      ? fetchClaudeAdminUsage(cfg.claudeAdminKey1, "claude-1", "Claude · primary")
      : null,
    cfg.claudeAdminKey2
      ? fetchClaudeAdminUsage(cfg.claudeAdminKey2, "claude-2", "Claude · secondary")
      : null,
    cfg.cursorAdminApiKey ? fetchCursorUsage(cfg.cursorAdminApiKey) : null,
    cfg.xaiApiKey ? fetchXaiUsage(cfg.xaiApiKey) : null,
  ]);

  for (const account of [claude1, claude2, cursor, xai]) {
    if (!account) continue;
    byId.set(account.id, account);
    liveHits += 1;
  }

  for (const override of parseJsonOverrides(cfg.lifeAiCreditsJson)) {
    byId.set(override.id, { ...byId.get(override.id), ...override });
    liveHits += 1;
  }

  const accounts = [...byId.values()];
  const hasAnyKey = Boolean(
    cfg.claudeAdminKey1 ||
      cfg.claudeAdminKey2 ||
      cfg.cursorAdminApiKey ||
      cfg.xaiApiKey ||
      cfg.lifeAiCreditsJson,
  );

  return {
    accounts,
    mode: liveHits > 0 ? "live" : hasAnyKey ? "mock" : "unconfigured",
  };
}
