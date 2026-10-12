import { lifeEnv } from "@/life/config";
import { MOCK_FINANCE } from "@/life/mock-data";
import type { FinanceSnapshot } from "@/life/types";

export async function getFinance(): Promise<FinanceSnapshot> {
  const cfg = lifeEnv();
  if (
    cfg.forceMock ||
    !cfg.plaidClientId ||
    !cfg.plaidSecret ||
    !cfg.plaidAccessToken
  ) {
    return {
      ...MOCK_FINANCE,
      mode: cfg.plaidClientId ? "mock" : "unconfigured",
    };
  }

  const host =
    cfg.plaidEnv === "production"
      ? "https://production.plaid.com"
      : cfg.plaidEnv === "development"
        ? "https://development.plaid.com"
        : "https://sandbox.plaid.com";

  try {
    const res = await fetch(`${host}/accounts/balance/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: cfg.plaidClientId,
        secret: cfg.plaidSecret,
        access_token: cfg.plaidAccessToken,
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Plaid ${res.status}`);
    const json = (await res.json()) as {
      accounts: Array<{
        account_id: string;
        name: string;
        official_name?: string;
        type: string;
        balances: { current: number | null };
      }>;
      item?: { institution_id?: string };
    };

    const accounts = json.accounts.map((a) => ({
      id: a.account_id,
      name: a.official_name ?? a.name,
      type: (["checking", "savings", "credit", "investment"].includes(a.type)
        ? a.type
        : "checking") as FinanceSnapshot["accounts"][number]["type"],
      balance: a.balances.current ?? 0,
      institution: json.item?.institution_id ?? "Plaid",
    }));
    const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

    return {
      accounts,
      recent: MOCK_FINANCE.recent,
      netWorth,
      spendThisMonth: MOCK_FINANCE.spendThisMonth,
      mode: "live",
    };
  } catch {
    return { ...MOCK_FINANCE, mode: "mock" };
  }
}
