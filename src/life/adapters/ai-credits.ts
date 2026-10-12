import { MOCK_AI_CREDITS } from "@/life/mock-data";
import type { AiCreditsSnapshot } from "@/life/types";

/**
 * AI vendor usage APIs are inconsistent / often undocumented.
 * Until stable tokens exist, we surface curated account slots for Mikel
 * and overlay any LIFE_AI_CREDITS_JSON snapshot from the environment.
 */
export async function getAiCredits(): Promise<AiCreditsSnapshot> {
  const raw = process.env.LIFE_AI_CREDITS_JSON?.trim();
  if (!raw) {
    return { ...MOCK_AI_CREDITS, mode: "unconfigured" };
  }

  try {
    const parsed = JSON.parse(raw) as AiCreditsSnapshot;
    if (!Array.isArray(parsed.accounts)) throw new Error("bad shape");
    return { accounts: parsed.accounts, mode: "live" };
  } catch {
    return { ...MOCK_AI_CREDITS, mode: "mock" };
  }
}
