import { lifeEnv, plaidHost } from "@/life/config";
import { MOCK_FINANCE } from "@/life/mock-data";
import type { FinanceSnapshot, FinanceTxn } from "@/life/types";

function mapAccountType(type: string): FinanceSnapshot["accounts"][number]["type"] {
  if (["checking", "savings", "credit", "investment"].includes(type)) {
    return type as FinanceSnapshot["accounts"][number]["type"];
  }
  if (type === "depository") return "checking";
  return "checking";
}

export async function createPlaidLinkToken(userId = "mikel-crump") {
  const cfg = lifeEnv();
  if (!cfg.plaidClientId || !cfg.plaidSecret) {
    throw new Error("PLAID_CLIENT_ID and PLAID_SECRET required");
  }
  const res = await fetch(`${plaidHost(cfg.plaidEnv)}/link/token/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: cfg.plaidClientId,
      secret: cfg.plaidSecret,
      client_name: "Life Ops",
      language: "en",
      country_codes: ["US"],
      user: { client_user_id: userId },
      products: ["transactions"],
    }),
  });
  if (!res.ok) throw new Error(`Plaid link token ${res.status}`);
  return (await res.json()) as { link_token: string; expiration: string };
}

export async function exchangePlaidPublicToken(publicToken: string) {
  const cfg = lifeEnv();
  if (!cfg.plaidClientId || !cfg.plaidSecret) {
    throw new Error("PLAID_CLIENT_ID and PLAID_SECRET required");
  }
  const res = await fetch(`${plaidHost(cfg.plaidEnv)}/item/public_token/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: cfg.plaidClientId,
      secret: cfg.plaidSecret,
      public_token: publicToken,
    }),
  });
  if (!res.ok) throw new Error(`Plaid exchange ${res.status}`);
  return (await res.json()) as { access_token: string; item_id: string };
}

async function fetchTransactions(
  host: string,
  clientId: string,
  secret: string,
  accessToken: string,
): Promise<{ recent: FinanceTxn[]; spendThisMonth: number }> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const res = await fetch(`${host}/transactions/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      secret,
      access_token: accessToken,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      options: { count: 25, offset: 0 },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Plaid transactions ${res.status}`);
  const json = (await res.json()) as {
    transactions: Array<{
      transaction_id: string;
      name: string;
      amount: number;
      date: string;
      category?: string[] | null;
    }>;
  };

  const month = end.toISOString().slice(0, 7);
  let spendThisMonth = 0;
  const recent: FinanceTxn[] = json.transactions.slice(0, 12).map((t) => {
    // Plaid amounts: positive = money out
    const amount = -Math.abs(t.amount);
    if (t.date.startsWith(month) && t.amount > 0) spendThisMonth += t.amount;
    return {
      id: t.transaction_id,
      merchant: t.name,
      amount,
      when: t.date,
      category: t.category?.[0] ?? "Other",
    };
  });
  return { recent, spendThisMonth: Number(spendThisMonth.toFixed(2)) };
}

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

  const host = plaidHost(cfg.plaidEnv);

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
        subtype?: string | null;
        balances: { current: number | null };
      }>;
      item?: { institution_id?: string };
    };

    const accounts = json.accounts.map((a) => ({
      id: a.account_id,
      name: a.official_name ?? a.name,
      type: mapAccountType(a.subtype ?? a.type),
      balance: a.balances.current ?? 0,
      institution: json.item?.institution_id ?? "Plaid",
    }));
    const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

    let recent = MOCK_FINANCE.recent;
    let spendThisMonth = MOCK_FINANCE.spendThisMonth;
    try {
      const tx = await fetchTransactions(
        host,
        cfg.plaidClientId,
        cfg.plaidSecret,
        cfg.plaidAccessToken,
      );
      recent = tx.recent;
      spendThisMonth = tx.spendThisMonth;
    } catch {
      /* balances still live */
    }

    return {
      accounts,
      recent,
      netWorth,
      spendThisMonth,
      mode: "live",
    };
  } catch {
    return { ...MOCK_FINANCE, mode: "mock" };
  }
}
