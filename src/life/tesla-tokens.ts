import { cookies } from "next/headers";
import { readJsonFile, writeJsonFile } from "@/life/token-store";

export const TESLA_TOKEN_COOKIE = "life_tesla_tokens";
const TOKEN_FILE = "tesla-tokens.json";

export type TeslaStoredTokens = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  updated_at: string;
};

export function buildTeslaTokenPayload(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  previous?: TeslaStoredTokens | null;
}): TeslaStoredTokens {
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? tokens.previous?.refresh_token,
    expires_at: tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : tokens.previous?.expires_at,
    updated_at: new Date().toISOString(),
  };
}

export function serializeTeslaTokenCookie(payload: TeslaStoredTokens) {
  return encodeURIComponent(JSON.stringify(payload));
}

export function parseTeslaTokenCookie(raw: string | undefined): TeslaStoredTokens | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as TeslaStoredTokens;
  } catch {
    try {
      return JSON.parse(raw) as TeslaStoredTokens;
    } catch {
      return null;
    }
  }
}

export function teslaCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 180) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL),
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function loadTeslaTokens(): Promise<TeslaStoredTokens | null> {
  try {
    const jar = await cookies();
    const fromCookie = parseTeslaTokenCookie(jar.get(TESLA_TOKEN_COOKIE)?.value);
    if (fromCookie?.access_token || fromCookie?.refresh_token) return fromCookie;
  } catch {
    /* cookies() unavailable outside request context */
  }
  return readJsonFile<TeslaStoredTokens>(TOKEN_FILE);
}

export async function saveTeslaTokens(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}): Promise<TeslaStoredTokens> {
  const previous = await loadTeslaTokens();
  const payload = buildTeslaTokenPayload({ ...tokens, previous });

  try {
    writeJsonFile(TOKEN_FILE, payload);
  } catch {
    /* /tmp or cwd may still fail; cookie is the durable path on Vercel */
  }

  try {
    const jar = await cookies();
    jar.set(TESLA_TOKEN_COOKIE, serializeTeslaTokenCookie(payload), teslaCookieOptions());
  } catch {
    /* set only allowed in Route Handlers / Server Actions */
  }

  return payload;
}
